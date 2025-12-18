import dotenv from "dotenv";
dotenv.config();
import app from './app'


import { connectDB } from './config/db';


console.log("ACCESS:", process.env.JWT_ACCESS_SECRET);
console.log("REFRESH:", process.env.JWT_REFRESH_SECRET);


const PORT = process.env.PORT || 5000;

const MONGO_URI = "mongodb://127.0.0.1:27017/bodometer";

async function start() {
  await connectDB(MONGO_URI)
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}


start()