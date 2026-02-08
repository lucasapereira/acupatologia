import { useTheme } from '@/context/ThemeContext';
import { acupunctureData } from '@/data/acupatologia';
import { extractPoints } from '@/data/pointMapping';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface PointPickerModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectPoint: (point: string) => void;
}

export const PointPickerModal: React.FC<PointPickerModalProps> = ({ visible, onClose, onSelectPoint }) => {
    const { colors, fontSizeMultiplier } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');

    // Get all unique points from the data
    const allPoints = useMemo(() => {
        const pointsSet = new Set<string>();
        acupunctureData.forEach(item => {
            const extracted = extractPoints(item.points);
            extracted.forEach(p => pointsSet.add(p));
        });
        return Array.from(pointsSet).sort();
    }, []);

    const filteredPoints = useMemo(() => {
        if (!searchQuery.trim()) return allPoints;
        const q = searchQuery.toLowerCase().trim();
        return allPoints.filter(p => p.toLowerCase().includes(q));
    }, [allPoints, searchQuery]);

    // Also allow searching for pathologies to find points
    const filteredPathologies = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const q = searchQuery.toLowerCase().trim();
        return acupunctureData.filter(item =>
            item.name.toLowerCase().includes(q)
        );
    }, [searchQuery]);

    const renderItem = ({ item }: { item: string }) => (
        <TouchableOpacity
            style={[styles.itemContainer, { backgroundColor: colors.surfaceHighlight }]}
            onPress={() => {
                onSelectPoint(item);
                onClose();
                setSearchQuery('');
            }}
        >
            <Text style={[styles.itemText, { color: colors.text, fontSize: 16 * fontSizeMultiplier }]}>{item}</Text>
            <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.modalOverlay}
            >
                <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.title, { color: colors.text }]}>Selecionar Ponto</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.searchContainer, { backgroundColor: colors.inputBackground }]}>
                        <Ionicons name="search" size={20} color={colors.textSecondary} />
                        <TextInput
                            style={[styles.searchInput, { color: colors.text }]}
                            placeholder="Buscar ponto (ex: IG4) ou patologia..."
                            placeholderTextColor={colors.textSecondary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                        />
                    </View>

                    <FlatList
                        data={filteredPoints}
                        renderItem={renderItem}
                        keyExtractor={item => item}
                        contentContainerStyle={styles.listContent}
                        keyboardShouldPersistTaps="handled"
                        ListHeaderComponent={
                            filteredPathologies.length > 0 ? (
                                <View style={{ marginBottom: 10 }}>
                                    <Text style={{ color: colors.textSecondary, marginBottom: 5 }}>Sugestões por Patologia:</Text>
                                    {filteredPathologies.map(pat => (
                                        <TouchableOpacity
                                            key={pat.id}
                                            style={[styles.pathologyItem, { borderColor: colors.border }]}
                                            onPress={() => {
                                                // Extract points from pathology and add them all? 
                                                // Or just show them? For simplicity, let's just create chips for them here
                                                // User creates interaction complexity.
                                                // Better approach: User is searching for a POINT.
                                                // If they search "Dor de cabeça", show points associated with it? 
                                                // For now, let's stick to simple point list filtering.
                                            }}
                                        >
                                            <Text style={{ color: colors.text, fontWeight: 'bold' }}>{pat.name}</Text>
                                            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{pat.points}</Text>
                                        </TouchableOpacity>
                                    ))}
                                    <Text style={{ color: colors.textSecondary, marginVertical: 10 }}>Pontos Individuais:</Text>
                                </View>
                            ) : null
                        }
                    />
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        height: '80%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        borderRadius: 10,
        marginBottom: 20,
        height: 50,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        height: '100%',
    },
    listContent: {
        paddingBottom: 40,
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    itemText: {
        fontWeight: '600',
    },
    pathologyItem: {
        padding: 10,
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 8
    }
});
