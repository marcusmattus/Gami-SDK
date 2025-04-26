import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Switch,
  Alert
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useGamiSDK } from '../hooks/useGamiSDK';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const { config, isInitialized } = useGamiSDK();
  
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [achievementAlertsEnabled, setAchievementAlertsEnabled] = React.useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);
  
  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        }
      ]
    );
  };
  
  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
  
  const renderToggleSetting = (
    label: string, 
    value: boolean, 
    onToggle: (value: boolean) => void
  ) => (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: "#ccc", true: "#b89ffb" }}
        thumbColor={value ? "#7631F9" : "#f4f3f4"}
      />
    </View>
  );
  
  const renderMenuItem = (
    label: string, 
    icon: keyof typeof Ionicons.glyphMap, 
    onPress: () => void
  ) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemContent}>
        <Ionicons name={icon} size={24} color="#7631F9" style={styles.menuIcon} />
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileImagePlaceholder}>
          <Text style={styles.profileInitials}>
            {user?.username?.substring(0, 1).toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={styles.username}>{user?.username || 'User'}</Text>
        <Text style={styles.email}>{user?.email || 'No email provided'}</Text>
      </View>
      
      {renderSection('Account', (
        <>
          {renderMenuItem(
            'Edit Profile',
            'ios-person-outline',
            () => Alert.alert('Coming Soon', 'This feature is not yet available.')
          )}
          {renderMenuItem(
            'Change Password',
            'ios-lock-closed-outline',
            () => Alert.alert('Coming Soon', 'This feature is not yet available.')
          )}
          {renderMenuItem(
            'Linked Accounts',
            'ios-link-outline',
            () => Alert.alert('Coming Soon', 'This feature is not yet available.')
          )}
        </>
      ))}
      
      {renderSection('Settings', (
        <>
          {renderToggleSetting(
            'Push Notifications',
            notificationsEnabled,
            setNotificationsEnabled
          )}
          {renderToggleSetting(
            'Achievement Alerts',
            achievementAlertsEnabled,
            setAchievementAlertsEnabled
          )}
          {renderToggleSetting(
            'Dark Mode',
            darkModeEnabled,
            setDarkModeEnabled
          )}
        </>
      ))}
      
      {renderSection('SDK Configuration', (
        <>
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>API Key:</Text>
            <Text style={styles.configValue}>
              {config.apiKey ? `${config.apiKey.substring(0, 8)}...` : 'Not set'}
            </Text>
          </View>
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>Environment:</Text>
            <Text style={styles.configValue}>{config.environment}</Text>
          </View>
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>Status:</Text>
            <Text style={[
              styles.configValue, 
              isInitialized ? styles.statusOnline : styles.statusOffline
            ]}>
              {isInitialized ? 'Initialized' : 'Not Initialized'}
            </Text>
          </View>
        </>
      ))}
      
      {renderSection('Support', (
        <>
          {renderMenuItem(
            'Help Center',
            'ios-help-circle-outline',
            () => Alert.alert('Coming Soon', 'This feature is not yet available.')
          )}
          {renderMenuItem(
            'Contact Support',
            'ios-mail-outline',
            () => Alert.alert('Coming Soon', 'This feature is not yet available.')
          )}
          {renderMenuItem(
            'Privacy Policy',
            'ios-document-text-outline',
            () => Alert.alert('Coming Soon', 'This feature is not yet available.')
          )}
          {renderMenuItem(
            'Terms of Service',
            'ios-document-outline',
            () => Alert.alert('Coming Soon', 'This feature is not yet available.')
          )}
        </>
      ))}
      
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
      
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#7631F9',
    padding: 30,
    alignItems: 'center',
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileInitials: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  email: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  section: {
    backgroundColor: 'white',
    margin: 15,
    marginBottom: 5,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 15,
  },
  menuLabel: {
    fontSize: 16,
    color: '#333',
  },
  configItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  configLabel: {
    fontSize: 16,
    color: '#333',
  },
  configValue: {
    fontSize: 16,
    color: '#666',
  },
  statusOnline: {
    color: '#4caf50',
  },
  statusOffline: {
    color: '#f44336',
  },
  logoutButton: {
    backgroundColor: '#f44336',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  versionText: {
    color: '#999',
    fontSize: 12,
  },
});

export default ProfileScreen;