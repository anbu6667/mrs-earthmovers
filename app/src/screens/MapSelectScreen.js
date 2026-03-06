import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform, Image, Linking } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useLocationSelection } from '../context/LocationContext';
import styles from '../styles/styles';

let MapView = null;
let Marker = null;
if (Platform.OS !== 'web') {
  try {
    // eslint-disable-next-line global-require
    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Marker = Maps.Marker;
  } catch {
    MapView = null;
    Marker = null;
  }
}

export default function MapSelectScreen({ route, navigation }) {
  const initial = route?.params?.initial || {};
  const { setSelectedLocation } = useLocationSelection();

  const autoCenteredOnce = useRef(false);

  const [loading, setLoading] = useState(true);
  const [latitude, setLatitude] = useState(initial.latitude ? String(initial.latitude) : '');
  const [longitude, setLongitude] = useState(initial.longitude ? String(initial.longitude) : '');
  const [address, setAddress] = useState(initial.address || '');
  const [addressTouched, setAddressTouched] = useState(false);

  const makeRegion = useMemo(
    () => (lat, lon) => ({
      latitude: lat,
      longitude: lon,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }),
    []
  );

  const [mapRegion, setMapRegion] = useState(() => {
    const initLat = Number(initial.latitude);
    const initLon = Number(initial.longitude);
    if (Number.isFinite(initLat) && Number.isFinite(initLon)) {
      return makeRegion(initLat, initLon);
    }
    // Default to Chennai region when no initial coords.
    return makeRegion(13.0827, 80.2707);
  });

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (mounted) setLoading(false);
          return;
        }

        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (!mounted) return;

        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setLatitude((prev) => prev || String(lat));
        setLongitude((prev) => prev || String(lon));

        // If no initial coords were provided, center the map once to the device location.
        const initLat = Number(initial.latitude);
        const initLon = Number(initial.longitude);
        const hasInitialCoords = Number.isFinite(initLat) && Number.isFinite(initLon);
        if (!hasInitialCoords && !autoCenteredOnce.current) {
          setMapRegion(makeRegion(lat, lon));
          autoCenteredOnce.current = true;
        }

        if (!address) {
          try {
            const reversed = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
            const first = reversed?.[0];
            if (first) {
              const pretty = [first.name, first.street, first.city, first.region, first.postalCode]
                .filter(Boolean)
                .join(', ');
              setAddress(pretty);
            }
          } catch {
            // ignore reverse geocode failures
          }
        }
      } catch {
        // ignore location failures
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleConfirm = () => {
    const lat = Number(latitude);
    const lon = Number(longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      Alert.alert('Error', 'Please provide valid latitude and longitude');
      return;
    }

    if (!address.trim()) {
      Alert.alert('Error', 'Please enter an address');
      return;
    }

    setSelectedLocation({ latitude: lat, longitude: lon, address: address.trim() });

    navigation.goBack();
  };

  const latNum = Number(latitude);
  const lonNum = Number(longitude);
  const hasCoords = Number.isFinite(latNum) && Number.isFinite(lonNum);

  const tryReverseGeocode = async (lat, lon) => {
    if (addressTouched) return;
    try {
      const reversed = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
      const first = reversed?.[0];
      if (first) {
        const pretty = [first.name, first.street, first.city, first.region, first.postalCode]
          .filter(Boolean)
          .join(', ');
        if (pretty) setAddress(pretty);
      }
    } catch {
      // ignore reverse geocode failures
    }
  };

  const applyPickedCoords = async (lat, lon) => {
    setLatitude(String(lat));
    setLongitude(String(lon));
    setMapRegion(makeRegion(lat, lon));
    await tryReverseGeocode(lat, lon);
  };

  // Lightweight “original map” preview without adding native map dependencies.
  // Uses OpenStreetMap static map endpoint.
  const staticMapUrl = hasCoords
    ? `https://staticmap.openstreetmap.de/staticmap.php?center=${latNum},${lonNum}&zoom=16&size=640x320&maptype=mapnik&markers=${latNum},${lonNum},lightorange1`
    : null;

  const openInMaps = async () => {
    if (!hasCoords) {
      Alert.alert('Location missing', 'Enter latitude and longitude first.');
      return;
    }
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${latNum},${lonNum}`)}`;
    const can = await Linking.canOpenURL(url);
    if (can) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Unable to open maps', url);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Select Location</Text>
        <Text style={{ fontSize: 16, color: '#fff', textAlign: 'center', marginTop: 8 }}>
          Enter details or use your current location
        </Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ff7a00" />
                <Text style={styles.loadingText}>Getting your location...</Text>
              </View>
            ) : null}

            <Text style={styles.label}>Address *</Text>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={(v) => {
                setAddressTouched(true);
                setAddress(v);
              }}
              placeholder="Enter address"
            />

            {/* Map preview */}
            <View style={{ marginTop: 12 }}>
              <Text style={styles.label}>Map Preview</Text>
              {MapView ? (
                <View
                  style={{
                    borderRadius: 14,
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderColor: 'rgba(15,23,42,0.10)',
                    backgroundColor: '#FFF7F0',
                  }}
                >
                  <MapView
                    style={{ width: '100%', height: 190 }}
                    initialRegion={mapRegion}
                    region={mapRegion}
                    onPress={(e) => {
                      const { latitude: lat, longitude: lon } = e.nativeEvent.coordinate;
                      applyPickedCoords(lat, lon);
                    }}
                  >
                    {hasCoords && Marker ? (
                      <Marker
                        coordinate={{ latitude: latNum, longitude: lonNum }}
                        draggable
                        onDragEnd={(e) => {
                          const { latitude: lat, longitude: lon } = e.nativeEvent.coordinate;
                          applyPickedCoords(lat, lon);
                        }}
                      />
                    ) : null}
                  </MapView>
                </View>
              ) : staticMapUrl ? (
                <View style={{ borderRadius: 14, overflow: 'hidden' }}>
                  <Image
                    source={{ uri: staticMapUrl }}
                    style={{ width: '100%', height: 190, backgroundColor: '#FFF7F0' }}
                    resizeMode="cover"
                  />
                </View>
              ) : (
                <View
                  style={{
                    width: '100%',
                    height: 190,
                    borderRadius: 14,
                    backgroundColor: '#FFFFFF',
                    borderWidth: 1,
                    borderColor: 'rgba(15,23,42,0.10)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 14,
                  }}
                >
                  <Text style={{ textAlign: 'center', color: 'rgba(15,23,42,0.62)', fontWeight: '800' }}>
                    Tap the map to pick a location
                  </Text>
                </View>
              )}

              {/* Neat “tap to pick location” hint row */}
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                  if (MapView) {
                    Alert.alert('Pick Location', 'Tap anywhere on the map to drop the pin. You can also drag the pin to fine-tune.');
                    return;
                  }
                  openInMaps();
                }}
                style={{
                  marginTop: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  borderRadius: 14,
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderColor: 'rgba(255,122,0,0.40)',
                  backgroundColor: '#FFF7F0',
                }}
              >
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 999,
                    backgroundColor: '#ff7a00',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MaterialIcons name="place" size={18} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '900', color: 'rgba(15,23,42,0.92)' }}>
                    Tap to pick location
                  </Text>
                  <Text style={{ marginTop: 2, color: 'rgba(15,23,42,0.62)', fontWeight: '700' }}>
                    {MapView ? 'Tap the map or drag the pin' : 'Open full map to choose'}
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="rgba(15,23,42,0.55)" />
              </TouchableOpacity>

              {/* Selected coords preview */}
              <View
                style={{
                  marginTop: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: 'rgba(15,23,42,0.10)',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 14,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                  }}
                >
                  <Text style={{ color: 'rgba(15,23,42,0.62)', fontWeight: '800', fontSize: 12 }}>Latitude</Text>
                  <Text style={{ marginTop: 2, color: 'rgba(15,23,42,0.92)', fontWeight: '900' }}>
                    {hasCoords ? latNum.toFixed(6) : '—'}
                  </Text>
                </View>

                <View
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: 'rgba(15,23,42,0.10)',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 14,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                  }}
                >
                  <Text style={{ color: 'rgba(15,23,42,0.62)', fontWeight: '800', fontSize: 12 }}>Longitude</Text>
                  <Text style={{ marginTop: 2, color: 'rgba(15,23,42,0.92)', fontWeight: '900' }}>
                    {hasCoords ? lonNum.toFixed(6) : '—'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary, { marginTop: 10 }]}
                onPress={openInMaps}
              >
                <Text style={styles.buttonTextOnDark}>Open Full Map</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Latitude *</Text>
            <TextInput
              style={styles.input}
              value={latitude}
              onChangeText={setLatitude}
              placeholder="e.g. 10.12345"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Longitude *</Text>
            <TextInput
              style={styles.input}
              value={longitude}
              onChangeText={setLongitude}
              placeholder="e.g. 78.12345"
              keyboardType="numeric"
            />

            <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={handleConfirm}>
              <Text style={styles.buttonTextOnDark}>Use This Location</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonDanger]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
