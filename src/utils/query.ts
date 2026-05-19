import { Request } from "express";
import { PaginationQueryDto } from "../dto/common.dto";

export const parsePaginationQuery = (req: Request): PaginationQueryDto => {
  const query: PaginationQueryDto = {};
  if (req.query.page) query.page = Number(req.query.page);
  if (req.query.limit) query.limit = Number(req.query.limit);
  if (req.query.search) query.search = String(req.query.search);
  if (req.query.sortBy) query.sortBy = String(req.query.sortBy);
  if (req.query.sortOrder) {
    query.sortOrder = req.query.sortOrder as "asc" | "desc";
  }
  return query;
};
