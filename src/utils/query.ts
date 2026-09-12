import { Request } from "express";
import { PaginationQueryDto } from "../dto/common.dto";

export const parsePaginationQuery = <T extends PaginationQueryDto = PaginationQueryDto>(
  req: Request,
): T => {
  const query: Record<string, unknown> = { ...req.query };
  if (req.query.page) query.page = Number(req.query.page);
  if (req.query.limit) query.limit = Number(req.query.limit);
  if (typeof req.query.search === "string") query.search = req.query.search;
  if (typeof req.query.sortBy === "string") query.sortBy = req.query.sortBy;
  if (req.query.sortOrder) {
    query.sortOrder = req.query.sortOrder as "asc" | "desc";
  }
  return query as T;
};
