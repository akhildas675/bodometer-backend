import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "../config/db";
import { OnboardingSectionModel } from "../models/onboarding-section.model";

const sectionSeed = [
  { key: "fitness",      title: "Fitness Profile",    order: 1, isActive: true },
  { key: "workout_time", title: "Workout Preference", order: 2, isActive: true },
  { key: "workout",      title: "Workout History",    order: 3, isActive: true },
  { key: "medical",      title: "Health Details",     order: 4, isActive: true },
  { key: "daily_habits", title: "Daily Habits",       order: 5, isActive: true },
];

const seedSections = async () => {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.error("MONGO_URI is not defined in environment variables.");
    process.exit(1);
  }

  await connectDB(MONGO_URI);

  for (const section of sectionSeed) {
    await OnboardingSectionModel.findOneAndUpdate(
      { key: section.key },        // find by key
      { $set: section },           // update or insert
      { upsert: true, new: true }  // create if not exists
    );
  }

  console.log("Sections seeded successfully");
  process.exit(0);
};

seedSections().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
