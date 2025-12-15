import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Search, MapPin, Building, Banknote, ChevronRight, ArrowRight, ChevronDown,
  LayoutDashboard, Bookmark, Bell, Settings
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import type { Property as ServiceProperty } from "@/services/propertyService";

type HeroProps = {
  onResults: (rows: ServiceProperty[]) => void;
  onSearchingChange?: (loading: boolean) => void;
  onError?: (msg: string | null) => void;
  onClear?: () => void;
};

const TYPE_SLUG: Record<string, string> = {
  Flatmates: "flatmate",
  Flats: "flat",
  "Full House": "house",
  PG: "pg",
  "Paying Guest": "pg",
  Villa: "villa",
};
const PropertyHero: React.FC<HeroProps> = ({ onResults, onSearchingChange, onError, onClear }) => {
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  const [location, setLocation] = useState<string>("");
  const [propType, setPropType] = useState<string>("");
  const [budget, setBudget] = useState<string>("");

  const slides = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80",
      title: "Find Your Dream Home",
      subtitle: "Explore premium properties curated just for you"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80",
      title: "Get Discount On Rent Pay",
      subtitle: "Pay your rent through DORPay and unlock exclusive discounts"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80",
      title: "Luxury Living Spaces",
      subtitle: "Experience comfort and elegance in every corner"
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80",
      title: "Modern Architecture",
      subtitle: "Discover thoughtfully designed spaces for modern living"
    }
  ];
  const scrollToResults = () => {
    const el =
      document.querySelector('[data-prop-grid-anchor]') as HTMLElement | null;
    if (!el) return;

    const y = el.getBoundingClientRect().top + window.pageYOffset - 80; // offset if navbar
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
      setImageLoaded(false);
    }, 6000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const locations = [
    "Bangalore",
    "Coimbatore",
    "Delhi",
    "Faridabad",
    "Ghaziabad",
    "Greater Noida",
    "Gurugram",
    "Hyderabad",
    "Indore",
    "Jaipur",
    "Mumbai",
    "Navi Mumbai",
    "Noida",
    "Pune",
    "Thane"
  ];
  const propertyTypes = ["Flatmates", "Flats", "Full House", "PG", "Villa"];
  const budgetRanges = ["5k - 25k", "25k - 50k", "50k - 75k", "75k - 1L", "1L - 5L"];
  const parseBudget = (b: string): { start?: number; end?: number } => {
    if (!b) return {};
    const clean = b.replace(/\s/g, '').toLowerCase();
    const [lo, hi] = clean.split('-');
    const parse = (v: string) => {
      if (!v) return undefined;
      if (v.endsWith('k')) return Number(v.replace('k', '')) * 1000;
      if (v.endsWith('l')) return Number(v.replace('l', '')) * 100000;
      const n = Number(v);
      return Number.isFinite(n) ? n : undefined;
    };
    return { start: parse(lo), end: parse(hi) };
  };

  const fetchFiltered = async (payload: any) => {
    const res = await fetch("https://dorpay.in/api/properties/filter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const rows: any[] =
      Array.isArray(data?.properties) ? data.properties :
        Array.isArray(data?.data) ? data.data :
          Array.isArray(data?.result) ? data.result :
            Array.isArray(data) ? data : [];
    return rows.map((p: any) => ({ ...p, id: p.id ?? p.propertyId ?? p._id }));
  };

  const handleHeroSearch = async () => {
    onSearchingChange?.(true);
    onError?.(null);

    const { start, end } = parseBudget(budget);
    const typeSlug = TYPE_SLUG[propType] ?? "";

    const payload = {
      property_type: typeSlug,
      price_start: start ? String(start) : "",
      price_end: end ? String(end) : "",
      bedrooms: "",
      min_area: "",
      max_area: "",
      search_query: "",
      location: location || "",
    };

    try {
      const rows = await fetchFiltered(payload);
      onResults(rows);
      // const el = document.querySelector('[data-prop-grid-anchor]') || document.body;
      requestAnimationFrame(() => {
        setTimeout(scrollToResults, 0);
      });
    } catch (e: any) {
      onError?.(e?.message || "Failed to fetch filtered properties");
      onResults([]);
    } finally {
      onSearchingChange?.(false);
    }
  };
  const handleClear = () => {
    setLocation("");
    setPropType("");
    setBudget("");
    onError?.(null);
    onClear?.();
  };
  const getDashboardLink = () => {
    if (!user) return '/dashboard';

    switch (user.userType) {
      case 'admin':
        return '/admin-fallback';
      case 'property_listing':
        return '/dashboard/property-listing';
      case 'property_searching':
      default:
        return '/dashboard/property-searching';
    }
  };

  const getQuickLinks = () => {
    if (!user) return [];

    const commonLinks = [
      {
        icon: <Bell className="h-5 w-5" />,
        text: "Notifications",
        path: "/dashboard/notifications",
        color: "bg-amber-500"
      },
      {
        icon: <Settings className="h-5 w-5" />,
        text: "Settings",
        path: "/dashboard/profile",
        color: "bg-slate-500"
      },
    ];

    switch (user.userType) {
      case 'admin':
        return [
          {
            icon: <LayoutDashboard className="h-5 w-5" />,
            text: "Admin Dashboard",
            path: "/admin-fallback",
            color: "bg-purple-500"
          },
          {
            icon: <Building className="h-5 w-5" />,
            text: "Properties",
            path: "/admin/property-management",
            color: "bg-blue-500"
          },
          ...commonLinks
        ];
      case 'property_listing':
        return [
          {
            icon: <LayoutDashboard className="h-5 w-5" />,
            text: "Owner Dashboard",
            path: "/dashboard/property-listing",
            color: "bg-emerald-500"
          },
          {
            icon: <Building className="h-5 w-5" />,
            text: "My Properties",
            // path: "/dashboard/property-listing",
            path: "dashboard/MyProperties",
            color: "bg-blue-500"
          },
          ...commonLinks
        ];
      case 'property_searching':
      default:
        return [
          {
            icon: <LayoutDashboard className="h-5 w-5" />,
            text: "My Dashboard",
            path: "/dashboard/property-searching",
            color: "bg-indigo-500"
          },
          {
            icon: <Bookmark className="h-5 w-5" />,
            text: "Wishlist",
            // path: "/dashboard/wishlist",
            path: "/dashboard/WishlistPage",
            color: "bg-pink-500"
          },
          ...commonLinks
        ];
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    let greeting = "Good ";

    if (hour < 12) greeting += "Morning";
    else if (hour < 17) greeting += "Afternoon";
    else greeting += "Evening";

    return `${greeting}, ${user?.firstName || 'Guest'}!`;
  };

  return (
    // <section className="relative w-full h-[155vh] md:h-[115vh] sm:h-[105vh] overflow-">
    <section className="relative w-full h-full sm:h-[75vh] md:h-[85vh] lg:h-screen overflow-hidden">
      {/* Hero Background */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className={`w-full h-full object-cover object-center transition-all duration-1000 ${imageLoaded && index === currentSlide ? "scale-105" : "scale-100"
              }`}
            onLoad={index === currentSlide ? handleImageLoad : undefined}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background" />
        </div>
      ))}

      {/* Content */}
      <div className="relative h-full min-h-[100vh] max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex flex-col justify-center">
        <div className="max-w-3xl mt-24">
          {user ? (
            // Content for logged-in users
            <>
              <div
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/20 text-primary-foreground mb-6 backdrop-blur-sm animate-fade-in"
              >
                <span className="mr-2 bg-primary/80 rounded-full h-2 w-2"></span>
                Welcome back
              </div>

              <h1
                className="text-2xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight text-balance animate-fade-in"
              >
                {getGreeting()}
              </h1>

              <p
                className="mt-6 text-xs sm:text-sm  md:text-xl text-muted-foreground max-w-2xl animate-fade-in"
              >
                {user.userType === 'property_listing'
                  ? "Manage your properties and check your latest booking requests"
                  : user.userType === 'admin'
                    ? "Access your administrative tools and manage the platform"
                    : "Continue exploring properties that match your preferences"}
              </p>

              <div className="mt-8 flex flex-wrap gap-4 animate-fade-in">
                {/* <Link to={getDashboardLink()}>
                  <Button
                    size="lg"
                    className={`
        rounded-full gap-2
        px-4 py-2             
        md:px-6 md:py-3  text-xs sm:text-sm md:text-base
        group bg-gradient-to-r from-primary to-primary/80
        hover:from-primary/90 hover:to-primary
      `}
                  >
                    Go to Dashboard
                    <ChevronRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    />
                  </Button>
                </Link> */}

                {/* <Button
                  size="lg"
                  variant="outline"
                  className={`
      rounded-full gap-2
      px-4 py-2 
      md:px-6 md:py-3 text-xs sm:text-sm md:text-base
    `}
                >
                  View Properties
                </Button> */}
              </div>


              {/* Quick access cards */}
              <div className="mt-12 grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-fade-in">

                {getQuickLinks().map((link, index) => (
                  <Link to={link.path} key={index}>
                    <div
                      className="bg-white/10 backdrop-blur-md hover:bg-white/15 border border-white/20 rounded-xl p-4 transition-all hover:-translate-y-1 hover:scale-105"
                    >
                      <div className={`${link.color} w-10 h-10 rounded-lg flex items-center justify-center mb-3 text-white`}>
                        {link.icon}
                      </div>
                      <h3 className="font-medium text-xs sm:text-sm md:text-base">{link.text}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            // Original content for visitors
            <>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm md:text-base font-medium bg-primary/10 text-primary-foreground mb-6 backdrop-blur-sm transition-all animate-fade-in">
                <span className="mr-2 bg-primary/80 rounded-full h-2 w-2"></span>
                Premium Properties
              </div>

              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-balance text-center sm:text-left animate-fade-in transition-all">
                {slides[currentSlide].title}
              </h1>

              <p className="mt-6 text-base sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl text-center sm:text-left animate-fade-in transition-all">
                {slides[currentSlide].subtitle}
              </p>


              <div className="mt-6 flex flex-row flex-wrap gap-2 sm:gap-4 justify-center sm:justify-start animate-fade-in">
                <Button
                  size="lg"
                  className="text-xs sm:text-sm md:text-base px-3 py-1 sm:px-4 sm:py-2 rounded-full gap-2 group"
                >
                  Explore Properties
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-xs sm:text-sm md:text-base px-3 py-1 sm:px-4 sm:py-2 rounded-full gap-2"
                >
                  View Listings
                </Button>
              </div>



            </>
          )}
        </div>

        {/* Property Search Bar - Responsive & Fixed Bottom */}
        {/* <div className="w-full px-4 mt-6 sm:relative z-20">
          <div className="w-full sm:max-w-4xl mx-auto bg-background/90 backdrop-blur-lg p-4 rounded-xl shadow-lg border border-border/30">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
             
              <div className="space-y-1">
                <label className="text-xs sm:text-sm md:text-base pl-1">Location</label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger className="w-full bg-background border-input hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Select location" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="w-full text-xs sm:text-sm md:text-base">
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs sm:text-sm md:text-base pl-1">Property Type</label>
                <Select value={propType} onValueChange={setPropType}>
                  <SelectTrigger className="w-full bg-background border-input hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Select type" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    {propertyTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs sm:text-sm md:text-base pl-1">Budget</label>
                <Select value={budget} onValueChange={setBudget}>
                  <SelectTrigger className="w-full bg-background border-input hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <Banknote className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Select budget" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    {budgetRanges.map((range) => (
                      <SelectItem key={range} value={range}>{range}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1 flex flex-col justify-end sm:flex-row sm:space-y-0 sm:space-x-2 mt-1 sm:mt-6">
                <Button
                  className="h-10 rounded-lg w-full sm:w-auto"
                  onClick={handleHeroSearch}
                >
                  <Search className="h-4 rounded-lg w-full sm:w-auto text-xs sm:text-sm md:text-base" />
                  Search
                </Button>
                <Button
                  variant="outline"
                  className="h-10 rounded-lg w-full sm:w-auto text-xs sm:text-sm md:text-base"
                  onClick={handleClear}
                >
                  Clear
                </Button>
              </div>

            </div>
          </div>
        </div> */}

      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-24 left-0 right-0 flex justify-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${index === currentSlide
              ? "w-8 bg-primary"
              : "bg-primary/30"
              }`}
            onClick={() => {
              setCurrentSlide(index);
              setImageLoaded(false);
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default PropertyHero;
