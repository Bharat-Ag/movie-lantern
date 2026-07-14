"use client"

import { useCallback, useEffect, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import type { EmblaCarouselType, EmblaOptionsType } from "embla-carousel"
import { ChevronLeft, ChevronRight } from "lucide-react"

const WEEKDAY_FORMATTER = new Intl.DateTimeFormat("en", { weekday: "short" })
const MONTH_FORMATTER = new Intl.DateTimeFormat("en", { month: "short" })
const DAYS_IN_WEEK = 7
const DATES_PER_VIEW = 5

type BookingDate = {
    key: string
    day: string
    date: string
    month: string
}

function getBookingDates(): BookingDate[] {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return Array.from({ length: DAYS_IN_WEEK }, (_, index) => {
        const date = new Date(today)
        date.setDate(today.getDate() + index)

        return {
            key: date.toISOString(),
            day: WEEKDAY_FORMATTER.format(date),
            date: date.getDate().toString().padStart(2, "0"),
            month: MONTH_FORMATTER.format(date),
        }
    })
}

export function DateSelector() {
    const [dates] = useState<BookingDate[]>(getBookingDates)
    const [selectedIndex, setSelectedIndex] = useState(0)

    const options: EmblaOptionsType = {
        align: "start",
        containScroll: "trimSnaps",
        slidesToScroll: DATES_PER_VIEW,
    }
    const [emblaRef, emblaApi] = useEmblaCarousel(options)
    const [canScrollPrev, setCanScrollPrev] = useState(false)
    const [canScrollNext, setCanScrollNext] = useState(false)

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

    const onSelect = useCallback((api: EmblaCarouselType) => {
        setCanScrollPrev(api.canScrollPrev())
        setCanScrollNext(api.canScrollNext())
    }, [])

    useEffect(() => {
        if (!emblaApi) return
        onSelect(emblaApi)
        emblaApi.on("reInit", onSelect)
        emblaApi.on("select", onSelect)
        return () => {
            emblaApi.off("reInit", onSelect)
            emblaApi.off("select", onSelect)
        }
    }, [emblaApi, onSelect])

    return (
        <div>
            <h3 className="mt-6 text-base font-semibold">Select Date</h3>
            <div className="group relative mt-3">
                <div className="overflow-hidden" ref={emblaRef}>
                    <div className="-ml-3 flex">
                        {dates.map((date, index) => (
                            <div key={date.key} className="shrink-0 grow-0 basis-1/5 pl-3 select-none">
                                <button
                                    type="button"
                                    aria-pressed={index === selectedIndex}
                                    onClick={() => setSelectedIndex(index)}
                                    className={
                                        index === selectedIndex
                                            ? "w-full rounded-md bg-brand px-3 py-3 text-sm font-semibold text-primary-foreground"
                                            : "w-full rounded-md border border-white/10 bg-white/5 px-3 py-3 text-sm text-foreground/75 transition-colors hover:border-brand/60 hover:text-foreground"
                                    }
                                >
                                    <span className="block">{date.day}</span>
                                    <span className="block text-xl leading-6">{date.date}</span>
                                    <span className="block">{date.month}</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    type="button"
                    onClick={scrollPrev}
                    disabled={!canScrollPrev}
                    aria-label="Previous dates"
                    className="absolute left-0 top-1/2 -ml-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-neutral-800/90 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-neutral-700 disabled:pointer-events-none disabled:opacity-0"
                >
                    <ChevronLeft className="size-4" />
                </button>
                <button
                    type="button"
                    onClick={scrollNext}
                    disabled={!canScrollNext}
                    aria-label="Next dates"
                    className="absolute right-0 top-1/2 -mr-3 -translate-y-1/2 translate-x-1/2 rounded-full border border-white/10 bg-neutral-800/90 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-neutral-700 disabled:pointer-events-none disabled:opacity-0"
                >
                    <ChevronRight className="size-4" />
                </button>
            </div>
        </div>
    )
}
