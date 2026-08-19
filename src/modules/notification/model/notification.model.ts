import mongoose, { Document, Schema } from "mongoose";

import {
    NOTIFICATION_ENTITY_TYPE,
    NOTIFICATION_TYPE,
    NotificationEntityType,
    NotificationType,
} from "../constant/notification.constant";

export interface INotification extends Document {
    recipientId: mongoose.Types.ObjectId;

    type: NotificationType;

    title: string;

    message: string;

    entityType?: NotificationEntityType;

    entityId?: string;

    isRead: boolean;

    readAt?: Date;

    createdAt: Date;

    updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
    {
        recipientId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        type: {
            type: String,
            enum: Object.values(NOTIFICATION_TYPE),
            required: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        message: {
            type: String,
            required: true,
            trim: true,
        },

        entityType: {
            type: String,
            enum: Object.values(NOTIFICATION_ENTITY_TYPE),
        },

        entityId: {
            type: String,
        },

        isRead: {
            type: Boolean,
            default: false,
        },

        readAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    },
);

NotificationSchema.index({
    recipientId: 1,
    createdAt: -1,
});

NotificationSchema.index({
    recipientId: 1,
    isRead: 1,
});

export const NotificationModel =
    mongoose.model<INotification>(
        "Notification",
        NotificationSchema,
    );