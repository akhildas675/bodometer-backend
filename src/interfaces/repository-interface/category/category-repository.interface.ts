import { Category, CategoryQuery, GetAllCategoriesResponse } from "@/interfaces/domain.interface/admin.interface/admin.interface";

export interface ICategoryRepository {
    createCategory(data: Category): Promise<void>
    getCategoryById(categoryId: string): Promise<Category | null>
    updateCategory(categoryId: string, data: Category): Promise<void>
    getAllCategories(query: CategoryQuery): Promise<GetAllCategoriesResponse>
}