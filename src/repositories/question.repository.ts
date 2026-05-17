import {
  OnboardingQuestion,
  QuestionQuery,
  GetAllQuestionsResponse,
  OnboardingValue,
} from "@/interfaces/domain.interface/onboarding.interface";
import { BaseRepository } from "./base/base.repository";
import { QuestionModel, IQuestion } from "@/models/question.model";
import { IQuestionRepository } from "@/interfaces/repository-interface/onboarding/question-repository.interface";
import mongoose from "mongoose";
import {
  ConditionOperator,
  QuestionType,
  DataSource,
} from "@/constants/question.constant";

export default class QuestionRepository
  extends BaseRepository<OnboardingQuestion, IQuestion>
  implements IQuestionRepository
{
  constructor() {
    super(QuestionModel);
  }

  protected toInterface(doc: IQuestion): OnboardingQuestion {
    return {
      questionId: doc._id.toString(),
      key: doc.key,
      question: doc.question,
      description: doc.description,
      groupId: doc.groupId.toString(),
      order: doc.order,
      isActive: doc.isActive,
      type: doc.type,
      options: doc.options,
      dataSource: doc.dataSource,
      next: doc.next?.map((n) => ({
        condition: n.condition,
        nextQuestionId: n.nextQuestionId.toString(),
      })),
      numberConfig: doc.numberConfig,
      validation: doc.validation,
      createdBy: doc.createdBy?.toString(),
      createdAt: doc.createdAt?.toISOString(),
    };
  }

  async createQuestion(data: OnboardingQuestion): Promise<void> {
    await QuestionModel.create({
      key: data.key,
      question: data.question,
      description: data.description,
      groupId: new mongoose.Types.ObjectId(data.groupId),
      order: data.order,
      isActive: data.isActive ?? true,
      type: data.type as QuestionType,
      options: data.options,
      dataSource: data.dataSource ? (data.dataSource as DataSource) : undefined,
      next: data.next?.map((n) => ({
        condition: {
          operator: n.condition.operator as ConditionOperator,
          value: n.condition.value,
        },
        nextQuestionId: new mongoose.Types.ObjectId(n.nextQuestionId),
      })),
      numberConfig: data.numberConfig,
      validation: data.validation,
      createdBy: data.createdBy
        ? new mongoose.Types.ObjectId(data.createdBy)
        : undefined,
    });
  }

  async getQuestionById(
    questionId: string,
  ): Promise<OnboardingQuestion | null> {
    const doc = await QuestionModel.findById(questionId);
    return doc ? this.toInterface(doc) : null;
  }

  async updateQuestion(
    questionId: string,
    data: Partial<OnboardingQuestion>,
  ): Promise<void> {
    const doc = await QuestionModel.findById(questionId);
    if (!doc) return;

    if (data.question !== undefined) doc.question = data.question;
    if (data.description !== undefined) doc.description = data.description;
    if (data.groupId !== undefined) {
      doc.groupId =
        data.groupId && mongoose.Types.ObjectId.isValid(data.groupId)
          ? new mongoose.Types.ObjectId(data.groupId)
          : (undefined as unknown as mongoose.Types.ObjectId);
    }

    if (data.order !== undefined) {
      doc.order = Number(data.order);
      doc.markModified("order");
    }

    if (data.type !== undefined) doc.type = data.type as QuestionType;
    if (data.options !== undefined) doc.options = data.options;
    if (data.dataSource !== undefined)
      doc.dataSource = data.dataSource as DataSource;

    if (data.next !== undefined) {
      doc.next = data.next?.map((n) => {
        const entry: {
          condition: {
            operator: ConditionOperator;
            value?: OnboardingValue;
          };
          nextQuestionId?: mongoose.Types.ObjectId;
        } = {
          condition: {
            operator: n.condition.operator as ConditionOperator,
            value: n.condition.value,
          },
        };
        if (
          n.nextQuestionId &&
          mongoose.Types.ObjectId.isValid(n.nextQuestionId)
        ) {
          entry.nextQuestionId = new mongoose.Types.ObjectId(n.nextQuestionId);
        }
        return entry as {
          condition: { operator: ConditionOperator; value?: OnboardingValue };
          nextQuestionId: mongoose.Types.ObjectId;
        };
      });
    }

    if (data.numberConfig !== undefined) doc.numberConfig = data.numberConfig;
    if (data.validation !== undefined) doc.validation = data.validation;

    await doc.save();
  }

  async getAllQuestions(
    query: QuestionQuery,
  ): Promise<GetAllQuestionsResponse> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (query.search) {
      filter.$or = [
        { question: { $regex: query.search, $options: "i" } },
        { key: { $regex: query.search, $options: "i" } },
      ];
    }
    if (query.groupId) {
      filter.groupId = new mongoose.Types.ObjectId(query.groupId);
    }
    if (query.isActive !== undefined) {
      filter.isActive = query.isActive === true ? { $ne: false } : false;
    }

    const sort: Record<string, 1 | -1> = {};
    if (query.sortBy) {
      sort[query.sortBy] = query.sortOrder === "asc" ? 1 : -1;
    } else {
      sort.createdAt = -1;
    }

    const [docs, totalItems] = await Promise.all([
      QuestionModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      QuestionModel.countDocuments(filter).exec(),
    ]);

    return {
      data: docs.map((doc) => this.toInterface(doc)),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        itemsPerPage: limit,
      },
    };
  }

  async getQuestionsByGroup(
    groupId: string,
    activeOnly: boolean = true,
  ): Promise<OnboardingQuestion[]> {
    const filter: Record<string, unknown> = {
      groupId: new mongoose.Types.ObjectId(groupId),
    };
    if (activeOnly) filter.isActive = true;

    const docs = await QuestionModel.find(filter).sort({ order: 1 }).exec();
    return docs.map((d) => this.toInterface(d));
  }

  async toggleQuestionStatus(
    questionId: string,
  ): Promise<OnboardingQuestion | null> {
    const existing = await QuestionModel.findById(questionId).exec();
    if (!existing) return null;

    const doc = await QuestionModel.findByIdAndUpdate(
      questionId,
      { $set: { isActive: !existing.isActive } },
      { new: true },
    ).exec();
    return doc ? this.toInterface(doc) : null;
  }
}
