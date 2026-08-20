import { IEquipmentRepository } from '@/modules/equipment/interface/equipment-repository.interface';
import { BaseRepository } from '@/modules/base/repository/base.repository';
import { Equipment } from '@/modules/equipment/interface/equipment.interface';
import { IEquipment, EquipmentModel } from "@/modules/equipment/models/equipment.model";
import { PaginatedResult } from '@/modules/base/interface/common.interface';
import { EquipmentQueryDto } from "@/modules/equipment/dto/equipment.dto";
import { injectable } from 'inversify';
@injectable()
export default class EquipmentRepository extends BaseRepository<Equipment, IEquipment> implements IEquipmentRepository {

    constructor() {
        super(EquipmentModel)
    }

    protected toInterface(doc: IEquipment): Equipment {
        return {
            _id: doc._id.toString(),
            key: doc.key,
            title: doc.title,
            description: doc.description,
            image: doc.image,
            isActive: doc.isActive,
        }
    }

    async createEquipment(data: Equipment): Promise<Equipment> {
        const { _id, ...rest } = data;
        return await this.create(rest as unknown as Partial<IEquipment>);
    }

    async getAllEquipment(query: EquipmentQueryDto): Promise<PaginatedResult<Equipment>> {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;

        const filter: Record<string, unknown> = {};
        if (query.search) {
            filter.title = { $regex: query.search, $options: "i" };
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

    async getEquipmentById(equipmentId: string): Promise<Equipment | null> {
        return await this.findById(equipmentId)
    }

    async updateEquipment(equipmentId: string, data: Partial<Equipment>): Promise<Equipment | null> {
        const updateData = { ...data } as Record<string, unknown>;
        delete updateData["_id"];
        return await this.updateById(equipmentId, updateData as Partial<IEquipment>)

    }

    async toggleEquipmentStatus(equipmentId: string): Promise<Equipment | null> {
        const existing = await this.model.findById(equipmentId).exec();
        if (!existing) return null;

        const doc = await this.model.findByIdAndUpdate(
            equipmentId,
            { $set: { isActive: !existing.isActive } },
            { new: true },
        ).exec();
        return doc ? this.toInterface(doc) : null;
    }

    async findEquipmentByTitle(title: string): Promise<Equipment | null> {
        return await this.findOne({ title })
    }

}
