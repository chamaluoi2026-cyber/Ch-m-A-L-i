import { placeCategories, places, type PlaceCategory } from "@/data/places";

export function getPlaceBySlug(slug: string) {
  return places.find((place) => place.slug === slug);
}

export function getPlaceStaticParams() {
  return places.map((place) => ({ slug: place.slug }));
}

export function getCategoryById(categoryId: string) {
  return placeCategories.find((category) => category.id === categoryId);
}

export function getPlacesByCategory(categoryId?: string) {
  if (!categoryId || categoryId === "all") return places;
  return places.filter((place) => place.category === categoryId);
}

export function getFeaturedPlaces(limit = 3) {
  return places.slice(0, limit);
}

export function getRelatedPlaces(currentSlug: string, category: PlaceCategory) {
  return places.filter((place) => place.slug !== currentSlug && (place.category === category || category === "all")).slice(0, 3);
}
