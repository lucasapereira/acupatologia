
import { useTheme } from '@/context/ThemeContext';
import { Image } from 'expo-image';
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';

interface ZoomableImageProps {
    source: any;
    width?: number;
    height?: number;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

function clamp(value: number, min: number, max: number) {
    'worklet';
    return Math.min(Math.max(value, min), max);
}

export function ZoomableImage({ source, width = SCREEN_WIDTH, height = SCREEN_HEIGHT }: ZoomableImageProps) {
    const { colors } = useTheme();
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const savedTranslateX = useSharedValue(0);
    const savedTranslateY = useSharedValue(0);

    const pinchGesture = Gesture.Pinch()
        .onUpdate((e) => {
            // Allow zooming out slightly (rubber band) but mostly distinct 
            scale.value = clamp(savedScale.value * e.scale, 0.5, 8);
        })
        .onEnd(() => {
            if (scale.value < 1) {
                // Reset to original
                scale.value = withSpring(1);
                translateX.value = withSpring(0);
                translateY.value = withSpring(0);
                savedScale.value = 1;
                savedTranslateX.value = 0;
                savedTranslateY.value = 0;
            } else if (scale.value > 5) {
                // Cap max zoom
                scale.value = withSpring(5);
                savedScale.value = 5;
            } else {
                savedScale.value = scale.value;
            }
        });

    const panGesture = Gesture.Pan()
        .averageTouches(true) // Smooth out jitter
        .onUpdate((e) => {
            if (scale.value > 1) {
                translateX.value = savedTranslateX.value + e.translationX;
                translateY.value = savedTranslateY.value + e.translationY;
            }
        })
        .onEnd(() => {
            if (scale.value > 1) {
                // Boundary calculation
                // Visible width is 'width'.
                // Content width is 'width * scale'.
                // The overflow is (width * scale - width).
                // We can translate +/- overflow / 2.

                const maxTranslateX = (width * scale.value - width) / 2;
                const minTranslateX = -maxTranslateX;
                const maxTranslateY = (height * scale.value - height) / 2;
                const minTranslateY = -maxTranslateY;

                let targetX = translateX.value;
                let targetY = translateY.value;

                // Clamp
                if (targetX > maxTranslateX) targetX = maxTranslateX;
                if (targetX < minTranslateX) targetX = minTranslateX;
                if (targetY > maxTranslateY) targetY = maxTranslateY;
                if (targetY < minTranslateY) targetY = minTranslateY;

                translateX.value = withSpring(targetX, { damping: 15 });
                translateY.value = withSpring(targetY, { damping: 15 });

                savedTranslateX.value = targetX;
                savedTranslateY.value = targetY;
            } else {
                // If not zoomed, snap back to center
                translateX.value = withSpring(0);
                translateY.value = withSpring(0);
                savedTranslateX.value = 0;
                savedTranslateY.value = 0;
            }
        });

    const doubleTapGesture = Gesture.Tap()
        .numberOfTaps(2)
        .onEnd(() => {
            if (scale.value > 1.5) {
                // Zoom out
                scale.value = withTiming(1, { duration: 250 });
                translateX.value = withTiming(0, { duration: 250 });
                translateY.value = withTiming(0, { duration: 250 });
                savedScale.value = 1;
                savedTranslateX.value = 0;
                savedTranslateY.value = 0;
            } else {
                // Zoom in to 3x
                scale.value = withTiming(3, { duration: 250 });
                savedScale.value = 3;
                // Don't change translation on zoom in, implies zooming to center
                // If we wanted to zoom to tap point, it's more complex (focal point)
                // For now, center zoom is fine.
            }
        });

    // Compose all gestures efficiently
    // Simultaneous allows them to work together.
    const composed = Gesture.Simultaneous(pinchGesture, panGesture, doubleTapGesture);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
        ],
    }));

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <GestureDetector gesture={composed}>
                <Animated.View style={[{ width, height }, animatedStyle]}>
                    <Image
                        source={source}
                        style={styles.image}
                        contentFit="contain"
                        transition={200}
                    />
                </Animated.View>
            </GestureDetector>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
});
