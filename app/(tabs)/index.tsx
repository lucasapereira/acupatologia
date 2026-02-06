import { acupatologiaData, AcupatologiaEntry } from '@/data/acupatologia';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import {
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

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<AcupatologiaEntry | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

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

                  <Text style={styles.pointsLabel}>
                    <Ionicons name="locate" size={16} color="#8B5CF6" /> Pontos de
                    Acupuntura
                  </Text>
                  <Text style={styles.modalPoints}>{selectedEntry?.points}</Text>
                </ScrollView>
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
    maxHeight: '85%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  modalGradient: {
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
    maxHeight: '100%',
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
    marginVertical: 20,
  },
  pointsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  modalPoints: {
    fontSize: 16,
    color: '#ddd',
    lineHeight: 26,
  },
});
