import { CupSoda, Popcorn, UtensilsCrossed, type LucideIcon } from "lucide-react"

export type AddOn = {
    id: string
    name: string
    description: string
    price: number
    icon: LucideIcon
    bestSeller?: boolean
}

export const ADD_ONS: AddOn[] = [
    {
        id: "popcorn-large",
        name: "Popcorn (Large)",
        description: "Big on crunch, bigger on flavor.",
        price: 250,
        icon: Popcorn,
    },
    {
        id: "coke-2",
        name: "Coca Cola (2)",
        description: "Chill. Sip. Enjoy the show.",
        price: 180,
        icon: CupSoda,
    },
    {
        id: "nachos",
        name: "Nachos with Cheese",
        description: "Crispy nachos with cheesy dip.",
        price: 220,
        icon: UtensilsCrossed,
    },
    {
        id: "combo",
        name: "Movie Combo",
        description: "1 Large Popcorn + 2 Drinks",
        price: 400,
        icon: Popcorn,
        bestSeller: true,
    },
]
