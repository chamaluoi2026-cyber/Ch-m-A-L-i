"use server";

import { getAllPlaces, getPlaceBySlug, savePlace, deletePlace } from "@/lib/server-store";
import type { Place } from "@/data/places";
import { revalidatePath } from "next/cache";

export async function fetchAllPlacesAction() {
  return getAllPlaces();
}

export async function fetchPlaceBySlugAction(slug: string) {
  return getPlaceBySlug(slug);
}

export async function savePlaceAction(placeData: Place) {
  try {
    const saved = savePlace(placeData);
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
    revalidatePath("/admin/places");
    revalidatePath("/places");
    revalidatePath("/itinerary");
    return { success: ok };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Lỗi khi xóa địa điểm";
    return { success: false, error: message };
  }
}
