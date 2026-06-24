import { loadCategoryBindings } from "@/modules/category/category.bindings";
import { loadSubscriptionBindings } from "@/modules/subscription/subscription.bindings";
import { loadOnboardingBindings } from "@/modules/onboarding/onboarding.bindings";
import {Container} from "inversify";

const container = new Container();

loadCategoryBindings(container);
loadSubscriptionBindings(container);
loadOnboardingBindings(container);

export default container;