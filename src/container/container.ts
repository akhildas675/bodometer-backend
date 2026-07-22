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
import { loadDietPlanBindings } from "@/modules/diet-plan/diet-plan.bindings";
import {Container} from "inversify";
import { loadAuthBindings } from "@/modules/auth/auth.bindings";
import { loadUserBindings } from "@/modules/user/user.bindings";
import { loadTrainerBindings } from "@/modules/trainer/trainer.bindings";
import { loadBookingBindings } from "@/modules/booking/booking.bindings";
import { loadCoachingBindings } from "@/modules/coaching/coaching.bindings";

const container = new Container();

loadAuthBindings(container);
loadUserBindings(container);
loadTrainerBindings(container);
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
loadDietPlanBindings(container);
loadBookingBindings(container);
loadCoachingBindings(container)


export default container;