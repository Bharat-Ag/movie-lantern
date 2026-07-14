import mongoose from "mongoose"

const theatreSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        address: {
            type: String,
            required: true,
            trim: true,
        },
        city: {
            type: String,
            required: true,
            trim: true,
        },
        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                default: undefined,
            },
        },
        totalScreens: {
            type: Number,
            default: 1,
            min: 1,
        },
        amenities: {
            type: [String],
            default: [],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
)

theatreSchema.index({ location: "2dsphere" })

const Theatre = mongoose.models.Theatre || mongoose.model("Theatre", theatreSchema)

export default Theatre
