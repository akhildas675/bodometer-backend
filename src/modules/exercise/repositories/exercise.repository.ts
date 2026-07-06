import { injectable } from "inversify";
import { IExerciseRepository } from "../interface/exercise-repository.interface";
import { BaseRepository } from '@/modules/base/repository/base.repository';
import { Exercise } from '@/modules/exercise/interface/exercise.interface';
import { IExercise, ExerciseModel } from "@/modules/exercise/models/exercise.model";
import { PaginatedResult } from '@/modules/base/interface/common.interface';
import { ExerciseQueryDto } from "../dto/exercise.dto";
import mongoose from "mongoose";

@injectable()
export default class ExerciseRepository extends BaseRepository<Exercise, IExercise> implements IExerciseRepository {

    constructor() {
        super(ExerciseModel);
    }

    protected toInterface(doc: IExercise): Exercise {
        return {
            _id: doc._id.toString(),
            key: doc.key,
            title: doc.title,
            description: doc.description || "",
            instructions: doc.instructions ?? [],
            media: {
                image: doc.media?.image || "",
                videoUrl: doc.media?.videoUrl,
            },
            categoryIds: doc.categoryIds?.map((id: unknown) => {
                const ref = id as { _id?: mongoose.Types.ObjectId };
                return ref._id ? ref._id.toString() : String(id);
            }) ?? [],
            targetMuscleIds: doc.targetMuscleIds?.map((id: unknown) => {
                const ref = id as { _id?: mongoose.Types.ObjectId };
                return ref._id ? ref._id.toString() : String(id);
            }) ?? [],
            equipmentIds: doc.equipmentIds?.map((id: unknown) => {
                const ref = id as { _id?: mongoose.Types.ObjectId };
                return ref._id ? ref._id.toString() : String(id);
            }) ?? [],
            targetMuscles: doc.targetMuscleIds?.map((m: unknown) => {
                const ref = m as { title?: string };
                return ref.title || String(m);
            }) ?? [],
            equipment: doc.equipmentIds?.map((e: unknown) => {
                const ref = e as { title?: string };
                return ref.title || String(e);
            }) ?? [],
            difficulty: doc.difficulty,
            workoutEnvironments: doc.workoutEnvironments ?? [],
            isCompound: doc.isCompound ?? false,
            isActive: doc.isActive ?? true,
        };
    }

    async createExercise(data: Exercise): Promise<Exercise> {
        return await this.create({ ...data });
    }

    async getAllExercises(query: ExerciseQueryDto): Promise<PaginatedResult<Exercise>> {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;

        const filter: Record<string, unknown> = {};
        if (query.search) {
            filter.title = { $regex: query.search, $options: "i" };
        }
        if (query.difficulty) {
            filter.difficulty = query.difficulty;
        }
        if (query.targetMuscleId) {
            filter.targetMuscleIds = new mongoose.Types.ObjectId(query.targetMuscleId);
        }
        if (query.categoryId) {
            filter.categoryIds = new mongoose.Types.ObjectId(query.categoryId);
        }
        if (query.status) {
            filter.isActive = query.status === "true";
        }

        const [docs, totalItems] = await Promise.all([
            this.model.find(filter)
                .populate("targetMuscleIds", "title")
                .populate("equipmentIds", "title")
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .exec(),
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

    async getExerciseById(exerciseId: string): Promise<Exercise | null> {
        const doc = await this.model.findById(exerciseId)
            .populate("targetMuscleIds", "title")
            .populate("equipmentIds", "title")
            .exec();
        return doc ? this.toInterface(doc) : null;
    }

    async updateExercise(exerciseId: string, data: Partial<Exercise>): Promise<Exercise | null> {
        const updateData = { ...data } as Record<string, unknown>;
        delete updateData["_id"];
        return await this.updateById(exerciseId, updateData as Partial<IExercise>);
    }

    async toggleExerciseStatus(exerciseId: string): Promise<Exercise | null> {
        const existing = await this.model.findById(exerciseId).exec();
        if (!existing) return null;

        const doc = await this.model.findByIdAndUpdate(
            exerciseId,
            { $set: { isActive: !existing.isActive } },
            { new: true },
        ).exec();
        return doc ? this.toInterface(doc) : null;
    }

    async findExerciseByTitle(title: string): Promise<Exercise | null> {
        return await this.findOne({ title });
    }

    async getExerciseByTitle(): Promise<{ title: string }[]> {
        const docs = await this.model.find().select("title").exec();
        return docs ? docs.map((d) => ({ title: d.title })) : [];
    }

    async findAll(filter?: Record<string, unknown>): Promise<Exercise[]> {
        const docs = await this.model.find(filter || {}).exec();
        return docs.map((doc) => this.toInterface(doc));
    }

    async findByIds(exerciseIds: string[]): Promise<Exercise[]> {
        const docs = await this.model.find({ _id: { $in: exerciseIds } })
            .populate("targetMuscleIds", "title")
            .exec();
        return docs.map((doc) => this.toInterface(doc));
    }
}
