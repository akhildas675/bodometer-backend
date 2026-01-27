import { ITrainerRepository } from "../../interfaces/trainer/trainer-repository.interface";
import { TrainerWorkoutList } from "../../interfaces/trainer/trainer.interface";
import { WorkoutModel } from "../../models/workout.model";

export default class TrainerRepository implements ITrainerRepository {
    async getWorkoutList(): Promise<TrainerWorkoutList[]> {
        const docs = await WorkoutModel.find();
        return docs.map(doc => ({
            id: doc._id.toString(),
            workoutName: doc.workoutName
        }))
    }

}