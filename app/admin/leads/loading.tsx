export default function AdminTableLoading() {
  return (
    <div className="space-y-6 pb-12 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-7 w-52 bg-stone-200 rounded-xl" />
          <div className="h-4 w-72 bg-stone-100 rounded" />
        </div>
        <div className="h-10 w-28 bg-stone-200 rounded-xl" />
      </div>

      <div className="h-14 bg-white rounded-2xl border border-stone-100 p-3 flex gap-3">
        <div className="h-full w-64 bg-stone-100 rounded-xl" />
        <div className="h-full w-36 bg-stone-100 rounded-xl" />
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
        <div className="h-12 bg-stone-100 w-full" />
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-14 border-b border-stone-50 px-6 flex items-center justify-between">
            <div className="h-4 w-32 bg-stone-200 rounded" />
            <div className="h-4 w-24 bg-stone-100 rounded" />
            <div className="h-4 w-20 bg-stone-200 rounded-full" />
            <div className="h-6 w-16 bg-stone-200 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
