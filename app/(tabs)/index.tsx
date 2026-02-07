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
  View,
} from 'react-native';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Anatomy images
const ANATOMY_IMAGES: Record<AnatomyRegionId, any> = {
  'body_front': require('@/assets/images/anatomy/body_front.png'),
  'body_back': require('@/assets/images/anatomy/body_back.png'),
  'head_face': require('@/assets/images/anatomy/head_face.png'),
  'hand_arm': require('@/assets/images/anatomy/hand_arm.png'),
};

const CATEGORIES: CategoryType[] = ['Patologia', 'Síndrome', 'Ponto'];

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('Patologia');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<AcupunctureException | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // State for anatomy image modal
  const [anatomyModalVisible, setAnatomyModalVisible] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<AnatomyRegionId | null>(null);
  const [selectedPointName, setSelectedPointName] = useState<string>('');
  const [zoomScale, setZoomScale] = useState(1);

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
    setZoomScale(1);
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
      style={styles.itemContainer}
      onPress={() => handleEntryPress(item)}
    >
      <View style={styles.itemContent}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Text style={styles.itemTitle}>{item.name}</Text>
        </View>
        <Text style={styles.itemDescription} numberOfLines={2}>
          {item.points}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#2d1b4e', '#1b1b2f', '#1a1a2e']}
        style={styles.header}
      >
        <Text style={styles.title}>Acupatologia</Text>
        <Text style={styles.subtitle}>Guia de Acupuntura</Text>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar patologia, ponto..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Category Tabs */}
      <View style={styles.categoryContainer}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryTab,
              selectedCategory === cat && styles.categoryTabSelected
            ]}
            onPress={() => {
              setSelectedCategory(cat);
              setSelectedLetter(null); // Reset letter filter when changing category
            }}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === cat && styles.categoryTextSelected
              ]}
            >
              {cat}s
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {!searchQuery && (
        <View style={styles.alphabetContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.alphabetScroll}>
            <TouchableOpacity
              style={[
                styles.letterButton,
                { width: 'auto', paddingHorizontal: 12 },
                !selectedLetter && styles.letterButtonSelected,
              ]}
              onPress={() => setSelectedLetter(null)}
            >
              <Text
                style={[
                  styles.letterText,
                  selectedLetter === null && styles.letterTextSelected,
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
                    selectedLetter === letter && styles.letterButtonSelected,
                    !hasEntries && styles.letterButtonDisabled,
                  ]}
                  onPress={() => hasEntries && setSelectedLetter(letter)}
                  disabled={!hasEntries}
                >
                  <Text
                    style={[
                      styles.letterText,
                      selectedLetter === letter && styles.letterTextSelected,
                      !hasEntries && styles.letterTextDisabled,
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
            <Ionicons name="documents-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Nenhum item encontrado</Text>
            {(searchQuery || selectedLetter) && (
              <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                <Text style={styles.clearButtonText}>Limpar filtros</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={['#2d1b4e', '#1a1a2e']}
              style={styles.modalGradient}
            >
              <View style={styles.modalHeader}>
                <View style={styles.modalLetterBadge}>
                  <Text style={styles.modalLetterText}>
                    {selectedEntry?.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.modalScroll}
                showsVerticalScrollIndicator={false}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <Text style={[styles.modalTitle, { marginBottom: 0, flex: 1 }]}>{selectedEntry?.name}</Text>
                  <View style={styles.modalCategoryBadge}>
                    <Text style={{ color: '#4c669f', fontWeight: 'bold', fontSize: 12 }}>
                      {selectedEntry?.category}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* Quick Access to Images */}
                {selectedEntry && getQuickAccessPoints(selectedEntry.points).size > 0 && (
                  <View style={styles.quickAccessSection}>
                    <Text style={styles.quickAccessTitle}>
                      <Ionicons name="images-outline" size={14} color="#10b981" /> Ver na Imagem Anatômica
                    </Text>
                    <View style={styles.quickAccessGrid}>
                      {Array.from(getQuickAccessPoints(selectedEntry.points)).map(([region, points]) => (
                        <TouchableOpacity
                          key={region}
                          style={styles.quickAccessCard}
                          onPress={() => openAnatomyImage(points[0], region)}
                        >
                          <Image
                            source={ANATOMY_IMAGES[region]}
                            style={styles.quickAccessImage}
                            contentFit="cover"
                          />
                          <View style={styles.quickAccessInfo}>
                            <Text style={styles.quickAccessRegion}>{REGION_NAMES[region]}</Text>
                            <Text style={styles.quickAccessPoints} numberOfLines={1}>
                              {points.slice(0, 4).join(', ')}{points.length > 4 ? '...' : ''}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                <View style={styles.divider} />

                <Text style={styles.pointsLabel}>
                  <Ionicons name="locate" size={16} color="#8B5CF6" /> Pontos de Acupuntura
                </Text>
                <Text style={styles.pointsHint}>
                  Toque nos pontos destacados para ver na imagem
                </Text>
                {selectedEntry && renderPointsWithLinks(selectedEntry.points)}
              </ScrollView>
            </LinearGradient>
          </View>
        </View>
      </Modal>

      {/* Anatomy Image Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={anatomyModalVisible}
        onRequestClose={() => setAnatomyModalVisible(false)}
      >
        <View style={styles.anatomyModalOverlay}>
          <View style={styles.anatomyModalContent}>
            <LinearGradient
              colors={['#2d1b4e', '#1a1a2e']}
              style={styles.anatomyModalGradient}
            >
              <View style={styles.anatomyModalHeader}>
                <View>
                  <Text style={styles.anatomyModalTitle}>
                    {selectedRegion ? REGION_NAMES[selectedRegion] : ''}
                  </Text>
                  <Text style={styles.anatomyModalSubtitle}>
                    Ponto: {selectedPointName}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setAnatomyModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <View style={styles.imageContainer}>
                <ScrollView
                  maximumZoomScale={3}
                  minimumZoomScale={1}
                  centerContent={true}
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                >
                  <ScrollView
                    horizontal={true}
                    maximumZoomScale={3}
                    minimumZoomScale={1}
                    centerContent={true}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                  >
                    {selectedRegion && (
                      <Image
                        source={ANATOMY_IMAGES[selectedRegion]}
                        style={[
                          styles.anatomyImage,
                          {
                            width: SCREEN_WIDTH * zoomScale,
                            height: SCREEN_WIDTH * zoomScale
                          }
                        ]}
                        contentFit="contain"
                      />
                    )}
                  </ScrollView>
                </ScrollView>

                {/* Zoom Controls Overlay */}
                <View style={styles.zoomControls}>
                  <TouchableOpacity
                    style={styles.zoomButton}
                    onPress={() => setZoomScale(Math.min(zoomScale + 0.5, 3))}
                  >
                    <Ionicons name="add" size={24} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.zoomButton}
                    onPress={() => setZoomScale(Math.max(zoomScale - 0.5, 1))}
                  >
                    <Ionicons name="remove" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.anatomyModalFooter}>
                <Ionicons name="search" size={16} color="#8B5CF6" />
                <Text style={styles.anatomyModalHint}>
                  Use os botões para zoom
                </Text>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
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
    backgroundColor: '#1a1a2e',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
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
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemContent: {
    flex: 1,
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
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
  },
  anatomyImage: {
    // Width/Height are dynamic
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
