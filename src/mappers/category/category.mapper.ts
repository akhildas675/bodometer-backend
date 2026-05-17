import { CategoryDetailDto } from "../../dto/category/category.dto";
import { Category } from "../../interfaces/domain.interface/category.interface";

export class CategoryMappers {
  static toCategoryDetailDto(category: Category): CategoryDetailDto {
    return {
      categoryId: category.categoryId!,
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
}