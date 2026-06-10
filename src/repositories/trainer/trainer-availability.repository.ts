import { ITrainerAvailabilityRepository } from "../../interfaces/repository-interface/trainer/trainer-availability.repository.interface";
import { BaseRepository } from "../base/base.repository";
import { TrainerAvailability } from "../../interfaces/domain.interface/trainer-booking.interface";
import { PaginationMeta } from "../../interfaces/domain.interface/common.interface";
import { Types } from "mongoose";
import { ITrainerAvailabilityDocument, TrainerAvailabilityModel } from "../../models/trainer-availability.model";

export class TrainerAvailabilityRepository extends BaseRepository<TrainerAvailability, ITrainerAvailabilityDocument> implements ITrainerAvailabilityRepository {
  constructor() {
    super(TrainerAvailabilityModel);
  }

  protected toInterface(doc: ITrainerAvailabilityDocument): TrainerAvailability {
    return {
      _id: doc._id.toString(),
      trainerId: doc.trainerId.toString(),
      startDate: doc.startDate,
      endDate: doc.endDate,
      timeWindows: doc.timeWindows.map(tw => ({
        startTime: tw.startTime,
        endTime: tw.endTime
      })),
      sessionDuration: doc.sessionDuration,
      isActive: doc.isActive,
    };
  }

  async findByTrainerId(trainerId: string): Promise<TrainerAvailability[]> {
    const docs = await TrainerAvailabilityModel.find({ trainerId }).sort({ createdAt: -1 }).exec();
    return docs.map(doc => this.toInterface(doc));
  }

  async findByTrainerIdPaginated(
    trainerId: string, 
    page: number, 
    limit: number, 
    sortBy: string = 'createdAt', 
    sortOrder: string = 'desc', 
    status?: string
  ): Promise<{ data: TrainerAvailability[]; pagination: PaginationMeta }> {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    type MatchStage = { trainerId: Types.ObjectId; isActive?: boolean };
    const matchStage: MatchStage = { trainerId: new Types.ObjectId(trainerId) };
    
    if (status !== undefined) {
      if (status === 'active') matchStage.isActive = true;
      if (status === 'inactive') matchStage.isActive = false;
    }

    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const sortStage: Record<string, 1 | -1> = { [sortBy]: sortDirection };

    const pipeline = [
      { $match: matchStage },
      { $sort: sortStage },
      { $skip: skip },
      { $limit: limitNum }
    ];

    const [docs, totalItems] = await Promise.all([
      TrainerAvailabilityModel.aggregate(pipeline).exec(),
      TrainerAvailabilityModel.countDocuments(matchStage)
    ]);

    const totalPages = Math.ceil(totalItems / limitNum);

    return {
      data: docs.map(doc => this.toInterface(doc)),
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        itemsPerPage: limitNum
      }
    };
  }

  async updateAvailabilityStatus(availabilityId: string, isActive: boolean): Promise<TrainerAvailability | null> {
    const doc = await TrainerAvailabilityModel.findByIdAndUpdate(
      availabilityId,
      { isActive },
      { new: true }
    ).exec();
    
    return doc ? this.toInterface(doc) : null;
  }
}

export default TrainerAvailabilityRepository;
