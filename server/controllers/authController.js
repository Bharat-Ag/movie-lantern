import jwt from "jsonwebtoken"

import User from "../models/User.js"

const COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

function generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "30d",
    })
}

function setAuthCookie(res, token) {
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: COOKIE_MAX_AGE_MS,
    })
}

function toPublicUser(user) {
    return { id: user._id, name: user.name, email: user.email }
}

// @desc    Register a new user
// @route   POST /api/auth/register
export const register = async (req, res) => {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "Name, email, and password are required" })
    }

    if (password.length < 6) {
        return res.status(400).json({ success: false, message: "Password must be at least 6 characters" })
    }

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
        return res.status(409).json({ success: false, message: "An account with this email already exists" })
    }

    const user = await User.create({ name, email, password })
    setAuthCookie(res, generateToken(user._id))

    res.status(201).json({ success: true, user: toPublicUser(user) })
}

// @desc    Log in an existing user
// @route   POST /api/auth/login
export const login = async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required" })
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password")
    const isValid = user && (await user.comparePassword(password))

    if (!isValid) {
        return res.status(401).json({ success: false, message: "Invalid email or password" })
    }

    setAuthCookie(res, generateToken(user._id))
    res.json({ success: true, user: toPublicUser(user) })
}

// @desc    Log out the current user
// @route   POST /api/auth/logout
export const logout = async (req, res) => {
    res.clearCookie("token")
    res.json({ success: true, message: "Logged out" })
}

// @desc    Get the current authenticated user
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
    res.json({ success: true, user: toPublicUser(req.user) })
}
