import { Armchair, Popcorn, Tag, Ticket } from "lucide-react"

const features = [
    {
        icon: Ticket,
        title: "Easy Booking",
        description: "Book your tickets in just a few clicks",
    },
    {
        icon: Armchair,
        title: "Best Seats",
        description: "Choose from the best seats in the house",
    },
    {
        icon: Tag,
        title: "Exciting Offers",
        description: "Get exclusive deals and discounts",
    },
    {
        icon: Popcorn,
        title: "Food & Beverages",
        description: "Enjoy a wide range of snacks at your seat",
    },
]

type PropType = {
    className?: string
}

export default function HomeFlyer({ className }: PropType) {
    return (
        <div className={className}>
            <div className="container-app">
                <div className="flex flex-col divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/3 sm:flex-row sm:divide-x sm:divide-y-0">
                    {features.map((feature) => (
                        <div key={feature.title} className="flex flex-1 items-center gap-4 px-6 py-5">
                            <span className="flex size-14 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-brand-text/50 text-brand-text">
                                <feature.icon className="size-6" />
                            </span>
                            <span>
                                <span className="block font-semibold">{feature.title}</span>
                                <span className="mt-1 block text-sm text-foreground/60">{feature.description}</span>
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
