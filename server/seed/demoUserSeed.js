import "dotenv/config"
import mongoose from "mongoose"

import connectDB from "../configs/db.js"
import User from "../models/User.js"

export const DEMO_USER_EMAIL = "demo@movielantern.com"
export const DEMO_USER_PASSWORD = "demo1234"

const seedDemoUser = async () => {
    await connectDB()

    const existing = await User.findOne({ email: DEMO_USER_EMAIL })
    if (!existing) {
        await User.create({ name: "Demo User", email: DEMO_USER_EMAIL, password: DEMO_USER_PASSWORD })
        console.log(`Created demo user: ${DEMO_USER_EMAIL}`)
    } else {
        console.log(`Demo user already exists: ${DEMO_USER_EMAIL}`)
    }

    await mongoose.connection.close()
    process.exit(0)
}

seedDemoUser().catch((error) => {
    console.error("Seeding demo user failed:", error.message)
    process.exit(1)
})
