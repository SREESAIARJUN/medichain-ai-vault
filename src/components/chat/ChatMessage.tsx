
import { Brain, User } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  id: string;
}

export const ChatMessage = ({ role, content, id }: ChatMessageProps) => {
  return (
    <div
      key={id}
      className={`flex ${
        role === "assistant" ? "justify-start" : "justify-end"
      } mb-4`}
    >
      <div
        className={`max-w-[80%] rounded-xl p-4 ${
          role === "assistant"
            ? "bg-muted text-foreground shadow-sm"
            : "bg-primary text-primary-foreground"
        }`}
      >
        <div className="flex items-center space-x-2 mb-2">
          {role === "assistant" ? (
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
        <div className="prose dark:prose-invert prose-sm">
          {content.split('\n').map((line, i) => (
            <p key={i} className="mb-1">{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
};
