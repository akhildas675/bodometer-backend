import { Document, Model } from "mongoose";
import { IBaseRepository } from "@/interfaces/base/base-repository.interface";

export abstract class BaseRepository<T, D extends Document>
  implements IBaseRepository<T, D>
{
  protected model: Model<D>;

  constructor(model: Model<D>) {
    this.model = model;
  }

  protected abstract toInterface(doc: D): T;

  async findById(id: string): Promise<T | null> {
    const doc = await this.model.findById(id).exec();
    return doc ? this.toInterface(doc) : null;
  }

  async create(data: Partial<T>): Promise<T> {
    const doc = new this.model(data);
    const saved = await doc.save();
    return this.toInterface(saved);
  }

  async upsert(filter: Record<string, unknown>, data: Partial<T>): Promise<T> {
    const doc = await this.model
      .findOneAndUpdate(filter, { $set: data }, { new: true, upsert: true, runValidators: true })
      .exec();
    return this.toInterface(doc as D);
  }

  async findOne(filter: Record<string, unknown>): Promise<T | null> {
    const doc = await this.model.findOne(filter).exec();
    return doc ? this.toInterface(doc) : null;
  }

  async findAll(filter: Record<string, unknown> = {}): Promise<T[]> {
    const docs = await this.model.find(filter).exec();
    return docs.map((doc) => this.toInterface(doc));
  }

async updateById(id: string, data: Partial<D>): Promise<T | null> {
    const doc = await this.model
      .findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true })
      .exec();
    return doc ? this.toInterface(doc) : null;
}

  async deleteById(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return result !== null;
  }

  async countDocuments(filter: Record<string, unknown> = {}): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }

  async exists(filter: Record<string, unknown>): Promise<boolean> {
    const count = await this.model.countDocuments(filter).exec();
    return count > 0;
  }


}