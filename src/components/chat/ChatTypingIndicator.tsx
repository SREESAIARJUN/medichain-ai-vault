
import { Brain } from "lucide-react";

export const ChatTypingIndicator = () => {
  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[80%] rounded-xl p-4 bg-muted text-foreground shadow-sm">
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
  );
};
