const API_URL = process.env.NEXT_PUBLIC_API_URL

export type AddOnRecord = { name: string; price: number; qty: number }

export type Booking = {
    _id: string
    movieId: number
    movieTitle: string
    moviePoster: string | null
    theatreName: string
    theatrePlace: string
    showtimeLabel: string
    seats: string[]
    addOns: AddOnRecord[]
    seatsTotal: number
    convenienceFee: number
    addOnsTotal: number
    totalAmount: number
    razorpayOrderId: string
    razorpayPaymentId: string
    status: string
    createdAt: string
}

export type CreateBookingPayload = Omit<Booking, "_id" | "status" | "createdAt">

export async function createBooking(payload: CreateBookingPayload): Promise<Booking | null> {
    const res = await fetch(`${API_URL}/api/bookings`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    })

    if (!res.ok) return null
    const data: { success: boolean; booking: Booking } = await res.json()
    return data.booking
}

export async function getMyBookings(): Promise<Booking[]> {
    const res = await fetch(`${API_URL}/api/bookings`, { credentials: "include" })
    if (!res.ok) return []
    const data: { success: boolean; bookings: Booking[] } = await res.json()
    return data.bookings
}
