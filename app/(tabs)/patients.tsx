import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Patient, usePatients } from '@/context/PatientContext';
import { useTheme } from '@/context/ThemeContext';

export default function PatientsScreen() {
    const { theme, colors, fontSizeMultiplier } = useTheme();
    const { patients } = usePatients();
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderItem = ({ item }: { item: Patient }) => (
        <TouchableOpacity
            style={[styles.itemContainer, {
                backgroundColor: colors.surface,
                borderColor: colors.border
            }]}
            onPress={() => router.push(`/patient/${item.id}`)}
        >
            <View style={styles.itemContent}>
                <Text style={[styles.itemTitle, { color: colors.text, fontSize: 18 * fontSizeMultiplier }]}>{item.name}</Text>
                {item.phone && (
                    <Text style={[styles.itemSubtitle, { color: colors.textSecondary }]}>
                        <Ionicons name="call-outline" size={14} /> {item.phone}
                    </Text>
                )}
            </View>
            <Ionicons name="chevron-forward" size={20 * fontSizeMultiplier} color={colors.icon} />
        </TouchableOpacity>
    );

    const handleAddPatient = () => {
        // For now, we can use a simple prompt or navigate to a create screen.
        // Since we don't have a "Create Patient" screen in the plan, I'll navigate to a simplified creation flow or reuse the detail screen logic?
        // Plan said: "Select the patient (or create a new one)".
        // Let's assume we navigate to a new screen or use a modal.
        // For simplicity, let's navigate to a create screen `patient/create` or just use a modal here?
        // The plan said "New Appointment" screen.
        // Let's create a dedicated `patient/create` screen or just a modal.
        // Given the constraints, I will create a `patient/create.tsx` (not in original plan explicitly but needed).
        // Or I can just make `patient/[id]` handle "new" if id is "new"?
        // Let's stick to `patient/create.tsx` for clarity.
        router.push('/patient/create');
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={theme === 'dark' ? "light-content" : "dark-content"} />
            <LinearGradient
                colors={colors.backgroundGradient}
                style={{ flex: 1 }}
            >
                <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
                    <Text style={[styles.title, { color: colors.text }]}>Ficha de Atendimento</Text>
                </View>

                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={colors.icon} style={styles.searchIcon} />
                    <TextInput
                        style={[styles.searchInput, {
                            backgroundColor: colors.inputBackground,
                            color: colors.text,
                            borderColor: colors.border,
                            borderWidth: 1
                        }]}
                        placeholder="Buscar cliente..."
                        placeholderTextColor={colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <FlatList
                    data={filteredPatients}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={[styles.listContent, { paddingBottom: 80 + insets.bottom }]}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="people-outline" size={48} color={colors.icon} />
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                {searchQuery ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
                            </Text>
                        </View>
                    }
                />

                <TouchableOpacity
                    style={[styles.fab, { backgroundColor: colors.primary, bottom: 20 + insets.bottom }]}
                    onPress={handleAddPatient}
                >
                    <Ionicons name="add" size={30} color="#fff" />
                </TouchableOpacity>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    searchContainer: {
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    searchIcon: {
        position: 'absolute',
        left: 36,
        top: 14,
        zIndex: 1,
    },
    searchInput: {
        borderRadius: 25,
        paddingVertical: 12,
        paddingLeft: 44,
        paddingRight: 40,
        fontSize: 16,
    },
    listContent: {
        padding: 16,
        paddingBottom: 80,
    },
    itemContainer: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
    },
    itemContent: {
        flex: 1,
        marginRight: 12,
    },
    itemTitle: {
        fontWeight: 'bold',
        marginBottom: 4,
    },
    itemSubtitle: {
        fontSize: 14,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
    },
    fab: {
        position: 'absolute',
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
});
