import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/apiService';
import styles from '../../styles/styles';
import { PREMIUM_LIGHT } from '../../styles/tokens';
import Entrance from '../../components/Entrance';
import AnimatedPressable from '../../components/AnimatedPressable';

const DriverHome = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    todayWork: {
      total: 0,
      completed: 0,
      inProgress: 0,
      pending: 0
    },
    recentAssignments: [],
    totalEarningsToday: 0
  });

  const { user } = useAuth();

  const fetchDriverDashboard = async () => {
    try {
      setLoading(true);
      if (!user?.id) {
        setDashboardData({
          todayWork: { total: 0, completed: 0, inProgress: 0, pending: 0 },
          recentAssignments: [],
          totalEarningsToday: 0,
        });
        return;
      }
      const response = await apiService.getDriverDashboard(user.id);
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Error fetching driver dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDriverDashboard();
    }, [user?.id])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDriverDashboard();
    setRefreshing(false);
  };

  const renderTodayWork = () => (
    <View style={[styles.card, { marginTop: 16 }]}>
      <Text style={styles.title}>Today's Work</Text>
      <View style={localStyles.statsGrid}>
        {[
          { label: 'Total', value: dashboardData.todayWork.total },
          { label: 'Completed', value: dashboardData.todayWork.completed },
          { label: 'In Progress', value: dashboardData.todayWork.inProgress },
          { label: 'Pending', value: dashboardData.todayWork.pending },
        ].map((s) => (
          <View key={s.label} style={localStyles.statsCard}>
            <Text style={styles.statisticValue}>{s.value}</Text>
            <Text style={styles.statisticLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.workRequestDuration}>
        💰 Today's Earnings: ₹{dashboardData.totalEarningsToday}
      </Text>
    </View>
  );

  const renderRecentAssignments = () => (
    <View style={styles.card}>
      <Text style={styles.title}>Recent Assignments</Text>
      {dashboardData.recentAssignments.length > 0 ? (
        dashboardData.recentAssignments.slice(0, 3).map((assignment, index) => (
          <View key={assignment._id || String(index)} style={styles.row}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.workRequestType} numberOfLines={1}>
                {assignment.workRequest?.workType || 'Work'}
              </Text>
              <Text style={styles.workRequestLocation} numberOfLines={1}>
                📍 {assignment.workRequest?.location?.address || 'Address not available'}
              </Text>
            </View>
            <View style={localStyles.statusPill}>
              <Text style={localStyles.statusPillText} numberOfLines={1}>
                {assignment.status}
              </Text>
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.emptyStateText}>No recent assignments</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Entrance>
        <View style={[styles.header, { marginTop: 40 }]}>
          <Text style={styles.headerTitle}>Driver Portal</Text>
          <Text style={{ fontSize: 16, color: PREMIUM_LIGHT.muted, textAlign: 'center', marginTop: 8 }}>
            Welcome back, {user.name}
          </Text>
        </View>
      </Entrance>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Entrance delay={90}>{renderTodayWork()}</Entrance>
        <Entrance delay={140}>{renderRecentAssignments()}</Entrance>

        <View style={{ marginTop: 32 }}>
          <Entrance delay={200}>
            <AnimatedPressable
              style={[styles.button, styles.buttonSecondary]}
              onPress={() => navigation.navigate('DriverWorkList')}
            >
              <Text style={styles.buttonTextOnDark}>View All Work</Text>
            </AnimatedPressable>
          </Entrance>
          
          <Entrance delay={240}>
            <AnimatedPressable
              style={[styles.button, styles.buttonSecondary]}
              onPress={() => navigation.navigate('DriverComplaint')}
            >
              <Text style={styles.buttonTextOnDark}>Report Issue</Text>
            </AnimatedPressable>
          </Entrance>
        </View>
      </ScrollView>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PREMIUM_LIGHT.accent} />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      )}
    </View>
  );
};

const localStyles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginTop: 10,
  },
  statsCard: {
    width: '50%',
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  statusPill: {
    backgroundColor: PREMIUM_LIGHT.accentSoft,
    borderWidth: 1,
    borderColor: PREMIUM_LIGHT.border,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusPillText: {
    color: PREMIUM_LIGHT.accent,
    fontWeight: '800',
    fontSize: 12,
  },
});

export default DriverHome;