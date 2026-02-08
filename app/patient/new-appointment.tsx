import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PointPickerModal } from '@/components/PointPickerModal';
import { usePatients } from '@/context/PatientContext';
import { useTheme } from '@/context/ThemeContext';

export default function NewAppointmentScreen() {
    const { patientId } = useLocalSearchParams<{ patientId: string }>();
    const { theme, colors, fontSizeMultiplier } = useTheme();
    const { patients, addAppointment } = usePatients();
    const insets = useSafeAreaInsets();

    const patient = patients.find(p => p.id === patientId);

    const [complaint, setComplaint] = useState('');
    const [selectedPoints, setSelectedPoints] = useState<string[]>([]);
    const [notes, setNotes] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!patient) {
        return <View><Text>Cliente não encontrado</Text></View>;
    }

    const handleAddPoint = (point: string) => {
        if (!selectedPoints.includes(point)) {
            setSelectedPoints([...selectedPoints, point]);
        }
    };

    const removePoint = (pointToRemove: string) => {
        setSelectedPoints(selectedPoints.filter(p => p !== pointToRemove));
    };

    const handleSave = async () => {
        if (!complaint.trim()) {
            Alert.alert('Erro', 'Por favor, descreva a queixa principal.');
            return;
        }

        setIsSubmitting(true);
        try {
            await addAppointment(patient.id, complaint, selectedPoints, notes);
            router.back();
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível salvar o atendimento.');
        } finally {
            setIsSubmitting(false);
        }
    };

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
                    <Text style={[styles.title, { color: colors.text }]}>Novo Atendimento</Text>
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                >
                    <ScrollView contentContainerStyle={styles.scrollContent}>

                        <View style={styles.patientInfo}>
                            <Text style={{ color: colors.textSecondary }}>Cliente</Text>
                            <Text style={[styles.patientName, { color: colors.text }]}>{patient.name}</Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>Queixa Principal *</Text>
                            <TextInput
                                style={[styles.input, styles.textArea, {
                                    backgroundColor: colors.inputBackground,
                                    color: colors.text,
                                    borderColor: colors.border
                                }]}
                                placeholder="O que o cliente está sentindo?"
                                placeholderTextColor={colors.textSecondary}
                                value={complaint}
                                onChangeText={setComplaint}
                                multiline
                                textAlignVertical="top"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <View style={styles.pointsHeader}>
                                <Text style={[styles.label, { color: colors.text, marginBottom: 0 }]}>Pontos Utilizados</Text>
                                <TouchableOpacity onPress={() => setModalVisible(true)}>
                                    <Text style={{ color: colors.primary, fontWeight: 'bold' }}>+ Adicionar</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.chipsContainer}>
                                {selectedPoints.map(point => (
                                    <View key={point} style={[styles.chip, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
                                        <Text style={[styles.chipText, { color: colors.text }]}>{point}</Text>
                                        <TouchableOpacity onPress={() => removePoint(point)} style={styles.removeChip}>
                                            <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
                                        </TouchableOpacity>
                                    </View>
                                ))}

                                {selectedPoints.length === 0 && (
                                    <Text style={{ color: colors.textSecondary, fontStyle: 'italic' }}>Nenhum ponto selecionado</Text>
                                )}
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>Observações Adicionais</Text>
                            <TextInput
                                style={[styles.input, styles.textArea, {
                                    backgroundColor: colors.inputBackground,
                                    color: colors.text,
                                    borderColor: colors.border
                                }]}
                                placeholder="Detalhes do tratamento, reações..."
                                placeholderTextColor={colors.textSecondary}
                                value={notes}
                                onChangeText={setNotes}
                                multiline
                                textAlignVertical="top"
                            />
                        </View>

                    </ScrollView>

                    <View style={[styles.footer, { paddingBottom: insets.bottom + 20, backgroundColor: colors.background, borderTopColor: colors.border }]}>
                        <TouchableOpacity
                            style={[styles.saveButton, { backgroundColor: colors.primary, opacity: isSubmitting ? 0.7 : 1 }]}
                            onPress={handleSave}
                            disabled={isSubmitting}
                        >
                            <Text style={styles.saveButtonText}>
                                {isSubmitting ? 'Salvando...' : 'Salvar Atendimento'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>

                <PointPickerModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    onSelectPoint={handleAddPoint}
                />

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
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    backButton: {
        marginRight: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    patientInfo: {
        marginBottom: 24,
    },
    patientName: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
    },
    textArea: {
        height: 100,
    },
    pointsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        minHeight: 40,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 12,
        paddingRight: 8,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
    },
    chipText: {
        fontWeight: '600',
        marginRight: 6,
    },
    removeChip: {
        padding: 2,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
    },
    saveButton: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
