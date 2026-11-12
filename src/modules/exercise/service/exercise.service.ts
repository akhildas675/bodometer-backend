import { inject, injectable } from "inversify";
import { AppError } from "@/utils/appError";
import { STATUS } from "@/constants/constant.values.ts/statuscode";
import { MESSAGES } from "@/constants/messages";
import { generateKeySlug } from "@/utils/string-formatters";
import { IExerciseService } from "../interface/exercise-service.interface";
import { IExerciseRepository } from "../interface/exercise-repository.interface";
import { EXERCISE_TYPES } from "../exercise.types";
import { ExerciseMapper } from "../mapper/exercise.mapper";
import { Exercise } from '@/modules/exercise/interface/exercise.interface';
import { IS3Service } from '@/modules/s3/interface/s3-service.interface';
import { get, set, del, delPattern } from "@/config/redis";
import logger from "@/utils/logger";
import {
    CreateExerciseDto,
    ExerciseDto,
    ExerciseQueryDto,
    GetAllExercisesResponseDto,
    ToggleExerciseStatusResponseDto,
    UpdateExerciseDto,
} from "../dto/exercise.dto";

@injectable()
export class ExerciseService implements IExerciseService {
    constructor(
        @inject(EXERCISE_TYPES.Repository)
        private _exerciseRepository: IExerciseRepository,
        @inject(Symbol.for("S3Service")) private _s3Service: IS3Service,
    ) {}

    async createExercise(data: CreateExerciseDto): Promise<void> {
        const isExist = await this._exerciseRepository.findExerciseByTitle(data.title);
        if (isExist) {
            throw new AppError(STATUS.CONFLICT, MESSAGES.EXERCISE.EXISTS);
        }

        if (!data.image) {
            throw new AppError(STATUS.BAD_REQUEST, MESSAGES.EXERCISE.IMAGE_REQUIRED);
        }

        const key = generateKeySlug(data.title);
        const imageUrl = await this._s3Service.uploadFile(data.image, `exercises/${key}`);

        let videoUrl: string | undefined;
        if (data.video) {
            videoUrl = await this._s3Service.uploadFile(data.video, `exercises/${key}_video`);
        }

        const exerciseData: Exercise = {
            key,
            title: data.title,
            description: data.description,
            instructions: data.instructions,
            media: {
                image: imageUrl,
                videoUrl,
            },
            categoryIds: data.categoryIds,
            targetMuscleIds: data.targetMuscleIds,
            equipmentIds: data.equipmentIds ?? [],
            workoutEnvironments: data.workoutEnvironments ?? [],
            difficulty: data.difficulty,
            isCompound: data.isCompound ?? false,
        };

        await this._exerciseRepository.createExercise(exerciseData);

        // Invalidate exercise caches
        try {
            await delPattern('exercise:all:*');
            logger.info('Exercise caches invalidated after create');
        } catch (error) {
            logger.error({ error }, 'Exercise cache invalidation error');
        }
    }

    async getAllExercises(query: ExerciseQueryDto): Promise<GetAllExercisesResponseDto> {
        // Check cache first
        const cacheKey = `exercise:all:${JSON.stringify(query)}`;
        try {
            const cached = await get(cacheKey);
            if (cached) {
                logger.info('Exercise list cache hit');
                return JSON.parse(cached) as GetAllExercisesResponseDto;
            }
        } catch (error) {
            logger.error({ error }, 'Exercise cache read error');
        }

        const { data, pagination } = await this._exerciseRepository.getAllExercises(query);
        const result: GetAllExercisesResponseDto = {
            data: ExerciseMapper.toExerciseDtoList(data),
            pagination,
        };

        // Cache for 1 hour
        try {
            await set(cacheKey, JSON.stringify(result), 3600);
            logger.info('Exercise list cached');
        } catch (error) {
            logger.error({ error }, 'Exercise cache write error');
        }

        return result;
    }

    async getExerciseById(exerciseId: string): Promise<ExerciseDto> {
        // Check cache first
        const cacheKey = `exercise:byId:${exerciseId}`;
        try {
            const cached = await get(cacheKey);
            if (cached) {
                logger.info('Exercise by ID cache hit');
                return JSON.parse(cached) as ExerciseDto;
            }
        } catch (error) {
            logger.error({ error }, 'Exercise cache read error');
        }

        const exercise = await this._exerciseRepository.getExerciseById(exerciseId);
        if (!exercise) {
            throw new AppError(STATUS.NOT_FOUND, MESSAGES.EXERCISE.NOT_FOUND);
        }

        const result = ExerciseMapper.toExerciseDto(exercise);

        // Cache for 1 hour
        try {
            await set(cacheKey, JSON.stringify(result), 3600);
            logger.info('Exercise by ID cached');
        } catch (error) {
            logger.error({ error }, 'Exercise cache write error');
        }

        return result;
    }

    async updateExercise(exerciseId: string, data: UpdateExerciseDto): Promise<void> {
        const exercise = await this._exerciseRepository.getExerciseById(exerciseId);
        if (!exercise) {
            throw new AppError(STATUS.NOT_FOUND, MESSAGES.EXERCISE.NOT_FOUND);
        }

        const updateData: Partial<Exercise> = {
            title: data.title,
            description: data.description,
            instructions: data.instructions,
            categoryIds: data.categoryIds,
            targetMuscleIds: data.targetMuscleIds,
            equipmentIds: data.equipmentIds,
            workoutEnvironments: data.workoutEnvironments,
            difficulty: data.difficulty,
            isCompound: data.isCompound,
        };

        if (data.video) {
            const videoUrl = await this._s3Service.uploadFile(data.video, `exercises/${exercise.key}_video`);
            updateData.media = { ...exercise.media, videoUrl };
        }

        if (data.image) {
            const imageUrl = await this._s3Service.uploadFile(data.image, `exercises/${exercise.key}`);
            updateData.media = {
                ...(updateData.media ?? exercise.media),
                image: imageUrl,
            };
        }

        await this._exerciseRepository.updateExercise(exerciseId, updateData);

        // Invalidate exercise caches
        try {
            await delPattern('exercise:all:*');
            await del(`exercise:byId:${exerciseId}`);
            logger.info('Exercise caches invalidated after update');
        } catch (error) {
            logger.error({ error }, 'Exercise cache invalidation error');
        }
    }

    async toggleExerciseStatus(exerciseId: string): Promise<ToggleExerciseStatusResponseDto> {
        const exercise = await this._exerciseRepository.toggleExerciseStatus(exerciseId);
        if (!exercise) {
            throw new AppError(STATUS.NOT_FOUND, MESSAGES.EXERCISE.NOT_FOUND);
        }

        // Invalidate exercise caches
        try {
            await delPattern('exercise:all:*');
            await del(`exercise:byId:${exerciseId}`);
            logger.info('Exercise caches invalidated after status toggle');
        } catch (error) {
            logger.error({ error }, 'Exercise cache invalidation error');
        }

        return {
            message: exercise.isActive
                ? MESSAGES.EXERCISE.UNBLOCKED
                : MESSAGES.EXERCISE.BLOCKED,
            exerciseId: exercise._id || "",
            isActive: exercise.isActive ?? true,
        };
    }
}
