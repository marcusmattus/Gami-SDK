import { GamiSDKConfig, TrackEventParams, ConnectWalletParams } from './types';
import { EventTracker } from './event-tracker';
import { WalletConnector, TransactionParams, WalletData } from './wallet-connector';
import { CrossChainTransfer, CrossChainTransferParams, ChainType } from './cross-chain-transfer';

/**
 * Gami Protocol SDK for integrating gamification into React applications
 */
export class GamiSDK {
  private config: GamiSDKConfig;
  private apiUrl: string;
  private eventTracker: EventTracker;
  private walletConnector: WalletConnector;
  private crossChainTransfer: CrossChainTransfer;

  /**
   * Initialize the Gami SDK
   * @param config SDK configuration
   */
  constructor(config: GamiSDKConfig) {
    this.config = {
      ...config,
      environment: config.environment || 'development'
    };

    // Set API URL
    this.apiUrl = config.apiUrl || 
      (this.config.environment === 'production' 
        ? 'https://api.gamiprotocol.com/api'
        : '/api');
    
    // Initialize components
    this.eventTracker = new EventTracker(this.apiUrl, this.config.apiKey);
    this.walletConnector = new WalletConnector(this.apiUrl, this.config.apiKey);
    this.crossChainTransfer = new CrossChainTransfer(this.apiUrl, this.config.apiKey);
  }

  /**
   * Track a user action to award XP
   * @param params The tracking parameters
   */
  async trackEvent(params: TrackEventParams) {
    return this.eventTracker.trackEvent(params);
  }

  /**
   * Add an event listener to track user actions
   * @param element The DOM element to listen to
   * @param eventType The DOM event type (e.g., 'click', 'submit')
   * @param gamiEvent The Gami event name to track
   * @param userId The user ID
   * @param metadataFn Optional function to extract metadata from the event
   */
  addEventTracker(
    element: HTMLElement | null,
    eventType: string,
    gamiEvent: string,
    userId: string,
    metadataFn?: (event: Event) => Record<string, any>
  ) {
    this.eventTracker.addEventTracker(element, eventType, gamiEvent, userId, metadataFn);
  }

  /**
   * Connect to a blockchain wallet
   * @param params Connection parameters
   */
  async connectWallet(params: ConnectWalletParams) {
    return this.walletConnector.connectWallet(params);
  }

  /**
   * Disconnect a wallet
   * @param publicKey Wallet public key
   */
  async disconnectWallet(publicKey: string) {
    return this.walletConnector.disconnectWallet(publicKey);
  }

  /**
   * Get a connected wallet by public key
   * @param publicKey The wallet's public key
   */
  getWallet(publicKey: string): WalletData | undefined {
    return this.walletConnector.getWallet(publicKey);
  }

  /**
   * Get all connected wallets
   */
  getAllWallets(): WalletData[] {
    return this.walletConnector.getAllWallets();
  }

  /**
   * Check if a wallet is connected
   * @param publicKey Wallet public key
   */
  isWalletConnected(publicKey: string): boolean {
    return this.walletConnector.isWalletConnected(publicKey);
  }

  /**
   * Get token balances for a wallet
   * @param publicKey Wallet's public key
   */
  async getTokenBalances(publicKey: string) {
    return this.walletConnector.getTokenBalances(publicKey);
  }

  /**
   * Send a transaction from a connected wallet
   * @param publicKey Wallet's public key
   * @param params Transaction parameters
   */
  async sendTransaction(publicKey: string, params: TransactionParams) {
    return this.walletConnector.sendTransaction(publicKey, params);
  }

  /**
   * Initiate a cross-chain token transfer
   * @param params Transfer parameters
   */
  async transferTokensCrossChain(params: CrossChainTransferParams) {
    return this.crossChainTransfer.transferTokens(params);
  }

  /**
   * Get supported chains for cross-chain transfers
   */
  async getSupportedChains() {
    return this.crossChainTransfer.getSupportedChains();
  }

  /**
   * Get the fee estimate for a cross-chain transfer
   * @param fromChain Source chain
   * @param toChain Destination chain
   * @param amount Amount to transfer
   */
  async getCrossChainFeeEstimate(fromChain: ChainType, toChain: ChainType, amount: number) {
    return this.crossChainTransfer.getFeeEstimate(fromChain, toChain, amount);
  }

  /**
   * Get transfer history for a user
   * @param walletPublicKey The user's wallet public key
   */
  async getCrossChainTransferHistory(walletPublicKey: string) {
    return this.crossChainTransfer.getTransferHistory(walletPublicKey);
  }
}

// Export types
export * from './types';
export * from './wallet-connector';
export * from './cross-chain-transfer';
