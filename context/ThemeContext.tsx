import { Colors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

type Theme = 'light' | 'dark';

type ThemeContextType = {
    theme: Theme;
    toggleTheme: () => void;
    fontSizeMultiplier: number;
    setFontSizeMultiplier: (multiplier: number) => void;
    colors: typeof Colors.light;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemScheme = useColorScheme();
    const [theme, setTheme] = useState<Theme>('dark'); // Default to dark for now
    const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1.0);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('userTheme');
            const savedFontScale = await AsyncStorage.getItem('userFontScale');

            if (savedTheme) {
                setTheme(savedTheme as Theme);
            } else if (systemScheme) {
                setTheme(systemScheme as Theme);
            }

            if (savedFontScale) {
                setFontSizeMultiplier(parseFloat(savedFontScale));
            }
        } catch (e) {
            console.error('Failed to load settings', e);
        } finally {
            setIsLoaded(true);
        }
    };

    const toggleTheme = async () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        try {
            await AsyncStorage.setItem('userTheme', newTheme);
        } catch (e) {
            console.error('Failed to save theme', e);
        }
    };

    const updateFontSizeMultiplier = async (val: number) => {
        setFontSizeMultiplier(val);
        try {
            await AsyncStorage.setItem('userFontScale', val.toString());
        } catch (e) {
            console.error('Failed to save font scale', e);
        }
    };

    if (!isLoaded) {
        return null; // Or a splash screen
    }

    const colors = Colors[theme];

    return (
        <ThemeContext.Provider
            value={{
                theme,
                toggleTheme,
                fontSizeMultiplier,
                setFontSizeMultiplier: updateFontSizeMultiplier,
                colors,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
