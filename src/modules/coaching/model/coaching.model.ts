
import { BOOKING_MODE, BookingMode, COACHING_DURATION, CoachingDuration } from "@/constants/constant.values.ts/booking.constant";
import mongoose, { Document, Schema } from "mongoose";


export interface ICoaching extends Document {
    serviceId:mongoose.Types.ObjectId,
    serviceType:string;
    description: string;
    durationMinutes: CoachingDuration;
    price: number;
    bookingMode: BookingMode;
    isActive:boolean
}

const CoachingSchema = new Schema<ICoaching>(
    {
    serviceType: {
    type: String,
    required: true,
},

description: {
    type: String,
    trim: true,
    default: "",
    maxLength:500,
},

durationMinutes: {
    type: Number,
    enum: Object.values(COACHING_DURATION),
    required: true,
},

price: {
    type: Number,
    required: true,
    min: 0,
},

bookingMode: {
    type: String,
    enum: Object.values(BOOKING_MODE),
    required: true,
},

isActive: {
    type: Boolean,
    default:true,
},
    },{timestamps:true}
)

export const CoachingModel = mongoose.model<ICoaching>("Coaching",CoachingSchema)