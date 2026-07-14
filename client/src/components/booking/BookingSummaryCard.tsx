import Image from "next/image"
import { Star } from "lucide-react"

import type { BookingMovieSummary } from "./types"

type BookingSummaryCardProps = {
    movie: BookingMovieSummary
    showtimeLabel: string
    theatreLabel: string
    seats: string[]
}

export function BookingSummaryCard({ movie, showtimeLabel, theatreLabel, seats }: BookingSummaryCardProps) {
    return (
        <div className="flex items-center gap-4 rounded-md border border-white/10 bg-white/5 p-3">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-neutral-900">
                {movie.poster && <Image src={movie.poster} alt={movie.title} fill sizes="64px" className="object-cover" />}
            </div>
            <div className="min-w-0">
                <div className="flex items-center gap-2">
                    <h3 className="truncate text-base font-bold">{movie.title}</h3>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-xs font-semibold text-amber-400">
                        <Star className="size-3 fill-current" />
                        {movie.rating.toFixed(1)}/10
                    </span>
                </div>
                <p className="mt-1 truncate text-sm text-foreground/60">{showtimeLabel}</p>
                <p className="truncate text-sm text-foreground/60">{theatreLabel}</p>
                <p className="mt-1 truncate text-sm font-semibold text-brand-text">
                    {seats.length} Seat{seats.length > 1 ? "s" : ""} • {seats.join(", ")}
                </p>
            </div>
        </div>
    )
}
