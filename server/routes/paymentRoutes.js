import express from "express"

import { createOrder, verifyPayment } from "../controllers/paymentController.js"
import asyncHandler from "../middleware/asyncHandler.js"
import { protect } from "../middleware/auth.js"

const router = express.Router()

router.use(protect)

router.post("/order", asyncHandler(createOrder))
router.post("/verify", asyncHandler(verifyPayment))

export default router
