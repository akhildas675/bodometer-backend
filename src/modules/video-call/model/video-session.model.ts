import mongoose, {
  Document,
  Schema,
} from "mongoose";
import { VIDEO_SESSION_STATUS, VIDEO_SESSION_TERMINATION_REASON, VideoSessionStatus, VideoSessionTerminationReason } from "../constant/video-session.constant";


export interface IVideoSession extends Document {
  bookingId: mongoose.Types.ObjectId;

  trainerId: mongoose.Types.ObjectId;

  userId: mongoose.Types.ObjectId;

  scheduledStartTime: Date;

  scheduledEndTime: Date;

  trainerStartRequestedAt?: Date;

  userAcceptedAt?: Date;

  actualStartTime?: Date;

  actualEndTime?: Date;

  trainerJoinedAt?: Date;

  userJoinedAt?: Date;

  trainerLeftAt?: Date;

  userLeftAt?: Date;

  status: VideoSessionStatus;

  terminationReason?: VideoSessionTerminationReason;

  createdAt: Date;

  updatedAt: Date;
}

const VideoSessionSchema =
  new Schema<IVideoSession>(
    {
      bookingId: {
        type: Schema.Types.ObjectId,
        ref: "Booking",
        required: true,
        unique: true,
        index: true,
      },

      trainerId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      scheduledStartTime: {
        type: Date,
        required: true,
      },

      scheduledEndTime: {
        type: Date,
        required: true,
      },

      trainerStartRequestedAt: {
        type: Date,
      },

      userAcceptedAt: {
        type: Date,
      },

      terminationReason: {
        type: String,
        enum: Object.values(
          VIDEO_SESSION_TERMINATION_REASON,
        ),
      },

      actualStartTime: {
        type: Date,
      },

      actualEndTime: {
        type: Date,
      },

      trainerJoinedAt: {
        type: Date,
      },

      userJoinedAt: {
        type: Date,
      },

      trainerLeftAt: {
        type: Date,
      },

      userLeftAt: {
        type: Date,
      },


      status: {
        type: String,
        enum: Object.values(
          VIDEO_SESSION_STATUS,
        ),
        default: VIDEO_SESSION_STATUS.WAITING,
        required: true,
        index: true,
      },
    },
    {
      timestamps: true,
    },
  );

VideoSessionSchema.index({
  trainerId: 1,
  scheduledStartTime: 1,
});

VideoSessionSchema.index({
  userId: 1,
  scheduledStartTime: 1,
});

export const VideoSessionModel =
  mongoose.model<IVideoSession>(
    "VideoSession",
    VideoSessionSchema,
  );