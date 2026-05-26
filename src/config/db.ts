import mongoose from "mongoose";

export async function connectDB(mongoUri:string){
    try {
        await mongoose.connect(mongoUri);
        console.log('Mongoose Connected!')
    } catch (error: unknown) {
        console.error("MongoDB connection error:",error)
    }
}