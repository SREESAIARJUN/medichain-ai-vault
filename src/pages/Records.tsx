
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { FileText, Wallet, Shield, LockKeyhole, Unlock, CalendarDays, Search, FileCheck } from "lucide-react";
import { format } from "date-fns";

interface MedicalRecord {
  id: string;
  name: string;
  description: string;
  cid: string;
  txHash: string;
  timestamp: number;
  decrypted?: boolean;
}

// Mock function for decrypting data
const decryptData = async (cid: string, password: string): Promise<string> => {
  console.log(`Attempting to decrypt data with CID ${cid}`);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // In production, implement actual decryption using AES-256
  return JSON.stringify({
    diagnosis: "Possible Tension Headache",
    causes: ["Stress and anxiety", "Poor posture", "Dehydration"],
    suggestions: ["Rest", "Stay hydrated", "Consider OTC pain relievers"],
    risk_level: "Low",
    additional_notes: "If headaches persist, please consult a healthcare professional."
  });
};

const Records = () => {
  const { toast } = useToast();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletConnecting, setWalletConnecting] = useState(false);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [isDecryptDialogOpen, setIsDecryptDialogOpen] = useState(false);
  const [decryptionPassword, setDecryptionPassword] = useState("");
  const [decryptedData, setDecryptedData] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  useEffect(() => {
    // Load records from localStorage
    const storedRecords = localStorage.getItem("medichain-records");
    if (storedRecords) {
      const parsedRecords = JSON.parse(storedRecords);
      setRecords(parsedRecords);
      setFilteredRecords(parsedRecords);
    } else {
      // Sample data for demonstration
      const sampleRecords: MedicalRecord[] = [
        {
          id: "1",
          name: "Tension Headache Diagnosis",
          description: "AI diagnosis for recurring headaches",
          cid: "ipfs://QmSample1",
          txHash: "0xsample1",
          timestamp: Date.now() - 1000 * 60 * 60 * 24 * 7, // 7 days ago
        },
        {
          id: "2",
          name: "Annual Health Checkup",
          description: "Results from annual physical examination",
          cid: "ipfs://QmSample2",
          txHash: "0xsample2",
          timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
        }
      ];
      setRecords(sampleRecords);
      setFilteredRecords(sampleRecords);
      localStorage.setItem("medichain-records", JSON.stringify(sampleRecords));
    }
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = records.filter((record) => 
        record.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRecords(filtered);
    } else {
      setFilteredRecords(records);
    }
  }, [searchQuery, records]);

  const connectWallet = async () => {
    setWalletConnecting(true);
    
    try {
      // In production, implement actual wallet connection
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockAddress = `0x${Math.random().toString(36).substring(2, 15)}`;
      setWalletAddress(mockAddress);
      
      toast({
        title: "Wallet Connected",
        description: `Connected to ${mockAddress.substring(0, 6)}...${mockAddress.substring(mockAddress.length - 4)}`,
      });
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      toast({
        title: "Connection Failed",
        description: "Could not connect to wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setWalletConnecting(false);
    }
  };

  const handleDecrypt = async (record: MedicalRecord) => {
    setSelectedRecord(record);
    setDecryptionPassword("");
    setDecryptedData(null);
    setIsDecryptDialogOpen(true);
  };

  const handleDecryptSubmit = async () => {
    if (!selectedRecord || !decryptionPassword) return;
    
    setIsDecrypting(true);
    
    try {
      const data = await decryptData(selectedRecord.cid, decryptionPassword);
      setDecryptedData(data);
      
      // Mark the record as decrypted in the UI
      const updatedRecords = records.map(r => 
        r.id === selectedRecord.id ? { ...r, decrypted: true } : r
      );
      setRecords(updatedRecords);
      setFilteredRecords(updatedRecords.filter(r => 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase())
      ));
      
      toast({
        title: "Decryption Successful",
        description: "Your medical record has been decrypted.",
      });
    } catch (error) {
      console.error("Decryption error:", error);
      toast({
        title: "Decryption Failed",
        description: "Incorrect password or corrupted data.",
        variant: "destructive",
      });
      setDecryptedData(null);
    } finally {
      setIsDecrypting(false);
    }
  };

  return (
    <MainLayout>
      <div className="container max-w-6xl mx-auto px-4">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold mb-2">Medical Records</h1>
          <p className="text-muted-foreground">
            Access and manage your securely stored medical NFTs
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            {/* Wallet Card */}
            <Card className="mb-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center">
                  <Wallet className="h-4 w-4 mr-2" />
                  Wallet
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                {walletAddress ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Connected:</span>
                      <Badge variant="outline" className="font-mono text-xs">
                        {`${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Your medical NFTs are associated with this wallet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">
                      Connect your wallet to view your medical NFTs
                    </p>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={connectWallet}
                      disabled={walletConnecting}
                    >
                      {walletConnecting ? "Connecting..." : "Connect Wallet"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Filters */}
            <Card className="glass-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="search" className="text-sm font-medium block mb-1">
                    Search Records
                  </label>
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by name..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-1">Status</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs justify-start"
                      onClick={() => setFilteredRecords(records)}
                    >
                      All Records
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs justify-start"
                      onClick={() => setFilteredRecords(records.filter(r => r.decrypted))}
                    >
                      <Unlock className="h-3 w-3 mr-1" />
                      Decrypted
                    </Button>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground mt-4">
                    {filteredRecords.length} {filteredRecords.length === 1 ? 'record' : 'records'} found
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="md:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Your Medical NFTs</CardTitle>
                <CardDescription>
                  Securely stored on Aptos blockchain with IPFS data
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredRecords.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Records Found</h3>
                    <p className="text-muted-foreground">
                      {searchQuery 
                        ? "No records match your search criteria" 
                        : "You don't have any medical records yet"}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredRecords.map((record) => (
                      <Card key={record.id} className="glass-card overflow-hidden transition-all hover:shadow-md">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-base">{record.name}</CardTitle>
                              <CardDescription className="text-xs line-clamp-1">
                                {record.description}
                              </CardDescription>
                            </div>
                            <Badge variant={record.decrypted ? "default" : "outline"}>
                              {record.decrypted ? "Decrypted" : "Encrypted"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center gap-2">
                              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>Created: {format(record.timestamp, "MMM d, yyyy")}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FileCheck className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="font-mono truncate">{record.cid}</span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="w-full"
                            onClick={() => handleDecrypt(record)}
                          >
                            {record.decrypted ? (
                              <>
                                <Unlock className="h-4 w-4 mr-2" />
                                View Decrypted Data
                              </>
                            ) : (
                              <>
                                <LockKeyhole className="h-4 w-4 mr-2" />
                                Decrypt Record
                              </>
                            )}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Decrypt Dialog */}
      <Dialog open={isDecryptDialogOpen} onOpenChange={setIsDecryptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-medical-purple" />
              {selectedRecord?.decrypted 
                ? "Decrypted Medical Record" 
                : "Decrypt Medical Record"}
            </DialogTitle>
            <DialogDescription>
              {selectedRecord?.name}
            </DialogDescription>
          </DialogHeader>

          {!selectedRecord?.decrypted && !decryptedData ? (
            <>
              <div className="space-y-4">
                <p className="text-sm">
                  Enter the password you used to encrypt this medical record
                </p>
                
                <div>
                  <label htmlFor="decryptPassword" className="text-sm font-medium block mb-1">
                    Decryption Password
                  </label>
                  <Input
                    id="decryptPassword"
                    type="password"
                    placeholder="Enter your password"
                    value={decryptionPassword}
                    onChange={(e) => setDecryptionPassword(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDecryptDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleDecryptSubmit}
                  disabled={!decryptionPassword || isDecrypting}
                >
                  {isDecrypting ? "Decrypting..." : "Decrypt"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <Tabs defaultValue="formatted">
                  <TabsList className="w-full">
                    <TabsTrigger value="formatted" className="flex-1">Formatted</TabsTrigger>
                    <TabsTrigger value="raw" className="flex-1">Raw Data</TabsTrigger>
                  </TabsList>
                  <TabsContent value="formatted">
                    {decryptedData && (
                      <Card>
                        <CardContent className="p-4 space-y-4">
                          <div className="space-y-1">
                            <h4 className="font-semibold text-sm">Diagnosis:</h4>
                            <p className="text-sm">
                              {JSON.parse(decryptedData).diagnosis}
                            </p>
                          </div>
                          
                          <div className="space-y-1">
                            <h4 className="font-semibold text-sm">Causes:</h4>
                            <ul className="list-disc pl-5 text-sm">
                              {JSON.parse(decryptedData).causes.map((cause: string, idx: number) => (
                                <li key={idx}>{cause}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="space-y-1">
                            <h4 className="font-semibold text-sm">Suggestions:</h4>
                            <ul className="list-disc pl-5 text-sm">
                              {JSON.parse(decryptedData).suggestions.map((suggestion: string, idx: number) => (
                                <li key={idx}>{suggestion}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <h4 className="font-semibold text-sm">Risk Level:</h4>
                            <p className="text-sm">
                              {JSON.parse(decryptedData).risk_level}
                            </p>
                          </div>
                          
                          {JSON.parse(decryptedData).additional_notes && (
                            <div className="space-y-1">
                              <h4 className="font-semibold text-sm">Additional Notes:</h4>
                              <p className="text-sm">
                                {JSON.parse(decryptedData).additional_notes}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                  <TabsContent value="raw">
                    <div className="bg-muted p-4 rounded-md">
                      <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                        {decryptedData ? JSON.stringify(JSON.parse(decryptedData), null, 2) : "No data"}
                      </pre>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              <DialogFooter>
                <Button onClick={() => setIsDecryptDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Records;
