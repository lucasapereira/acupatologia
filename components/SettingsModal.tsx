import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SettingsModalProps {
    visible: boolean;
    onClose: () => void;
}

export function SettingsModal({ visible, onClose }: SettingsModalProps) {
    const { theme, toggleTheme, fontSizeMultiplier, setFontSizeMultiplier, colors } = useTheme();

    // Helper to get font size label
    const getFontSizeLabel = (size: number) => {
        if (size <= 1.0) return 'Padrão';
        if (size <= 1.2) return 'Médio';
        return 'Grande';
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                <View style={[styles.content, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.text }]}>Ajustes de Visualização</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Tema</Text>
                        <View style={styles.row}>
                            <TouchableOpacity
                                style={[
                                    styles.optionButton,
                                    theme === 'light' && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
                                    theme !== 'light' && { borderColor: colors.border }
                                ]}
                                onPress={() => theme !== 'light' && toggleTheme()}
                            >
                                <Ionicons name="sunny" size={20} color={theme === 'light' ? '#fff' : colors.textSecondary} />
                                <Text style={[styles.optionText, { color: theme === 'light' ? '#fff' : colors.textSecondary }]}>Claro</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.optionButton,
                                    theme === 'dark' && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
                                    theme !== 'dark' && { borderColor: colors.border }
                                ]}
                                onPress={() => theme !== 'dark' && toggleTheme()}
                            >
                                <Ionicons name="moon" size={20} color={theme === 'dark' ? '#fff' : colors.textSecondary} />
                                <Text style={[styles.optionText, { color: theme === 'dark' ? '#fff' : colors.textSecondary }]}>Escuro</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Tamanho da Fonte</Text>
                        <View style={styles.sliderContainer}>
                            <TouchableOpacity
                                style={[styles.fontBtn, { borderColor: colors.border }]}
                                onPress={() => setFontSizeMultiplier(Math.max(1.0, fontSizeMultiplier - 0.2))}
                                disabled={fontSizeMultiplier <= 1.0}
                            >
                                <Ionicons name="remove" size={24} color={fontSizeMultiplier <= 1.0 ? colors.border : colors.text} />
                            </TouchableOpacity>

                            <Text style={[styles.fontValue, { color: colors.text }]}>{getFontSizeLabel(fontSizeMultiplier)}</Text>

                            <TouchableOpacity
                                style={[styles.fontBtn, { borderColor: colors.border }]}
                                onPress={() => setFontSizeMultiplier(Math.min(1.4, fontSizeMultiplier + 0.2))}
                                disabled={fontSizeMultiplier >= 1.4}
                            >
                                <Ionicons name="add" size={24} color={fontSizeMultiplier >= 1.4 ? colors.border : colors.text} />
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.previewText, { color: colors.text, fontSize: 16 * fontSizeMultiplier, marginTop: 12 }]}>
                            Exemplo de texto para leitura.
                        </Text>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    content: {
        width: '100%',
        maxWidth: 340,
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 4,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    optionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        gap: 8,
    },
    optionText: {
        fontWeight: '600',
    },
    sliderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(0,0,0,0.05)',
        padding: 8,
        borderRadius: 12,
    },
    fontBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    fontValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    previewText: {
        textAlign: 'center',
    },
});
