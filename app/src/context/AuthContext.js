import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [persistLogin, setPersistLoginState] = useState(false);

  const normalizeUser = (rawUser) => {
    if (!rawUser) return rawUser;
    const id = rawUser.id || rawUser._id;
    return id ? { ...rawUser, id } : rawUser;
  };

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const persist = (await AsyncStorage.getItem('persistLogin')) === 'true';
      setPersistLoginState(persist);

      if (!persist) {
        await AsyncStorage.removeItem('token');
        return;
      }

      const token = await AsyncStorage.getItem('token');
      if (token) {
        const userData = await authService.getProfile();
        setUser(normalizeUser(userData));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const setPersistLogin = async (value) => {
    const next = !!value;
    setPersistLoginState(next);
    await AsyncStorage.setItem('persistLogin', next ? 'true' : 'false');
  };

  const login = async (email, password, options = {}) => {
    try {
      await setPersistLogin(!!options.remember);
      const result = await authService.login(email, password);
      await AsyncStorage.setItem('token', result.token);
      const normalized = normalizeUser(result.user);
      setUser(normalized);
      return { success: true, user: normalized };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (userData, options = {}) => {
    try {
      await setPersistLogin(!!options.remember);
      const result = await authService.register(userData);
      await AsyncStorage.setItem('token', result.token);
      const normalized = normalizeUser(result.user);
      setUser(normalized);
      return { success: true, user: normalized };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.setItem('persistLogin', 'false');
      setPersistLoginState(false);
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const updatedUser = await authService.updateProfile(profileData);
      const normalized = normalizeUser(updatedUser);
      setUser(normalized);
      return { success: true, user: normalized };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    persistLogin,
    setPersistLogin,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isCustomer: user?.role === 'USER',
    isDriver: user?.role === 'DRIVER'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};