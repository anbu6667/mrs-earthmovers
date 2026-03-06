import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations as enTranslations } from '../i18n/en';
import { translations as taTranslations } from '../i18n/ta';
import { PREMIUM_LIGHT } from '../styles/tokens';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const [savedTheme, savedLanguage] = await Promise.all([
        AsyncStorage.getItem('theme'),
        AsyncStorage.getItem('language')
      ]);

      // Requirement: all screens use orange/white theme (Landing uses its own local dark styling).
      // Force light theme even if a previous session stored "dark".
      if (savedTheme && savedTheme !== 'light') {
        await AsyncStorage.setItem('theme', 'light');
      }
      setTheme('light');
      if (savedLanguage === 'en' || savedLanguage === 'ta') setLanguage(savedLanguage);
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = async () => {
    try {
      // Theme switching intentionally disabled per UI requirements.
      await AsyncStorage.setItem('theme', 'light');
      setTheme('light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const toggleLanguage = async () => {
    const newLanguage = language === 'en' ? 'ta' : 'en';
    try {
      await AsyncStorage.setItem('language', newLanguage);
      setLanguage(newLanguage);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const t = (key, fallback) => {
    const dict = language === 'ta' ? taTranslations : enTranslations;
    const keys = String(key || '').split('.');
    let value = dict;
    for (const k of keys) value = value?.[k];
    return value ?? fallback ?? key;
  };

  const value = {
    theme,
    language,
    loading,
    toggleTheme,
    toggleLanguage,
    t,
    isDark: false,
    colors: {
      primary: PREMIUM_LIGHT.accent,
      secondary: PREMIUM_LIGHT.surface,
      background: PREMIUM_LIGHT.bg,
      surface: PREMIUM_LIGHT.surface,
      text: PREMIUM_LIGHT.text,
      textSecondary: PREMIUM_LIGHT.muted,
      border: PREMIUM_LIGHT.border,
      success: PREMIUM_LIGHT.success,
      error: PREMIUM_LIGHT.danger,
      warning: PREMIUM_LIGHT.accent,
      info: PREMIUM_LIGHT.info,
    },
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};