"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Play, Ticket } from "lucide-react"

import { cn } from "@/lib/utils"
import { tmdbImageUrl, type TmdbMovie } from "@/lib/tmdb"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"

export function Hero({ movies }: { movies: TmdbMovie[] }) {
  const [api, setApi] = useState<CarouselApi>()
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (!api) return
    setActive(api.selectedScrollSnap())
    api.on("select", () => setActive(api.selectedScrollSnap()))
  }, [api])

  if (movies.length === 0) return null

  return (
    <section className="container-app pt-8 ">
      <Carousel
        setApi={setApi}
        opts={{ loop: true }}
        className="overflow-hidden rounded-3xl border border-1 border-white/5"
      >
        <CarouselContent className="-ml-0">
          {movies.map((movie) => (
            <CarouselItem key={movie.id} className="pl-0">
              <div className="relative h-[520px]">
                {movie.backdrop_path && (
                  <Image
                    src={tmdbImageUrl(movie.backdrop_path)!}
                    alt={movie.title}
                    fill
                    priority
                    className="object-cover"
                    sizes="100vw"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />

                <div className="relative flex h-full max-w-xl flex-col justify-center gap-4 px-8 sm:px-20 pl-12">
                  <span className="pill-badge">
                    Now in Cinemas
                  </span>
                  <h1 className="text-4xl font-extrabold uppercase leading-tight tracking-tight sm:text-5xl">
                    {movie.title}
                  </h1>
                  <p className="line-clamp-3 text-sm text-foreground/70 sm:text-base">
                    {movie.overview}
                  </p>
                  <div className="mt-2 flex items-center gap-4">
                    <button type="button" className="btn-primary">
                      <Ticket className="size-4" />
                      Book Tickets
                    </button>
                    <button type="button" className="btn-outline">
                      <Play className="size-4" />
                      Watch Trailer
                    </button>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <button
          type="button"
          aria-label="Previous movie"
          onClick={() => api?.scrollPrev()}
          className="carousel-arrow absolute left-4 top-1/2 -translate-y-1/2"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          type="button"
          aria-label="Next movie"
          onClick={() => api?.scrollNext()}
          className="carousel-arrow absolute right-4 top-1/2 -translate-y-1/2"
        >
          <ChevronRight className="size-5" />
        </button>

        <div className="absolute bottom-6 left-8 flex items-center gap-2 sm:left-[50%] sm:-translate-x-[50%]">
          {movies.map((movie, index) => (
            <button
              key={movie.id}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => api?.scrollTo(index)}
              className={cn(
                "carousel-dot",
                index === active && "carousel-dot-active"
              )}
            />
          ))}
        </div>
      </Carousel>
    </section>
  )
}
