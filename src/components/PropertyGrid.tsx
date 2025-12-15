import { useState, useEffect, useMemo } from "react";
import PropertyCard from "./PropertyCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Grid, List, ChevronRight } from "lucide-react";
// import { getAllProperties,getProperties, Property as ServiceProperty } from "@/services/propertyService";
import { getAllProperties, Property as ServiceProperty } from "@/services/propertyService";
import { useNavigate } from 'react-router-dom';

const PAGE_SIZE = 4;

type Props = {
  items?: ServiceProperty[];
  loading?: boolean;
  error?: string | null;
  title?: string;
};

const PropertyGrid: React.FC<Props> = ({ items, loading, error, title = "Featured Properties" }) => {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [internalProps, setInternalProps] = useState<ServiceProperty[]>([]);
  const [internalLoading, setInternalLoading] = useState(true);
  const [internalError, setInternalError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const controlled = typeof items !== "undefined";

  // PropertyGrid.tsx — replace the fetch effect

  useEffect(() => {
    if (controlled) return;
    const fetchAll = async () => {
      try {
        setInternalLoading(true);

        // Detect admin so homepage can match PropertyManagement count
        const userType = localStorage.getItem("userType") || localStorage.getItem("role") || "";
        const filters = userType.toLowerCase() === "admin" ? { isAdmin: true } : {};

        // Pull EVERYTHING; set batch to 50 or 100 if you prefer
        const response = await getAllProperties(50, filters as any);

        setInternalProps(response.properties || []);
        setPage(1);
      } catch (err) {
        console.error("Error fetching properties:", err);
        setInternalError("Error fetching properties");
      } finally {
        setInternalLoading(false);
      }
    };
    fetchAll();
  }, [controlled]);



  useEffect(() => {
    setPage(1);
  }, [items?.length]);

  // const source = controlled && items
  //   ? (items.length >= internalProps.length ? items : internalProps)
  //   : internalProps;
  const source = controlled ? (items ?? []) : internalProps;
  const isLoading = controlled ? !!loading : internalLoading;
  const errMsg = controlled ? (error ?? null) : internalError;

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(source.length / PAGE_SIZE)),
    [source.length]
  );

  const pagedProperties = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return source.slice(start, start + PAGE_SIZE);
  }, [source, page]);
  useEffect(() => {
    console.log("🔍 PropertyGrid debug:");
    console.log("Total properties available:", source.length);
    console.log("Total pages (client):", totalPages);
    console.log("Current page:", page);
    console.log("Properties displayed on this page:", pagedProperties.length);
    console.log("IDs on page:", pagedProperties.map(p => (p as any).id ?? (p as any).propertyId));
  }, [source, pagedProperties, page, totalPages]);
  const goToPrevPage = () => setPage((p) => Math.max(1, p - 1));
  const goToNextPage = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <section id="properties" className="py-16 sm:py-20 px-4 sm:px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 sm:mb-10 md:mb-12">
          <div>
            <h2 className="text-lg sm:text-xl md:text-4xl font-bold mb-3 sm:mb-4 tracking-tight animate-fade-in">
              {title}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-2xl animate-fade-in">
              Explore our handpicked selection of premium properties across India's top cities.
            </p>
          </div>

          <div className="flex items-center mt-4 sm:mt-6 md:mt-0 space-x-3 sm:space-x-4">
            <div className="flex items-center space-x-1.5 sm:space-x-2 border rounded-lg p-0.5 sm:p-1">
              <Button
                variant={view === "grid" ? "default" : "ghost"}
                size="sm"
                className="rounded-md"
                onClick={() => { setView("grid"); setPage(1); }}              >
                <Grid className="h-4 w-4" />
                <span className="sr-only">Grid view</span>
              </Button>
              <Button
                variant={view === "list" ? "default" : "ghost"}
                size="sm"
                className="rounded-md"
                onClick={() => { setView("list"); setPage(1); }}              >
                <List className="h-4 w-4" />
                <span className="sr-only">List view</span>
              </Button>
            </div>

            <Tabs defaultValue="rent" className="w-full">
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="rent" className="text-xs sm:text-sm md:text-base">
                  For Rent
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Loading / Error */}
        {isLoading && (
          <div className="text-center py-8 sm:py-10">
            <p className="text-sm sm:text-base">Loading properties...</p>
          </div>
        )}
        {errMsg && !isLoading && (
          <div className="text-center py-8 sm:py-10">
            <p className="text-red-500 text-sm sm:text-base">{errMsg}</p>
          </div>
        )}

        {/* Properties */}
        {!isLoading && !errMsg && (
          <>
            <div
              className={`grid gap-4 sm:gap-6 md:gap-8 animate-fade-in text-xs sm:text-sm md:text-base ${view === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 "
                : "grid-cols-1"
                }`}
            >
              {pagedProperties.map((property, idx) => (
                <PropertyCard
                  key={property.id ?? (property as any).propertyId ?? `fallback-${idx}`}
                  property={property}
                />
              ))}
              {source.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground text-xs sm:text-sm md:text-base">
                  No properties found.
                </div>
              )}
            </div>

            {/* Carousel Controls */}
            {source.length > 0 && (
              <div className="flex justify-center items-center mt-8 sm:mt-10 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full px-3 py-1 text-xs sm:text-sm md:text-base"
                  onClick={goToPrevPage}
                  disabled={page === 1}
                >
                  Prev
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Button
                    key={p}
                    variant={p === page ? "default" : "outline"}
                    size="sm"
                    className="rounded-full w-7 h-7 p-0 text-xs sm:text-sm md:text-base"
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full px-3 py-1 text-xs sm:text-sm md:text-base"
                  onClick={goToNextPage}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}

            {/* View All Button */}
            <div className="flex justify-center mt-6 sm:mt-8">
              <Button
                variant="outline"
                className="
              rounded-full gap-2 group
              text-xs sm:text-sm md:text-base
              px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3
            "
                onClick={() => navigate('/properties')}
              >
                View All Properties
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </>
        )}
      </div>
    </section>

  );
};

export default PropertyGrid;
