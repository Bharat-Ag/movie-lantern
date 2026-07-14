"use client"

import { useMemo, useState } from "react"
import { Check } from "lucide-react"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

import { MovieSummaryRow } from "./MovieSummaryRow"
import type { BookingMovieSummary } from "./types"

const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M"]
const SEATS_PER_ROW = 12
const PREMIUM_ROWS = new Set(["F", "G", "H"])
const BOOKED_SEATS = new Set(["B4", "B5", "C7", "D10", "G3", "G8", "I2", "I11", "L6", "L7"])
const PRICE_REGULAR = 280
const PREMIUM_EXTRA = 30

const STEPS = ["Select Seats", "Add Ons", "Review & Pay"]

function seatPrice(row: string) {
    return PREMIUM_ROWS.has(row) ? PRICE_REGULAR + PREMIUM_EXTRA : PRICE_REGULAR
}

type SeatSelectionModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    movie: BookingMovieSummary
    theatreLabel: string
    showtimeLabel: string
    onChangeShowtime: () => void
    onProceed: (seats: string[], total: number) => void
}

export function SeatSelectionModal({
    open,
    onOpenChange,
    movie,
    theatreLabel,
    showtimeLabel,
    onChangeShowtime,
    onProceed,
}: SeatSelectionModalProps) {
    const [selectedSeats, setSelectedSeats] = useState<string[]>([])

    const total = useMemo(
        () => selectedSeats.reduce((sum, seatId) => sum + seatPrice(seatId[0]), 0),
        [selectedSeats]
    )

    const toggleSeat = (seatId: string) => {
        if (BOOKED_SEATS.has(seatId)) return
        setSelectedSeats((prev) =>
            prev.includes(seatId) ? prev.filter((seat) => seat !== seatId) : [...prev, seatId]
        )
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (!next) setSelectedSeats([])
                onOpenChange(next)
            }}
        >
            <DialogContent className="max-w-3xl">
                <DialogHeader className="flex-col items-start gap-3">
                    <DialogTitle>Select Seats</DialogTitle>
                    <div className="flex w-full items-center">
                        {STEPS.map((step, index) => (
                            <div key={step} className="flex flex-1 items-center last:flex-none">
                                <div className="flex flex-col items-center gap-1.5">
                                    <span
                                        className={
                                            index === 0
                                                ? "flex size-7 items-center justify-center rounded-full bg-brand text-xs font-bold text-white"
                                                : "flex size-7 items-center justify-center rounded-full border border-white/15 bg-white/5 text-xs font-bold text-foreground/50"
                                        }
                                    >
                                        {index === 0 ? <Check className="size-3.5" /> : index + 1}
                                    </span>
                                    <span className={index === 0 ? "text-xs font-semibold text-brand-text" : "text-xs text-foreground/50"}>
                                        {step}
                                    </span>
                                </div>
                                {index < STEPS.length - 1 && (
                                    <div className={index === 0 ? "mx-2 h-0.5 flex-1 bg-brand" : "mx-2 h-0.5 flex-1 bg-white/10"} />
                                )}
                            </div>
                        ))}
                    </div>
                </DialogHeader>

                <div className="mt-4">
                    <MovieSummaryRow movie={movie} />
                </div>

                <div className="mt-3 flex items-center justify-between rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm">
                    <span className="font-semibold">{theatreLabel}</span>
                    <button type="button" onClick={onChangeShowtime} className="font-semibold text-brand-text hover:text-foreground">
                        Change
                    </button>
                </div>
                <div className="mt-2 flex items-center justify-between rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm">
                    <span className="font-semibold">{showtimeLabel}</span>
                    <button type="button" onClick={onChangeShowtime} className="font-semibold text-brand-text hover:text-foreground">
                        Change
                    </button>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-foreground/65">
                    <span className="inline-flex items-center gap-1.5">
                        <span className="size-3.5 rounded-sm border border-white/25" />
                        Available
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <span className="size-3.5 rounded-sm bg-emerald-500" />
                        Selected
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <span className="size-3.5 rounded-sm bg-white/10" />
                        Booked
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <span className="size-3.5 rounded-sm border-2 border-brand-text/60" />
                        Premium
                    </span>
                </div>

                <div className="mt-5 overflow-x-auto pb-2">
                    <div className="mx-auto w-fit min-w-full">
                        <div className="mx-auto mb-6 h-2 w-3/4 max-w-md rounded-t-full border-t-2 border-brand-text/40" />
                        <p className="mb-4 text-center text-[10px] font-semibold uppercase tracking-widest text-foreground/40">
                            Screen this way
                        </p>

                        <div className="flex flex-col items-center gap-1.5">
                            {ROWS.map((row, rowIndex) => (
                                <div key={row} className="flex items-center gap-2">
                                    {(rowIndex === 5 || rowIndex === 8) && <div className="h-2" />}
                                    <span className="w-4 shrink-0 text-center text-xs text-foreground/40">{row}</span>
                                    <div className="flex gap-1.5">
                                        {Array.from({ length: SEATS_PER_ROW }, (_, seatIndex) => {
                                            const seatId = `${row}${seatIndex + 1}`
                                            const isBooked = BOOKED_SEATS.has(seatId)
                                            const isSelected = selectedSeats.includes(seatId)
                                            const isPremium = PREMIUM_ROWS.has(row)

                                            return (
                                                <button
                                                    key={seatId}
                                                    type="button"
                                                    disabled={isBooked}
                                                    onClick={() => toggleSeat(seatId)}
                                                    aria-label={`Seat ${seatId}`}
                                                    className={
                                                        isBooked
                                                            ? "flex size-6 items-center justify-center rounded-sm bg-white/10 text-[10px] text-foreground/25"
                                                            : isSelected
                                                              ? "flex size-6 items-center justify-center rounded-sm bg-emerald-500 text-[10px] font-semibold text-white"
                                                              : isPremium
                                                                ? "flex size-6 items-center justify-center rounded-sm border-2 border-brand-text/50 text-[10px] text-foreground/70 transition-colors hover:border-brand-text"
                                                                : "flex size-6 items-center justify-center rounded-sm border border-white/20 text-[10px] text-foreground/60 transition-colors hover:border-white/40"
                                                    }
                                                >
                                                    {seatIndex + 1}
                                                </button>
                                            )
                                        })}
                                    </div>
                                    <span className="w-4 shrink-0 text-center text-xs text-foreground/40">{row}</span>
                                </div>
                            ))}
                        </div>

                        <p className="mt-3 text-center text-[11px] font-semibold uppercase tracking-wide text-brand-text/80">
                            Premium — ₹{PREMIUM_EXTRA} extra
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                    <div>
                        {selectedSeats.length > 0 ? (
                            <>
                                <p className="text-sm text-foreground/60">
                                    {selectedSeats.length} Seat{selectedSeats.length > 1 ? "s" : ""} Selected
                                </p>
                                <p className="text-sm font-semibold text-emerald-400">{selectedSeats.join(", ")}</p>
                            </>
                        ) : (
                            <p className="text-sm text-foreground/60">No seats selected</p>
                        )}
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-foreground/50">Total</p>
                        <p className="text-lg font-bold">₹{total}</p>
                    </div>
                </div>

                <button
                    type="button"
                    disabled={selectedSeats.length === 0}
                    onClick={() => onProceed(selectedSeats, total)}
                    className="mt-4 w-full rounded-md bg-brand px-5 py-3 font-semibold text-primary-foreground transition-colors hover:bg-brand/85 disabled:pointer-events-none disabled:opacity-40"
                >
                    Proceed to Add Ons
                </button>
                <button
                    type="button"
                    onClick={onChangeShowtime}
                    className="mt-3 w-full rounded-md border border-white/10 bg-white/5 px-5 py-3 font-semibold transition-colors hover:border-brand/60"
                >
                    More Showtimes
                </button>
            </DialogContent>
        </Dialog>
    )
}
