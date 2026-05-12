import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { TrainerProfileModel } from "./models/trainer-profile.model";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function test() {
  try {
    console.log("Connecting to DB...");
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("Connected.");

    const sampleData = {
      userId: new mongoose.Types.ObjectId(),
      experienceInYears: 3,
      coverPhoto: "http://example.com/cover.png",
      certifications: ["http://example.com/cert.pdf"],
      bio: "Testing bio here sample long text.",
      specializations: [new mongoose.Types.ObjectId()],
      verificationStatus: "pending",
      applyCount: 1,
    };

    console.log("Attempting document insert...");
    const profile = await TrainerProfileModel.create(sampleData);
    console.log("Insert success:", profile._id);
    
    // Cleanup
    await TrainerProfileModel.deleteOne({ _id: profile._id });
    console.log("Test successful. No schema constraint errors detected.");

  } catch (error: any) {
    console.error("DIAGNOSIS CAUGHT ERROR:");
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
}

test();
