export default function AdminLoading() {
  return (
    <div className="space-y-6 pb-12 animate-pulse">
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-stone-200 rounded-xl" />
          <div className="h-4 w-64 bg-stone-100 rounded" />
        </div>
        <div className="h-10 w-32 bg-stone-200 rounded-xl" />
      </div>

      {/* 4 Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-4 w-24 bg-stone-200 rounded" />
              <div className="size-8 bg-stone-200 rounded-lg" />
            </div>
            <div className="h-8 w-28 bg-stone-200 rounded-lg" />
            <div className="h-3 w-36 bg-stone-100 rounded" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-2xl border border-stone-100 p-6 space-y-4">
        <div className="h-6 w-40 bg-stone-200 rounded" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 bg-stone-50 rounded-xl w-full" />
        ))}
      </div>
    </div>
  );
}
