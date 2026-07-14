// @desc    Get the current user's watchlist
// @route   GET /api/watchlist
export const getWatchlist = async (req, res) => {
    res.json({ success: true, watchlist: req.user.watchlist })
}

// @desc    Add a movie to the current user's watchlist
// @route   POST /api/watchlist
export const addToWatchlist = async (req, res) => {
    const { movieId, title, poster } = req.body

    if (!movieId || !title) {
        return res.status(400).json({ success: false, message: "movieId and title are required" })
    }

    const alreadySaved = req.user.watchlist.some((item) => item.movieId === movieId)
    if (!alreadySaved) {
        req.user.watchlist.push({ movieId, title, poster })
        await req.user.save()
    }

    res.status(201).json({ success: true, watchlist: req.user.watchlist })
}

// @desc    Remove a movie from the current user's watchlist
// @route   DELETE /api/watchlist/:movieId
export const removeFromWatchlist = async (req, res) => {
    const movieId = Number(req.params.movieId)

    req.user.watchlist = req.user.watchlist.filter((item) => item.movieId !== movieId)
    await req.user.save()

    res.json({ success: true, watchlist: req.user.watchlist })
}
