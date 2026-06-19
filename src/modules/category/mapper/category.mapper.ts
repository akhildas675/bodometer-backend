
import { Category } from "../interface/category.interface";
import { CategoryDetailDto, CategoryResponseDto, GetCategoryByIdResponseDto } from "../dto/category.dto";

export class CategoryMapper {
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

  static toCategoryResponseDto(category: Category): CategoryResponseDto {
    return {
      categoryId: category.categoryId!,
      name: category.name,
      description: category.description,
      image: category.media?.image?.url || "",
      isActive: category.isActive ?? false,
    };
  }

  static toGetCategoryByIdResponseDto(category: Category): GetCategoryByIdResponseDto {
    return {
      categoryId: category.categoryId!,
      name: category.name,
      description: category.description,
      image: category.media?.image?.url || "",
    };
  }

  static toCategoryResponseDtoList(categories: Category[]): CategoryResponseDto[] {
    return categories.map((cat) => this.toCategoryResponseDto(cat));
  }
}
