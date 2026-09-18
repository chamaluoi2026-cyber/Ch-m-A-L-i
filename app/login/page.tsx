import { AdminLoginView } from "@/components/auth/admin-login-view";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const query = await searchParams;
  const next = query.next?.startsWith("/") ? query.next : "/admin";

  return (
    <main className="min-h-screen bg-[#F4F6F5] grid place-items-center py-12 px-4">
      <div className="w-full max-w-xl">
        <AdminLoginView nextUrl={next} />
      </div>
    </main>
  );
}
