import mongoose from "mongoose";
import csv from "csvtojson";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import City from "./core/models/city.js";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use environment variable for MongoDB URI or fallback to localhost
const MONGO_URI = process.env.MONGODB_URL || "mongodb://localhost:27017/wheelio";
const CSV_FILE = path.join(__dirname, "cities.csv");

async function importCities() {
  try {
    // Set mongoose options to suppress deprecation warning
    mongoose.set("strictQuery", false);
    
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");
    
    const cities = await csv().fromFile(CSV_FILE);
    console.log(`Found ${cities.length} cities to import`);

    const cityDocs = cities.map(city => ({
      name: city.city_ascii,
      lat: parseFloat(city.lat),
      lng: parseFloat(city.lng),
      location: {
        type: "Point",
        coordinates: [parseFloat(city.lng), parseFloat(city.lat)],
      },
    }));

    // Clear existing cities first (optional)
    await City.deleteMany({});
    console.log("Cleared existing cities");

    await City.insertMany(cityDocs);
    console.log(`Successfully imported ${cityDocs.length} cities!`);
    process.exit(0);
  } catch (err) {
    console.error("Error importing cities:", err);
    process.exit(1);
  }
}

importCities();
