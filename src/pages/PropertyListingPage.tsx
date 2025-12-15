import React, { useEffect, useMemo, useRef, useState } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    MapPin,
    Bed,
    Bath,
    ArrowUpRight,
    ChevronLeft,
    ChevronRight,
    Heart,
    Share2,
    Eye,
    Search as SearchIcon,
    X,
} from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { getAllProperties, formatPropertyId } from "@/services/propertyService";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency, capitalizeFirstLetter } from "@/lib/utils";

const API_URL = import.meta.env.VITE_API_URL || "https://dorpay.in/api";
const UI_PROPERTY_TYPES = ["Flatmates", "Flats", "Full House", "Paying Guest", "Villa"];
const TYPE_SLUG: Record<string, string> = {
    Flatmates: "flatmate",
    Flats: "flat",
    "Full House": "house",
    "Paying Guest": "pg",
    Villa: "villa",
};
const BEDROOM_OPTIONS = [
    { label: "Any", value: "" },
    { label: "1 BHK", value: "1" },
    { label: "2 BHK", value: "2" },
    { label: "3 BHK", value: "3" },
    { label: "4 BHK", value: "4" },
    { label: "5+ BHK", value: "5plus" },
];
const DEFAULT_PRICE: [number, number] = [5000, 500000];
const DEFAULT_AREA: [number, number] = [0, 5000];
const DEFAULT_LIMIT = 100;
const PAGE_SIZE = 12;

const toSlug = (s: any) => String(s ?? "").trim().toLowerCase().replace(/\s+/g, "_");
const formatPriceShort = (value: number) =>
    value < 100000 ? `₹${(value / 1000).toFixed(0)}K` : `₹${(value / 100000).toFixed(1)}L`;

type Property = {
    id: number;
    title: string;
    status?: "available" | "rented" | "sold";
    availabilityStatus?: string;
    price: number;
    images: string[];
    cover_image?: string;
    area_size?: number;
    city: string;
    state: string;
    area?: string;
    propertyType: string;
    furnishedStatus?: string;
    furnish_type?: string;
    numRooms: number;
    numBathrooms: number;
    viewCount?: number;
};


import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

type SearchBarProps = {
    onResults: (rows: any[]) => void;
    onSearchingChange?: (loading: boolean) => void;
    onError?: (msg: string | null) => void;
    onShowAll?: () => Promise<void> | void; 
};


const SearchBarCompact: React.FC<SearchBarProps> = ({ onResults, onSearchingChange, onError, onShowAll }) => {
    const [q, setQ] = useState("");
    const [type, setType] = useState<string | undefined>(undefined);
    const [bed, setBed] = useState<string | undefined>(undefined);

    const [price, setPrice] = useState<[number, number]>(DEFAULT_PRICE);
    const [area, setArea] = useState<[number, number]>(DEFAULT_AREA);

    const selectedSlug = useMemo(
        () => (type ? TYPE_SLUG[type] ?? toSlug(type) : ""),
        [type]
    );

    const buildPayload = () => {
        const bedrooms = bed && bed !== "5plus" ? String(Number(bed)) : "";

        return {
            property_type: selectedSlug || "",
            price_start: price[0],
            price_end: price[1],
            min_area: area[0],
            max_area: area[1],
            search_query: q.trim(),
            location: "",
            bedrooms,
        };
    };

    const fetchFilteredPage = async (payload: any) => {
        const res = await fetch(`${API_URL}/properties/filter`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("No Property found !");
        const data = await res.json();
        const rows: any[] =
            Array.isArray(data?.properties) ? data.properties :
                Array.isArray(data?.data) ? data.data :
                    Array.isArray(data?.result) ? data.result :
                        Array.isArray(data) ? data : [];
        return {
            rows: rows.map((p) => ({ ...p, id: p.id ?? p.propertyId ?? p._id })),
            totalPages: data?.totalPages ?? data?.pages ?? undefined,
        };
    };

    const fetchAllFiltered = async (basePayload: any, limit = DEFAULT_LIMIT) => {
        let page = 1;
        let all: any[] = [];
        while (true) {
            const payload = { ...basePayload, page, limit, page_size: limit, pageSize: limit, per_page: limit };
            const resp = await fetchFilteredPage(payload);
            all = all.concat(resp.rows);
            const got = resp.rows.length;
            const knowTotals = Number.isFinite(resp.totalPages as any);
            if (knowTotals) {
                if (page >= (resp.totalPages as number)) break;
            } else {
                if (got < limit) break;
            }
            page++;
            if (page > 50) break;
        }
        const seen = new Set();
        return all.filter((r) => {
            const k = r.id ?? JSON.stringify(r);
            if (seen.has(k)) return false;
            seen.add(k);
            return true;
        });
    };

    const toNum = (v: any) => {
        if (typeof v === "number") return v;
        if (typeof v === "string") {
            const m = v.match(/\d+/);
            if (m) return Number(m[0]);
        }
        return NaN;
    };
    const readNumRooms = (p: any) => {
        const candidates = [p?.numRooms, p?.num_rooms, p?.bedrooms, p?.bhk, p?.roomCount, p?.bedroomCount, p?.rooms, p?.details?.bedrooms];
        for (const c of candidates) {
            const n = toNum(c);
            if (Number.isFinite(n)) return n;
        }
        const fromTitle = toNum(p?.title);
        if (Number.isFinite(fromTitle)) return fromTitle;
        const fromDesc = toNum(p?.description);
        if (Number.isFinite(fromDesc)) return fromDesc;
        return NaN;
    };

    const handleSearch = async () => {
        const payload = buildPayload();
        const { bedrooms, ...payloadNoBedrooms } = payload;

        onSearchingChange?.(true);
        onError?.(null);

        try {
            const commonPayload = { ...payloadNoBedrooms, bedrooms: "" };
            let rows: any[] = [];

            if (bed && bed !== "5plus") {
                const n = Number(bed);
                rows = await fetchAllFiltered({ ...commonPayload, bedrooms: String(n) });
                if (rows.length === 0) {
                    rows = await fetchAllFiltered({ ...commonPayload, bedrooms: `${n}BHK` });
                }
            } else {
                rows = await fetchAllFiltered(commonPayload);
            }

            if (bed === "5plus") {
                rows = rows.filter((p) => {
                    const n = readNumRooms(p);
                    return Number.isFinite(n) && n >= 5;
                });
            }

            onResults(rows);
        } catch (e: any) {
            onError?.(e?.message || "Failed to fetch filtered properties");
            onResults([]);
        } finally {
            onSearchingChange?.(false);
        }
    };

    const handleReset = async () => {
        setQ("");
        setType(undefined);
        setBed(undefined);
        setPrice(DEFAULT_PRICE);
        setArea(DEFAULT_AREA);
        onError?.(null);

        if (onShowAll) {
            onSearchingChange?.(true);
            try {
                await onShowAll();
            } finally {
                onSearchingChange?.(false);
            }
        }
    };

    const handleClear = () => {
        setQ("");
        setType(undefined);
        setBed(undefined);
        setPrice(DEFAULT_PRICE);
        setArea(DEFAULT_AREA);
        onError?.(null);
    };

    return (
  <section className="mx-auto mb-6 rounded-2xl bg-transparent border border-black/20 dark:border-gray-600/40 shadow-sm max-w-full md:max-w-6xl p-4 md:p-5">
    {/* FIELDS: vertical stack on mobile, original horizontal row on md+ */}
    <div
      className="
        flex flex-col md:flex-row
        items-stretch md:items-end
        gap-3 md:gap-4
        md:overflow-x-auto
        md:whitespace-nowrap
        md:[-ms-overflow-style:none] md:[scrollbar-width:none]
        md:[&::-webkit-scrollbar]:hidden
        pb-2
      "
    >
      {/* Search */}
      <div className="w-full md:min-w-[320px] md:w-auto md:shrink-0">
        <label className="block text-xs font-medium mb-1">Search</label>
        <Input
          placeholder="Location, property name, keyword…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="h-10"
        />
      </div>

      {/* Type */}
      <div className="w-full md:min-w-[190px] md:w-auto md:shrink-0">
        <label className="block text-xs font-medium mb-1">Type</label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Flat" />
          </SelectTrigger>
          <SelectContent>
            {UI_PROPERTY_TYPES.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bedrooms */}
      <div className="w-full md:min-w-[150px] md:w-auto md:shrink-0">
        <label className="block text-xs font-medium mb-1">Bedrooms</label>
        <Select value={bed} onValueChange={setBed}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="1BHK" />
          </SelectTrigger>
          <SelectContent>
            {BEDROOM_OPTIONS
              .filter(o => o.value !== "")
              .map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price slider */}
      <div className="w-full md:min-w-[200px] md:w-auto md:shrink-0">
        <div className="p-3 rounded-lg border border-border/40">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium">Price</span>
            <Badge variant="secondary">
              {formatPriceShort(price[0])} – {formatPriceShort(price[1])}
            </Badge>
          </div>
          <Slider
            min={DEFAULT_PRICE[0]}
            max={DEFAULT_PRICE[1]}
            step={5000}
            value={price}
            onValueChange={(v) => setPrice(v as [number, number])}
          />
        </div>
      </div>

      {/* Area slider */}
      <div className="w-full md:min-w-[200px] md:w-auto md:shrink-0">
        <div className="p-3 rounded-lg border border-border/40">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium">Area (sq.ft)</span>
            <Badge variant="secondary">
              {area[0]} – {area[1]} sq.ft
            </Badge>
          </div>
          <Slider
            min={DEFAULT_AREA[0]}
            max={DEFAULT_AREA[1]}
            step={100}
            value={area}
            onValueChange={(v) => setArea(v as [number, number])}
          />
        </div>
      </div>
    </div>

    {/* Buttons (unchanged; still right-aligned) */}
    <div className="mt-4 flex justify-end gap-2">
      <Button onClick={handleSearch} className="h-10">
        <SearchIcon className="mr-2 h-4 w-4" />
        Search
      </Button>
      <Button variant="outline" onClick={handleReset} className="h-10">
        Reset
      </Button>
      <Button variant="ghost" onClick={handleClear} className="h-10">
        Clear
      </Button>
    </div>

    {/* Active chips (unchanged) */}
    {(type || bed || q.trim() || !(price[0]===DEFAULT_PRICE[0] && price[1]===DEFAULT_PRICE[1]) || !(area[0]===DEFAULT_AREA[0] && area[1]===DEFAULT_AREA[1])) && (
      <div className="mt-3 flex gap-2 flex-wrap text-xs">
        {type && (
          <Badge variant="secondary" className="flex items-center gap-1">
            {type}
            <X className="h-3.5 w-3.5 cursor-pointer" onClick={() => setType(undefined)} />
          </Badge>
        )}
        {bed && (
          <Badge variant="secondary" className="flex items-center gap-1">
            {bed === "5plus" ? "5+ BHK" : `${bed} BHK`}
            <X className="h-3.5 w-3.5 cursor-pointer" onClick={() => setBed(undefined)} />
          </Badge>
        )}
        {q.trim() && (
          <Badge variant="secondary" className="flex items-center gap-1">
            “{q.trim()}”
            <X className="h-3.5 w-3.5 cursor-pointer" onClick={() => setQ("")} />
          </Badge>
        )}
        {!((price[0]===DEFAULT_PRICE[0]) && (price[1]===DEFAULT_PRICE[1])) && (
          <Badge variant="secondary">{formatPriceShort(price[0])} – {formatPriceShort(price[1])}</Badge>
        )}
        {!((area[0]===DEFAULT_AREA[0]) && (area[1]===DEFAULT_AREA[1])) && (
          <Badge variant="secondary">{area[0]} – {area[1]} sq.ft</Badge>
        )}
      </div>
    )}
  </section>
);

};

const PropertyListingPage: React.FC = () => {
    const { user } = useAuth();
    const token = (user as any)?.token ?? localStorage.getItem("token");

    // Data & state
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Likes / views
    const [likedIds, setLikedIds] = useState<Set<number>>(new Set());
    const [viewCounts, setViewCounts] = useState<Record<number, number>>({});
    const [countingIds, setCountingIds] = useState<Set<number>>(new Set());

    // Pagination
    const [page, setPage] = useState(1);
    const totalPages = Math.max(1, Math.ceil(properties.length / PAGE_SIZE));
    const paged = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return properties.slice(start, start + PAGE_SIZE);
    }, [properties, page]);

    // Carousel subcomponent
    const ImageCarousel: React.FC<{ images: string[]; heightClass?: string }> = ({ images, heightClass = "h-48" }) => {
        const [current, setCurrent] = useState(0);
        const len = images.length;
        useEffect(() => {
            if (len <= 1) return;
            const iv = setInterval(() => setCurrent((c) => (c + 1) % len), 5000);
            return () => clearInterval(iv);
        }, [len]);
        const prev = () => setCurrent((c) => (c - 1 + len) % len);
        const next = () => setCurrent((c) => (c + 1) % len);

        return (
            <div className={`${heightClass} relative overflow-hidden`}>
                <img
                    src={images[current] || "/fallback-thumbnail.png"}
                    alt={`Slide ${current + 1}`}
                    className="w-full h-full object-cover transition-opacity duration-500"
                />
                {len > 1 && (
                    <>
                        <button
                            onClick={prev}
                            className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/30 hover:bg-white/60 text-gray-800 dark:text-white p-1 rounded-full"
                            aria-label="Prev"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={next}
                            className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/30 hover:bg-white/60 text-gray-800 dark:text-white p-1 rounded-full"
                            aria-label="Next"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </>
                )}
            </div>
        );
    };

    // Initial load: show ALL properties
    const loadAll = async () => {
        try {
            setLoading(true);
            setError(null);

            const resp = await getAllProperties(50);
            const list = (resp.properties ?? []) as Property[];

            // Seed local viewCounts
            const seeded: Record<number, number> = {};
            list.forEach((p) => {
                const key = `viewCount:${p.id}`;
                const saved = localStorage.getItem(key);
                seeded[p.id] = saved ? Number(saved) : typeof p.viewCount === "number" ? p.viewCount : 0;
            });

            setProperties(list);
            setViewCounts(seeded);
            setPage(1);
        } catch (e: any) {
            setError(e?.message || "Failed to load properties");
            setProperties([]);
        } finally {
            setLoading(false);
        }
    };

    // Wishlist warmup
    useEffect(() => {
        if (!token) return;
        fetch(`${API_URL}/wishlist`, { headers: { Authorization: `Bearer ${token}` } })
            .then((r) => r.json())
            .then((list) => {
                const liked = new Set<number>();
                (Array.isArray(list) ? list : []).forEach((i: any) => {
                    const id = i?.propertyId ?? i?.id;
                    if (typeof id === "number") liked.add(id);
                });
                setLikedIds(liked);
            })
            .catch(() => { });
    }, [token]);

    const toggleLike = async (propertyId: number) => {
        if (!token) return;
        try {
            if (!likedIds.has(propertyId)) {
                await fetch(`${API_URL}/wishlist`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ propertyId }),
                });
                setLikedIds((prev) => new Set(prev).add(propertyId));
            } else {
                await fetch(`${API_URL}/wishlist/${propertyId}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                });
                setLikedIds((prev) => {
                    const n = new Set(prev);
                    n.delete(propertyId);
                    return n;
                });
            }
        } catch { }
    };

    const persistCount = (id: number, n: number) => {
        localStorage.setItem(`viewCount:${id}`, String(n));
        setViewCounts((prev) => ({ ...prev, [id]: n }));
    };

    const shareProperty = async (prop: Property) => {
        const url = `${window.location.origin}/properties/${prop.id}`;
        const title = prop.title || "Property";
        try {
            if ((navigator as any).share) {
                await (navigator as any).share({ title, url });
            } else {
                await navigator.clipboard.writeText(url);
                alert("Link copied to clipboard!");
            }
        } catch { }
    };

    const incrementViewAndGo = async (prop: Property) => {
        const id = prop.id;
        const current = viewCounts[id] ?? 0;
        persistCount(id, current + 1);
        setCountingIds((s) => new Set(s).add(id));
        try {
            const res = await fetch(`${API_URL}/properties/${id}/view`, {
                method: "POST",
                headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            });
            if (res.ok) {
                const data = await res.json().catch(() => ({}));
                const serverCount = data.viewCount ?? data.views ?? data.count;
                if (typeof serverCount === "number") persistCount(id, serverCount);
            } else {
                persistCount(id, Math.max(0, current));
            }
        } catch {
            persistCount(id, Math.max(0, current));
        } finally {
            setCountingIds((s) => {
                const n = new Set(s);
                n.delete(id);
                return n;
            });
            window.location.href = `/properties/${id}`;
        }
    };

    // Effects
    useEffect(() => {
        loadAll();
    }, []);

    return (
        <ThemeProvider defaultTheme="dark">
            <div className="min-h-screen flex flex-col bg-white dark:bg-black text-gray-900 dark:text-gray-100">
                <Navbar />
                <main className="flex-grow pt-24 pb-12">
                    {/* Hero */}
                    <section
                        className="
              relative overflow-hidden rounded-lg mb-12
              mx-3 sm:mx-6 md:mx-12
              bg-gradient-to-r from-gray-800/90 via-gray-900/90 to-gray-800/90
              dark:from-black/80 dark:via-gray-800/80 dark:to-gray-700/80
              p-4 sm:p-6 md:p-8
              h-48 sm:h-56 md:h-64
            "
                    >
                        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none" aria-hidden="true">
                            <svg className="absolute right-0 top-0 h-full w-full" viewBox="0 0 80 80" preserveAspectRatio="none">
                                <circle cx="0" cy="0" r="80" fill="white" fillOpacity="0.1" />
                                <circle cx="80" cy="0" r="40" fill="white" fillOpacity="0.1" />
                                <circle cx="80" cy="80" r="60" fill="white" fillOpacity="0.1" />
                                <circle cx="0" cy="80" r="40" fill="white" fillOpacity="0.1" />
                            </svg>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center px-3 sm:px-6">
                            <h1
                                className="
                  text-white font-bold text-center leading-tight
                  text-2xl xs:text-3xl sm:text-4xl md:text-6xl
                  [text-wrap:balance]
                  max-w-[90%] sm:max-w-[85%] md:max-w-none
                "
                            >
                                Discover Your Dream Home
                            </h1>
                        </div>
                    </section>

                    {/* New compact search bar */}
                    <SearchBarCompact
                        onResults={(rows) => {
                            // normalize minimal fields for cards
                            const list = (rows || []).map((p: any) => ({
                                ...p,
                                id: p.id ?? p.propertyId ?? p._id,
                                images: p.images ?? (p.cover_image ? [p.cover_image] : []),
                                availabilityStatus: p.availabilityStatus ?? p.status ?? p.availability_status ?? "available",
                                numRooms: p.numRooms ?? p.bedrooms ?? p.bhk ?? 0,
                                numBathrooms: p.numBathrooms ?? p.bathrooms ?? 0,
                                propertyType: p.propertyType ?? p.type ?? "unknown",
                                price: p.price ?? 0,
                                city: p.city ?? "",
                                state: p.state ?? "",
                                title: p.title ?? "Untitled",
                            })) as Property[];

                            // seed view counts
                            const seeded: Record<number, number> = {};
                            list.forEach((it) => {
                                const key = `viewCount:${it.id}`;
                                const saved = localStorage.getItem(key);
                                seeded[it.id] = saved ? Number(saved) : typeof it.viewCount === "number" ? it.viewCount : 0;
                            });

                            setViewCounts(seeded);
                            setProperties(list);
                            setPage(1);
                        }}
                        onSearchingChange={(isLoading) => setLoading(!!isLoading)}
                        onError={(msg) => setError(msg)}
                        onShowAll={loadAll}
                    />

                    {/* Results */}
                    <div className="container mx-auto px-6">
                        {error && <div className="text-red-600 text-center mb-6">{error}</div>}
                        {loading ? (
                            <div className="text-center text-lg">Loading properties…</div>
                        ) : (
                            <>
                                <TooltipProvider>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                        {paged.map((prop, idx) => {
                                            const count = viewCounts[prop.id] ?? 0;
                                            const counting = countingIds.has(prop.id);
                                            const imgs = prop.images?.length ? prop.images : prop.cover_image ? [prop.cover_image] : [];

                                            return (
                                                <motion.div
                                                    key={prop.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                                                    whileHover={{ scale: 1.02 }}
                                                    className="relative"
                                                >
                                                    <Card className="group overflow-hidden w-full">
                                                        {/* Top-right actions */}
                                                        <div className="absolute top-3 right-3 z-10 flex gap-2">
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <button
                                                                        className="p-1 rounded-full bg-white/90 dark:bg-zinc-800/90 shadow"
                                                                        onClick={() => toggleLike(prop.id)}
                                                                        aria-label={likedIds.has(prop.id) ? "Remove from favorites" : "Add to favorites"}
                                                                    >
                                                                        <Heart
                                                                            className={`h-5 w-5 ${likedIds.has(prop.id)
                                                                                ? "fill-red-500 text-red-500"
                                                                                : "text-gray-600 dark:text-gray-300"
                                                                                }`}
                                                                        />
                                                                    </button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    {likedIds.has(prop.id) ? "Remove from favorites" : "Add to favorites"}
                                                                </TooltipContent>
                                                            </Tooltip>

                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <button
                                                                        className="p-1 rounded-full bg-white/90 dark:bg-zinc-800/90 shadow"
                                                                        onClick={() => shareProperty(prop)}
                                                                        aria-label="Share property"
                                                                    >
                                                                        <Share2 className="h-5 w-5" />
                                                                    </button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Share property</TooltipContent>
                                                            </Tooltip>

                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <button
                                                                        className="p-1 rounded-full bg-white/90 dark:bg-zinc-800/90 shadow cursor-default disabled:opacity-70"
                                                                        disabled={counting}
                                                                        aria-label={`${count.toLocaleString()} views`}
                                                                    >
                                                                        <Eye className="h-5 w-5" />
                                                                    </button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>{count.toLocaleString()} views</TooltipContent>
                                                            </Tooltip>
                                                        </div>

                                                        {/* Images + badge */}
                                                        <div className="relative">
                                                            <ImageCarousel images={imgs} />
                                                            <div className="absolute top-2 left-2 z-10">
                                                                <Badge variant="secondary" className="bg-white/90 dark:bg-zinc-800/90">
                                                                    {formatPropertyId(String(prop.id))}
                                                                </Badge>
                                                            </div>
                                                        </div>

                                                        <CardContent className="p-4 space-y-3">
                                                            <div className="flex justify-between items-center">
                                                                <h3 className="text-xl font-semibold truncate">{prop.title}</h3>
                                                                <Badge
                                                                    variant={
                                                                        (prop.availabilityStatus ?? prop.status) === "available"
                                                                            ? "default"
                                                                            : (prop.availabilityStatus ?? prop.status) === "rented"
                                                                                ? "secondary"
                                                                                : (prop.availabilityStatus ?? prop.status) === "sold"
                                                                                    ? "destructive"
                                                                                    : "outline"
                                                                    }
                                                                >
                                                                    {capitalizeFirstLetter(prop.availabilityStatus ?? prop.status ?? "available")}
                                                                </Badge>
                                                            </div>

                                                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                                                <MapPin className="h-3 w-3" />
                                                                <span className="truncate">
                                                                    {prop.city}, {prop.state}
                                                                </span>
                                                            </div>

                                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                                                                <div className="flex items-center gap-1 text-sm">
                                                                    <Bed className="h-3 w-3 text-muted-foreground" />
                                                                    <span>{prop.numRooms} Beds</span>
                                                                </div>
                                                                <div className="flex items-center gap-1 text-sm">
                                                                    <Bath className="h-3 w-3 text-muted-foreground" />
                                                                    <span>{prop.numBathrooms} Baths</span>
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                                                <div className="font-semibold">{formatCurrency(prop.price)}</div>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="gap-1"
                                                                    onClick={() => incrementViewAndGo(prop)}
                                                                >
                                                                    View Details
                                                                    <ArrowUpRight className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </TooltipProvider>

                                {/* Pagination */}
                                {properties.length > 0 && totalPages > 1 && (
                                    <div className="mt-8 flex items-center justify-center gap-2">
                                        <Button variant="outline" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                                            Prev
                                        </Button>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                            <Button
                                                key={p}
                                                variant={p === page ? "default" : "outline"}
                                                onClick={() => setPage(p)}
                                                className="w-9"
                                            >
                                                {p}
                                            </Button>
                                        ))}
                                        <Button
                                            variant="outline"
                                            disabled={page === totalPages}
                                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </main>
            </div>
        </ThemeProvider>
    );
};

export default PropertyListingPage;
