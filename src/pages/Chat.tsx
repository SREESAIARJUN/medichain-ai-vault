
import { useState, useRef, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { SendHorizontal, Brain, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

// Mock API call - in production, replace with actual Gemini API call
const callGeminiAPI = async (prompt: string): Promise<string> => {
  // This is a placeholder for the actual API call
  console.log("Calling Gemini API with prompt:", prompt);
  
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000));
  
  // Simulated response for development purposes
  if (prompt.toLowerCase().includes("headache") || prompt.toLowerCase().includes("pain")) {
    return JSON.stringify({
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
  } else {
    return JSON.stringify({
      diagnosis: "Insufficient Information",
      causes: ["Unable to determine with provided symptoms"],
      suggestions: ["Please provide more detailed symptoms", "Consider tracking when symptoms occur"],
      risk_level: "Undetermined",
      followup_needed: true,
      additional_notes: "For accurate diagnosis, please provide specific symptoms including duration, intensity, and any triggers."
    });
  }
};

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface DiagnosisResult {
  diagnosis: string;
  causes: string[];
  suggestions: string[];
  risk_level: string;
  followup_needed: boolean;
  additional_notes: string;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your MediChain AI assistant. Please describe your symptoms in detail, and I'll provide a preliminary assessment."
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      content: input,
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    try {
      // Construct prompt with specific instructions
      const prompt = `Diagnose the following symptoms and provide a brief medical summary including possible causes, suggested care, and urgency: ${input}`;
      
      // Call the AI
      const response = await callGeminiAPI(prompt);
      
      try {
        const parsedResponse = JSON.parse(response);
        setDiagnosisResult(parsedResponse);
        
        // Format the response for display in the chat
        let formattedContent = `**${parsedResponse.diagnosis}**\n\n`;
        
        if (parsedResponse.causes.length > 0) {
          formattedContent += "**Possible Causes:**\n";
          parsedResponse.causes.forEach((cause: string) => {
            formattedContent += `- ${cause}\n`;
          });
          formattedContent += "\n";
        }
        
        if (parsedResponse.suggestions.length > 0) {
          formattedContent += "**Suggestions:**\n";
          parsedResponse.suggestions.forEach((suggestion: string) => {
            formattedContent += `- ${suggestion}\n`;
          });
          formattedContent += "\n";
        }
        
        formattedContent += `**Risk Level:** ${parsedResponse.risk_level}\n\n`;
        formattedContent += parsedResponse.additional_notes;
        
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant" as const,
          content: formattedContent,
        };
        
        setMessages((prev) => [...prev, aiMessage]);
        
        // Show a toast notification
        toast({
          title: "Diagnosis Complete",
          description: "View your results and proceed to encryption.",
          duration: 5000,
        });
        
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        
        // Fallback message if parsing fails
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant" as const,
          content: "I apologize, but I encountered an issue processing your symptoms. Please try describing them again or in a different way.",
        };
        
        setMessages((prev) => [...prev, aiMessage]);
      }
      
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant" as const,
        content: "I'm sorry, but I encountered an error while analyzing your symptoms. Please try again later.",
      };
      
      setMessages((prev) => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: "Failed to connect to AI service. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container max-w-4xl mx-auto px-4">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold mb-2">AI Health Assistant</h1>
          <p className="text-muted-foreground">
            Describe your symptoms in detail for an AI-powered health assessment.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <Card className="glass-card h-[500px] flex flex-col">
              <CardContent className="flex-1 flex flex-col p-4">
                <div className="flex-1 overflow-y-auto mb-4">
                  <div className="space-y-4 pb-2">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.role === "assistant" ? "justify-start" : "justify-end"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-xl p-4 ${
                            message.role === "assistant"
                              ? "bg-muted text-foreground"
                              : "bg-primary text-primary-foreground"
                          }`}
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            {message.role === "assistant" ? (
                              <>
                                <Brain className="h-4 w-4" />
                                <span className="font-semibold">MediChain AI</span>
                              </>
                            ) : (
                              <>
                                <User className="h-4 w-4" />
                                <span className="font-semibold">You</span>
                              </>
                            )}
                          </div>
                          <div className="prose dark:prose-invert prose-sm whitespace-pre-wrap">
                            {message.content.split('\n').map((line, i) => (
                              <p key={i} className="mb-1">{line}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="max-w-[80%] rounded-xl p-4 bg-muted text-foreground">
                          <div className="flex items-center space-x-2 mb-2">
                            <Brain className="h-4 w-4" />
                            <span className="font-semibold">MediChain AI</span>
                          </div>
                          <div className="flex space-x-2 mt-2">
                            <div className="w-2 h-2 rounded-full bg-primary animate-typing-dot" style={{ animationDelay: "0ms" }} />
                            <div className="w-2 h-2 rounded-full bg-primary animate-typing-dot" style={{ animationDelay: "300ms" }} />
                            <div className="w-2 h-2 rounded-full bg-primary animate-typing-dot" style={{ animationDelay: "600ms" }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="flex space-x-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Describe your symptoms..."
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button type="submit" disabled={isLoading || !input.trim()}>
                    <SendHorizontal className="h-5 w-5" />
                    <span className="sr-only">Send</span>
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="md:w-1/3">
            <Card className="glass-card">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Next Steps</h3>
                
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    After receiving your diagnosis, you can:
                  </p>
                  
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <div className="rounded-full bg-medical-blue/20 p-1 mr-2">
                        <span className="text-xs font-bold">1</span>
                      </div>
                      Review your complete diagnosis
                    </li>
                    <li className="flex items-center">
                      <div className="rounded-full bg-medical-blue/20 p-1 mr-2">
                        <span className="text-xs font-bold">2</span>
                      </div>
                      Encrypt and store it on IPFS
                    </li>
                    <li className="flex items-center">
                      <div className="rounded-full bg-medical-blue/20 p-1 mr-2">
                        <span className="text-xs font-bold">3</span>
                      </div>
                      Mint as NFT on Aptos blockchain
                    </li>
                  </ul>
                  
                  <div className="pt-4">
                    <Button 
                      asChild 
                      className="w-full" 
                      disabled={!diagnosisResult}
                    >
                      <Link to={{
                        pathname: "/summary",
                        search: diagnosisResult 
                          ? `?data=${encodeURIComponent(JSON.stringify(diagnosisResult))}` 
                          : ""
                      }}>
                        View Summary & Continue
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Chat;
