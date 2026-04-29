import Link from "next/link";

type Event = {
    id: number;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    place: string;
};

function formatDate(d: string) {
    return new Date(d).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

export default function EventCard({ event }: { event: Event }) {
    const day = new Date(event.start_date).getDate();
    const month = new Date(event.start_date).toLocaleDateString("fr-FR", { month: "short" });
    const isMultiDay = event.start_date !== event.end_date;

    return (
        <Link
            href={`/events/${event.id}`}
            className="group rounded-2xl border border-[#1e2530] bg-[#0d1117] p-5 hover:border-[#00E5FF33] hover:bg-[#0f1520] transition-all duration-300 cursor-pointer hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#00E5FF08]"
        >
            <div className="flex gap-4">
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-[#00E5FF15] border border-[#00E5FF33] flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-[#00E5FF] leading-none">{day}</span>
                    <span className="text-[10px] text-[#4a5568] uppercase tracking-wider">{month}</span>
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-base leading-tight truncate group-hover:text-[#00E5FF] transition-colors">
                        {event.title}
                    </h3>
                    <p className="text-[#4a5568] text-xs mt-1 line-clamp-2">
                        {event.description}
                    </p>
                </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-[#3a4550] border-t border-[#1e2530] pt-3">
                <span>📍 {event.place}</span>
                <span>
                    {isMultiDay
                        ? `${formatDate(event.start_date)} → ${formatDate(event.end_date)}`
                        : formatDate(event.start_date)}
                </span>
            </div>
        </Link>
    );
}