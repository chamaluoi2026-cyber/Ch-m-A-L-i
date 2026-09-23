import { getAllBusinesses } from "@/lib/server-store";
import BusinessesClient from "./businesses-client";

export const dynamic = "force-dynamic";

export default function AdminBusinessesPage() {
  const businesses = getAllBusinesses();

  return <BusinessesClient initialBusinesses={businesses} />;
}
