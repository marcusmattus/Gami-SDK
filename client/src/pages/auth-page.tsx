import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FaRocket, FaChartLine, FaAward, FaWallet } from "react-icons/fa";

const loginSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if user is already logged in
  if (user) {
    navigate("/dashboard");
    return null;
  }

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onLoginSubmit(data: LoginValues) {
    loginMutation.mutate(data);
  }

  function onRegisterSubmit(data: RegisterValues) {
    registerMutation.mutate({
      username: data.username,
      email: data.email,
      password: data.password,
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full mx-auto flex flex-col lg:flex-row overflow-hidden rounded-xl shadow-xl">
        {/* Hero Section */}
        <div className="lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 p-8 lg:p-12 text-white">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Gami Protocol</h1>
            <p className="text-primary-100">Blockchain-based gamification platform</p>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Boost User Engagement with Blockchain Rewards</h2>
            <p className="text-primary-100">
              Integrate our SDK to add powerful gamification features to your application, including XP tracking, achievements, and token rewards.
            </p>
            
            <div className="space-y-4 mt-8">
              <div className="flex items-start">
                <div className="bg-white/10 p-2 rounded mr-4">
                  <FaRocket className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium">Seamless Integration</h3>
                  <p className="text-sm text-primary-100">Quick implementation with our JavaScript/TypeScript SDK</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-white/10 p-2 rounded mr-4">
                  <FaChartLine className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium">XP & Achievement Tracking</h3>
                  <p className="text-sm text-primary-100">Design custom XP systems and achievement criteria</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-white/10 p-2 rounded mr-4">
                  <FaAward className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium">Reward Campaigns</h3>
                  <p className="text-sm text-primary-100">Create time-limited engagement campaigns with rewards</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-white/10 p-2 rounded mr-4">
                  <FaWallet className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium">Token Rewards</h3>
                  <p className="text-sm text-primary-100">Distribute GAMI tokens as rewards on the Solana blockchain</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Auth Forms */}
        <div className="lg:w-1/2 bg-white p-8 lg:p-12">
          <div className="max-w-md mx-auto">
            <Tabs 
              defaultValue="login" 
              value={activeTab} 
              onValueChange={(value) => setActiveTab(value as "login" | "register")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login">Log In</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>Welcome Back</CardTitle>
                    <CardDescription>Log in to access your Gami Protocol dashboard</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="Your username" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Your password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={loginMutation.isPending}
                        >
                          {loginMutation.isPending ? "Logging in..." : "Log In"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    <Button 
                      variant="link" 
                      onClick={() => setActiveTab("register")}
                      className="text-sm"
                    >
                      Don't have an account? Sign up
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle>Create an Account</CardTitle>
                    <CardDescription>Sign up to start using Gami Protocol</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="Choose a username" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="Your email address" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Create a password" {...field} />
                              </FormControl>
                              <FormDescription>
                                Password must be at least 6 characters
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Confirm your password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={registerMutation.isPending}
                        >
                          {registerMutation.isPending ? "Creating account..." : "Create Account"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    <Button 
                      variant="link" 
                      onClick={() => setActiveTab("login")}
                      className="text-sm"
                    >
                      Already have an account? Log in
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}