import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createPortal } from "react-dom";
import { toast } from "react-hot-toast";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import {
  Eye,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  X,
  MapPin,
  Bed,
  Bath,
  ArrowUpRight,
} from "lucide-react";
import { formatPropertyId } from "@/services/propertyService";
import { formatCurrency, capitalizeFirstLetter } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Property } from "@/services/propertyService";

const API_BASE = "https://dorpay.in";

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const navigate = useNavigate();
  const { token } = useAuth();

  // Wishlist state
  const [isLiked, setIsLiked] = useState(false);
  const [wishlistId, setWishlistId] = useState<string | null>(null);

  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const images = property.cover_image
    ? [property.cover_image, ...(property.images || [])]
    : property.images || [];
  const slideCount = images.length;

  // Lightbox
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // View count state
  const [viewCount, setViewCount] = useState<number>(() => {
    const saved = localStorage.getItem(`viewCount:${property.id}`);
    return saved ? Number(saved) : (property.viewCount ?? 0);
  });
  const persistViewCount = (n: number) => {
    setViewCount(n);
    localStorage.setItem(`viewCount:${property.id}`, String(n));
  };

  // Auto-advance carousel
  useEffect(() => {
    if (slideCount <= 1) return;
    const iv = setInterval(
      () => setCurrentSlide((c) => (c + 1) % slideCount),
      5000
    );
    return () => clearInterval(iv);
  }, [slideCount]);

  const prevSlide = () =>
    setCurrentSlide((c) => (c - 1 + slideCount) % slideCount);
  const nextSlide = () => setCurrentSlide((c) => (c + 1) % slideCount);

  // Check if wishlisted
  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/wishlist/check/${property.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: { isWishlisted: boolean; wishlist?: { id: string } }) => {
        setIsLiked(data.isWishlisted);
        if (data.wishlist?.id) setWishlistId(data.wishlist.id);
      })
      .catch(console.error);
  }, [token, property.id]);

  // Toggle favorite
  const toggleFavorite = async () => {
    if (!token) return;
    if (!isLiked) {
      const res = await fetch(`${API_BASE}/api/wishlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ propertyId: property.id, notes: "" }),
      });
      const created = await res.json();
      setWishlistId(created.id);
      setIsLiked(true);
    } else if (wishlistId) {
      await fetch(`${API_BASE}/api/wishlist/${wishlistId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlistId(null);
      setIsLiked(false);
    }
  };

  const incrementViewAndGo = () => {
    const prev = viewCount;
    persistViewCount(prev + 1); // optimistic

    const url = `${API_BASE}/api/properties/${property.id}/view`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const payload = JSON.stringify({}); // if your API needs a body; else omit

    // Prefer sendBeacon on mobile; fall back to fetch with keepalive
    let sent = false;
    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: "application/json" });
        sent = navigator.sendBeacon(url, blob);
      }
    } catch { }

    if (!sent) {
      // Fire-and-forget; keepalive prevents the request from being killed on navigation
      fetch(url, {
        method: "POST",
        headers,
        body: payload,
        keepalive: true,
      }).catch(() => {
        // optional: revert optimistic count on failure you detect later
        // persistViewCount(prev);
      });
    }

    // navigate immediately; the beacon/keepalive will continue in background
    // navigate(`/properties/${property.id}`);
    navigate(`/properties/${property.id}`, { state: { property } });
  };


  // Lightbox keyboard close (Esc)
  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setIsLightboxOpen(false);
    if (e.key === "ArrowRight" && images.length > 1)
      setCurrentSlide((c) => (c + 1) % images.length);
    if (e.key === "ArrowLeft" && images.length > 1)
      setCurrentSlide((c) => (c - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!isLightboxOpen) return;
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isLightboxOpen, onKeyDown]);
  const buildShareUrl = () =>
    `${window.location.origin}/properties/${property.id}`;

  const handleShare = async () => {
    const url = buildShareUrl();
    const title = property.title || "Property";
    const text = `${title} in ${property.city}, ${property.state} — ${formatCurrency(property.price)}`;

    try {
      // Prefer native share when available (mobile & many desktops)
      if (navigator.share) {
        // On some browsers this must be called as a direct user gesture
        await navigator.share({ title, text, url });
        return;
      }
    } catch (err: any) {
      // Ignore aborts (user closed the native sheet)
      if (err?.name !== "AbortError") {
        console.error("navigator.share failed:", err);
      }
      // Fall through to clipboard
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch (e) {
      console.error("Clipboard copy failed:", e);
      // As a last resort, show the URL so the user can copy manually
      window.prompt("Copy this property link:", url);
    }
  };

  return (
    <>
      <Card className="group overflow-hidden w-full">
        <div className="relative">
          {/* Image Carousel */}
          <div className="w-full relative overflow-hidden aspect-square sm:aspect-[4/3] lg:aspect-[16/10]">
            {images.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt={`${property.title} image ${idx + 1}`}
                onClick={() => {
                  setCurrentSlide(idx);
                  setIsLightboxOpen(true);
                }}
                draggable={false}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${idx === currentSlide
                  ? "opacity-100 pointer-events-auto cursor-pointer"
                  : "opacity-0 pointer-events-none"
                  }`}
              />
            ))}

            {slideCount > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/80 dark:bg-zinc-800/80 rounded-full p-1"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/80 dark:bg-zinc-800/80 rounded-full p-1"
                  aria-label="Next slide"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                  {images.map((_, i) => (
                    <span
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className={`h-2 w-2 rounded-full cursor-pointer transition-colors ${i === currentSlide ? "bg-white" : "bg-gray-400"
                        }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Property ID Badge */}
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="bg-white/90 dark:bg-zinc-800/90 text-xs sm:text-sm md:text-base">
                {formatPropertyId(property.id)}
              </Badge>
            </div>

            {/* Action Buttons (Favorite, Share, Views) */}
            <div className=" absolute top-2 right-2 z-20 flex gap-2 pointer-events-auto">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 bg-white/90 dark:bg-zinc-800/90"
                      onClick={toggleFavorite}
                    >
                      <Heart
                        className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""
                          }`}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isLiked ? "Remove from favorites" : "Add to favorites"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 bg-white/90 dark:bg-zinc-800/90"
                      onClick={handleShare}
                      aria-label="Share property"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Share property</TooltipContent>
                </Tooltip>
              </TooltipProvider>


              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 bg-white/90 dark:bg-zinc-800/90"
                        disabled
                        aria-label={`${viewCount.toLocaleString()} views`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    {viewCount.toLocaleString()} views
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

            </div>
          </div>
        </div>

        {/* Property Details */}
        <CardContent className="p-4 ">
          {/* Title + Status ALWAYS on one line */}
          <div className="mb-2 flex items-center gap-2 min-w-0 ">
            <h3 className="font-semibold truncate flex-1 min-w-0">
              {property.title}
            </h3>
            <Badge
              className="shrink-0 text-xs sm:text-sm md:text-base"
              variant={
                property.availabilityStatus === "available"
                  ? "default"
                  : property.availabilityStatus === "rented"
                    ? "secondary"
                    : property.availabilityStatus === "sold"
                      ? "destructive"
                      : "outline"
              }
            >
              {capitalizeFirstLetter(property.availabilityStatus)}
            </Badge>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-xs sm:text-sm md:text-base text-muted-foreground mb-2">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{property.city}, {property.state}</span>
          </div>

          {/* Beds & Baths ALWAYS one line */}
          <div className="flex items-center gap-3 text-xs sm:text-sm md:text-base mb-3">
            <div className="flex items-center gap-1">
              <Bed className="h-3 w-3 text-muted-foreground" />
              <span>{property.numRooms} Beds</span>
            </div>
            <span className="text-muted-foreground/60">•</span>
            <div className="flex items-center gap-1">
              <Bath className="h-3 w-3 text-muted-foreground" />
              <span>{property.numBathrooms} Baths</span>
            </div>
          </div>

          {/* Price + View Details in one line */}
          <div className="flex items-center justify-between gap-2 mt-2">
            <div className="font-semibold text-xs sm:text-sm md:text-base">
              {formatCurrency(property.price)}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs sm:text-sm md:text-base"
              onClick={incrementViewAndGo}
            >
              View Details
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </div>

        </CardContent>
      </Card>

      {/* Lightbox */}
      {/* Lightbox (portal to body to avoid offset issues on mobile) */}
      {createPortal(
        <AnimatePresence>
          {isLightboxOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              // fixed to the viewport; portal ensures no transformed ancestors affect it
              className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3"
              onClick={() => setIsLightboxOpen(false)}
            >
              {/* Viewer box */}
              <div
                className="relative w-full max-w-[1200px] h-[78vh] sm:h-[80vh] rounded-2xl overflow-hidden
                     border border-white/10 bg-zinc-950/75 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]
                     ring-1 ring-white/5"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-3 top-3 z-20 h-10 w-10 rounded-full text-white
                       bg-white/10 hover:bg-white/20 border border-white/20"
                  onClick={() => setIsLightboxOpen(false)}
                  aria-label="Close"
                  title="Close (Esc)"
                >
                  <X className="h-6 w-6" />
                </Button>

                {/* Counter */}
                {images.length > 1 && (
                  <div className="absolute left-3 top-3 z-20 px-2 py-1 rounded-full text-xs text-white/90 bg-black/35 border border-white/10">
                    {currentSlide + 1} / {images.length}
                  </div>
                )}

                {/* Image */}
                <motion.img
                  key={images[currentSlide]}
                  src={images[currentSlide]}
                  alt={`${property.title} enlarged ${currentSlide + 1}`}
                  className="absolute inset-0 w-full h-full object-contain select-none"
                  draggable={false}
                  initial={{ opacity: 0.9, scale: 0.995 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0.9, scale: 0.995 }}
                  transition={{ duration: 0.2 }}
                />

                {/* Side nav pills */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentSlide((c) => (c - 1 + images.length) % images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-20
                           inline-flex items-center justify-center h-11 w-11 rounded-full
                           border border-white/20 bg-white/10 hover:bg-white/20
                           backdrop-blur text-white transition"
                      aria-label="Previous"
                      title="Previous (←)"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>

                    <button
                      onClick={() => setCurrentSlide((c) => (c + 1) % images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-20
                           inline-flex items-center justify-center h-11 w-11 rounded-full
                           border border-white/20 bg-white/10 hover:bg-white/20
                           backdrop-blur text-white transition"
                      aria-label="Next"
                      title="Next (→)"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}

                {/* Thumbnails strip */}
                {images.length > 1 && (
                  <div className="absolute inset-x-0 bottom-0 z-10 p-3 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="mx-auto flex gap-2 justify-center overflow-x-auto scrollbar-none">
                      {images.map((src, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentSlide(i)}
                          className={`h-16 w-24 sm:h-18 sm:w-28 rounded-lg overflow-hidden
                                ring-1 transition 
                                ${i === currentSlide ? "ring-white/70" : "ring-white/15 hover:ring-white/35"}`}
                          aria-label={`Go to image ${i + 1}`}
                          title={`Image ${i + 1}`}
                        >
                          <img
                            src={src}
                            alt={`Thumbnail ${i + 1}`}
                            className="h-full w-full object-cover"
                            draggable={false}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

    </>
  );
};

export default PropertyCard;
