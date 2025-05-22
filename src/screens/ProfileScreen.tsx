import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Appbar, Avatar, Button, Card, Divider, List, Modal, Portal, Snackbar, Switch, Text, TextInput } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, signOut, updateUserProfile } = useAuth();
  const { isDarkMode, toggleTheme, theme } = useTheme();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  
  // Edit profile state
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [editedUsername, setEditedUsername] = useState(user?.name || '');
  const [editedEmail, setEditedEmail] = useState(user?.email || '');
  const [editedSchool, setEditedSchool] = useState(user?.school || '');
  
  // Notification state
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const showEditProfile = () => setEditProfileVisible(true);
  const hideEditProfile = () => setEditProfileVisible(false);
  
  const showNotification = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const hideNotification = () => {
    setSnackbarVisible(false);
  };

  // Reset form data when user changes or modal opens
  useEffect(() => {
    if (user) {
      setEditedUsername(user.name || '');
      setEditedEmail(user.email);
      setEditedSchool(user.school || '');
    }
  }, [user, editProfileVisible]);

  const handleSaveProfile = async () => {
    try {
      // Validate required fields
      if (!editedUsername.trim()) {
        Alert.alert('Error', 'Name cannot be empty');
        return;
      }
      
      if (!editedEmail.trim()) {
        Alert.alert('Error', 'Email cannot be empty');
        return;
      }
      
      // Update profile with the new data
      await updateUserProfile({
        name: editedUsername,
        email: editedEmail,
        school: editedSchool
      });
      
      // Close the modal
      hideEditProfile();
      
      // Show success notification
      showNotification('Profile updated successfully!');
    } catch (error) {
      Alert.alert(
        'Update Failed',
        'Failed to update profile. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await signOut();
              // Navigation will be handled by AuthContext
            } catch (err) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Get initials for the avatar
  const getInitials = () => {
    if (!user || !user.name) return '?';
    return user.name
      .split(' ')
      .map((name: string) => name.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Profile" />
      </Appbar.Header>

      <ScrollView>
        {user ? (
          <>
            <View style={[styles.userInfoContainer, { backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff' }]}>
              <Avatar.Text 
                size={80} 
                label={getInitials()} 
                style={styles.avatar}
              />
              <Text variant="headlineSmall" style={[styles.userName, { color: isDarkMode ? '#ffffff' : '#333333' }]}>
                {user?.name}
              </Text>
              <Text variant="bodyMedium" style={[styles.userEmail, { color: isDarkMode ? '#e0e0e0' : '#666666' }]}>
                {user?.email}
              </Text>
              <Text variant="bodySmall" style={[styles.userRole, { color: isDarkMode ? '#e0e0e0' : '#666666' }]}>
                Student at {user?.school || 'Unknown School'}
              </Text>
            </View>

            <Card style={[styles.card, { backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff' }]}>
              <Card.Title title="Settings" titleVariant="titleMedium" titleStyle={{ color: isDarkMode ? '#ffffff' : '#333333' }} />
              <Card.Content>
                <List.Section>
                  <List.Item
                    title="Enable Notifications"
                    description="Get alerts about air quality"
                    titleStyle={{ color: isDarkMode ? '#ffffff' : '#333333' }}
                    descriptionStyle={{ color: isDarkMode ? '#e0e0e0' : '#666666' }}
                    left={props => <List.Icon {...props} icon="bell" color={isDarkMode ? '#ffffff' : undefined} />}
                    right={() => (
                      <Switch
                        value={notificationsEnabled}
                        onValueChange={setNotificationsEnabled}
                      />
                    )}
                  />
                  <Divider />
                  <List.Item
                    title="Share Location"
                    description="Use location for accurate readings"
                    titleStyle={{ color: isDarkMode ? '#ffffff' : '#333333' }}
                    descriptionStyle={{ color: isDarkMode ? '#e0e0e0' : '#666666' }}
                    left={props => <List.Icon {...props} icon="map-marker" color={isDarkMode ? '#ffffff' : undefined} />}
                    right={() => (
                      <Switch
                        value={locationEnabled}
                        onValueChange={setLocationEnabled}
                      />
                    )}
                  />
                  <Divider />
                  <List.Item
                    title="Dark Mode"
                    description="Enable dark theme"
                    titleStyle={{ color: isDarkMode ? '#ffffff' : '#333333' }}
                    descriptionStyle={{ color: isDarkMode ? '#e0e0e0' : '#666666' }}
                    left={props => <List.Icon {...props} icon="theme-light-dark" color={isDarkMode ? '#ffffff' : undefined} />}
                    right={() => (
                      <Switch
                        value={isDarkMode}
                        onValueChange={toggleTheme}
                      />
                    )}
                  />
                </List.Section>
              </Card.Content>
            </Card>

            <Card style={[styles.card, { backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff' }]}>
              <Card.Title title="Account" titleVariant="titleMedium" titleStyle={{ color: isDarkMode ? '#ffffff' : '#333333' }} />
              <Card.Content>
                <List.Section>
                  <TouchableOpacity onPress={showEditProfile}>
                    <List.Item
                      title="Edit Profile"
                      titleStyle={{ color: isDarkMode ? '#ffffff' : '#333333' }}
                      left={props => <List.Icon {...props} icon="account-edit" color={isDarkMode ? '#ffffff' : undefined} />}
                      right={props => <List.Icon {...props} icon="chevron-right" color={isDarkMode ? '#ffffff' : undefined} />}
                    />
                  </TouchableOpacity>
                  <Divider />
                  <TouchableOpacity>
                    <List.Item
                      title="Change Password"
                      titleStyle={{ color: isDarkMode ? '#ffffff' : '#333333' }}
                      left={props => <List.Icon {...props} icon="lock-reset" color={isDarkMode ? '#ffffff' : undefined} />}
                      right={props => <List.Icon {...props} icon="chevron-right" color={isDarkMode ? '#ffffff' : undefined} />}
                    />
                  </TouchableOpacity>
                  <Divider />
                  <TouchableOpacity>
                    <List.Item
                      title="Notification Preferences"
                      titleStyle={{ color: isDarkMode ? '#ffffff' : '#333333' }}
                      left={props => <List.Icon {...props} icon="bell-outline" color={isDarkMode ? '#ffffff' : undefined} />}
                      right={props => <List.Icon {...props} icon="chevron-right" color={isDarkMode ? '#ffffff' : undefined} />}
                    />
                  </TouchableOpacity>
                </List.Section>
              </Card.Content>
            </Card>

            <Card style={[styles.card, { backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff' }]}>
              <Card.Title title="App Information" titleVariant="titleMedium" titleStyle={{ color: isDarkMode ? '#ffffff' : '#333333' }} />
              <Card.Content>
                <List.Section>
                  <TouchableOpacity>
                    <List.Item
                      title="About Air Quality Monitor"
                      titleStyle={{ color: isDarkMode ? '#ffffff' : '#333333' }}
                      left={props => <List.Icon {...props} icon="information" color={isDarkMode ? '#ffffff' : undefined} />}
                      right={props => <List.Icon {...props} icon="chevron-right" color={isDarkMode ? '#ffffff' : undefined} />}
                    />
                  </TouchableOpacity>
                  <Divider />
                  <TouchableOpacity>
                    <List.Item
                      title="Help & Support"
                      titleStyle={{ color: isDarkMode ? '#ffffff' : '#333333' }}
                      left={props => <List.Icon {...props} icon="help-circle" color={isDarkMode ? '#ffffff' : undefined} />}
                      right={props => <List.Icon {...props} icon="chevron-right" color={isDarkMode ? '#ffffff' : undefined} />}
                    />
                  </TouchableOpacity>
                  <Divider />
                  <TouchableOpacity>
                    <List.Item
                      title="Privacy Policy"
                      titleStyle={{ color: isDarkMode ? '#ffffff' : '#333333' }}
                      left={props => <List.Icon {...props} icon="shield-account" color={isDarkMode ? '#ffffff' : undefined} />}
                      right={props => <List.Icon {...props} icon="chevron-right" color={isDarkMode ? '#ffffff' : undefined} />}
                    />
                  </TouchableOpacity>
                </List.Section>
              </Card.Content>
            </Card>

            <Button
              mode="outlined"
              onPress={handleLogout}
              style={styles.logoutButton}
              labelStyle={{ color: isDarkMode ? '#ff6b6b' : '#d32f2f' }}
              icon="logout"
            >
              Logout
            </Button>
            
            <Text variant="bodySmall" style={[styles.versionText, { color: isDarkMode ? '#e0e0e0' : '#666666' }]}>Version 1.0.0</Text>

            {/* Edit Profile Modal */}
            <Portal>
              <Modal
                visible={editProfileVisible}
                onDismiss={hideEditProfile}
                contentContainerStyle={[
                  styles.modalContainer,
                  { backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff' }
                ]}
              >
                <Text
                  variant="titleLarge"
                  style={[styles.modalTitle, { color: isDarkMode ? '#ffffff' : '#333333' }]}
                >
                  Edit Profile
                </Text>
                
                <TextInput
                  label="Name"
                  value={editedUsername}
                  onChangeText={setEditedUsername}
                  style={styles.input}
                  mode="outlined"
                  outlineColor={isDarkMode ? '#444444' : '#cccccc'}
                  textColor={isDarkMode ? '#ffffff' : '#333333'}
                  theme={{ colors: { onSurfaceVariant: isDarkMode ? '#aaaaaa' : '#666666' } }}
                />
                
                <TextInput
                  label="Email"
                  value={editedEmail}
                  onChangeText={setEditedEmail}
                  style={styles.input}
                  mode="outlined"
                  outlineColor={isDarkMode ? '#444444' : '#cccccc'}
                  textColor={isDarkMode ? '#ffffff' : '#333333'}
                  theme={{ colors: { onSurfaceVariant: isDarkMode ? '#aaaaaa' : '#666666' } }}
                  keyboardType="email-address"
                />
                
                <TextInput
                  label="School"
                  value={editedSchool}
                  onChangeText={setEditedSchool}
                  style={styles.input}
                  mode="outlined"
                  outlineColor={isDarkMode ? '#444444' : '#cccccc'}
                  textColor={isDarkMode ? '#ffffff' : '#333333'}
                  theme={{ colors: { onSurfaceVariant: isDarkMode ? '#aaaaaa' : '#666666' } }}
                />
                
                <View style={styles.modalButtonsContainer}>
                  <Button
                    mode="outlined"
                    onPress={hideEditProfile}
                    style={[styles.modalButton, styles.cancelButton]}
                    textColor={isDarkMode ? '#e0e0e0' : '#666666'}
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    mode="contained"
                    onPress={handleSaveProfile}
                    style={[styles.modalButton, styles.saveButton]}
                    buttonColor={theme.colors.primary}
                  >
                    Save Changes
                  </Button>
                </View>
              </Modal>
              
              {/* Notification Snackbar */}
              <Snackbar
                visible={snackbarVisible}
                onDismiss={hideNotification}
                duration={3000}
                style={[
                  styles.snackbar, 
                  { backgroundColor: isDarkMode ? '#1e3a8a' : '#3b82f6' }
                ]}
                action={{
                  label: 'OK',
                  onPress: hideNotification,
                  color: '#ffffff'
                }}
              >
                <Text style={{ color: '#ffffff' }}>{snackbarMessage}</Text>
              </Snackbar>
            </Portal>
          </>
        ) : (
          <View style={[styles.notLoggedInContainer, { backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff' }]}>
            <Text style={[styles.notLoggedInText, { color: isDarkMode ? '#ffffff' : '#333333' }]}>
              You are not logged in.
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Login' as never)}
              style={styles.loginButton}
            >
              Log In
            </Button>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  userInfoContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  avatar: {
    marginBottom: 16,
    backgroundColor: '#2196F3',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  logoutButton: {
    marginHorizontal: 16,
    marginVertical: 24,
    borderColor: '#d32f2f',
  },
  versionText: {
    textAlign: 'center',
    color: '#999',
    marginBottom: 32,
  },
  notLoggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    marginTop: 48,
  },
  notLoggedInText: {
    fontSize: 18,
    marginBottom: 24,
    color: '#666',
  },
  loginButton: {
    width: 200,
  },
  modalContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    margin: 5,
  },
  cancelButton: {
    borderColor: '#cccccc',
  },
  saveButton: {
    borderColor: 'transparent',
  },
  snackbar: {
    bottom: 20,
    elevation: 5,
  },
}); 