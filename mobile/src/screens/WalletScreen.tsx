import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  ActivityIndicator,
  Modal
} from 'react-native';
import { useGamiSDK } from '../hooks/useGamiSDK';

const WALLET_TYPES = [
  { id: 'phantom', name: 'Phantom Wallet', chain: 'solana' },
  { id: 'solflare', name: 'Solflare', chain: 'solana' },
  { id: 'metamask', name: 'MetaMask', chain: 'ethereum' },
  { id: 'walletconnect', name: 'WalletConnect', chain: 'multi' },
];

const WalletScreen = () => {
  const { 
    wallets, 
    tokenBalances,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    fetchTokenBalances 
  } = useGamiSDK();

  const [isConnectModalVisible, setIsConnectModalVisible] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  useEffect(() => {
    // Load balances for all connected wallets
    wallets.forEach(wallet => {
      fetchTokenBalances(wallet.publicKey);
    });
  }, [wallets]);

  const handleConnectWallet = async (walletType: string) => {
    setIsConnectModalVisible(false);
    
    try {
      const result = await connectWallet(walletType);
      if (result) {
        Alert.alert('Success', 'Wallet connected successfully');
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
    }
  };

  const handleDisconnectWallet = async (publicKey: string) => {
    Alert.alert(
      'Disconnect Wallet',
      'Are you sure you want to disconnect this wallet?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            const success = await disconnectWallet(publicKey);
            if (success) {
              Alert.alert('Success', 'Wallet disconnected successfully');
            }
          },
        },
      ]
    );
  };

  const handleSelectWallet = (publicKey: string) => {
    setSelectedWallet(publicKey === selectedWallet ? null : publicKey);
  };

  const renderWalletCard = (wallet: any) => {
    const balances = tokenBalances[wallet.publicKey] || [];
    const isSelected = wallet.publicKey === selectedWallet;

    return (
      <TouchableOpacity
        key={wallet.publicKey}
        style={[styles.walletCard, isSelected && styles.selectedWalletCard]}
        onPress={() => handleSelectWallet(wallet.publicKey)}
      >
        <View style={styles.walletHeader}>
          <View>
            <Text style={styles.walletType}>{wallet.walletType}</Text>
            <Text style={styles.walletChain}>{wallet.chainType.toUpperCase()}</Text>
          </View>
          <TouchableOpacity
            style={styles.disconnectButton}
            onPress={() => handleDisconnectWallet(wallet.publicKey)}
          >
            <Text style={styles.disconnectButtonText}>Disconnect</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.walletAddress}>
          {wallet.publicKey.substring(0, 8)}...
          {wallet.publicKey.substring(wallet.publicKey.length - 8)}
        </Text>

        {isSelected && (
          <View style={styles.walletBalances}>
            <Text style={styles.balancesTitle}>Balances</Text>
            
            {isLoading && (
              <ActivityIndicator size="small" color="#7631F9" style={styles.loader} />
            )}
            
            {!isLoading && balances.length === 0 && (
              <Text style={styles.noBalancesText}>No tokens found</Text>
            )}
            
            {balances.map((balance, index) => (
              <View key={index} style={styles.balanceItem}>
                <Text style={styles.tokenName}>{balance.token}</Text>
                <Text style={styles.tokenAmount}>{balance.amount}</Text>
              </View>
            ))}
            
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={() => fetchTokenBalances(wallet.publicKey)}
            >
              <Text style={styles.refreshButtonText}>Refresh Balances</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderConnectModal = () => {
    return (
      <Modal
        visible={isConnectModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsConnectModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Connect Wallet</Text>
            <Text style={styles.modalSubtitle}>Select a wallet to connect</Text>
            
            {WALLET_TYPES.map((wallet) => (
              <TouchableOpacity
                key={wallet.id}
                style={styles.walletOption}
                onPress={() => handleConnectWallet(wallet.id)}
              >
                <Text style={styles.walletOptionName}>{wallet.name}</Text>
                <Text style={styles.walletOptionChain}>{wallet.chain}</Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsConnectModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Wallets</Text>
          <Text style={styles.subtitle}>
            Connect and manage your blockchain wallets
          </Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.walletsContainer}>
          {wallets.length === 0 ? (
            <View style={styles.noWalletsContainer}>
              <Text style={styles.noWalletsText}>
                No wallets connected
              </Text>
              <Text style={styles.noWalletsSubtext}>
                Connect a wallet to view your balances
              </Text>
            </View>
          ) : (
            wallets.map((wallet) => renderWalletCard(wallet))
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.connectButton}
        onPress={() => setIsConnectModalVisible(true)}
      >
        <Text style={styles.connectButtonText}>Connect New Wallet</Text>
      </TouchableOpacity>

      {renderConnectModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 15,
    margin: 15,
    borderRadius: 8,
  },
  errorText: {
    color: '#d32f2f',
  },
  walletsContainer: {
    padding: 15,
  },
  noWalletsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noWalletsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  noWalletsSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  walletCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedWalletCard: {
    borderColor: '#7631F9',
    borderWidth: 1,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  walletType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  walletChain: {
    fontSize: 14,
    color: '#666',
  },
  disconnectButton: {
    padding: 8,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
  },
  disconnectButtonText: {
    color: '#d32f2f',
    fontSize: 12,
  },
  walletAddress: {
    fontSize: 16,
    color: '#7631F9',
    fontWeight: '500',
    marginBottom: 10,
  },
  walletBalances: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
    marginTop: 5,
  },
  balancesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  loader: {
    marginVertical: 10,
  },
  noBalancesText: {
    color: '#999',
    marginVertical: 10,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  balanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tokenName: {
    fontSize: 16,
    color: '#333',
  },
  tokenAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 10,
  },
  refreshButtonText: {
    color: '#7631F9',
    fontWeight: '500',
  },
  connectButton: {
    backgroundColor: '#7631F9',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  connectButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  walletOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  walletOptionName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  walletOptionChain: {
    fontSize: 14,
    color: '#7631F9',
    textTransform: 'uppercase',
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 15,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  closeButtonText: {
    color: '#d32f2f',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default WalletScreen;