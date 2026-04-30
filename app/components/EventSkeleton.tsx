export default function EventSkeleton() {
  return (
    <div className="rounded-2xl border border-[#1e2530] bg-[#0d1117] p-5 animate-pulse">
      <div className="flex gap-4">
        <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-[#1e2530]" />

        <div className="flex-1 flex flex-col gap-2">
          <div className="h-4 bg-[#1e2530] rounded-full w-3/4" />
          <div className="h-3 bg-[#1e2530] rounded-full w-full" />
          <div className="h-3 bg-[#1e2530] rounded-full w-2/3" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[#1e2530] pt-3">
        <div className="h-3 bg-[#1e2530] rounded-full w-1/3" />
        <div className="h-3 bg-[#1e2530] rounded-full w-1/4" />
      </div>
    </div>
  );
}