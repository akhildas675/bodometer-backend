import { Container } from "inversify";
import { ONBOARDING_TYPES } from "./onboarding.types";
import GroupRepository from "./repositories/group.repository";
import QuestionRepository from "./repositories/question.repository";
import AnswerRepository from "./repositories/answer.repository";
import { OnboardingService } from "./service/onboarding.service";
import { OnboardingController } from "./controller/onboarding.controller";
import { IGroupRepository } from "./interface/repository.interface/group-repository.interface";
import { IQuestionRepository } from "./interface/repository.interface/question-repository.interface";
import { IAnswerRepository } from "./interface/repository.interface/answer-repository.interface";
import { IOnboardingService } from "./interface/onboarding-service.interface";

export const loadOnboardingBindings = (container: Container) => {
  container
    .bind<IGroupRepository>(ONBOARDING_TYPES.GroupRepository)
    .to(GroupRepository);

  container
    .bind<IQuestionRepository>(ONBOARDING_TYPES.QuestionRepository)
    .to(QuestionRepository);

  container
    .bind<IAnswerRepository>(ONBOARDING_TYPES.AnswerRepository)
    .to(AnswerRepository);

  container
    .bind<IOnboardingService>(ONBOARDING_TYPES.Service)
    .to(OnboardingService);

  container
    .bind<OnboardingController>(ONBOARDING_TYPES.Controller)
    .to(OnboardingController);
};
