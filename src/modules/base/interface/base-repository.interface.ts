import { Document } from "mongoose";

export interface IBaseRepository<T, D extends Document> {
  findById(id: string): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
  upsert(filter: Record<string, unknown>, data: Partial<T>): Promise<T>;
  findOne(filter: Partial<D>): Promise<T | null>;
  findAll(filter?: Partial<D>): Promise<T[]>;
  updateById(id: string, data: Partial<D>): Promise<T | null>;
  deleteById(id: string): Promise<boolean>;
}