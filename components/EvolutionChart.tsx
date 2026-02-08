import { Appointment } from '@/context/PatientContext';
import { useTheme } from '@/context/ThemeContext';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface EvolutionChartProps {
    appointments: Appointment[];
}

export const EvolutionChart: React.FC<EvolutionChartProps> = ({ appointments }) => {
    const { colors, fontSizeMultiplier } = useTheme();

    // Filter appointments with painLevel and sort by date
    const dataPoints = appointments
        .filter(a => a.painLevel !== undefined)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (dataPoints.length < 2) {
        return (
            <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    Dados insuficientes para gerar gráfico de evolução.
                    Registre o feedback de dor após os atendimentos.
                </Text>
            </View>
        );
    }

    // Take last 5 points for better readability
    const recentData = dataPoints.slice(-5);

    const labels = recentData.map(a => {
        const date = new Date(a.date);
        return `${date.getDate()}/${date.getMonth() + 1}`;
    });

    const painLevels = recentData.map(a => a.painLevel!);

    return (
        <View style={[styles.container, { backgroundColor: colors.surface + '40', borderColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text, fontSize: 16 * fontSizeMultiplier }]}>Evolução da Dor (0-10)</Text>
            <LineChart
                data={{
                    labels: labels,
                    datasets: [
                        {
                            data: painLevels
                        }
                    ]
                }}
                width={Dimensions.get("window").width - 48} // from react-native
                height={220}
                yAxisLabel=""
                yAxisSuffix=""
                yAxisInterval={1} // optional, defaults to 1
                fromZero={true}
                chartConfig={{
                    backgroundColor: colors.background,
                    backgroundGradientFrom: colors.surface,
                    backgroundGradientTo: colors.surface,
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`, // Primary color
                    labelColor: (opacity = 1) => colors.textSecondary,
                    style: {
                        borderRadius: 16
                    },
                    propsForDots: {
                        r: "6",
                        strokeWidth: "2",
                        stroke: colors.primary
                    }
                }}
                bezier
                style={{
                    marginVertical: 8,
                    borderRadius: 16
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 20,
        alignItems: 'center'
    },
    title: {
        alignSelf: 'flex-start',
        fontWeight: 'bold',
        marginBottom: 10,
    },
    emptyText: {
        fontStyle: 'italic',
        textAlign: 'center',
        padding: 20,
    }
});
