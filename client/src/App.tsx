import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import SdkConfig from "@/pages/sdk-config";
import XPManagement from "@/pages/xp-management";
import WalletIntegration from "@/pages/wallet-integration";
import Campaigns from "@/pages/campaigns";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
import Documentation from "@/pages/documentation";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/sdk-config" component={SdkConfig} />
      <Route path="/xp-management" component={XPManagement} />
      <Route path="/wallet-integration" component={WalletIntegration} />
      <Route path="/campaigns" component={Campaigns} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/settings" component={Settings} />
      <Route path="/documentation" component={Documentation} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Router />
    </TooltipProvider>
  );
}

export default App;
