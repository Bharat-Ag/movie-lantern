import "dotenv/config"
import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"

import connectDB from "./configs/db.js"
import authRoutes from "./routes/authRoutes.js"
import bookingRoutes from "./routes/bookingRoutes.js"
import errorHandler from "./middleware/errorHandler.js"
import notFound from "./middleware/notFound.js"
import paymentRoutes from "./routes/paymentRoutes.js"
import theatreRoutes from "./routes/theatreRoutes.js"
import watchlistRoutes from "./routes/watchlistRoutes.js"

const app = express()

await connectDB()

const allowedOrigins = [
    "http://localhost:3000",
    "https://movie-lantern.vercel.app"
]

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true)
            } else {
                callback(new Error("Not allowed by CORS"))
            }
        },
        credentials: true,
    })
)
app.use(express.json())
app.use(cookieParser())

app.get("/", (req, res) => res.send("Movie Lantern API is running"))
app.use("/api/auth", authRoutes)
app.use("/api/theatres", theatreRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/watchlist", watchlistRoutes)
app.use("/api/bookings", bookingRoutes)

app.use(notFound)
app.use(errorHandler)

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`Server listening on port ${port}`))
