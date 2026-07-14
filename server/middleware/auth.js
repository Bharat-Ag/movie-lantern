import jwt from "jsonwebtoken"

import User from "../models/User.js"

export const protect = async (req, res, next) => {
    const token = req.cookies?.token

    if (!token) {
        return res.status(401).json({ success: false, message: "Not authenticated" })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.id)

        if (!user) {
            return res.status(401).json({ success: false, message: "Not authenticated" })
        }

        req.user = user
        next()
    } catch {
        return res.status(401).json({ success: false, message: "Invalid or expired session" })
    }
}
