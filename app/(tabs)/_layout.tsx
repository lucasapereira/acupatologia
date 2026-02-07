import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { colors, fontSizeMultiplier } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background === '#FFFFFF' ? '#F0F2F5' : '#0f0f23', // Match bottom gradient or specific color
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: 8,
          // Use safer padding for web to avoid cut off
          paddingBottom: Platform.OS === 'web' ? 20 : Math.max(insets.bottom, 8),
          height: Platform.OS === 'web' ? 70 : 60 + Math.max(insets.bottom, 8) + (fontSizeMultiplier > 1 ? 10 : 0),
        },
        tabBarLabelStyle: {
          fontSize: 11 * fontSizeMultiplier,
          marginTop: 4,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Buscar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size * fontSizeMultiplier} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reference"
        options={{
          title: 'Referência',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="body-outline" size={size * fontSizeMultiplier} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Sobre',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="information-circle-outline" size={size * fontSizeMultiplier} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
