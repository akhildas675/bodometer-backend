import { BaseRepository } from "@/modules/base/repository/base.repository";
import { IMessage, MessageModel } from "../model/message.model";
import {
  CreateMessage,
  Message,
} from "../interface/message.interface";
import { IMessageRepository } from "../interface/message.repository.interface";
import { injectable } from "inversify";
import mongoose from "mongoose";

@injectable()
export default class MessageRepository
  extends BaseRepository<Message, IMessage>
  implements IMessageRepository
{
  constructor() {
    super(MessageModel);
  }

  protected toInterface(doc: IMessage): Message {
    return {
      id: doc._id.toString(),
      conversationId: doc.conversationId.toString(),
      senderId: doc.senderId.toString(),
      receiverId: doc.receiverId.toString(),
      content: doc.content,
      messageType: doc.messageType,
      isRead: doc.isRead ?? false,
      readAt: doc.readAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async createMessage(
    data: CreateMessage,
  ): Promise<Message> {
    const persistenceData: Partial<IMessage> = {
      conversationId: new mongoose.Types.ObjectId(
        data.conversationId,
      ),
      senderId: new mongoose.Types.ObjectId(
        data.senderId,
      ),
      receiverId: new mongoose.Types.ObjectId(
        data.receiverId,
      ),
      content: data.content,
      messageType: data.messageType,
    };

    return await super.create(persistenceData);
  }

  async findById(
    id: string,
  ): Promise<Message | null> {
    return super.findById(id);
  }

  async findByConversation(
    conversationId: string,
  ): Promise<Message[]> {
    const messages = await MessageModel.find({
      conversationId: new mongoose.Types.ObjectId(
        conversationId,
      ),
    }).sort({ createdAt: 1 });

    return messages.map((message) =>
      this.toInterface(message),
    );
  }

  async countByConversation(
    conversationId: string,
  ): Promise<number> {
    return await MessageModel.countDocuments({
      conversationId: new mongoose.Types.ObjectId(
        conversationId,
      ),
    });
  }

  async markMessagesAsRead(
    conversationId: string,
    receiverId: string,
  ): Promise<number> {
    const result = await MessageModel.updateMany(
      {
        conversationId: new mongoose.Types.ObjectId(conversationId),
        receiverId: new mongoose.Types.ObjectId(receiverId),
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      },
    );

    return result.modifiedCount;
  }
}