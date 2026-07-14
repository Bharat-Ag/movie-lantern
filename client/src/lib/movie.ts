import { tmdbImageUrl, type TmdbMovie } from "@/lib/tmdb"

export interface Movie {
  id: number
  title: string
  poster: string
  rating: number
  genres: string[]
}

export interface MovieSliderProps {
  title?: string
  movies: Movie[]
  viewAllHref?: string
  onViewAll?: () => void
  onMovieClick?: (movie: Movie) => void
}

export const TMDB_GENRES: Record<number, string> = {
  12: "Adventure",
  14: "Fantasy",
  16: "Animation",
  18: "Drama",
  27: "Horror",
  28: "Action",
  35: "Comedy",
  53: "Thriller",
  80: "Crime",
  878: "Sci-Fi",
  9648: "Mystery",
  10402: "Music",
  10749: "Romance",
  10751: "Family",
  99: "Documentary",
}

export function getGenreIdByName(name: string): number | null {
  const entry = Object.entries(TMDB_GENRES).find(
    ([, genreName]) => genreName.toLowerCase() === name.toLowerCase()
  )
  return entry ? Number(entry[0]) : null
}

export const LANGUAGES: { code: string; name: string }[] = [
  { code: "hi", name: "Hindi" },
  { code: "en", name: "English" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
  { code: "ml", name: "Malayalam" },
  { code: "kn", name: "Kannada" },
  { code: "pa", name: "Punjabi" },
  { code: "bn", name: "Bengali" },
]

export function getGenreThumbnails(movies: TmdbMovie[]): Record<number, string> {
  const thumbnails: Record<number, string> = {}

  for (const genreId of Object.keys(TMDB_GENRES).map(Number)) {
    const match = movies.find((movie) => movie.genre_ids.includes(genreId))
    const image = match && tmdbImageUrl(match.backdrop_path || match.poster_path, "w300")
    if (image) thumbnails[genreId] = image
  }

  return thumbnails
}

export function toSliderMovie(movie: TmdbMovie): Movie | null {
  const poster = tmdbImageUrl(movie.poster_path, "w500")
  if (!poster) return null

  return {
    id: movie.id,
    title: movie.title,
    poster,
    rating: movie.vote_average,
    genres: movie.genre_ids
      .map((genreId) => TMDB_GENRES[genreId])
      .filter((genre): genre is string => Boolean(genre)),
  }
}
