import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"
import { ChevronRight, Heart, Play, Share2, Star } from "lucide-react"

import { BookingPanel } from "@/components/booking/BookingPanel"
import { DateSelector } from "@/components/DateSelector"
import MoviesExplorer from "@/components/MoviesExplorer"
import { WatchlistButton } from "@/components/WatchlistButton"
import { getGenreIdByName } from "@/lib/movie"
import { discoverMovies, getMovieDetails, getNowPlayingMovies, searchMovies, tmdbImageUrl, type TmdbMovie } from "@/lib/tmdb"

type MoviesPageProps = {
    params: Promise<{
        slug?: string[]
    }>
    searchParams: Promise<Record<string, string | undefined>>
}

function formatRuntime(minutes: number | null) {
    if (!minutes) return "Runtime unavailable"
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
}

function formatDate(value: string) {
    if (!value) return "Release date unavailable"
    return new Intl.DateTimeFormat("en", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(value))
}

function formatMoney(value: number) {
    if (!value) return "Unavailable"
    return new Intl.NumberFormat("en", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
        notation: "compact",
    }).format(value)
}

function movieHref(movie: TmdbMovie) {
    const slug = movie.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

    return `/movies/${slug}/${movie.id}`
}

async function ListingPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
    const query = searchParams.q?.trim()
    const genreNames = searchParams.genre?.split(",").filter(Boolean) ?? []
    const genreIds = genreNames.map((name) => getGenreIdByName(name)).filter((id): id is number => id !== null)
    const language = searchParams.language || undefined
    const yearFrom = Number(searchParams.yearFrom) || undefined
    const yearTo = Number(searchParams.yearTo) || undefined
    const minRating = Number(searchParams.rating) || undefined
    const sortBy = searchParams.sort || undefined

    const data = await (query
        ? searchMovies(query)
        : discoverMovies({ genreIds, language, yearFrom, yearTo, minRating, sortBy })
    ).catch(() => ({ results: [], total_pages: 0, total_results: 0 }))

    return (
        <Suspense fallback={null}>
            <MoviesExplorer
                initialMovies={data.results}
                initialTotalPages={data.total_pages}
                initialTotalResults={data.total_results}
            />
        </Suspense>
    )
}

export default async function Movies({ params, searchParams }: MoviesPageProps) {
    const { slug } = await params
    const movieId = slug?.at(-1);

    if (!movieId) return <ListingPage searchParams={await searchParams} />

    const [movie, nowPlaying] = await Promise.all([
        getMovieDetails(movieId).catch(() => null),
        getNowPlayingMovies().catch(() => []),
    ])

    if (!movie) {
        return (
            <main className="container-app py-10">
                <Link href="/movies" className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground">
                    <ChevronRight className="size-4 rotate-180" />
                    Back to Movies
                </Link>
                <div className="mt-10 rounded-md border border-white/10 bg-white/5 p-8">
                    <h1 className="text-2xl font-bold">Movie details unavailable</h1>
                    <p className="mt-2 text-foreground/65">We could not load this movie right now.</p>
                </div>
            </main>
        )
    }

    const poster = tmdbImageUrl(movie.poster_path, "w500")
    const backdrop = tmdbImageUrl(movie.backdrop_path, "original")
    const genres = movie.genres.map((genre) => genre.name)
    const languages = movie.spoken_languages.map((language) => language.english_name).filter(Boolean)
    const movieSummary = {
        movieId: movie.id,
        title: movie.title,
        poster,
        rating: movie.vote_average,
        runtimeLabel: formatRuntime(movie.runtime),
        language: languages[0] ?? "Unavailable",
        genres: genres.slice(0, 3),
    }
    const director = movie.credits?.crew.find((person) => person.job === "Director")?.name ?? "Unavailable"
    const writers =
        movie.credits?.crew
            .filter((person) => ["Writer", "Screenplay", "Story"].includes(person.job ?? ""))
            .map((person) => person.name)
            .filter((name, index, names) => names.indexOf(name) === index)
            .slice(0, 3)
            .join(", ") || "Unavailable"
    const stars =
        movie.credits?.cast
            .slice(0, 3)
            .map((person) => person.name)
            .join(", ") || "Unavailable"
    const recommendations =
        movie.recommendations?.results.filter((item) => item.poster_path).slice(0, 4) ??
        nowPlaying.filter((item) => item.id !== movie.id && item.poster_path).slice(0, 4)

    return (
        <div className="relative overflow-hidden">
            {backdrop && (
                <Image
                    src={backdrop}
                    alt=""
                    fill
                    priority
                    sizes="100vw"
                    className="pointer-events-none -z-10 object-cover opacity-50 blur-sm"
                />
            )}
            <div className="pointer-events-none absolute inset-0 -z-10 bg-background/85" />

            <div className="container-app py-6">
                <Link href="/movies" className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground">
                    <ChevronRight className="size-4 rotate-180" />
                    Back to Movies
                </Link>

                <section className="mt-6 grid gap-8 lg:grid-cols-[minmax(280px,410px)_1fr_445px]">
                    <div>
                        <div className="relative aspect-[2/3] overflow-hidden rounded-md border border-white/10 bg-white/5">
                            {poster && (
                                <Image src={poster} alt={movie.title} fill priority sizes="410px" className="object-cover" />
                            )}
                            <button
                                type="button"
                                aria-label="Play trailer"
                                className="absolute left-1/2 top-1/2 inline-flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-brand/80"
                            >
                                <Play className="ml-1 size-7 fill-current" />
                            </button>
                        </div>

                        <div className="mt-4 grid grid-cols-[92px_repeat(4,1fr)] gap-2">
                            <button className="inline-flex items-center justify-center gap-2 rounded-md border border-brand bg-brand/10 text-sm font-semibold text-brand-text">
                                <Play className="size-4 fill-current" />
                                Trailer
                            </button>
                            {[movie, ...recommendations.slice(0, 3)].map((item) => {
                                const image = tmdbImageUrl(item.backdrop_path || item.poster_path, "w300")
                                return (
                                    <div key={item.id} className="relative h-12 overflow-hidden rounded-md border border-white/10 bg-white/5">
                                        {image && <Image src={image} alt="" fill sizes="90px" className="object-cover" />}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="flex flex-col justify-center py-2">
                        <span className="pill-badge">Now in Cinemas</span>
                        <h1 className="mt-4 max-w-2xl text-4xl font-extrabold leading-tight tracking-normal sm:text-5xl">
                            {movie.title}
                        </h1>

                        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-foreground/75">
                            <span className="inline-flex items-center gap-1 font-semibold text-amber-400">
                                <Star className="size-4 fill-current" />
                                {movie.vote_average.toFixed(1)}/10
                            </span>
                            <span>•</span>
                            <span>{formatRuntime(movie.runtime)}</span>
                            <span>•</span>
                            <span>{movie.release_date ? new Date(movie.release_date).getFullYear() : "Year unavailable"}</span>
                            {genres.length > 0 && (
                                <>
                                    <span>•</span>
                                    <span>{genres.join(", ")}</span>
                                </>
                            )}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-3 text-sm text-foreground/75">
                            <span className="rounded-md border border-white/10 bg-white/10 px-3 py-1">PG-13</span>
                            <span className="py-1">{languages.slice(0, 4).join(", ") || "Language unavailable"}</span>
                        </div>

                        <p className="mt-6 max-w-2xl text-base leading-7 text-foreground/75">{movie.overview}</p>

                        <dl className="mt-7 grid max-w-2xl gap-3 text-sm sm:grid-cols-[86px_1fr]">
                            <dt className="text-foreground/60">Director</dt>
                            <dd>{director}</dd>
                            <dt className="text-foreground/60">Writers</dt>
                            <dd>{writers}</dd>
                            <dt className="text-foreground/60">Stars</dt>
                            <dd>{stars}</dd>
                        </dl>

                        <div className="mt-8 grid max-w-sm grid-cols-3 divide-x divide-white/10 text-sm text-foreground/70">
                            <WatchlistButton movieId={movie.id} title={movie.title} poster={poster} />
                            {[
                                { icon: Heart, label: "Like" },
                                { icon: Share2, label: "Share" },
                            ].map((action) => (
                                <button key={action.label} type="button" className="flex flex-col items-center gap-2 transition-colors hover:text-brand-text">
                                    <action.icon className="size-6" />
                                    <span>{action.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <aside className="h-fit rounded-md border border-white/10 bg-black/20 p-6 shadow-2xl backdrop-blur-md">
                        <h2 className="text-2xl font-bold">Book Your Tickets</h2>

                        <DateSelector />

                        <BookingPanel movie={movieSummary} />
                    </aside>
                </section>

                <section className="mt-8 grid gap-8 rounded-md border border-white/10 bg-black/15 p-6 backdrop-blur-md lg:grid-cols-[1.3fr_0.8fr_1.4fr]">
                    <div>
                        <h2 className="text-lg font-bold">About the Movie</h2>
                        <p className="mt-4 text-sm leading-7 text-foreground/70">{movie.overview}</p>
                    </div>

                    <div className="border-white/10 lg:border-l lg:pl-8">
                        <h2 className="text-lg font-bold">Movie Info</h2>
                        <dl className="mt-4 grid grid-cols-[120px_1fr] gap-y-3 text-sm">
                            <dt className="text-foreground/60">Release Date</dt>
                            <dd>{formatDate(movie.release_date)}</dd>
                            <dt className="text-foreground/60">Runtime</dt>
                            <dd>{formatRuntime(movie.runtime)}</dd>
                            <dt className="text-foreground/60">Language</dt>
                            <dd>{languages.slice(0, 4).join(", ") || "Unavailable"}</dd>
                            <dt className="text-foreground/60">Budget</dt>
                            <dd>{formatMoney(movie.budget)}</dd>
                            <dt className="text-foreground/60">Box Office</dt>
                            <dd>{formatMoney(movie.revenue)}</dd>
                        </dl>
                    </div>

                    <div className="border-white/10 lg:border-l lg:pl-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold">You May Also Like</h2>
                            <Link href="/movies" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-text hover:text-foreground">
                                View All
                                <ChevronRight className="size-4" />
                            </Link>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                            {recommendations.map((item) => {
                                const image = tmdbImageUrl(item.poster_path, "w300")
                                return (
                                    <Link key={item.id} href={movieHref(item)} className="group block">
                                        <div className="relative aspect-[2/3] overflow-hidden rounded-md border border-white/10 bg-white/5">
                                            {image && <Image src={image} alt={item.title} fill sizes="150px" className="object-cover transition-transform group-hover:scale-105" />}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                            <span className="absolute left-1/2 top-1/2 inline-flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white bg-black/30 text-white backdrop-blur-sm">
                                                <Play className="ml-0.5 size-4 fill-current" />
                                            </span>
                                            <div className="absolute inset-x-0 bottom-0 p-3">
                                                <h3 className="line-clamp-2 text-xs font-bold">{item.title}</h3>
                                                <span className="mt-1 inline-flex items-center gap-1 text-xs text-amber-400">
                                                    <Star className="size-3 fill-current" />
                                                    {item.vote_average.toFixed(1)}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
