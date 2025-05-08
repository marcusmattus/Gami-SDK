import { configureApi, apiRequest } from './api';
import { GamiError } from './types';

/**
 * Partner onboarding parameters
 */
export interface PartnerOnboardingConfig {
  partnerApiKey: string;
  partnerId: string;
  partnerName: string;
  deepLinkUrl?: string;
  redirectUrl?: string;
  oauthCallbackUrl?: string;
  customCssUrl?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

/**
 * Customer data for onboarding
 */
export interface CustomerData {
  externalCustomerId: string;
  email?: string;
  phone?: string;
  name?: string;
  metadata?: Record<string, any>;
}

/**
 * Response from customer onboarding
 */
export interface OnboardingResponse {
  success: boolean;
  customerId?: string;
  universalId?: string; 
  qrCode?: string;
  deepLink?: string;
  error?: GamiError;
}

/**
 * QR code format options
 */
export type QRFormat = 'svg' | 'png' | 'dataUrl';

/**
 * Points transfer response
 */
export interface PointsTransferResponse {
  success: boolean;
  transferId?: string;
  pointsAmount?: number;
  error?: GamiError;
}

/**
 * E-commerce integration module for Gami Protocol
 * This module handles partner business integrations and customer onboarding
 */
export class EcommerceIntegration {
  private partnerConfig: PartnerOnboardingConfig | null = null;
  
  /**
   * Initialize the e-commerce integration module
   * @param apiUrl Base API URL
   * @param apiKey API key
   */
  constructor(apiUrl: string, apiKey: string) {
    // Configure the API module for this instance
    configureApi(apiUrl, apiKey);
  }
  
  /**
   * Register partner business configuration
   * @param config Partner configuration
   * @returns Promise with success status
   */
  async registerPartner(config: PartnerOnboardingConfig): Promise<boolean> {
    try {
      const response = await apiRequest('POST', '/partner/register', config);
      const data = await response.json();
      
      if (data.success) {
        this.partnerConfig = config;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to register partner:', error);
      return false;
    }
  }
  
  /**
   * Onboard a customer to the Gami Protocol
   * @param customerData Customer information
   * @returns Onboarding result with universal ID
   */
  async onboardCustomer(customerData: CustomerData): Promise<OnboardingResponse> {
    try {
      if (!this.partnerConfig) {
        return {
          success: false,
          error: {
            code: 'PARTNER_NOT_REGISTERED',
            message: 'Partner not registered. Call registerPartner first.'
          }
        };
      }
      
      const payload = {
        ...customerData,
        partnerId: this.partnerConfig.partnerId
      };
      
      const response = await apiRequest('POST', '/customer/onboard', payload);
      const data = await response.json();
      
      return data;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'ONBOARDING_FAILED',
          message: error instanceof Error ? error.message : 'Failed to onboard customer'
        }
      };
    }
  }
  
  /**
   * Generate QR code for existing customer
   * @param universalId Universal customer ID
   * @param format QR code format
   * @returns QR code data
   */
  async generateCustomerQR(universalId: string, format: QRFormat = 'svg'): Promise<string | null> {
    try {
      const response = await apiRequest('GET', `/customer/${universalId}/qr?format=${format}`);
      const data = await response.json();
      
      if (data.success) {
        return data.qrCode;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      return null;
    }
  }
  
  /**
   * Get onboarding deep link for mobile app
   * @param universalId Universal customer ID
   * @returns Deep link URL
   */
  async getDeepLink(universalId: string): Promise<string | null> {
    try {
      const response = await apiRequest('GET', `/customer/${universalId}/deeplink`);
      const data = await response.json();
      
      if (data.success) {
        return data.deepLink;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to generate deep link:', error);
      return null;
    }
  }
  
  /**
   * Transfer points from partner to customer
   * @param externalCustomerId External customer ID
   * @param points Amount of points to transfer
   * @param transactionType Transaction type (purchase, reward, referral, etc.)
   * @param metadata Additional transaction data
   * @returns Points transfer result
   */
  async awardPoints(
    externalCustomerId: string,
    points: number,
    transactionType: string,
    metadata?: Record<string, any>
  ): Promise<PointsTransferResponse> {
    try {
      if (!this.partnerConfig) {
        return {
          success: false,
          error: {
            code: 'PARTNER_NOT_REGISTERED',
            message: 'Partner not registered. Call registerPartner first.'
          }
        };
      }
      
      const payload = {
        externalCustomerId,
        partnerId: this.partnerConfig.partnerId,
        points,
        transactionType,
        metadata
      };
      
      const response = await apiRequest('POST', '/points/award', payload);
      const data = await response.json();
      
      return data;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'POINTS_TRANSFER_FAILED',
          message: error instanceof Error ? error.message : 'Failed to award points'
        }
      };
    }
  }
  
  /**
   * Redeem points from customer's universal balance
   * @param externalCustomerId External customer ID
   * @param points Amount of points to redeem
   * @param purpose Purpose of redemption 
   * @param metadata Additional redemption data
   * @returns Points redemption result
   */
  async redeemPoints(
    externalCustomerId: string,
    points: number,
    purpose: string,
    metadata?: Record<string, any>
  ): Promise<PointsTransferResponse> {
    try {
      if (!this.partnerConfig) {
        return {
          success: false,
          error: {
            code: 'PARTNER_NOT_REGISTERED',
            message: 'Partner not registered. Call registerPartner first.'
          }
        };
      }
      
      const payload = {
        externalCustomerId,
        partnerId: this.partnerConfig.partnerId,
        points,
        purpose,
        metadata
      };
      
      const response = await apiRequest('POST', '/points/redeem', payload);
      const data = await response.json();
      
      return data;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'POINTS_REDEMPTION_FAILED',
          message: error instanceof Error ? error.message : 'Failed to redeem points'
        }
      };
    }
  }
  
  /**
   * Get customer points balance
   * @param externalCustomerId External customer ID
   * @returns Current points balance
   */
  async getCustomerBalance(externalCustomerId: string): Promise<number | null> {
    try {
      if (!this.partnerConfig) {
        console.error('Partner not registered. Call registerPartner first.');
        return null;
      }
      
      const response = await apiRequest('GET', `/customer/balance?externalCustomerId=${externalCustomerId}&partnerId=${this.partnerConfig.partnerId}`);
      const data = await response.json();
      
      if (data.success) {
        return data.balance;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get customer balance:', error);
      return null;
    }
  }
  
  /**
   * Check if customer exists in the universal system
   * @param externalCustomerId External customer ID
   * @returns Whether the customer exists
   */
  async customerExists(externalCustomerId: string): Promise<boolean> {
    try {
      if (!this.partnerConfig) {
        console.error('Partner not registered. Call registerPartner first.');
        return false;
      }
      
      const response = await apiRequest('GET', `/customer/exists?externalCustomerId=${externalCustomerId}&partnerId=${this.partnerConfig.partnerId}`);
      const data = await response.json();
      
      return data.exists === true;
    } catch (error) {
      console.error('Failed to check customer:', error);
      return false;
    }
  }
}