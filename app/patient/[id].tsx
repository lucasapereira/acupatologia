import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EvolutionChart } from '@/components/EvolutionChart';
import { Appointment, usePatients } from '@/context/PatientContext';
import { useTheme } from '@/context/ThemeContext';

export default function PatientDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { theme, colors, fontSizeMultiplier } = useTheme();
    const { patients, getPatientAppointments, updateAppointmentFeedback } = usePatients();
    const insets = useSafeAreaInsets();

    const patient = patients.find(p => p.id === id);
    const appointments = getPatientAppointments(id!);

    // Feedback Modal State
    const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [painLevel, setPainLevel] = useState('');

    // Auto-prompt for feedback on latest appointment
    useEffect(() => {
        if (appointments.length > 0) {
            const latest = appointments[0];
            // Check if feedback is missing AND appointment was created more than 1 hour ago
            const oneHour = 60 * 60 * 1000;
            const isOldEnough = new Date().getTime() - new Date(latest.date).getTime() > oneHour;

            if (latest.painLevel === undefined && isOldEnough) {
                openFeedbackModal(latest);
            }
        }
    }, []); // Run only on mount

    if (!patient) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
                <Stack.Screen options={{ headerShown: false }} />
                <Text style={{ color: colors.text }}>Cliente não encontrado.</Text>
            </View>
        );
    }

    const handleFeedbackSubmit = async () => {
        if (!selectedAppointment) return;
        const level = parseInt(painLevel);
        if (isNaN(level) || level < 0 || level > 10) {
            Alert.alert('Erro', 'Por favor insira um valor entre 0 e 10.');
            return;
        }

        await updateAppointmentFeedback(selectedAppointment.id, level);
        setFeedbackModalVisible(false);
        setPainLevel('');
        setSelectedAppointment(null);
    };

    const openFeedbackModal = (apt: Appointment) => {
        setSelectedAppointment(apt);
        setPainLevel('');
        setFeedbackModalVisible(true);
    };

    const renderAppointmentItem = ({ item }: { item: Appointment }) => (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
                <Text style={[styles.cardDate, { color: colors.textSecondary }]}>
                    {new Date(item.date).toLocaleDateString()}
                </Text>
                {item.painLevel !== undefined ? (
                    <View style={[styles.painBadge, { backgroundColor: item.painLevel <= 3 ? '#4ade80' : item.painLevel <= 7 ? '#facc15' : '#f87171' }]}>
                        <Text style={styles.painText}>Dor: {item.painLevel}</Text>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={[styles.feedbackButton, { borderColor: colors.primary }]}
                        onPress={() => openFeedbackModal(item)}
                    >
                        <Text style={{ color: colors.primary, fontSize: 12 }}>Avaliar Dor</Text>
                    </TouchableOpacity>
                )}
            </View>

            <Text style={[styles.cardComplaint, { color: colors.text }]}>{item.complaint}</Text>

            {item.points.length > 0 && (
                <View style={styles.pointsContainer}>
                    {item.points.map((point, index) => (
                        <View key={index} style={[styles.pointChip, { backgroundColor: colors.surfaceHighlight }]}>
                            <Text style={[styles.pointText, { color: colors.textSecondary }]}>{point}</Text>
                        </View>
                    ))}
                </View>
            )}

            {item.notes && (
                <Text style={[styles.cardNotes, { color: colors.textSecondary }]}>{item.notes}</Text>
            )}
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle={theme === 'dark' ? "light-content" : "dark-content"} />
            <LinearGradient
                colors={colors.backgroundGradient}
                style={{ flex: 1 }}
            >
                <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <View>
                        <Text style={[styles.title, { color: colors.text }]}>{patient.name}</Text>
                        {patient.phone && (
                            <Text style={{ color: colors.textSecondary }}>{patient.phone}</Text>
                        )}
                    </View>
                </View>

                <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]}>
                    {patient.notes && (
                        <View style={[styles.notesContainer, { backgroundColor: colors.surface + '80' }]}>
                            <Text style={{ color: colors.textSecondary, fontStyle: 'italic' }}>{patient.notes}</Text>
                        </View>
                    )}

                    <EvolutionChart appointments={appointments} />

                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Histórico de Atendimentos</Text>

                    <FlatList
                        data={appointments}
                        renderItem={renderAppointmentItem}
                        keyExtractor={item => item.id}
                        scrollEnabled={false} // Nested inside ScrollView
                        ListEmptyComponent={
                            <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 20 }}>
                                Nenhum atendimento registrado.
                            </Text>
                        }
                    />
                </ScrollView>

                <TouchableOpacity
                    style={[styles.fab, { backgroundColor: colors.primary, bottom: 20 + insets.bottom }]}
                    onPress={() => router.push({ pathname: '/patient/new-appointment', params: { patientId: patient.id } })}
                >
                    <Ionicons name="medical" size={24} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Novo Atendimento</Text>
                </TouchableOpacity>

                {/* Feedback Modal */}
                <Modal
                    visible={feedbackModalVisible}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setFeedbackModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Evolução da Dor</Text>
                            <Text style={{ color: colors.textSecondary, marginBottom: 20 }}>
                                Como o cliente descreve a dor de 0 a 10 após este atendimento?
                            </Text>

                            <TextInput
                                style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]}
                                placeholder="0 - 10"
                                placeholderTextColor={colors.textSecondary}
                                keyboardType="numeric"
                                maxLength={2}
                                value={painLevel}
                                onChangeText={setPainLevel}
                                autoFocus
                            />

                            <View style={styles.modalButtons}>
                                <TouchableOpacity onPress={() => setFeedbackModalVisible(false)} style={{ padding: 10 }}>
                                    <Text style={{ color: colors.textSecondary }}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleFeedbackSubmit}
                                    style={[styles.saveButton, { backgroundColor: colors.primary }]}
                                >
                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Salvar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: 'rgba(0,0,0,0.1)'
    },
    backButton: {
        marginRight: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    notesContainer: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    card: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardDate: {
        fontSize: 14,
        fontWeight: '600',
    },
    cardComplaint: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    cardNotes: {
        fontSize: 14,
        fontStyle: 'italic',
        marginTop: 8,
    },
    pointsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    pointChip: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    pointText: {
        fontSize: 12,
        fontWeight: '600',
    },
    painBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    painText: {
        fontSize: 12,
        color: '#000',
        fontWeight: 'bold',
    },
    feedbackButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
    },
    fab: {
        position: 'absolute',
        right: 20,
        left: 20,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        padding: 20,
        borderRadius: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 16,
    },
    saveButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
});
