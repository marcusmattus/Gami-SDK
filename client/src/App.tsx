import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import SdkConfig from "@/pages/sdk-config";
import XPManagement from "@/pages/xp-management";
import WalletIntegration from "@/pages/wallet-integration";
import Campaigns from "@/pages/campaigns";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
import Documentation from "@/pages/documentation";
import AuthPage from "@/pages/auth-page";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/sdk-config" component={SdkConfig} />
      <ProtectedRoute path="/xp-management" component={XPManagement} />
      <ProtectedRoute path="/wallet-integration" component={WalletIntegration} />
      <ProtectedRoute path="/campaigns" component={Campaigns} />
      <ProtectedRoute path="/analytics" component={Analytics} />
      <ProtectedRoute path="/settings" component={Settings} />
      <ProtectedRoute path="/documentation" component={Documentation} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </AuthProvider>
  );
}

export default App;
