import { Document } from "mongoose";

export interface IBaseRepository<T, D extends Document> {
  findById(id: string): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
  findOne(filter: Partial<D>): Promise<T | null>;
  findAll(filter?: Partial<D>): Promise<T[]>;
}