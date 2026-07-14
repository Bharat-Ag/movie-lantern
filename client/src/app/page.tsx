import { Hero } from "@/components/hero"
import { getNowPlayingMovies, getTrendingMovies, getUpcomingMovies } from "@/lib/tmdb"
import MovieSlider from "@/components/MovieSlider"
import HomeFlyer from "@/components/HomeFlyer"
import GenreSlider from "@/components/GenreSlider"
import { getGenreThumbnails, toSliderMovie } from "@/lib/movie"

export default async function Home() {
  const [movies, upcomingMovies, trendingMovies] = await Promise.all([
    getNowPlayingMovies().catch(() => []),
    getUpcomingMovies().catch(() => []),
    getTrendingMovies().catch(() => []),
  ])

  const sliderMovies = movies.map(toSliderMovie).filter((movie) => movie !== null)
  const upcomingSliderMovies = upcomingMovies.map(toSliderMovie).filter((movie) => movie !== null)
  const trendingSliderMovies = trendingMovies.map(toSliderMovie).filter((movie) => movie !== null)
  const genreThumbnails = getGenreThumbnails([...movies, ...upcomingMovies, ...trendingMovies])

  return (
    <>
      <Hero movies={movies.slice(0, 5)} />
      <MovieSlider title="Now Playing" movies={sliderMovies} viewAllHref="/movies" />
      <HomeFlyer className="mt-2 mb-10" />
      <MovieSlider title="Upcoming Movies" movies={upcomingSliderMovies} viewAllHref="/movies" />
      <MovieSlider title="Trending This Week" movies={trendingSliderMovies} viewAllHref="/movies" />
      <GenreSlider thumbnails={genreThumbnails} />
    </>
  )
}
