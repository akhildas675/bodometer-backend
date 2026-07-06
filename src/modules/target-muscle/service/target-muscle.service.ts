import { inject, injectable } from "inversify";
import { AppError } from "@/utils/appError";
import { STATUS } from "@/constants/statuscode";
import { MESSAGES } from "@/constants/messages";
import { ITargetMuscleService } from "../interface/target-muscle-service.interface";
import { ITargetMuscleRepository } from "../interface/target-muscle-repository.interface";
import { TARGET_MUSCLE_TYPES } from "../target-muscle.types";
import { TargetMuscleMapper } from "../mapper/target-muscle.mapper";
import { TargetMuscle } from '@/modules/target-muscle/interface/target.muscle.interface';
import { IS3Service } from '@/modules/s3/interface/s3-service.interface';
import {
  CreateTargetMuscleDto,
  GetAllTargetMusclesResponseDto,
  TargetMuscleDto,
  TargetMuscleQueryDto,
  ToggleTargetMuscleStatusResponseDto,
  UpdateTargetMuscleDto,
} from "../dto/target-muscle.dto";

@injectable()
export class TargetMuscleService implements ITargetMuscleService {
  constructor(
    @inject(TARGET_MUSCLE_TYPES.Repository)
    private _targetMuscleRepository: ITargetMuscleRepository,
    @inject(Symbol.for("S3Service")) private _s3Service: IS3Service,
  ) {}

  async createTargetMuscle(data: CreateTargetMuscleDto): Promise<void> {
    const isExisting =
      await this._targetMuscleRepository.findTargetMuscleByTitle(data.title);

    if (isExisting) {
      throw new AppError(
        STATUS.CONFLICT,
        MESSAGES.TARGET_MUSCLE.EXISTS,
      );
    }

    const key = data.title.toLowerCase().replace(/[\s-]/g, "_");
    
    if (!data.image) {
      throw new AppError(STATUS.BAD_REQUEST, "Image is required");
    }

    const imageUrl = await this._s3Service.uploadFile(
      data.image,
      `target-muscles/${key}`
    );

    const targetMuscleData: TargetMuscle = {
      key,
      title: data.title,
      description: data.description,
      bodyRegion: data.bodyRegion,
      image: imageUrl,
    };

    await this._targetMuscleRepository.createTargetMuscle(targetMuscleData);
  }

  async getAllTargetMuscles(
    query: TargetMuscleQueryDto,
  ): Promise<GetAllTargetMusclesResponseDto> {
    const { data, pagination } =
      await this._targetMuscleRepository.getAllTargetMuscles(query);
    return {
      data: TargetMuscleMapper.toTargetMuscleDtoList(data),
      pagination,
    };
  }

  async getTargetMuscleById(targetMuscleId: string): Promise<TargetMuscleDto> {
    const targetMuscle =
      await this._targetMuscleRepository.getTargetMuscleById(targetMuscleId);
    if (!targetMuscle) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.TARGET_MUSCLE.NOT_FOUND);
    }

    return TargetMuscleMapper.toTargetMuscleDto(targetMuscle);
  }

  async updateTargetMuscle(
    targetMuscleId: string,
    data: UpdateTargetMuscleDto,
  ): Promise<void> {
    const targetMuscle =
      await this._targetMuscleRepository.getTargetMuscleById(targetMuscleId);
    if (!targetMuscle) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.TARGET_MUSCLE.NOT_FOUND);
    }

    const updateData: Partial<TargetMuscle> = {
      title: data.title,
      description: data.description,
      bodyRegion: data.bodyRegion,
    };

    if (data.image) {
      const imageUrl = await this._s3Service.uploadFile(
        data.image,
        `target-muscles/${targetMuscle.key}`
      );
      updateData.image = imageUrl;
    }

    await this._targetMuscleRepository.updateTargetMuscle(
      targetMuscleId,
      updateData,
    );
  }

  async toggleTargetMuscleStatus(
    targetMuscleId: string,
  ): Promise<ToggleTargetMuscleStatusResponseDto> {
    const targetMuscle =
      await this._targetMuscleRepository.toggleTargetMuscleStatus(
        targetMuscleId,
      );
    if (!targetMuscle) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.TARGET_MUSCLE.NOT_FOUND);
    }

    return {
      message: targetMuscle.isActive
        ? "Target muscle unblocked successfully"
        : "Target muscle blocked successfully",
      targetMuscleId: targetMuscle._id || "",
      isActive: targetMuscle.isActive ?? true,
    };
  }
}
