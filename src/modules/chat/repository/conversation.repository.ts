import { BaseRepository } from "@/modules/base/repository/base.repository";
import {
  Conversation,
  CreateConversation,
  PopulatedConversation,
  ParticipantDetails,
} from "../interface/conversation.interface";
import { Message } from "../interface/message.interface";
import {
  ConversationModel,
  IConversation,
  IPopulatedConversationDoc,
  IPopulatedMessageDoc,
} from "../model/conversation.model";
import { IConversationRepository } from "../interface/conversation-repository.interface";
import { injectable } from "inversify";
import mongoose from "mongoose";
import { AppError } from "@/utils/appError";
import { STATUS } from "@/constants/constant.values.ts/statuscode";
import { MESSAGES } from "@/constants/messages";
import { Role } from "@/constants/constant.values.ts/roles";

@injectable()
export default class ConversationRepository
  extends BaseRepository<Conversation, IConversation>
  implements IConversationRepository
{
  constructor() {
    super(ConversationModel);
  }

  protected toInterface(doc: IConversation): Conversation {
    return {
      id: doc._id.toString(),

      participantIds: doc.participantIds.map(
        (participantId) => participantId.toString(),
      ),

      lastMessageId: doc.lastMessageId?.toString(),

      lastMessageAt: doc.lastMessageAt,

      createdAt: doc.createdAt,

      updatedAt: doc.updatedAt,
    };
  }

  protected toPopulatedInterface(
    doc: IPopulatedConversationDoc,
  ): PopulatedConversation {
    const base = this.toInterface(doc as unknown as IConversation);

    const populatedParticipants: ParticipantDetails[] = Array.isArray(
      doc.participantIds,
    )
      ? doc.participantIds.map((p) => {
          if (typeof p === "object" && p !== null && "role" in p) {
            return {
              id: p._id.toString(),
              name: p.name || "",
              role: p.role,
              profilePic: p.profilePic ?? null,
            };
          }
          return {
            id: p.toString(),
            name: "",
            role: "user" as Role,
            profilePic: null,
          };
        })
      : [];

    let lastMessage: Message | null = null;
    if (
      doc.lastMessageId &&
      typeof doc.lastMessageId === "object" &&
      "_id" in doc.lastMessageId
    ) {
      const msgDoc = doc.lastMessageId as IPopulatedMessageDoc;
      lastMessage = {
        id: msgDoc._id.toString(),
        conversationId: doc._id.toString(),
        senderId: msgDoc.senderId?.toString() || "",
        receiverId: msgDoc.receiverId?.toString() || "",
        content: msgDoc.content || "",
        messageType: msgDoc.messageType,
        createdAt: msgDoc.createdAt,
        updatedAt: msgDoc.updatedAt,
      };
    }

    return {
      ...base,
      participants: populatedParticipants,
      lastMessage,
    };
  }

  async createConversation(
    data: CreateConversation,
  ): Promise<Conversation> {
    const conversation = await ConversationModel.create({
      participantIds: data.participantIds.map(
        (participantId) =>
          new mongoose.Types.ObjectId(participantId),
      ),
    });

    return this.toInterface(conversation);
  }

  async findById(id: string): Promise<Conversation | null> {
    return await super.findById(id);
  }

  async findByParticipant(
    participantId: string,
  ): Promise<Conversation[]> {
    const conversations = await ConversationModel.find({
      participantIds: participantId,
    }).sort({ updatedAt: -1 });

    return conversations.map(
      (conversation) => this.toInterface(conversation),
    );
  }

  async findByParticipants(
    participantIds: string[],
  ): Promise<Conversation | null> {
    const conversation = await ConversationModel.findOne({
      participantIds: {
        $all: participantIds,
      },
    });

    return conversation ? this.toInterface(conversation) : null;
  }

  async findByParticipantWithDetails(
    participantId: string,
  ): Promise<PopulatedConversation[]> {
    const conversations = (await ConversationModel.find({
      participantIds: participantId,
    })
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .populate("participantIds", "name role profilePic")
      .populate("lastMessageId")) as unknown as IPopulatedConversationDoc[];

    return conversations.map((conv) => this.toPopulatedInterface(conv));
  }

  async findByParticipantsWithDetails(
    participantIds: string[],
  ): Promise<PopulatedConversation | null> {
    const conversation = (await ConversationModel.findOne({
      participantIds: {
        $all: participantIds,
      },
    })
      .populate("participantIds", "name role profilePic")
      .populate("lastMessageId")) as unknown as IPopulatedConversationDoc | null;

    return conversation ? this.toPopulatedInterface(conversation) : null;
  }

  async updateLastMessage(
    conversationId: string,
    messageId: string,
    lastMessageAt: Date,
  ): Promise<Conversation> {
    const conversation = await ConversationModel.findByIdAndUpdate(
      conversationId,
      {
        lastMessageId: new mongoose.Types.ObjectId(messageId),
        lastMessageAt,
        updatedAt: lastMessageAt,
      },
      {
        new: true,
      },
    );

    if (!conversation) {
      throw new AppError(
        STATUS.NOT_FOUND,
        MESSAGES.CHAT.CONVERSATION_NOT_FOUND,
      );
    }

    return this.toInterface(conversation);
  }
}