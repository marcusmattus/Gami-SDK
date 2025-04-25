import { GamiSDKConfig, TrackEventParams, ConnectWalletParams } from './types';
import { EventTracker } from './event-tracker';
import { WalletConnector } from './wallet-connector';

/**
 * Gami Protocol SDK for integrating gamification into React applications
 */
export class GamiSDK {
  private config: GamiSDKConfig;
  private apiUrl: string;
  private eventTracker: EventTracker;
  private walletConnector: WalletConnector;

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
   * Connect to a Solana wallet
   * @param params Connection parameters
   */
  async connectWallet(params: ConnectWalletParams) {
    return this.walletConnector.connectWallet(params);
  }
}

// Export types
export * from './types';
