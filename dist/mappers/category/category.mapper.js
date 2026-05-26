"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryMappers = void 0;
class CategoryMappers {
    static toCategoryDetailDto(category) {
        return {
            categoryId: category.categoryId,
            name: category.name,
            description: category.description,
            media: {
                image: {
                    url: category.media?.image?.url || "",
                },
            },
            isActive: category.isActive ?? false,
        };
    }
    static toCategoryResponseDto(category) {
        return {
            categoryId: category.categoryId,
            name: category.name,
            description: category.description,
            image: category.media?.image?.url || "",
            isActive: category.isActive ?? false,
        };
    }
    static toGetCategoryByIdResponseDto(category) {
        return {
            categoryId: category.categoryId,
            name: category.name,
            description: category.description,
            image: category.media?.image?.url || "",
        };
    }
    static toCategoryResponseDtoList(categories) {
        return categories.map((cat) => this.toCategoryResponseDto(cat));
    }
}
exports.CategoryMappers = CategoryMappers;
