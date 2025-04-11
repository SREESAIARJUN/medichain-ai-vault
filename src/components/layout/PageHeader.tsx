
import { ThemeToggle } from "./ThemeToggle";
import { Link } from "react-router-dom";
import { Activity } from "lucide-react";

export function PageHeader() {
  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-lg bg-background/80 border-b border-border">
      <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center space-x-2">
          <Activity className="h-6 w-6 text-medical-blue" />
          <span className="font-bold text-xl bg-gradient-to-r from-medical-blue to-medical-purple bg-clip-text text-transparent">
            MediChain AI
          </span>
        </Link>
        
        <nav className="ml-auto flex items-center space-x-4">
          <Link to="/chat" className="text-sm font-medium hover:text-primary">
            Chat
          </Link>
          <Link to="/summary" className="text-sm font-medium hover:text-primary">
            Summary
          </Link>
          <Link to="/mint" className="text-sm font-medium hover:text-primary">
            Mint
          </Link>
          <Link to="/records" className="text-sm font-medium hover:text-primary">
            Records
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
