import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from '../styles/styles';

export default function InvoiceScreen({ route, navigation }) {
  const workRequestId = route?.params?.workRequestId;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Invoice</Text>
        <Text style={{ fontSize: 16, color: '#fff', textAlign: 'center', marginTop: 8 }}>
          {workRequestId ? `Work Request: ${workRequestId}` : 'Work Request not provided'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Coming Soon</Text>
        <Text style={styles.subtitle}>
          Invoice view is not implemented yet.
        </Text>

        <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonTextOnDark}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
