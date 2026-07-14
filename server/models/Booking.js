import mongoose from "mongoose"

const bookingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        movieId: { type: Number, required: true },
        movieTitle: { type: String, required: true },
        moviePoster: { type: String, default: null },
        theatreName: { type: String, required: true },
        theatrePlace: { type: String, required: true },
        showtimeLabel: { type: String, required: true },
        seats: { type: [String], required: true },
        addOns: {
            type: [
                {
                    name: { type: String, required: true },
                    price: { type: Number, required: true },
                    qty: { type: Number, required: true },
                },
            ],
            default: [],
        },
        seatsTotal: { type: Number, required: true },
        convenienceFee: { type: Number, required: true },
        addOnsTotal: { type: Number, default: 0 },
        totalAmount: { type: Number, required: true },
        razorpayOrderId: { type: String, required: true },
        razorpayPaymentId: { type: String, required: true },
        status: { type: String, enum: ["confirmed"], default: "confirmed" },
    },
    { timestamps: true }
)

const Booking = mongoose.models.Booking || mongoose.model("Booking", bookingSchema)

export default Booking
