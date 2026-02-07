import { ZoomableImage } from '@/components/ZoomableImage';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type AnatomyRegion = {
    id: string;
    title: string;
    description: string;
    image: any;
    points: string[];
};

const ANATOMY_REGIONS: AnatomyRegion[] = [
    {
        id: 'body_front',
        title: 'Corpo (Frente)',
        description: 'Vista frontal do corpo com os meridianos principais: Estômago (E), Baço-Pâncreas (BP), Rim (R), Fígado (F), Pulmão (P), Intestino Grosso (IG), Vaso da Concepção (VC).',
        image: require('@/assets/images/anatomy/body_front.png'),
        points: ['E36', 'BP6', 'VC12', 'VC4', 'VC6', 'R3', 'F3', 'P7'],
    },
    {
        id: 'body_back',
        title: 'Corpo (Costas)',
        description: 'Vista posterior do corpo com os meridianos: Bexiga (B), Intestino Delgado (ID), Triplo Aquecedor (TA), Vesícula Biliar (VB), Vaso Governador (VG).',
        image: require('@/assets/images/anatomy/body_back.png'),
        points: ['B23', 'B20', 'B18', 'B13', 'VG14', 'VG4', 'VB20', 'VB34'],
    },
    {
        id: 'head_face',
        title: 'Cabeça e Face',
        description: 'Pontos de acupuntura na face, crânio e orelha. Inclui Yintang (terceiro olho), pontos ao redor dos olhos, nariz, boca e auriculoterapia.',
        image: require('@/assets/images/anatomy/head_face.png'),
        points: ['Yintang', 'VG20', 'VB20', 'E4', 'IG20', 'TA17', 'VB2', 'ID19'],
    },
    {
        id: 'hand_arm',
        title: 'Braço e Mão',
        description: 'Meridianos do membro superior: Intestino Grosso (IG), Pulmão (P), Coração (C), Intestino Delgado (ID), Triplo Aquecedor (TA), Pericárdio (CS).',
        image: require('@/assets/images/anatomy/hand_arm.png'),
        points: ['IG4', 'IG11', 'P7', 'P5', 'C7', 'CS6', 'TA5', 'ID3'],
    },
];

export default function ReferenceScreen() {
    const { theme, colors, fontSizeMultiplier } = useTheme();
    const [selectedRegion, setSelectedRegion] = useState<AnatomyRegion | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const openRegion = (region: AnatomyRegion) => {
        setSelectedRegion(region);
        setModalVisible(true);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <LinearGradient
                colors={colors.backgroundGradient}
                style={styles.gradient}
            >
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text, fontSize: 28 * fontSizeMultiplier }]}>Referência Anatômica</Text>
                    <Text style={[styles.subtitle, { color: colors.primary, fontSize: 14 * fontSizeMultiplier }]}>
                        Localize os pontos no corpo
                    </Text>
                </View>

                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {ANATOMY_REGIONS.map((region) => (
                        <TouchableOpacity
                            key={region.id}
                            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
                            onPress={() => openRegion(region)}
                            activeOpacity={0.7}
                        >
                            <Image
                                source={region.image}
                                style={[styles.cardImage, { backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0,0,0,0.05)' }]}
                                contentFit="cover"
                            />
                            <View style={styles.cardContent}>
                                <Text style={[styles.cardTitle, { color: colors.text, fontSize: 17 * fontSizeMultiplier }]}>{region.title}</Text>
                                <Text style={[styles.cardPoints, { color: colors.textSecondary, fontSize: 13 * fontSizeMultiplier }]} numberOfLines={1}>
                                    {region.points.join(' • ')}
                                </Text>
                            </View>
                            <Ionicons name="expand-outline" size={20 * fontSizeMultiplier} color={colors.primary} />
                        </TouchableOpacity>
                    ))}

                    <View style={[styles.infoBox, { backgroundColor: colors.primaryLight + '1a', borderColor: colors.primaryLight + '4d' }]}>
                        <Ionicons name="information-circle" size={20 * fontSizeMultiplier} color={colors.primary} />
                        <Text style={[styles.infoText, { color: colors.textSecondary, fontSize: 13 * fontSizeMultiplier, lineHeight: 18 * fontSizeMultiplier }]}>
                            Toque em uma região para ver a imagem ampliada com os pontos de acupuntura.
                        </Text>
                    </View>
                </ScrollView>

                {/* Image Modal */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <GestureHandlerRootView style={{ flex: 1 }}>
                                <LinearGradient
                                    colors={theme === 'dark' ? ['#2d1b4e', '#1a1a2e'] : ['#FFFFFF', '#F6F8FA']}
                                    style={styles.modalGradient}
                                >
                                    <View style={styles.modalHeader}>
                                        <Text style={[styles.modalTitle, { color: colors.text, fontSize: 22 * fontSizeMultiplier }]}>{selectedRegion?.title}</Text>
                                        <TouchableOpacity
                                            style={[styles.closeButton, { backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0,0,0,0.05)' }]}
                                            onPress={() => setModalVisible(false)}
                                        >
                                            <Ionicons name="close" size={24} color={colors.text} />
                                        </TouchableOpacity>
                                    </View>

                                    <ScrollView
                                        style={{ flex: 1 }}
                                        showsVerticalScrollIndicator={false}
                                        contentContainerStyle={{ paddingBottom: 40 }}
                                    >
                                        <View style={[styles.imageContainer, { backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)' }]}>
                                            {selectedRegion && (
                                                <ZoomableImage
                                                    source={selectedRegion.image}
                                                    width={SCREEN_WIDTH}
                                                    height={SCREEN_WIDTH}
                                                />
                                            )}
                                        </View>

                                        <View style={styles.modalFooter}>
                                            <View style={styles.zoomHintContainer}>
                                                <Ionicons name="hand-left" size={14 * fontSizeMultiplier} color={colors.primary} />
                                                <Text style={[styles.zoomHintText, { color: colors.textSecondary, fontSize: 12 * fontSizeMultiplier }]}>Pinça para zoom • Arraste para mover (V2)</Text>
                                            </View>
                                            <Text style={[styles.modalDescription, { color: colors.textSecondary, fontSize: 14 * fontSizeMultiplier, lineHeight: 20 * fontSizeMultiplier }]}>
                                                {selectedRegion?.description}
                                            </Text>
                                            <View style={styles.pointsContainer}>
                                                <Text style={[styles.pointsTitle, { color: colors.primary, fontSize: 12 * fontSizeMultiplier }]}>Pontos principais:</Text>
                                                <View style={styles.pointsRow}>
                                                    {selectedRegion?.points.map((point) => (
                                                        <View key={point} style={[styles.pointBadge, { backgroundColor: colors.primaryLight + '33', borderColor: colors.primaryLight + '66' }]}>
                                                            <Text style={[styles.pointText, { color: colors.primary, fontSize: 12 * fontSizeMultiplier }]}>{point}</Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            </View>
                                        </View>
                                    </ScrollView>
                                </LinearGradient>
                            </GestureHandlerRootView>
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
    gradient: {
        flex: 1,
        paddingTop: 60,
    },
    header: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 14,
        color: '#8B5CF6',
        marginTop: 4,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.2)',
    },
    cardImage: {
        width: 70,
        height: 70,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    cardContent: {
        flex: 1,
        marginLeft: 14,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
    },
    cardPoints: {
        fontSize: 13,
        color: '#888',
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderRadius: 12,
        padding: 16,
        marginTop: 8,
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.3)',
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#aaa',
        marginLeft: 12,
        lineHeight: 18,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
    },
    modalContent: {
        flex: 1,
        margin: 20,
        borderRadius: 24,
        overflow: 'hidden',
    },
    modalGradient: {
        flex: 1,
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalFooter: {
        marginTop: 16,
    },
    modalDescription: {
        fontSize: 14,
        color: '#bbb',
        lineHeight: 20,
        marginBottom: 12,
    },
    imageContainer: {
        height: SCREEN_WIDTH, // Square container
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 16,
        overflow: 'hidden',
    },
    // Unused styles removed
    pointsContainer: {
        marginTop: 8,
    },
    pointsTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#8B5CF6',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    pointsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    pointBadge: {
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.4)',
    },
    pointText: {
        fontSize: 12,
        color: '#8B5CF6',
        fontWeight: '600',
    },
    zoomHintContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 6,
    },
    zoomHintText: {
        fontSize: 12,
        color: '#888',
        fontStyle: 'italic',
    },
});
