/**
 * Pagination query parameters.
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Paginated response metadata.
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Paginated response wrapper.
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}
