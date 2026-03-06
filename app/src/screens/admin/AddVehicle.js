import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import apiService from '../../services/apiService';
import styles from '../../styles/styles';
import { PREMIUM_LIGHT } from '../../styles/tokens';

const VEHICLE_TYPES = [
  { key: 'JCB', label: 'JCB' },
  { key: 'Hitachi', label: 'Hitachi' },
  { key: 'Rocksplitter', label: 'Rocksplitter' },
  { key: 'Tractor', label: 'Tractor' },
  { key: 'Tipper', label: 'Tipper' },
  { key: 'Compressor', label: 'Compressor' },
];

export default function AddVehicle({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    vehicleNumber: '',
    type: 'JCB',
    hourlyRate: '0',
  });

  const canSubmit = useMemo(() => {
    if (loading) return false;
    if (!form.vehicleNumber.trim()) return false;
    const hourlyRate = Number(form.hourlyRate);
    if (!Number.isFinite(hourlyRate) || hourlyRate < 0) return false;
    return true;
  }, [form, loading]);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async () => {
    if (!canSubmit) {
      Alert.alert('Missing info', 'Please fill all required fields.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        vehicleNumber: form.vehicleNumber.trim().toUpperCase(),
        type: form.type,
        hourlyRate: Number(form.hourlyRate),
      };

      await apiService.createVehicle(payload);
      Alert.alert('Success', 'Vehicle added successfully.');
      navigation.goBack();
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Failed to add vehicle.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { marginTop: 24 }]}> {/* Added marginTop to move header down */}
        <Text style={styles.headerTitle}>Add Vehicle</Text>
        <Text style={{ fontSize: 16, color: '#fff', textAlign: 'center', marginTop: 8 }}>
          Create new vehicle
        </Text>
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.title}>Vehicle Details</Text>

            <Text style={styles.label}>Vehicle Number *</Text>
            <TextInput
              style={styles.input}
              value={String(form.vehicleNumber)}
              onChangeText={(v) => setField('vehicleNumber', v.replace(/\s/g, ''))}
              placeholder="e.g. TN01AB1234 or 1234"
              autoCapitalize="characters"
              keyboardType="default"
            />

            <Text style={styles.label}>Type *</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginVertical: 8 }}>
              {VEHICLE_TYPES.map((t) => {
                const selected = form.type === t.key;
                return (
                  <TouchableOpacity
                    key={t.key}
                    style={[
                      styles.filterButton,
                      selected ? styles.filterButtonActive : styles.filterButtonInactive,
                    ]}
                    onPress={() => setField('type', t.key)}
                    disabled={loading}
                    activeOpacity={0.85}
                  >
                    <Text style={{ color: selected ? '#FFFFFF' : PREMIUM_LIGHT.text, fontWeight: '800' }}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>Hourly Rate (₹/hr) *</Text>
            <TextInput
              style={styles.input}
              value={form.hourlyRate}
              onChangeText={(v) => setField('hourlyRate', v.replace(/[^0-9.]/g, ''))}
              placeholder="e.g. 1500"
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={[styles.button, !canSubmit && { opacity: 0.6 }]}
              onPress={submit}
              disabled={!canSubmit}
            >
              <Text style={styles.buttonText}>{loading ? 'Saving…' : 'Add Vehicle'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: PREMIUM_LIGHT.accent }]}
              onPress={() => navigation.goBack()}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Creating vehicle…</Text>
        </View>
      )}
    </View>
  );
}
