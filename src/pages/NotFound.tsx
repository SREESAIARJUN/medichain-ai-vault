
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FileQuestion } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <MainLayout>
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto">
          <div className="p-6 rounded-full bg-medical-red/10 inline-flex">
            <FileQuestion className="h-16 w-16 text-medical-red" />
          </div>
          <h1 className="text-5xl font-bold">404</h1>
          <p className="text-xl text-muted-foreground">
            Oops! We couldn't find the page you're looking for.
          </p>
          <Button asChild size="lg" className="mt-4">
            <Link to="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotFound;
