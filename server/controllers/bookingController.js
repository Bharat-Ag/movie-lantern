import Booking from "../models/Booking.js"

const REQUIRED_FIELDS = [
    "movieId",
    "movieTitle",
    "theatreName",
    "theatrePlace",
    "showtimeLabel",
    "seats",
    "seatsTotal",
    "convenienceFee",
    "totalAmount",
    "razorpayOrderId",
    "razorpayPaymentId",
]

// @desc    Create a booking record after a verified payment
// @route   POST /api/bookings
export const createBooking = async (req, res) => {
    const missing = REQUIRED_FIELDS.filter((field) => req.body[field] === undefined || req.body[field] === null)
    if (missing.length > 0) {
        return res.status(400).json({ success: false, message: `Missing fields: ${missing.join(", ")}` })
    }

    const booking = await Booking.create({ ...req.body, user: req.user._id })
    res.status(201).json({ success: true, booking })
}

// @desc    Get the current user's bookings
// @route   GET /api/bookings
export const getMyBookings = async (req, res) => {
    const bookings = await Booking.find({ user: req.user._id }).sort({ createdAt: -1 })
    res.json({ success: true, bookings })
}
