import { Container } from "inversify";
import { CATEGORY_TYPES } from "./category.types";
import CategoryRepository from "./repositories/category.repository";
import { CategoryService } from "./service/category.services";
import { CategoryController } from "./controller/category.controller";
import { ICategoryRepository } from "./interface/category-repository.interface";
import { ICategoryService } from "./interface/category-interface.service";
import { IS3Service } from "@/interfaces/service-interface/s3/s3-service.interface";
import { S3Service } from "@/services/s3/s3.service";

export const loadCategoryBindings=(
    container:Container,
)=>{
    container.bind<ICategoryRepository>(CATEGORY_TYPES.Repository)
    .to(CategoryRepository);

    container.bind<IS3Service>(CATEGORY_TYPES.S3Service)
    .to(S3Service)

    container.bind<ICategoryService>(CATEGORY_TYPES.Service)
    .to(CategoryService);


    container.bind(CATEGORY_TYPES.Controller)
    .to(CategoryController)
};