import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  ArrowRight, 
  BarChart3, 
  Code2, 
  Medal, 
  Wallet, 
  ZapIcon, 
  LucideGitCompare
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-border bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-6">
            <Link href="/">
              <a className="flex items-center gap-2 font-bold text-xl text-primary">
                <ZapIcon className="h-5 w-5" />
                <span>Gami Protocol</span>
              </a>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth">
              <a className="text-sm font-medium text-muted-foreground hover:text-foreground transition">
                Log In
              </a>
            </Link>
            <Link href="/auth?tab=register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-slate-50 py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-6xl font-bold max-w-3xl leading-tight bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              Blockchain-Based Gamification For Your Application
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
              Integrate our powerful SDK to add custom gamification features like XP tracking, 
              achievements, and blockchain token rewards to boost user engagement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-10">
              <Link href="/auth?tab=register">
                <Button size="lg" className="gap-2">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/documentation">
                <Button size="lg" variant="outline" className="gap-2">
                  Documentation <Code2 className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Core Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to implement a complete gamification system in your application.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-slate-50 border border-border rounded-lg p-6 hover:shadow-md transition">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-5">
                <ZapIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">XP System</h3>
              <p className="text-muted-foreground">
                Reward user activities with experience points based on customizable rules and events.
              </p>
            </div>

            <div className="bg-slate-50 border border-border rounded-lg p-6 hover:shadow-md transition">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-5">
                <Medal className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Achievements</h3>
              <p className="text-muted-foreground">
                Create milestone-based achievements and badges to recognize user accomplishments.
              </p>
            </div>

            <div className="bg-slate-50 border border-border rounded-lg p-6 hover:shadow-md transition">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-5">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Token Rewards</h3>
              <p className="text-muted-foreground">
                Distribute GAMI tokens as rewards on Solana blockchain with built-in wallet integration.
              </p>
            </div>

            <div className="bg-slate-50 border border-border rounded-lg p-6 hover:shadow-md transition">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-5">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Analytics</h3>
              <p className="text-muted-foreground">
                Track user engagement with detailed analytics and reports on activity patterns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Integrate Gami Protocol into your application with just a few simple steps.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 gap-12">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Register & Configure</h3>
                  <p className="text-muted-foreground mb-4">
                    Create an account and configure your first project with custom XP events and reward structures.
                  </p>
                  <div className="p-4 bg-white border border-border rounded-lg">
                    <pre className="text-sm text-muted-foreground overflow-x-auto"><code>{`
// Example configuration
{
  "projectName": "My Game",
  "events": [
    {
      "name": "level_up",
      "xpAmount": 100,
      "description": "User reaches a new level"
    },
    {
      "name": "quest_complete",
      "xpAmount": 50,
      "description": "User completes a quest"
    }
  ]
}
                    `}</code></pre>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Integrate SDK</h3>
                  <p className="text-muted-foreground mb-4">
                    Install our lightweight JavaScript/TypeScript SDK and initialize it with your API key.
                  </p>
                  <div className="p-4 bg-white border border-border rounded-lg">
                    <pre className="text-sm text-muted-foreground overflow-x-auto"><code>{`
// Install SDK
npm install gami-protocol-sdk

// Initialize in your app
import { GamiSDK } from 'gami-protocol-sdk';

const gami = new GamiSDK({
  apiKey: 'your_api_key',
  environment: 'production'
});
                    `}</code></pre>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Track Events</h3>
                  <p className="text-muted-foreground mb-4">
                    Start tracking user activities and awarding XP based on your configured events.
                  </p>
                  <div className="p-4 bg-white border border-border rounded-lg">
                    <pre className="text-sm text-muted-foreground overflow-x-auto"><code>{`
// Track an event when user completes an action
gami.trackEvent({
  userId: 'user_12345',
  event: 'quest_complete',
  metadata: {
    questId: 'dragon_slayer',
    difficulty: 'hard'
  }
});
                    `}</code></pre>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
                  4
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Manage Rewards</h3>
                  <p className="text-muted-foreground mb-4">
                    Set up campaigns and distribute token rewards to your most engaged users.
                  </p>
                  <div className="p-4 bg-white border border-border rounded-lg">
                    <pre className="text-sm text-muted-foreground overflow-x-auto"><code>{`
// Connect user wallet
await gami.connectWallet({
  walletType: 'phantom'
});

// Create a reward distribution
await gami.createRewardDistribution({
  userId: 'user_12345',
  campaignId: 1,
  tokenAmount: 50
});
                    `}</code></pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Get Started CTA */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-400 text-white">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Boost User Engagement?</h2>
          <p className="text-lg text-primary-100 max-w-2xl mx-auto mb-10">
            Start integrating blockchain-based gamification into your application today.
            No blockchain experience required.
          </p>
          <Link href="/auth?tab=register">
            <Button size="lg" variant="secondary" className="gap-2">
              Create Your Free Account <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-border">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div className="md:w-1/3">
              <div className="flex items-center gap-2 font-bold text-lg text-primary mb-4">
                <ZapIcon className="h-5 w-5" />
                <span>Gami Protocol</span>
              </div>
              <p className="text-muted-foreground mb-6">
                Blockchain-based gamification platform for modern applications.
                Boost engagement with XP tracking, achievements, and token rewards.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-medium mb-4">Product</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-muted-foreground hover:text-primary">Features</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-primary">Pricing</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-primary">SDK</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-primary">API</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-4">Resources</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-muted-foreground hover:text-primary">Documentation</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-primary">Guides</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-primary">Examples</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-primary">Blog</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-4">Company</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-muted-foreground hover:text-primary">About</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-primary">Contact</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-primary">Privacy</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-primary">Terms</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground text-sm">
            <p>© {new Date().getFullYear()} Gami Protocol. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}