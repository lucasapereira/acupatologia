import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AboutScreen() {
  const { theme, colors, fontSizeMultiplier } = useTheme();
  const router = useRouter();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={colors.backgroundGradient}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight + '26', borderColor: colors.primaryLight + '4d' }]}>
              <Ionicons name="leaf" size={48 * fontSizeMultiplier} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text, fontSize: 28 * fontSizeMultiplier }]}>Acupatologia</Text>
            <Text style={[styles.version, { color: colors.textSecondary, fontSize: 14 * fontSizeMultiplier }]}>Versão 1.0.0</Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary, fontSize: 18 * fontSizeMultiplier }]}>Sobre o App</Text>
            <Text style={[styles.sectionText, { color: colors.textSecondary, fontSize: 15 * fontSizeMultiplier, lineHeight: 24 * fontSizeMultiplier }]}>
              Este aplicativo foi desenvolvido para facilitar a consulta de pontos
              de acupuntura para diferentes condições e doenças.
            </Text>
            <Text style={[styles.sectionText, { color: colors.textSecondary, fontSize: 15 * fontSizeMultiplier, lineHeight: 24 * fontSizeMultiplier }]}>
              Utilize a pesquisa para encontrar rapidamente os pontos relacionados
              a uma condição específica, ou navegue pelo alfabeto para explorar
              todas as opções disponíveis.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary, fontSize: 18 * fontSizeMultiplier }]}>Como Usar</Text>
            <View style={[styles.tipItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="search" size={20 * fontSizeMultiplier} color={colors.primary} />
              <Text style={[styles.tipText, { color: colors.textSecondary, fontSize: 14 * fontSizeMultiplier }]}>
                Digite o nome da doença ou ponto na barra de pesquisa
              </Text>
            </View>
            <View style={[styles.tipItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="text" size={20 * fontSizeMultiplier} color={colors.primary} />
              <Text style={[styles.tipText, { color: colors.textSecondary, fontSize: 14 * fontSizeMultiplier }]}>
                Use o filtro alfabético para navegar por letra inicial
              </Text>
            </View>
            <View style={[styles.tipItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="finger-print" size={20 * fontSizeMultiplier} color={colors.primary} />
              <Text style={[styles.tipText, { color: colors.textSecondary, fontSize: 14 * fontSizeMultiplier }]}>
                Toque em um item para ver todos os detalhes
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary, fontSize: 18 * fontSizeMultiplier }]}>Aviso</Text>
            <Text style={[styles.disclaimer, { color: colors.textSecondary, fontSize: 14 * fontSizeMultiplier }]}>
              Este aplicativo é apenas para referência educacional. Sempre consulte
              um profissional de saúde qualificado antes de qualquer tratamento.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary, fontSize: 18 * fontSizeMultiplier }]}>Legal</Text>
            <TouchableOpacity
              style={[styles.legalButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => router.push('/legal')}
            >
              <Ionicons name="document-text-outline" size={24 * fontSizeMultiplier} color={colors.primary} />
              <Text style={[styles.legalButtonText, { color: colors.text, fontSize: 16 * fontSizeMultiplier }]}>Termos de Uso e Privacidade</Text>
              <Ionicons name="chevron-forward" size={20 * fontSizeMultiplier} color={colors.icon} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.footer, { color: colors.textSecondary, fontSize: 14 * fontSizeMultiplier }]}>
            Feito com ❤️ para acupunturistas
          </Text>
        </ScrollView>
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
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 80,
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  version: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B5CF6',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionText: {
    fontSize: 15,
    color: '#bbb',
    lineHeight: 24,
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#ccc',
    marginLeft: 12,
    lineHeight: 20,
  },
  disclaimer: {
    fontSize: 14,
    color: '#999',
    lineHeight: 22,
    fontStyle: 'italic',
    backgroundColor: 'rgba(255, 200, 0, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  legalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  legalButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    marginLeft: 12,
  },
  footer: {
    textAlign: 'center',
    color: '#555',
    fontSize: 14,
    marginTop: 20,
  },
});
