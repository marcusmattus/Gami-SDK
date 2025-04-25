import { useState } from "react";
import Layout from "@/components/Layout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface WalletProvider {
  id: number;
  walletType: string;
  isEnabled: boolean;
  config?: Record<string, any>;
}

export default function WalletIntegration() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("wallets");

  // Fetch wallet integrations
  const { data: wallets = [], isLoading } = useQuery<WalletProvider[]>({
    queryKey: ['/api/admin/wallet-integrations'],
  });

  // Update wallet integration
  const updateWalletIntegration = useMutation({
    mutationFn: async ({ id, isEnabled }: { id: number; isEnabled: boolean }) => {
      return apiRequest('PATCH', `/api/admin/wallet-integrations/${id}`, { isEnabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/wallet-integrations'] });
      toast({
        title: "Wallet integration updated",
        description: "Wallet integration settings have been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update wallet integration",
        variant: "destructive",
      });
    },
  });

  const saveAllSettings = async () => {
    try {
      await Promise.all(wallets.map(wallet => 
        updateWalletIntegration.mutate({ id: wallet.id, isEnabled: wallet.isEnabled })
      ));
      
      toast({
        title: "Settings saved",
        description: "All wallet integration settings have been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save wallet settings.",
        variant: "destructive",
      });
    }
  };

  const getWalletDetails = (type: string) => {
    switch (type) {
      case "phantom":
        return {
          name: "Phantom",
          logo: "https://phantom.app/img/logo.png",
          description: "The friendly Solana wallet built for DeFi & NFTs",
          url: "https://phantom.app/"
        };
      case "solflare":
        return {
          name: "Solflare",
          logo: "https://solflare.com/assets/logo.svg",
          description: "Non-custodial wallet for the Solana blockchain",
          url: "https://solflare.com/"
        };
      case "walletconnect":
        return {
          name: "WalletConnect",
          logo: "https://walletconnect.com/walletconnect-logo.png",
          description: "Open protocol for connecting wallets to dApps",
          url: "https://walletconnect.com/"
        };
      default:
        return {
          name: type.charAt(0).toUpperCase() + type.slice(1),
          logo: "",
          description: "Custom wallet integration",
          url: "#"
        };
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto pb-10">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-slate-900">Wallet Integration</h2>
            <p className="mt-1 text-sm text-slate-500">
              Configure wallet connections for your gamification platform
            </p>
          </div>
        </div>

        <Tabs defaultValue="wallets" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="wallets">Wallets</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="implementation">Implementation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="wallets">
            <Card>
              <CardHeader>
                <CardTitle>Wallet Providers</CardTitle>
                <CardDescription>
                  Enable or disable wallet providers for your application
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="p-8 text-center">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
                    <p className="mt-2 text-sm text-slate-500">Loading wallet providers...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {wallets.map((wallet) => {
                      const { name, logo, description, url } = getWalletDetails(wallet.walletType);
                      return (
                        <div key={wallet.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 flex items-center justify-center bg-slate-100 rounded-lg">
                              {logo ? (
                                <img src={logo} alt={name} className="h-8 w-8 rounded" />
                              ) : (
                                <span className="text-lg font-medium">{name.slice(0, 2)}</span>
                              )}
                            </div>
                            <div>
                              <h3 className="font-medium">{name}</h3>
                              <p className="text-sm text-slate-500">{description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant={wallet.isEnabled ? "default" : "secondary"}>
                              {wallet.isEnabled ? "Enabled" : "Disabled"}
                            </Badge>
                            <Switch
                              checked={wallet.isEnabled}
                              onCheckedChange={(checked) => 
                                updateWalletIntegration.mutate({ id: wallet.id, isEnabled: checked })
                              }
                            />
                          </div>
                        </div>
                      );
                    })}
                    
                    <div className="flex justify-end mt-6">
                      <Button onClick={saveAllSettings} disabled={updateWalletIntegration.isPending}>
                        {updateWalletIntegration.isPending ? "Saving..." : "Save All Settings"}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Alert className="mt-8">
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>Important Information</AlertTitle>
              <AlertDescription>
                Users will only be able to connect with the wallet providers you have enabled. Make sure to test wallet connections before enabling them in production.
              </AlertDescription>
            </Alert>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Wallet Connection Settings</CardTitle>
                <CardDescription>
                  Configure general settings for wallet connections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Auto-Connect</h3>
                      <p className="text-sm text-slate-500">Automatically attempt to reconnect to the previously used wallet</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Display Wallet Selector</h3>
                      <p className="text-sm text-slate-500">Show wallet selection UI when multiple wallets are available</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Require Wallet Connection</h3>
                      <p className="text-sm text-slate-500">Require users to connect a wallet before earning rewards</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Enable Transaction Notifications</h3>
                      <p className="text-sm text-slate-500">Show notifications for successful wallet transactions</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex justify-end mt-6">
                    <Button>Save Settings</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="implementation">
            <Card>
              <CardHeader>
                <CardTitle>Implementation Guide</CardTitle>
                <CardDescription>
                  How to integrate wallet connections in your application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-medium mb-2">1. Add the SDK to your project</h3>
                    <div className="bg-slate-800 text-slate-100 rounded-md p-3 font-mono text-sm overflow-x-auto">
                      <pre>{`npm install @gami-protocol/sdk`}</pre>
                    </div>
                  </div>

                  <Separator />
                  
                  <div>
                    <h3 className="text-base font-medium mb-2">2. Initialize the SDK</h3>
                    <div className="bg-slate-800 text-slate-100 rounded-md p-3 font-mono text-sm overflow-x-auto">
                      <pre>{`import { GamiSDK } from '@gami-protocol/sdk';

const gamiSDK = new GamiSDK({
  apiKey: 'your-api-key-here',
  projectId: 'your-project-id',
  environment: 'production'
});`}</pre>
                    </div>
                  </div>

                  <Separator />
                  
                  <div>
                    <h3 className="text-base font-medium mb-2">3. Connect to a wallet</h3>
                    <div className="bg-slate-800 text-slate-100 rounded-md p-3 font-mono text-sm overflow-x-auto">
                      <pre>{`// Connect to a wallet
async function connectWallet() {
  try {
    const result = await gamiSDK.connectWallet({
      walletType: 'phantom', // or 'solflare'
      onSuccess: (publicKey) => {
        console.log('Connected wallet:', publicKey);
        // Update your UI to show connected state
      },
      onError: (error) => {
        console.error('Wallet connection error:', error);
        // Handle connection error
      }
    });
    
    if (result.success) {
      // Connection successful
      return result.publicKey;
    }
  } catch (error) {
    console.error('Failed to connect wallet:', error);
  }
}`}</pre>
                    </div>
                  </div>

                  <Separator />
                  
                  <div>
                    <h3 className="text-base font-medium mb-2">4. Create a wallet connection button</h3>
                    <div className="bg-slate-800 text-slate-100 rounded-md p-3 font-mono text-sm overflow-x-auto">
                      <pre>{`function WalletConnectButton() {
  const [connecting, setConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);

  async function handleConnect() {
    setConnecting(true);
    try {
      const publicKey = await connectWallet();
      setWalletAddress(publicKey);
    } finally {
      setConnecting(false);
    }
  }

  return (
    <button 
      onClick={handleConnect}
      disabled={connecting}
    >
      {connecting ? 'Connecting...' : walletAddress ? 'Connected' : 'Connect Wallet'}
    </button>
  );
}`}</pre>
                    </div>
                  </div>

                  <Alert className="mt-4">
                    <InfoIcon className="h-4 w-4" />
                    <AlertTitle>Best Practices</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>Always handle connection errors gracefully</li>
                        <li>Store wallet connection state in your application</li>
                        <li>Provide clear guidance to users who don't have a wallet installed</li>
                        <li>Test your integration thoroughly with each enabled wallet provider</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
