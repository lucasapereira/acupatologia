import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
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

import { usePatients } from '@/context/PatientContext';
import { useTheme } from '@/context/ThemeContext';

export default function CreatePatientScreen() {
    const { theme, colors } = useTheme();
    const { addPatient } = usePatients();
    const insets = useSafeAreaInsets();

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreate = async () => {
        if (!name.trim()) {
            Alert.alert('Erro', 'O nome do cliente é obrigatório.');
            return;
        }

        setIsSubmitting(true);
        try {
            const id = await addPatient(name, phone, notes);
            router.replace(`/patient/${id}`);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível salvar o cliente.');
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
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={[styles.title, { color: colors.text }]}>Novo Cliente</Text>
                    </View>

                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={styles.formContainer}
                    >
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>Nome Completo *</Text>
                            <TextInput
                                style={[styles.input, {
                                    backgroundColor: colors.inputBackground,
                                    color: colors.text,
                                    borderColor: colors.border
                                }]}
                                placeholder="Ex: Maria da Silva"
                                placeholderTextColor={colors.textSecondary}
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>Telefone</Text>
                            <TextInput
                                style={[styles.input, {
                                    backgroundColor: colors.inputBackground,
                                    color: colors.text,
                                    borderColor: colors.border
                                }]}
                                placeholder="Ex: (11) 99999-9999"
                                placeholderTextColor={colors.textSecondary}
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>Anotações Iniciais</Text>
                            <TextInput
                                style={[styles.input, styles.textArea, {
                                    backgroundColor: colors.inputBackground,
                                    color: colors.text,
                                    borderColor: colors.border
                                }]}
                                placeholder="Histórico breve, alergias..."
                                placeholderTextColor={colors.textSecondary}
                                value={notes}
                                onChangeText={setNotes}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.saveButton, { backgroundColor: colors.primary, opacity: isSubmitting ? 0.7 : 1 }]}
                            onPress={handleCreate}
                            disabled={isSubmitting}
                        >
                            <Text style={styles.saveButtonText}>
                                {isSubmitting ? 'Salvando...' : 'Cadastrar Cliente'}
                            </Text>
                        </TouchableOpacity>
                    </KeyboardAvoidingView>
                </ScrollView>
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
    },
    backButton: {
        marginRight: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    formContainer: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        marginBottom: 8,
        fontSize: 16,
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    textArea: {
        height: 100,
    },
    saveButton: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
