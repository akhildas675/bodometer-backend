"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
class BaseRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    async findById(id) {
        const doc = await this.model.findById(id).exec();
        return doc ? this.toInterface(doc) : null;
    }
    async create(data) {
        const doc = new this.model(data);
        const saved = await doc.save();
        return this.toInterface(saved);
    }
    async upsert(filter, data) {
        const doc = await this.model
            .findOneAndUpdate(filter, { $set: data }, { new: true, upsert: true, runValidators: true })
            .exec();
        return this.toInterface(doc);
    }
    async findOne(filter) {
        const doc = await this.model.findOne(filter).exec();
        return doc ? this.toInterface(doc) : null;
    }
    async findAll(filter = {}) {
        const docs = await this.model.find(filter).exec();
        return docs.map((doc) => this.toInterface(doc));
    }
    async updateById(id, data) {
        const doc = await this.model
            .findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true })
            .exec();
        return doc ? this.toInterface(doc) : null;
    }
    async deleteById(id) {
        const result = await this.model.findByIdAndDelete(id).exec();
        return result !== null;
    }
    async countDocuments(filter = {}) {
        return this.model.countDocuments(filter).exec();
    }
    async exists(filter) {
        const count = await this.model.countDocuments(filter).exec();
        return count > 0;
    }
}
exports.BaseRepository = BaseRepository;
