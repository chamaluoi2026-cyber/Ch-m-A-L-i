import { placeCategories, places as staticPlaces, type PlaceCategory, type Place } from "@/data/places";
import { getAllPlaces as getStorePlaces, getPlaceBySlug as getStorePlaceBySlug, getActivePlaces as getStoreActivePlaces } from "@/lib/server-store";

export function getAllPlaces(): Place[] {
  try {
    return getStorePlaces();
  } catch {
    return staticPlaces;
  }
}

export function getActivePlaces(): Place[] {
  try {
    return getStoreActivePlaces();
  } catch {
    return staticPlaces.filter((p) => p.status === "active");
  }
}

export function getPlaceBySlug(slug: string): Place | undefined {
  try {
    return getStorePlaceBySlug(slug) || staticPlaces.find((place) => place.slug === slug);
  } catch {
    return staticPlaces.find((place) => place.slug === slug);
  }
}

export function getPlaceStaticParams() {
  return getAllPlaces().map((place) => ({ slug: place.slug }));
}

export function getCategoryById(categoryId: string) {
  return placeCategories.find((category) => category.id === categoryId);
}

export function getPlacesByCategory(categoryId?: string) {
  const currentPlaces = getAllPlaces();
  if (!categoryId || categoryId === "all") return currentPlaces;
  return currentPlaces.filter((place) => place.category === categoryId);
}

export function getFeaturedPlaces(limit = 3) {
  return getAllPlaces().slice(0, limit);
}

export function getRelatedPlaces(currentSlug: string, category: PlaceCategory) {
  return getAllPlaces()
    .filter((place) => place.slug !== currentSlug && (place.category === category || category === "all"))
    .slice(0, 3);
}
