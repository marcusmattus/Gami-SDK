import { v4 as uuidv4 } from 'uuid';
import { generateApiKey } from '../auth';
import { db } from '../db';
import { 
  partners, 
  customers, 
  pointsTransactions,
  Partner, 
  Customer, 
  PointsTransaction, 
  InsertPartner,
  InsertCustomer,
  InsertPointsTransaction,
  TransactionType
} from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import QRCode from 'qrcode';

// Use a type that matches the expected JSON type
type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

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
  async registerPartner(partnerData: InsertPartner): Promise<Partner> {
    // Generate a unique ID for the partner if none provided
    if (!partnerData.partnerId) {
      partnerData.partnerId = `partner_${uuidv4().replace(/-/g, '')}`;
    }
    
    // Generate API key if none provided
    if (!partnerData.partnerApiKey) {
      partnerData.partnerApiKey = generateApiKey();
    }
    
    // Insert the partner record
    const [partner] = await db
      .insert(partners)
      .values(partnerData)
      .returning();
      
    return partner;
  }

  /**
   * Get a partner by ID
   * @param partnerId Partner ID
   * @returns The partner or undefined if not found
   */
  async getPartnerById(partnerId: string): Promise<Partner | undefined> {
    const [partner] = await db
      .select()
      .from(partners)
      .where(eq(partners.partnerId, partnerId));
      
    return partner;
  }

  /**
   * Check if a partner API key is valid
   * @param partnerId Partner ID
   * @param apiKey API key to validate
   * @returns Whether the API key is valid
   */
  async validatePartnerApiKey(partnerId: string, apiKey: string): Promise<boolean> {
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
  }

  /**
   * Onboard a new customer from a partner
   * @param customerData Customer data
   * @returns The created customer record with QR code and deep link
   */
  async onboardCustomer(customerData: Omit<InsertCustomer, 'universalId'>): Promise<Customer> {
    // Check if the partner exists
    const partner = await this.getPartnerById(customerData.partnerId);
    if (!partner) {
      throw new Error(`Partner with ID ${customerData.partnerId} not found`);
    }
    
    // Check if the customer already exists for this partner
    const existingCustomer = await this.getCustomerByExternalId(
      customerData.externalCustomerId,
      customerData.partnerId
    );
    
    if (existingCustomer) {
      return existingCustomer;
    }
    
    // Generate a universal customer ID
    const universalId = `cust_${uuidv4().replace(/-/g, '')}`;
    
    // Create complete customer data with generated values
    const completeCustomerData: InsertCustomer = {
      ...customerData,
      universalId
    };
    
    // Insert the customer record
    const [customer] = await db
      .insert(customers)
      .values(completeCustomerData)
      .returning();
    
    // Generate QR code and deep link
    const qrCode = await this.generateQRCode(universalId);
    const deepLink = this.generateDeepLink(universalId, partner.deepLinkUrl);
    
    // Update the customer record with QR code and deep link
    const [updatedCustomer] = await db
      .update(customers)
      .set({ qrCode, deepLink })
      .where(eq(customers.id, customer.id))
      .returning();
      
    return updatedCustomer;
  }

  /**
   * Get a customer by external ID and partner ID
   * @param externalCustomerId External customer ID
   * @param partnerId Partner ID
   * @returns The customer or undefined if not found
   */
  async getCustomerByExternalId(
    externalCustomerId: string,
    partnerId: string
  ): Promise<Customer | undefined> {
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
  }

  /**
   * Get a customer by universal ID
   * @param universalId Universal customer ID
   * @returns The customer or undefined if not found
   */
  async getCustomerByUniversalId(universalId: string): Promise<Customer | undefined> {
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.universalId, universalId));
      
    return customer;
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
    const data = `https://app.gamiprotocol.com/onboard?id=${universalId}`;
    
    switch (format) {
      case 'svg':
        return QRCode.toString(data, { type: 'svg' });
      case 'png':
        return QRCode.toDataURL(data);
      case 'dataUrl':
        return QRCode.toDataURL(data);
      default:
        return QRCode.toString(data, { type: 'svg' });
    }
  }

  /**
   * Generate a deep link for the mobile app
   * @param universalId Universal customer ID
   * @param baseUrl Optional base URL from partner config
   * @returns Deep link URL
   */
  generateDeepLink(universalId: string, baseUrl?: string): string {
    // Use nullish coalescing to handle undefined or empty string
    const base = baseUrl ?? 'gami://onboard';
    return `${base}?id=${universalId}`;
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
    transactionType: string = TransactionType.AWARD,
    metadata: Record<string, any> = {}
  ): Promise<{ transaction: PointsTransaction; balance: number }> {
    // Get the customer
    const customer = await this.getCustomerByExternalId(externalCustomerId, partnerId);
    if (!customer) {
      throw new Error(`Customer with external ID ${externalCustomerId} not found for partner ${partnerId}`);
    }
    
    // Create transaction record
    const transferId = `txn_${uuidv4().replace(/-/g, '')}`;
    
    const transactionData: InsertPointsTransaction = {
      transferId,
      universalId: customer.universalId,
      partnerId,
      externalCustomerId,
      points,
      transactionType,
      metadata: metadata as Json
    };
    
    const [transaction] = await db
      .insert(pointsTransactions)
      .values(transactionData)
      .returning();
    
    // Update customer points
    const newBalance = customer.points + points;
    const [updatedCustomer] = await db
      .update(customers)
      .set({ 
        points: newBalance,
        lastActivity: new Date()
      })
      .where(eq(customers.id, customer.id))
      .returning();
    
    return {
      transaction,
      balance: updatedCustomer.points
    };
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
    metadata: Record<string, any> = {}
  ): Promise<{ transaction: PointsTransaction; balance: number }> {
    // Get the customer
    const customer = await this.getCustomerByExternalId(externalCustomerId, partnerId);
    if (!customer) {
      throw new Error(`Customer with external ID ${externalCustomerId} not found for partner ${partnerId}`);
    }
    
    // Check if customer has enough points
    if (customer.points < points) {
      throw new Error(`Customer has insufficient points (${customer.points}) to redeem ${points} points`);
    }
    
    // Create transaction record
    const transferId = `txn_${uuidv4().replace(/-/g, '')}`;
    
    const transactionData: InsertPointsTransaction = {
      transferId,
      universalId: customer.universalId,
      partnerId,
      externalCustomerId,
      points: -points, // Negative for redemption
      transactionType: TransactionType.REDEEM,
      purpose,
      metadata: metadata as Json
    };
    
    const [transaction] = await db
      .insert(pointsTransactions)
      .values(transactionData)
      .returning();
    
    // Update customer points
    const newBalance = customer.points - points;
    const [updatedCustomer] = await db
      .update(customers)
      .set({ 
        points: newBalance,
        lastActivity: new Date()
      })
      .where(eq(customers.id, customer.id))
      .returning();
    
    return {
      transaction,
      balance: updatedCustomer.points
    };
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
    const customer = await this.getCustomerByExternalId(externalCustomerId, partnerId);
    return customer ? customer.points : null;
  }
}

export const ecommerceService = new EcommerceService();