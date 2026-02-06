import { acupatologiaData, AcupatologiaEntry } from '@/data/acupatologia';
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

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<AcupatologiaEntry | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // State for anatomy image modal
  const [anatomyModalVisible, setAnatomyModalVisible] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<AnatomyRegionId | null>(null);
  const [selectedPointName, setSelectedPointName] = useState<string>('');
  const [zoomScale, setZoomScale] = useState(1);

  const filteredData = useMemo(() => {
    let result = acupatologiaData;

    if (selectedLetter) {
      result = result.filter((item) => item.letter === selectedLetter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.disease.toLowerCase().includes(query) ||
          item.points.toLowerCase().includes(query)
      );
    }

    return result;
  }, [searchQuery, selectedLetter]);

  const openDetail = (entry: AcupatologiaEntry) => {
    setSelectedEntry(entry);
    setModalVisible(true);
  };

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

  const renderItem = ({ item }: { item: AcupatologiaEntry }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => openDetail(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.letterBadge}>
          <Text style={styles.letterBadgeText}>{item.letter}</Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.disease}
        </Text>
      </View>
      <Text style={styles.cardPoints} numberOfLines={2}>
        {item.points}
      </Text>
      <View style={styles.cardFooter}>
        <Text style={styles.tapHint}>Toque para ver detalhes</Text>
        <Ionicons name="chevron-forward" size={16} color="#8B5CF6" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f0f23']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Acupatologia</Text>
          <Text style={styles.subtitle}>
            {acupatologiaData.length} pontos de acupuntura
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#8B5CF6" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar doença ou ponto..."
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {(searchQuery || selectedLetter) && (
              <TouchableOpacity onPress={clearFilters}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Alphabet Filter */}
        <View style={styles.alphabetContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.alphabetScroll}
          >
            <TouchableOpacity
              style={[
                styles.letterButton,
                !selectedLetter && styles.letterButtonActive,
              ]}
              onPress={() => setSelectedLetter(null)}
            >
              <Text
                style={[
                  styles.letterText,
                  !selectedLetter && styles.letterTextActive,
                ]}
              >
                Todos
              </Text>
            </TouchableOpacity>
            {ALPHABET.map((letter) => {
              const hasEntries = acupatologiaData.some(
                (item) => item.letter === letter
              );
              return (
                <TouchableOpacity
                  key={letter}
                  style={[
                    styles.letterButton,
                    selectedLetter === letter && styles.letterButtonActive,
                    !hasEntries && styles.letterButtonDisabled,
                  ]}
                  onPress={() => hasEntries && setSelectedLetter(letter)}
                  disabled={!hasEntries}
                >
                  <Text
                    style={[
                      styles.letterText,
                      selectedLetter === letter && styles.letterTextActive,
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

        {/* Results Count */}
        <View style={styles.resultsInfo}>
          <Text style={styles.resultsText}>
            {filteredData.length} resultado{filteredData.length !== 1 ? 's' : ''}
            {selectedLetter && ` para "${selectedLetter}"`}
            {searchQuery && ` contendo "${searchQuery}"`}
          </Text>
        </View>

        {/* Results List */}
        <FlatList
          data={filteredData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color="#444" />
              <Text style={styles.emptyText}>Nenhum resultado encontrado</Text>
              <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                <Text style={styles.clearButtonText}>Limpar filtros</Text>
              </TouchableOpacity>
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
                      {selectedEntry?.letter}
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
                  <Text style={styles.modalTitle}>{selectedEntry?.disease}</Text>

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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#8B5CF6',
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#fff',
  },
  alphabetContainer: {
    marginBottom: 12,
  },
  alphabetScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  letterButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  letterButtonActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  letterButtonDisabled: {
    opacity: 0.3,
  },
  letterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
  },
  letterTextActive: {
    color: '#fff',
  },
  letterTextDisabled: {
    color: '#444',
  },
  resultsInfo: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  resultsText: {
    fontSize: 13,
    color: '#666',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  letterBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  letterBadgeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    lineHeight: 22,
  },
  cardPoints: {
    fontSize: 14,
    color: '#aaa',
    lineHeight: 20,
    marginLeft: 44,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  tapHint: {
    fontSize: 12,
    color: '#8B5CF6',
    marginRight: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  clearButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#8B5CF6',
    borderRadius: 25,
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '90%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  modalGradient: {
    flex: 1, // Ensure gradient fills the modalContent container
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    flexShrink: 0, // Ensure header doesn't shrink
  },
  modalLetterBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScroll: {
    flex: 1, // Use flex to take remaining space allowing scroll
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    lineHeight: 32,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    marginVertical: 16,
  },
  quickAccessSection: {
    marginBottom: 8,
  },
  quickAccessTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10b981',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickAccessGrid: {
    gap: 10,
  },
  quickAccessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  quickAccessImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickAccessInfo: {
    flex: 1,
    marginLeft: 12,
  },
  quickAccessRegion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  quickAccessPoints: {
    fontSize: 12,
    color: '#10b981',
  },
  pointsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  pointsHint: {
    fontSize: 11,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  modalPoints: {
    fontSize: 16,
    color: '#ddd',
    lineHeight: 26,
  },
  linkablePoint: {
    color: '#10b981',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  // Anatomy Modal Styles
  anatomyModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
  },
  anatomyModalContent: {
    flex: 1,
    margin: 16,
    borderRadius: 24,
    overflow: 'hidden',
  },
  anatomyModalGradient: {
    flex: 1,
    padding: 20,
  },
  anatomyModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  anatomyModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  anatomyModalSubtitle: {
    fontSize: 14,
    color: '#10b981',
    marginTop: 4,
  },

  imageContainer: {
    height: SCREEN_WIDTH, // Square container
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  anatomyImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  anatomyModalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 6,
  },
  anatomyModalHint: {
    fontSize: 12,
    color: '#888',
  },
  zoomControls: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'column',
    gap: 8,
  },
  zoomButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});
