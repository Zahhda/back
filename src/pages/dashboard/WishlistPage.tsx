import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { useNavigate } from 'react-router-dom';
import { Badge } from "@/components/ui/badge";
import { formatCurrency, capitalizeFirstLetter } from "@/lib/utils";

import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Trash2,
  Edit3,
  Heart,
  Building2,
  FileText,
  Calendar,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bed, Bath } from "lucide-react";


type PropertyLite = {
  id: string;
  title?: string;
  cover_image?: string;
  images?: string[];
  city?: string;
  state?: string;
  price?: number;
  availabilityStatus?: "available" | "rented" | "sold" | string;
  numRooms?: number;
  numBathrooms?: number;
};
interface WishlistItem {
  id: string;
  propertyId: string;
  notes: string;
  createdAt: string;
  property?: PropertyLite;
}

const API_BASE = 'https://dorpay.in';
const ITEMS_PER_PAGE = 6;

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 280, damping: 20 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

const WishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = (user as any).token ?? localStorage.getItem('token');

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PLACEHOLDER_IMG = "https://placehold.co/800x450?text=No+Image";
  const primaryImage = (p?: PropertyLite) =>
    p?.cover_image || p?.images?.[0] || PLACEHOLDER_IMG;

  useEffect(() => {
    const load = async () => {
      if (!token) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/api/wishlist`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const baseItems: WishlistItem[] = await res.json();

        const itemsWithProps = await Promise.all(
          baseItems.map(async (it) => {
            try {
              const pr = await fetch(`${API_BASE}/api/properties/${it.propertyId}`, {
                headers: { Authorization: `Bearer ${token}` }, // keep if your API requires auth
              });
              if (pr.ok) {
                const prop = (await pr.json()) as PropertyLite;
                return { ...it, property: prop };
              }
            } catch (e) {
              console.warn("Property fetch failed for", it.propertyId, e);
            }
            return it;
          })
        );

        setItems(itemsWithProps);
      } catch (err: any) {
        setError(err.message || "Fetch error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);


  const removeItem = async (id: string) => {
    try {
      await fetch(`${API_BASE}/api/wishlist/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (item: WishlistItem) => {
    setEditingId(item.id);
    setEditNotes(item.notes);
  };

  const saveEdit = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/wishlist/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes: editNotes }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setItems(prev => prev.map(item => item.id === id ? { ...item, notes: editNotes } : item));
      setEditingId(null);
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const paginatedItems = items.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <ThemeProvider defaultTheme="dark">
      <div className="min-h-screen bg-gray dark:bg-black transition-colors duration-500">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
          {/* Page Title */}
          <motion.h1
            className="text-xl sm:text-4xl font-extrabold mb-4 sm:mb-8 text-gray-800 dark:text-gray-100 flex items-center text-balance leading-tight"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <FileText className="mr-2 sm:mr-3 text-indigo-600 dark:text-indigo-300" size={20} />
            My Wishlist
          </motion.h1>


          {/* Loading Skeleton */}
          {loading && (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="rounded-2xl overflow-hidden ring-1 ring-indigo-200/50 dark:ring-indigo-700/30"
                >
                  <div className="aspect-video bg-gray-200 dark:bg-gray-700" />
                  <div className="p-4 sm:p-6 space-y-2 sm:space-y-3 bg-white dark:bg-gray-800">
                    <div className="h-3.5 sm:h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {error && <p className="text-red-500 mb-4">Error: {error}</p>}
          {!loading && !error && items.length === 0 && (
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">No items in your wishlist yet.</p>
          )}

          {!loading && !error && paginatedItems.length > 0 && (
            <motion.div
              className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence>
                {paginatedItems.map((item) => (
                  <motion.div
                    key={item.id}
                    variants={cardVariants}
                    exit="exit"
                    whileHover={{ scale: 1.03, boxShadow: '0 15px 25px rgba(0,0,0,0.15)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card className="group overflow-hidden w-full rounded-2xl border border-border bg-white dark:bg-gradient-to-br dark:from-black dark:via-[#0f0f0f] dark:to-black shadow-sm">
                      <div className="relative overflow-hidden">
                        <div
                          className="w-full relative overflow-hidden aspect-[4/3] xs:aspect-[5/4] sm:aspect-[4/3] lg:aspect-[16/10] bg-gray-100 dark:bg-zinc-900 cursor-pointer"
                          onClick={() => navigate(`/properties/${item.propertyId}`)}
                          title={item.property?.title || 'View property'}
                        >
                          <img
                            src={primaryImage(item.property)}
                            alt={item.property?.title ? `${item.property.title} cover` : 'Property image'}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        <div className="absolute top-2 right-2 z-10 flex gap-1">
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8 bg-white/90 dark:bg-zinc-800/90"
                            onClick={() => startEdit(item)}
                            title="Edit notes"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8 bg-white/90 dark:bg-zinc-800/90"
                            onClick={() => removeItem(item.id)}
                            title="Remove from wishlist"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="absolute bottom-2 left-2">
                          <span className="inline-flex items-center px-2 py-1 text-[11px] sm:text-xs rounded-full bg-black/60 text-white backdrop-blur">
                            {item.property?.city && item.property?.state
                              ? `${item.property.city}, ${item.property.state}`
                              : 'Property'}
                          </span>
                        </div>

                        {typeof item.property?.price === 'number' && (
                          <div className="absolute bottom-2 right-2">
                            <span className="inline-flex items-center px-2 py-1 text-[11px] sm:text-xs rounded-md bg-white/90 dark:bg-zinc-800/90 font-semibold">
                              {formatCurrency(item.property!.price)}
                            </span>
                          </div>
                        )}
                      </div>

                      <CardContent className="p-4 sm:p-5">
                        <div className="mb-1.5 sm:mb-2 flex items-center gap-2 min-w-0">
                          <h3 className="font-semibold truncate flex-1 min-w-0 text-sm sm:text-base">
                            {item.property?.title || 'Property'}
                          </h3>
                          <Badge
                            className="shrink-0 text-[11px] sm:text-xs"
                            variant={
                              item.property?.availabilityStatus === 'available'
                                ? 'default'
                                : item.property?.availabilityStatus === 'rented'
                                  ? 'secondary'
                                  : item.property?.availabilityStatus === 'sold'
                                    ? 'destructive'
                                    : 'outline'
                            }
                          >
                            {item.property?.availabilityStatus
                              ? item.property.availabilityStatus.charAt(0).toUpperCase() +
                              item.property.availabilityStatus.slice(1)
                              : '—'}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-3 text-xs sm:text-sm md:text-base mb-2 sm:mb-3">
                          <div className="flex items-center gap-1">
                            <Bed className="h-3 w-3 text-muted-foreground" />
                            <span>{item.property?.numRooms ?? '—'} Beds</span>
                          </div>
                          <span className="text-muted-foreground/60">•</span>
                          <div className="flex items-center gap-1">
                            <Bath className="h-3 w-3 text-muted-foreground" />
                            <span>{item.property?.numBathrooms ?? '—'} Baths</span>
                          </div>
                        </div>

                        {editingId === item.id ? (
                          <motion.textarea
                            className="w-full border rounded-lg p-2 text-sm sm:text-base bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            initial={{ opacity: 0.8 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                            rows={3}
                            placeholder="Add your notes..."
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            {item.notes || 'No notes provided.'}
                          </p>
                        )}

                        <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-2 text-[11px] sm:text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(item.createdAt).toLocaleDateString()}
                          </div>
                          <span className="hidden sm:inline">|</span>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {new Date(item.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </CardContent>

                      <div className="px-4 pb-4">
                        <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
                          {editingId === item.id ? (
                            <Button size="sm" className="w-full sm:w-auto" onClick={() => saveEdit(item.id)}>
                              Save
                            </Button>
                          ) : (
                            <Button
                              variant="secondary"
                              size="sm"
                              className="w-full sm:w-auto"
                              onClick={() => navigate(`/properties/${item.propertyId}`)}
                            >
                              View details
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Pagination */}
          {!loading && !error && items.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-2 sm:gap-4 mt-6 sm:mt-8">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="w-full sm:w-auto"
              >
                Prev
              </Button>

              <span className="text-center text-sm sm:text-base text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="w-full sm:w-auto"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

    </ThemeProvider>
  );
};

export default WishlistPage;
