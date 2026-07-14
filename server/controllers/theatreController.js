import Theatre from "../models/Theatre.js"

// @desc    Get all theatres (optionally filter by city)
// @route   GET /api/theatres
export const getTheatres = async (req, res) => {
    const { city } = req.query

    const filter = { isActive: true }
    if (city) filter.city = new RegExp(`^${city}$`, "i")

    const theatres = await Theatre.find(filter).sort({ name: 1 })

    res.json({ success: true, count: theatres.length, theatres })
}

// @desc    Get a single theatre by id
// @route   GET /api/theatres/:id
export const getTheatreById = async (req, res) => {
    const theatre = await Theatre.findById(req.params.id)

    if (!theatre) {
        return res.status(404).json({ success: false, message: "Theatre not found" })
    }

    res.json({ success: true, theatre })
}
