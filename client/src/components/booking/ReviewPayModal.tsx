"use client"

import { useMemo, useState } from "react"
import { CheckCircle2, Lock } from "lucide-react"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/contexts/AuthContext"
import { createBooking } from "@/lib/bookings"
import { createRazorpayOrder, verifyRazorpayPayment } from "@/lib/payments"
import { loadRazorpayScript, type RazorpaySuccessResponse } from "@/lib/razorpay"

import { BookingSummaryCard } from "./BookingSummaryCard"
import type { BookingMovieSummary, SelectedAddOn } from "./types"

const CONVENIENCE_FEE = 40
const BRAND_COLOR = "#472eb4"

type ReviewPayModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    movie: BookingMovieSummary
    theatreLabel: string
    theatreName: string
    theatrePlace: string
    showtimeLabel: string
    seats: string[]
    seatsTotal: number
    addOns: SelectedAddOn[]
    onEdit: () => void
    onComplete: () => void
}

export function ReviewPayModal({
    open,
    onOpenChange,
    movie,
    theatreLabel,
    theatreName,
    theatrePlace,
    showtimeLabel,
    seats,
    seatsTotal,
    addOns,
    onEdit,
    onComplete,
}: ReviewPayModalProps) {
    const { user, openAuthDialog } = useAuth()
    const [paying, setPaying] = useState(false)
    const [paymentState, setPaymentState] = useState<"idle" | "success" | "error">("idle")
    const [paymentId, setPaymentId] = useState<string | null>(null)
    const [errorMessage, setErrorMessage] = useState("")

    const addOnsTotal = useMemo(() => addOns.reduce((sum, addOn) => sum + addOn.price * addOn.qty, 0), [addOns])
    const addOnsSummary = addOns.map((addOn) => `${addOn.qty} ${addOn.name}`).join(", ")
    const total = seatsTotal + CONVENIENCE_FEE + addOnsTotal

    const resetPaymentState = () => {
        setPaying(false)
        setPaymentState("idle")
        setPaymentId(null)
        setErrorMessage("")
    }

    const handlePay = async () => {
        if (!user) {
            openAuthDialog({ message: "Sign in to complete your payment." })
            return
        }

        setPaying(true)
        setErrorMessage("")

        try {
            await loadRazorpayScript()
            const { order, keyId } = await createRazorpayOrder(total, `movielantern_${Date.now()}`)

            const razorpay = new window.Razorpay({
                key: keyId,
                amount: order.amount,
                currency: order.currency,
                name: "Movie Lantern",
                description: movie.title,
                order_id: order.id,
                theme: { color: BRAND_COLOR },
                handler: (response: RazorpaySuccessResponse) => {
                    verifyRazorpayPayment(response)
                        .then(async (verification) => {
                            if (verification.success) {
                                await createBooking({
                                    movieId: movie.movieId,
                                    movieTitle: movie.title,
                                    moviePoster: movie.poster,
                                    theatreName,
                                    theatrePlace,
                                    showtimeLabel,
                                    seats,
                                    addOns: addOns.map(({ name, price, qty }) => ({ name, price, qty })),
                                    seatsTotal,
                                    convenienceFee: CONVENIENCE_FEE,
                                    addOnsTotal,
                                    totalAmount: total,
                                    razorpayOrderId: response.razorpay_order_id,
                                    razorpayPaymentId: response.razorpay_payment_id,
                                })
                                setPaymentId(response.razorpay_payment_id)
                                setPaymentState("success")
                            } else {
                                setErrorMessage(verification.message || "Payment verification failed")
                                setPaymentState("error")
                            }
                        })
                        .catch(() => {
                            setErrorMessage("Could not verify payment")
                            setPaymentState("error")
                        })
                        .finally(() => setPaying(false))
                },
                modal: {
                    ondismiss: () => setPaying(false),
                },
            })

            razorpay.open()
        } catch {
            setErrorMessage("Could not start payment. Please try again.")
            setPaymentState("error")
            setPaying(false)
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (!next) {
                    if (paymentState === "success") onComplete()
                    resetPaymentState()
                }
                onOpenChange(next)
            }}
        >
            <DialogContent className="max-w-xl">
                {paymentState === "success" ? (
                    <div className="flex flex-col items-center py-6 text-center">
                        <CheckCircle2 className="size-14 text-emerald-400" />
                        <h3 className="mt-4 text-xl font-bold">Payment Successful!</h3>
                        <p className="mt-1 text-sm text-foreground/60">Your booking for {movie.title} is confirmed.</p>
                        <p className="mt-3 text-sm text-foreground/60">
                            Seats <span className="font-semibold text-foreground">{seats.join(", ")}</span>
                        </p>
                        {paymentId && <p className="mt-1 text-xs text-foreground/40">Payment ID: {paymentId}</p>}
                        <button
                            type="button"
                            onClick={() => {
                                resetPaymentState()
                                onComplete()
                                onOpenChange(false)
                            }}
                            className="mt-6 w-full rounded-md bg-brand px-5 py-3 font-semibold text-primary-foreground transition-colors hover:bg-brand/85"
                        >
                            Done
                        </button>
                    </div>
                ) : (
                    <>
                        <DialogHeader className="flex-col items-start gap-1">
                            <DialogTitle>Review &amp; Pay</DialogTitle>
                            <p className="text-sm text-foreground/50">Step 3 of 3</p>
                        </DialogHeader>

                        <div className="mt-4">
                            <BookingSummaryCard movie={movie} showtimeLabel={showtimeLabel} theatreLabel={theatreLabel} seats={seats} />
                        </div>

                        <div className="mt-4 rounded-md border border-white/10 bg-white/5 p-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-semibold">Booking Details</h4>
                                <button type="button" onClick={onEdit} className="text-sm font-semibold text-brand-text hover:text-foreground">
                                    Edit
                                </button>
                            </div>
                            <dl className="mt-3 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-foreground/60">Tickets</dt>
                                    <dd>
                                        {seats.length} Ticket{seats.length > 1 ? "s" : ""}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-foreground/60">Seats</dt>
                                    <dd>{seats.join(", ")}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-foreground/60">Showtime</dt>
                                    <dd>{showtimeLabel}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-foreground/60">Theatre</dt>
                                    <dd className="text-right">{theatreLabel}</dd>
                                </div>
                            </dl>
                        </div>

                        <div className="mt-4 rounded-md border border-white/10 bg-white/5 p-4">
                            <h4 className="font-semibold">Price Details</h4>
                            <dl className="mt-3 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-foreground/60">
                                        {seats.length} Ticket{seats.length > 1 ? "s" : ""}
                                    </dt>
                                    <dd>₹{seatsTotal}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-foreground/60">Convenience Fee</dt>
                                    <dd>₹{CONVENIENCE_FEE}</dd>
                                </div>
                                {addOnsTotal > 0 && (
                                    <div className="flex justify-between">
                                        <dt className="text-foreground/60">
                                            Add Ons
                                            <span className="block text-xs text-foreground/40">{addOnsSummary}</span>
                                        </dt>
                                        <dd>₹{addOnsTotal}</dd>
                                    </div>
                                )}
                            </dl>
                            <div className="mt-3 flex justify-between border-t border-white/10 pt-3 text-base font-bold">
                                <span>Total Amount</span>
                                <span>₹{total}</span>
                            </div>
                        </div>

                        {errorMessage && (
                            <p className="mt-3 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
                                {errorMessage}
                            </p>
                        )}

                        <div className="mt-5 flex items-center justify-between gap-4">
                            <div>
                                <p className="text-xs text-foreground/50">Pay</p>
                                <p className="text-lg font-bold">₹{total}</p>
                            </div>
                            <button
                                type="button"
                                onClick={handlePay}
                                disabled={paying}
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-brand px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-brand/85 disabled:pointer-events-none disabled:opacity-60"
                            >
                                <Lock className="size-4" />
                                {paying ? "Processing..." : "Proceed to Pay"}
                            </button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
