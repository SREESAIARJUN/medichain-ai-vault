
import { Button } from "@/components/ui/button";
import { Activity, Brain, Shield, Palette, Database } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MainLayout } from "@/components/layout/MainLayout";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <MainLayout>
      <div className="space-y-12 py-8">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <div className="inline-block p-2 rounded-full bg-primary/10 mb-4">
            <Activity className="h-7 w-7 text-primary" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-medical-blue via-medical-purple to-medical-teal bg-clip-text text-transparent animate-fade-in">
            MediChain AI Vault
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Secure your medical insights with AI diagnostics and blockchain storage.
            Powered by Gemini AI and Aptos blockchain.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Button asChild size="lg" className="rounded-full">
              <Link to="/chat">Start AI Diagnosis</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link to="/records">View Medical Records</Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-8">
          <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <Card className="glass-card overflow-hidden">
              <CardHeader className="pb-2 pt-6">
                <div className="mb-2 p-2 w-10 h-10 rounded-full bg-medical-blue/20 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-medical-blue" />
                </div>
                <CardTitle>AI Health Diagnosis</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Chat with our AI assistant using Gemini API to analyze your symptoms and get immediate health insights.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="glass-card overflow-hidden">
              <CardHeader className="pb-2 pt-6">
                <div className="mb-2 p-2 w-10 h-10 rounded-full bg-medical-purple/20 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-medical-purple" />
                </div>
                <CardTitle>Secure Encryption</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Your medical data is encrypted with AES-256 encryption before being stored, ensuring maximum privacy.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="glass-card overflow-hidden">
              <CardHeader className="pb-2 pt-6">
                <div className="mb-2 p-2 w-10 h-10 rounded-full bg-medical-teal/20 flex items-center justify-center">
                  <Database className="h-5 w-5 text-medical-teal" />
                </div>
                <CardTitle>Decentralized Storage</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Store your encrypted medical records on IPFS for permanent, decentralized access that you control.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="glass-card overflow-hidden">
              <CardHeader className="pb-2 pt-6">
                <div className="mb-2 p-2 w-10 h-10 rounded-full bg-medical-green/20 flex items-center justify-center">
                  <Palette className="h-5 w-5 text-medical-green" />
                </div>
                <CardTitle>NFT Records</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Mint your medical records as NFTs on Aptos blockchain for verifiable ownership and easy access.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-12">
          <div className="max-w-3xl mx-auto p-8 rounded-xl glass-card bg-gradient-to-br from-medical-blue/20 to-medical-purple/20">
            <h2 className="text-3xl font-bold mb-4">Ready to secure your health data?</h2>
            <p className="text-lg mb-6 text-muted-foreground">
              Start using MediChain AI Vault today to get AI-powered health insights and securely store them on blockchain.
            </p>
            <Button asChild size="lg" className="rounded-full">
              <Link to="/chat">Start Using MediChain AI</Link>
            </Button>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default Index;
