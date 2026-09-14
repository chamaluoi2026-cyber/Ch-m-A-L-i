import { selfGuidedExperiences, tourEnhancements, travelCompanies } from "@/data/booking";
import { blogPosts, homestays, packages, products } from "@/data/site";

export type SelfGuidedBookingQuery = {
  checkin?: string;
  checkout?: string;
  guests?: string;
  experiences?: string;
};

export function getPackageById(packageId: string) {
  return packages.find((item) => item.id === packageId);
}

export function getPackageStaticParams() {
  return packages.map((item) => ({ packageId: item.id }));
}

export function getTourEnhancement(packageId: string) {
  return tourEnhancements[packageId as keyof typeof tourEnhancements];
}

export function getTravelCompaniesForPackage(packageId: string) {
  return travelCompanies.filter((company) => company.tours.includes(packageId));
}

export function getTravelCompanyForPackage(packageId: string, providerId: string) {
  return travelCompanies.find((company) => company.id === providerId && company.tours.includes(packageId));
}

export function getTravelCompanyById(providerId: string) {
  return travelCompanies.find((company) => company.id === providerId);
}

export function getHomestayById(homestayId: string) {
  return homestays.find((item) => item.id === homestayId);
}

export function getSelectedSelfGuidedExperiences(experienceIds: string[]) {
  return selfGuidedExperiences.filter((item) => experienceIds.includes(item.id));
}

export function parseGuests(value?: string, fallback = 2) {
  return Math.max(1, Number(value ?? fallback) || fallback);
}

export function parseExperienceIds(value?: string) {
  return (value ?? "").split(",").filter(Boolean);
}

export function getNightCount(checkin?: string, checkout?: string) {
  if (!checkin || !checkout) return 1;
  const start = new Date(`${checkin}T00:00:00`);
  const end = new Date(`${checkout}T00:00:00`);
  const diff = end.getTime() - start.getTime();
  if (!Number.isFinite(diff) || diff <= 0) return 1;
  return Math.max(1, Math.ceil(diff / 86400000));
}

export function getSelfGuidedEstimate(query: SelfGuidedBookingQuery, homestayPrice: number) {
  const guests = parseGuests(query.guests);
  const nights = getNightCount(query.checkin, query.checkout);
  const selectedIds = parseExperienceIds(query.experiences);
  const selectedExperiences = getSelectedSelfGuidedExperiences(selectedIds);
  const homestayTotal = homestayPrice * nights;
  const experiencesTotal = selectedExperiences.reduce((sum, item) => sum + item.price * guests, 0);

  return {
    guests,
    nights,
    selectedIds,
    selectedExperiences,
    homestayTotal,
    experiencesTotal,
    estimatedPrice: homestayTotal + experiencesTotal
  };
}

export function getProductBySlug(slug: string) {
  return products.find((item) => item.slug === slug);
}

export function getProductStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export function getBlogPostBySlug(slug: string) {
  return blogPosts.find((item) => item.slug === slug);
}

export function getBlogPostStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}
