
import { ICoachingService } from "../interface/coaching-service.interface";

import { CoachingDetailDto, CoachingQueryDto, CreateCoachingDto, GetAllCoachingResponseDto, UpdateCoachingDto } from "../dto/coaching.dto";
import { inject, injectable } from "inversify";
import { COACHING_TYPES } from "../coaching.types";
import { ICoachingRepository } from "../interface/coaching-repository.interface";
import { Role, ROLES } from "@/constants/constant.values.ts/roles";
import { CoachingMapper } from "../mapper/coaching.mapper";
import { AppError } from "@/utils/appError";
import { STATUS } from "@/constants/constant.values.ts/statuscode";
import { MESSAGES } from "@/constants/messages";

@injectable()
export class CoachingService implements ICoachingService {
  constructor(
    @inject(COACHING_TYPES.CoachingRepository)
    private _coachingRepository: ICoachingRepository,
  ) { }

  async createCoaching(data: CreateCoachingDto): Promise<void> {
    await this._coachingRepository.createCoaching(data)
  }

  async getCoaching(
    query: CoachingQueryDto,
    role: Role
  ): Promise<GetAllCoachingResponseDto> {

    const repositoryQuery: CoachingQueryDto = {
      ...query,
    };

    if (role !== ROLES.ADMIN) {
      repositoryQuery.isActive = true;
    }

    const { data, pagination } =
      await this._coachingRepository.getCoaching(repositoryQuery);

    return {
      data: data.map((coaching) => CoachingMapper.toDto(coaching)),
      pagination,
    };
  }

  getCoachingServiceById(serviceId: string): Promise<CoachingDetailDto | null> {
    return this._coachingRepository.getCoachingServiceById(serviceId);
  }

  async updateCoachingService(serviceId: string, data: UpdateCoachingDto): Promise<void> {
    const existingService = await this._coachingRepository.getCoachingServiceById(serviceId);
    if (!existingService) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.COACHING.COACHING_NOT_FOUND);
    }
    await this._coachingRepository.updateCoachingService(serviceId, data);
  }

  async toggleCoachingStatus(serviceId: string): Promise<void> {
    const existingService = await this._coachingRepository.getCoachingServiceById(serviceId);
    if (!existingService) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.COACHING.COACHING_NOT_FOUND);
    }
    await this._coachingRepository.toggleCoachingStatus(serviceId);
  }



}