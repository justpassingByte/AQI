import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Appbar, Button, Card, Chip, Divider, IconButton, Switch, Text } from 'react-native-paper';
import { useAirQuality } from '../contexts/AirQualityContext';
import { useTheme } from '../contexts/ThemeContext';

// Sample notifications data structure
type NotificationType = 'warning' | 'info' | 'danger' | 'success';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: Date;
  read: boolean;
  actionable: boolean;
  location?: string;
}

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const { currentReading } = useAirQuality();
  const { isDarkMode, theme } = useTheme();
  
  // Notification preferences
  const [highPollutantAlerts, setHighPollutantAlerts] = useState(true);
  const [dailySummaries, setDailySummaries] = useState(true);
  const [locationAlerts, setLocationAlerts] = useState(true);
  
  // Sample notifications - in a real app, these would come from a backend or local storage
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'High PM2.5 Levels Detected',
      message: 'PM2.5 levels have exceeded 35μg/m³ in your area. Consider wearing a mask if going outside.',
      type: 'warning',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: false,
      actionable: true,
      location: 'Current Location'
    },
    {
      id: '2',
      title: 'Air Quality Summary',
      message: 'Today\'s air quality has been generally good with an average AQI of 42.',
      type: 'info',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
      read: true,
      actionable: false
    },
    {
      id: '3',
      title: 'Ozone Level Alert',
      message: 'Ozone levels are elevated. Sensitive groups should limit outdoor activities.',
      type: 'danger',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      read: true,
      actionable: true,
      location: 'Downtown Area'
    },
    {
      id: '4',
      title: 'Air Quality Improving',
      message: 'Air quality in your area has improved in the last 24 hours.',
      type: 'success',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36), // 1.5 days ago
      read: true,
      actionable: false
    }
  ]);

  // Generate real-time notification if air quality is poor
  React.useEffect(() => {
    if (currentReading && currentReading.pollutants.aqi > 100 && highPollutantAlerts) {
      const existingAlert = notifications.find(n => 
        n.title === 'Current Air Quality Alert' && 
        new Date().getTime() - n.timestamp.getTime() < 1000 * 60 * 60 * 3 // Within last 3 hours
      );
      
      if (!existingAlert) {
        const newNotification: Notification = {
          id: Date.now().toString(),
          title: 'Current Air Quality Alert',
          message: `The current AQI of ${Math.round(currentReading.pollutants.aqi)} is unhealthy. Consider limiting outdoor activities.`,
          type: 'danger',
          timestamp: new Date(),
          read: false,
          actionable: true,
          location: currentReading.location.name
        };
        
        setNotifications(prev => [newNotification, ...prev]);
      }
    }
  }, [currentReading, highPollutantAlerts]);

  // Mark a notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  // Delete a notification
  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Get icon based on notification type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'warning':
        return { name: 'exclamation-triangle', color: '#FF9800' };
      case 'info':
        return { name: 'info-circle', color: '#2196F3' };
      case 'danger':
        return { name: 'radiation-alt', color: '#F44336' };
      case 'success':
        return { name: 'check-circle', color: '#4CAF50' };
      default:
        return { name: 'bell', color: '#757575' };
    }
  };

  // Render a notification card
  const renderNotification = ({ item }: { item: Notification }) => {
    const icon = getNotificationIcon(item.type);
    
    return (
      <TouchableOpacity 
        onPress={() => markAsRead(item.id)}
        style={styles.notificationContainer}
      >
        <Card style={[
          styles.notificationCard, 
          !item.read && (isDarkMode ? 
            { backgroundColor: '#193549', borderLeftWidth: 4, borderLeftColor: theme.colors.primary } : 
            styles.unreadCard)
        ]}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <FontAwesome5 name={icon.name as any} size={24} color={icon.color} />
              {!item.read && <View style={[styles.unreadDot, { backgroundColor: theme.colors.primary }]} />}
            </View>
            
            <View style={styles.contentContainer}>
              <Text variant="titleMedium" style={styles.title}>{item.title}</Text>
              <Text variant="bodyMedium" style={styles.message}>{item.message}</Text>
              
              <View style={styles.metaContainer}>
                <Text style={styles.timestamp}>
                  {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {' • '}
                  {item.timestamp.toLocaleDateString()}
                </Text>
                
                {item.location && (
                  <Chip icon="map-marker" style={styles.locationChip}>
                    {item.location}
                  </Chip>
                )}
              </View>
              
              {item.actionable && (
                <View style={styles.actionsContainer}>
                  <Button 
                    mode="outlined" 
                    onPress={() => {}} 
                    style={styles.actionButton}
                  >
                    View Details
                  </Button>
                </View>
              )}
            </View>
            
            <IconButton 
              icon="close" 
              size={20} 
              onPress={() => deleteNotification(item.id)} 
              style={styles.closeButton} 
            />
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.Content title="Notifications" />
        <Appbar.Action icon="cog" onPress={() => {}} />
      </Appbar.Header>

      <View style={styles.content}>
        {notifications.length > 0 ? (
          <>
            <View style={[styles.filtersContainer, { backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff' }]}>
              <Text style={[styles.sectionTitle, { color: isDarkMode ? '#e0e0e0' : '#333333' }]}>Alert Settings</Text>
              
              <View style={styles.settingRow}>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingTitle, { color: isDarkMode ? '#e0e0e0' : '#333333' }]}>High Pollutant Alerts</Text>
                  <Text style={styles.settingDescription}>Receive alerts when pollutant levels are high</Text>
                </View>
                <Switch value={highPollutantAlerts} onValueChange={setHighPollutantAlerts} />
              </View>
              
              <Divider style={styles.divider} />
              
              <View style={styles.settingRow}>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingTitle, { color: isDarkMode ? '#e0e0e0' : '#333333' }]}>Daily Summaries</Text>
                  <Text style={styles.settingDescription}>Receive daily air quality summaries</Text>
                </View>
                <Switch value={dailySummaries} onValueChange={setDailySummaries} />
              </View>
              
              <Divider style={styles.divider} />
              
              <View style={styles.settingRow}>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingTitle, { color: isDarkMode ? '#e0e0e0' : '#333333' }]}>Location-based Alerts</Text>
                  <Text style={styles.settingDescription}>Receive alerts when entering areas with poor air quality</Text>
                </View>
                <Switch value={locationAlerts} onValueChange={setLocationAlerts} />
              </View>
            </View>
            
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#e0e0e0' : '#333333' }]}>Recent Notifications</Text>
            
            <FlatList
              data={notifications}
              renderItem={renderNotification}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="bell-slash" size={60} color={isDarkMode ? '#666' : '#ccc'} />
            <Text style={[styles.emptyText, { color: isDarkMode ? '#aaa' : '#666' }]}>No notifications yet</Text>
            <Text style={[styles.emptySubtext, { color: isDarkMode ? '#888' : '#999' }]}>
              You'll receive alerts about air quality issues here
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  listContent: {
    paddingBottom: 24,
  },
  filtersContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  divider: {
    backgroundColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  notificationContainer: {
    marginBottom: 12,
  },
  notificationCard: {
    borderRadius: 12,
  },
  unreadCard: {
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  cardContent: {
    flexDirection: 'row',
  },
  iconContainer: {
    marginRight: 16,
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2196F3',
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#757575',
    marginRight: 8,
  },
  locationChip: {
    height: 24,
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginTop: 12,
  },
  actionButton: {
    marginRight: 8,
  },
  closeButton: {
    margin: 0,
    marginLeft: 'auto',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
}); 