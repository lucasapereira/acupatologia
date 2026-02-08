import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TimerScreen() {
    const { colors, fontSizeMultiplier } = useTheme();
    const insets = useSafeAreaInsets();

    // Default 20 minutes in seconds
    const DEFAULT_TIME = 20 * 60;

    const [timeLeft, setTimeLeft] = useState(DEFAULT_TIME);
    const [isActive, setIsActive] = useState(false);
    const [initialTime, setInitialTime] = useState(DEFAULT_TIME);
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState('20');
    const soundRef = useRef<Audio.Sound | null>(null);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prevTime) => prevTime - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);
            playSound();
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, timeLeft]);

    useEffect(() => {
        return () => {
            if (soundRef.current) {
                soundRef.current.unloadAsync();
            }
        };
    }, []);

    const playSound = async () => {
        try {
            if (soundRef.current) {
                await soundRef.current.unloadAsync();
            }

            // Try local file first, then fallback to remote
            try {
                const { sound } = await Audio.Sound.createAsync(
                    require('@/assets/sounds/bell.mp3')
                );
                soundRef.current = sound;
                await sound.playAsync();
            } catch (e) {
                console.log('Local sound not found, trying remote...');
                const { sound } = await Audio.Sound.createAsync(
                    { uri: 'https://cdn.freesound.org/previews/339/339809_4930326-lq.mp3' } // Fallback Tibetan bell sound
                );
                soundRef.current = sound;
                await sound.playAsync();
            }
        } catch (error) {
            console.log('Error playing sound', error);
            Alert.alert('Timer Finalizado', 'O tempo acabou! (Som não pôde ser reproduzido)');
        }
    };

    const toggleTimer = () => {
        setIsActive(!isActive);
        setIsEditing(false);
    };

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(initialTime);
        setIsEditing(false);
        if (soundRef.current) {
            soundRef.current.stopAsync();
        }
    };

    const adjustTime = (minutes: number) => {
        const newTime = initialTime + minutes * 60;
        if (newTime > 0 && newTime <= 120 * 60) {
            setInitialTime(newTime);
            setTimeLeft(newTime);
            setIsActive(false);
            setIsEditing(false);
        }
    };

    const handleTimePress = () => {
        if (isActive) return;
        const mins = Math.floor(timeLeft / 60);
        setInputValue(mins.toString());
        setIsEditing(true);
    };

    const handleTimeSubmit = () => {
        let mins = parseInt(inputValue, 10);
        if (isNaN(mins) || mins <= 0) mins = 1;
        if (mins > 120) mins = 120; // Cap at 2 hours

        const newTime = mins * 60;
        setInitialTime(newTime);
        setTimeLeft(newTime);
        setIsEditing(false);
        Keyboard.dismiss();
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} `;
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
            <Text style={[styles.title, { color: colors.text, fontSize: 24 * fontSizeMultiplier }]}>Timer de Agulhas</Text>

            <TouchableOpacity
                style={styles.timerContainer}
                onPress={handleTimePress}
                disabled={isActive}
            >
                {isEditing ? (
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={[styles.timerInput, { color: colors.primary, fontSize: 80 * fontSizeMultiplier }]}
                            value={inputValue}
                            onChangeText={setInputValue}
                            keyboardType="number-pad"
                            returnKeyType="done"
                            onSubmitEditing={handleTimeSubmit}
                            onBlur={handleTimeSubmit}
                            autoFocus
                            maxLength={3}
                        />
                        <Text style={[styles.minuteLabel, { color: colors.textSecondary }]}>min</Text>
                    </View>
                ) : (
                    <Text style={[styles.timerText, { color: colors.primary, fontSize: 80 * fontSizeMultiplier }]}>
                        {formatTime(timeLeft)}
                    </Text>
                )}
                {!isActive && !isEditing && (
                    <Text style={[styles.editHint, { color: colors.textSecondary }]}>Toque para editar</Text>
                )}
            </TouchableOpacity>

            <View style={styles.controlsContainer}>
                <TouchableOpacity
                    style={[styles.button, { borderColor: colors.border }]}
                    onPress={() => adjustTime(-5)}>
                    <Text style={[styles.buttonText, { color: colors.text }]}>-5 min</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, { borderColor: colors.border }]}
                    onPress={() => adjustTime(-1)}>
                    <Text style={[styles.buttonText, { color: colors.text }]}>-1 min</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, { borderColor: colors.border }]}
                    onPress={() => adjustTime(1)}>
                    <Text style={[styles.buttonText, { color: colors.text }]}>+1 min</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, { borderColor: colors.border }]}
                    onPress={() => adjustTime(5)}>
                    <Text style={[styles.buttonText, { color: colors.text }]}>+5 min</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.mainControls}>
                <TouchableOpacity
                    style={[styles.mainButton, { backgroundColor: isActive ? '#FF6B6B' : '#4ECDC4' }]}
                    onPress={toggleTimer}>
                    <Ionicons name={isActive ? "pause" : "play"} size={32 * fontSizeMultiplier} color="#FFF" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.mainButton, { backgroundColor: colors.surface }]}
                    onPress={resetTimer}>
                    <Ionicons name="refresh" size={32 * fontSizeMultiplier} color={colors.text} />
                </TouchableOpacity>
            </View>

            <View style={styles.instructionContainer}>
                <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
                    Configure o tempo e relaxe. Um sino suave tocará ao final.
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontWeight: 'bold',
        marginBottom: 40,
    },
    timerContainer: {
        marginBottom: 40,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 120, // Ensure touch area is stable
    },
    timerText: {
        fontWeight: '200',
        fontVariant: ['tabular-nums'],
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    timerInput: {
        fontWeight: '200',
        fontVariant: ['tabular-nums'],
        minWidth: 120,
        textAlign: 'center',
        padding: 0,
    },
    minuteLabel: {
        fontSize: 20,
        marginLeft: 5,
    },
    editHint: {
        fontSize: 12,
        marginTop: -5,
    },
    controlsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 30,
    },
    button: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        minWidth: 70,
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '500',
    },
    mainControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        marginBottom: 40,
    },
    mainButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    instructionContainer: {
        marginTop: 20,
        paddingHorizontal: 20,
    },
    instructionText: {
        fontSize: 14,
        textAlign: 'center',
        fontStyle: 'italic',
    },
});
