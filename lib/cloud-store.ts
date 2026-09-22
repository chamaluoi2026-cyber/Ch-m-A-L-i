import { places as staticPlaces, type Place } from "@/data/places";
import { defaultBlogPosts, type BlogPostRecord, type PlaceRecord } from "@/lib/server-store";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hcunfovtwbzfatudejfs.supabase.co";
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdW5mb3Z0d2J6ZmF0dWRlamZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTM5NTM5OSwiZXhwIjoyMTA0OTcxMzk5fQ.7QwyRHqGXa6UwgbUNAhlWdmGZqpuS8Cxall2v8j7lMU";

let cachedPlaces: PlaceRecord[] | null = null;
let lastPlacesFetch = 0;
let cachedBlogs: BlogPostRecord[] | null = null;
let lastBlogsFetch = 0;
const CACHE_TTL_MS = 2000;

function mapStaticToRecord(p: Place): PlaceRecord {
  return {
    id: p.slug,
    slug: p.slug,
    name: p.name,
    category: p.category,
    summary: p.summary,
    description: p.description,
    status: (p.status === "temporarily_closed" ? "temporarily_closed" : "active") as "active" | "temporarily_closed" | "hidden",
    image: p.image,
    coverImage: p.image,
    imageAlt: p.name,
    gallery: p.gallery || [],
    priceLabel: p.priceLabel,
    priceUnit: "người",
    voucherOffer: p.voucherOffer,
    voucherTerms: "Áp dụng khi đặt chỗ hoặc nhận mã trước qua Chạm A Lưới",
    openingHours: p.openingHours,
    duration: "2 - 4 tiếng",
    maxGuests: "50 - 100 khách",
    businessName: p.businessName,
    businessId: p.businessId || ("biz-" + p.slug),
    phone: p.phone,
    zaloUrl: p.zaloUrl,
    email: "",
    website: "",
    businessAddress: p.address,
    address: p.address,
    lat: 16.234,
    lng: 107.256,
    mapEmbedUrl: p.mapEmbedUrl,
    directions: "Di chuyển từ trung tâm A Lưới theo bảng chỉ dẫn giao thông.",
    commissionRate: p.commissionRate || 10,
    commissionType: "booking",
    auditStatus: "active",
    highlights: p.highlights || [],
    activities: p.activities || [],
    services: p.services || [],
    safetyNotes: p.safetyNotes || [],
    suitableFor: p.suitableFor || [],
    faq: [
      {
        question: "Đến " + p.name + " cần chuẩn bị những gì?",
        answer: "Nên mang theo trang phục gọn nhẹ, đồ bơi/thay nếu tắm suối, thuốc chống côn trùng và giày thể thao chống trượt."
      },
      {
        question: "Có cần đặt chỗ trước không?",
        answer: "Vào các dịp cuối tuần hoặc lễ hội, bạn nên nhận voucher và liên hệ đặt chỗ trước ít nhất 24 giờ để được phục vụ tốt nhất."
      }
    ],
    seoTitle: p.name + " | Du lịch cộng đồng A Lưới",
    seoDescription: p.summary,
    seoKeywords: p.name + ", du lịch a lưới, du lịch huế, trải nghiệm a lưới",
    ogImage: p.image,
    rating: p.rating || 4.8,
    reviewCount: p.reviewCount || 120,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: new Date().toISOString()
  };
}

export async function getPlacesFromCloudAsync(): Promise<PlaceRecord[]> {
  const now = Date.now();
  if (cachedPlaces && now - lastPlacesFetch < CACHE_TTL_MS) {
    return cachedPlaces;
  }

  try {
    // 1. Lấy dữ liệu từ places_store (danh sách chuẩn)
    let placesList: PlaceRecord[] = [];
    const res = await fetch(`${SUPABASE_URL}/rest/v1/system_store?id=eq.places_store&select=data`, {
      method: "GET",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      cache: "no-store"
    });
    if (res.ok) {
      const rows = await res.json();
      if (Array.isArray(rows) && rows[0]?.data && Array.isArray(rows[0].data)) {
        placesList = rows[0].data as PlaceRecord[];
      }
    }

    // 2. Kiểm tra thêm system_store id=eq.main (nơi saveStore ghi vào)
    try {
      const mainRes = await fetch(`${SUPABASE_URL}/rest/v1/system_store?id=eq.main&select=data`, {
        method: "GET",
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
        cache: "no-store"
      });
      if (mainRes.ok) {
        const mainRows = await mainRes.json();
        const mainPlaces = mainRows[0]?.data?.places as PlaceRecord[] | undefined;
        if (Array.isArray(mainPlaces) && mainPlaces.length > 0) {
          let hasChange = false;
          for (const mp of mainPlaces) {
            const idx = placesList.findIndex(p => p.slug === mp.slug || p.id === mp.id);
            if (idx >= 0) {
              const current = placesList[idx];
              const mainTime = new Date(mp.updatedAt || 0).getTime();
              const storeTime = new Date(current.updatedAt || 0).getTime();
              if (mainTime >= storeTime || !current.gallery?.length) {
                placesList[idx] = { ...current, ...mp };
                hasChange = true;
              }
            } else {
              placesList.unshift(mp);
              hasChange = true;
            }
          }
          if (hasChange) {
            savePlacesToCloudAsync(placesList).catch(() => {});
          }
        }
      }
    } catch {}

    if (placesList.length > 0) {
      cachedPlaces = placesList;
      lastPlacesFetch = now;
      return placesList;
    }
  } catch (err) {
    console.error("[CLOUD_STORE] Error fetching places from cloud:", err);
  }

  const initial = staticPlaces.map(mapStaticToRecord);
  cachedPlaces = initial;
  lastPlacesFetch = now;
  savePlacesToCloudAsync(initial).catch(() => {});
  return initial;
}

export async function savePlacesToCloudAsync(places: PlaceRecord[]): Promise<boolean> {
  cachedPlaces = places;
  lastPlacesFetch = Date.now();

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/system_store`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates"
      },
      body: JSON.stringify({
        id: "places_store",
        data: places,
        updated_at: new Date().toISOString()
      })
    });
    return res.ok;
  } catch (err) {
    console.error("[CLOUD_STORE] Error saving places to cloud:", err);
    return false;
  }
}

export async function getBlogsFromCloudAsync(): Promise<BlogPostRecord[]> {
  const now = Date.now();
  if (cachedBlogs && now - lastBlogsFetch < CACHE_TTL_MS) {
    return cachedBlogs;
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/system_store?id=eq.blogs_store&select=data`, {
      method: "GET",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      },
      cache: "no-store"
    });

    if (res.ok) {
      const rows = await res.json();
      if (Array.isArray(rows) && rows[0]?.data && Array.isArray(rows[0].data) && rows[0].data.length > 0) {
        cachedBlogs = rows[0].data as BlogPostRecord[];
        lastBlogsFetch = now;
        return cachedBlogs;
      }
    }
  } catch (err) {
    console.error("[CLOUD_STORE] Error fetching blogs from cloud:", err);
  }

  cachedBlogs = defaultBlogPosts;
  lastBlogsFetch = now;
  saveBlogsToCloudAsync(defaultBlogPosts).catch(() => {});
  return defaultBlogPosts;
}

export async function saveBlogsToCloudAsync(blogs: BlogPostRecord[]): Promise<boolean> {
  cachedBlogs = blogs;
  lastBlogsFetch = Date.now();

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/system_store`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates"
      },
      body: JSON.stringify({
        id: "blogs_store",
        data: blogs,
        updated_at: new Date().toISOString()
      })
    });
    return res.ok;
  } catch (err) {
    console.error("[CLOUD_STORE] Error saving blogs to cloud:", err);
    return false;
  }
}
