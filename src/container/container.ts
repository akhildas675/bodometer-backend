import { loadCategoryBindings } from "@/modules/category/category.bindings";
import { loadSubscriptionBindings } from "@/modules/subscription/subscription.bindings";
import { loadOnboardingBindings } from "@/modules/onboarding/onboarding.bindings";
import { loadTargetMuscleBindings } from "@/modules/target-muscle/target-muscle.bindings";
import { loadEquipmentBindings } from "@/modules/equipment/equipment.bindings";
import { loadExerciseBindings } from "@/modules/exercise/exercise.bindings";
import {Container} from "inversify";

const container = new Container();

loadCategoryBindings(container);
loadSubscriptionBindings(container);
loadOnboardingBindings(container);
loadTargetMuscleBindings(container);
loadEquipmentBindings(container);
loadExerciseBindings(container);

export default container;