import { SettingsModal } from '@/components/SettingsModal';
import { ZoomableImage } from '@/components/ZoomableImage';
import { useTheme } from '@/context/ThemeContext';
import {
  acupunctureData,
  AcupunctureException,
  CategoryType,
} from '@/data/acupatologia';
import {
  AnatomyRegionId,
  extractPoints,
  getPointRegion,
  REGION_NAMES
} from '@/data/pointMapping';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useMemo, useState } from 'react';
import {
  Dimensions,
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
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Anatomy images
const ANATOMY_IMAGES: Record<AnatomyRegionId, any> = {
  'body_front': require('@/assets/images/anatomy/body_front.png'),
  'body_back': require('@/assets/images/anatomy/body_back.png'),
  'head_face': require('@/assets/images/anatomy/head_face.png'),
  'hand_arm': require('@/assets/images/anatomy/hand_arm.png'),
};

const CATEGORIES: CategoryType[] = ['Patologia', 'Síndrome', 'Ponto'];


export default function HomeScreen() {
  const { theme, colors, fontSizeMultiplier } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('Patologia');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<AcupunctureException | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);

  // State for anatomy image modal
  const [anatomyModalVisible, setAnatomyModalVisible] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<AnatomyRegionId | null>(null);
  const [selectedPointName, setSelectedPointName] = useState<string>('');

  const filteredData = useMemo(() => {
    let result = acupunctureData || [];

    // First filter by category
    result = result.filter(item => item.category === selectedCategory);

    // Filter by Letter if no search query
    if (selectedLetter && !searchQuery.trim()) {
      // Check if name starts with letter (case insensitive)
      result = result.filter((item) =>
        item.name.trim().toUpperCase().startsWith(selectedLetter)
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.points.toLowerCase().includes(query)
      );
    }

    return result;
  }, [searchQuery, selectedCategory, selectedLetter]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedLetter(null);
  };

  const openAnatomyImage = useCallback((point: string, region: AnatomyRegionId) => {
    setSelectedPointName(point);
    setSelectedRegion(region);
    setAnatomyModalVisible(true);
  }, []);

  // Render points text with clickable links
  const renderPointsWithLinks = useCallback((text: string) => {
    const extractedPoints = extractPoints(text);
    const pointsWithRegion = extractedPoints
      .map(p => ({ point: p, region: getPointRegion(p) }))
      .filter(p => p.region !== null);

    if (pointsWithRegion.length === 0) {
      return <Text style={styles.modalPoints}>{text}</Text>;
    }

    // Create a regex to match all points that have images
    const pointPatterns = pointsWithRegion.map(p => p.point).join('|');
    // Escape special regex characters if any (points usually alphanumeric so safe-ish, but good practice)
    // For now assuming points are alphanumeric simple strings like "IG4", "E36"
    const regex = new RegExp(`(${pointPatterns})`, 'gi');

    const parts = text.split(regex);

    return (
      <Text style={styles.modalPoints}>
        {parts.map((part, index) => {
          const matchingPoint = pointsWithRegion.find(
            p => p.point.toUpperCase() === part.toUpperCase()
          );

          if (matchingPoint && matchingPoint.region) {
            return (
              <Text
                key={index}
                style={styles.linkablePoint}
                onPress={() => openAnatomyImage(matchingPoint.point, matchingPoint.region!)}
              >
                {part}
                <Ionicons name="image-outline" size={12} color="#8B5CF6" />
              </Text>
            );
          }
          return <Text key={index}>{part}</Text>;
        })}
      </Text>
    );
  }, [openAnatomyImage]);

  // Get unique points with images for quick access
  const getQuickAccessPoints = useCallback((text: string) => {
    const extractedPoints = extractPoints(text);
    const pointsWithRegion = extractedPoints
      .map(p => ({ point: p, region: getPointRegion(p) }))
      .filter(p => p.region !== null);

    // Group by region and keep unique
    const byRegion = new Map<AnatomyRegionId, string[]>();
    pointsWithRegion.forEach(({ point, region }) => {
      if (region) {
        if (!byRegion.has(region)) {
          byRegion.set(region, []);
        }
        if (!byRegion.get(region)!.includes(point)) {
          byRegion.get(region)!.push(point);
        }
      }
    });

    return byRegion;
  }, []);

  const handleEntryPress = (entry: AcupunctureException) => {
    setSelectedEntry(entry);
    setModalVisible(true);
  };

  const renderItem = ({ item }: { item: AcupunctureException }) => (
    <TouchableOpacity
      style={[styles.itemContainer, {
        backgroundColor: colors.surface,
        borderColor: colors.border
      }]}
      onPress={() => handleEntryPress(item)}
    >
      <View style={styles.itemContent}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Text style={[styles.itemTitle, { color: colors.text, fontSize: 18 * fontSizeMultiplier }]}>{item.name}</Text>
        </View>
        <Text style={[styles.itemDescription, { color: colors.textSecondary, fontSize: 14 * fontSizeMultiplier }]} numberOfLines={2}>
          {item.points}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20 * fontSizeMultiplier} color={colors.icon} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? "light-content" : "dark-content"} />
      <LinearGradient
        colors={colors.backgroundGradient}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 20 }}>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>Acupatologia</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Guia de Acupuntura</Text>
            </View>
            <TouchableOpacity onPress={() => setSettingsVisible(true)} style={{ padding: 8 }}>
              <Ionicons name="settings-outline" size={24} color={colors.text} />
            </TouchableOpacity>
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
              placeholder="Buscar patologia, ponto..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={colors.icon} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category Tabs */}
        <View style={[styles.categoryContainer, { backgroundColor: colors.surface + '80', borderBottomColor: colors.border }]}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryTab,
                { backgroundColor: colors.surfaceHighlight },
                selectedCategory === cat && { backgroundColor: colors.primary }
              ]}
              onPress={() => {
                setSelectedCategory(cat);
                setSelectedLetter(null); // Reset letter filter when changing category
              }}
            >
              <Text
                style={[
                  styles.categoryText,
                  { color: colors.textSecondary },
                  selectedCategory === cat && { color: '#fff' }
                ]}
              >
                {cat}s
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {!searchQuery && (
          <View style={[styles.alphabetContainer, { backgroundColor: colors.surface + '80', borderBottomColor: colors.border }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.alphabetScroll}>
              <TouchableOpacity
                style={[
                  styles.letterButton,
                  { width: 'auto', paddingHorizontal: 12 },
                  { backgroundColor: colors.surfaceHighlight },
                  !selectedLetter && { backgroundColor: colors.primary },
                ]}
                onPress={() => setSelectedLetter(null)}
              >
                <Text
                  style={[
                    styles.letterText,
                    { color: colors.textSecondary },
                    selectedLetter === null && { color: '#fff' },
                  ]}
                >
                  Todos
                </Text>
              </TouchableOpacity>
              {ALPHABET.map((letter) => {
                const hasEntries = acupunctureData.some(
                  (item) => item.category === selectedCategory && item.name.startsWith(letter)
                );
                return (
                  <TouchableOpacity
                    key={letter}
                    style={[
                      styles.letterButton,
                      { backgroundColor: colors.surfaceHighlight },
                      selectedLetter === letter && { backgroundColor: colors.primary },
                      !hasEntries && styles.letterButtonDisabled,
                    ]}
                    onPress={() => hasEntries && setSelectedLetter(letter)}
                    disabled={!hasEntries}
                  >
                    <Text
                      style={[
                        styles.letterText,
                        { color: colors.textSecondary },
                        selectedLetter === letter && { color: '#fff' },
                        !hasEntries && { color: colors.border },
                      ]}
                    >
                      {letter}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        <FlatList
          data={filteredData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          initialNumToRender={20}
          maxToRenderPerBatch={20}
          windowSize={10}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="documents-outline" size={48} color={colors.icon} />
              <Text style={styles.emptyText}>Nenhum item encontrado</Text>
              {(searchQuery || selectedLetter) && (
                <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                  <Text style={styles.clearButtonText}>Limpar filtros</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      </LinearGradient>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={theme === 'dark' ? ['#2d1b4e', '#1a1a2e'] : ['#FFFFFF', '#F6F8FA']}
              style={styles.modalGradient}
            >
              <View style={styles.modalHeader}>
                <View style={[styles.modalLetterBadge, { borderColor: colors.primary, backgroundColor: colors.primaryLight + '33' }]}>
                  <Text style={[styles.modalLetterText, { color: colors.primary }]}>
                    {selectedEntry?.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.closeButton, { backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0,0,0,0.05)' }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.modalScroll}
                showsVerticalScrollIndicator={false}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <Text style={[styles.modalTitle, { color: colors.text, fontSize: 28 * fontSizeMultiplier, marginBottom: 0, flex: 1 }]}>{selectedEntry?.name}</Text>
                  <View style={[styles.modalCategoryBadge, { backgroundColor: colors.primaryLight + '33' }]}>
                    <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 12 * fontSizeMultiplier }}>
                      {selectedEntry?.category}
                    </Text>
                  </View>
                </View>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                {/* Quick Access to Images */}
                {selectedEntry && getQuickAccessPoints(selectedEntry.points).size > 0 && (
                  <View style={styles.quickAccessSection}>
                    <Text style={[styles.quickAccessTitle, { color: colors.text }]}>
                      <Ionicons name="images-outline" size={14} color={colors.primary} /> Ver na Imagem Anatômica
                    </Text>
                    <View style={styles.quickAccessGrid}>
                      {Array.from(getQuickAccessPoints(selectedEntry.points)).map(([region, points]) => (
                        <TouchableOpacity
                          key={region}
                          style={[styles.quickAccessCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                          onPress={() => openAnatomyImage(points[0], region)}
                        >
                          <Image
                            source={ANATOMY_IMAGES[region]}
                            style={styles.quickAccessImage}
                            contentFit="cover"
                          />
                          <View style={styles.quickAccessInfo}>
                            <Text style={[styles.quickAccessRegion, { color: colors.text }]}>{REGION_NAMES[region]}</Text>
                            <Text style={[styles.quickAccessPoints, { color: colors.textSecondary }]} numberOfLines={1}>
                              {points.slice(0, 4).join(', ')}{points.length > 4 ? '...' : ''}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                <Text style={[styles.pointsLabel, { color: colors.text, fontSize: 18 * fontSizeMultiplier }]}>
                  <Ionicons name="locate" size={18 * fontSizeMultiplier} color={colors.primary} /> Pontos de Acupuntura
                </Text>
                <Text style={[styles.pointsHint, { color: colors.textSecondary, fontSize: 14 * fontSizeMultiplier }]}>
                  Toque nos pontos destacados para ver na imagem
                </Text>
                {selectedEntry && (
                  <Text style={[styles.modalPoints, { color: colors.text, fontSize: 18 * fontSizeMultiplier, lineHeight: 32 * fontSizeMultiplier }]}>
                    {renderPointsWithLinks(selectedEntry.points)}
                  </Text>
                )}
              </ScrollView>
            </LinearGradient>
          </View>
        </View>
      </Modal>

      {/* Anatomy Image Modal with Pinch-to-Zoom */}
      <Modal
        animationType="fade"
        transparent={false}
        visible={anatomyModalVisible}
        onRequestClose={() => setAnatomyModalVisible(false)}
      >
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
          {/* Header */}
          <LinearGradient
            colors={theme === 'dark' ? ['#2d1b4e', 'transparent'] : ['#FFFFFF', 'rgba(255,255,255,0)']}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              paddingTop: 60,
              paddingHorizontal: 20,
              paddingBottom: 20,
              zIndex: 10,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <View>
              <Text style={{ fontSize: 24 * fontSizeMultiplier, fontWeight: 'bold', color: colors.text }}>
                {selectedRegion ? REGION_NAMES[selectedRegion] : ''}
              </Text>
              <Text style={{ fontSize: 16 * fontSizeMultiplier, color: colors.primaryLight, marginTop: 4 }}>
                Ponto: {selectedPointName}
              </Text>
            </View>
            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => setAnatomyModalVisible(false)}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </LinearGradient>

          {/* Zoomable Image Component */}
          {selectedRegion && (
            <ZoomableImage
              source={ANATOMY_IMAGES[selectedRegion]}
              width={SCREEN_WIDTH}
              height={SCREEN_HEIGHT}
            />
          )}

          {/* Footer */}
          <View style={{
            position: 'absolute',
            bottom: 40,
            left: 0,
            right: 0,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
            zIndex: 10,
          }}>
            <Ionicons name="hand-left" size={16} color={colors.primary} />
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
              Pinça para zoom • Arraste para mover
            </Text>
          </View>
        </GestureHandlerRootView>
      </Modal>

      <SettingsModal visible={settingsVisible} onClose={() => setSettingsVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 20,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 20,
    marginBottom: 20,
  },
  searchContainer: {
    paddingHorizontal: 20,
  },
  searchIcon: {
    position: 'absolute',
    left: 36,
    top: 14,
    zIndex: 1,
  },
  searchInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 25,
    paddingVertical: 12,
    paddingLeft: 44,
    paddingRight: 40,
    fontSize: 16,
    color: '#333',
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  categoryTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryTabSelected: {
    backgroundColor: '#8B5CF6',
  },
  categoryText: {
    fontSize: 14,
    color: '#ccc',
    fontWeight: '600',
  },
  categoryTextSelected: {
    color: '#fff',
  },
  alphabetContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  alphabetScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  letterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterButtonSelected: {
    backgroundColor: '#8B5CF6',
  },
  letterButtonDisabled: {
    opacity: 0.3,
  },
  letterText: {
    fontSize: 14,
    color: '#ccc',
    fontWeight: '600',
  },
  letterTextSelected: {
    color: '#fff',
  },
  letterTextDisabled: {
    color: '#999',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  itemContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  itemContent: {
    flex: 1,
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 4,
  },
  itemSnippet: {
    fontSize: 12,
    // color: colors.primary handled in render
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    // color: colors.textSecondary,
    marginBottom: 20,
  },
  clearButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: '600',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '92%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  modalGradient: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 24,
  },
  modalLetterBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.5)',
  },
  modalLetterText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: {
    flex: 1,
    paddingHorizontal: 24,
  },
  modalCategoryBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8B5CF6',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
    lineHeight: 36,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 24,
  },
  pointsLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsHint: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  modalPoints: {
    fontSize: 18,
    color: '#e2e8f0',
    lineHeight: 32,
    fontWeight: '400',
  },
  linkablePoint: {
    color: '#a78bfa',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  quickAccessSection: {
    marginBottom: 26,
  },
  quickAccessTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAccessCard: {
    width: (SCREEN_WIDTH - 48 - 12) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickAccessImage: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  quickAccessInfo: {
    padding: 10,
  },
  quickAccessRegion: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  quickAccessPoints: {
    fontSize: 11,
    color: '#9ca3af',
  },

  // Anatomy Modal Styles
  anatomyModalOverlay: {
    flex: 1,
    backgroundColor: '#000',
  },
  anatomyModalContent: {
    flex: 1,
  },
  anatomyModalGradient: {
    flex: 1,
  },
  anatomyModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 60,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  anatomyModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  anatomyModalSubtitle: {
    fontSize: 16,
    color: '#a78bfa',
    fontWeight: '600',
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  zoomableImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  anatomyImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  zoomControls: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 24,
    padding: 4,
    gap: 8,
  },
  zoomButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  anatomyModalFooter: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  anatomyModalHint: {
    color: '#9ca3af',
    fontSize: 14,
  },
});
