import type { PaginationMeta, PaginationParams } from '../types/pagination.types';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Parse and sanitize pagination query parameters.
 */
export function parsePaginationParams(
  page?: string | number,
  limit?: string | number
): PaginationParams {
  const parsedPage = Math.max(Number(page) || DEFAULT_PAGE, 1);
  const parsedLimit = Math.min(
    Math.max(Number(limit) || DEFAULT_LIMIT, 1),
    MAX_LIMIT
  );

  return { page: parsedPage, limit: parsedLimit };
}

/**
 * Build pagination metadata from query results.
 */
export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
}
