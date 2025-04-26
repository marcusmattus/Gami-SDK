import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define SDK configuration
interface GamiSDKConfig {
  apiKey: string;
  apiUrl: string;
  environment: 'development' | 'production';
}

// Define achievement type
interface Achievement {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  unlockedAt?: string;
  xpAwarded?: number;
}

// Define inventory item type
interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  quantity: number;
  acquiredAt?: string;
}

// Define user profile type
interface UserProfile {
  userId: string;
  username: string;
  level: number;
  xp: number;
  achievements: Achievement[];
  inventory: InventoryItem[];
}

// Define wallet data
interface WalletData {
  publicKey: string;
  chainType: string;
  isConnected: boolean;
}

// Define token balance
interface TokenBalance {
  token: string;
  amount: number;
  usdValue?: number;
}

// Define SDK context value type
interface GamiSDKContextType {
  config: GamiSDKConfig;
  isInitialized: boolean;
  userProfile: UserProfile | null;
  wallets: WalletData[];
  tokenBalances: Record<string, TokenBalance[]>;
  isLoading: boolean;
  error: string | null;
  // SDK methods
  trackEvent: (eventName: string, metadata?: Record<string, any>) => Promise<void>;
  fetchUserProfile: () => Promise<void>;
  connectWallet: (walletType: string) => Promise<WalletData | null>;
  disconnectWallet: (publicKey: string) => Promise<boolean>;
  fetchTokenBalances: (publicKey: string) => Promise<TokenBalance[]>;
}

// Create the GamiSDK Context
const GamiSDKContext = createContext<GamiSDKContextType | undefined>(undefined);

// Provider props
interface GamiSDKProviderProps {
  children: ReactNode;
}

// Create a provider component
export const GamiSDKProvider = ({ children }: GamiSDKProviderProps) => {
  const { user } = useAuth();
  const [config, setConfig] = useState<GamiSDKConfig>({
    apiKey: '',
    apiUrl: 'https://api.gamiprotocol.com/api',
    environment: 'development',
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [tokenBalances, setTokenBalances] = useState<Record<string, TokenBalance[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize SDK
  useEffect(() => {
    const initSDK = async () => {
      try {
        // Load stored API key
        const storedApiKey = await AsyncStorage.getItem('gamiApiKey');
        if (storedApiKey) {
          setConfig(prevConfig => ({
            ...prevConfig,
            apiKey: storedApiKey,
          }));
        }
        
        // Load stored wallets
        const storedWallets = await AsyncStorage.getItem('gamiWallets');
        if (storedWallets) {
          setWallets(JSON.parse(storedWallets));
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize SDK:', error);
        setError('Failed to initialize SDK');
      }
    };

    initSDK();
  }, []);

  // Load user profile when user changes
  useEffect(() => {
    if (user && isInitialized) {
      fetchUserProfile();
    } else {
      setUserProfile(null);
    }
  }, [user, isInitialized]);

  // Track event method
  const trackEvent = async (eventName: string, metadata?: Record<string, any>) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setIsLoading(true);
    setError(null);

    try {
      // In a real app, this would be an API call
      await fetch(`${config.apiUrl}/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': config.apiKey,
        },
        body: JSON.stringify({
          userId: user.id.toString(),
          event: eventName,
          metadata,
        }),
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to track event');
      console.error('Track event error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user profile method
  const fetchUserProfile = async () => {
    if (!user) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // In a real app, this would be an API call
      const response = await fetch(`${config.apiUrl}/users/${user.id}/profile`, {
        headers: {
          'X-API-Key': config.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const profileData = await response.json();
      setUserProfile(profileData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch user profile');
      console.error('Fetch profile error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Connect wallet method
  const connectWallet = async (walletType: string): Promise<WalletData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real app, this would use wallet-specific connection logic
      // and then register the connection with the API
      const response = await fetch(`${config.apiUrl}/connect-wallet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': config.apiKey,
        },
        body: JSON.stringify({
          userId: user?.id.toString(),
          walletType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to connect wallet');
      }

      const walletData = await response.json();
      
      // Add to wallets list
      const updatedWallets = [...wallets, walletData];
      setWallets(updatedWallets);
      
      // Store wallets
      await AsyncStorage.setItem('gamiWallets', JSON.stringify(updatedWallets));
      
      return walletData;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to connect wallet');
      console.error('Connect wallet error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect wallet method
  const disconnectWallet = async (publicKey: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Remove from wallets list
      const updatedWallets = wallets.filter(wallet => wallet.publicKey !== publicKey);
      setWallets(updatedWallets);
      
      // Store updated wallets
      await AsyncStorage.setItem('gamiWallets', JSON.stringify(updatedWallets));
      
      // Clear token balances for this wallet
      const updatedBalances = { ...tokenBalances };
      delete updatedBalances[publicKey];
      setTokenBalances(updatedBalances);
      
      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to disconnect wallet');
      console.error('Disconnect wallet error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch token balances method
  const fetchTokenBalances = async (publicKey: string): Promise<TokenBalance[]> => {
    setIsLoading(true);
    setError(null);

    try {
      // Find the wallet
      const wallet = wallets.find(w => w.publicKey === publicKey);
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      // In a real app, this would be an API call
      const response = await fetch(`${config.apiUrl}/wallet/balances`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': config.apiKey,
        },
        body: JSON.stringify({
          publicKey,
          chainType: wallet.chainType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch token balances');
      }

      const data = await response.json();
      const balances = data.balances || [];
      
      // Update state
      setTokenBalances(prev => ({
        ...prev,
        [publicKey]: balances,
      }));
      
      return balances;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch token balances');
      console.error('Fetch balances error:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    config,
    isInitialized,
    userProfile,
    wallets,
    tokenBalances,
    isLoading,
    error,
    trackEvent,
    fetchUserProfile,
    connectWallet,
    disconnectWallet,
    fetchTokenBalances,
  };

  return <GamiSDKContext.Provider value={value}>{children}</GamiSDKContext.Provider>;
};

// Custom hook to use the SDK context
export const useGamiSDK = () => {
  const context = useContext(GamiSDKContext);
  if (context === undefined) {
    throw new Error('useGamiSDK must be used within a GamiSDKProvider');
  }
  return context;
};