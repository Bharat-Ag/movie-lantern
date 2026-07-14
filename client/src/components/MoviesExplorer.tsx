"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Grid3x3,
    Heart,
    List,
    Search,
    SlidersHorizontal,
    Star,
    X,
} from "lucide-react"

import { LANGUAGES, TMDB_GENRES } from "@/lib/movie"
import { tmdbImageUrl, type TmdbMovie } from "@/lib/tmdb"

const FILTER_DEBOUNCE_MS = 400

type SortOption = { value: string; label: string }

const SORT_OPTIONS: SortOption[] = [
    { value: "popularity.desc", label: "Popularity" },
    { value: "vote_average.desc", label: "Rating: High to Low" },
    { value: "primary_release_date.desc", label: "Newest First" },
    { value: "primary_release_date.asc", label: "Oldest First" },
    { value: "original_title.asc", label: "Title: A-Z" },
]

const RATING_OPTIONS = [4, 3, 2, 1]
const MIN_YEAR = 1960
const MAX_YEAR = new Date().getFullYear() + 1
const GENRE_ENTRIES = Object.entries(TMDB_GENRES).map(([id, name]) => ({ id: Number(id), name }))
const VISIBLE_GENRE_COUNT = 8

type Filters = {
    genres: string[]
    language: string
    yearFrom: number
    yearTo: number
    rating: number | null
    sort: string
    q: string
}

const DEFAULT_FILTERS: Filters = {
    genres: [],
    language: "",
    yearFrom: MIN_YEAR,
    yearTo: MAX_YEAR,
    rating: null,
    sort: SORT_OPTIONS[0].value,
    q: "",
}

function filtersFromSearchParams(params: URLSearchParams): Filters {
    return {
        genres: params.get("genre")?.split(",").filter(Boolean) ?? [],
        language: params.get("language") ?? "",
        yearFrom: Number(params.get("yearFrom")) || MIN_YEAR,
        yearTo: Number(params.get("yearTo")) || MAX_YEAR,
        rating: params.get("rating") ? Number(params.get("rating")) : null,
        sort: params.get("sort") ?? SORT_OPTIONS[0].value,
        q: params.get("q") ?? "",
    }
}

function filtersToSearchParams(filters: Filters): URLSearchParams {
    const params = new URLSearchParams()
    if (filters.genres.length > 0) params.set("genre", filters.genres.join(","))
    if (filters.language) params.set("language", filters.language)
    if (filters.yearFrom !== MIN_YEAR) params.set("yearFrom", String(filters.yearFrom))
    if (filters.yearTo !== MAX_YEAR) params.set("yearTo", String(filters.yearTo))
    if (filters.rating) params.set("rating", String(filters.rating))
    if (filters.sort !== SORT_OPTIONS[0].value) params.set("sort", filters.sort)
    if (filters.q) params.set("q", filters.q)
    return params
}

function countActiveFilters(filters: Filters): number {
    let count = 0
    count += filters.genres.length
    if (filters.language) count += 1
    if (filters.yearFrom !== MIN_YEAR || filters.yearTo !== MAX_YEAR) count += 1
    if (filters.rating) count += 1
    return count
}

function isUpcoming(releaseDate: string): boolean {
    if (!releaseDate) return false
    return new Date(releaseDate).getTime() > Date.now()
}

function movieHref(movie: TmdbMovie): string {
    const slug = movie.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    return `/movies/${slug}/${movie.id}`
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
    const delta = 1
    const rangeStart = Math.max(2, current - delta)
    const rangeEnd = Math.min(total - 1, current + delta)
    const pages: (number | "...")[] = [1]

    if (rangeStart > 2) pages.push("...")
    for (let page = rangeStart; page <= rangeEnd; page++) pages.push(page)
    if (rangeEnd < total - 1) pages.push("...")
    if (total > 1) pages.push(total)

    return pages
}

const languageDisplay = new Intl.DisplayNames(["en"], { type: "language" })

function languageName(code: string): string {
    if (!code) return "Unknown"
    try {
        return languageDisplay.of(code) ?? code.toUpperCase()
    } catch {
        return code.toUpperCase()
    }
}

type MoviesExplorerProps = {
    initialMovies: TmdbMovie[]
    initialTotalPages: number
    initialTotalResults: number
}

export default function MoviesExplorer({
    initialMovies,
    initialTotalPages,
    initialTotalResults,
}: MoviesExplorerProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [filters, setFilters] = useState<Filters>(() => filtersFromSearchParams(searchParams))
    const [searchInput, setSearchInput] = useState(filters.q)
    const [movies, setMovies] = useState<TmdbMovie[]>(initialMovies)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(initialTotalPages)
    const [totalResults, setTotalResults] = useState(initialTotalResults)
    const [view, setView] = useState<"grid" | "list">("grid")
    const [loading, setLoading] = useState(false)
    const [favorites, setFavorites] = useState<number[]>([])
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
    const [showAllGenres, setShowAllGenres] = useState(false)
    const [sortMenuOpen, setSortMenuOpen] = useState(false)

    const isFirstRender = useRef(true)
    const requestIdRef = useRef(0)

    const fetchMovies = useCallback(async (nextFilters: Filters, nextPage: number) => {
        const params = filtersToSearchParams(nextFilters)
        params.set("page", String(nextPage))
        const res = await fetch(`/api/movies?${params.toString()}`)
        if (!res.ok) throw new Error("Failed to load movies")
        return res.json() as Promise<{ results: TmdbMovie[]; total_pages: number; total_results: number }>
    }, [])

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false
            return
        }

        setLoading(true)
        const requestId = ++requestIdRef.current

        const timeout = setTimeout(() => {
            const params = filtersToSearchParams(filters)
            router.replace(params.toString() ? `${pathname}?${params.toString()}` : pathname, { scroll: false })

            fetchMovies(filters, 1)
                .then((data) => {
                    if (requestIdRef.current !== requestId) return
                    setMovies(data.results)
                    setPage(1)
                    setTotalPages(data.total_pages)
                    setTotalResults(data.total_results)
                })
                .catch(() => {
                    if (requestIdRef.current === requestId) setMovies([])
                })
                .finally(() => {
                    if (requestIdRef.current === requestId) setLoading(false)
                })
        }, FILTER_DEBOUNCE_MS)

        return () => clearTimeout(timeout)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters])

    const goToPage = useCallback(
        async (nextPage: number) => {
            setLoading(true)
            try {
                const data = await fetchMovies(filters, nextPage)
                setMovies(data.results)
                setPage(nextPage)
                setTotalPages(data.total_pages)
                setTotalResults(data.total_results)
                window.scrollTo({ top: 0, behavior: "smooth" })
            } catch {
                // keep current results on failure
            } finally {
                setLoading(false)
            }
        },
        [filters, fetchMovies]
    )

    const toggleGenre = (name: string) => {
        setFilters((prev) => ({
            ...prev,
            genres: prev.genres.includes(name)
                ? prev.genres.filter((genre) => genre !== name)
                : [...prev.genres, name],
        }))
    }

    const toggleLanguage = (code: string) => {
        setFilters((prev) => ({ ...prev, language: prev.language === code ? "" : code }))
    }

    const toggleRating = (value: number) => {
        setFilters((prev) => ({ ...prev, rating: prev.rating === value ? null : value }))
    }

    const setYearRange = (yearFrom: number, yearTo: number) => {
        setFilters((prev) => ({ ...prev, yearFrom, yearTo }))
    }

    const resetFilters = () => {
        setSearchInput("")
        setFilters(DEFAULT_FILTERS)
    }

    const submitSearch = (event: React.FormEvent) => {
        event.preventDefault()
        const trimmed = searchInput.trim()
        if (!trimmed) return
        setFilters((prev) => ({ ...prev, q: trimmed }))
    }

    const toggleFavorite = (id: number) => {
        setFavorites((prev) => (prev.includes(id) ? prev.filter((favorite) => favorite !== id) : [...prev, id]))
    }

    const activeFilterCount = useMemo(() => countActiveFilters(filters), [filters])
    const heroBackdrop = tmdbImageUrl(movies[0]?.backdrop_path ?? null, "original")
    const currentSortLabel = SORT_OPTIONS.find((option) => option.value === filters.sort)?.label ?? "Sort"
    const visibleGenres = showAllGenres ? GENRE_ENTRIES : GENRE_ENTRIES.slice(0, VISIBLE_GENRE_COUNT)

    const filterPanelProps = {
        filters,
        visibleGenres,
        showAllGenres,
        onToggleShowAllGenres: () => setShowAllGenres((prev) => !prev),
        onToggleGenre: toggleGenre,
        onToggleLanguage: toggleLanguage,
        onToggleRating: toggleRating,
        onYearChange: setYearRange,
        onReset: resetFilters,
    }

    return (
        <div>
            <section className="relative overflow-hidden border-b border-white/10">
                {heroBackdrop && (
                    <Image
                        src={heroBackdrop}
                        alt=""
                        fill
                        priority
                        sizes="100vw"
                        className="pointer-events-none -z-10 object-cover opacity-25"
                    />
                )}
                <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/90 to-background/60" />

                <div className="container-app py-12">
                    <span className="pill-badge">Explore All Movies</span>
                    <h1 className="mt-4 max-w-xl text-4xl font-extrabold leading-tight sm:text-5xl">
                        Every Story.
                        <br />
                        Every Emotion.
                    </h1>
                    <p className="mt-3 max-w-md text-foreground/65">
                        Explore the world of movies and find your next big experience.
                    </p>

                    <form onSubmit={submitSearch} className="relative mt-6 max-w-lg">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(event) => setSearchInput(event.target.value)}
                            placeholder="Search for movies, actors, genres..."
                            className="w-full rounded-full border border-white/10 bg-white/5 py-3 pl-5 pr-12 text-sm outline-none placeholder:text-foreground/40 focus:border-brand/60"
                        />
                        <button
                            type="submit"
                            aria-label="Search"
                            disabled={!searchInput.trim()}
                            className="absolute right-1.5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-brand text-white transition-colors hover:bg-brand/85 disabled:pointer-events-none disabled:opacity-40"
                        >
                            <Search className="size-4" />
                        </button>
                    </form>
                </div>
            </section>

            <div className="container-app py-8">
                <div className="mb-4 flex items-center gap-2 md:hidden">
                    <button
                        type="button"
                        onClick={() => setMobileFiltersOpen(true)}
                        className="relative inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold"
                    >
                        <SlidersHorizontal className="size-4" />
                        Filters
                        {activeFilterCount > 0 && (
                            <span className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>

                    <ViewToggle view={view} onChange={setView} className="ml-auto" />
                </div>

                <div className="grid gap-8 md:grid-cols-[260px_1fr]">
                    <aside className="hidden md:block">
                        <FilterPanel {...filterPanelProps} />
                    </aside>

                    <div>
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm text-foreground/65">
                                Showing <span className="font-semibold text-foreground">{totalResults.toLocaleString()}+</span> movies
                            </p>

                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setSortMenuOpen((prev) => !prev)}
                                        className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm"
                                    >
                                        Sort by: <span className="font-semibold">{currentSortLabel}</span>
                                        <ChevronDown className="size-4" />
                                    </button>
                                    {sortMenuOpen && (
                                        <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-md border border-white/10 bg-[#1a1a1a] p-1 shadow-xl">
                                            {SORT_OPTIONS.map((option) => (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    onClick={() => {
                                                        setFilters((prev) => ({ ...prev, sort: option.value }))
                                                        setSortMenuOpen(false)
                                                    }}
                                                    className={
                                                        option.value === filters.sort
                                                            ? "block w-full rounded-sm px-3 py-2 text-left text-sm font-semibold text-brand-text"
                                                            : "block w-full rounded-sm px-3 py-2 text-left text-sm text-foreground/75 hover:bg-white/5"
                                                    }
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <ViewToggle view={view} onChange={setView} className="hidden md:flex" />
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                                {Array.from({ length: 8 }).map((_, index) => (
                                    <div key={index} className="aspect-2/3 animate-pulse rounded-md bg-white/5" />
                                ))}
                            </div>
                        ) : movies.length === 0 ? (
                            <div className="rounded-md border border-white/10 bg-white/5 p-10 text-center text-foreground/65">
                                No movies match these filters. Try adjusting your search.
                            </div>
                        ) : view === "grid" ? (
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                                {movies.map((movie) => (
                                    <MovieCard
                                        key={movie.id}
                                        movie={movie}
                                        isFavorite={favorites.includes(movie.id)}
                                        onToggleFavorite={toggleFavorite}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {movies.map((movie) => (
                                    <MovieListRow
                                        key={movie.id}
                                        movie={movie}
                                        isFavorite={favorites.includes(movie.id)}
                                        onToggleFavorite={toggleFavorite}
                                    />
                                ))}
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => goToPage(page - 1)}
                                    disabled={page <= 1}
                                    className="rounded-md border border-white/10 bg-white/5 p-2 disabled:pointer-events-none disabled:opacity-40"
                                >
                                    <ChevronLeft className="size-4" />
                                </button>
                                {getPageNumbers(page, totalPages).map((item, index) =>
                                    item === "..." ? (
                                        <span key={`ellipsis-${index}`} className="px-1 text-foreground/40">
                                            ...
                                        </span>
                                    ) : (
                                        <button
                                            key={item}
                                            type="button"
                                            onClick={() => goToPage(item)}
                                            className={
                                                item === page
                                                    ? "size-9 rounded-md bg-brand text-sm font-semibold text-white"
                                                    : "size-9 rounded-md border border-white/10 bg-white/5 text-sm hover:border-brand/60 w-fit px-2"
                                            }
                                        >
                                            {item}
                                        </button>
                                    )
                                )}
                                <button
                                    type="button"
                                    onClick={() => goToPage(page + 1)}
                                    disabled={page >= totalPages}
                                    className="rounded-md border border-white/10 bg-white/5 p-2 disabled:pointer-events-none disabled:opacity-40"
                                >
                                    <ChevronRight className="size-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {mobileFiltersOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-black/70" onClick={() => setMobileFiltersOpen(false)} />
                    <div className="absolute inset-y-0 left-0 w-[85%] max-w-sm overflow-y-auto bg-background p-5">
                        <button
                            type="button"
                            onClick={() => setMobileFiltersOpen(false)}
                            aria-label="Close filters"
                            className="mb-2 ml-auto flex size-8 items-center justify-center rounded-full border border-white/10 bg-white/5"
                        >
                            <X className="size-4" />
                        </button>
                        <FilterPanel {...filterPanelProps} />
                        <button
                            type="button"
                            onClick={() => setMobileFiltersOpen(false)}
                            className="mt-6 w-full rounded-md bg-brand py-3 font-semibold text-white"
                        >
                            Show Results
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

function ViewToggle({
    view,
    onChange,
    className = "",
}: {
    view: "grid" | "list"
    onChange: (view: "grid" | "list") => void
    className?: string
}) {
    return (
        <div className={`items-center gap-1 rounded-md border border-white/10 bg-white/5 p-1 ${className}`}>
            <button
                type="button"
                onClick={() => onChange("grid")}
                aria-label="Grid view"
                className={view === "grid" ? "rounded-sm bg-brand p-1.5 text-white" : "rounded-sm p-1.5 text-foreground/60"}
            >
                <Grid3x3 className="size-4" />
            </button>
            <button
                type="button"
                onClick={() => onChange("list")}
                aria-label="List view"
                className={view === "list" ? "rounded-sm bg-brand p-1.5 text-white" : "rounded-sm p-1.5 text-foreground/60"}
            >
                <List className="size-4" />
            </button>
        </div>
    )
}

type FilterPanelProps = {
    filters: Filters
    visibleGenres: { id: number; name: string }[]
    showAllGenres: boolean
    onToggleShowAllGenres: () => void
    onToggleGenre: (name: string) => void
    onToggleLanguage: (code: string) => void
    onToggleRating: (value: number) => void
    onYearChange: (yearFrom: number, yearTo: number) => void
    onReset: () => void
}

function FilterPanel({
    filters,
    visibleGenres,
    showAllGenres,
    onToggleShowAllGenres,
    onToggleGenre,
    onToggleLanguage,
    onToggleRating,
    onYearChange,
    onReset,
}: FilterPanelProps) {
    return (
        <div className="space-y-7">
            <div className="flex items-center justify-between">
                <h2 className="text-base font-bold">Filters</h2>
                <button type="button" onClick={onReset} className="text-sm font-semibold text-brand-text hover:text-foreground">
                    Reset
                </button>
            </div>

            <div>
                <h3 className="text-sm font-semibold text-foreground/80">Categories</h3>
                <div className="mt-3 space-y-2">
                    {visibleGenres.map((genre) => (
                        <label key={genre.id} className="flex cursor-pointer items-center gap-2 text-sm text-foreground/75">
                            <input
                                type="checkbox"
                                checked={filters.genres.includes(genre.name)}
                                onChange={() => onToggleGenre(genre.name)}
                                className="size-4 rounded-sm border-white/20 bg-transparent accent-brand"
                            />
                            {genre.name}
                        </label>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={onToggleShowAllGenres}
                    className="mt-2 text-sm font-semibold text-brand-text hover:text-foreground"
                >
                    {showAllGenres ? "Show Less" : "Show More"}
                </button>
            </div>

            <div>
                <h3 className="text-sm font-semibold text-foreground/80">Language</h3>
                <div className="mt-3 space-y-2">
                    {LANGUAGES.map((language) => (
                        <label key={language.code} className="flex cursor-pointer items-center gap-2 text-sm text-foreground/75">
                            <input
                                type="checkbox"
                                checked={filters.language === language.code}
                                onChange={() => onToggleLanguage(language.code)}
                                className="size-4 rounded-sm border-white/20 bg-transparent accent-brand"
                            />
                            {language.name}
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-sm font-semibold text-foreground/80">Release Year</h3>
                <div className="mt-4 px-1">
                    <YearRangeSlider min={MIN_YEAR} max={MAX_YEAR} from={filters.yearFrom} to={filters.yearTo} onChange={onYearChange} />
                </div>
            </div>

            <div>
                <h3 className="text-sm font-semibold text-foreground/80">Ratings</h3>
                <div className="mt-3 space-y-2">
                    {RATING_OPTIONS.map((value) => (
                        <label key={value} className="flex cursor-pointer items-center gap-2 text-sm text-foreground/75">
                            <input
                                type="checkbox"
                                checked={filters.rating === value}
                                onChange={() => onToggleRating(value)}
                                className="size-4 rounded-sm border-white/20 bg-transparent accent-brand"
                            />
                            <span className="inline-flex items-center gap-1">
                                {value}
                                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                                &amp; above
                            </span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    )
}

function YearRangeSlider({
    min,
    max,
    from,
    to,
    onChange,
}: {
    min: number
    max: number
    from: number
    to: number
    onChange: (from: number, to: number) => void
}) {
    const fromPercent = ((from - min) / (max - min)) * 100
    const toPercent = ((to - min) / (max - min)) * 100

    return (
        <div>
            <div className="relative h-1.5 rounded-full bg-white/10">
                <div
                    className="absolute h-1.5 rounded-full bg-brand"
                    style={{ left: `${fromPercent}%`, right: `${100 - toPercent}%` }}
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={from}
                    onChange={(event) => onChange(Math.min(Number(event.target.value), to), to)}
                    className="range-thumb pointer-events-none absolute inset-0 w-full appearance-none bg-transparent"
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={to}
                    onChange={(event) => onChange(from, Math.max(Number(event.target.value), from))}
                    className="range-thumb pointer-events-none absolute inset-0 w-full appearance-none bg-transparent"
                />
            </div>
            <div className="mt-3 flex justify-between text-xs text-foreground/60">
                <span>{from}</span>
                <span>{to}</span>
            </div>
        </div>
    )
}

function MovieCard({
    movie,
    isFavorite,
    onToggleFavorite,
}: {
    movie: TmdbMovie
    isFavorite: boolean
    onToggleFavorite: (id: number) => void
}) {
    const poster = tmdbImageUrl(movie.poster_path, "w500")
    const genres = movie.genre_ids.map((id) => TMDB_GENRES[id]).filter(Boolean).slice(0, 2)
    const upcoming = isUpcoming(movie.release_date)

    return (
        <div className="group overflow-hidden rounded-md border border-white/10 bg-[#1a1a1a]">
            <Link href={movieHref(movie)} className="relative block aspect-2/3 bg-neutral-900">
                {poster && (
                    <Image
                        src={poster}
                        alt={movie.title}
                        fill
                        sizes="(min-width: 1024px) 220px, (min-width: 640px) 30vw, 45vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                )}
                <span
                    className={
                        upcoming
                            ? "pill-badge absolute left-2 top-2 px-2 py-0.5 text-[10px]"
                            : "absolute left-2 top-2 rounded-md bg-brand px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
                    }
                >
                    {upcoming ? "Upcoming" : "New Showing"}
                </span>
                <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md bg-black/70 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
                    <Star className="size-3 fill-amber-400 text-amber-400" />
                    {movie.vote_average.toFixed(1)}
                </span>
            </Link>
            <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                    <Link href={movieHref(movie)} className="min-w-0">
                        <h3 className="truncate text-sm font-semibold">{movie.title}</h3>
                    </Link>
                    <button
                        type="button"
                        onClick={() => onToggleFavorite(movie.id)}
                        aria-label="Toggle favorite"
                        className="shrink-0 text-foreground/50 transition-colors hover:text-brand-text"
                    >
                        <Heart size={16} className={isFavorite ? "fill-brand-text text-brand-text" : ""} />
                    </button>
                </div>
                <p className="mt-1 truncate text-xs text-foreground/55">
                    {languageName(movie.original_language)}
                    {genres.length > 0 ? ` • ${genres.join(", ")}` : ""}
                </p>
            </div>
        </div>
    )
}

function MovieListRow({
    movie,
    isFavorite,
    onToggleFavorite,
}: {
    movie: TmdbMovie
    isFavorite: boolean
    onToggleFavorite: (id: number) => void
}) {
    const poster = tmdbImageUrl(movie.poster_path, "w300")
    const genres = movie.genre_ids.map((id) => TMDB_GENRES[id]).filter(Boolean).slice(0, 3)
    const upcoming = isUpcoming(movie.release_date)

    return (
        <div className="flex gap-4 rounded-md border border-white/10 bg-[#1a1a1a] p-3">
            <Link href={movieHref(movie)} className="relative aspect-2/3 w-20 shrink-0 overflow-hidden rounded-md bg-neutral-900 sm:w-24">
                {poster && <Image src={poster} alt={movie.title} fill sizes="100px" className="object-cover" />}
            </Link>
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
                <div className="flex items-start justify-between gap-2">
                    <Link href={movieHref(movie)} className="min-w-0">
                        <h3 className="truncate font-semibold">{movie.title}</h3>
                    </Link>
                    <button
                        type="button"
                        onClick={() => onToggleFavorite(movie.id)}
                        aria-label="Toggle favorite"
                        className="shrink-0 text-foreground/50 transition-colors hover:text-brand-text"
                    >
                        <Heart size={18} className={isFavorite ? "fill-brand-text text-brand-text" : ""} />
                    </button>
                </div>
                <p className="truncate text-sm text-foreground/55">
                    {languageName(movie.original_language)}
                    {genres.length > 0 ? ` • ${genres.join(", ")}` : ""}
                </p>
                <span className="inline-flex w-fit items-center gap-2 text-xs">
                    <span
                        className={
                            upcoming
                                ? "pill-badge px-2 py-0.5"
                                : "rounded-md bg-brand px-2 py-0.5 font-semibold uppercase tracking-wide text-white"
                        }
                    >
                        {upcoming ? "Upcoming" : "New Showing"}
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-amber-400">
                        <Star className="size-3 fill-current" />
                        {movie.vote_average.toFixed(1)}
                    </span>
                </span>
            </div>
        </div>
    )
}
