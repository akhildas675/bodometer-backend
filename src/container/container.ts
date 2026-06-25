import { loadCategoryBindings } from "@/modules/category/category.bindings";
import { loadSubscriptionBindings } from "@/modules/subscription/subscription.bindings";
import { loadOnboardingBindings } from "@/modules/onboarding/onboarding.bindings";
import { loadTargetMuscleBindings } from "@/modules/target-muscle/target-muscle.bindings";
import { loadEquipmentBindings } from "@/modules/equipment/equipment.bindings";
import { loadExerciseBindings } from "@/modules/exercise/exercise.bindings";
import { loadMealCategoryBindings } from "@/modules/meal-category/meal-category.bindings";
import { loadMealBindings } from "@/modules/meal/meal.bindings";
import { loadHealthLogBindings } from "@/modules/health-log/health-log.bindings";
import { loadWorkoutPlanBindings } from "@/modules/workout-plan/workout-plan.bindings";
import {Container} from "inversify";

const container = new Container();

loadCategoryBindings(container);
loadSubscriptionBindings(container);
loadOnboardingBindings(container);
loadTargetMuscleBindings(container);
loadEquipmentBindings(container);
loadExerciseBindings(container);
loadMealCategoryBindings(container);
loadMealBindings(container);
loadHealthLogBindings(container);
loadWorkoutPlanBindings(container);

export default container;