import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import { Home, RefreshCcw } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const NotFound = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <ThemeProvider defaultTheme="dark">
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1 flex flex-col items-center justify-center py-10 px-6">
          <div className="max-w-md text-center animate-fade-in mb-8">
            <h1 className="text-8xl font-bold mb-4">404</h1>
            <p className="text-xl text-muted-foreground mb-6">
              We couldn't find the page you're looking for.
            </p>
            <div className="flex gap-4 justify-center mb-8">
              <Button asChild size="lg" className="rounded-full gap-2">
                <a href="/">
                  <Home className="h-4 w-4" />
                  Return to Home
                </a>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="rounded-full gap-2"
                onClick={() => window.location.reload()}
              >
                <RefreshCcw className="h-4 w-4" />
                Reload Page
              </Button>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowDebug(!showDebug)}
              className="text-xs"
            >
              {showDebug ? "Hide" : "Show"} Debug Info
            </Button>
          </div>
          
          {showDebug && (
            <div className="bg-gray-900 text-gray-200 p-4 rounded-lg max-w-lg w-full text-xs font-mono overflow-auto">
              <h3 className="font-bold mb-2 text-sm">Debug Information</h3>
              <p><strong>URL:</strong> {window.location.href}</p>
              <p><strong>Path:</strong> {location.pathname}</p>
              <p><strong>Search:</strong> {location.search}</p>
              <p><strong>Hash:</strong> {location.hash}</p>
              <p><strong>User Agent:</strong> {navigator.userAgent}</p>
              <p><strong>Logged In:</strong> {user ? "Yes" : "No"}</p>
              {user && (
                <>
                  <p><strong>User ID:</strong> {user.id}</p>
                  <p><strong>User Type:</strong> {user.userType}</p>
                  <p><strong>User Email:</strong> {user.email}</p>
                </>
              )}
              <div className="mt-4">
                <strong>Available Routes:</strong>
                <ul className="list-disc ml-4 mt-1">
                  <li>/admin/direct - Direct admin access without nested layout</li>
                  <li>/admin/dashboard - Admin dashboard with layout</li>
                  <li>/debug/admin-dashboard-simple - Simple admin dashboard</li>
                  <li>/dashboard - Main dashboard (redirects based on user type)</li>
                </ul>
              </div>
            </div>
          )}
        </main>
      </div>
    </ThemeProvider>
  );
};

export default NotFound;
