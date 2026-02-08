import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/context/ThemeContext';

export default function LegalScreen() {
    const { theme, colors, fontSizeMultiplier } = useTheme();
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <LinearGradient
                colors={colors.backgroundGradient}
                style={styles.gradient}
            >
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    <TouchableOpacity
                        style={[styles.backButton, { backgroundColor: colors.surfaceHighlight }]}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24 * fontSizeMultiplier} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text, fontSize: 20 * fontSizeMultiplier }]}>Termos e Privacidade</Text>
                </View>

                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.primary, fontSize: 22 * fontSizeMultiplier }]}>Política de Privacidade</Text>
                        <Text style={[styles.lastUpdated, { color: colors.textSecondary, fontSize: 12 * fontSizeMultiplier }]}>Última atualização: {new Date().toLocaleDateString('pt-BR')}</Text>

                        <Text style={[styles.paragraph, { color: colors.textSecondary, fontSize: 15 * fontSizeMultiplier, lineHeight: 24 * fontSizeMultiplier }]}>
                            1. Coleta de Dados: O aplicativo Acupatologia não coleta, armazena ou compartilha dados pessoais dos usuários. Todo o processamento é feito localmente no dispositivo.
                        </Text>
                        <Text style={[styles.paragraph, { color: colors.textSecondary, fontSize: 15 * fontSizeMultiplier, lineHeight: 24 * fontSizeMultiplier }]}>
                            2. Permissões: O aplicativo não requer permissões especiais (como câmera, microfone ou localização) para funcionar.
                        </Text>
                        <Text style={[styles.paragraph, { color: colors.textSecondary, fontSize: 15 * fontSizeMultiplier, lineHeight: 24 * fontSizeMultiplier }]}>
                            3. Conteúdo: As imagens e textos são para fins informativos. Não rastreamos quais doenças ou pontos você pesquisa.
                        </Text>
                        <Text style={[styles.paragraph, { color: colors.textSecondary, fontSize: 15 * fontSizeMultiplier, lineHeight: 24 * fontSizeMultiplier }]}>
                            4. Cookies e Rastreamento: Nós não utilizamos cookies ou tecnologias de rastreamento de terceiros.
                        </Text>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.primary, fontSize: 22 * fontSizeMultiplier }]}>Termos de Uso</Text>

                        <Text style={[styles.paragraph, { color: colors.textSecondary, fontSize: 15 * fontSizeMultiplier, lineHeight: 24 * fontSizeMultiplier }]}>
                            1. Aceitação: Ao utilizar o aplicativo Acupatologia, você concorda com estes termos.
                        </Text>
                        <Text style={[styles.paragraph, { color: colors.textSecondary, fontSize: 15 * fontSizeMultiplier, lineHeight: 24 * fontSizeMultiplier }]}>
                            2. Finalidade Educacional: Este aplicativo serve exclusivamente como referência rápida e material de estudo para acupunturistas e estudantes. Ele NÃO substitui o diagnóstico, aconselhamento ou tratamento médico profissional.
                        </Text>
                        <Text style={[styles.paragraph, { color: colors.textSecondary, fontSize: 15 * fontSizeMultiplier, lineHeight: 24 * fontSizeMultiplier }]}>
                            3. Isenção de Responsabilidade: O desenvolvedor não se responsabiliza por eventuais imprecisões nos dados ou pelo uso indevido das informações fornecidas. A aplicação das técnicas é de inteira responsabilidade do profissional.
                        </Text>
                        <Text style={[styles.paragraph, { color: colors.textSecondary, fontSize: 15 * fontSizeMultiplier, lineHeight: 24 * fontSizeMultiplier }]}>
                            4. Propriedade Intelectual: O design, código e a compilação dos dados são propriedade do desenvolvedor. O uso não autorizado para clonagem ou revenda é proibido.
                        </Text>
                        <Text style={[styles.paragraph, { color: colors.textSecondary, fontSize: 15 * fontSizeMultiplier, lineHeight: 24 * fontSizeMultiplier }]}>
                            5. Alterações: Podemos atualizar estes termos periodicamente. O uso contínuo do app após alterações constitui aceitação dos novos termos.
                        </Text>
                    </View>

                    <View style={styles.footerSpace} />
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
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#8B5CF6',
        marginBottom: 8,
    },
    lastUpdated: {
        fontSize: 12,
        color: '#666',
        marginBottom: 16,
        fontStyle: 'italic',
    },
    paragraph: {
        fontSize: 15,
        color: '#ccc',
        lineHeight: 24,
        marginBottom: 16,
        textAlign: 'justify',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginVertical: 24,
    },
    footerSpace: {
        height: 50,
    },
});
