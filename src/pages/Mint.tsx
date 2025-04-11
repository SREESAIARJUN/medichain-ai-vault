
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Wallet, Loader2, CheckCircle, XCircle, ShieldCheck, FileCheck } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Mock wallet connection function
const connectWallet = async (): Promise<{address: string, connected: boolean}> => {
  // In production, implement actual Martian or Petra wallet connection
  await new Promise(resolve => setTimeout(resolve, 1500));
  return {
    address: `0x${Math.random().toString(36).substring(2, 15)}`,
    connected: true
  };
};

// Mock NFT minting function
const mintNFT = async (address: string, cid: string, name: string, description: string): Promise<{hash: string, success: boolean}> => {
  // In production, implement actual Aptos NFT minting
  await new Promise(resolve => setTimeout(resolve, 2000));
  return {
    hash: `0x${Math.random().toString(36).substring(2, 34)}`,
    success: true
  };
};

const Mint = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletConnecting, setWalletConnecting] = useState(false);
  const [mintingStatus, setMintingStatus] = useState<"idle" | "minting" | "success" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [nftName, setNftName] = useState("Medical Record");
  const [nftDescription, setNftDescription] = useState("");
  const [ipfsCid, setIpfsCid] = useState<string | null>(null);
  
  useEffect(() => {
    // Retrieve IPFS CID from localStorage if available
    const storedCid = localStorage.getItem("medichainkCid");
    if (storedCid) {
      setIpfsCid(storedCid);
    }
    
    const storedDiagnosis = localStorage.getItem("medichain-diagnosis");
    if (storedDiagnosis) {
      setNftName(`Medical Record: ${storedDiagnosis}`);
      setNftDescription(`Encrypted medical diagnosis record for ${storedDiagnosis}. Created on ${new Date().toLocaleDateString()}.`);
    }
  }, []);

  const handleConnectWallet = async () => {
    setWalletConnecting(true);
    
    try {
      const { address, connected } = await connectWallet();
      
      if (connected) {
        setWalletAddress(address);
        toast({
          title: "Wallet Connected",
          description: `Connected to ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
        });
      } else {
        toast({
          title: "Connection Failed",
          description: "Could not connect to wallet. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
      toast({
        title: "Connection Error",
        description: "An error occurred while connecting to wallet.",
        variant: "destructive",
      });
    } finally {
      setWalletConnecting(false);
    }
  };

  const handleMintNFT = async () => {
    if (!walletAddress || !ipfsCid) {
      toast({
        title: "Cannot Mint NFT",
        description: "Wallet connection or IPFS CID is missing.",
        variant: "destructive",
      });
      return;
    }
    
    setMintingStatus("minting");
    setProgress(0);
    
    // Simulate progress animation
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + 5, 95));
    }, 200);
    
    try {
      const { hash, success } = await mintNFT(
        walletAddress,
        ipfsCid,
        nftName,
        nftDescription
      );
      
      if (success) {
        setTransactionHash(hash);
        setMintingStatus("success");
        setProgress(100);
        
        toast({
          title: "NFT Minted Successfully",
          description: "Your medical record is now secured as an NFT on Aptos blockchain.",
        });
        
        // Store the transaction hash for the records page
        const records = JSON.parse(localStorage.getItem("medichain-records") || "[]");
        records.push({
          id: Date.now().toString(),
          name: nftName,
          description: nftDescription,
          cid: ipfsCid,
          txHash: hash,
          timestamp: Date.now(),
        });
        localStorage.setItem("medichain-records", JSON.stringify(records));
        
      } else {
        setMintingStatus("error");
        toast({
          title: "Minting Failed",
          description: "Failed to mint NFT. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("NFT minting error:", error);
      setMintingStatus("error");
      toast({
        title: "Minting Error",
        description: "An error occurred during NFT minting.",
        variant: "destructive",
      });
    } finally {
      clearInterval(interval);
    }
  };

  return (
    <MainLayout>
      <div className="container max-w-4xl mx-auto px-4">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold mb-2">Mint Medical NFT</h1>
          <p className="text-muted-foreground">
            Secure your medical records on the Aptos blockchain as NFTs
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Status & Process */}
          <div className="md:col-span-1">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-medical-blue" />
                  NFT Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1">IPFS Status</p>
                  {ipfsCid ? (
                    <div className="flex items-center text-sm text-medical-green">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span>Data uploaded to IPFS</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-sm text-medical-red">
                      <XCircle className="h-4 w-4 mr-1" />
                      <span>No IPFS data found</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-1">Wallet Status</p>
                  {walletAddress ? (
                    <div className="flex items-center text-sm text-medical-green">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span>Wallet connected</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-sm text-medical-yellow">
                      <Wallet className="h-4 w-4 mr-1" />
                      <span>Not connected</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-1">Minting Status</p>
                  {mintingStatus === "idle" && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span>Ready to mint</span>
                    </div>
                  )}
                  {mintingStatus === "minting" && (
                    <div className="flex items-center text-sm text-medical-blue">
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      <span>Minting in progress</span>
                    </div>
                  )}
                  {mintingStatus === "success" && (
                    <div className="flex items-center text-sm text-medical-green">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span>Minted successfully</span>
                    </div>
                  )}
                  {mintingStatus === "error" && (
                    <div className="flex items-center text-sm text-medical-red">
                      <XCircle className="h-4 w-4 mr-1" />
                      <span>Minting failed</span>
                    </div>
                  )}
                </div>
                
                {mintingStatus === "minting" && (
                  <div className="space-y-2">
                    <p className="text-xs text-center">Minting NFT...</p>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-sm">About Medical NFTs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground space-y-2">
                  <p>
                    MediChain NFTs securely store your medical records on the Aptos blockchain.
                  </p>
                  <p>
                    Each NFT contains metadata pointing to your encrypted IPFS data, ensuring:
                  </p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Ownership verification</li>
                    <li>Tamper-proof records</li>
                    <li>Controlled access</li>
                    <li>Permanent availability</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column: Main Content */}
          <div className="md:col-span-2">
            {mintingStatus === "success" ? (
              <Card className="glass-card border-medical-green/30">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="rounded-full bg-medical-green/20 p-6">
                      <CheckCircle className="h-12 w-12 text-medical-green" />
                    </div>
                  </div>
                  <CardTitle className="text-center">NFT Minted Successfully!</CardTitle>
                  <CardDescription className="text-center">
                    Your medical record is now secured on the Aptos blockchain
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="text-sm font-medium mb-2">Transaction Details</h3>
                    <p className="text-xs font-mono break-all">{transactionHash}</p>
                  </div>
                  
                  <div className="flex flex-col space-y-4 items-center">
                    <p className="text-center text-sm">
                      You can now view your medical record in the Records section.
                    </p>
                    <Button onClick={() => navigate("/records")}>
                      View My Records
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Create Medical NFT</CardTitle>
                  <CardDescription>
                    Mint an NFT containing your encrypted medical record
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Wallet Connection Section */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Step 1: Connect Wallet</h3>
                    <p className="text-xs text-muted-foreground">
                      Connect your Aptos wallet to mint the NFT
                    </p>
                    
                    <Button
                      className="w-full"
                      onClick={handleConnectWallet}
                      disabled={!!walletAddress || walletConnecting}
                    >
                      {walletConnecting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : walletAddress ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Connected: {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
                        </>
                      ) : (
                        <>
                          <Wallet className="h-4 w-4 mr-2" />
                          Connect Wallet
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {/* NFT Details Section */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Step 2: Set NFT Details</h3>
                    <p className="text-xs text-muted-foreground">
                      Enter details for your medical NFT record
                    </p>
                    
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="nftName" className="text-sm">
                          Name
                        </label>
                        <Input
                          id="nftName"
                          value={nftName}
                          onChange={(e) => setNftName(e.target.value)}
                          placeholder="Give your medical record a name"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="nftDescription" className="text-sm">
                          Description (optional)
                        </label>
                        <Textarea
                          id="nftDescription"
                          value={nftDescription}
                          onChange={(e) => setNftDescription(e.target.value)}
                          placeholder="Add a description to your medical record"
                          className="mt-1"
                          rows={3}
                        />
                      </div>
                      
                      {ipfsCid && (
                        <div>
                          <p className="text-xs mb-1">IPFS CID:</p>
                          <p className="text-xs font-mono truncate bg-muted p-2 rounded">
                            {ipfsCid}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Mint Button Section */}
                  <div className="pt-2">
                    <Button
                      className="w-full"
                      onClick={handleMintNFT}
                      disabled={!walletAddress || !ipfsCid || mintingStatus === "minting"}
                    >
                      {mintingStatus === "minting" ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Minting NFT...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-4 w-4 mr-2" />
                          Mint Medical NFT
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {!ipfsCid && (
                    <div className="text-xs text-medical-red flex items-center justify-center">
                      <XCircle className="h-4 w-4 mr-2" />
                      No encrypted data found. Please complete the encryption step first.
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Mint;
