import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

// Types
export interface Patient {
    id: string;
    name: string;
    phone?: string;
    notes?: string;
    createdAt: string;
}

export interface Appointment {
    id: string;
    patientId: string;
    date: string;
    complaint?: string; // Queixa Principal
    points: string[]; // List of points used, e.g., ["IG4", "E36"]
    notes?: string;
    painLevel?: number; // 0-10, feedback from next session
    feedbackDate?: string; // When the feedback was recorded
}

interface PatientContextType {
    patients: Patient[];
    appointments: Appointment[];
    isLoading: boolean;
    addPatient: (name: string, phone?: string, notes?: string) => Promise<string>;
    updatePatient: (id: string, updates: Partial<Patient>) => Promise<void>;
    deletePatient: (id: string) => Promise<void>;
    addAppointment: (patientId: string, complaint: string, points: string[], notes?: string) => Promise<string>;
    updateAppointmentFeedback: (appointmentId: string, painLevel: number) => Promise<void>;
    getPatientAppointments: (patientId: string) => Appointment[];
    getAppointment: (appointmentId: string) => Appointment | undefined;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const usePatients = () => {
    const context = useContext(PatientContext);
    if (!context) {
        throw new Error('usePatients must be used within a PatientProvider');
    }
    return context;
};

const PATIENTS_STORAGE_KEY = '@acupatologia_patients';
const APPOINTMENTS_STORAGE_KEY = '@acupatologia_appointments';

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load data on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                const patientsJson = await AsyncStorage.getItem(PATIENTS_STORAGE_KEY);
                const appointmentsJson = await AsyncStorage.getItem(APPOINTMENTS_STORAGE_KEY);

                if (patientsJson) setPatients(JSON.parse(patientsJson));
                if (appointmentsJson) setAppointments(JSON.parse(appointmentsJson));
            } catch (e) {
                console.error('Failed to load patient data', e);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    // Save data whenever it changes
    const savePatients = async (newPatients: Patient[]) => {
        try {
            await AsyncStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(newPatients));
            setPatients(newPatients);
        } catch (e) {
            console.error('Failed to save patients', e);
        }
    };

    const saveAppointments = async (newAppointments: Appointment[]) => {
        try {
            await AsyncStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(newAppointments));
            setAppointments(newAppointments);
        } catch (e) {
            console.error('Failed to save appointments', e);
        }
    };

    const addPatient = useCallback(async (name: string, phone?: string, notes?: string) => {
        const newPatient: Patient = {
            id: uuidv4(),
            name,
            phone,
            notes,
            createdAt: new Date().toISOString(),
        };
        const newPatients = [...patients, newPatient];
        await savePatients(newPatients);
        return newPatient.id;
    }, [patients]);

    const updatePatient = useCallback(async (id: string, updates: Partial<Patient>) => {
        const newPatients = patients.map(p => p.id === id ? { ...p, ...updates } : p);
        await savePatients(newPatients);
    }, [patients]);

    const deletePatient = useCallback(async (id: string) => {
        const newPatients = patients.filter(p => p.id !== id);
        // Also delete associated appointments
        const newAppointments = appointments.filter(a => a.patientId !== id);

        await savePatients(newPatients);
        await saveAppointments(newAppointments);
    }, [patients, appointments]);

    const addAppointment = useCallback(async (patientId: string, complaint: string, points: string[], notes?: string) => {
        const newAppointment: Appointment = {
            id: uuidv4(),
            patientId,
            date: new Date().toISOString(),
            complaint,
            points,
            notes,
        };
        const newAppointments = [...appointments, newAppointment];
        await saveAppointments(newAppointments);
        return newAppointment.id;
    }, [appointments]);

    const updateAppointmentFeedback = useCallback(async (appointmentId: string, painLevel: number) => {
        const newAppointments = appointments.map(a =>
            a.id === appointmentId
                ? { ...a, painLevel, feedbackDate: new Date().toISOString() }
                : a
        );
        await saveAppointments(newAppointments);
    }, [appointments]);

    const getPatientAppointments = useCallback((patientId: string) => {
        return appointments
            .filter(a => a.patientId === patientId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [appointments]);

    const getAppointment = useCallback((appointmentId: string) => {
        return appointments.find(a => a.id === appointmentId);
    }, [appointments]);

    return (
        <PatientContext.Provider value={{
            patients,
            appointments,
            isLoading,
            addPatient,
            updatePatient,
            deletePatient,
            addAppointment,
            updateAppointmentFeedback,
            getPatientAppointments,
            getAppointment
        }}>
            {children}
        </PatientContext.Provider>
    );
};
