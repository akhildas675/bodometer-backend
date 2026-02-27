import { z } from "zod";
import { ROLES } from "../../constants/roles";

export const getUsersSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).optional(),
    search: z.string().optional(),
    role: z.enum([ROLES.USER] as [string, ...string[]]).optional(),
    isBlocked: z.coerce.boolean().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});

export const userIdParamSchema = z.object({
  params: z.object({
    userId: z.string().min(1, "User ID is required"),
  }),
});