export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}
