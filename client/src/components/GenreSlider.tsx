"use client"

import Image from "next/image"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import type { EmblaCarouselType, EmblaOptionsType } from "embla-carousel"
import {
    ChevronLeft,
    ChevronRight,
    Clapperboard,
    Compass,
    Drama,
    Film,
    Flame,
    Gavel,
    Ghost,
    Heart,
    Landmark,
    Laugh,
    type LucideIcon,
    MountainSnow,
    Music,
    Rocket,
    Search,
    Skull,
    Sword,
    Swords,
    Tv,
    Users,
    Wand2,
} from "lucide-react"

import { TMDB_GENRES } from "@/lib/movie"

const GENRE_ICONS: Record<string, LucideIcon> = {
    Action: Flame,
    Adventure: Compass,
    Animation: Clapperboard,
    Comedy: Laugh,
    Crime: Gavel,
    Documentary: Film,
    Drama: Drama,
    Family: Users,
    Fantasy: Wand2,
    History: Landmark,
    Horror: Ghost,
    Music: Music,
    Mystery: Search,
    Romance: Heart,
    "Sci-Fi": Rocket,
    Thriller: Skull,
}

const GENRES = Object.entries(TMDB_GENRES).map(([id, name]) => ({
    id: Number(id),
    name,
    icon: GENRE_ICONS[name] ?? Sword,
}))

type GenreSliderProps = {
    thumbnails?: Record<number, string>
}

export default function GenreSlider({ thumbnails }: GenreSliderProps) {
    const options: EmblaOptionsType = {
        align: "start",
        dragFree: true,
        containScroll: "trimSnaps",
        slidesToScroll: "auto",
    }

    const [emblaRef, emblaApi] = useEmblaCarousel(options)
    const [prevBtnDisabled, setPrevBtnDisabled] = useState(true)
    const [nextBtnDisabled, setNextBtnDisabled] = useState(true)

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

    const onSelect = useCallback((api: EmblaCarouselType) => {
        setPrevBtnDisabled(!api.canScrollPrev())
        setNextBtnDisabled(!api.canScrollNext())
    }, [])

    useEffect(() => {
        if (!emblaApi) return

        let isSubscribed = true
        queueMicrotask(() => {
            if (isSubscribed) onSelect(emblaApi)
        })
        emblaApi.on("reInit", onSelect)
        emblaApi.on("select", onSelect)

        return () => {
            isSubscribed = false
            emblaApi.off("reInit", onSelect)
            emblaApi.off("select", onSelect)
        }
    }, [emblaApi, onSelect])

    return (
        <div className="container-app">
            <div className="relative py-6">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">Browse by Genre</h2>
                </div>

                <div className="group relative">
                    <button
                        onClick={scrollPrev}
                        disabled={prevBtnDisabled}
                        aria-label="Previous genres"
                        className="absolute left-0 top-1/2 z-10 -ml-3 -translate-y-1/2 rounded-full bg-neutral-800/90 p-2 text-white opacity-0 transition-opacity hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-0 group-hover:opacity-100"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <div className="overflow-hidden" ref={emblaRef}>
                        <div className="flex gap-4">
                            {GENRES.map((genre) => {
                                const thumbnail = thumbnails?.[genre.id]

                                return (
                                    <Link
                                        key={genre.id}
                                        href={`/movies?genre=${encodeURIComponent(genre.name)}`}
                                        className="group/card relative flex aspect-3/4 w-35 shrink-0 flex-col items-center justify-center gap-3 overflow-hidden rounded-md border border-white/10 bg-[#1a1a1a] text-center transition-colors hover:border-brand/60"
                                    >
                                        {thumbnail && (
                                            <>
                                                <Image
                                                    src={thumbnail}
                                                    alt=""
                                                    fill
                                                    sizes="140px"
                                                    className="object-cover opacity-50 transition-opacity group-hover/card:opacity-70"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
                                            </>
                                        )}
                                        <span className="relative flex size-12 items-center justify-center rounded-full border-2 border-dashed border-brand-text/50 text-brand-text transition-transform group-hover/card:scale-105">
                                            <genre.icon className="size-6" />
                                        </span>
                                        <span className="relative text-sm font-semibold text-white">{genre.name}</span>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>

                    <button
                        onClick={scrollNext}
                        disabled={nextBtnDisabled}
                        aria-label="Next genres"
                        className="absolute right-0 top-1/2 z-10 -mr-3 -translate-y-1/2 rounded-full bg-neutral-800/90 p-2 text-white opacity-0 transition-opacity hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-0 group-hover:opacity-100"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    )
}
