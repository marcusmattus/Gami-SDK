import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { trackEventSchema, connectWalletSchema } from "@shared/schema";
import express from "express";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { setupAuth, generateApiKey } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  const { requireAuth, apiKeyAuth } = setupAuth(app);
  
  // API routes
  const apiRouter = express.Router();
  
  // User routes for authentication (handled by setupAuth)
  
  // User's projects
  apiRouter.get("/projects", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = req.user;
      const projects = await storage.getProjectsByOwnerId(user.id);
      
      // Don't send sensitive data like API keys
      const safeProjects = projects.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        environment: project.environment,
        createdAt: project.createdAt
      }));
      
      res.status(200).json(safeProjects);
    } catch (error) {
      res.status(500).json({ error: "Error fetching projects" });
    }
  });
  
  // Get project API keys (only for authenticated users)
  apiRouter.get("/projects/:id/keys", requireAuth, async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        return res.status(400).json({ error: "Invalid project ID" });
      }
      
      const user = req.user;
      
      // Verify the project belongs to the user
      const project = await storage.getProject(projectId);
      if (!project || project.ownerId !== user.id) {
        return res.status(403).json({ error: "You do not have access to this project" });
      }
      
      res.status(200).json({
        apiKey: project.apiKey
      });
    } catch (error) {
      res.status(500).json({ error: "Error fetching API key" });
    }
  });
  
  // Create a new project (for authenticated users)
  apiRouter.post("/projects", requireAuth, async (req: Request, res: Response) => {
    try {
      const projectSchema = z.object({
        name: z.string().min(3).max(100),
        description: z.string().optional(),
        environment: z.enum(["development", "production"]).default("development")
      });
      
      const data = projectSchema.parse(req.body);
      const user = req.user;
      
      // Generate a new API key
      const apiKey = generateApiKey();
      
      const project = await storage.createProject({
        ownerId: user.id,
        name: data.name,
        apiKey,
        description: data.description || null,
        environment: data.environment,
        status: "active"
      });
      
      // Don't return the API key in the response
      const { apiKey: _, ...safeProject } = project;
      
      res.status(201).json(safeProject);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      
      res.status(500).json({ error: "Error creating project" });
    }
  });
  
  // We're using the apiKeyAuth middleware from setupAuth
  
  // SDK API endpoints
  
  // Track XP event
  apiRouter.post("/track", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const data = trackEventSchema.parse(req.body);
      const project = (req as any).project;
      
      // Find the XP event
      const events = await storage.getXpEventsByProjectId(project.id);
      const xpEvent = events.find(event => event.name === data.event);
      
      if (!xpEvent) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      if (xpEvent.status !== "active") {
        return res.status(400).json({ error: "Event is not active" });
      }
      
      // Create XP transaction
      const transaction = await storage.createUserXpTransaction({
        projectId: project.id,
        externalUserId: data.userId,
        eventId: xpEvent.id,
        xpAmount: xpEvent.xpAmount,
        metadata: data.metadata || {}
      });
      
      res.status(200).json({ 
        success: true, 
        transaction: {
          id: transaction.id,
          userId: transaction.externalUserId,
          event: xpEvent.name,
          xp: transaction.xpAmount,
          timestamp: transaction.createdAt
        }
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      
      res.status(500).json({ error: "Error tracking XP event" });
    }
  });
  
  // Connect wallet
  apiRouter.post("/connect-wallet", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const data = connectWalletSchema.parse(req.body);
      const project = (req as any).project;
      
      // Check if the wallet type is enabled for this project
      const walletIntegrations = await storage.getWalletIntegrationsByProjectId(project.id);
      const walletIntegration = walletIntegrations.find(w => w.walletType === data.walletType);
      
      if (!walletIntegration) {
        return res.status(404).json({ error: "Wallet type not found" });
      }
      
      if (!walletIntegration.isEnabled) {
        return res.status(400).json({ error: "Wallet type is not enabled" });
      }
      
      // In a real implementation, we would handle the wallet connection here
      // For now, we'll just return success
      res.status(200).json({ 
        success: true,
        message: `Successfully connected to ${data.walletType}`
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      
      res.status(500).json({ error: "Error connecting wallet" });
    }
  });
  
  // Get wallet token balances
  apiRouter.post("/wallet/balances", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const balanceSchema = z.object({
        publicKey: z.string(),
        chainType: z.enum(['solana', 'ethereum', 'polygon', 'avalanche', 'bsc', 'fantom'])
      });
      
      const data = balanceSchema.parse(req.body);
      
      // In a real implementation, this would fetch actual token balances from the blockchain
      // For now, return mock data based on the chain type
      let balances = [];
      
      switch (data.chainType) {
        case 'solana':
          balances = [
            { token: 'SOL', amount: 1.25, usdValue: 125.00 },
            { token: 'GAMI', amount: 500, usdValue: 50.00 },
          ];
          break;
        case 'ethereum':
          balances = [
            { token: 'ETH', amount: 0.5, usdValue: 1000.00 },
            { token: 'GAMI', amount: 300, usdValue: 30.00 },
          ];
          break;
        default:
          balances = [
            { token: data.chainType.toUpperCase(), amount: 10, usdValue: 100.00 },
            { token: 'GAMI', amount: 200, usdValue: 20.00 },
          ];
      }
      
      res.status(200).json({ success: true, balances });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      
      res.status(500).json({ error: "Error fetching wallet balances" });
    }
  });
  
  // Send a transaction
  apiRouter.post("/transaction", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const txSchema = z.object({
        fromPublicKey: z.string(),
        chainType: z.enum(['solana', 'ethereum', 'polygon', 'avalanche', 'bsc', 'fantom']),
        toAddress: z.string(),
        amount: z.number().positive(),
        token: z.string().optional(),
        memo: z.string().optional()
      });
      
      const data = txSchema.parse(req.body);
      
      // Generate a mock transaction hash
      const txHash = `tx_${data.chainType}_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
      
      // In a real implementation, this would create and send a transaction on the specified blockchain
      res.status(200).json({
        success: true,
        txHash,
        amount: data.amount,
        token: data.token || data.chainType.toUpperCase(),
        timestamp: new Date()
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      
      res.status(500).json({ error: "Error creating transaction" });
    }
  });
  
  // Send a Solana transaction (special handler for Solana)
  apiRouter.post("/solana/transaction", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const txSchema = z.object({
        fromPublicKey: z.string(),
        toAddress: z.string(),
        amount: z.number().positive(),
        token: z.string().optional(),
        memo: z.string().optional()
      });
      
      const data = txSchema.parse(req.body);
      
      // Generate a mock Solana transaction hash
      const txHash = `sol_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
      
      // In a real implementation, this would create a Solana transaction using web3.js
      res.status(200).json({
        success: true,
        txHash,
        token: data.token || 'SOL',
        amount: data.amount,
        timestamp: new Date()
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      
      res.status(500).json({ error: "Error creating Solana transaction" });
    }
  });
  
  // Cross-chain transfer
  apiRouter.post("/cross-chain/transfer", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const transferSchema = z.object({
        fromChain: z.enum(['solana', 'ethereum', 'polygon', 'avalanche', 'bsc', 'fantom']),
        toChain: z.enum(['solana', 'ethereum', 'polygon', 'avalanche', 'bsc', 'fantom']),
        amount: z.number().positive(),
        tokenAddress: z.string(),
        destinationAddress: z.string(),
        walletPublicKey: z.string()
      });
      
      const data = transferSchema.parse(req.body);
      
      // Generate a mock transfer ID and transaction hash
      const transferId = `wh_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
      const sourceTxHash = `${data.fromChain}_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
      
      // In a real implementation, this would initiate a cross-chain transfer via Wormhole
      res.status(200).json({
        success: true,
        transferId,
        sourceTxHash,
        fromChain: data.fromChain,
        toChain: data.toChain,
        amount: data.amount,
        tokenAddress: data.tokenAddress,
        timestamp: new Date()
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      
      res.status(500).json({ error: "Error initiating cross-chain transfer" });
    }
  });
  
  // Get transfer status
  apiRouter.get("/cross-chain/status/:transferId", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const transferId = req.params.transferId;
      
      // In a real implementation, this would query the actual transfer status
      // For demo purposes, return a random status based on the timestamp in the transfer ID
      const timestamp = parseInt(transferId.split('_')[1]);
      const elapsed = Date.now() - timestamp;
      
      let status;
      let txHash;
      
      if (elapsed < 10000) {
        status = 'initiated';
      } else if (elapsed < 20000) {
        status = 'source_transfer_pending';
        txHash = `source_${transferId}`;
      } else if (elapsed < 30000) {
        status = 'source_transfer_complete';
        txHash = `source_${transferId}`;
      } else if (elapsed < 40000) {
        status = 'wormhole_relay_pending';
        txHash = `source_${transferId}`;
      } else if (elapsed < 50000) {
        status = 'destination_transfer_pending';
        txHash = `dest_${transferId}`;
      } else {
        status = 'completed';
        txHash = `dest_${transferId}`;
      }
      
      res.status(200).json({
        success: true,
        transferId,
        status,
        txHash,
        timestamp: new Date()
      });
    } catch (error) {
      res.status(500).json({ error: "Error fetching transfer status" });
    }
  });
  
  // Get supported chains
  apiRouter.get("/cross-chain/supported-chains", apiKeyAuth, async (req: Request, res: Response) => {
    // In a real implementation, this would query the actual supported chains
    res.status(200).json({
      success: true,
      chains: ['solana', 'ethereum', 'polygon', 'avalanche', 'bsc']
    });
  });
  
  // Get fee estimate
  apiRouter.get("/cross-chain/fee-estimate", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const fromChain = req.query.fromChain as string;
      const toChain = req.query.toChain as string;
      const amount = parseFloat(req.query.amount as string);
      
      if (!fromChain || !toChain || isNaN(amount)) {
        return res.status(400).json({ error: "Invalid parameters" });
      }
      
      // Calculate a mock fee based on the chains and amount
      let fee = 0;
      let token = '';
      
      if (fromChain === 'solana') {
        fee = 0.001;
        token = 'SOL';
      } else if (fromChain === 'ethereum') {
        fee = 0.005;
        token = 'ETH';
      } else {
        fee = 0.01;
        token = fromChain.toUpperCase();
      }
      
      // Add a small percentage of the amount
      fee += amount * 0.005;
      
      res.status(200).json({
        success: true,
        fee: parseFloat(fee.toFixed(6)),
        token,
        fromChain,
        toChain,
        amount
      });
    } catch (error) {
      res.status(500).json({ error: "Error calculating fee estimate" });
    }
  });
  
  // Get transfer history
  apiRouter.get("/cross-chain/history", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const walletPublicKey = req.query.walletPublicKey as string;
      
      if (!walletPublicKey) {
        return res.status(400).json({ error: "Wallet public key is required" });
      }
      
      // Mock transfer history
      const transfers = [
        {
          id: `wh_${Date.now() - 3600000}_${Math.floor(Math.random() * 1000000)}`,
          fromChain: 'solana',
          toChain: 'ethereum',
          amount: 10,
          token: 'GAMI',
          status: 'completed',
          sourceTxHash: `sol_${Date.now() - 3600000}_${Math.floor(Math.random() * 1000000)}`,
          destinationTxHash: `eth_${Date.now() - 3550000}_${Math.floor(Math.random() * 1000000)}`,
          timestamp: new Date(Date.now() - 3600000)
        },
        {
          id: `wh_${Date.now() - 7200000}_${Math.floor(Math.random() * 1000000)}`,
          fromChain: 'ethereum',
          toChain: 'solana',
          amount: 5,
          token: 'GAMI',
          status: 'completed',
          sourceTxHash: `eth_${Date.now() - 7200000}_${Math.floor(Math.random() * 1000000)}`,
          destinationTxHash: `sol_${Date.now() - 7150000}_${Math.floor(Math.random() * 1000000)}`,
          timestamp: new Date(Date.now() - 7200000)
        }
      ];
      
      res.status(200).json({
        success: true,
        transfers
      });
    } catch (error) {
      res.status(500).json({ error: "Error fetching transfer history" });
    }
  });
  
  // Admin dashboard API endpoints
  
  // Get project stats
  apiRouter.get("/admin/stats", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const project = (req as any).project;
      
      const [userCount, xpTransactions, activeCampaigns, rewardsDistributed] = await Promise.all([
        storage.getUserCount(project.id),
        storage.getTotalXpTransactions(project.id),
        storage.getActiveCampaignsCount(project.id),
        storage.getTotalRewardsDistributed(project.id)
      ]);
      
      res.status(200).json({
        activeUsers: userCount,
        xpTransactions,
        activeCampaigns,
        rewardsDistributed
      });
    } catch (error) {
      res.status(500).json({ error: "Error fetching stats" });
    }
  });
  
  // Get XP events
  apiRouter.get("/admin/events", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const project = (req as any).project;
      const eventCounts = await storage.getEventCounts(project.id);
      
      res.status(200).json(eventCounts);
    } catch (error) {
      res.status(500).json({ error: "Error fetching events" });
    }
  });
  
  // Get wallet integrations
  apiRouter.get("/admin/wallet-integrations", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const project = (req as any).project;
      const walletIntegrations = await storage.getWalletIntegrationsByProjectId(project.id);
      
      res.status(200).json(walletIntegrations);
    } catch (error) {
      res.status(500).json({ error: "Error fetching wallet integrations" });
    }
  });
  
  // Update wallet integration
  apiRouter.patch("/admin/wallet-integrations/:id", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      
      const project = (req as any).project;
      const walletIntegration = await storage.getWalletIntegration(id);
      
      if (!walletIntegration) {
        return res.status(404).json({ error: "Wallet integration not found" });
      }
      
      if (walletIntegration.projectId !== project.id) {
        return res.status(403).json({ error: "You don't have access to this wallet integration" });
      }
      
      const updatedWalletIntegration = await storage.updateWalletIntegration(id, {
        isEnabled: req.body.isEnabled !== undefined ? Boolean(req.body.isEnabled) : undefined,
        config: req.body.config !== undefined ? req.body.config : undefined
      });
      
      res.status(200).json(updatedWalletIntegration);
    } catch (error) {
      res.status(500).json({ error: "Error updating wallet integration" });
    }
  });
  
  // Create XP event
  apiRouter.post("/admin/events", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const project = (req as any).project;
      
      const eventSchema = z.object({
        name: z.string().min(3).max(50),
        description: z.string().optional(),
        xpAmount: z.number().int().positive(),
        status: z.enum(["active", "inactive", "testing"]).default("active")
      });
      
      const data = eventSchema.parse(req.body);
      
      const xpEvent = await storage.createXpEvent({
        projectId: project.id,
        name: data.name,
        description: data.description || null,
        xpAmount: data.xpAmount,
        status: data.status
      });
      
      res.status(201).json(xpEvent);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      
      res.status(500).json({ error: "Error creating XP event" });
    }
  });
  
  // Update XP event
  apiRouter.patch("/admin/events/:id", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      
      const project = (req as any).project;
      const xpEvent = await storage.getXpEvent(id);
      
      if (!xpEvent) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      if (xpEvent.projectId !== project.id) {
        return res.status(403).json({ error: "You don't have access to this event" });
      }
      
      const updateSchema = z.object({
        name: z.string().min(3).max(50).optional(),
        description: z.string().optional().nullable(),
        xpAmount: z.number().int().positive().optional(),
        status: z.enum(["active", "inactive", "testing"]).optional()
      });
      
      const data = updateSchema.parse(req.body);
      
      const updatedXpEvent = await storage.updateXpEvent(id, data);
      
      res.status(200).json(updatedXpEvent);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      
      res.status(500).json({ error: "Error updating XP event" });
    }
  });
  
  // Get campaigns
  apiRouter.get("/admin/campaigns", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const project = (req as any).project;
      const campaigns = await storage.getCampaignsByProjectId(project.id);
      
      res.status(200).json(campaigns);
    } catch (error) {
      res.status(500).json({ error: "Error fetching campaigns" });
    }
  });
  
  // Create campaign
  apiRouter.post("/admin/campaigns", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const project = (req as any).project;
      
      const campaignSchema = z.object({
        name: z.string().min(3).max(100),
        description: z.string().optional(),
        startDate: z.string().transform(str => new Date(str)),
        endDate: z.string().transform(str => new Date(str)).optional(),
        rewardAmount: z.number().int().positive().optional(),
        status: z.enum(["active", "inactive", "completed"]).default("active")
      });
      
      const data = campaignSchema.parse(req.body);
      
      const campaign = await storage.createCampaign({
        projectId: project.id,
        name: data.name,
        description: data.description || null,
        startDate: data.startDate,
        endDate: data.endDate || null,
        rewardAmount: data.rewardAmount || null,
        status: data.status
      });
      
      res.status(201).json(campaign);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      
      res.status(500).json({ error: "Error creating campaign" });
    }
  });
  
  // Register API routes
  app.use("/api", apiRouter);
  
  const httpServer = createServer(app);
  
  return httpServer;
}
