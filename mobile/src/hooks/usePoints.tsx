import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useAuth } from './useAuth';
import { useGamiSDK } from './useGamiSDK';

// Define types for points transactions
export enum TransactionType {
  AWARD = 'award',
  REDEEM = 'redeem',
  SHADOW_AWARD = 'shadow_award',
  SHADOW_REDEEM = 'shadow_redeem',
  ACCOUNT_ACTIVATION = 'account_activation',
  POINTS_MIGRATION = 'points_migration'
}

// Transaction history item
export interface PointsTransaction {
  id: string;
  partnerId: string;
  partnerName: string;
  amount: number;
  transactionType: TransactionType;
  timestamp: string;
  metadata?: Record<string, any>;
}

// Partner information
export interface Partner {
  id: string;
  name: string;
  logoUrl?: string;
}

// Balance information
export interface PointsBalance {
  partnerId: string;
  partnerName: string;
  balance: number;
  logoUrl?: string;
}

// Shadow account info
export interface ShadowAccountInfo {
  universalId: string;
  partnerId: string;
  partnerName: string;
  points: number;
  pendingActivation: boolean;
  claimCode: string;
  lastActivity: string;
}

// Claim code validation result
export interface ClaimCodeValidation {
  isValid: boolean;
  accountInfo?: ShadowAccountInfo;
  errorMessage?: string;
}

// Define redemption request
export interface RedemptionRequest {
  partnerId: string;
  amount: number;
  redemptionItem?: string;
  walletPublicKey?: string;
}

// Define the points context type
interface PointsContextType {
  isLoading: boolean;
  error: string | null;
  transactions: PointsTransaction[];
  partners: Partner[];
  balances: PointsBalance[];
  shadowAccounts: ShadowAccountInfo[];
  totalPoints: number;
  // Methods
  fetchTransactions: () => Promise<void>;
  fetchPartners: () => Promise<void>;
  fetchBalances: () => Promise<void>;
  validateClaimCode: (claimCode: string) => Promise<ClaimCodeValidation>;
  activateClaimCode: (claimCode: string, walletPublicKey: string) => Promise<boolean>;
  fetchShadowAccounts: () => Promise<void>;
  redeemPoints: (request: RedemptionRequest) => Promise<boolean>;
}

// Create the context
const PointsContext = createContext<PointsContextType | undefined>(undefined);

// Provider props
interface PointsProviderProps {
  children: ReactNode;
}

// Create a provider component
export const PointsProvider = ({ children }: PointsProviderProps) => {
  const { user } = useAuth();
  const { config, isInitialized } = useGamiSDK();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [balances, setBalances] = useState<PointsBalance[]>([]);
  const [shadowAccounts, setShadowAccounts] = useState<ShadowAccountInfo[]>([]);

  // Calculate total points across all partners
  const totalPoints = balances.reduce((sum, balance) => sum + balance.balance, 0);

  // Fetch transaction history
  const fetchTransactions = async () => {
    if (!user || !isInitialized) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${config.apiUrl}/points/transactions?userId=${user.id}`, {
        headers: {
          'X-API-Key': config.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch transactions');
      console.error('Fetch transactions error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch partner list
  const fetchPartners = async () => {
    if (!isInitialized) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${config.apiUrl}/partners`, {
        headers: {
          'X-API-Key': config.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch partners');
      }

      const data = await response.json();
      setPartners(data.partners || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch partners');
      console.error('Fetch partners error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch points balances
  const fetchBalances = async () => {
    if (!user || !isInitialized) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${config.apiUrl}/points/balances?userId=${user.id}`, {
        headers: {
          'X-API-Key': config.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch balances');
      }

      const data = await response.json();
      setBalances(data.balances || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch balances');
      console.error('Fetch balances error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Validate a claim code
  const validateClaimCode = async (claimCode: string): Promise<ClaimCodeValidation> => {
    if (!isInitialized) {
      return {
        isValid: false,
        errorMessage: 'SDK not initialized',
      };
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${config.apiUrl}/customer/claim-code/${claimCode}`, {
        headers: {
          'X-API-Key': config.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error('Invalid claim code');
      }

      const data = await response.json();
      return {
        isValid: true,
        accountInfo: data,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to validate claim code';
      setError(errorMessage);
      console.error('Validate claim code error:', error);
      return {
        isValid: false,
        errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Activate a claim code
  const activateClaimCode = async (claimCode: string, walletPublicKey: string): Promise<boolean> => {
    if (!user || !isInitialized) {
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${config.apiUrl}/customer/activate-shadow-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': config.apiKey,
        },
        body: JSON.stringify({
          claimCode,
          walletPublicKey,
          email: user.email,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to activate shadow account');
      }

      // Refresh balances
      await fetchBalances();
      await fetchShadowAccounts();
      
      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to activate shadow account');
      console.error('Activate shadow account error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch shadow accounts
  const fetchShadowAccounts = async () => {
    if (!user || !isInitialized) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${config.apiUrl}/customer/shadow-accounts?userId=${user.id}`, {
        headers: {
          'X-API-Key': config.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch shadow accounts');
      }

      const data = await response.json();
      setShadowAccounts(data.shadowAccounts || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch shadow accounts');
      console.error('Fetch shadow accounts error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Redeem points
  const redeemPoints = async (request: RedemptionRequest): Promise<boolean> => {
    if (!user || !isInitialized) {
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${config.apiUrl}/points/redeem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': config.apiKey,
        },
        body: JSON.stringify({
          userId: user.id,
          ...request
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to redeem points');
      }

      // Refresh data
      await fetchBalances();
      await fetchTransactions();
      
      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to redeem points');
      console.error('Redeem points error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    isLoading,
    error,
    transactions,
    partners,
    balances,
    shadowAccounts,
    totalPoints,
    fetchTransactions,
    fetchPartners,
    fetchBalances,
    validateClaimCode,
    activateClaimCode,
    fetchShadowAccounts,
    redeemPoints,
  };

  return <PointsContext.Provider value={value}>{children}</PointsContext.Provider>;
};

// Custom hook to use the points context
export const usePoints = () => {
  const context = useContext(PointsContext);
  if (context === undefined) {
    throw new Error('usePoints must be used within a PointsProvider');
  }
  return context;
};