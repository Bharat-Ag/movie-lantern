"use client"

import { useMemo, useState } from "react"
import { Minus, Plus } from "lucide-react"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

import { ADD_ONS } from "./addOnsCatalog"
import { BookingSummaryCard } from "./BookingSummaryCard"
import type { BookingMovieSummary, SelectedAddOn } from "./types"

type AddOnsModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    movie: BookingMovieSummary
    theatreLabel: string
    showtimeLabel: string
    seats: string[]
    onProceed: (addOns: SelectedAddOn[]) => void
}

export function AddOnsModal({
    open,
    onOpenChange,
    movie,
    theatreLabel,
    showtimeLabel,
    seats,
    onProceed,
}: AddOnsModalProps) {
    const [quantities, setQuantities] = useState<Record<string, number>>({})

    const total = useMemo(
        () => ADD_ONS.reduce((sum, addOn) => sum + (quantities[addOn.id] ?? 0) * addOn.price, 0),
        [quantities]
    )

    const updateQty = (id: string, delta: number) => {
        setQuantities((prev) => ({
            ...prev,
            [id]: Math.max(0, (prev[id] ?? 0) + delta),
        }))
    }

    const handleReviewOrder = () => {
        const selected = ADD_ONS.filter((addOn) => (quantities[addOn.id] ?? 0) > 0).map((addOn) => ({
            id: addOn.id,
            name: addOn.name,
            price: addOn.price,
            qty: quantities[addOn.id] ?? 0,
        }))
        onProceed(selected)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader className="flex-col items-start gap-1">
                    <DialogTitle>Add Ons</DialogTitle>
                    <p className="text-sm text-foreground/50">Step 2 of 3</p>
                </DialogHeader>

                <div className="mt-4">
                    <BookingSummaryCard movie={movie} showtimeLabel={showtimeLabel} theatreLabel={theatreLabel} seats={seats} />
                </div>

                <h4 className="mt-5 font-semibold">Make your experience better!</h4>

                <div className="mt-3 max-h-[45vh] space-y-3 overflow-y-auto pr-1">
                    {ADD_ONS.map((addOn) => {
                        const qty = quantities[addOn.id] ?? 0
                        return (
                            <div
                                key={addOn.id}
                                className="flex items-center gap-4 rounded-md border border-white/10 bg-white/5 p-3"
                            >
                                <span className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-brand/10 text-brand-text">
                                    {addOn.bestSeller && (
                                        <span className="absolute left-0 top-0 rounded-br-md bg-brand px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                                            Best
                                        </span>
                                    )}
                                    <addOn.icon className="size-6" />
                                </span>

                                <div className="min-w-0 flex-1">
                                    <h5 className="font-semibold">{addOn.name}</h5>
                                    <p className="truncate text-sm text-foreground/55">{addOn.description}</p>
                                    <p className="mt-0.5 font-semibold text-brand-text">₹{addOn.price}</p>
                                </div>

                                <div className="flex shrink-0 items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => updateQty(addOn.id, -1)}
                                        disabled={qty === 0}
                                        aria-label={`Remove one ${addOn.name}`}
                                        className="flex size-7 items-center justify-center rounded-full border border-white/15 bg-white/5 disabled:pointer-events-none disabled:opacity-30"
                                    >
                                        <Minus className="size-3.5" />
                                    </button>
                                    <span className="w-4 text-center text-sm font-semibold">{qty}</span>
                                    <button
                                        type="button"
                                        onClick={() => updateQty(addOn.id, 1)}
                                        aria-label={`Add one ${addOn.name}`}
                                        className="flex size-7 items-center justify-center rounded-full bg-brand text-white transition-colors hover:bg-brand/85"
                                    >
                                        <Plus className="size-3.5" />
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                    <div>
                        <p className="text-xs text-foreground/50">Total Add Ons</p>
                        <p className="text-lg font-bold">₹{total}</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleReviewOrder}
                        className="rounded-md bg-brand px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-brand/85"
                    >
                        Review Order
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
