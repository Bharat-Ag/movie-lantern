export type BookingMovieSummary = {
    movieId: number
    title: string
    poster: string | null
    rating: number
    runtimeLabel: string
    language: string
    genres: string[]
}

export type BookingSelection = {
    theatreIndex: number
    dateKey: string
    time: string | null
}

export type SelectedAddOn = {
    id: string
    name: string
    price: number
    qty: number
}
