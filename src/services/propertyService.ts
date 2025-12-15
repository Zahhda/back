// services/propertyService.ts

// API URL should be updated to match your backend endpoint

const API_URL = import.meta.env.VITE_API_URL || "https://dorpay.in/api";

export interface Property {
  id?: number;
  propertyId?: string;
  title: string;
  propertyType: string;
  house_type: string;
  status: string;
  availabilityStatus: string;
  price: number;
  area_size: number;
  totalArea: number;
  furnish_type: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  pincode: number;
  landmark: string;
  area: string;
  bedrooms: number;
  numRooms: number;
  bathrooms: number;
  listing_tags: string[];
  cover_image: string;
  images: string[];
  ownerId?: number;
  createdAt?: string;
  updatedAt?: string;
  viewCount: number;
  numBathrooms: number;
  leaseTerm: string;
}

export interface PropertyResponse {
  properties: Property[];
  totalCount: number;
  totalPages: number;
}

export interface PropertyQueryParams {
  page?: number;          // Pass ONLY if you want server-side pagination
  limit?: number;         // Pass ONLY if you want server-side pagination
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  numRooms?: number;
  numBathrooms?: number;
  propertyType?: string;
  furnishType?: string;
  area?: string;
  isAdmin?: boolean;      
}

export const formatPropertyId = (id: number | string): string => {
  if (typeof id === "string" && id.includes("-")) {
    const numericId = parseInt(id.split("-")[0], 16);
    const normalizedId = (numericId % 9999) + 1;
    return `PRPID-${normalizedId.toString().padStart(4, "0")}`;
  }
  const numId = typeof id === "string" ? parseInt(id) : id;
  return `PRPID-${numId.toString().padStart(4, "0")}`;
};
// services/propertyService.ts (add below existing exports)

// services/propertyService.ts

export const getAllProperties = async (
  batchSize = 50,
  filters: Omit<PropertyQueryParams, "page" | "limit"> = {}
): Promise<PropertyResponse> => {
  let page = 1;
  const all: Property[] = [];
  const seen = new Set<string | number>();

  // debug
  console.log("📦 getAllProperties start", { batchSize, filters });

  while (true) {
    const res = await getProperties({ ...filters, page, limit: batchSize });
    const items = res.properties ?? [];

    // debug per page
    console.log(`🔹 page=${page} received=${items.length} totalPages=${res.totalPages ?? "?"}`);

    if (items.length === 0) {
      console.log("⛳️ stop: empty page");
      break;
    }

    let appended = 0;
    for (const it of items) {
      const key = (it as any).id ?? (it as any).propertyId ?? JSON.stringify(it);
      if (!seen.has(key)) {
        seen.add(key);
        all.push(it);
        appended++;
      }
    }

    // debug dedupe info
    if (appended !== items.length) {
      console.log(`⚠️ deduped: appended=${appended}, incoming=${items.length}`);
    }

    // stop if server truthfully reports we've reached last page
    if (res.totalPages && page >= res.totalPages) {
      console.log("⛳️ stop: reached totalPages");
      break;
    }

    // if API doesn’t give totalPages, typical “short page” last-page heuristic
    if (!res.totalPages && items.length < batchSize) {
      console.log("⛳️ stop: short page");
      break;
    }

    // safeguard: API keeps returning the same page (ignores page param)
    if (appended === 0) {
      console.log("⛳️ stop: no new ids on this page; API may be ignoring 'page'");
      break;
    }

    // hard safety to avoid infinite loop
    if (page >= 1000) {
      console.warn("⛔️ safety stop: too many pages (>=1000)");
      break;
    }

    page += 1;
  }

  console.log("✅ getAllProperties done", { total: all.length });
  return {
    properties: all,
    totalCount: all.length,
    totalPages: 1, // client paginates
  };
};


export const getProperties = async (
  params: PropertyQueryParams = {}
): Promise<PropertyResponse> => {
  try {
    const queryParams = new URLSearchParams();

    // Append page/limit ONLY if you actually want pagination from the server.
    if (params.page != null) queryParams.append("page", String(params.page));
    if (params.limit != null) queryParams.append("limit", String(params.limit));

    if (params.search) queryParams.append("search", params.search);
    if (params.minPrice != null) queryParams.append("minPrice", String(params.minPrice));
    if (params.maxPrice != null) queryParams.append("maxPrice", String(params.maxPrice));
    if (params.bedrooms != null) queryParams.append("bedrooms", String(params.bedrooms));
    if (params.numRooms != null) queryParams.append("numRooms", String(params.numRooms));
    if (params.numBathrooms != null) queryParams.append("numBathrooms", String(params.numBathrooms));
    if (params.propertyType) queryParams.append("propertyType", params.propertyType);
    if (params.furnishType) queryParams.append("furnishType", params.furnishType);
    if (params.area) queryParams.append("area", params.area);

    const token = localStorage.getItem("token");
    const baseUrl = params.isAdmin
      ? `${API_URL}/properties/admin/all`
      : `${API_URL}/properties`;

    const url = queryParams.toString() ? `${baseUrl}?${queryParams}` : baseUrl;

    const headers: HeadersInit = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(url, { headers });

    if (!response.ok) {
      let message = `Failed to fetch properties (${response.status})`;
      try {
        const err = await response.json();
        message = err?.message || message;
      } catch {
        // ignore JSON parse error for non-JSON error bodies
      }
      throw new Error(message);
    }

    const data = await response.json();

    // Normalize: support either array payload or { properties, totalCount, totalPages }
    const items: Property[] = Array.isArray(data)
      ? data
      : (data.properties ?? []);

    const totalCount: number =
      (typeof data?.totalCount === "number" ? data.totalCount : undefined) ??
      items.length;

    // If limit isn't specified by caller, treat as "fetch-all" => single page.
    const limit = (params.limit ?? totalCount) || 1;
    const computedPages = Math.max(1, Math.ceil(totalCount / limit));

    const totalPages: number =
      (typeof data?.totalPages === "number" ? data.totalPages : undefined) ??
      computedPages;

    return {
      properties: items,
      totalCount,
      totalPages,
    };
  } catch (error) {
    console.error("Error fetching properties:", error);
    throw error;
  }
  
};
