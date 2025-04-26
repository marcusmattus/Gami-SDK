import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Image
} from 'react-native';
import { useGamiSDK } from '../hooks/useGamiSDK';

const defaultAchievementImage = require('../../assets/achievement-default.png');

const AchievementsScreen = () => {
  const { userProfile, isLoading, error, fetchUserProfile } = useGamiSDK();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const renderAchievementCard = (achievement: any, index: number) => {
    const isUnlocked = !!achievement.unlockedAt;
    
    return (
      <View 
        key={achievement.id} 
        style={[
          styles.achievementCard,
          isUnlocked ? styles.unlockedCard : styles.lockedCard
        ]}
      >
        <View style={styles.achievementImageContainer}>
          <Image
            source={achievement.imageUrl ? { uri: achievement.imageUrl } : defaultAchievementImage}
            style={styles.achievementImage}
            resizeMode="contain"
          />
          {!isUnlocked && (
            <View style={styles.lockOverlay}>
              <Text style={styles.lockIcon}>🔒</Text>
            </View>
          )}
        </View>
        
        <View style={styles.achievementContent}>
          <Text style={styles.achievementTitle}>{achievement.title}</Text>
          <Text style={styles.achievementDescription}>{achievement.description}</Text>
          
          {isUnlocked && (
            <View style={styles.achievementMeta}>
              <Text style={styles.achievementXp}>+{achievement.xpAwarded || 0} XP</Text>
              <Text style={styles.achievementDate}>
                Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>
      </View>
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

  const achievements = userProfile?.achievements || [];
  const unlockedCount = achievements.filter(a => a.unlockedAt).length;
  const totalCount = achievements.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Achievements</Text>
        <Text style={styles.headerStat}>
          {unlockedCount} / {totalCount} Unlocked
        </Text>
      </View>

      {totalCount === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Achievements Yet</Text>
          <Text style={styles.emptyDescription}>
            Complete tasks and challenges to unlock achievements.
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollContainer}>
          {achievements.map((achievement, index) => renderAchievementCard(achievement, index))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerStat: {
    fontSize: 16,
    color: '#7631F9',
    fontWeight: '500',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  scrollContainer: {
    padding: 15,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unlockedCard: {
    borderLeftColor: '#7631F9',
    borderLeftWidth: 4,
  },
  lockedCard: {
    opacity: 0.7,
    borderLeftColor: '#ccc',
    borderLeftWidth: 4,
  },
  achievementImageContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  achievementImage: {
    width: 60,
    height: 60,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 24,
  },
  achievementContent: {
    flex: 1,
    padding: 15,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  achievementMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  achievementXp: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#7631F9',
  },
  achievementDate: {
    fontSize: 12,
    color: '#999',
  },
});

export default AchievementsScreen;