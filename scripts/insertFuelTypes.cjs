const mongoose = require("mongoose");

const MONGO_URI = "mongodb://localhost:27017/wheelio";

const fuelTypeSchema = new mongoose.Schema(
  {
    name: String,
  },
  { timestamps: true }
);

const FuelType = mongoose.model("fueltypes", fuelTypeSchema);

async function insertFuelTypes() {
  try {
    await mongoose.connect(MONGO_URI);
    await FuelType.insertMany([
      { name: "LPG" },
      { name: "Hybrid" }
    ]);
  } catch (err) {
    console.error("❌ Failed to insert fuel types:", err);
  } finally {
    await mongoose.disconnect();
  }
}

insertFuelTypes();
