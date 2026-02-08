import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, AppState, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Configure notifications handler
// Configure notifications handler
try {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
        }),
    });
} catch (error) {
    console.warn('Failed to set notification handler:', error);
}

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
    const [endTime, setEndTime] = useState<number | null>(null);

    const soundRef = useRef<Audio.Sound | null>(null);
    const notificationId = useRef<string | null>(null);
    const appState = useRef(AppState.currentState);

    // Audio setup on mount
    useEffect(() => {
        const setup = async () => {
            // Allow audio to play in silent mode and in background
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                staysActiveInBackground: true,
                shouldDuckAndroid: true,
            });
        };

        setup();

        const subscription = AppState.addEventListener('change', nextAppState => {
            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, []);

    useEffect(() => {
        return () => {
            if (soundRef.current) {
                soundRef.current.unloadAsync();
            }
        };
    }, []);

    // Helper to clear existing notifications
    const cancelNotification = async () => {
        if (notificationId.current) {
            await Notifications.cancelScheduledNotificationAsync(notificationId.current);
            notificationId.current = null;
        }
    };

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
                    { uri: 'https://cdn.freesound.org/previews/339/339809_4930326-lq.mp3' }
                );
                soundRef.current = sound;
                await sound.playAsync();
            }
        } catch (error) {
            console.log('Error playing sound', error);
            if (appState.current === 'active') {
                Alert.alert('Timer Finalizado', 'O tempo acabou! (Som não pôde ser reproduzido)');
            }
        }
    };

    // Helper to schedule notification
    const scheduleNotification = async (seconds: number) => {
        await cancelNotification();

        try {
            const id = await Notifications.scheduleNotificationAsync({
                content: {
                    title: "Timer Finalizado 🔔",
                    body: "Sua sessão de acupuntura terminou.",
                    sound: process.env.EXPO_PUBLIC_TIMER_SOUND || undefined,
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                    seconds: seconds,
                    channelId: 'timer-channel',
                },
            });
            notificationId.current = id;
        } catch (error) {
            console.log("Error scheduling notification:", error);
            // Fallback for environments where notifications fail (like Expo Go)
            // We can just log it, the timer will still work without background notification
        }
    };

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isActive && endTime) {
            interval = setInterval(() => {
                const now = Date.now();
                const diff = Math.ceil((endTime - now) / 1000);

                if (diff <= 0) {
                    setTimeLeft(0);
                    setIsActive(false);
                    setEndTime(null);

                    if (appState.current === 'active') {
                        playSound();
                        cancelNotification();
                    }
                } else {
                    setTimeLeft(diff);
                }
            }, 500);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, endTime]);

    const startTimer = () => {
        const targetTime = Date.now() + timeLeft * 1000;
        setEndTime(targetTime);
        setIsActive(true);
        setIsEditing(false);
        scheduleNotification(timeLeft);
    };

    const toggleTimer = async () => {
        if (isActive) {
            // Pausing
            setIsActive(false);
            setEndTime(null);
            cancelNotification();
        } else {
            // Starting - Check permissions first
            try {
                const { status } = await Notifications.getPermissionsAsync();

                if (status !== 'granted') {
                    Alert.alert(
                        "Permissão Necessária",
                        "Para que o alarme toque mesmo se você sair do aplicativo, precisamos da sua permissão para enviar notificações.",
                        [
                            {
                                text: "Cancelar",
                                style: "cancel"
                            },
                            {
                                text: "Permitir",
                                onPress: async () => {
                                    try {
                                        const { status: newStatus } = await Notifications.requestPermissionsAsync();
                                        // We start the timer regardless, because the user explicitly said "Allow"
                                        // If they deny in the system dialog, we still run the timer locally
                                        // expecting they might stay in the app, or we just fail to notify.
                                        startTimer();
                                    } catch (e) {
                                        console.warn('Failed to request permissions', e);
                                        startTimer();
                                    }
                                }
                            }
                        ]
                    );
                    return;
                }

                startTimer();
            } catch (error) {
                console.warn('Notification permissions check failed, starting timer anyway', error);
                startTimer();
            }
        }
    };

    const resetTimer = () => {
        setIsActive(false);
        setEndTime(null);
        setTimeLeft(initialTime);
        setIsEditing(false);
        cancelNotification();
        if (soundRef.current) {
            soundRef.current.stopAsync();
        }
    };

    const adjustTime = (minutes: number) => {
        const newTime = initialTime + minutes * 60;
        if (newTime > 0 && newTime <= 120 * 60) {
            setInitialTime(newTime);
            setIsActive(false);
            setEndTime(null);
            setTimeLeft(newTime);
            cancelNotification();
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
