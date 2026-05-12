import mongoose from 'mongoose';
import { CategoryModel } from './src/models/category.model';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI not defined");
    process.exit(1);
  }
  console.log("Connecting to", uri);
  await mongoose.connect(uri);
  console.log("Connected.");

  const categories = await CategoryModel.find().exec();
  console.log("Found", categories.length, "categories:");
  console.log(JSON.stringify(categories, null, 2));

  await mongoose.disconnect();
}

main().catch(console.error);
