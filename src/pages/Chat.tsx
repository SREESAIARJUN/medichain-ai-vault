
import { useState, useRef, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SendHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatTypingIndicator } from "@/components/chat/ChatTypingIndicator";

// Import from utils instead of redefining
import { callGeminiAPI } from "@/utils/gemini";

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
        setDiagnosisResult(response);
        
        // Format the response for display in the chat
        let formattedContent = `**${response.diagnosis}**\n\n`;
        
        if (response.causes.length > 0) {
          formattedContent += "**Possible Causes:**\n";
          response.causes.forEach((cause: string) => {
            formattedContent += `- ${cause}\n`;
          });
          formattedContent += "\n";
        }
        
        if (response.suggestions.length > 0) {
          formattedContent += "**Suggestions:**\n";
          response.suggestions.forEach((suggestion: string) => {
            formattedContent += `- ${suggestion}\n`;
          });
          formattedContent += "\n";
        }
        
        formattedContent += `**Risk Level:** ${response.risk_level}\n\n`;
        formattedContent += response.additional_notes;
        
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
            <Card className="glass-card h-[500px] flex flex-col overflow-hidden">
              <CardContent className="flex-1 flex flex-col p-4 h-full">
                <ScrollArea className="flex-1 pr-4 mb-4">
                  <div className="space-y-1 pb-2">
                    {messages.map((message) => (
                      <ChatMessage 
                        key={message.id}
                        id={message.id}
                        role={message.role}
                        content={message.content}
                      />
                    ))}
                    {isLoading && <ChatTypingIndicator />}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <form onSubmit={handleSubmit} className="flex space-x-2 pt-2 border-t">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Describe your symptoms..."
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button 
                    type="submit" 
                    disabled={isLoading || !input.trim()}
                    className="transition-all hover:scale-105"
                  >
                    <SendHorizontal className="h-5 w-5" />
                    <span className="sr-only">Send</span>
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="md:w-1/3">
            <Card className="glass-card h-full">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Next Steps</h3>
                
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    After receiving your diagnosis, you can:
                  </p>
                  
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <div className="rounded-full bg-primary/20 p-1 mr-2">
                        <span className="text-xs font-bold">1</span>
                      </div>
                      Review your complete diagnosis
                    </li>
                    <li className="flex items-center">
                      <div className="rounded-full bg-primary/20 p-1 mr-2">
                        <span className="text-xs font-bold">2</span>
                      </div>
                      Encrypt and store it on IPFS
                    </li>
                    <li className="flex items-center">
                      <div className="rounded-full bg-primary/20 p-1 mr-2">
                        <span className="text-xs font-bold">3</span>
                      </div>
                      Mint as NFT on Aptos blockchain
                    </li>
                  </ul>
                  
                  <div className="pt-4">
                    <Button 
                      asChild 
                      className="w-full transition-all hover:scale-105" 
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
