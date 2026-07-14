import express from "express"

import { getTheatreById, getTheatres } from "../controllers/theatreController.js"
import asyncHandler from "../middleware/asyncHandler.js"

const router = express.Router()

router.get("/", asyncHandler(getTheatres))
router.get("/:id", asyncHandler(getTheatreById))

export default router
