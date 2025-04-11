
import { PageHeader } from "./PageHeader";
import { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader />
      <main className="flex-1 container py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
      <footer className="border-t border-border py-4">
        <div className="container px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} MediChain AI Vault. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
