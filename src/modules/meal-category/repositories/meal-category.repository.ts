import { injectable } from "inversify";
import { IMealCategory, MealCategoryModel } from "../models/meal-category.model";
import { BaseRepository } from "@/repositories/base/base.repository";
import { MealCategoryQueryDto } from "../dto/meal-category.dto";
import { PaginatedResult } from "@/interfaces/domain.interface/common.interface";
import { MealCategory } from "../interface/meal-category.interface";
import { IMealCategoryRepository } from "../interface/meal-category-repository.interface";

@injectable()
export default class MealCategoryRepository extends BaseRepository<MealCategory, IMealCategory> implements IMealCategoryRepository {
    constructor() {
        super(MealCategoryModel)
    }

    protected toInterface(doc: IMealCategory): MealCategory {
        return {
            mealCategoryId: doc._id.toString(),
            title: doc.title,
            description: doc.description,
            isActive: doc.isActive,
        }
    }

    async createMealCategory(data: MealCategory): Promise<void> {
        await this.create(data)
    }

    async getAllMealCategories(query: MealCategoryQueryDto): Promise<PaginatedResult<MealCategory>> {
        const filter: Record<string, unknown> = {};
        if (query.search) {
            filter.title = { $regex: query.search, $options: "i" };
        }
        if (query.status !== undefined) {
            filter.isActive = query.status === "active";
        }
        
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;

        const sort: Record<string, 1 | -1> = {};
        if (query.sortBy) {
            sort[query.sortBy] = query.sortOrder === "desc" ? -1 : 1;
        } else {
            sort.createdAt = -1;
        }

        const [docs, totalItems] = await Promise.all([
            this.model.find(filter).sort(sort).skip(skip).limit(limit).exec(),
            this.model.countDocuments(filter).exec(),
        ]);

        const totalPages = Math.ceil(totalItems / limit);

        return {
            data: docs.map(doc => this.toInterface(doc)),
            pagination: {
                currentPage: page,
                totalPages,
                totalItems,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        };
    }

    async getMealCategoryById(id: string): Promise<MealCategory | null> {
        return this.findById(id);
    }

    async updateMealCategory(id: string, data: Partial<MealCategory>): Promise<MealCategory | null> {
        return this.updateById(id, data);
    }

    async toggleMealCategoryStatus(id: string): Promise<MealCategory | null> {
        const category = await this.findById(id);
        if (!category) return null;
        return this.updateById(id, { isActive: !category.isActive });
    }
}