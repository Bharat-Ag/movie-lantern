"use client"

import { useState } from "react"
import { ChevronDown, CalendarDays } from "lucide-react"

import { getUpcomingShowDates, THEATRE_SHOWTIMES } from "@/lib/showtimes"

import { AddOnsModal } from "./AddOnsModal"
import { ReviewPayModal } from "./ReviewPayModal"
import { SeatSelectionModal } from "./SeatSelectionModal"
import { ShowtimesModal } from "./ShowtimesModal"
import type { BookingMovieSummary, SelectedAddOn } from "./types"

const DATE_FORMATTER = new Intl.DateTimeFormat("en", { weekday: "short", day: "numeric", month: "short" })

function formatDateLabel(dateKey: string) {
    return DATE_FORMATTER.format(new Date(dateKey))
}

export function BookingPanel({ movie }: { movie: BookingMovieSummary }) {
    const defaultDateKey = getUpcomingShowDates(1)[0].key

    const [theatreIndex, setTheatreIndex] = useState(0)
    const [dateKey, setDateKey] = useState(defaultDateKey)
    const [time, setTime] = useState<string | null>(null)

    const [seatModalOpen, setSeatModalOpen] = useState(false)
    const [showtimesModalOpen, setShowtimesModalOpen] = useState(false)
    const [addOnsModalOpen, setAddOnsModalOpen] = useState(false)
    const [reviewModalOpen, setReviewModalOpen] = useState(false)

    const [seats, setSeats] = useState<string[]>([])
    const [seatsTotal, setSeatsTotal] = useState(0)
    const [addOns, setAddOns] = useState<SelectedAddOn[]>([])

    const theatre = THEATRE_SHOWTIMES[theatreIndex]
    const activeTime = time ?? theatre.screens[0]?.times[0] ?? ""
    const theatreLabel = `${theatre.name}, ${theatre.place}`
    const showtimeLabel = `${formatDateLabel(dateKey)} • ${activeTime}`

    const openSeatSelection = () => {
        setShowtimesModalOpen(false)
        setAddOnsModalOpen(false)
        setReviewModalOpen(false)
        setSeatModalOpen(true)
    }

    const resetBooking = () => {
        setSeats([])
        setSeatsTotal(0)
        setAddOns([])
    }

    return (
        <div>
            <h3 className="mt-7 text-base font-semibold">Select Theatre</h3>
            <div className="mt-3 space-y-2">
                {THEATRE_SHOWTIMES.map((item, index) => (
                    <button
                        key={item.name}
                        type="button"
                        onClick={() => setTheatreIndex(index)}
                        className={
                            index === theatreIndex
                                ? "flex w-full items-center justify-between rounded-md border border-brand bg-brand/10 px-4 py-3 text-left transition-colors"
                                : "flex w-full items-center justify-between rounded-md border border-white/10 bg-white/5 px-4 py-3 text-left transition-colors hover:border-brand/60"
                        }
                    >
                        <span>
                            <span className="block font-semibold">{item.name}</span>
                            <span className="text-sm text-foreground/60">{item.place}</span>
                        </span>
                        <span className="flex items-center gap-4 text-sm text-foreground/65">
                            {item.distance}
                            <ChevronDown className="size-4" />
                        </span>
                    </button>
                ))}
            </div>

            <button
                type="button"
                onClick={openSeatSelection}
                className="mt-4 w-full rounded-md bg-brand px-5 py-3 font-semibold text-primary-foreground transition-colors hover:bg-brand/85"
            >
                Select Seats
            </button>
            <button
                type="button"
                onClick={() => setShowtimesModalOpen(true)}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-white/10 bg-white/5 px-5 py-3 font-semibold transition-colors hover:border-brand/60"
            >
                <CalendarDays className="size-4" />
                More Showtimes
            </button>

            <ShowtimesModal
                open={showtimesModalOpen}
                onOpenChange={setShowtimesModalOpen}
                movie={movie}
                dateKey={dateKey}
                onSelect={(nextTheatreIndex, nextDateKey, nextTime) => {
                    setTheatreIndex(nextTheatreIndex)
                    setDateKey(nextDateKey)
                    setTime(nextTime)
                    openSeatSelection()
                }}
            />

            <SeatSelectionModal
                open={seatModalOpen}
                onOpenChange={setSeatModalOpen}
                movie={movie}
                theatreLabel={theatreLabel}
                showtimeLabel={showtimeLabel}
                onChangeShowtime={() => {
                    setSeatModalOpen(false)
                    setShowtimesModalOpen(true)
                }}
                onProceed={(nextSeats, nextTotal) => {
                    setSeats(nextSeats)
                    setSeatsTotal(nextTotal)
                    setSeatModalOpen(false)
                    setAddOnsModalOpen(true)
                }}
            />

            <AddOnsModal
                open={addOnsModalOpen}
                onOpenChange={setAddOnsModalOpen}
                movie={movie}
                theatreLabel={theatreLabel}
                showtimeLabel={showtimeLabel}
                seats={seats}
                onProceed={(nextAddOns) => {
                    setAddOns(nextAddOns)
                    setAddOnsModalOpen(false)
                    setReviewModalOpen(true)
                }}
            />

            <ReviewPayModal
                open={reviewModalOpen}
                onOpenChange={setReviewModalOpen}
                movie={movie}
                theatreLabel={theatreLabel}
                theatreName={theatre.name}
                theatrePlace={theatre.place}
                showtimeLabel={showtimeLabel}
                seats={seats}
                seatsTotal={seatsTotal}
                addOns={addOns}
                onEdit={() => {
                    setReviewModalOpen(false)
                    setAddOnsModalOpen(true)
                }}
                onComplete={resetBooking}
            />
        </div>
    )
}
