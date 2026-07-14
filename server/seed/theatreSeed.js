import "dotenv/config"
import mongoose from "mongoose"

import connectDB from "../configs/db.js"
import Theatre from "../models/Theatre.js"

const theatres = [
    {
        name: "INOX",
        address: "R City Mall, Ghatkopar West",
        city: "Mumbai",
        location: { type: "Point", coordinates: [72.9081, 19.0857] },
        totalScreens: 7,
        amenities: ["Recliner Seats", "Dolby Atmos", "Food Court"],
    },
    {
        name: "PVR ICON",
        address: "Phoenix Marketcity, Kurla West",
        city: "Mumbai",
        location: { type: "Point", coordinates: [72.8886, 19.0863] },
        totalScreens: 9,
        amenities: ["IMAX", "Recliner Seats", "Valet Parking"],
    },
    {
        name: "Cinepolis",
        address: "BKC, Bandra East",
        city: "Mumbai",
        location: { type: "Point", coordinates: [72.8656, 19.0663] },
        totalScreens: 6,
        amenities: ["4DX", "Dolby Atmos"],
    },
    {
        name: "PVR Select City Walk",
        address: "Select Citywalk Mall, Saket",
        city: "Delhi",
        location: { type: "Point", coordinates: [77.2185, 28.5286] },
        totalScreens: 8,
        amenities: ["IMAX", "Recliner Seats", "Food Court"],
    },
    {
        name: "INOX Nehru Place",
        address: "Nehru Place",
        city: "Delhi",
        location: { type: "Point", coordinates: [77.2507, 28.5494] },
        totalScreens: 5,
        amenities: ["Dolby Atmos"],
    },
    {
        name: "PVR Forum Mall",
        address: "Forum Mall, Koramangala",
        city: "Bangalore",
        location: { type: "Point", coordinates: [77.6101, 12.9345] },
        totalScreens: 7,
        amenities: ["Recliner Seats", "Dolby Atmos", "Food Court"],
    },
    {
        name: "Cinepolis Royal Meenakshi",
        address: "Royal Meenakshi Mall, Bannerghatta Road",
        city: "Bangalore",
        location: { type: "Point", coordinates: [77.5975, 12.8933] },
        totalScreens: 6,
        amenities: ["4DX", "Valet Parking"],
    },
    {
        name: "PVR Preston",
        address: "Preston Road, Secunderabad",
        city: "Hyderabad",
        location: { type: "Point", coordinates: [78.4867, 17.4399] },
        totalScreens: 6,
        amenities: ["IMAX", "Recliner Seats"],
    },
    {
        name: "AAA Cinemas",
        address: "Ameerpet",
        city: "Hyderabad",
        location: { type: "Point", coordinates: [78.4483, 17.4374] },
        totalScreens: 4,
        amenities: ["Dolby Atmos", "Food Court"],
    },
    {
        name: "Sathyam Cinemas",
        address: "Thiruvanmiyur",
        city: "Chennai",
        location: { type: "Point", coordinates: [80.2601, 12.9833] },
        totalScreens: 5,
        amenities: ["Dolby Atmos", "Food Court"],
    },
    {
        name: "PVR Ampa Skywalk",
        address: "Ampa Skywalk Mall, Aminjikarai",
        city: "Chennai",
        location: { type: "Point", coordinates: [80.2201, 13.0732] },
        totalScreens: 6,
        amenities: ["Recliner Seats", "IMAX"],
    },
    {
        name: "Cinepolis Seasons Mall",
        address: "Seasons Mall, Magarpatta",
        city: "Pune",
        location: { type: "Point", coordinates: [73.9297, 18.5158] },
        totalScreens: 7,
        amenities: ["4DX", "Recliner Seats"],
    },
    {
        name: "INOX Bund Garden",
        address: "Bund Garden Road",
        city: "Pune",
        location: { type: "Point", coordinates: [73.8827, 18.5362] },
        totalScreens: 5,
        amenities: ["Dolby Atmos"],
    },
    {
        name: "INOX South City",
        address: "South City Mall, Prince Anwar Shah Road",
        city: "Kolkata",
        location: { type: "Point", coordinates: [88.3639, 22.5024] },
        totalScreens: 6,
        amenities: ["Recliner Seats", "Food Court"],
    },
    {
        name: "PVR Acropolis",
        address: "Acropolis Mall, Rajdanga",
        city: "Kolkata",
        location: { type: "Point", coordinates: [88.4033, 22.5145] },
        totalScreens: 5,
        amenities: ["Dolby Atmos", "Valet Parking"],
    },
]

const seedTheatres = async () => {
    await connectDB()

    await Theatre.deleteMany({})
    await Theatre.insertMany(theatres)

    console.log(`Seeded ${theatres.length} theatres`)
    await mongoose.connection.close()
    process.exit(0)
}

seedTheatres().catch((error) => {
    console.error("Seeding failed:", error.message)
    process.exit(1)
})
