import { CategoryDetailDto } from "../../dto/user/user.dto";
import { Category } from "../../interfaces/domain.interface/admin.interface/admin.interface";

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
      isActive: category.isActive,
    };
  }
}