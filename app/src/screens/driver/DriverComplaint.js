import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Alert, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { useLocationSelection } from '../../context/LocationContext';
import apiService from '../../services/apiService';
import styles from '../../styles/styles';
import { PREMIUM_LIGHT } from '../../styles/tokens';

const DriverComplaint = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [formData, setFormData] = useState({
    vehicleId: '',
    type: '',
    description: '',
    severity: 'MEDIUM',
    location: {
      latitude: 0,
      longitude: 0,
      address: ''
    }
  });

  const { user } = useAuth();
  const { selectedLocation, clearSelectedLocation } = useLocationSelection();

  useEffect(() => {
    let mounted = true;
    const loadVehicles = async () => {
      try {
        setVehiclesLoading(true);
        const res = await apiService.getDriverVehicles(user?.id);
        const list = res?.data?.data;
        if (mounted) setVehicles(Array.isArray(list) ? list : []);
      } catch (e) {
        if (mounted) setVehicles([]);
      } finally {
        if (mounted) setVehiclesLoading(false);
      }
    };

    if (user?.id) loadVehicles();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  useFocusEffect(
    useCallback(() => {
      if (!selectedLocation) return;
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          address: selectedLocation.address,
        },
      }));
      clearSelectedLocation();
    }, [selectedLocation, clearSelectedLocation])
  );

  const handleSubmit = async () => {
    if (!formData.vehicleId) {
      Alert.alert('Error', 'Please select a vehicle');
      return;
    }

    if (!formData.type) {
      Alert.alert('Error', 'Please select a complaint type');
      return;
    }

    if (!formData.description.trim()) {
      Alert.alert('Error', 'Please provide a description');
      return;
    }

    if (!formData.location.address.trim()) {
      Alert.alert('Error', 'Please select a location');
      return;
    }

    setLoading(true);
    try {
      const complaintData = {
        vehicleId: formData.vehicleId,
        type: formData.type,
        description: formData.description,
        severity: formData.severity,
        location: formData.location
      };

      await apiService.reportComplaint(complaintData);
      Alert.alert('Success', 'Complaint reported successfully');
      navigation.goBack();
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Failed to report complaint';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  // UI complaint types mapped to backend values
  const uiComplaintTypes = [
    { value: 'MECHANICAL', label: 'Mechanical', emoji: '🔧' },
    { value: 'ELECTRICAL', label: 'Electrical', emoji: '⚡' },
    { value: 'BODY_DAMAGE', label: 'Body Damage', emoji: '🚗' },
    { value: 'TIRE_ISSUE', label: 'Tire Issue', emoji: '🛞' },
    { value: 'FUEL_SYSTEM', label: 'Fuel Problem', emoji: '⛽' },
    { value: 'BRAKE_SYSTEM', label: 'Brake System', emoji: '🛑' },
    { value: 'OTHER', label: 'Other', emoji: '📝' }
  ];

  const severityLevels = [
    { value: 'LOW', label: 'Low', color: '#4CAF50' },
    { value: 'MEDIUM', label: 'Medium', color: '#FF9800' },
    { value: 'HIGH', label: 'High', color: '#f44336' },
    { value: 'CRITICAL', label: 'Critical', color: '#f44336' }
  ];

  const severityBanner = () => {
    const map = {
      CRITICAL: { bg: 'rgba(255,77,79,0.12)', fg: PREMIUM_LIGHT.danger, text: '🚨 CRITICAL: Immediate attention required!' },
      HIGH: { bg: 'rgba(255,77,79,0.10)', fg: PREMIUM_LIGHT.danger, text: '⚠️ HIGH: High priority issue' },
      MEDIUM: { bg: PREMIUM_LIGHT.accentSoft, fg: PREMIUM_LIGHT.accent, text: 'ℹ️ MEDIUM: Standard priority' },
      LOW: { bg: 'rgba(47,128,237,0.10)', fg: PREMIUM_LIGHT.info, text: '📝 LOW: Minor issue' },
    };
    return map[formData.severity] || map.MEDIUM;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Report Complaint</Text>
        <Text style={{ fontSize: 16, color: '#fff', textAlign: 'center', marginTop: 8 }}>
          Report issues with your vehicle or work
        </Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.title}>Complaint Details</Text>

            <Text style={styles.label}>Vehicle *</Text>
            {vehiclesLoading ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
                <ActivityIndicator size="small" color={PREMIUM_LIGHT.accent} />
                <Text style={{ marginLeft: 8, color: PREMIUM_LIGHT.muted }}>Loading vehicles…</Text>
              </View>
            ) : vehicles.length === 0 ? (
              <View style={{ paddingVertical: 8 }}>
                <Text style={{ color: PREMIUM_LIGHT.muted }}>No vehicles found for your account.</Text>
                <Text style={{ color: PREMIUM_LIGHT.muted, marginTop: 4 }}>Ask admin to assign a vehicle.</Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, marginHorizontal: -4 }}>
                {vehicles.map((v) => {
                  const id = v?._id || v?.id;
                  const selected = id && formData.vehicleId === String(id);
                  const label = v?.vehicleNumber
                    ? `${v.vehicleNumber}${v?.type ? ` (${v.type})` : ''}`
                    : 'Vehicle';
                  return (
                    <TouchableOpacity
                      key={String(id)}
                      style={[
                        localStyles.pill,
                        selected ? localStyles.pillActive : localStyles.pillInactive,
                      ]}
                      onPress={() => setFormData((prev) => ({ ...prev, vehicleId: String(id) }))}
                      activeOpacity={0.85}
                    >
                      <Text style={[localStyles.pillText, selected && localStyles.pillTextActive]} numberOfLines={1}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            <Text style={[styles.label, { marginTop: 12 }]}>Complaint Type *</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, marginHorizontal: -4 }}>
              {uiComplaintTypes.map((type) => {
                const selected = formData.type === type.value;
                return (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      localStyles.pill,
                      selected ? localStyles.pillActive : localStyles.pillInactive,
                    ]}
                    onPress={() => handleInputChange('type', type.value)}
                    activeOpacity={0.85}
                  >
                    <Text style={[localStyles.pillText, selected && localStyles.pillTextActive]}>
                      {type.emoji} {type.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
          value={formData.description}
          onChangeText={(value) => handleInputChange('description', value)}
          placeholder="Describe the issue in detail..."
          multiline
        />

            <Text style={[styles.label, { marginTop: 12 }]}>Severity Level *</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, marginHorizontal: -4 }}>
              {severityLevels.map((level) => {
                const selected = formData.severity === level.value;
                return (
                  <TouchableOpacity
                    key={level.value}
                    style={[
                      localStyles.pill,
                      selected
                        ? { backgroundColor: level.color, borderColor: level.color }
                        : { backgroundColor: PREMIUM_LIGHT.surface, borderColor: PREMIUM_LIGHT.border },
                    ]}
                    onPress={() => handleInputChange('severity', level.value)}
                    activeOpacity={0.85}
                  >
                    <Text style={[localStyles.pillText, { color: selected ? '#fff' : PREMIUM_LIGHT.text }]}>
                      {level.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>Location *</Text>
            <TextInput
              style={styles.input}
              value={formData.location.address}
              placeholder="Tap on map to select location"
              editable={false}
            />

            <TouchableOpacity
              style={styles.mapContainer}
              onPress={() =>
                navigation.navigate('MapSelect', {
                  initial: {
                    latitude: formData.location.latitude,
                    longitude: formData.location.longitude,
                    address: formData.location.address,
                  },
                })
              }
            >
              <Text style={{
                flex: 1,
                textAlign: 'center',
                textAlignVertical: 'center',
                color: PREMIUM_LIGHT.muted
              }}>
                🗺️ Tap to select location on map
              </Text>
            </TouchableOpacity>

            <View
              style={{
                backgroundColor: severityBanner().bg,
                padding: 12,
                borderRadius: 12,
                marginTop: 12,
                borderWidth: 1,
                borderColor: 'rgba(15,23,42,0.06)',
              }}
            >
              <Text style={{ color: severityBanner().fg, fontWeight: '900' }}>{severityBanner().text}</Text>
            </View>

            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.92}
            >
              <Text style={styles.buttonTextOnDark}>
                {loading ? 'Reporting...' : 'Report Complaint'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default DriverComplaint;

const localStyles = {
  pill: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    marginHorizontal: 4,
    marginBottom: 8,
    maxWidth: '100%',
  },
  pillActive: {
    backgroundColor: PREMIUM_LIGHT.accent,
    borderColor: 'rgba(255,138,0,0.35)',
  },
  pillInactive: {
    backgroundColor: PREMIUM_LIGHT.surface,
    borderColor: PREMIUM_LIGHT.border,
  },
  pillText: {
    color: PREMIUM_LIGHT.text,
    fontWeight: '700',
    fontSize: 13,
  },
  pillTextActive: {
    color: '#fff',
  },
};