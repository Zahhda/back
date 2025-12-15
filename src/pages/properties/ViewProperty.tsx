// src/pages/properties/ViewProperty.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, MapPin } from 'lucide-react';
import { IndianRupee, Bed, Bath, Building } from 'lucide-react';
import { FaCouch } from 'react-icons/fa';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


const API_URL = import.meta.env.VITE_API_URL || 'https://dorpay.in/api';
const DEBUG = true; // set to false after you confirm it’s working

const Probe: React.FC<{ api: string; id: string }> = ({ api, id }) => {
  const [out, setOut] = useState<any>(null);
  useEffect(() => {
    (async () => {
      const sid = id.trim();
      const sidNoHyphens = sid.replace(/-/g, '');
      const tries = [
        { label: `GET ${api}/properties/:id`, url: `${api}/properties/${encodeURIComponent(sid)}` },
        { label: `GET ${api}/properties/:id(no-hyphens)`, url: `${api}/properties/${encodeURIComponent(sidNoHyphens)}` },
        { label: `GET ${api}/property/:id`, url: `${api}/property/${encodeURIComponent(sid)}` },
        { label: `GET ${api}/properties?id`, url: `${api}/properties?id=${encodeURIComponent(sid)}` },
        { label: `GET ${api}/properties?_id`, url: `${api}/properties?_id=${encodeURIComponent(sid)}` },
        { label: `GET ${api}/properties?uuid`, url: `${api}/properties?uuid=${encodeURIComponent(sid)}` },
        { label: `GET ${api}/properties?propertyId`, url: `${api}/properties?propertyId=${encodeURIComponent(sid)}` },
        { label: `GET ${api}/properties?limit=50`, url: `${api}/properties?limit=50` },
      ];
      const results: any[] = [];
      for (const t of tries) {
        try {
          const r = await fetch(t.url, { credentials: 'include' });
          const text = await r.text();
          results.push({ label: t.label, status: r.status, body: text.slice(0, 400) });
        } catch (e: any) {
          results.push({ label: t.label, status: 'ERR', body: String(e?.message ?? e) });
        }
      }
      setOut(results);
    })();
  }, [api, id]);

  if (!out) return null;
  return (
    <div className="m-6 p-3 text-xs rounded-lg border bg-amber-50 text-amber-900">
      <div className="font-semibold mb-2">DEV Probe (not visible in prod)</div>
      <ul className="space-y-1">
        {out.map((r: any, i: number) => (
          <li key={i}><span className="font-mono">{r.status}</span> — {r.label}</li>
        ))}
      </ul>
      <div className="mt-2 opacity-70">Bodies trimmed to 400 chars; check console for full payloads if needed.</div>
    </div>
  );
};

// ---------- Helpers: robust date handling + discovery ----------
const firstDefined = <T,>(...vals: (T | undefined | null)[]) =>
  vals.find(v => v !== undefined && v !== null);

/** Best-effort parse for many backend date formats */
const normalizeDate = (val: unknown): string | undefined => {
  if (val == null) return undefined;

  if (val instanceof Date && !Number.isNaN(val.getTime())) {
    return val.toISOString();
  }

  if (typeof val === 'number' && Number.isFinite(val)) {
    // Heuristic: seconds vs ms
    const ms = val < 1e12 ? val * 1000 : val;
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
  }

  if (typeof val === 'string') {
    const s = val.trim();
    if (!s) return undefined;

    // Convert "YYYY-MM-DD HH:mm:ss" -> "YYYY-MM-DDTHH:mm:ss"
    const isoish = /^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/.test(s) ? s.replace(' ', 'T') : s;

    // Handle "YYYY/MM/DD" -> "YYYY-MM-DD" for safer parsing
    const normalizedSlashes = isoish.replace(/\//g, '-');

    let t = Date.parse(normalizedSlashes);
    // Some backends add a timezone like "+05:30" without 'T'—try inserting 'T'
    if (Number.isNaN(t) && /^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}.*$/.test(s)) {
      t = Date.parse(s.replace(' ', 'T'));
    }

    if (!Number.isNaN(t)) return new Date(t).toISOString();

    // If it's just "YYYY-MM-DD", trust the formatter later
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  }

  return undefined;
};

/** Format or return NA */
const formatDateSafe = (value?: string) => {
  if (!value) return 'NA';
  const t = Date.parse(value);
  if (Number.isNaN(t)) return 'NA';
  return new Date(t).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/** Try harder: scan the object for any key that smells like a move/available date. */
const discoverDateFromObject = (obj: any): { key?: string; raw?: unknown } => {
  if (!obj || typeof obj !== 'object') return {};
  const candidates: Array<{ key: string; val: unknown; score: number }> = [];

  // Shallow scan keys
  Object.keys(obj).forEach(k => {
    const v = obj[k];
    // Only consider primitive-ish
    const isCandidateType =
      typeof v === 'string' || typeof v === 'number' || v instanceof Date;
    if (!isCandidateType) return;

    const lck = k.toLowerCase();
    // Score by name
    let score = 0;
    if (lck.includes('move') && lck.includes('date')) score += 5;
    if (lck.includes('available') && lck.includes('date')) score += 5;
    if (lck.includes('availablefrom') || lck.includes('available_from')) score += 5;
    if (lck.includes('movein') || lck.includes('move_in')) score += 5;
    if (lck.endsWith('date')) score += 2;

    // Score by value pattern (strings only)
    if (typeof v === 'string') {
      if (/^\d{4}-\d{2}-\d{2}/.test(v)) score += 3; // 2025-09-22...
      if (/^\d{4}\/\d{2}\/\d{2}/.test(v)) score += 2; // 2025/09/22...
      if (/\d{2}:\d{2}/.test(v)) score += 1; // has time
    }

    // Numbers (epoch)
    if (typeof v === 'number') score += 1;

    if (score > 0) candidates.push({ key: k, val: v, score });
  });

  // Highest score first
  candidates.sort((a, b) => b.score - a.score);
  if (candidates.length > 0) {
    const top = candidates[0];
    return { key: top.key, raw: top.val };
  }
  return {};
};
// ---------------------------------------------------------------

interface Property {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  price: number;
  numRooms: number;
  numBathrooms: number;
  images: string[];
  propertyType: string;
  furnishedStatus: string;
  moveInDate: string; // normalized here
  amenities: string[];
  owner: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
}

const amenitiesList = [
  { id: 'parking', label: 'Parking', icon: '🚗' },
  { id: 'gym', label: 'Gym', icon: '🏋️‍♂️' },
  { id: 'pool', label: 'Swimming Pool', icon: '🏊' },
  { id: 'security', label: 'Security', icon: '🛡️' },
  { id: 'ac', label: 'Air Conditioning', icon: '❄️' },
  { id: 'wifi', label: 'WiFi', icon: '📶' },
  { id: 'laundry', label: 'Laundry', icon: '🧺' },
  { id: 'elevator', label: 'Elevator', icon: '🛗' },
  { id: 'balcony', label: 'Balcony', icon: '🌇' },
  { id: 'garden', label: 'Garden', icon: '🌿' },
  { id: 'playground', label: 'Playground', icon: '🎠' },
  { id: 'clubhouse', label: 'Club House', icon: '🏠' },
];

export default function ViewProperty() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [rawProperty, setRawProperty] = useState<any | null>(null); // for debug display
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [showSchedulePopup, setShowSchedulePopup] = useState(false);
  const [visitDateTime, setVisitDateTime] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    const sid = String(id).trim();
    const sidNoHyphens = sid.replace(/-/g, '');

    const pickMatch = (arr: any[]): any | null => {
      if (!Array.isArray(arr)) return null;
      const toId = (x: any) => String(x?.id ?? x?._id ?? x?.uuid ?? x?.propertyId ?? '').toLowerCase();
      const want = sid.toLowerCase();
      const want2 = sidNoHyphens.toLowerCase();
      return arr.find(p => {
        const pid = toId(p);
        return pid === want || pid === want2;
      }) ?? null;
    };

    const coerceOne = (data: any): any | null => {
      if (!data) return null;
      if (data.property && typeof data.property === 'object') return data.property;
      if (data.data && typeof data.data === 'object' && !Array.isArray(data.data)) return data.data;
      if (Array.isArray(data.properties)) return pickMatch(data.properties);
      if (Array.isArray(data.data)) return pickMatch(data.data);
      if (Array.isArray(data)) return pickMatch(data);
      if (typeof data === 'object' && (data.id || data._id || data.uuid || data.propertyId)) return data;
      return null;
    };

    const normalizeToProperty = (raw: any): Property => {
      const imagesRaw = Array.isArray(raw.images) ? raw.images : [];
      const cover = raw.cover_image ? [raw.cover_image] : [];
      const images = [...cover, ...imagesRaw].filter(Boolean);

      let amenities: string[] = Array.isArray(raw.amenities) ? raw.amenities : [];
      if (!Array.isArray(raw.amenities) && typeof raw.amenities === 'string') {
        amenities = raw.amenities.split(',').map((s: string) => s.trim()).filter(Boolean);
      }

      const moveInRaw = firstDefined(
        raw.moveInDate, raw.availableFrom, raw.available_from, raw.move_in_date
      );
      const chosen = moveInRaw !== undefined ? moveInRaw : discoverDateFromObject(raw).raw;
      const normalizedMoveIn = normalizeDate(chosen);

      return {
        id: String(raw.id ?? raw._id ?? raw.uuid ?? raw.propertyId ?? id),
        title: String(raw.title ?? ''),
        description: String(raw.description ?? ''),
        address: String(raw.address ?? ''),
        city: String(raw.city ?? ''),
        state: String(raw.state ?? ''),
        price: Number(raw.price ?? 0),
        numRooms: Number(raw.numRooms ?? raw.bedrooms ?? 0),
        numBathrooms: Number(raw.numBathrooms ?? raw.bathrooms ?? 0),
        images,
        propertyType: String(raw.propertyType ?? raw.type ?? ''),
        furnishedStatus: String(raw.furnishedStatus ?? raw.furnishing ?? 'NA'),
        moveInDate: normalizedMoveIn || '',
        amenities,
        owner: {
          firstName: raw.owner?.firstName ?? raw.contactName ?? '',
          lastName: raw.owner?.lastName ?? '',
          email: raw.owner?.email ?? raw.contactEmail ?? '',
          phone: raw.owner?.phone ?? raw.contactPhone,
        },
      };
    };

    const tryGet = async (path: string, params?: Record<string, any>) => {
      const res = await axios.get(`${API_URL}${path}`, { params });
      return coerceOne(res.data);
    };

    (async () => {
      try {
        let raw: any | null = null;

        // 1) Preferred routes
        const pathTries = [
          `/properties/${encodeURIComponent(sid)}`,
          `/properties/${encodeURIComponent(sidNoHyphens)}`, // hyphen-less UUID variant
          `/property/${encodeURIComponent(sid)}`,            // some backends use singular
        ];
        for (const p of pathTries) {
          try {
            raw = await tryGet(p);
            if (raw) break;
          } catch (e: any) {
            if (DEBUG) console.warn('[ViewProperty] GET', p, '->', e?.response?.status, e?.response?.data);
          }
        }

        // 2) Query param variants
        const qpTries: Record<string, string>[] = [
          { id: sid }, { id: sidNoHyphens },
          { _id: sid }, { _id: sidNoHyphens },
          { uuid: sid }, { uuid: sidNoHyphens },
          { propertyId: sid }, { propertyId: sidNoHyphens },
        ];
        for (const qp of qpTries) {
          if (raw) break;
          try {
            raw = await tryGet('/properties', qp);
            if (!raw) {
              const r2 = await axios.get(`${API_URL}/properties`, { params: qp });
              raw = pickMatch(r2.data?.properties ?? r2.data?.data ?? r2.data);
            }
          } catch (e: any) {
            if (DEBUG) console.warn('[ViewProperty] /properties', qp, '->', e?.response?.status);
          }
        }

        // 3) Last resort: small list fetch (adjust limit param if your API supports it)
        if (!raw) {
          try {
            const res = await axios.get(`${API_URL}/properties`, { params: { limit: 100 } });
            raw = pickMatch(res.data?.properties ?? res.data?.data ?? res.data);
            if (DEBUG) console.info('[ViewProperty] list-scan found:', !!raw);
          } catch (e: any) {
            if (DEBUG) console.warn('[ViewProperty] fallback list scan failed', e?.response?.status);
          }
        }

        if (!raw) {
          setProperty(null);
          setRawProperty(null);
          setError('No property found for this ID (after all fallbacks).');
          return;
        }

        const normalized = normalizeToProperty(raw);
        setRawProperty(raw);
        setProperty(normalized);
        setError(undefined);
      } catch (err: any) {
        const status = err.response?.status;
        const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Unknown error';
        setError(`Error ${status ?? ''}: ${msg}`);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);



  // Derived debug info for UI
  const debugMoveIn = useMemo(() => {
    if (!rawProperty) return null;
    const known = firstDefined(
      rawProperty.moveInDate,
      rawProperty.availableFrom,
      rawProperty.available_from,
      rawProperty.move_in_date
    );
    if (known !== undefined) {
      return { source: 'known-key', raw: known, normalized: normalizeDate(known) };
    }
    const discovered = discoverDateFromObject(rawProperty);
    if (discovered.key) {
      return { source: `discovered:${discovered.key}`, raw: discovered.raw, normalized: normalizeDate(discovered.raw) };
    }
    return { source: 'none', raw: undefined, normalized: undefined };
  }, [rawProperty]);

  if (loading) return <div className="p-6 text-center">Loading…</div>;
  if (error) {
    return (
      <>
        <Alert variant="destructive" className="m-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        {DEBUG && id ? <Probe api={API_URL} id={id} /> : null}
      </>
    );
  }

  if (!property) return <div className="p-6 text-center">No property found.</div>;

  const moveInDisplay = formatDateSafe(property.moveInDate);
  const couldNotParse = moveInDisplay === 'NA';

  return (
    <>
      <motion.div
        className="mx-auto space-y-6 w-full min-h-screen p-6 md:p-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{property.title}</h1>
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>←</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-white rounded-xl shadow-md">
          {/* LEFT: Gallery */}
          <div>
            {property.images.length > 0 ? (
              <>
                <div className="overflow-hidden rounded-lg border border-gray-300">
                  <motion.img
                    src={selectedImage || property.images[0]}
                    alt="Main"
                    className="w-full h-auto max-h-[500px] object-contain"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    loading="eager"
                  />
                </div>
                <div className="flex gap-2 mt-2 overflow-x-auto">
                  {property.images.map((src, idx) => (
                    <motion.img
                      key={idx}
                      src={src}
                      alt={`Thumbnail ${idx + 1}`}
                      onClick={() => setSelectedImage(src)}
                      className={`w-20 h-16 object-cover rounded-lg border-2 ${selectedImage === src ? 'border-blue-600 ring-2 ring-blue-300' : 'border-gray-300'} cursor-pointer hover:scale-105 transition-all`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      loading="lazy"
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="w-full h-80 bg-gray-100 flex items-center justify-center rounded-lg">
                <span className="text-gray-500">No Images Available</span>
              </div>
            )}
          </div>

          {/* RIGHT: Property Info */}
          <div className="grid grid-cols-2 text-sm divide-x divide-y divide-gray-200 bg-gray-50 border rounded-lg">
            <div className="flex items-center gap-2 p-4">
              <IndianRupee className="text-green-600" size={20} />
              <div>
                <div className="text-base font-bold text-gray-800">₹{Number(property.price).toLocaleString('en-IN')}</div>
                <div className="text-gray-500">Price</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-4">
              <Bed className="text-purple-600" size={20} />
              <div>
                <div className="text-base font-bold text-gray-800">{property.numRooms}</div>
                <div className="text-gray-500">Rooms</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-4">
              <Bath className="text-blue-600" size={20} />
              <div>
                <div className="text-base font-bold text-gray-800">{property.numBathrooms}</div>
                <div className="text-gray-500">Baths</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-4">
              <Building className="text-yellow-700" size={20} />
              <div>
                <div className="text-base font-bold capitalize text-gray-800">{property.propertyType}</div>
                <div className="text-gray-500">Property Type</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-4">
              <FaCouch className="text-yellow-500" size={20} />
              <div>
                <div className="text-base font-bold capitalize text-gray-800">{property.furnishedStatus || 'NA'}</div>
                <div className="text-gray-500">Furnishing</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-4">
              <CalendarIcon className="text-purple-600" size={20} />
              <div>
                <div className="text-base font-bold text-gray-800">
                  {moveInDisplay}
                  {couldNotParse && debugMoveIn?.raw ? (
                    <span className="ml-2 text-xs text-gray-500">
                      (raw: {String(debugMoveIn.raw)})
                    </span>
                  ) : null}
                </div>
                <div className="text-gray-500">Move-in Date</div>
              </div>
            </div>

            <div className="col-span-2 mt-6 gap-2 p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Amenities</h3>
              {property.amenities?.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {amenitiesList
                    .filter((a) => property.amenities.includes(a.id))
                    .map((a) => (
                      <div key={a.id} className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-xl text-sm font-medium shadow-sm">
                        <span className="text-lg">{a.icon}</span>
                        <span className="text-sm font-semibold text-blue-800">{a.label}</span>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-500">No amenities listed.</p>
              )}
            </div>

            <div className="col-span-2 flex items-start gap-2 p-4">
              <MapPin className="text-red-700" size={30} />
              <div>
                <div className="text-base font-bold text-gray-800">
                  {property.address}, {property.city}, {property.state}
                </div>
              </div>
            </div>

            <div className="col-span-2 p-4">
              <p className="text-gray-700 leading-relaxed">{property.description}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button onClick={() => setShowContactPopup(true)}>Contact</Button>
          <Button variant="secondary" onClick={() => setShowSchedulePopup(true)}>Schedule Visit</Button>
        </div>

        <div className="text-right">
          <Button variant="outline" onClick={() => navigate(-1)}>← Back to Listings</Button>
        </div>
      </motion.div>

      {/* Contact Popup */}
      {showContactPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Contact Owner</h2>

            <div className="space-y-2">
              <Label htmlFor="contactName" className="text-black">Name</Label>
              <Input
                id="contactName"
                value={`${property.owner.firstName} ${property.owner.lastName}`}
                readOnly
                className="text-white bg-gray-800"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail" className="text-black">Email</Label>
              <Input
                id="contactEmail"
                value={property.owner.email || ''}
                readOnly
                className="text-white bg-gray-800"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone" className="text-black">Phone</Label>
              <Input
                id="contactPhone"
                value={property.owner.phone || 'NA'}
                readOnly
                className="text-white bg-gray-800"
              />
            </div>

            <div className="text-right">
              <Button onClick={() => setShowContactPopup(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Visit Popup */}
      {showSchedulePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Schedule a Visit</h2>
            <input
              type="datetime-local"
              value={visitDateTime}
              onChange={(e) => setVisitDateTime(e.target.value)}
              className="w-full border border-gray-300 rounded p-2"
            />
            <div className="text-right space-x-2">
              <Button onClick={() => setShowSchedulePopup(false)} variant="outline">Cancel</Button>
              <Button
                onClick={() => {
                  if (visitDateTime) {
                    alert(`Visit scheduled for ${new Date(visitDateTime).toLocaleString()}`);
                    setShowSchedulePopup(false);
                    setVisitDateTime('');
                  }
                }}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
