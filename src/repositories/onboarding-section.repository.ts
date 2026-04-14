import { BaseRepository } from "./base/base.repository";
import { IOnboardingSection, OnboardingSectionModel } from "@/models/onboarding-section.model";
import { IOnboardingSectionRepository } from "@/interfaces/admin/onboarding.section-respository.interface";

export class OnboardingSectionRepository extends BaseRepository<IOnboardingSection, IOnboardingSection> implements IOnboardingSectionRepository {
  constructor() {
    super(OnboardingSectionModel);
  }

  protected toInterface(doc: IOnboardingSection): IOnboardingSection {
    return doc;
  }

  async getAllSections(): Promise<IOnboardingSection[]> {
    const docs = await this.model.find({}).sort({ order: 1 }).exec();
    return docs.map(doc => this.toInterface(doc));
  }

  async getSectionByKey(key: string): Promise<IOnboardingSection | null> {
    return await this.findOne({ key });
  }
}
