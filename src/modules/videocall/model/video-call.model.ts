import mongoose, { Document } from "mongoose";
import { VIDEO_CALL_STATUS, VIDEO_SESSION_TERMINATION_REASON, VideoCallSessionStatus, VideoSessionTerminationReason } from "../constant/video-call.constant";


export interface IVideoSession extends Document{
    bookingId:mongoose.Types.ObjectId;
    trainerId:mongoose.Types.ObjectId;
    userId:mongoose.Types.ObjectId;
    scheduleStartTime:Date;
    scheduleEndTime:Date;
    trainerStartRequestAt:Date,
    userAcceptAt:Date,
    trainerJoinedAt:Date,
    userJoinedAt:Date,
    actualStartTime:Date,
    actualEndTime:Date,
    trainerLeftAt:Date,
    userLeftAt:Date,
    status:VideoCallSessionStatus,
    terminationReason?:VideoSessionTerminationReason,
    createdAt?:Date,
    updatedAt?:Date,
}

const VideoSessionSchema = new mongoose.Schema<IVideoSession>({
    bookingId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Booking",
        required:true,
        unique:true,
        index:true,
    },

    trainerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        unique:true,
        index:true,
    },

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        unique:true,
        index:true,

    },

    scheduleStartTime:{
        type:Date,
        required:true,
        index:true,
    },
    scheduleEndTime:{
        type:Date,
        required:true,
        index:true,
    },

    trainerStartRequestAt:{
        type:Date,
        
    },

    userAcceptAt:{
        type:Date,
    },
    trainerJoinedAt:{
        type:Date,
    },
    userJoinedAt:{
        type:Date,
    },
    actualStartTime:{
        type:Date,
    },
    actualEndTime:{
        type:Date,
    },
    trainerLeftAt:{
        type:Date,
    },  
    userLeftAt:{
        type:Date,
    },
    status:{
        type:String,
        enum:Object.values(VIDEO_CALL_STATUS),
        default:VIDEO_CALL_STATUS.WAITING,
        required:true,
        index:true,

    },
    terminationReason:{
        type:String,
        enum:Object.values(VIDEO_SESSION_TERMINATION_REASON),
    }

    
    
},{
    timestamps:true,
})

VideoSessionSchema.index({
    trainerId:1,
    scheduleStartTime:1,
});


VideoSessionSchema.index({
    userId:1,
    scheduleStartTime:1,
});


export const VideoSessionModel = mongoose.model<IVideoSession>("VideoSession",VideoSessionSchema);

