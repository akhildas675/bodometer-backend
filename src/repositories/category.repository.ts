import { Category, CategoryQuery, GetAllCategoriesResponse } from "@/interfaces/domain.interface/admin.interface/admin.interface";
import { BaseRepository } from "./base/base.repository";
import { CategoryModel, ICategory } from "@/models/category.model";
import { ICategoryRepository } from "@/interfaces/repository-interface/category/category-repository.interface";

export default class CategoryRepository extends BaseRepository<Category, ICategory> implements ICategoryRepository {
    constructor() {
        super(CategoryModel);
    }

    protected toInterface(doc: ICategory): Category {
    return {
        categoryId: doc._id.toString(),
        name: doc.name,
        description: doc.description,
        media: {          
            image: {
                url: doc.media?.image?.url || "",
            },
        },
        isActive: doc.isActive,
    };
}
    async createCategory(data: Category): Promise<void> {
        await CategoryModel.create({
            name: data.name,
            description: data.description,
            media: {
                image: {
                    url: data.media.image.url
                },
            },
            isActive: data.isActive ?? true,
        });
    }

    async getCategoryById(categoryId: string): Promise<Category | null> {
        const doc = await CategoryModel.findById(categoryId);
        return doc ? this.toInterface(doc) : null;
    }

    async updateCategory(categoryId: string, data: Category): Promise<void> {
        await CategoryModel.findByIdAndUpdate(categoryId, {
            name: data.name,
            description: data.description,
            media: {
                image: {
                    url: data.media.image.url
                },
            },
        });
    }

    async getAllCategories(query: CategoryQuery): Promise<GetAllCategoriesResponse> {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;

        const filter: Record<string, unknown> = {};
        if (query.search) {
            filter.name = { $regex: query.search, $options: 'i' };
        }
        if (query.isActive !== undefined) {
            filter.isActive = query.isActive === true ? { $ne: false } : false;
        }

        const [docs, totalItems] = await Promise.all([
            CategoryModel.find(filter).skip(skip).limit(limit).exec(),
            CategoryModel.countDocuments(filter).exec(),
        ]);

        const totalPages = Math.ceil(totalItems / limit);

        return {
            data: docs.map((doc) => this.toInterface(doc)),
            pagination: {
                currentPage: page,
                totalPages,
                totalItems,
                itemsPerPage: limit,
            },
        };
    }

    async toggleCategoryStatus(categoryId: string): Promise<Category | null> {
        const existing = await CategoryModel.findById(categoryId).exec();
        if (!existing) return null;

        const doc = await CategoryModel.findByIdAndUpdate(
            categoryId,
            { $set: { isActive: !existing.isActive } },
            { new: true }
        ).exec();
        return doc ? this.toInterface(doc) : null;
    }
}
