import { v4 as uuidv4 } from 'uuid';
import { eq, and } from 'drizzle-orm';
import { db } from '../db';
import {
  partners,
  customers,
  pointsTransactions,
  InsertPartner,
  InsertCustomer,
  InsertPointsTransaction,
  Customer,
  PointsTransaction,
  TransactionType
} from '@shared/schema';

/**
 * QR code formats that can be generated
 */
export type QRFormat = 'svg' | 'png' | 'dataUrl';

/**
 * Service for e-commerce partner integrations
 */
export class EcommerceService {
  /**
   * Register a new partner business
   * @param partnerData Partner registration data
   * @returns The created partner record
   */
  async registerPartner(partnerData: InsertPartner) {
    try {
      const [partner] = await db
        .insert(partners)
        .values(partnerData)
        .returning();
      
      return partner;
    } catch (error) {
      console.error('Error registering partner:', error);
      throw new Error('Failed to register partner');
    }
  }
  
  /**
   * Get a partner by ID
   * @param partnerId Partner ID
   * @returns The partner or undefined if not found
   */
  async getPartnerById(partnerId: string) {
    try {
      const [partner] = await db
        .select()
        .from(partners)
        .where(eq(partners.partnerId, partnerId));
      
      return partner;
    } catch (error) {
      console.error('Error getting partner:', error);
      throw new Error('Failed to get partner');
    }
  }
  
  /**
   * Check if a partner API key is valid
   * @param partnerId Partner ID
   * @param apiKey API key to validate
   * @returns Whether the API key is valid
   */
  async validatePartnerApiKey(partnerId: string, apiKey: string) {
    try {
      const [partner] = await db
        .select()
        .from(partners)
        .where(
          and(
            eq(partners.partnerId, partnerId),
            eq(partners.partnerApiKey, apiKey),
            eq(partners.active, true)
          )
        );
      
      return !!partner;
    } catch (error) {
      console.error('Error validating partner API key:', error);
      return false;
    }
  }
  
  /**
   * Onboard a new customer from a partner
   * @param customerData Customer data
   * @returns The created customer record with QR code and deep link
   */
  async onboardCustomer(customerData: InsertCustomer): Promise<Customer> {
    try {
      // Generate a unique universal ID for the customer
      const universalId = `gami_${uuidv4().replace(/-/g, '')}`;
      
      // Check if partner exists
      const partner = await this.getPartnerById(customerData.partnerId);
      if (!partner) {
        throw new Error('Partner not found');
      }
      
      // Check if customer already exists for this partner
      const existingCustomer = await this.getCustomerByExternalId(
        customerData.externalCustomerId, 
        customerData.partnerId
      );
      
      if (existingCustomer) {
        return existingCustomer;
      }
      
      // Generate QR code and deep link
      const qrCode = await this.generateQRCode(universalId);
      const deepLink = this.generateDeepLink(universalId, partner.deepLinkUrl);
      
      // Create customer record
      const [customer] = await db
        .insert(customers)
        .values({
          ...customerData,
          universalId,
          qrCode,
          deepLink
        })
        .returning();
      
      return customer;
    } catch (error) {
      console.error('Error onboarding customer:', error);
      throw new Error('Failed to onboard customer');
    }
  }
  
  /**
   * Get a customer by external ID and partner ID
   * @param externalCustomerId External customer ID
   * @param partnerId Partner ID
   * @returns The customer or undefined if not found
   */
  async getCustomerByExternalId(externalCustomerId: string, partnerId: string): Promise<Customer | undefined> {
    try {
      const [customer] = await db
        .select()
        .from(customers)
        .where(
          and(
            eq(customers.externalCustomerId, externalCustomerId),
            eq(customers.partnerId, partnerId)
          )
        );
      
      return customer;
    } catch (error) {
      console.error('Error getting customer:', error);
      return undefined;
    }
  }
  
  /**
   * Get a customer by universal ID
   * @param universalId Universal customer ID
   * @returns The customer or undefined if not found
   */
  async getCustomerByUniversalId(universalId: string): Promise<Customer | undefined> {
    try {
      const [customer] = await db
        .select()
        .from(customers)
        .where(eq(customers.universalId, universalId));
      
      return customer;
    } catch (error) {
      console.error('Error getting customer by universal ID:', error);
      return undefined;
    }
  }
  
  /**
   * Check if customer exists
   * @param externalCustomerId External customer ID
   * @param partnerId Partner ID
   * @returns Whether the customer exists
   */
  async customerExists(externalCustomerId: string, partnerId: string): Promise<boolean> {
    const customer = await this.getCustomerByExternalId(externalCustomerId, partnerId);
    return !!customer;
  }
  
  /**
   * Generate a QR code for customer onboarding
   * @param universalId Universal customer ID
   * @param format QR code format
   * @returns QR code data
   */
  async generateQRCode(universalId: string, format: QRFormat = 'svg'): Promise<string> {
    // This would normally use a QR code library
    // For now, we'll return a placeholder
    return `qrcode:${universalId}:${format}`;
  }
  
  /**
   * Generate a deep link for the mobile app
   * @param universalId Universal customer ID
   * @param baseUrl Optional base URL from partner config
   * @returns Deep link URL
   */
  generateDeepLink(universalId: string, baseUrl?: string): string {
    if (baseUrl) {
      return `${baseUrl.replace(/\/$/, '')}/${universalId}`;
    }
    
    return `gamiprotocol://onboard/${universalId}`;
  }
  
  /**
   * Award points to a customer
   * @param externalCustomerId External customer ID
   * @param partnerId Partner ID
   * @param points Number of points to award
   * @param transactionType Type of transaction
   * @param metadata Additional transaction data
   * @returns Transaction record and updated points balance
   */
  async awardPoints(
    externalCustomerId: string,
    partnerId: string,
    points: number,
    transactionType: string,
    metadata?: Record<string, any>
  ): Promise<{ transaction: PointsTransaction; balance: number }> {
    try {
      // Get customer
      const customer = await this.getCustomerByExternalId(externalCustomerId, partnerId);
      if (!customer) {
        throw new Error('Customer not found');
      }
      
      // Create transaction
      const transferId = `pt_${uuidv4().replace(/-/g, '')}`;
      const transactionData: InsertPointsTransaction = {
        transferId,
        universalId: customer.universalId,
        partnerId,
        externalCustomerId,
        points,
        transactionType: TransactionType.AWARD,
        purpose: transactionType,
        metadata
      };
      
      const [transaction] = await db
        .insert(pointsTransactions)
        .values(transactionData)
        .returning();
      
      // Update customer points
      const newBalance = customer.points + points;
      await db
        .update(customers)
        .set({ 
          points: newBalance,
          lastActivity: new Date()
        })
        .where(eq(customers.universalId, customer.universalId));
      
      return {
        transaction,
        balance: newBalance
      };
    } catch (error) {
      console.error('Error awarding points:', error);
      throw new Error('Failed to award points');
    }
  }
  
  /**
   * Redeem points from customer's balance
   * @param externalCustomerId External customer ID
   * @param partnerId Partner ID
   * @param points Number of points to redeem
   * @param purpose Purpose of redemption
   * @param metadata Additional redemption data
   * @returns Transaction record and updated points balance
   */
  async redeemPoints(
    externalCustomerId: string,
    partnerId: string,
    points: number,
    purpose: string,
    metadata?: Record<string, any>
  ): Promise<{ transaction: PointsTransaction; balance: number }> {
    try {
      // Get customer
      const customer = await this.getCustomerByExternalId(externalCustomerId, partnerId);
      if (!customer) {
        throw new Error('Customer not found');
      }
      
      // Check if customer has enough points
      if (customer.points < points) {
        throw new Error('Insufficient points balance');
      }
      
      // Create transaction
      const transferId = `pt_${uuidv4().replace(/-/g, '')}`;
      const transactionData: InsertPointsTransaction = {
        transferId,
        universalId: customer.universalId,
        partnerId,
        externalCustomerId,
        points: -points, // Negative value for redemption
        transactionType: TransactionType.REDEEM,
        purpose,
        metadata
      };
      
      const [transaction] = await db
        .insert(pointsTransactions)
        .values(transactionData)
        .returning();
      
      // Update customer points
      const newBalance = customer.points - points;
      await db
        .update(customers)
        .set({ 
          points: newBalance,
          lastActivity: new Date()
        })
        .where(eq(customers.universalId, customer.universalId));
      
      return {
        transaction,
        balance: newBalance
      };
    } catch (error) {
      console.error('Error redeeming points:', error);
      throw new Error('Failed to redeem points');
    }
  }
  
  /**
   * Get a customer's points balance
   * @param externalCustomerId External customer ID
   * @param partnerId Partner ID
   * @returns Current points balance or null if customer not found
   */
  async getCustomerBalance(
    externalCustomerId: string,
    partnerId: string
  ): Promise<number | null> {
    try {
      const customer = await this.getCustomerByExternalId(externalCustomerId, partnerId);
      
      if (!customer) {
        return null;
      }
      
      return customer.points;
    } catch (error) {
      console.error('Error getting customer balance:', error);
      return null;
    }
  }
}

// Singleton instance
export const ecommerceService = new EcommerceService();