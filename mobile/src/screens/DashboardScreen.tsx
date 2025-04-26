import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { useGamiSDK } from '../hooks/useGamiSDK';
import { useAuth } from '../hooks/useAuth';

const DashboardScreen = () => {
  const { userProfile, isLoading, error, fetchUserProfile } = useGamiSDK();
  const { user } = useAuth();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const renderXPBar = () => {
    if (!userProfile) return null;

    const { xp, level } = userProfile;
    const nextLevelXP = level * 1000; // Example XP calculation
    const progress = Math.min((xp / nextLevelXP) * 100, 100);

    return (
      <View style={styles.xpBarContainer}>
        <View style={styles.xpBarWrapper}>
          <View 
            style={[
              styles.xpBarFill, 
              { width: `${progress}%` }
            ]} 
          />
        </View>
        <Text style={styles.xpText}>
          {userProfile.xp} / {nextLevelXP} XP
        </Text>
      </View>
    );
  };

  const renderRecentAchievements = () => {
    if (!userProfile || !userProfile.achievements) return null;

    const recentAchievements = userProfile.achievements
      .slice(0, 3); // Show up to 3 recent achievements

    if (recentAchievements.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No achievements yet</Text>
        </View>
      );
    }

    return (
      <>
        {recentAchievements.map((achievement) => (
          <View key={achievement.id} style={styles.achievementItem}>
            <View style={styles.achievementIcon}>
              <Text style={styles.achievementIconText}>🏆</Text>
            </View>
            <View style={styles.achievementDetails}>
              <Text style={styles.achievementTitle}>{achievement.title}</Text>
              <Text style={styles.achievementDesc}>{achievement.description}</Text>
              {achievement.xpAwarded && (
                <Text style={styles.achievementXP}>+{achievement.xpAwarded} XP</Text>
              )}
            </View>
          </View>
        ))}
      </>
    );
  };

  const renderInventoryPreview = () => {
    if (!userProfile || !userProfile.inventory) return null;

    const recentItems = userProfile.inventory
      .slice(0, 3); // Show up to 3 recent items

    if (recentItems.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No items in inventory</Text>
        </View>
      );
    }

    return (
      <>
        {recentItems.map((item) => (
          <View key={item.id} style={styles.inventoryItem}>
            <View style={styles.inventoryIcon}>
              <Text style={styles.inventoryIconText}>🎁</Text>
            </View>
            <View style={styles.inventoryDetails}>
              <Text style={styles.inventoryTitle}>{item.name}</Text>
              {item.description && (
                <Text style={styles.inventoryDesc}>{item.description}</Text>
              )}
              <Text style={styles.inventoryQuantity}>Quantity: {item.quantity}</Text>
            </View>
          </View>
        ))}
      </>
    );
  };

  if (isLoading && !userProfile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7631F9" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={fetchUserProfile}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Hello, {user?.username || 'Gamer'}!
        </Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {userProfile?.level || 0}
            </Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {userProfile?.xp || 0}
            </Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {userProfile?.achievements?.length || 0}
            </Text>
            <Text style={styles.statLabel}>Achievements</Text>
          </View>
        </View>
        {renderXPBar()}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Achievements</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.sectionContent}>
          {renderRecentAchievements()}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Inventory</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.sectionContent}>
          {renderInventoryPreview()}
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {
            // Track an example event
            useGamiSDK().trackEvent('dashboard_viewed', {
              source: 'mobile_app'
            });
          }}
        >
          <Text style={styles.actionButtonText}>Track Event</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#7631F9',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: '#7631F9',
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'white',
    opacity: 0.8,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  xpBarContainer: {
    marginTop: 5,
  },
  xpBarWrapper: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: '#fff',
  },
  xpText: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'right',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    color: '#7631F9',
    fontSize: 14,
  },
  sectionContent: {
    
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    color: '#999',
  },
  achievementItem: {
    flexDirection: 'row',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 15,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f9f0ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  achievementIconText: {
    fontSize: 20,
  },
  achievementDetails: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  achievementDesc: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  achievementXP: {
    fontSize: 12,
    color: '#7631F9',
    fontWeight: 'bold',
    marginTop: 5,
  },
  inventoryItem: {
    flexDirection: 'row',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 15,
  },
  inventoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  inventoryIconText: {
    fontSize: 20,
  },
  inventoryDetails: {
    flex: 1,
  },
  inventoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  inventoryDesc: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  inventoryQuantity: {
    fontSize: 12,
    color: '#7631F9',
    fontWeight: 'bold',
    marginTop: 5,
  },
  actionsContainer: {
    padding: 15,
    marginBottom: 30,
  },
  actionButton: {
    backgroundColor: '#7631F9',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default DashboardScreen;