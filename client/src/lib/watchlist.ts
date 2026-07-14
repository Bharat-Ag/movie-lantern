const API_URL = process.env.NEXT_PUBLIC_API_URL

export type WatchlistItem = {
    movieId: number
    title: string
    poster: string | null
    addedAt: string
}

type WatchlistResponse = { success: boolean; watchlist: WatchlistItem[] }

export async function getWatchlist(): Promise<WatchlistItem[]> {
    const res = await fetch(`${API_URL}/api/watchlist`, { credentials: "include" })
    if (!res.ok) return []
    const data: WatchlistResponse = await res.json()
    return data.watchlist
}

export async function addToWatchlist(movie: { movieId: number; title: string; poster: string | null }) {
    const res = await fetch(`${API_URL}/api/watchlist`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(movie),
    })
    const data: WatchlistResponse = await res.json()
    return data.watchlist
}

export async function removeFromWatchlist(movieId: number) {
    const res = await fetch(`${API_URL}/api/watchlist/${movieId}`, {
        method: "DELETE",
        credentials: "include",
    })
    const data: WatchlistResponse = await res.json()
    return data.watchlist
}
