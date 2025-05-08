import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { usePoints, PointsTransaction, PointsBalance, ShadowAccountInfo, RedemptionRequest } from '../hooks/usePoints';
import { useGamiSDK } from '../hooks/useGamiSDK';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

const RewardsScreen = () => {
  const {
    isLoading,
    error,
    balances,
    transactions,
    shadowAccounts,
    totalPoints,
    fetchBalances,
    fetchTransactions,
    fetchShadowAccounts,
    validateClaimCode,
    activateClaimCode,
    redeemPoints,
  } = usePoints();
  const { wallets } = useGamiSDK();
  const [claimCodeInput, setClaimCodeInput] = useState('');
  const [isClaimModalVisible, setIsClaimModalVisible] = useState(false);
  const [isRedeemModalVisible, setIsRedeemModalVisible] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [selectedShadowAccount, setSelectedShadowAccount] = useState<ShadowAccountInfo | null>(null);
  const [selectedBalance, setSelectedBalance] = useState<PointsBalance | null>(null);
  const [redeemAmount, setRedeemAmount] = useState('');
  const [redeemItem, setRedeemItem] = useState('');
  const [activeTab, setActiveTab] = useState<'balances' | 'transactions' | 'claim'>('balances');

  // Load data when screen is focused
  useEffect(() => {
    fetchBalances();
    fetchTransactions();
    fetchShadowAccounts();
  }, []);

  // Handle claim code verification
  const handleVerifyClaimCode = async () => {
    if (!claimCodeInput.trim()) {
      Alert.alert('Error', 'Please enter a claim code');
      return;
    }
    
    setIsVerifyingCode(true);
    
    try {
      const result = await validateClaimCode(claimCodeInput.trim());
      
      if (result.isValid && result.accountInfo) {
        setSelectedShadowAccount(result.accountInfo);
        setIsClaimModalVisible(true);
      } else {
        Alert.alert('Invalid Code', result.errorMessage || 'The claim code is not valid');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to verify claim code');
      console.error(err);
    } finally {
      setIsVerifyingCode(false);
    }
  };

  // Handle claim activation
  const handleActivateClaimCode = async () => {
    if (!selectedShadowAccount) return;
    
    if (wallets.length === 0) {
      Alert.alert(
        'No Wallet Found',
        'Please connect a wallet in the Wallet tab before claiming rewards'
      );
      return;
    }
    
    const wallet = wallets[0]; // Use the first wallet for simplicity
    
    try {
      const success = await activateClaimCode(
        selectedShadowAccount.claimCode,
        wallet.publicKey
      );
      
      if (success) {
        Alert.alert(
          'Success',
          `Congratulations! You've claimed ${selectedShadowAccount.points} points from ${selectedShadowAccount.partnerName}`
        );
        setIsClaimModalVisible(false);
        setSelectedShadowAccount(null);
        setClaimCodeInput('');
        
        // Refresh data
        fetchBalances();
        fetchShadowAccounts();
      } else {
        Alert.alert('Error', 'Failed to activate claim code');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to activate shadow account');
      console.error(err);
    }
  };

  // Handle redemption of points
  const handleRedeemPoints = async () => {
    if (!selectedBalance || !redeemAmount) {
      Alert.alert('Error', 'Please select a partner and enter an amount');
      return;
    }

    const amount = parseInt(redeemAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (amount > selectedBalance.balance) {
      Alert.alert('Error', 'You do not have enough points');
      return;
    }

    if (wallets.length === 0) {
      Alert.alert(
        'No Wallet Found',
        'Please connect a wallet in the Wallet tab before redeeming points'
      );
      return;
    }

    const wallet = wallets[0]; // Use the first wallet for simplicity
    
    setIsRedeeming(true);

    try {
      const request: RedemptionRequest = {
        partnerId: selectedBalance.partnerId,
        amount: amount,
        redemptionItem: redeemItem || undefined,
        walletPublicKey: wallet.publicKey
      };

      const success = await redeemPoints(request);

      if (success) {
        Alert.alert(
          'Success',
          `You've successfully redeemed ${amount} points from ${selectedBalance.partnerName}`
        );
        setIsRedeemModalVisible(false);
        setSelectedBalance(null);
        setRedeemAmount('');
        setRedeemItem('');
        
        // Refresh data
        fetchBalances();
        fetchTransactions();
      } else {
        Alert.alert('Error', 'Failed to redeem points');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to redeem points');
      console.error(err);
    } finally {
      setIsRedeeming(false);
    }
  };

  // Render points balance item
  const renderBalanceItem = ({ item }: { item: PointsBalance }) => (
    <TouchableOpacity 
      style={styles.balanceItem}
      onPress={() => {
        setSelectedBalance(item);
        setRedeemAmount('');
        setRedeemItem('');
        setIsRedeemModalVisible(true);
      }}
    >
      {item.logoUrl ? (
        <Image source={{ uri: item.logoUrl }} style={styles.partnerLogo} />
      ) : (
        <View style={styles.logoPlaceholder}>
          <Text style={styles.logoPlaceholderText}>
            {item.partnerName.substring(0, 1).toUpperCase()}
          </Text>
        </View>
      )}
      <View style={styles.balanceInfo}>
        <Text style={styles.partnerName}>{item.partnerName}</Text>
        <Text style={styles.pointsBalance}>{item.balance} points</Text>
      </View>
      <View style={styles.balanceActions}>
        <Text style={styles.redeemText}>Redeem</Text>
        <Ionicons name="chevron-forward" size={20} color="#7631f9" />
      </View>
    </TouchableOpacity>
  );

  // Render transaction item
  const renderTransactionItem = ({ item }: { item: PointsTransaction }) => {
    const date = new Date(item.timestamp);
    const formattedDate = format(date, 'MMM d, yyyy');
    
    const getTransactionIcon = () => {
      switch (item.transactionType) {
        case 'award':
        case 'shadow_award':
          return <Ionicons name="arrow-down" size={20} color="#4CAF50" />;
        case 'redeem':
        case 'shadow_redeem':
          return <Ionicons name="arrow-up" size={20} color="#F44336" />;
        case 'account_activation':
          return <Ionicons name="checkmark-circle" size={20} color="#7631f9" />;
        case 'points_migration':
          return <Ionicons name="swap-horizontal" size={20} color="#2196F3" />;
        default:
          return <Ionicons name="help-circle" size={20} color="#9E9E9E" />;
      }
    };
    
    const getTransactionTitle = () => {
      switch (item.transactionType) {
        case 'award':
          return 'Points Awarded';
        case 'shadow_award':
          return 'Shadow Points Awarded';
        case 'redeem':
          return 'Points Redeemed';
        case 'shadow_redeem':
          return 'Shadow Points Redeemed';
        case 'account_activation':
          return 'Account Activated';
        case 'points_migration':
          return 'Points Migrated';
        default:
          return 'Transaction';
      }
    };
    
    return (
      <View style={styles.transactionItem}>
        <View style={styles.transactionIconContainer}>
          {getTransactionIcon()}
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle}>
            {getTransactionTitle()} - {item.partnerName}
          </Text>
          <Text style={styles.transactionDate}>{formattedDate}</Text>
        </View>
        <Text style={[
          styles.transactionAmount,
          (item.transactionType === 'award' || item.transactionType === 'shadow_award' || item.transactionType === 'account_activation') 
            ? styles.positive 
            : styles.negative
        ]}>
          {(item.transactionType === 'award' || item.transactionType === 'shadow_award' || item.transactionType === 'account_activation') ? '+' : '-'}
          {Math.abs(item.amount)}
        </Text>
      </View>
    );
  };

  // Main render function
  return (
    <View style={styles.container}>
      {/* Header with total points */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Total Points</Text>
        <Text style={styles.totalPoints}>{totalPoints}</Text>
      </View>
      
      {/* Tab navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'balances' && styles.activeTab]}
          onPress={() => setActiveTab('balances')}
        >
          <Text style={[styles.tabText, activeTab === 'balances' && styles.activeTabText]}>Balances</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'transactions' && styles.activeTab]}
          onPress={() => setActiveTab('transactions')}
        >
          <Text style={[styles.tabText, activeTab === 'transactions' && styles.activeTabText]}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'claim' && styles.activeTab]}
          onPress={() => setActiveTab('claim')}
        >
          <Text style={[styles.tabText, activeTab === 'claim' && styles.activeTabText]}>Claim</Text>
        </TouchableOpacity>
      </View>
      
      {/* Content based on active tab */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7631f9" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              fetchBalances();
              fetchTransactions();
              fetchShadowAccounts();
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {activeTab === 'balances' && (
            <FlatList
              data={balances}
              renderItem={renderBalanceItem}
              keyExtractor={(item) => item.partnerId}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="wallet-outline" size={50} color="#BDBDBD" />
                  <Text style={styles.emptyText}>No point balances yet</Text>
                </View>
              }
            />
          )}
          
          {activeTab === 'transactions' && (
            <FlatList
              data={transactions}
              renderItem={renderTransactionItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="document-text-outline" size={50} color="#BDBDBD" />
                  <Text style={styles.emptyText}>No transaction history yet</Text>
                </View>
              }
            />
          )}
          
          {activeTab === 'claim' && (
            <ScrollView style={styles.claimContainer}>
              <View style={styles.claimCodeContainer}>
                <Text style={styles.claimTitle}>Enter Claim Code</Text>
                <Text style={styles.claimDescription}>
                  Enter the claim code you received from a partner to claim your points
                </Text>
                
                <View style={styles.claimInputContainer}>
                  <TextInput
                    style={styles.claimInput}
                    placeholder="Enter claim code"
                    value={claimCodeInput}
                    onChangeText={setClaimCodeInput}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.verifyButton}
                    onPress={handleVerifyClaimCode}
                    disabled={isVerifyingCode}
                  >
                    {isVerifyingCode ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text style={styles.verifyButtonText}>Verify</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
              
              {shadowAccounts.length > 0 && (
                <View style={styles.shadowAccountsContainer}>
                  <Text style={styles.shadowAccountsTitle}>Your Shadow Accounts</Text>
                  <Text style={styles.shadowAccountsDescription}>
                    These are pending points from partners you've interacted with
                  </Text>
                  
                  {shadowAccounts.map((account) => (
                    <View key={account.universalId} style={styles.shadowAccountItem}>
                      <View style={styles.shadowAccountInfo}>
                        <Text style={styles.shadowAccountPartner}>{account.partnerName}</Text>
                        <Text style={styles.shadowAccountPoints}>{account.points} points</Text>
                        <Text style={styles.shadowAccountDate}>Last activity: {format(new Date(account.lastActivity), 'MMM d, yyyy')}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.claimButton}
                        onPress={() => {
                          setSelectedShadowAccount(account);
                          setIsClaimModalVisible(true);
                        }}
                      >
                        <Text style={styles.claimButtonText}>Claim</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          )}
        </>
      )}
      
      {/* Claim confirmation modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isClaimModalVisible}
        onRequestClose={() => setIsClaimModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Claim Points</Text>
            
            {selectedShadowAccount && (
              <>
                <Text style={styles.modalText}>
                  You're about to claim {selectedShadowAccount.points} points from {selectedShadowAccount.partnerName}
                </Text>
                <Text style={styles.modalDescription}>
                  These points will be added to your total balance and can be used across all participating partners.
                </Text>
              </>
            )}
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsClaimModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleActivateClaimCode}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Redeem points modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isRedeemModalVisible}
        onRequestClose={() => setIsRedeemModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Redeem Points</Text>
            
            {selectedBalance && (
              <>
                <Text style={styles.modalText}>
                  You have {selectedBalance.balance} points from {selectedBalance.partnerName}
                </Text>
                
                <Text style={styles.inputLabel}>Amount to Redeem</Text>
                <TextInput
                  style={styles.redeemInput}
                  placeholder="Enter amount"
                  value={redeemAmount}
                  onChangeText={setRedeemAmount}
                  keyboardType="number-pad"
                />
                
                <Text style={styles.inputLabel}>Redemption Item (Optional)</Text>
                <TextInput
                  style={styles.redeemInput}
                  placeholder="What are you redeeming for?"
                  value={redeemItem}
                  onChangeText={setRedeemItem}
                />
                
                <Text style={styles.modalDescription}>
                  Points will be deducted from your balance and can be used towards rewards
                </Text>
              </>
            )}
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setIsRedeemModalVisible(false);
                  setSelectedBalance(null);
                  setRedeemAmount('');
                  setRedeemItem('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleRedeemPoints}
                disabled={isRedeeming}
              >
                {isRedeeming ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.confirmButtonText}>Confirm</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  header: {
    backgroundColor: '#7631f9',
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 4,
  },
  totalPoints: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#ffffff',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#7631f9',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#757575',
  },
  activeTabText: {
    color: '#7631f9',
    fontWeight: '600',
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
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#7631f9',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  balanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  partnerLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  logoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7631f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPlaceholderText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  balanceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  balanceActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  redeemText: {
    fontSize: 14,
    color: '#7631f9',
    fontWeight: '600',
    marginRight: 4,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  pointsBalance: {
    fontSize: 14,
    color: '#757575',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  positive: {
    color: '#4CAF50',
  },
  negative: {
    color: '#F44336',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#9E9E9E',
    marginTop: 12,
    textAlign: 'center',
  },
  claimContainer: {
    padding: 16,
  },
  claimCodeContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  claimTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  claimDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 16,
  },
  claimInputContainer: {
    flexDirection: 'row',
  },
  claimInput: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    paddingHorizontal: 12,
    marginRight: 8,
    fontSize: 16,
  },
  verifyButton: {
    backgroundColor: '#7631f9',
    height: 46,
    paddingHorizontal: 16,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  shadowAccountsContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  shadowAccountsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  shadowAccountsDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 16,
  },
  shadowAccountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  shadowAccountInfo: {
    flex: 1,
  },
  shadowAccountPartner: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  shadowAccountPoints: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4CAF50',
    marginBottom: 4,
  },
  shadowAccountDate: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  claimButton: {
    backgroundColor: '#7631f9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  claimButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#757575',
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#7631f9',
    marginLeft: 8,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: '#424242',
  },
  redeemInput: {
    height: 46,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 16,
  },
});

export default RewardsScreen;