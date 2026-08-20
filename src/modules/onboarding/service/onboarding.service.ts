import { inject, injectable } from "inversify";
import { IOnboardingService } from "../interface/onboarding-service.interface";
import { ONBOARDING_TYPES, DATA_SOURCES } from "../onboarding.types";
import { SUBSCRIPTION_TYPES } from "@/modules/subscription/subscription.types";
import { IGroupRepository } from "../interface/repository.interface/group-repository.interface";
import { IQuestionRepository } from "../interface/repository.interface/question-repository.interface";
import { IAnswerRepository } from "../interface/repository.interface/answer-repository.interface";
import { IUserSubscriptionRepository } from "@/modules/subscription/interface/repository.interface/user.subscription.repository.interface";
import { IWorkoutPlanService } from "../../workout-plan/interface/workout-plan-service.interface";

import {
  CreateQuestionGroupDto,
  GetAllQuestionGroupsResponseDto,
  QuestionGroupResponseDto,
  UpdateQuestionGroupDto,
  CreateQuestionDto,
  GetAllQuestionsResponseDto,
  OnboardingQuestionResponseDto,
  UpdateQuestionDto,
  QuestionQueryDto,
} from "../dto/onboarding.dto";
import {
  QuestionGroupQuery,
  UserAnswerSubmission,
  OnboardingValue,
} from "../interface/onboarding.interface";

import { AppError } from "@/utils/appError";
import { STATUS } from "@/constants/constant.values.ts/statuscode";
import { MESSAGES } from "@/constants/messages";
import { generateKeySlug, generateOptionValue } from "@/utils/string-formatters";



@injectable()
export class OnboardingService implements IOnboardingService {
  constructor(
    @inject(ONBOARDING_TYPES.GroupRepository)
    private _groupRepo: IGroupRepository,

    @inject(ONBOARDING_TYPES.QuestionRepository)
    private _questionRepo: IQuestionRepository,

    @inject(ONBOARDING_TYPES.AnswerRepository)
    private _answerRepo: IAnswerRepository,

    @inject(SUBSCRIPTION_TYPES.UserSubscriptionRepository)
    private _userSubscriptionRepository: IUserSubscriptionRepository,

    @inject(SUBSCRIPTION_TYPES.WorkoutPlanService)
    private _workoutPlanService: IWorkoutPlanService,
  ) {}

 

  async createQuestionGroup(data: CreateQuestionGroupDto): Promise<void> {
    await this._groupRepo.createGroup({
      key: generateKeySlug(data.title),
      title: data.title,
      order: data.order,
    });
  }

  async getAllQuestionGroups(
    query: QuestionGroupQuery,
  ): Promise<GetAllQuestionGroupsResponseDto> {
    const result = await this._groupRepo.getAllGroups(query);
    return {
      data: result.data.map((g) => ({
        groupId: g.groupId!,
        key: g.key,
        title: g.title,
        order: g.order,
        isActive: g.isActive ?? true,
      })),
      pagination: result.pagination,
    };
  }

  async getQuestionGroupById(
    groupId: string,
  ): Promise<QuestionGroupResponseDto> {
    const group = await this._groupRepo.getGroupById(groupId);
    if (!group) {
      throw new AppError(
        STATUS.NOT_FOUND,
        MESSAGES.ONBOARDING.GROUP_NOT_FOUND,
      );
    }
    return {
      groupId: group.groupId!,
      key: group.key,
      title: group.title,
      order: group.order,
      isActive: group.isActive ?? true,
    };
  }

  async updateQuestionGroup(
    groupId: string,
    data: UpdateQuestionGroupDto,
  ): Promise<void> {
    await this._groupRepo.updateGroup(groupId, {
      title: data.title,
      order: data.order,
      key: "",
    });
  }

  async toggleQuestionGroupStatus(groupId: string): Promise<void> {
    await this._groupRepo.toggleGroupStatus(groupId);
  }

  async createQuestion(
    data: CreateQuestionDto,
    adminId: string,
  ): Promise<void> {
    const options =
      data.dataSource === "category" || data.dataSource === "equipment"
        ? []
        : data.options?.map((o) => ({
            label: o.label.trim(),
            value: generateOptionValue(o.label),
          }));

    await this._questionRepo.createQuestion({
      ...data,
      key: data.key || generateKeySlug(data.question),
      createdBy: adminId,
      options,
    });
  }

  async getAllQuestions(
    query: QuestionQueryDto,
  ): Promise<GetAllQuestionsResponseDto> {
    const result = await this._questionRepo.getAllQuestions(query);
    return {
      data: result.data.map((q) => ({
        questionId: q.questionId!,
        key: q.key,
        question: q.question,
        description: q.description,
        groupId: q.groupId,
        groupTitle: q.groupTitle,
        order: q.order,
        isActive: q.isActive ?? true,
        type: q.type,
        options: q.options,
        dataSource: q.dataSource,
        next: q.next,
        numberConfig: q.numberConfig,
        validation: q.validation,
        createdAt: q.createdAt,
      })),
      pagination: result.pagination,
    };
  }

  async getQuestionById(
    questionId: string,
  ): Promise<OnboardingQuestionResponseDto> {
    const q = await this._questionRepo.getQuestionById(questionId);
    if (!q) {
      throw new AppError(
        STATUS.NOT_FOUND,
        MESSAGES.ONBOARDING.QUESTION_NOT_FOUND,
      );
    }
    return {
      questionId: q.questionId!,
      key: q.key,
      question: q.question,
      description: q.description,
      groupId: q.groupId,
      order: q.order,
      isActive: q.isActive ?? true,
      type: q.type,
      options: q.options,
      dataSource: q.dataSource,
      next: q.next,
      numberConfig: q.numberConfig,
      validation: q.validation,
      createdAt: q.createdAt,
    };
  }

  async updateQuestion(
    questionId: string,
    data: UpdateQuestionDto,
  ): Promise<void> {
    const options =
      data.dataSource === "category" || data.dataSource === "equipment"
        ? []
        : data.options?.map((o) => ({
            label: o.label.trim(),
            value: generateOptionValue(o.label),
          }));

    await this._questionRepo.updateQuestion(questionId, {
      ...data,
      options,
    });
  }

  async toggleQuestionStatus(questionId: string): Promise<void> {
    await this._questionRepo.toggleQuestionStatus(questionId);
  }

  async getQuestionDataSources(): Promise<{ label: string; value: string }[]> {
    const labels: Record<string, string> = {
      category: "Workout Categories",
      equipment: "Workout Equipment",
    };
    return Promise.resolve(
      DATA_SOURCES.map((source) => ({
        value: source,
        label:
          labels[source] || source.charAt(0).toUpperCase() + source.slice(1),
      })),
    );
  }

  async submitOnboarding(
    userId: string,
    data: {
      answers: { questionId: string; key: string; value: OnboardingValue }[];
    },
  ): Promise<void> {
    const submission: UserAnswerSubmission = {
      userId,
      answers: data.answers.map((ans) => ({
        questionId: ans.questionId,
        questionKey: ans.key,
        answer: ans.value,
      })),
      completed: true,
    };
    await this._answerRepo.saveUserAnswers(submission);

  }
  async getOnboardingStatus(userId: string): Promise<{ completed: boolean }> {
    const userAnswers = await this._answerRepo.getUserAnswers(userId);
    return { completed: userAnswers?.completed ?? false };
  }

  async getOnboardingAnswers(
    userId: string,
  ): Promise<UserAnswerSubmission | null> {
    return this._answerRepo.getUserAnswers(userId);
  }
}
