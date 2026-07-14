"use client"

import { useEffect, useState } from "react"
import { Check, Plus } from "lucide-react"

import { useAuth } from "@/contexts/AuthContext"
import { addToWatchlist, getWatchlist, removeFromWatchlist } from "@/lib/watchlist"

type WatchlistButtonProps = {
    movieId: number
    title: string
    poster: string | null
}

export function WatchlistButton({ movieId, title, poster }: WatchlistButtonProps) {
    const { user, openAuthDialog } = useAuth()
    const [saved, setSaved] = useState(false)
    const [pending, setPending] = useState(false)

    useEffect(() => {
        if (!user) {
            setSaved(false)
            return
        }
        getWatchlist().then((watchlist) => {
            setSaved(watchlist.some((item) => item.movieId === movieId))
        })
    }, [user, movieId])

    const handleClick = async () => {
        if (!user) {
            openAuthDialog({ message: "Sign in to save movies to your watchlist." })
            return
        }

        setPending(true)
        try {
            if (saved) {
                await removeFromWatchlist(movieId)
                setSaved(false)
            } else {
                await addToWatchlist({ movieId, title, poster })
                setSaved(true)
            }
        } finally {
            setPending(false)
        }
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={pending}
            className="flex flex-col items-center gap-2 transition-colors hover:text-brand-text disabled:opacity-60"
        >
            {saved ? <Check className="size-6 text-brand-text" /> : <Plus className="size-6" />}
            <span>{saved ? "In Watchlist" : "Watchlist"}</span>
        </button>
    )
}
