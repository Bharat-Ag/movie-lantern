import express from "express"

import { addToWatchlist, getWatchlist, removeFromWatchlist } from "../controllers/watchlistController.js"
import asyncHandler from "../middleware/asyncHandler.js"
import { protect } from "../middleware/auth.js"

const router = express.Router()

router.use(protect)

router.get("/", asyncHandler(getWatchlist))
router.post("/", asyncHandler(addToWatchlist))
router.delete("/:movieId", asyncHandler(removeFromWatchlist))

export default router
