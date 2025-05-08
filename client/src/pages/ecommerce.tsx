import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { EcommerceIntegration, PartnerRegistrationData, CustomerOnboardingData, AwardPointsData, RedeemPointsData } from '../sdk/ecommerce-integration';

export default function EcommercePage() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [sdkInstance, setSdkInstance] = useState<EcommerceIntegration | null>(null);

  // Partner form
  const [partnerName, setPartnerName] = useState('');
  const [partnerDeepLinkUrl, setPartnerDeepLinkUrl] = useState('');

  // Customer form
  const [partnerId, setPartnerId] = useState('');
  const [externalCustomerId, setExternalCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  // Points form
  const [pointsAmount, setPointsAmount] = useState(0);
  const [pointsPurpose, setPointsPurpose] = useState('');

  // QR and deep link
  const [universalId, setUniversalId] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [deepLink, setDeepLink] = useState('');

  // Initialize SDK
  const initializeSDK = () => {
    if (!apiKey) {
      toast({
        title: 'API Key Required',
        description: 'Please enter an API key to initialize the SDK',
        variant: 'destructive'
      });
      return;
    }

    try {
      const sdk = new EcommerceIntegration(apiKey);
      setSdkInstance(sdk);
      toast({
        title: 'SDK Initialized',
        description: 'E-commerce integration SDK is ready to use',
      });
    } catch (error) {
      toast({
        title: 'Initialization Failed',
        description: error instanceof Error ? error.message : 'Could not initialize SDK',
        variant: 'destructive'
      });
    }
  };

  // Register a partner
  const registerPartner = async () => {
    if (!sdkInstance) {
      toast({
        title: 'SDK Not Initialized',
        description: 'Please initialize the SDK first',
        variant: 'destructive'
      });
      return;
    }

    if (!partnerName) {
      toast({
        title: 'Partner Name Required',
        description: 'Please enter a partner name',
        variant: 'destructive'
      });
      return;
    }

    try {
      const partnerData: PartnerRegistrationData = {
        partnerName,
        deepLinkUrl: partnerDeepLinkUrl || undefined
      };

      const result = await sdkInstance.registerPartner(partnerData);
      toast({
        title: 'Partner Registered',
        description: `Partner ID: ${result.partnerId}`,
      });

      // Set the partner ID for customer onboarding
      setPartnerId(result.partnerId);
    } catch (error) {
      toast({
        title: 'Registration Failed',
        description: error instanceof Error ? error.message : 'Failed to register partner',
        variant: 'destructive'
      });
    }
  };

  // Onboard a customer
  const onboardCustomer = async () => {
    if (!sdkInstance) {
      toast({
        title: 'SDK Not Initialized',
        description: 'Please initialize the SDK first',
        variant: 'destructive'
      });
      return;
    }

    if (!partnerId || !externalCustomerId) {
      toast({
        title: 'Required Fields Missing',
        description: 'Partner ID and External Customer ID are required',
        variant: 'destructive'
      });
      return;
    }

    try {
      const customerData: CustomerOnboardingData = {
        partnerId,
        externalCustomerId,
        name: customerName || undefined,
        email: customerEmail || undefined
      };

      const result = await sdkInstance.onboardCustomer(customerData);
      
      toast({
        title: 'Customer Onboarded',
        description: `Universal ID: ${result.universalId}`,
      });

      // Set universal ID, QR code and deep link
      setUniversalId(result.universalId);
      setQrCode(result.qrCode);
      setDeepLink(result.deepLink);
    } catch (error) {
      toast({
        title: 'Onboarding Failed',
        description: error instanceof Error ? error.message : 'Failed to onboard customer',
        variant: 'destructive'
      });
    }
  };

  // Award points
  const awardPoints = async () => {
    if (!sdkInstance) {
      toast({
        title: 'SDK Not Initialized',
        description: 'Please initialize the SDK first',
        variant: 'destructive'
      });
      return;
    }

    if (!partnerId || !externalCustomerId || pointsAmount <= 0) {
      toast({
        title: 'Required Fields Missing',
        description: 'Partner ID, External Customer ID, and a positive Points Amount are required',
        variant: 'destructive'
      });
      return;
    }

    try {
      const pointsData: AwardPointsData = {
        partnerId,
        externalCustomerId,
        points: pointsAmount,
        metadata: {
          note: 'Points awarded via SDK integration demo'
        }
      };

      const result = await sdkInstance.awardPoints(pointsData);
      toast({
        title: 'Points Awarded',
        description: `Added ${pointsAmount} points. New balance: ${result.balance}`,
      });
    } catch (error) {
      toast({
        title: 'Award Failed',
        description: error instanceof Error ? error.message : 'Failed to award points',
        variant: 'destructive'
      });
    }
  };

  // Redeem points
  const redeemPoints = async () => {
    if (!sdkInstance) {
      toast({
        title: 'SDK Not Initialized',
        description: 'Please initialize the SDK first',
        variant: 'destructive'
      });
      return;
    }

    if (!partnerId || !externalCustomerId || pointsAmount <= 0 || !pointsPurpose) {
      toast({
        title: 'Required Fields Missing',
        description: 'Partner ID, External Customer ID, Points Amount, and Purpose are required',
        variant: 'destructive'
      });
      return;
    }

    try {
      const pointsData: RedeemPointsData = {
        partnerId,
        externalCustomerId,
        points: pointsAmount,
        purpose: pointsPurpose,
        metadata: {
          note: 'Points redeemed via SDK integration demo'
        }
      };

      const result = await sdkInstance.redeemPoints(pointsData);
      toast({
        title: 'Points Redeemed',
        description: `Redeemed ${pointsAmount} points. New balance: ${result.balance}`,
      });
    } catch (error) {
      toast({
        title: 'Redemption Failed',
        description: error instanceof Error ? error.message : 'Failed to redeem points',
        variant: 'destructive'
      });
    }
  };

  // Check balance
  const checkBalance = async () => {
    if (!sdkInstance) {
      toast({
        title: 'SDK Not Initialized',
        description: 'Please initialize the SDK first',
        variant: 'destructive'
      });
      return;
    }

    if (!partnerId || !externalCustomerId) {
      toast({
        title: 'Required Fields Missing',
        description: 'Partner ID and External Customer ID are required',
        variant: 'destructive'
      });
      return;
    }

    try {
      const result = await sdkInstance.getCustomerBalance(externalCustomerId, partnerId);
      toast({
        title: 'Current Balance',
        description: `Customer has ${result.balance} points`,
      });
    } catch (error) {
      toast({
        title: 'Balance Check Failed',
        description: error instanceof Error ? error.message : 'Failed to check balance',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">E-commerce Integration Demo</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Initialize SDK</CardTitle>
          <CardDescription>Enter your API key to initialize the E-commerce SDK</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Your API Key"
              className="flex-1"
            />
            <Button onClick={initializeSDK}>Initialize</Button>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="partner" className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="partner">Register Partner</TabsTrigger>
          <TabsTrigger value="customer">Onboard Customer</TabsTrigger>
          <TabsTrigger value="points">Manage Points</TabsTrigger>
          <TabsTrigger value="qr">QR & Deep Links</TabsTrigger>
          <TabsTrigger value="docs">Documentation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="partner">
          <Card>
            <CardHeader>
              <CardTitle>Partner Registration</CardTitle>
              <CardDescription>Register a new partner business</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="partnerName">Partner Name</Label>
                <Input
                  id="partnerName"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="My E-commerce Store"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deepLinkUrl">Deep Link URL (Optional)</Label>
                <Input
                  id="deepLinkUrl"
                  value={partnerDeepLinkUrl}
                  onChange={(e) => setPartnerDeepLinkUrl(e.target.value)}
                  placeholder="myapp://open"
                />
              </div>
              
              <Button onClick={registerPartner} className="w-full">Register Partner</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="customer">
          <Card>
            <CardHeader>
              <CardTitle>Customer Onboarding</CardTitle>
              <CardDescription>Onboard a new customer to the universal system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="partnerId">Partner ID</Label>
                  <Input
                    id="partnerId"
                    value={partnerId}
                    onChange={(e) => setPartnerId(e.target.value)}
                    placeholder="partner_123"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="externalCustomerId">External Customer ID</Label>
                  <Input
                    id="externalCustomerId"
                    value={externalCustomerId}
                    onChange={(e) => setExternalCustomerId(e.target.value)}
                    placeholder="customer_456"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name (Optional)</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Customer Email (Optional)</Label>
                  <Input
                    id="customerEmail"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              
              <Button onClick={onboardCustomer} className="w-full">Onboard Customer</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="points">
          <Card>
            <CardHeader>
              <CardTitle>Points Management</CardTitle>
              <CardDescription>Award and redeem points for customers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="partnerId2">Partner ID</Label>
                  <Input
                    id="partnerId2"
                    value={partnerId}
                    onChange={(e) => setPartnerId(e.target.value)}
                    placeholder="partner_123"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="externalCustomerId2">External Customer ID</Label>
                  <Input
                    id="externalCustomerId2"
                    value={externalCustomerId}
                    onChange={(e) => setExternalCustomerId(e.target.value)}
                    placeholder="customer_456"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pointsAmount">Points Amount</Label>
                  <Input
                    id="pointsAmount"
                    type="number"
                    value={pointsAmount}
                    onChange={(e) => setPointsAmount(Number(e.target.value))}
                    placeholder="100"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pointsPurpose">Purpose (for redemption)</Label>
                  <Input
                    id="pointsPurpose"
                    value={pointsPurpose}
                    onChange={(e) => setPointsPurpose(e.target.value)}
                    placeholder="Store discount"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <Button onClick={awardPoints} variant="default">Award Points</Button>
                <Button onClick={redeemPoints} variant="secondary">Redeem Points</Button>
                <Button onClick={checkBalance} variant="outline">Check Balance</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="qr">
          <Card>
            <CardHeader>
              <CardTitle>QR Codes & Deep Links</CardTitle>
              <CardDescription>View generated QR code and deep link for customer onboarding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="universalId">Universal ID</Label>
                <Input
                  id="universalId"
                  value={universalId}
                  onChange={(e) => setUniversalId(e.target.value)}
                  placeholder="univ_abc123"
                  readOnly
                />
              </div>
              
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label>QR Code</Label>
                  {qrCode ? (
                    <div className="border rounded-lg p-4 flex items-center justify-center" 
                      dangerouslySetInnerHTML={{ __html: qrCode }} />
                  ) : (
                    <div className="border rounded-lg p-12 flex items-center justify-center text-gray-400">
                      No QR code generated yet
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Deep Link</Label>
                  {deepLink ? (
                    <div className="border rounded-lg p-4 h-full flex flex-col">
                      <div className="flex-1 flex items-center justify-center">
                        <code className="bg-gray-100 p-2 rounded text-sm break-all">
                          {deepLink}
                        </code>
                      </div>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => {
                          navigator.clipboard.writeText(deepLink);
                          toast({
                            title: 'Deep Link Copied',
                            description: 'The deep link URL has been copied to your clipboard'
                          });
                        }}
                      >
                        Copy to Clipboard
                      </Button>
                    </div>
                  ) : (
                    <div className="border rounded-lg p-12 flex items-center justify-center text-gray-400">
                      No deep link generated yet
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="docs">
          <Card>
            <CardHeader>
              <CardTitle>SDK Documentation</CardTitle>
              <CardDescription>Learn how to integrate the Gami Protocol E-commerce SDK</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Installation</h3>
                <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                  <code>npm install @gami-protocol/sdk</code>
                </pre>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Basic Usage</h3>
                <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                  <code>{`import { EcommerceIntegration } from '@gami-protocol/sdk';

// Initialize the SDK
const sdk = new EcommerceIntegration('your-api-key');

// Register a partner business
const partner = await sdk.registerPartner({
  partnerName: 'My E-commerce Store',
  deepLinkUrl: 'myapp://open'
});

// Onboard a customer
const customer = await sdk.onboardCustomer({
  partnerId: partner.partnerId,
  externalCustomerId: 'customer_123',
  name: 'John Doe',
  email: 'john@example.com'
});

// Award points
const awardResult = await sdk.awardPoints({
  partnerId: partner.partnerId,
  externalCustomerId: 'customer_123',
  points: 100
});

// Redeem points
const redeemResult = await sdk.redeemPoints({
  partnerId: partner.partnerId,
  externalCustomerId: 'customer_123',
  points: 50,
  purpose: 'Store discount'
});

// Check balance
const balance = await sdk.getCustomerBalance(
  'customer_123',
  partner.partnerId
);

// Check if customer exists
const exists = await sdk.customerExists(
  'customer_123',
  partner.partnerId
);`}</code>
                </pre>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Available Methods</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">registerPartner(data)</h4>
                    <p className="text-sm text-gray-600">Register a new partner business to the Gami Protocol.</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium">onboardCustomer(data)</h4>
                    <p className="text-sm text-gray-600">Onboard a customer to the universal system with QR code and deep link.</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium">generateQRCode(universalId, format)</h4>
                    <p className="text-sm text-gray-600">Generate a QR code for a customer.</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium">generateDeepLink(universalId)</h4>
                    <p className="text-sm text-gray-600">Generate a deep link for mobile app onboarding.</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium">awardPoints(data)</h4>
                    <p className="text-sm text-gray-600">Award points to a customer.</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium">redeemPoints(data)</h4>
                    <p className="text-sm text-gray-600">Redeem points from a customer's balance.</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium">getCustomerBalance(externalCustomerId, partnerId)</h4>
                    <p className="text-sm text-gray-600">Get a customer's points balance.</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium">customerExists(externalCustomerId, partnerId)</h4>
                    <p className="text-sm text-gray-600">Check if a customer exists in the universal system.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}