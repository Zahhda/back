import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Moon, Sun, Search, Menu, X, LogOut, User, Bell, Settings, LayoutDashboard } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from "../contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreditCard } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertCircle } from "lucide-react";
// helpers (top of file)
const isLikelyUrl = (s?: string) =>
  !!s && /^(https?:\/\/|data:image\/)/i.test(s);

const getInitials = (user?: { firstName?: string; lastName?: string; name?: string }) => {
  if (!user) return "U";
  const first = (user.firstName || user.name?.split(" ")[0] || "").trim();
  const last = (user.lastName || user.name?.split(" ").slice(-1)[0] || "").trim();
  const a = (first[0] || "").toUpperCase();
  const b = (last[0] || "").toUpperCase();
  return (a + b) || "U";
};

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tenantBlockOpen, setTenantBlockOpen] = useState(false);
  const [showImg, setShowImg] = useState<boolean>(isLikelyUrl(user?.avatar));
  const handlePostPropertyClick = (e?: React.MouseEvent) => {
    // If logged-in and is Tenant => block
    if (user && user.userType === "property_searching") {
      e?.preventDefault();
      setTenantBlockOpen(true);
      return;
    }
    // else go to post property
    navigate("/PropertyListing");
  };

  const goOwnerLogin = () => {
    // optional: keep them logged in or force logout; here we just route
    navigate("/auth/login", { state: { roleHint: "owner" } });
  };

  const goOwnerSignup = () => {
    navigate("/auth/property-owner/signup");
  };
  useEffect(() => {
    setShowImg(isLikelyUrl(user?.avatar));
  }, [user?.avatar]);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/dashboard';
    switch (user.userType) {
      case 'admin':
        return '/admin-fallback';
      case 'property_listing':
        return '/dashboard/property-listing';
      default:
        return '/dashboard/property-searching';
    }
  };

  const getUserInitials = (u?: {
    firstName?: string; lastName?: string; name?: string; displayName?: string; email?: string;
  }) => {
    if (!u) return "U";

    const pick = (...xs: (string | undefined)[]) => xs.find(s => (s ?? "").trim().length > 0) || "";

    // Try explicit fields, then split a full name, then email user-part
    const full = pick(`${u.firstName ?? ""} ${u.lastName ?? ""}`.trim(), u.name, u.displayName);
    let parts = full.trim().split(/\s+/).filter(Boolean);

    if (parts.length === 0 && u.email) {
      const userpart = u.email.split("@")[0] ?? "";
      // turn "lakshmi.n.reddy" -> ["lakshmi","n","reddy"]
      parts = userpart.replace(/[_\-\.]+/g, " ").split(" ").filter(Boolean);
    }

    const first = (parts[0]?.[0] || u.firstName?.[0] || "").toUpperCase();
    const last = (parts[1]?.[0] || u.lastName?.[0] || "").toUpperCase();

    const out = (first + last).slice(0, 2);
    return out || "U";
  };



  return (
    <header className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out py-4 px-6 md:px-12", isScrolled ? "bg-background/80 backdrop-blur-md shadow-sm" : "bg-transparent")}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <a href="/" className="text-2xl font-semibold tracking-tight mr-8 flex items-center gap-2">
            <img
              src="/newlogo.png"
              alt="high_res_logo"
              className="h-12 w-auto md:h-16"
            />
            <span className="text-primary/80">.</span>
          </a>
          <nav className="hidden md:flex space-x-6">
            <a href="/" className="font-medium hover:text-primary/80 transition-colors">Home</a>
            <a href="/properties" className="font-medium hover:text-primary/80 transition-colors">Properties</a>
            {/* <a href="/PropertyWishlist" className="font-medium hover:text-primary/80 transition-colors">Properties</a> */}

            {/* <a href="#agents" className="font-medium hover:text-primary/80 transition-colors">Agents</a> */}
            <a href="/PayBills" className="font-medium hover:text-primary/80 transition-colors">Pay Bills</a>
            <Link to="/about-us" className="font-medium hover:text-primary/80 transition-colors">About</Link>
            <a href="/Contact" className="font-medium hover:text-primary/80 transition-colors">Contact</a>

          </nav>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          {/* <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search..."
              // className="pl-9 w-[140px] sm:w-[180px] md:w-[100px] h-9 bg-background border-none rounded-full text-sm"
              className="pl-9 w-[160px] sm:w-[160px] md:w-[148px] h-9 bg-background border-none rounded-full text-sm"
            />
          </div> */}


          <Button
            onClick={handlePostPropertyClick}
            className="text-sm px-4 py-2 rounded-full bg-primary text-white dark:text-black hover:bg-primary/90 transition-colors"
          >
            Post Property
          </Button>

          <Link
            to="/payrent"
            className="text-sm px-4 py-2 rounded-full bg-primary text-white dark:text-black hover:bg-primary/90 transition-colors"
          >
            Pay Rent
          </Link>

          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="rounded-full">
            {theme === "dark" ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {user ? (
            <div className="flex items-center gap-4">
              <Link to={getDashboardLink()}>
                <Button variant="outline" className="rounded-full flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Avatar className="h-10 w-10" key={user?.id || user?.email || "anon"}>
                {showImg && isLikelyUrl(user?.avatar) && (
                  <AvatarImage
                    src={user!.avatar}
                    alt={user?.firstName || "User avatar"}
                    onError={() => setShowImg(false)} 
                  />
                )}
                <AvatarFallback className="bg-muted text-foreground dark:bg-muted/60 dark:text-white">
                  {getUserInitials(user as any)}
                </AvatarFallback>
              </Avatar>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}

                className="hover:bg-accent h-7 w-7 md:h-10 md:w-10"
                aria-label="Log out"
              >
                <LogOut className="h-3.5 w-3.5 md:h-5 md:w-5" />
              </Button>

            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/auth/login">
                <Button className="rounded-full">Sign In</Button>
              </Link>
              <Link to="/auth/property-owner/signup">
                <Button variant="outline" className="rounded-full">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>

        <div className="flex md:hidden items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="rounded-full">
            {theme === "dark" ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="rounded-full">
            {mobileMenuOpen ? <X className="h-[1.2rem] w-[1.2rem]" /> : <Menu className="h-[1.2rem] w-[1.2rem]" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-background/95 backdrop-blur-lg border-b border-border animate-fade-in">
          <nav className="flex flex-col space-y-3 p-4 text-sm">
            <a href="/" className="font-medium hover:text-primary/80 transition-colors">Home</a>
            <a href="/properties" className="font-medium hover:text-primary/80 transition-colors">Properties</a>
            <a href="/PayBills" className="font-medium hover:text-primary/80 transition-colors">Pay Bills</a>
            <Link to="/about-us" className="font-medium hover:text-primary/80 transition-colors">About</Link>
            <a href="/Contact" className="font-medium hover:text-primary/80 transition-colors">Contact</a>

            {/* Post Property + Pay Rent */}
            <div className="flex items-center gap-3">
              <Button
                onClick={handlePostPropertyClick}
                className="text-xs px-3 py-3 rounded-full bg-primary text-white dark:text-black hover:bg-primary/90 transition-colors"
              >
                Post Property
              </Button>
              <Link to="/payrent">
                <Button className="text-xs rounded-full px-3 py-1.5 bg-primary text-white dark:text-black hover:bg-primary/90">
                  Pay Rent
                </Button>
              </Link>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search properties..."
                className="pl-8 w-full h-8 text-xs bg-background border-none rounded-full"
              />
            </div>
            {user ? (
              <>
                <Link to={getDashboardLink()}>
                  <Button variant="outline" className="text-xs rounded-full w-full flex items-center justify-center gap-1 h-8">
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    Dashboard
                  </Button>
                </Link>
                <Button
                  onClick={handleLogout}
                  variant="destructive"
                  className="text-xs rounded-full w-full h-8"
                >
                  <LogOut className="mr-1.5 h-3.5 w-3.5" />
                  Logout
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/auth/login">
                  <Button className="text-xs rounded-full px-3 py-1.5 bg-primary text-white dark:text-black hover:bg-primary/90">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth/property-owner/signup">
                  <Button variant="outline" className="text-xs rounded-full px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
      <AlertDialog open={tenantBlockOpen} onOpenChange={setTenantBlockOpen}>
        <AlertDialogContent className="max-w-xl rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Tenant account detected
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p className="text-sm">
                You’re signed in as a <span className="font-medium">Tenant</span>. Tenants can pay bills and rent properties,
                but they <span className="font-semibold">cannot post</span> properties.
              </p>
              <p className="text-sm">
                To list a property, please log in with an <span className="font-medium">Owner</span> account.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-3">
            <AlertDialogCancel className="rounded-full">Stay as Tenant</AlertDialogCancel>
            <Button variant="secondary" className="rounded-full" onClick={goOwnerLogin}>
              Login as Owner
            </Button>
            <AlertDialogAction className="rounded-full" onClick={goOwnerSignup}>
              Create Owner Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </header>
  );
};

export default Navbar;
