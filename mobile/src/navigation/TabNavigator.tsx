import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import DashboardScreen from '../screens/DashboardScreen';
import WalletScreen from '../screens/WalletScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RewardsScreen from '../screens/RewardsScreen';

export type TabStackParamList = {
  Dashboard: undefined;
  Wallet: undefined;
  Rewards: undefined;
  Achievements: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabStackParamList>();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'ios-help';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'ios-home' : 'ios-home-outline';
          } else if (route.name === 'Wallet') {
            iconName = focused ? 'ios-wallet' : 'ios-wallet-outline';
          } else if (route.name === 'Rewards') {
            iconName = focused ? 'ios-gift' : 'ios-gift-outline';
          } else if (route.name === 'Achievements') {
            iconName = focused ? 'ios-trophy' : 'ios-trophy-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'ios-person' : 'ios-person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#7631f9',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
        headerStyle: styles.header,
        headerTintColor: '#fff',
        headerTitleStyle: styles.headerTitle,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{
          title: 'Dashboard'
        }}
      />
      <Tab.Screen 
        name="Wallet" 
        component={WalletScreen} 
        options={{
          title: 'Wallet'
        }}
      />
      <Tab.Screen 
        name="Rewards" 
        component={RewardsScreen} 
        options={{
          title: 'Rewards'
        }}
      />
      <Tab.Screen 
        name="Achievements" 
        component={AchievementsScreen} 
        options={{
          title: 'Achievements'
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          title: 'Profile'
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#7631f9',
  },
  headerTitle: {
    fontWeight: 'bold',
  },
});

export default TabNavigator;