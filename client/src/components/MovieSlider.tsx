"use client"
import Image from 'next/image'
import Link from 'next/link'
import React, { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import type { EmblaOptionsType, EmblaCarouselType } from 'embla-carousel'
import { ChevronRight, ChevronLeft, Star, Heart } from 'lucide-react'
import type { MovieSliderProps } from '@/lib/movie'

const MovieSlider: React.FC<MovieSliderProps> = ({
    title = 'Now Showing',
    movies,
    viewAllHref,
    onViewAll,
    onMovieClick,
}) => {
    const options: EmblaOptionsType = {
        align: 'start',
        dragFree: true,
        containScroll: 'trimSnaps',
        slidesToScroll: 'auto',
    }

    const [emblaRef, emblaApi] = useEmblaCarousel(options)
    const [prevBtnDisabled, setPrevBtnDisabled] = useState<boolean>(true)
    const [nextBtnDisabled, setNextBtnDisabled] = useState<boolean>(true)
    const [favorites, setFavorites] = useState<number[]>([])

    const scrollPrev = useCallback((): void => {
        if (emblaApi) emblaApi.scrollPrev()
    }, [emblaApi])

    const scrollNext = useCallback((): void => {
        if (emblaApi) emblaApi.scrollNext()
    }, [emblaApi])

    const onSelect = useCallback((api: EmblaCarouselType): void => {
        setPrevBtnDisabled(!api.canScrollPrev())
        setNextBtnDisabled(!api.canScrollNext())
    }, [])

    useEffect(() => {
        if (!emblaApi) return

        let isSubscribed = true
        queueMicrotask(() => {
            if (isSubscribed) onSelect(emblaApi)
        })
        emblaApi.on('reInit', onSelect)
        emblaApi.on('select', onSelect)

        return () => {
            isSubscribed = false
            emblaApi.off('reInit', onSelect)
            emblaApi.off('select', onSelect)
        }
    }, [emblaApi, onSelect])

    const toggleFavorite = (id: number): void => {
        setFavorites((prev) =>
            prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
        )
    }

    if (movies.length === 0) return null

    return (
        <div className="container-app">
            <div className=" py-6 relative">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-white text-2xl font-bold">{title}</h2>
                    {viewAllHref ? (
                        <Link href={viewAllHref} className="view-all"
                        >
                            View All <ChevronRight size={16} className="translate-0.3" />
                        </Link>
                    ) : onViewAll ? (
                        <button
                            onClick={onViewAll}
                            className="view-all"
                        >
                            View All <ChevronRight size={16} className="translate-0.3" />
                        </button>
                    ) : null}
                </div>

                <div className="relative group">
                    <button
                        onClick={scrollPrev}
                        disabled={prevBtnDisabled}
                        aria-label="Previous slide"
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-neutral-800/90 hover:bg-neutral-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity -ml-3 disabled:opacity-0 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <div className="overflow-hidden" ref={emblaRef}>
                        <div className="flex gap-4">
                            {movies.map((movie) => (
                                <div key={movie.id}
                                    className="shrink-0 w-[calc((100%-6*16px)/7)] cursor-pointer group/card bg-[#1a1a1a] rounded-md "
                                    onClick={(e) =>{
                                         onMovieClick?.(movie)
                                    }}
                                >
                                    <Link href={`/movies/${movie?.title.split(' ').join('-').toLocaleLowerCase()}/${movie.id}`}>
                                        <div className="relative rounded-lg overflow-hidden aspect-2/3 bg-neutral-900">
                                            <Image
                                                src={movie.poster}
                                                alt={movie.title}
                                                fill
                                                sizes="(min-width: 768px) 200px, 180px"
                                                className="object-cover transition-transform duration-300 group-hover/card:scale-105"
                                            />
                                            {/* Rating badge */}
                                            <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1">
                                                <Star size={12} className="text-yellow-400 fill-yellow-400" />
                                                <span className="text-white text-xs font-semibold">
                                                    {movie.rating.toFixed(1)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-start p-3">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-white font-semibold truncate">
                                                    {movie.title}
                                                </h3>
                                                <p className="text-neutral-400 text-sm mt-0.5 truncate">
                                                    {movie.genres.join(' • ')}
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    toggleFavorite(movie.id)
                                                }}
                                                aria-label="Toggle favorite"
                                                className="text-neutral-400 hover:text-red-500 transition-colors ml-2 shrink-0"
                                            >
                                                <Heart
                                                    size={18}
                                                    className={
                                                        favorites.includes(movie.id)
                                                            ? 'fill-red-500 text-red-500'
                                                            : ''
                                                    }
                                                />
                                            </button>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={scrollNext}
                        disabled={nextBtnDisabled}
                        aria-label="Next slide"
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-neutral-800/90 hover:bg-neutral-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity -mr-3 disabled:opacity-0 disabled:cursor-not-allowed"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default MovieSlider
