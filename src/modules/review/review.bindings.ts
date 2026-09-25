import { Container } from "inversify";
import { REVIEW_TYPES } from "./review.types";
import { IReviewRepository } from "./interface/review-repository.interface";
import { ReviewRepository } from "./repositories/review.repository";
import { IReviewService } from "./interface/review-service.interface";
import { ReviewService } from "./services/review.service";
import { ReviewController } from "./controller/review.controller";

export const loadReviewBindings = (container: Container): void => {
  container
    .bind<IReviewRepository>(REVIEW_TYPES.Repository)
    .to(ReviewRepository);

  container
    .bind<IReviewService>(REVIEW_TYPES.Service)
    .to(ReviewService);

  container
    .bind<ReviewController>(REVIEW_TYPES.Controller)
    .to(ReviewController);
};
