import app from './app'

import dotenv from "dotenv";

import { connectDB } from './config/db';

dotenv.config();

const PORT = process.env.PORT || 5000;

const MONGO_URI = "mongodb://127.0.0.1:27017/bodometer";

async function start() {
  await connectDB(MONGO_URI)
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}


start()