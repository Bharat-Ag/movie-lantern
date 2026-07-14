"use client"

import { useState } from "react"
import { MapPin } from "lucide-react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const CITIES = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kolkata",
  "Ahmedabad",
]

export function CitySelector() {
  const [city, setCity] = useState("Mumbai")

  return (
    <Select value={city} onValueChange={(value) => setCity(value as string)}>
      <SelectTrigger
        size="sm"
        className="hidden h-auto w-fit items-center gap-1.5 rounded-full border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-foreground/85 hover:bg-white/10 sm:inline-flex data-[size=sm]:h-auto"
      >
        <MapPin className="size-4 text-brand-text" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {CITIES.map((c) => (
          <SelectItem key={c} value={c}>
            {c}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
