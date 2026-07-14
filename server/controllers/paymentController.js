import crypto from "crypto"

import razorpay from "../configs/razorpay.js"

// @desc    Create a Razorpay order
// @route   POST /api/payments/order
export const createOrder = async (req, res) => {
    const { amount, receipt } = req.body

    if (!amount || amount <= 0) {
        return res.status(400).json({ success: false, message: "A valid amount is required" })
    }

    const order = await razorpay.orders.create({
        amount: Math.round(amount * 100), // rupees -> paise
        currency: "INR",
        receipt: receipt || `receipt_${Date.now()}`,
    })

    res.json({ success: true, order, keyId: process.env.RAZORPAY_KEY_ID })
}

// @desc    Verify a Razorpay payment signature
// @route   POST /api/payments/verify
export const verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ success: false, message: "Missing payment verification fields" })
    }

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex")

    if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ success: false, message: "Payment verification failed" })
    }

    res.json({ success: true, message: "Payment verified" })
}
