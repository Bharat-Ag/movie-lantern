"use client"

import { useState } from "react"
import { CalendarDays, MapPin } from "lucide-react"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getUpcomingShowDates, THEATRE_SHOWTIMES } from "@/lib/showtimes"

import { MovieSummaryRow } from "./MovieSummaryRow"
import type { BookingMovieSummary } from "./types"

const showDates = getUpcomingShowDates(5)

type ShowtimesModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    movie: BookingMovieSummary
    dateKey: string
    onSelect: (theatreIndex: number, dateKey: string, time: string) => void
}

export function ShowtimesModal({ open, onOpenChange, movie, dateKey, onSelect }: ShowtimesModalProps) {
    const [selectedDateKey, setSelectedDateKey] = useState(dateKey)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>More Showtimes</DialogTitle>
                </DialogHeader>

                <div className="mt-4">
                    <MovieSummaryRow movie={movie} />
                </div>

                <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1">
                    {showDates.map((date) => (
                        <button
                            key={date.key}
                            type="button"
                            onClick={() => setSelectedDateKey(date.key)}
                            className={
                                date.key === selectedDateKey
                                    ? "shrink-0 rounded-md bg-brand px-4 py-2 text-center text-sm font-semibold text-primary-foreground"
                                    : "shrink-0 rounded-md border border-white/10 bg-white/5 px-4 py-2 text-center text-sm text-foreground/75 transition-colors hover:border-brand/60 hover:text-foreground"
                            }
                        >
                            <span className="block">{date.day}</span>
                            <span className="block">
                                {date.date} {date.month}
                            </span>
                        </button>
                    ))}
                    <button
                        type="button"
                        aria-label="Pick another date"
                        className="flex size-10 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5 text-foreground/70 transition-colors hover:border-brand/60 hover:text-foreground"
                    >
                        <CalendarDays className="size-4" />
                    </button>
                </div>

                <div className="mt-5 max-h-[50vh] space-y-5 overflow-y-auto pr-1">
                    {THEATRE_SHOWTIMES.map((theatre, theatreIndex) => (
                        <div key={theatre.name} className="rounded-md border border-white/10 bg-white/5 p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h4 className="font-semibold">{theatre.name}</h4>
                                    <p className="mt-0.5 flex items-center gap-1 text-sm text-foreground/60">
                                        <MapPin className="size-3.5" />
                                        {theatre.place}
                                    </p>
                                </div>
                                <span className="shrink-0 text-sm text-foreground/50">{theatre.distance}</span>
                            </div>

                            <div className="mt-3 space-y-3">
                                {theatre.screens.map((screen) => (
                                    <div key={screen.type}>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
                                            {screen.type}
                                        </p>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {screen.times.map((time) => (
                                                <button
                                                    key={time}
                                                    type="button"
                                                    onClick={() => onSelect(theatreIndex, selectedDateKey, time)}
                                                    className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium transition-colors hover:border-brand/60 hover:bg-brand/10 hover:text-brand-text"
                                                >
                                                    {time}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    )
}
