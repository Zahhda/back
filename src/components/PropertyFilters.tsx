import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X } from "lucide-react";
import { getProperties, getAllProperties, Property as ServiceProperty } from "@/services/propertyService";

const UI_PROPERTY_TYPES = ["Flatmates", "Flats", "Full House", "Paying Guest", "Villa"];
const BEDROOM_OPTIONS = [
  { label: "1 BHK", value: "1" },
  { label: "2 BHK", value: "2" },
  { label: "3 BHK", value: "3" },
  { label: "4 BHK", value: "4" },
  { label: "5+ BHK", value: "5plus" },
];
const TYPE_SLUG: Record<string, string> = {
  "Flatmates": "flatmate",
  "Flats": "flat",
  "Full House": "house",
  "Paying Guest": "pg",
  "Villa": "villa",
};
const uniqById = <T extends { id?: any }>(rows: T[]) => {
  const seen = new Set();
  return rows.filter(r => {
    const k = r.id ?? JSON.stringify(r);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

type Props = {
  onResults: (rows: ServiceProperty[]) => void;
  onSearchingChange?: (loading: boolean) => void;
  onError?: (msg: string | null) => void;
};

const PropertyFilters: React.FC<Props> = ({ onResults, onSearchingChange, onError }) => {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const DEFAULT_PRICE: [number, number] = [5000, 500000];
  const DEFAULT_AREA: [number, number] = [0, 5000];
  const [priceRange, setPriceRange] = useState<[number, number]>(DEFAULT_PRICE);
  const [areaRange, setAreaRange] = useState<[number, number]>(DEFAULT_AREA);
  const [roomFacets, setRoomFacets] = useState<Record<number, number>>({});
  const [selectedBedroom, setSelectedBedroom] = useState<string>("");

  const selectedTypeSlugs = useMemo(
    () =>
      activeFilters
        .filter(f => UI_PROPERTY_TYPES.includes(f))
        .map(f => TYPE_SLUG[f] ?? f.toLowerCase().replace(/\s+/g, "_")),
    [activeFilters]
  );
  const isDefaultPrice = (v: [number, number]) => v[0] === DEFAULT_PRICE[0] && v[1] === DEFAULT_PRICE[1];
  const isDefaultArea = (v: [number, number]) => v[0] === DEFAULT_AREA[0] && v[1] === DEFAULT_AREA[1];

  const addFilter = (filter: string) => setActiveFilters(prev => (prev.includes(filter) ? prev : [...prev, filter]));
  const removeFilter = (filter: string) => setActiveFilters(prev => prev.filter(f => f !== filter));

  const clearAllFilters = () => {
    setActiveFilters([]);
    setPriceRange(DEFAULT_PRICE);
    setAreaRange(DEFAULT_AREA);
    setSelectedBedroom("");
    setSearchQuery("");
    
  };

  const showAllProperties = async () => {
    onSearchingChange?.(true);
    onError?.(null);
    try {
      const userType = localStorage.getItem("userType") || localStorage.getItem("role") || "";
      const filters = userType?.toLowerCase() === "admin" ? { isAdmin: true } : {};
      const resp = await getAllProperties(50, filters as any);
      const items: ServiceProperty[] = resp?.properties ?? [];
      onResults(items);
      const anchor = document.querySelector('[data-prop-grid-anchor]');
      if (anchor) anchor.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (e: any) {
      onError?.(e?.message || "Failed to load properties");
    } finally {
      onSearchingChange?.(false);
    }
  };

  const formatPrice = (value: number) =>
    value < 100000 ? `₹${(value / 1000).toFixed(0)}K` : `₹${(value / 100000).toFixed(1)}L`;

  // ---- payload ----
  const buildPayload = () => {
    const [ps, pe] = isDefaultPrice(priceRange) ? ["", ""] : [String(priceRange[0]), String(priceRange[1])];
    const [as, ae] = isDefaultArea(areaRange) ? ["", ""] : [String(areaRange[0]), String(areaRange[1])];

    const bedroomPayload =
      selectedBedroom && selectedBedroom !== "5plus" ? String(Number(selectedBedroom)) : "";

    return {
      property_type: selectedTypeSlugs.join(","), 
      price_start: ps,
      price_end: pe,
      min_area: as,
      max_area: ae,
      search_query: searchQuery.trim(),
      location: "",
      bedrooms: bedroomPayload,
    };
  };

  // ---- networking (paged) ----
  const fetchFilteredPage = async (payload: any) => {
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
            Array.isArray(data) ? data :
              [];

    return {
      rows: rows.map(p => ({ ...p, id: p.id ?? p.propertyId ?? p._id })),
      totalPages: data?.totalPages ?? data?.pages ?? undefined,
    };
  };

  const DEFAULT_LIMIT = 100;

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
    return all.filter(r => {
      const k = r.id ?? JSON.stringify(r);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  };

  const fetchWithBedroom = async (basePayload: any, bedroomNum: number) => {
    let rows = await fetchAllFiltered({ ...basePayload, bedrooms: String(bedroomNum) });
    if (rows.length > 0) return rows;
    rows = await fetchAllFiltered({ ...basePayload, bedrooms: `${bedroomNum}BHK` });
    return rows;
  };

  // ---- read helpers ----
  const toSlug = (s: any) => String(s ?? "").trim().toLowerCase().replace(/\s+/g, "_");
  const LABEL_TO_SLUG: Record<string, string> = {
    Flatmates: "flatmate",
    Flats: "flat",
    "Full House": "house",
    "Paying Guest": "pg",
    Villa: "villa",
  };
  const readTypeSlug = (p: any) => {
    const raw = p?.property_type ?? p?.propertyType ?? p?.type ?? p?.category ?? "";
    if (LABEL_TO_SLUG[raw as keyof typeof LABEL_TO_SLUG]) return LABEL_TO_SLUG[raw as keyof typeof LABEL_TO_SLUG];
    return toSlug(raw);
  };
  const matchesSelectedTypes = (p: any, selectedTypeSlugs: string[]) => {
    if (selectedTypeSlugs.length === 0) return true;
    const slug = readTypeSlug(p);
    return selectedTypeSlugs.includes(slug);
  };
  const toRoomNumber = (val: any): number => {
    if (typeof val === "number") return val;
    if (typeof val === "string") {
      const m = val.match(/\d+/);
      if (m) return Number(m[0]);
    }
    return NaN;
  };
  const readNumRooms = (p: any) => {
    const candidates = [
      p?.numRooms, p?.num_rooms, p?.bedrooms, p?.bhk,
      p?.roomCount, p?.bedroomCount, p?.rooms, p?.details?.bedrooms,
    ];
    for (const c of candidates) {
      const n = toRoomNumber(c);
      if (Number.isFinite(n)) return n;
    }
    const fromTitle = toRoomNumber(p?.title);
    if (Number.isFinite(fromTitle)) return fromTitle;
    const fromDesc = toRoomNumber(p?.description);
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
      let baseRows: ServiceProperty[] = [];

      if (selectedBedroom && selectedBedroom !== "5plus") {
        const n = Number(selectedBedroom);
        const serverRows = await fetchWithBedroom(commonPayload, n);
        if (serverRows.length > 0) {
          onResults(serverRows);
          requestAnimationFrame(() => setTimeout(scrollToResults, 0));
          return;
        }
      }

      if (selectedTypeSlugs.length === 0) {
        baseRows = await fetchAllFiltered(commonPayload);
      } else {
        baseRows = await fetchAllFiltered({ ...commonPayload, property_type: selectedTypeSlugs.join(",") });

        if (baseRows.length === 0 && selectedTypeSlugs.length > 1) {
          const perTypeArrays = await Promise.all(
            selectedTypeSlugs.map(t => fetchAllFiltered({ ...commonPayload, property_type: t }))
          );
          baseRows = uniqById(perTypeArrays.flat());
        }

        if (baseRows.length === 0) {
          const labels = activeFilters.filter(f => UI_PROPERTY_TYPES.includes(f));
          if (labels.length) {
            const perLabelArrays = await Promise.all(
              labels.map(lbl => fetchAllFiltered({ ...commonPayload, property_type: lbl }))
            );
            baseRows = uniqById(perLabelArrays.flat());
          }
        }

        baseRows = baseRows.filter(p => matchesSelectedTypes(p, selectedTypeSlugs));
      }

      let rows = baseRows;
      if (selectedBedroom) {
        const target = selectedBedroom === "5plus" ? 5 : Number(selectedBedroom);
        rows = baseRows.filter(p => {
          const n = readNumRooms(p);
          if (!Number.isFinite(n)) return false;
          return selectedBedroom === "5plus" ? n >= 5 : n === target;
        });
      }

      onResults(rows);
      requestAnimationFrame(() => setTimeout(scrollToResults, 0));
    } catch (e: any) {
      onError?.(e?.message || "Failed to fetch filtered properties");
      onResults([]);
    } finally {
      onSearchingChange?.(false);
    }
  };

  const onReset = async () => {
    clearAllFilters();          
    onError?.(null);
    await showAllProperties();  
  };


  const scrollToResults = () => {
    const el =
      document.querySelector('[data-prop-grid-anchor]') ||
      document.getElementById('properties') ||
      document.getElementById('property-grid-top');
    if (!el) return;
    const top = (el as HTMLElement).getBoundingClientRect().top + window.pageYOffset - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  useEffect(() => {
    (async () => {
      try {
        const resp = await getProperties({});
        const items: ServiceProperty[] = resp?.properties ?? [];
        const counts: Record<number, number> = {};
        for (const p of items) {
          const n = Number(p?.numRooms);
          if (!Number.isFinite(n)) continue;
          counts[n] = (counts[n] || 0) + 1;
        }
        setRoomFacets(counts);
      } catch (err) {
        console.warn("Failed to load room facets:", err);
        setRoomFacets({});
      }
    })();
  }, []);

  return (
    <section className="py-10 sm:py-12 px-4 sm:px-6 md:px-12 bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
          <div>
            <h2 className="text-lg sm:text-xl md:text-4xl font-semibold mb-1">Find Your Perfect Property</h2>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
              Refine your search with our advanced filters
            </p>
          </div>

          <Button variant="outline" className="gap-2 text-xs sm:text-sm md:text-base">
            <Filter className="h-4 w-4" />
            Advanced Filters
          </Button>
        </div>

        <Card className="border border-border/30 shadow-lg bg-background/70 backdrop-blur-sm">
          <CardContent className="p-4 sm:p-5 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
              {/* Search box */}
              <div className="md:col-span-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by location, property name, or keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 py-2 sm:py-3 rounded-lg bg-background border border-input text-xs sm:text-sm md:text-base"
                  />
                </div>
              </div>

              {/* Property Type */}
              <div>
                <Accordion type="single" collapsible defaultValue="item-1">
                  <AccordionItem value="item-1" className="border-b-0">
                    <AccordionTrigger className="py-2 sm:py-3 hover:no-underline">
                      <span className="text-xs sm:text-sm md:text-base font-medium">Property Type</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {UI_PROPERTY_TYPES.map((type) => (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox
                              id={`type-${type}`}
                              checked={activeFilters.includes(type)}
                              onCheckedChange={(checked) =>
                                checked ? addFilter(type) : removeFilter(type)
                              }
                            />
                            <Label
                              htmlFor={`type-${type}`}
                              className="text-xs sm:text-sm md:text-base cursor-pointer"
                            >
                              {type}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              {/* Price Range */}
              <div>
                <Accordion type="single" collapsible defaultValue="item-1">
                  <AccordionItem value="item-1" className="border-b-0">
                    <AccordionTrigger className="py-2 sm:py-3 hover:no-underline">
                      <span className="text-xs sm:text-sm md:text-base font-medium">Price Range</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 sm:space-y-4">
                        <Slider
                          min={DEFAULT_PRICE[0]}
                          max={DEFAULT_PRICE[1]}
                          step={5000}
                          value={priceRange}
                          onValueChange={(v) => setPriceRange(v as [number, number])}
                          className="w-full mt-4 sm:mt-5"
                        />
                        <div className="text-xs sm:text-sm md:text-base flex justify-between text-muted-foreground">
                          <span>{formatPrice(priceRange[0])}</span>
                          <span>to</span>
                          <span>{formatPrice(priceRange[1])}</span>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              {/* Bedrooms */}
              <div>
                <Accordion type="single" collapsible defaultValue="item-1">
                  <AccordionItem value="item-1" className="border-b-0">
                    <AccordionTrigger className="py-2 sm:py-3 hover:no-underline">
                      <span className="text-xs sm:text-sm md:text-base font-medium">Bedrooms</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-wrap gap-2">
                        {BEDROOM_OPTIONS.map((opt) => {
                          const active = selectedBedroom === opt.value;
                          return (
                            <Button
                              key={opt.value}
                              variant={active ? "default" : "outline"}
                              size="sm"
                              className="rounded-full min-w-[80px] text-xs sm:text-sm md:text-base"
                              onClick={() => setSelectedBedroom(active ? "" : opt.value)}
                            >
                              {opt.label}
                            </Button>
                          );
                        })}
                        {selectedBedroom && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full text-xs sm:text-sm md:text-base"
                            onClick={() => setSelectedBedroom("")}
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              {/* Area */}
              <div>
                <Accordion type="single" collapsible defaultValue="item-1">
                  <AccordionItem value="item-1" className="border-b-0">
                    <AccordionTrigger className="py-2 sm:py-3 hover:no-underline">
                      <span className="text-xs sm:text-sm md:text-base font-medium">Area (sq.ft)</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 sm:space-y-4">
                        <Slider
                          min={DEFAULT_AREA[0]}
                          max={DEFAULT_AREA[1]}
                          step={100}
                          value={areaRange}
                          onValueChange={(v) => setAreaRange(v as [number, number])}
                          className="w-full mt-4 sm:mt-5"
                        />
                        <div className="flex justify-between text-muted-foreground text-xs sm:text-sm md:text-base">
                          <span>{areaRange[0]} sq.ft</span>
                          <span>to</span>
                          <span>{areaRange[1]} sq.ft</span>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </CardContent>

          {/* Active chips */}
          {activeFilters.length > 0 && (
            <div className="px-4 sm:px-6 py-3 border-t border-border/30 bg-secondary/10">
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm md:text-base">
                <span className="text-xs sm:text-sm md:text-base text-muted-foreground">
                  Active filters:
                </span>
                {activeFilters.map((filter) => (
                  <Badge key={filter} variant="secondary" className="flex items-center gap-1 px-2 py-1">
                    {filter}
                    <X className="h-3.5 w-3.5 cursor-pointer" onClick={() => removeFilter(filter)} />
                  </Badge>
                ))}
                {selectedBedroom && (
                  <Badge variant="secondary" className="flex items-center gap-1 px-2 py-1">
                    {selectedBedroom === "5plus" ? "5+ BHK" : `${selectedBedroom} BHK`}
                    <X
                      className="h-3.5 w-3.5 cursor-pointer"
                      onClick={() => setSelectedBedroom("")}
                    />
                  </Badge>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 h-7 text-xs sm:text-sm md:text-base"
                  onClick={async () => {
                    clearAllFilters();
                    await showAllProperties();
                  }}
                >
                  Clear all
                </Button>

              </div>
            </div>
          )}

          <CardFooter className="p-4 sm:p-5 md:p-6 pt-0 flex flex-wrap justify-end gap-3 sm:gap-4">
            <Button
              variant="outline"
              className="w-full sm:w-auto text-xs sm:text-sm md:text-base"
              onClick={async () => { await onReset(); }}   
            >
              Reset
            </Button>
            <Button
              className="w-full sm:w-auto gap-2 text-xs sm:text-sm md:text-base"
              onClick={handleSearch}
            >
              <Search className="h-4 w-4" />
              Search Properties
            </Button>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
};

export default PropertyFilters;
