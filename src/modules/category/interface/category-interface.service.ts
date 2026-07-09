import { Role } from "@/constants/constant.values.ts/roles";
import { CategoryDetailDto, CategoryQueryDto, CreateCategoryDto, GetAllCategoriesResponseDto, ToggleCategoryStatusResponseDto, UpdateCategoryDto } from "../dto/category.dto";

export interface ICategoryService{
    createCategory(data:CreateCategoryDto):Promise<void>
     getCategoryById(id:string):Promise<CategoryDetailDto>;
     updateCategory(query:UpdateCategoryDto):Promise<void>;
     getAllCategories(query:CategoryQueryDto,role:Role):Promise<GetAllCategoriesResponseDto>;
     toggleCategoryStatus(categoryId:string):Promise<ToggleCategoryStatusResponseDto>
}