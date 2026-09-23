"use server";

import { getAllPlaces, getDynamicPlaceBySlug, savePlace, deletePlace, type PlaceRecord } from "@/lib/server-store";
import { getPlacesFromCloudAsync, savePlacesToCloudAsync } from "@/lib/cloud-store";
import type { Place } from "@/data/places";
import { revalidatePath } from "next/cache";

export async function fetchAllPlacesAction(): Promise<Place[]> {
  try {
    const cloudRecords = await getPlacesFromCloudAsync();
    const active = cloudRecords.filter((p) => !p.isDeleted);
    if (active.length > 0) {
      return active.map((r) => ({
        name: r.name,
        slug: r.slug,
        category: r.category as any,
        businessName: r.businessName,
        businessId: r.businessId,
        summary: r.summary,
        description: r.description,
        address: r.address,
        mapEmbedUrl: r.mapEmbedUrl,
        priceLabel: r.priceLabel,
        voucherOffer: r.voucherOffer,
        commissionRate: r.commissionRate || 10,
        rating: r.rating || 4.8,
        reviewCount: r.reviewCount || 1,
        openingHours: r.openingHours,
        phone: r.phone,
        zaloUrl: r.zaloUrl,
        image: r.image || r.coverImage || "",
        gallery: (r.gallery || []).map((g) => (typeof g === "string" ? g : (g as any).url)),
        services: r.services || [],
        highlights: r.highlights || [],
        activities: r.activities || [],
        suitableFor: r.suitableFor || [],
        safetyNotes: r.safetyNotes || [],
        status: (r.status === "temporarily_closed" ? "temporarily_closed" : "active") as any
      }));
    }
  } catch (err) {
    console.error("[ADMIN_ACTIONS] Error loading places from cloud:", err);
  }
  return getAllPlaces();
}

export async function fetchPlaceBySlugAction(slug: string) {
  try {
    const all = await fetchAllPlacesAction();
    return all.find((p) => p.slug === slug);
  } catch {
    return getDynamicPlaceBySlug(slug);
  }
}

export async function savePlaceAction(placeData: Place) {
  try {
    // 1. Lưu local/in-memory
    const saved = savePlace(placeData);

    // 2. Lưu đồng bộ lên Supabase Cloud (places_store)
    try {
      const currentCloud = await getPlacesFromCloudAsync();
      const existingIdx = currentCloud.findIndex((p) => p.slug === placeData.slug || p.id === (placeData as any).id);

      const now = new Date().toISOString();
      const recordToSave: PlaceRecord = {
        id: (placeData as any).id || placeData.slug,
        slug: placeData.slug,
        name: placeData.name,
        category: placeData.category,
        summary: placeData.summary,
        description: placeData.description,
        status: (placeData.status === "hidden" ? "hidden" : placeData.status === "temporarily_closed" ? "temporarily_closed" : "active") as any,
        image: placeData.image,
        coverImage: placeData.image,
        imageAlt: placeData.name,
        gallery: placeData.gallery || [placeData.image],
        priceLabel: placeData.priceLabel,
        priceUnit: "người",
        voucherOffer: placeData.voucherOffer,
        voucherTerms: "Áp dụng khi đặt chỗ hoặc nhận mã trước qua Chạm A Lưới",
        openingHours: placeData.openingHours,
        duration: "2 - 4 tiếng",
        maxGuests: "50 - 100 khách",
        businessName: placeData.businessName,
        businessId: placeData.businessId || ("biz-" + placeData.slug),
        phone: placeData.phone,
        zaloUrl: placeData.zaloUrl,
        email: "",
        website: "",
        businessAddress: placeData.address,
        address: placeData.address,
        lat: 16.234,
        lng: 107.256,
        mapEmbedUrl: placeData.mapEmbedUrl,
        directions: "Di chuyển từ trung tâm A Lưới theo bảng chỉ dẫn giao thông.",
        commissionRate: placeData.commissionRate || 10,
        commissionType: "booking",
        auditStatus: "active",
        highlights: placeData.highlights || [],
        activities: placeData.activities || [],
        services: placeData.services || [],
        safetyNotes: placeData.safetyNotes || [],
        suitableFor: placeData.suitableFor || [],
        faq: (saved as any).faq || [],
        seoTitle: placeData.name + " | Du lịch cộng đồng A Lưới",
        seoDescription: placeData.summary,
        seoKeywords: placeData.name + ", du lịch a lưới, du lịch huế, trải nghiệm a lưới",
        ogImage: placeData.image,
        rating: placeData.rating || 4.8,
        reviewCount: placeData.reviewCount || 1,
        createdAt: (existingIdx >= 0 ? currentCloud[existingIdx].createdAt : undefined) || now,
        updatedAt: now
      };

      let updatedList: PlaceRecord[];
      if (existingIdx >= 0) {
        updatedList = [...currentCloud];
        updatedList[existingIdx] = { ...updatedList[existingIdx], ...recordToSave };
      } else {
        updatedList = [recordToSave, ...currentCloud];
      }

      await savePlacesToCloudAsync(updatedList);
    } catch (cloudErr) {
      console.error("[ADMIN_ACTIONS] Error syncing place to cloud:", cloudErr);
    }

    revalidatePath("/admin/places");
    revalidatePath("/places");
    revalidatePath(`/places/${placeData.slug}`);
    revalidatePath("/itinerary");
    return { success: true, place: saved };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Lỗi khi lưu địa điểm";
    return { success: false, error: message };
  }
}

export async function deletePlaceAction(slug: string) {
  try {
    const ok = deletePlace(slug);

    // Đồng bộ trạng thái xóa lên Supabase Cloud
    try {
      const currentCloud = await getPlacesFromCloudAsync();
      const updatedList = currentCloud.map((p) => {
        if (p.slug === slug || p.id === slug) {
          return { ...p, isDeleted: true, deletedAt: new Date().toISOString() };
        }
        return p;
      });
      await savePlacesToCloudAsync(updatedList);
    } catch (cloudErr) {
      console.error("[ADMIN_ACTIONS] Error deleting place from cloud:", cloudErr);
    }

    revalidatePath("/admin/places");
    revalidatePath("/places");
    revalidatePath("/itinerary");
    return { success: ok };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Lỗi khi xóa địa điểm";
    return { success: false, error: message };
  }
}
