import { IOnboardingSection } from "@/models/onboarding-section.model";

export interface IOnboardingSectionRepository {
  getAllSections(): Promise<IOnboardingSection[]>;
  getSectionByKey(key: string): Promise<IOnboardingSection | null>;
}
