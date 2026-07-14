import Image from "next/image"
import { Star } from "lucide-react"

import type { BookingMovieSummary } from "./types"

export function MovieSummaryRow({ movie }: { movie: BookingMovieSummary }) {
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
                <p className="mt-1 truncate text-sm text-foreground/60">
                    {movie.language} • {movie.runtimeLabel}
                    {movie.genres.length > 0 ? ` • ${movie.genres.join(", ")}` : ""}
                </p>
            </div>
        </div>
    )
}
