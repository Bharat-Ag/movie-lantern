"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { Star, Ticket } from "lucide-react"

import { useAuth } from "@/contexts/AuthContext"
import { getMyBookings, type Booking } from "@/lib/bookings"

const DATE_FORMATTER = new Intl.DateTimeFormat("en", { day: "2-digit", month: "short", year: "numeric" })

export default function BookingsPage() {
    const { user, loading, openAuthDialog } = useAuth()
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loadingBookings, setLoadingBookings] = useState(true)

    useEffect(() => {
        if (!user) {
            setLoadingBookings(false)
            return
        }
        getMyBookings()
            .then(setBookings)
            .finally(() => setLoadingBookings(false))
    }, [user])

    if (loading) return null

    if (!user) {
        return (
            <main className="container-app py-20 text-center">
                <Ticket className="mx-auto size-10 text-foreground/40" />
                <h1 className="mt-4 text-2xl font-bold">Sign in to see your bookings</h1>
                <p className="mt-2 text-foreground/60">You need an account to view your ticket history.</p>
                <button
                    type="button"
                    onClick={() => openAuthDialog()}
                    className="mt-6 rounded-md bg-brand px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-brand/85"
                >
                    Sign In
                </button>
            </main>
        )
    }

    if (loadingBookings) return null

    if (bookings.length === 0) {
        return (
            <main className="container-app py-20 text-center">
                <Ticket className="mx-auto size-10 text-foreground/40" />
                <h1 className="mt-4 text-2xl font-bold">No bookings yet</h1>
                <p className="mt-2 text-foreground/60">
                    Hi {user.name}, your confirmed tickets will show up here once you book a show.
                </p>
            </main>
        )
    }

    return (
        <main className="container-app py-10">
            <h1 className="text-3xl font-bold">My Bookings</h1>
            <div className="mt-6 space-y-4">
                {bookings.map((booking) => (
                    <div key={booking._id} className="flex gap-4 rounded-md border border-white/10 bg-white/5 p-4">
                        <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-neutral-900">
                            {booking.moviePoster && (
                                <Image src={booking.moviePoster} alt={booking.movieTitle} fill sizes="80px" className="object-cover" />
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                                <h2 className="font-bold">{booking.movieTitle}</h2>
                                <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold uppercase text-emerald-400">
                                    <Star className="size-3 fill-current" />
                                    {booking.status}
                                </span>
                            </div>
                            <p className="mt-1 text-sm text-foreground/60">{booking.showtimeLabel}</p>
                            <p className="text-sm text-foreground/60">
                                {booking.theatreName}, {booking.theatrePlace}
                            </p>
                            <p className="mt-1 text-sm font-semibold text-brand-text">
                                {booking.seats.length} Seat{booking.seats.length > 1 ? "s" : ""} • {booking.seats.join(", ")}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-foreground/50">
                                <span>Booked on {DATE_FORMATTER.format(new Date(booking.createdAt))}</span>
                                <span className="text-sm font-bold text-foreground">₹{booking.totalAmount}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    )
}
