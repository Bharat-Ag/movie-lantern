import express from "express"

import { createBooking, getMyBookings } from "../controllers/bookingController.js"
import asyncHandler from "../middleware/asyncHandler.js"
import { protect } from "../middleware/auth.js"

const router = express.Router()

router.use(protect)

router.get("/", asyncHandler(getMyBookings))
router.post("/", asyncHandler(createBooking))

export default router
