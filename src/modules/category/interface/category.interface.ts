import { PaginationMeta } from "../../../interfaces/domain.interface/common.interface";

export interface Category {
  categoryId?: string;
  name: string;
  description: string;
  media: {
    image: {
      url: string;
    };
  };
  isActive?: boolean;
}

export interface CategoryQuery {
  search?: string;
  limit?: number;
  page?: number;
  isActive?: boolean;
}

export interface GetAllCategoriesResponse {
  data: Category[];
  pagination: PaginationMeta;
}
