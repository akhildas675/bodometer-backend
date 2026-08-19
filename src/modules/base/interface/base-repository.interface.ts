import { Document, UpdateQuery } from "mongoose";

export interface IBaseRepository<T, D extends Document> {
  findById(id: string): Promise<T | null>;

  create(data: Partial<D>): Promise<T>;

  upsert(
    filter: Record<string, unknown>,
    data: UpdateQuery<D>,
  ): Promise<T>;

  findOne(
    filter: Record<string, unknown>,
  ): Promise<T | null>;

  findAll(
    filter?: Record<string, unknown>,
  ): Promise<T[]>;

  updateById(
    id: string,
    data: UpdateQuery<D>,
  ): Promise<T | null>;

  deleteById(id: string): Promise<boolean>;

  countDocuments(
    filter?: Record<string, unknown>,
  ): Promise<number>;

  exists(
    filter: Record<string, unknown>,
  ): Promise<boolean>;
}