import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/apiService';
import styles from '../../styles/styles';
import { PREMIUM_LIGHT } from '../../styles/tokens';
import Entrance from '../../components/Entrance';

const DriverComplaintMainScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [complaintStats, setComplaintStats] = useState({
    reported: 0,
    inProgress: 0,
    resolved: 0
  });
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchComplaintStats();
    }, [user?.id])
  );

  const fetchComplaintStats = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDriverComplaints(user?.id);
      if (response?.data?.success) {
        const complaints = response.data.data || [];
        setComplaintStats({
          reported: complaints.filter(c => c.status === 'REPORTED').length,
          inProgress: complaints.filter(c => c.status === 'IN_PROGRESS').length,
          resolved: complaints.filter(c => c.status === 'RESOLVED').length
        });
      }
    } catch (error) {
      console.error('Error fetching complaint stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Complaints</Text>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16 }}>
        {/* Welcome Message */}
        <Entrance fromY={-20} duration={300}>
          <View style={localStyles.welcomeCard}>
            <MaterialIcons name="report" size={40} color={PREMIUM_LIGHT.accent} />
            <Text style={localStyles.welcomeTitle}>Vehicle Issue Reporting</Text>
            <Text style={localStyles.welcomeSubtitle}>
              Report any mechanical or electrical issues with your assigned vehicles
            </Text>
          </View>
        </Entrance>

        {/* Stats Section */}
        {!loading && (
          <Entrance fromY={-20} duration={350} delay={50}>
            <View style={localStyles.statsGrid}>
              <View style={[localStyles.statBox, { borderLeftColor: '#FF6B6B' }]}>
                <MaterialIcons name="new-releases" size={28} color="#FF6B6B" />
                <Text style={localStyles.statNumber}>{complaintStats.reported}</Text>
                <Text style={localStyles.statLabel}>Reported</Text>
              </View>
              <View style={[localStyles.statBox, { borderLeftColor: '#FFB800' }]}>
                <MaterialIcons name="hourglass-empty" size={28} color="#FFB800" />
                <Text style={localStyles.statNumber}>{complaintStats.inProgress}</Text>
                <Text style={localStyles.statLabel}>In Progress</Text>
              </View>
              <View style={[localStyles.statBox, { borderLeftColor: '#51CF66' }]}>
                <MaterialIcons name="check-circle" size={28} color="#51CF66" />
                <Text style={localStyles.statNumber}>{complaintStats.resolved}</Text>
                <Text style={localStyles.statLabel}>Resolved</Text>
              </View>
            </View>
          </Entrance>
        )}

        {/* Action Buttons */}
        <Entrance fromY={-20} duration={350} delay={100}>
          <View style={localStyles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, { marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}
              onPress={() => navigation.navigate('SubmitComplaint')}
            >
              <MaterialIcons name="add-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={[styles.buttonTextOnDark, { color: '#fff', fontWeight: '600' }]}>Report New Issue</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={() => navigation.navigate('DriverComplaintsHistory')}
            >
              <MaterialIcons name="history" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.buttonTextOnDark}>View Complaint History</Text>
            </TouchableOpacity>
          </View>
        </Entrance>

        {/* Info Card */}
        <Entrance fromY={-20} duration={350} delay={150}>
          <View style={styles.card}>
            <View style={localStyles.infoHeader}>
              <MaterialIcons name="info" size={24} color={PREMIUM_LIGHT.accent} />
              <Text style={localStyles.infoTitle}>How to Report a Complaint</Text>
            </View>
            <View style={localStyles.infoSteps}>
              <View style={localStyles.step}>
                <View style={localStyles.stepNumber}>
                  <Text style={localStyles.stepNumberText}>1</Text>
                </View>
                <Text style={localStyles.stepText}>Tap "Report New Issue"</Text>
              </View>
              <View style={localStyles.step}>
                <View style={localStyles.stepNumber}>
                  <Text style={localStyles.stepNumberText}>2</Text>
                </View>
                <Text style={localStyles.stepText}>Select vehicle and issue type</Text>
              </View>
              <View style={localStyles.step}>
                <View style={localStyles.stepNumber}>
                  <Text style={localStyles.stepNumberText}>3</Text>
                </View>
                <Text style={localStyles.stepText}>Provide detailed description</Text>
              </View>
              <View style={localStyles.step}>
                <View style={localStyles.stepNumber}>
                  <Text style={localStyles.stepNumberText}>4</Text>
                </View>
                <Text style={localStyles.stepText}>Track status in complaint history</Text>
              </View>
            </View>
          </View>
        </Entrance>

        {/* Support Card */}
        <Entrance fromY={-20} duration={350} delay={200}>
          <View style={[styles.card, { backgroundColor: PREMIUM_LIGHT.accentSoft, marginTop: 12 }]}>
            <View style={localStyles.supportHeader}>
              <MaterialIcons name="contact-support" size={24} color={PREMIUM_LIGHT.accent} />
              <Text style={localStyles.supportTitle}>Need Help?</Text>
            </View>
            <Text style={localStyles.supportText}>
              If you have urgent vehicle issues, contact your supervisor immediately.
            </Text>
            <TouchableOpacity style={localStyles.supportLink}>
              <Text style={localStyles.supportLinkText}>Contact Support →</Text>
            </TouchableOpacity>
          </View>
        </Entrance>
      </ScrollView>
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  welcomeCard: {
    backgroundColor: PREMIUM_LIGHT.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: PREMIUM_LIGHT.border
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: PREMIUM_LIGHT.text,
    marginTop: 12
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: PREMIUM_LIGHT.muted,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 18
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24
  },
  statBox: {
    flex: 1,
    backgroundColor: PREMIUM_LIGHT.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: PREMIUM_LIGHT.border
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: PREMIUM_LIGHT.text,
    marginTop: 8
  },
  statLabel: {
    fontSize: 11,
    color: PREMIUM_LIGHT.muted,
    fontWeight: '600',
    marginTop: 4
  },
  buttonContainer: {
    marginBottom: 24
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: PREMIUM_LIGHT.text
  },
  infoSteps: {
    gap: 12
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: PREMIUM_LIGHT.accent,
    justifyContent: 'center',
    alignItems: 'center'
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff'
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    color: PREMIUM_LIGHT.text,
    fontWeight: '500',
    marginTop: 6
  },
  supportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: PREMIUM_LIGHT.accent
  },
  supportText: {
    fontSize: 13,
    color: PREMIUM_LIGHT.text,
    lineHeight: 18,
    marginBottom: 12
  },
  supportLink: {
    paddingTop: 8
  },
  supportLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: PREMIUM_LIGHT.accent
  }
});

export default DriverComplaintMainScreen;
