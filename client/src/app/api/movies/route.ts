import { NextRequest, NextResponse } from "next/server"

import { discoverMovies, searchMovies } from "@/lib/tmdb"
import { getGenreIdByName } from "@/lib/movie"

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const page = Number(params.get("page") ?? "1") || 1
  const query = params.get("q")?.trim()

  try {
    if (query) {
      const data = await searchMovies(query, page)
      return NextResponse.json(data)
    }

    const genreNames = params.get("genre")?.split(",").filter(Boolean) ?? []
    const genreIds = genreNames
      .map((name) => getGenreIdByName(name))
      .filter((id): id is number => id !== null)

    const language = params.get("language") || undefined
    const yearFrom = Number(params.get("yearFrom")) || undefined
    const yearTo = Number(params.get("yearTo")) || undefined
    const minRating = Number(params.get("rating")) || undefined
    const sortBy = params.get("sort") || undefined

    const data = await discoverMovies({
      page,
      genreIds,
      language,
      yearFrom,
      yearTo,
      minRating,
      sortBy,
    })

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Failed to load movies" }, { status: 502 })
  }
}
