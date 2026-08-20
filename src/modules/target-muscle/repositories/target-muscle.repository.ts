import { ITargetMuscleRepository } from "../interface/target-muscle-repository.interface";
import { BaseRepository } from '@/modules/base/repository/base.repository';
import { TargetMuscle } from '@/modules/target-muscle/interface/target.muscle.interface';
import { ITargetMuscle, TargetMuscleModel } from "@/modules/target-muscle/models/target-muscle.model";
import { PaginatedResult } from '@/modules/base/interface/common.interface';
import { TargetMuscleQueryDto } from "../dto/target-muscle.dto";
import { injectable } from "inversify";
@injectable()
export default class TargetMuscleRepository extends BaseRepository<TargetMuscle, ITargetMuscle> implements ITargetMuscleRepository {

    constructor() {
        super(TargetMuscleModel)
    }

    protected toInterface(doc: ITargetMuscle): TargetMuscle {
        return {
            _id: doc._id.toString(),
            key: doc.key,
            title: doc.title,
            description: doc.description,
            bodyRegion: doc.bodyRegion,
            image: doc.image,
            isActive: doc.isActive,
        }
    }

    async createTargetMuscle(data: TargetMuscle): Promise<TargetMuscle> {
        const { _id, ...rest } = data;
        return await this.create(rest as unknown as Partial<ITargetMuscle>);
    }

    async getAllTargetMuscles(query: TargetMuscleQueryDto): Promise<PaginatedResult<TargetMuscle>> {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;

        const filter: Record<string, unknown> = {};
        if (query.search) {
            filter.title = { $regex: query.search, $options: "i" };
        }
        if (query.bodyRegion) {
            filter.bodyRegion = query.bodyRegion;
        }
        if (query.status) {
            filter.isActive = query.status === "true";
        }

        const [docs, totalItems] = await Promise.all([
            this.model.find(filter).skip(skip).limit(limit).exec(),
            this.model.countDocuments(filter).exec(),
        ]);

        const totalPages = Math.ceil(totalItems / limit);

        return {
            data: docs.map((doc) => this.toInterface(doc)),
            pagination: {
                currentPage: page,
                totalPages,
                totalItems,
                itemsPerPage: limit,
            },
        };
    }

    async getTargetMuscleById(targetMuscleId: string): Promise<TargetMuscle | null> {
        return await this.findById(targetMuscleId)
    }

    async updateTargetMuscle(targetMuscleId: string, data: Partial<TargetMuscle>): Promise<TargetMuscle | null> {
        const updateData = { ...data } as Record<string, unknown>;
        delete updateData["_id"];
        return await this.updateById(targetMuscleId, updateData as Partial<ITargetMuscle>)

    }

    async toggleTargetMuscleStatus(targetMuscleId: string): Promise<TargetMuscle | null> {
        const existing = await this.model.findById(targetMuscleId).exec();
        if (!existing) return null;

        const doc = await this.model.findByIdAndUpdate(
            targetMuscleId,
            { $set: { isActive: !existing.isActive } },
            { new: true },
        ).exec();
        return doc ? this.toInterface(doc) : null;
    }

    async findTargetMuscleByTitle(title: string): Promise<TargetMuscle | null> {
        return await this.findOne({ title })
    }

}
