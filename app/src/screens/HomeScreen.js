import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/styles';

const HomeScreen = ({ navigation }) => {
  const { user, loading } = useAuth();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (user) {
      setUserData(user);
    }
  }, [user]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!userData) {
    return null;
  }

  const getRoleBasedContent = () => {
    switch (userData.role) {
      case 'ADMIN':
        return (
          <View>
            <Text style={styles.title}>Welcome, Admin</Text>
            <Text style={styles.subtitle}>Manage your fleet and work orders</Text>
            
            <TouchableOpacity 
              style={[styles.button, styles.buttonSecondary]}
              onPress={() => navigation.navigate('AdminDashboard')}
            >
              <Text style={styles.buttonTextOnDark}>Admin Dashboard</Text>
            </TouchableOpacity>
          </View>
        );
      case 'USER':
        return (
          <View>
            <Text style={styles.title}>Welcome, Customer</Text>
            <Text style={styles.subtitle}>Track your work orders</Text>
            
            <TouchableOpacity 
              style={[styles.button, styles.buttonSecondary]}
              onPress={() => navigation.navigate('CustomerHome')}
            >
              <Text style={styles.buttonTextOnDark}>Customer Portal</Text>
            </TouchableOpacity>
          </View>
        );
      case 'DRIVER':
        return (
          <View>
            <Text style={styles.title}>Welcome, Driver</Text>
            <Text style={styles.subtitle}>Check your assignments</Text>
            
            <TouchableOpacity 
              style={[styles.button, styles.buttonSecondary]}
              onPress={() => navigation.navigate('DriverHome')}
            >
              <Text style={styles.buttonTextOnDark}>Driver Portal</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return (
          <View>
            <Text style={styles.title}>Unknown Role</Text>
            <Text style={styles.subtitle}>Please contact support</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MRS Earthmovers</Text>
        <Text style={{ fontSize: 16, color: '#fff', textAlign: 'center', marginTop: 8 }}>
          Earthmoving & Construction Services
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
        
        <Text style={styles.title}>{userData.name}</Text>
        <Text style={styles.subtitle}>
          Role: {userData.role}
        </Text>
        <Text style={styles.subtitle}>
          Email: {userData.email}
        </Text>
        <Text style={styles.subtitle}>
          Phone: {userData.phone}
        </Text>

        {getRoleBasedContent()}
      </View>

      <TouchableOpacity 
        style={[styles.button, styles.buttonDanger]}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;