import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppColors } from '@/theme/ThemeProvider';
import { getUserEmergencyAlerts, respondToEmergencyAlert } from '@/utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLoginState } from '@/utils/auth';

interface EmergencyAlert {
  _id: string;
  emergencyUserId: string;
  emergencyType: 'medical' | 'accident' | 'blood' | 'pharmacy';
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  emergencyUserInfo: {
    name?: string;
    phone?: string;
    location: { lat: number; lng: number; address?: string };
  };
  resourceInfo: {
    resourceId: string;
    resourceName: string;
    distance: number;
  };
  message: string;
  status: 'sent' | 'viewed' | 'acknowledged' | 'declined' | 'expired';
  isRead: boolean;
  createdAt: string;
  expiresAt: string;
}

export default function EmergencyAlertsScreen() {
  const navigation = useNavigation();
  const colors = useAppColors();
  const styles = createStyles(colors);
  
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [responding, setResponding] = useState<string | null>(null);

  const loadAlerts = async () => {
    try {
      // Get the logged-in user's phone number
      const loginState = await getLoginState();
      if (!loginState?.phone) {
        console.warn('No logged-in user found');
        return;
      }

      // Use phone number as userId to match service provider records
      const response = await getUserEmergencyAlerts(loginState.phone, 'all', 50);
      
      if (response.success) {
        setAlerts(response.data.alerts || []);
        console.log(`Loaded ${response.data.alerts?.length || 0} emergency alerts for ${loginState.phone}`);
      }
    } catch (error) {
      console.error('Failed to load emergency alerts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAlerts();
  };

  useEffect(() => {
    loadAlerts();
    
    // Auto-refresh every 30 seconds for new alerts
    const interval = setInterval(loadAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRespond = async (alertId: string, canRespond: boolean, estimatedArrival?: string) => {
    try {
      setResponding(alertId);
      
      const responseMessage = canRespond 
        ? 'Medical team is on the way. Please stay calm.'
        : 'Currently unavailable. Alerting other nearby providers.';
      
      await respondToEmergencyAlert(alertId, {
        canRespond,
        estimatedArrival,
        responseMessage
      });
      
      // Update local state
      setAlerts(prev => prev.map(alert => 
        alert._id === alertId 
          ? { ...alert, status: canRespond ? 'acknowledged' : 'declined', isRead: true }
          : alert
      ));
      
      Alert.alert(
        'Response Sent',
        canRespond 
          ? 'You have confirmed assistance. Please proceed to the emergency location.'
          : 'Response recorded. Other providers will be notified.',
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('Failed to respond to alert:', error);
      Alert.alert('Error', 'Failed to send response. Please try again.');
    } finally {
      setResponding(null);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#d97706';
      case 'low': return '#65a30d';
      default: return colors.textSecondary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'acknowledged': return '#16a34a';
      case 'declined': return '#dc2626';
      case 'viewed': return '#2563eb';
      case 'expired': return '#6b7280';
      default: return '#f59e0b';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const renderAlert = ({ item }: { item: EmergencyAlert }) => (
    <View style={[styles.alertCard, !item.isRead && styles.unreadAlert]}>
      <View style={styles.alertHeader}>
        <View style={styles.alertInfo}>
          <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(item.urgencyLevel) }]}>
            <Text style={styles.urgencyText}>{item.urgencyLevel.toUpperCase()}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.timeAgo}>{formatTimeAgo(item.createdAt)}</Text>
      </View>

      <View style={styles.alertContent}>
        <Text style={styles.alertTitle}>
          🚨 {item.emergencyType.charAt(0).toUpperCase() + item.emergencyType.slice(1)} Emergency
        </Text>
        <Text style={styles.alertMessage}>{item.message}</Text>
        
        <View style={styles.locationInfo}>
          <Ionicons name="location" size={16} color={colors.primary} />
          <Text style={styles.locationText}>
            {item.resourceInfo.distance.toFixed(1)}km from {item.resourceInfo.resourceName}
          </Text>
        </View>

        {item.emergencyUserInfo.phone && (
          <View style={styles.contactInfo}>
            <Ionicons name="call" size={16} color={colors.primary} />
            <Text style={styles.contactText}>Patient: {item.emergencyUserInfo.phone}</Text>
          </View>
        )}
      </View>

      <View style={styles.alertActions}>
        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => {
            const { lat, lng } = item.emergencyUserInfo.location;
            const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
            Linking.openURL(mapsUrl);
          }}
        >
          <Ionicons name="map" size={16} color="#fff" />
          <Text style={styles.mapButtonText}>Directions</Text>
        </TouchableOpacity>

        {item.emergencyUserInfo.phone && (
          <TouchableOpacity
            style={styles.callButton}
            onPress={() => Linking.openURL(`tel:${item.emergencyUserInfo.phone}`)}
          >
            <Ionicons name="call" size={16} color="#fff" />
            <Text style={styles.callButtonText}>Call Patient</Text>
          </TouchableOpacity>
        )}

        {item.status === 'sent' || item.status === 'viewed' ? (
          <View style={styles.responseButtons}>
            <TouchableOpacity
              style={[styles.responseButton, styles.acceptButton]}
              onPress={() => handleRespond(item._id, true, '15 minutes')}
              disabled={responding === item._id}
            >
              {responding === item._id ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                  <Text style={styles.responseButtonText}>Accept</Text>
                </>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.responseButton, styles.declineButton]}
              onPress={() => handleRespond(item._id, false)}
              disabled={responding === item._id}
            >
              <Ionicons name="close" size={16} color="#fff" />
              <Text style={styles.responseButtonText}>Decline</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.statusIndicator}>
            <Text style={[styles.statusIndicatorText, { color: getStatusColor(item.status) }]}>
              {item.status === 'acknowledged' ? '✅ Accepted' : 
               item.status === 'declined' ? '❌ Declined' : 
               item.status === 'expired' ? '⏰ Expired' : '👁️ Viewed'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading emergency alerts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency Alerts</Text>
        <TouchableOpacity onPress={loadAlerts} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {alerts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="medical" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>No Emergency Alerts</Text>
          <Text style={styles.emptySubtitle}>
            You'll receive notifications here when emergency assistance is needed in your area.
          </Text>
        </View>
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={(item) => item._id}
          renderItem={renderAlert}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  backButton: {
    padding: 4
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary
  },
  refreshButton: {
    padding: 4
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20
  },
  listContent: {
    padding: 16
  },
  alertCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  unreadAlert: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  alertInfo: {
    flexDirection: 'row',
    gap: 8
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff'
  },
  timeAgo: {
    fontSize: 12,
    color: colors.textSecondary
  },
  alertContent: {
    marginBottom: 16
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8
  },
  alertMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  locationText: {
    fontSize: 14,
    color: colors.textPrimary,
    marginLeft: 8
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  contactText: {
    fontSize: 14,
    color: colors.textPrimary,
    marginLeft: 8
  },
  alertActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap'
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4
  },
  mapButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff'
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16a34a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4
  },
  callButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff'
  },
  responseButtons: {
    flexDirection: 'row',
    gap: 8,
    flex: 1
  },
  responseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
    flex: 1,
    justifyContent: 'center'
  },
  acceptButton: {
    backgroundColor: '#16a34a'
  },
  declineButton: {
    backgroundColor: '#dc2626'
  },
  responseButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff'
  },
  statusIndicator: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  statusIndicatorText: {
    fontSize: 14,
    fontWeight: '600'
  }
});