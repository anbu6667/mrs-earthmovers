import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Linking } from 'react-native';
import styles from '../styles/styles';
import apiService from '../services/apiService';


export default function PaymentScreen({ route, navigation }) {
  const workRequestId = route?.params?.workRequestId;
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState([]);
  const [amount, setAmount] = useState(0);
  const [upiId] = useState('rajgeetha834@okicici');
  // Remove showQR state, not needed

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      // Replace with your API endpoint to fetch payment history for the user
      const response = await apiService.getPaymentsByCustomer();
      setPayments(response.data.data || []);
    } catch (e) {
      Alert.alert('Error', 'Could not fetch payment history');
    }
    setLoading(false);
  };



  return (
    <View style={styles.container}>
      <View style={[styles.header, { marginTop: 24 }]}> {/* Added marginTop to move header down */}
        <Text style={styles.headerTitle}>Make a Payment</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>Scan QR to Pay (UPI)</Text>
        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => {
            // UPI deep link for GPay or any UPI app
            const upiUrl = `upi://pay?pa=${upiId}&pn=MRS%20Earthmovers&am=${amount || ''}&cu=INR&tn=Work%20Payment`;
            Linking.openURL(upiUrl);
          }}
        >
          <Text style={styles.buttonTextOnDark}>Scan QR</Text>
        </TouchableOpacity>
        <Text style={styles.subtitle}>UPI ID: {upiId}</Text>
        <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={fetchPayments}>
          <Text style={styles.buttonTextOnDark}>Refresh Payment History</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>Other Payment Methods</Text>
        <Text style={styles.subtitle}>Cash or Bank Transfer available at office.</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>Payment History</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#4CAF50" />
        ) : (
          <FlatList
            data={payments}
            keyExtractor={item => item._id}
            renderItem={({ item }) => (
              <View style={{ marginBottom: 10 }}>
                <Text>Date: {new Date(item.createdAt).toLocaleString()}</Text>
                <Text>Amount: ₹{item.amount}</Text>
                <Text>Method: {item.paymentMethod}</Text>
                <Text>Status: {item.status}</Text>
              </View>
            )}
            ListEmptyComponent={<Text>No payments found.</Text>}
          />
        )}
      </View>
    </View>
  );
}
