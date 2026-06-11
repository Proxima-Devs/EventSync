export default function EventSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-[#1e2530] bg-[#0b0f18] shadow-lg shadow-black/30 animate-pulse">
      {/* Image */}
      <div className="relative h-44 w-full bg-surface-secondary">
        <div className="absolute top-3 left-3 w-12 h-12 rounded-xl bg-surface-skeleton" />
        <div className="absolute top-3 right-3 w-16 h-6 rounded-full bg-surface-skeleton" />
        <div className="absolute inset-0 bg-surface-skeleton" />
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="h-5 bg-surface-skeleton rounded-full w-3/4" />

        <div className="mt-3 space-y-2">
          <div className="h-3 bg-surface-skeleton rounded-full w-full" />
          <div className="h-3 bg-surface-skeleton rounded-full w-5/6" />
        </div>

        <div className="mt-4 pt-3 border-t border-[#1a2030] flex items-center justify-between gap-3">
          <div className="h-3 bg-surface-skeleton rounded-full w-1/3" />
          <div className="h-3 bg-surface-skeleton rounded-full w-1/4" />
        </div>

        <div className="mt-5">
          <div className="rounded-full border border-[#1e2530] bg-[#0d1117] px-4 py-2 text-sm text-transparent" />
        </div>
      </div>

      <div className="h-0.5 bg-surface-skeleton" />
    </div>
  );
}