export type TheatreShowtimes = {
    name: string
    place: string
    distance: string
    screens: { type: string; times: string[] }[]
}

export const THEATRE_SHOWTIMES: TheatreShowtimes[] = [
    {
        name: "PVR ICON",
        place: "Phoenix Marketcity, Kurla",
        distance: "4.2 km",
        screens: [
            { type: "IMAX 2D", times: ["10:15 AM", "1:30 PM", "4:45 PM", "7:30 PM", "10:15 PM"] },
            { type: "4DX", times: ["11:00 AM", "2:15 PM", "5:30 PM", "8:45 PM"] },
        ],
    },
    {
        name: "INOX",
        place: "R City Mall, Ghatkopar",
        distance: "5.1 km",
        screens: [
            { type: "IMAX 2D", times: ["10:30 AM", "1:45 PM", "5:00 PM", "8:15 PM"] },
            { type: "LASER 2D", times: ["11:15 AM", "2:30 PM", "6:00 PM", "9:15 PM"] },
        ],
    },
    {
        name: "Cinepolis",
        place: "BKC, Bandra East",
        distance: "7.2 km",
        screens: [
            { type: "2D", times: ["10:00 AM", "1:15 PM", "4:30 PM", "7:45 PM"] },
            { type: "3D", times: ["11:30 AM", "2:45 PM", "6:00 PM", "9:30 PM"] },
        ],
    },
    {
        name: "PVR Premier",
        place: "Lodha World Mall, Lower Parel",
        distance: "8.6 km",
        screens: [{ type: "2D", times: ["11:00 AM", "2:30 PM", "6:15 PM", "9:45 PM"] }],
    },
]

const WEEKDAY_FORMATTER = new Intl.DateTimeFormat("en", { weekday: "short" })
const MONTH_FORMATTER = new Intl.DateTimeFormat("en", { month: "short" })

export type ShowDate = {
    key: string
    day: string
    date: string
    month: string
}

export function getUpcomingShowDates(count = 5): ShowDate[] {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return Array.from({ length: count }, (_, index) => {
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
