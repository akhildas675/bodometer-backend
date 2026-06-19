import { loadCategoryBindings } from "@/modules/category/category.bindings";
import {Container} from "inversify";

const container = new Container();

loadCategoryBindings(container);

export default container