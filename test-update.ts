import container from "./src/container/container";
import { EXERCISE_TYPES } from "./src/modules/exercise/exercise.types";
import { IExerciseService } from "./src/modules/exercise/interface/exercise-service.interface";
import { DIFFICULTY_LEVEL } from "./src/constants/fitness.constant";
import mongoose from "mongoose";

async function run() {
    await mongoose.connect("mongodb://localhost:27017/bodometer");
    console.log("Connected");

    const svc = container.get<IExerciseService>(EXERCISE_TYPES.Service);
    
    try {
        await svc.createExercise({
            title: "Test Exercise",
            description: "Test description",
            difficulty: DIFFICULTY_LEVEL.BEGINNER,
            workoutEnvironments: ["HOME"],
            isCompound: false,
            instructions: ["Step 1"],
            categoryIds: [],
            targetMuscleIds: [],
            equipmentIds: [],
        });
        console.log("Created successfully");

        const query = { page: 1, limit: 10 };
        const res = await svc.getAllExercises(query);
        console.log("Found exercises:", res.data.length);
        if (res.data.length > 0) {
            const ex = res.data[0];
            console.log("Updating exercise:", ex.exerciseId);
            
            await svc.updateExercise(ex.exerciseId, {
                title: "Test Exercise Updated",
                description: "Test description updated",
            });
            console.log("Updated successfully");
        }
    } catch (err) {
        console.error("Operation failed:", err);
    }
    await mongoose.disconnect();
}
run();
