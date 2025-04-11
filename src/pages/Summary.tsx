
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2, Copy, Shield, Upload, ChevronRight, ClipboardCopy, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface DiagnosisResult {
  diagnosis: string;
  causes: string[];
  suggestions: string[];
  risk_level: string;
  followup_needed: boolean;
  additional_notes: string;
}

// Mock function for AES-256 encryption
const encryptData = async (data: any, password: string): Promise<string> => {
  console.log("Encrypting data with password:", password);
  // For development purposes, simulating encryption delay
  await new Promise(resolve => setTimeout(resolve, 800));
  // In production, implement actual AES-256 encryption
  return `encrypted_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

// Mock function for IPFS upload
const uploadToIPFS = async (encryptedData: string): Promise<string> => {
  console.log("Uploading to IPFS:", encryptedData);
  // For development purposes, simulating upload delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  // In production, implement actual IPFS upload via Lighthouse or Pinata
  return `ipfs://Qm${Math.random().toString(36).substring(2, 34)}`;
};

const Summary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [encryptionPassword, setEncryptionPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [encryptedData, setEncryptedData] = useState<string | null>(null);
  const [ipfsCid, setIpfsCid] = useState<string | null>(null);
  const [encryptionLoading, setEncryptionLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [step, setStep] = useState<"summary" | "encrypt" | "upload">("summary");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const data = searchParams.get("data");
    
    if (data) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(data));
        setDiagnosisResult(parsedData);
      } catch (error) {
        console.error("Failed to parse diagnosis data:", error);
        toast({
          title: "Error",
          description: "Failed to load diagnosis data.",
          variant: "destructive",
        });
        navigate("/chat");
      }
    } else {
      // Fallback data for development
      setDiagnosisResult({
        diagnosis: "Possible Tension Headache",
        causes: [
          "Stress and anxiety",
          "Poor posture",
          "Dehydration",
          "Eye strain",
          "Lack of sleep"
        ],
        suggestions: [
          "Rest in a quiet, dark room",
          "Apply a cold or warm compress to your head",
          "Stay hydrated",
          "Consider over-the-counter pain relievers like ibuprofen",
          "Practice stress reduction techniques"
        ],
        risk_level: "Low",
        followup_needed: false,
        additional_notes: "If headaches persist for more than 3 days or increase in severity, please consult a healthcare professional."
      });
    }
  }, [location.search, navigate, toast]);

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: "Copied!",
          description: "Content copied to clipboard",
        });
      },
      (err) => {
        console.error("Failed to copy text: ", err);
        toast({
          title: "Copy failed",
          description: "Could not copy to clipboard",
          variant: "destructive",
        });
      }
    );
  };

  const handleEncrypt = async () => {
    if (!diagnosisResult) return;
    
    if (encryptionPassword !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Encryption password and confirmation do not match.",
        variant: "destructive",
      });
      return;
    }
    
    if (encryptionPassword.length < 8) {
      toast({
        title: "Weak password",
        description: "Please use a password with at least 8 characters.",
        variant: "destructive",
      });
      return;
    }
    
    setEncryptionLoading(true);
    setProgress(0);
    
    // Simulate progress animation
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 95));
    }, 100);
    
    try {
      const encrypted = await encryptData(diagnosisResult, encryptionPassword);
      setEncryptedData(encrypted);
      setProgress(100);
      setStep("upload");
      
      toast({
        title: "Encryption successful",
        description: "Your medical data has been encrypted.",
      });
    } catch (error) {
      console.error("Encryption error:", error);
      toast({
        title: "Encryption failed",
        description: "An error occurred during encryption. Please try again.",
        variant: "destructive",
      });
    } finally {
      clearInterval(interval);
      setEncryptionLoading(false);
    }
  };

  const handleUploadToIPFS = async () => {
    if (!encryptedData) return;
    
    setUploadLoading(true);
    setProgress(0);
    
    // Simulate progress animation
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + 5, 95));
    }, 200);
    
    try {
      const cid = await uploadToIPFS(encryptedData);
      setIpfsCid(cid);
      setProgress(100);
      
      toast({
        title: "Upload successful",
        description: "Your encrypted medical data has been uploaded to IPFS.",
      });
      
      // Store in local storage for the minting page
      localStorage.setItem("medichainkCid", cid);
      localStorage.setItem("medichain-diagnosis", diagnosisResult?.diagnosis || "Medical Record");
      
    } catch (error) {
      console.error("IPFS upload error:", error);
      toast({
        title: "Upload failed",
        description: "An error occurred during IPFS upload. Please try again.",
        variant: "destructive",
      });
    } finally {
      clearInterval(interval);
      setUploadLoading(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "high":
        return "text-medical-red";
      case "medium":
        return "text-medical-yellow";
      case "low":
        return "text-medical-green";
      default:
        return "text-medical-blue";
    }
  };

  if (!diagnosisResult) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-medical-blue" />
          <span className="ml-2">Loading diagnosis data...</span>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 text-center">Medical Summary & Storage</h1>
          <p className="text-muted-foreground text-center">
            Review your diagnosis, encrypt it, and securely store it on IPFS.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Steps */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Process Steps</CardTitle>
                <CardDescription>Complete all steps to secure your medical data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full p-2 ${step === "summary" ? "bg-primary" : "bg-muted"}`}>
                      <span className="text-xs font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-medium">Review Summary</p>
                      <p className="text-xs text-muted-foreground">Check your diagnosis details</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full p-2 ${step === "encrypt" ? "bg-primary" : "bg-muted"}`}>
                      <span className="text-xs font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-medium">Encrypt Data</p>
                      <p className="text-xs text-muted-foreground">AES-256 encryption for privacy</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full p-2 ${step === "upload" ? "bg-primary" : "bg-muted"}`}>
                      <span className="text-xs font-bold">3</span>
                    </div>
                    <div>
                      <p className="font-medium">Upload to IPFS</p>
                      <p className="text-xs text-muted-foreground">Store on decentralized network</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Main Content */}
          <div className="md:col-span-2">
            {step === "summary" && (
              <Card className="glass-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{diagnosisResult.diagnosis}</CardTitle>
                    <Badge className={getRiskLevelColor(diagnosisResult.risk_level)}>
                      Risk: {diagnosisResult.risk_level}
                    </Badge>
                  </div>
                  <CardDescription>
                    {diagnosisResult.followup_needed 
                      ? "Professional follow-up recommended" 
                      : "Self-care may be sufficient"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {diagnosisResult.causes.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Possible Causes:</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {diagnosisResult.causes.map((cause, index) => (
                          <li key={index}>{cause}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {diagnosisResult.suggestions.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Recommendations:</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {diagnosisResult.suggestions.map((suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {diagnosisResult.additional_notes && (
                    <div>
                      <h3 className="font-semibold mb-2">Additional Notes:</h3>
                      <p>{diagnosisResult.additional_notes}</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => handleCopyToClipboard(JSON.stringify(diagnosisResult, null, 2))}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Raw Data
                  </Button>
                  <Button onClick={() => setStep("encrypt")}>
                    Continue to Encryption
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardFooter>
              </Card>
            )}

            {step === "encrypt" && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-medical-purple" />
                    Encrypt Medical Data
                  </CardTitle>
                  <CardDescription>
                    Secure your diagnosis with AES-256 encryption before storing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">
                    Create a strong password to encrypt your medical data. You'll need this password later to decrypt and view your information.
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="password" className="text-sm font-medium">
                        Encryption Password
                      </label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter a strong password"
                        value={encryptionPassword}
                        onChange={(e) => setEncryptionPassword(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="confirmPassword" className="text-sm font-medium">
                        Confirm Password
                      </label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  {encryptionLoading && (
                    <div className="space-y-2">
                      <p className="text-sm text-center">Encrypting your data...</p>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep("summary")}>
                    Back to Summary
                  </Button>
                  <Button 
                    onClick={handleEncrypt}
                    disabled={!encryptionPassword || !confirmPassword || encryptionLoading}
                  >
                    {encryptionLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Encrypting...
                      </>
                    ) : (
                      <>
                        Encrypt Data
                        <Shield className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )}

            {step === "upload" && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Upload className="h-5 w-5 mr-2 text-medical-blue" />
                    Store on IPFS
                  </CardTitle>
                  <CardDescription>
                    Upload your encrypted medical data to decentralized storage
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {encryptedData && (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Encrypted Data</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleCopyToClipboard(encryptedData)}
                        >
                          <ClipboardCopy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs font-mono truncate">{encryptedData}</p>
                    </div>
                  )}
                  
                  {ipfsCid ? (
                    <div className="p-4 border border-medical-green/30 bg-medical-green/10 rounded-lg">
                      <div className="flex items-center mb-2">
                        <CheckCircle2 className="h-5 w-5 text-medical-green mr-2" />
                        <span className="font-medium">Successfully Uploaded!</span>
                      </div>
                      <div className="p-3 bg-background rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">IPFS CID:</span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleCopyToClipboard(ipfsCid)}
                          >
                            <ClipboardCopy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs font-mono truncate">{ipfsCid}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm">
                        Your medical data is encrypted and ready to be stored on IPFS (InterPlanetary File System).
                        This decentralized storage ensures your data remains:
                      </p>
                      
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start">
                          <div className="rounded-full bg-medical-blue/20 p-1 mr-2 mt-0.5">
                            <span className="text-xs font-bold">✓</span>
                          </div>
                          <span>Available whenever you need it</span>
                        </li>
                        <li className="flex items-start">
                          <div className="rounded-full bg-medical-blue/20 p-1 mr-2 mt-0.5">
                            <span className="text-xs font-bold">✓</span>
                          </div>
                          <span>Secure and tamper-proof</span>
                        </li>
                        <li className="flex items-start">
                          <div className="rounded-full bg-medical-blue/20 p-1 mr-2 mt-0.5">
                            <span className="text-xs font-bold">✓</span>
                          </div>
                          <span>Decentralized with no central point of failure</span>
                        </li>
                      </ul>
                      
                      {uploadLoading && (
                        <div className="space-y-2">
                          <p className="text-sm text-center">Uploading to IPFS...</p>
                          <Progress value={progress} className="h-2" />
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep("encrypt")}
                    disabled={uploadLoading}
                  >
                    Back
                  </Button>
                  {ipfsCid ? (
                    <Button onClick={() => navigate("/mint")}>
                      Continue to NFT Minting
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleUploadToIPFS}
                      disabled={!encryptedData || uploadLoading}
                    >
                      {uploadLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          Upload to IPFS
                          <Upload className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Summary;
