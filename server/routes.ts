import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { trackEventSchema, connectWalletSchema } from "@shared/schema";
import express from "express";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  const apiRouter = express.Router();
  
  // Authentication middleware to verify API key
  const apiKeyAuth = async (req: Request, res: Response, next: Function) => {
    const apiKey = req.headers["x-api-key"] as string;
    
    if (!apiKey) {
      return res.status(401).json({ error: "API key is required" });
    }
    
    try {
      const project = await storage.getProjectByApiKey(apiKey);
      
      if (!project) {
        return res.status(401).json({ error: "Invalid API key" });
      }
      
      if (project.status !== "active") {
        return res.status(403).json({ error: "Project is not active" });
      }
      
      // Add project to request for use in route handlers
      (req as any).project = project;
      next();
    } catch (error) {
      res.status(500).json({ error: "Error authenticating API key" });
    }
  };
  
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
