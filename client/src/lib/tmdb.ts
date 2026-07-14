const TMDB_BASE_URL = process.env.TMDB_BASE_URL ?? "https://api.themoviedb.org/3"
const TMDB_ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN

export const TMDB_IMAGE_BASE_URL =
  process.env.TMDB_IMAGE_BASE_URL ?? "https://image.tmdb.org/t/p/original"

export interface TmdbMovie {
  id: number
  title: string
  overview: string
  backdrop_path: string | null
  poster_path: string | null
  vote_average: number
  release_date: string
  genre_ids: number[]
  original_language: string
}

export interface TmdbGenre {
  id: number
  name: string
}

export interface TmdbCredit {
  id: number
  name: string
  job?: string
  character?: string
}

export interface TmdbMovieDetails extends Omit<TmdbMovie, "genre_ids"> {
  budget: number
  genres: TmdbGenre[]
  homepage: string | null
  original_language: string
  revenue: number
  runtime: number | null
  spoken_languages: { english_name: string; iso_639_1: string; name: string }[]
  credits?: {
    cast: TmdbCredit[]
    crew: TmdbCredit[]
  }
  recommendations?: TmdbMovieListResponse
}

interface TmdbMovieListResponse {
  results: TmdbMovie[]
}

export interface TmdbMovieListResult {
  results: TmdbMovie[]
  page: number
  total_pages: number
  total_results: number
}

export interface DiscoverMoviesOptions {
  page?: number
  sortBy?: string
  genreIds?: number[]
  language?: string
  yearFrom?: number
  yearTo?: number
  minRating?: number
  region?: string
}

const MAX_ATTEMPTS = 5

async function tmdbFetch<T>(path: string, params?: Record<string, string>) {
  const url = new URL(`${TMDB_BASE_URL}${path}`)
  url.searchParams.set("language", "en-US")
  for (const [key, value] of Object.entries(params ?? {})) {
    url.searchParams.set(key, value)
  }

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
          accept: "application/json",
        },
        next: { revalidate: 3600 },
      })

      if (!res.ok) {
        throw new Error(`TMDB request failed: ${res.status} ${res.statusText}`)
      }

      return res.json() as Promise<T>
    } catch (error) {
      if (attempt === MAX_ATTEMPTS) throw error
      await new Promise((resolve) => setTimeout(resolve, attempt * 500))
    }
  }

  throw new Error("TMDB request failed")
}

export async function getNowPlayingMovies(region = "IN") {
  const data = await tmdbFetch<TmdbMovieListResponse>("/movie/now_playing", {
    page: "1",
    region,
  })
  return data.results
}

export async function getUpcomingMovies(region = "IN") {
  const data = await tmdbFetch<TmdbMovieListResponse>("/movie/upcoming", {
    page: "1",
    region,
  })
  return data.results
}

export async function getTrendingMovies() {
  const data = await tmdbFetch<TmdbMovieListResponse>("/trending/movie/week")
  return data.results
}

export async function discoverMovies(options: DiscoverMoviesOptions = {}) {
  const {
    page = 1,
    sortBy = "popularity.desc",
    genreIds,
    language,
    yearFrom,
    yearTo,
    minRating,
    region = "IN",
  } = options

  const params: Record<string, string> = {
    page: String(page),
    sort_by: sortBy,
    region,
    include_adult: "false",
  }

  if (genreIds && genreIds.length > 0) params.with_genres = genreIds.join("|")
  if (language) params.with_original_language = language
  if (yearFrom) params["primary_release_date.gte"] = `${yearFrom}-01-01`
  if (yearTo) params["primary_release_date.lte"] = `${yearTo}-12-31`
  if (minRating) {
    params["vote_average.gte"] = String(minRating)
    params["vote_count.gte"] = "10"
  }

  return tmdbFetch<TmdbMovieListResult>("/discover/movie", params)
}

export async function searchMovies(query: string, page = 1) {
  return tmdbFetch<TmdbMovieListResult>("/search/movie", {
    query,
    page: String(page),
    include_adult: "false",
  })
}

export async function getMovieDetails(movieId: string | number) {
  return tmdbFetch<TmdbMovieDetails>(`/movie/${movieId}`, {
    append_to_response: "credits,recommendations",
  })
}

export function tmdbImageUrl(path: string | null, size = "original") {
  if (!path) return null
  const base = TMDB_IMAGE_BASE_URL.replace(/\/t\/p\/[^/]+$/, `/t/p/${size}`)
  return `${base}${path}`
}
