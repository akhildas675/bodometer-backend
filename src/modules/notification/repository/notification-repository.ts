import { BaseRepository } from "@/modules/base/repository/base.repository";
import {
  CreateNotificationData,
  Notification,
  NotificationPaginationOptions,
  NotificationPaginationResult,
} from "../interface/notification.interface";
import { INotification, NotificationModel } from "../model/notification.model";
import { INotificationRepository } from "../interface/notification-repository.interface";
import mongoose from "mongoose";

export class NotificationRepository
  extends BaseRepository<Notification, INotification>
  implements INotificationRepository
{
  constructor() {
    super(NotificationModel);
  }

  protected toInterface(doc: INotification): Notification {
    return {
      id: doc._id.toString(),
      recipientId: doc.recipientId.toString(),
      type: doc.type,
      title: doc.title,
      message: doc.message,
      entityType: doc.entityType,
      entityId: doc.entityId,
      isRead: doc.isRead,
      readAt: doc.readAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async createNotification(
    data: CreateNotificationData,
  ): Promise<Notification> {
    if (data.entityId) {
      const existing = await NotificationModel.findOne({
        recipientId: new mongoose.Types.ObjectId(data.recipientId),
        type: data.type,
        entityId: data.entityId,
      });

      if (existing) {
        return this.toInterface(existing);
      }
    }

    const persistenceData: Partial<INotification> = {
      recipientId: new mongoose.Types.ObjectId(data.recipientId),
      type: data.type,
      title: data.title,
      message: data.message,
      entityType: data.entityType,
      entityId: data.entityId,
      isRead: false,
    };

    return this.create(persistenceData);
  }

  async getByRecipientId(
    recipientId: string,
    options: NotificationPaginationOptions,
  ): Promise<NotificationPaginationResult> {
    const page = Math.max(options.page, 1);

    const limit = Math.min(Math.max(options.limit, 1), 50);

    const skip = (page - 1) * limit;

    const filter = {
      recipientId: new mongoose.Types.ObjectId(recipientId),
    };

    const [documents, totalItems] = await Promise.all([
      NotificationModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),

      NotificationModel.countDocuments(filter).exec(),
    ]);

    return {
      data: documents.map((document) => this.toInterface(document)),
      totalItems,
    };
  }

  async getUnreadCount(recipientId: string): Promise<number> {
    return NotificationModel.countDocuments({
      recipientId: new mongoose.Types.ObjectId(recipientId),
      isRead: false,
    }).exec();
  }

  async markAsRead(
    notificationId: string,
    recipientId: string,
  ): Promise<Notification | null> {
    const document = await NotificationModel.findByIdAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(notificationId),
        recipientId: new mongoose.Types.ObjectId(recipientId),
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      },

      {
        new: true,
        runValidators: true,
      },
    ).exec();

    return document ? this.toInterface(document) : null;
  }

  async markAllAsRead(recipientId: string): Promise<void> {
    await NotificationModel.updateMany(
      {
        recipientId: new mongoose.Types.ObjectId(recipientId),
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      },
    ).exec();
  }
}
