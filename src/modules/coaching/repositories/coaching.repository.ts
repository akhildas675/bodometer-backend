import { BaseRepository } from "@/modules/base/repository/base.repository";
import { CoachingModel, ICoaching } from "../model/coaching.model";

import { Coaching, CoachingQuery, GetAllCoachingResponse, UpdateCoaching } from "../interface/coaching.interface";
import { injectable } from "inversify";
import { ICoachingRepository } from "../interface/coaching-repository.interface";
@injectable()
export default class CoachingRepository extends BaseRepository<Coaching, ICoaching> implements ICoachingRepository {
    constructor() {
        super(CoachingModel)
    }


    protected toInterface(doc: ICoaching): Coaching {
        return {
            serviceId: doc._id.toString(),
            serviceType: doc.serviceType,
            description: doc.description,
            durationMinutes: doc.durationMinutes,
            price: doc.price,
            bookingMode: doc.bookingMode,
            isActive: doc.isActive,

        }
    }
    async createCoaching(data: Coaching): Promise<void> {
        const { serviceId, ...rest } = data;
        await this.create(rest as unknown as Partial<ICoaching>);
    }

    async getCoaching(query: CoachingQuery): Promise<GetAllCoachingResponse> {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;

        const filter: Record<string, unknown> = {};
        if (query.search) {
            filter.serviceType = { $regex: query.search, $options: "i" };
        }

        if (query.isActive !== undefined) {
            filter.isActive = query.isActive == true ? { $ne: false } : false;
        }

        const [docs, totalItems] = await Promise.all([
            CoachingModel.find(filter).skip(skip).limit(limit).exec(),
            CoachingModel.countDocuments(filter).exec()
        ])

        const totalPages = Math.ceil(totalItems / limit);

        return {
            data: docs.map((doc) => this.toInterface(doc)),
            pagination: {
                currentPage: page,
                totalPages,
                totalItems,
                itemsPerPage: limit,
                hasNextPage: false,
                hasPreviousPage: false
            }
        };
    }

    async getCoachingServiceById(serviceId: string): Promise<Coaching | null> {
        return this.findById(serviceId);
    }

    async updateCoachingService(serviceId: string, data: UpdateCoaching): Promise<void> {
        await this.updateById(serviceId, data as unknown as ICoaching);
    }

  async toggleCoachingStatus(serviceId: string): Promise<Coaching | null> {
    const existing = await CoachingModel.findById(serviceId).exec();
    if (!existing) return null;

    const doc = await CoachingModel.findByIdAndUpdate(
      serviceId,
      { $set: { isActive: !existing.isActive } },
      { new: true }
    ).exec();

    return doc ? this.toInterface(doc) : null;
  }

}