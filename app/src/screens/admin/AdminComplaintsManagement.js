import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  ScrollView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import apiService from '../../services/apiService';
import styles from '../../styles/styles';
import { PREMIUM_LIGHT } from '../../styles/tokens';
import Entrance from '../../components/Entrance';

const AdminComplaintsManagementScreen = ({ navigation }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [assignedMechanic, setAssignedMechanic] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');

  useFocusEffect(
    useCallback(() => {
      fetchComplaints();
    }, [fetchComplaints])
  );

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getComplaints({ page: 1, limit: 100 });
      if (response?.data?.success) {
        setComplaints(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      Alert.alert('Error', 'Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchComplaints();
    setRefreshing(false);
  }, []);

  const getTypeEmoji = (type) => {
    const emojis = {
      BREAKDOWN: '🔧',
      ACCIDENT: '🚨',
      MAINTENANCE_ISSUE: '⚙️',
      FUEL_PROBLEM: '⛽',
      OTHER: '📝',
      // Fallback for old types
      MECHANICAL: '⚙️',
      ELECTRICAL: '⚡',
      BODY_DAMAGE: '🚗',
      TIRE_ISSUE: '🛞',
      FUEL_SYSTEM: '⛽',
      BRAKE_SYSTEM: '🛑'
    };
    return emojis[type] || '❓';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'REPORTED':
        return '#FF6B6B';
      case 'IN_PROGRESS':
        return '#FFB800';
      case 'RESOLVED':
        return '#51CF66';
      case 'CANCELLED':
        return '#868E96';
      default:
        return PREMIUM_LIGHT.muted;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return '#FF4757';
      case 'HIGH':
        return '#FF6B6B';
      case 'MEDIUM':
        return '#FFA502';
      case 'LOW':
        return '#FFD93D';
      default:
        return '#95E1D3';
    }
  };

  const handleUpdateComplaint = async () => {
    if (!selectedComplaint) return;

    if (!newStatus) {
      Alert.alert('Error', 'Please select a status');
      return;
    }

    try {
      setModalLoading(true);
      const updateData = {
        status: newStatus,
        ...(notes && { notes }),
        ...(assignedMechanic && { assignedMechanic }),
        ...(estimatedTime && { estimatedResolutionTime: parseInt(estimatedTime) })
      };

      const response = await apiService.updateComplaintStatus(selectedComplaint._id, updateData);
      if (response?.data?.success) {
        Alert.alert('Success', 'Complaint updated successfully');
        setShowModal(false);
        resetModalFields();
        await fetchComplaints();
      }
    } catch (error) {
      console.error('Error updating complaint:', error);
      Alert.alert('Error', error?.response?.data?.message || 'Failed to update complaint');
    } finally {
      setModalLoading(false);
    }
  };

  const resetModalFields = () => {
    setNotes('');
    setAssignedMechanic('');
    setNewStatus('');
    setEstimatedTime('');
    setSelectedComplaint(null);
  };

  const openUpdateModal = (complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status);
    setNotes(complaint.notes || '');
    setAssignedMechanic(complaint.assignedMechanic || '');
    setEstimatedTime(complaint.estimatedResolutionTime?.toString() || '');
    setShowModal(true);
  };

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesFilter = filter === 'ALL' ? true : complaint.status === filter;
    const matchesSearch =
      complaint.vehicle?.vehicleNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.driver?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const renderComplaintCard = ({ item }) => (
    <TouchableOpacity
      style={localStyles.card}
      activeOpacity={0.7}
      onPress={() => openUpdateModal(item)}
    >
      <View style={localStyles.cardHeader}>
        <View style={localStyles.typeSection}>
          <Text style={localStyles.emoji}>{getTypeEmoji(item.type)}</Text>
          <View>
            <Text style={localStyles.vehicleNumber}>{item.vehicle?.vehicleNumber}</Text>
            <Text style={localStyles.driverName}>{item.driver?.name}</Text>
          </View>
        </View>
        <View
          style={[
            localStyles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + '20', borderColor: getStatusColor(item.status) }
          ]}
        >
          <Text style={[localStyles.statusBadgeText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <Text style={localStyles.description}>{item.description}</Text>

      <View style={localStyles.cardFooter}>
        <View style={localStyles.footerItem}>
          <View
            style={[
              localStyles.severityBadge,
              { backgroundColor: getSeverityColor(item.severity) }
            ]}
          >
            <Text style={localStyles.severityText}>{item.severity}</Text>
          </View>
        </View>
        <View style={localStyles.footerItem}>
          <MaterialIcons name="access-time" size={14} color={PREMIUM_LIGHT.muted} />
          <Text style={localStyles.dateText}>{formatDate(item.reportedAt)}</Text>
        </View>
      </View>

      {item.assignedMechanic && (
        <View style={localStyles.mechanicSection}>
          <MaterialIcons name="person" size={14} color={PREMIUM_LIGHT.accent} />
          <Text style={localStyles.mechanicText}>{item.assignedMechanic}</Text>
        </View>
      )}

      <View style={localStyles.editHint}>
        <MaterialIcons name="edit" size={14} color={PREMIUM_LIGHT.accent} />
        <Text style={localStyles.editHintText}>Tap to manage</Text>
      </View>
    </TouchableOpacity>
  );

  const stats = {
    total: complaints.length,
    reported: complaints.filter((c) => c.status === 'REPORTED').length,
    inProgress: complaints.filter((c) => c.status === 'IN_PROGRESS').length,
    resolved: complaints.filter((c) => c.status === 'RESOLVED').length,
    cancelled: complaints.filter((c) => c.status === 'CANCELLED').length,
    critical: complaints.filter((c) => c.severity === 'CRITICAL').length
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Complaints Management</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PREMIUM_LIGHT.accent} />
          <Text style={styles.loadingText}>Loading complaints...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Complaints Management</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingTop: 16 }}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
      >
        {/* Stats Cards - Row 1 */}
        <Entrance fromY={-20} duration={300}>
          <View style={localStyles.statsContainer}>
            <View style={[localStyles.statCard, { backgroundColor: '#FF6B6B20' }]}>
              <Text style={[localStyles.statNumber, { color: '#FF6B6B' }]}>{stats.reported}</Text>
              <Text style={localStyles.statLabel}>Reported</Text>
            </View>
            <View style={[localStyles.statCard, { backgroundColor: '#FFB80020' }]}>
              <Text style={[localStyles.statNumber, { color: '#FFB800' }]}>{stats.inProgress}</Text>
              <Text style={localStyles.statLabel}>In Progress</Text>
            </View>
            <View style={[localStyles.statCard, { backgroundColor: '#51CF6620' }]}>
              <Text style={[localStyles.statNumber, { color: '#51CF66' }]}>{stats.resolved}</Text>
              <Text style={localStyles.statLabel}>Resolved</Text>
            </View>
            <View style={[localStyles.statCard, { backgroundColor: '#FF475720' }]}>
              <Text style={[localStyles.statNumber, { color: '#FF4757' }]}>{stats.critical}</Text>
              <Text style={localStyles.statLabel}>Critical</Text>
            </View>
          </View>
        </Entrance>

        {/* Stats Cards - Row 2 */}
        <Entrance fromY={-20} duration={350} delay={50}>
          <View style={localStyles.statsContainer}>
            <View style={[localStyles.statCard, { backgroundColor: '#868E9620' }]}>
              <Text style={[localStyles.statNumber, { color: '#868E96' }]}>{stats.cancelled}</Text>
              <Text style={localStyles.statLabel}>Cancelled</Text>
            </View>
            <View style={[localStyles.statCard, { backgroundColor: '#6C757D20' }]}>
              <Text style={[localStyles.statNumber, { color: '#6C757D' }]}>{stats.total}</Text>
              <Text style={localStyles.statLabel}>Total</Text>
            </View>
          </View>
        </Entrance>

        {/* Search and Filter */}
        <Entrance fromY={-20} duration={350} delay={50}>
          <View style={localStyles.filterSection}>
            <View style={localStyles.searchBox}>
              <MaterialIcons name="search" size={20} color={PREMIUM_LIGHT.muted} />
              <TextInput
                style={localStyles.searchInput}
                placeholder="Search by vehicle, driver, type..."
                placeholderTextColor={PREMIUM_LIGHT.muted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
              {['ALL', 'REPORTED', 'IN_PROGRESS', 'RESOLVED'].map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[
                    localStyles.filterButton,
                    filter === f && localStyles.filterButtonActive
                  ]}
                  onPress={() => setFilter(f)}
                >
                  <Text
                    style={[
                      localStyles.filterButtonText,
                      filter === f && localStyles.filterButtonTextActive
                    ]}
                  >
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Entrance>

        {/* Complaints List */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
          {filteredComplaints.length > 0 ? (
            <FlatList
              data={filteredComplaints}
              renderItem={renderComplaintCard}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            />
          ) : (
            <View style={localStyles.emptyState}>
              <MaterialIcons name="inbox" size={48} color={PREMIUM_LIGHT.muted} />
              <Text style={localStyles.emptyStateText}>No complaints found</Text>
              {searchQuery && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Text style={localStyles.emptyStateLink}>Clear search</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Update Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowModal(false);
          resetModalFields();
        }}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => {
                setShowModal(false);
                resetModalFields();
              }}
            >
              <MaterialIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { flex: 1, marginLeft: 12 }]}>Update Complaint</Text>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
            {selectedComplaint && (
              <>
                {/* Complaint Summary */}
                <Entrance fromY={-20} duration={300}>
                  <View style={styles.card}>
                    <Text style={styles.title}>Complaint Summary</Text>
                    <View style={localStyles.summaryItem}>
                      <Text style={localStyles.summaryLabel}>Vehicle</Text>
                      <Text style={localStyles.summaryValue}>
                        {selectedComplaint.vehicle?.vehicleNumber}
                      </Text>
                    </View>
                    <View style={localStyles.summaryItem}>
                      <Text style={localStyles.summaryLabel}>Driver</Text>
                      <Text style={localStyles.summaryValue}>{selectedComplaint.driver?.name}</Text>
                    </View>
                    <View style={localStyles.summaryItem}>
                      <Text style={localStyles.summaryLabel}>Type</Text>
                      <Text style={localStyles.summaryValue}>
                        {selectedComplaint.type.replace(/_/g, ' ')}
                      </Text>
                    </View>
                    <View style={localStyles.summaryItem}>
                      <Text style={localStyles.summaryLabel}>Description</Text>
                      <Text style={localStyles.summaryValue}>{selectedComplaint.description}</Text>
                    </View>
                  </View>
                </Entrance>

                {/* Status Update */}
                <Entrance fromY={-20} duration={350} delay={50}>
                  <View style={styles.card}>
                    <Text style={styles.title}>Update Status</Text>
                    <Text style={localStyles.inputLabel}>Status</Text>
                    <View style={localStyles.statusOptions}>
                      {['REPORTED', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED'].map((status) => (
                        <TouchableOpacity
                          key={status}
                          style={[
                            localStyles.statusOption,
                            newStatus === status && localStyles.statusOptionActive
                          ]}
                          onPress={() => setNewStatus(status)}
                        >
                          <Text
                            style={[
                              localStyles.statusOptionText,
                              newStatus === status && localStyles.statusOptionTextActive
                            ]}
                          >
                            {status}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </Entrance>

                {/* Mechanic Assignment */}
                {newStatus === 'IN_PROGRESS' && (
                  <Entrance fromY={-20} duration={350} delay={100}>
                    <View style={styles.card}>
                      <Text style={localStyles.inputLabel}>Assigned Mechanic</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Mechanic name"
                        value={assignedMechanic}
                        onChangeText={setAssignedMechanic}
                        placeholderTextColor={PREMIUM_LIGHT.muted}
                      />

                      <Text style={[localStyles.inputLabel, { marginTop: 16 }]}>
                        Estimated Time (minutes)
                      </Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="e.g., 120"
                        keyboardType="number-pad"
                        value={estimatedTime}
                        onChangeText={setEstimatedTime}
                        placeholderTextColor={PREMIUM_LIGHT.muted}
                      />
                    </View>
                  </Entrance>
                )}

                {/* Notes */}
                <Entrance fromY={-20} duration={350} delay={150}>
                  <View style={styles.card}>
                    <Text style={localStyles.inputLabel}>Notes</Text>
                    <TextInput
                      style={[styles.textInput, { minHeight: 100, textAlignVertical: 'top' }]}
                      placeholder="Add notes about this complaint..."
                      multiline
                      value={notes}
                      onChangeText={setNotes}
                      placeholderTextColor={PREMIUM_LIGHT.muted}
                    />
                  </View>
                </Entrance>

                {/* Action Buttons */}
                <View style={localStyles.buttonSection}>
                  <TouchableOpacity
                    style={[styles.button, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}
                    onPress={handleUpdateComplaint}
                    disabled={modalLoading}
                  >
                    {modalLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <MaterialIcons name="check" size={20} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={[styles.buttonTextOnDark, { color: '#fff', fontWeight: '600' }]}>Update Complaint</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.buttonSecondary, { marginTop: 12 }]}
                    onPress={() => {
                      setShowModal(false);
                      resetModalFields();
                    }}
                    disabled={modalLoading}
                  >
                    <Text style={styles.buttonTextOnDark}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16
  },
  statCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700'
  },
  statLabel: {
    fontSize: 11,
    color: PREMIUM_LIGHT.muted,
    fontWeight: '600',
    marginTop: 4
  },
  filterSection: {
    paddingHorizontal: 16,
    marginBottom: 16
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PREMIUM_LIGHT.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: PREMIUM_LIGHT.border
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    color: PREMIUM_LIGHT.text,
    fontSize: 14
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: PREMIUM_LIGHT.surface,
    borderWidth: 1,
    borderColor: PREMIUM_LIGHT.border,
    marginRight: 8
  },
  filterButtonActive: {
    backgroundColor: PREMIUM_LIGHT.accent,
    borderColor: PREMIUM_LIGHT.accent
  },
  filterButtonText: {
    fontSize: 13,
    color: PREMIUM_LIGHT.muted,
    fontWeight: '600'
  },
  filterButtonTextActive: {
    color: '#fff'
  },
  card: {
    backgroundColor: PREMIUM_LIGHT.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PREMIUM_LIGHT.border,
    padding: 14,
    marginBottom: 0
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10
  },
  typeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1
  },
  emoji: {
    fontSize: 28
  },
  vehicleNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: PREMIUM_LIGHT.text
  },
  driverName: {
    fontSize: 12,
    color: PREMIUM_LIGHT.muted,
    marginTop: 2
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700'
  },
  description: {
    fontSize: 13,
    color: PREMIUM_LIGHT.text,
    marginBottom: 10,
    lineHeight: 18
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: PREMIUM_LIGHT.border
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  severityText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'white'
  },
  dateText: {
    fontSize: 11,
    color: PREMIUM_LIGHT.muted
  },
  mechanicSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: PREMIUM_LIGHT.border
  },
  mechanicText: {
    fontSize: 12,
    color: PREMIUM_LIGHT.accent,
    fontWeight: '600'
  },
  editHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    justifyContent: 'center'
  },
  editHintText: {
    fontSize: 11,
    color: PREMIUM_LIGHT.accent,
    fontWeight: '600'
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60
  },
  emptyStateText: {
    fontSize: 16,
    color: PREMIUM_LIGHT.muted,
    marginTop: 12,
    fontWeight: '600'
  },
  emptyStateLink: {
    fontSize: 13,
    color: PREMIUM_LIGHT.accent,
    marginTop: 12,
    fontWeight: '600'
  },
  summaryItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: PREMIUM_LIGHT.border
  },
  summaryLabel: {
    fontSize: 12,
    color: PREMIUM_LIGHT.muted,
    fontWeight: '600'
  },
  summaryValue: {
    fontSize: 14,
    color: PREMIUM_LIGHT.text,
    fontWeight: '500',
    marginTop: 4
  },
  inputLabel: {
    fontSize: 13,
    color: PREMIUM_LIGHT.text,
    fontWeight: '600',
    marginBottom: 10
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  statusOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: PREMIUM_LIGHT.surface,
    borderWidth: 1,
    borderColor: PREMIUM_LIGHT.border
  },
  statusOptionActive: {
    backgroundColor: PREMIUM_LIGHT.accent,
    borderColor: PREMIUM_LIGHT.accent
  },
  statusOptionText: {
    fontSize: 12,
    color: PREMIUM_LIGHT.muted,
    fontWeight: '600'
  },
  statusOptionTextActive: {
    color: '#fff'
  },
  buttonSection: {
    paddingHorizontal: 16,
    paddingTop: 8
  }
});

export default AdminComplaintsManagementScreen;
