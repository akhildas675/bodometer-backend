import { QuestionGroup, QuestionGroupQuery, GetAllQuestionGroupsResponse } from "@/interfaces/domain.interface/onboarding.interface";

export interface IGroupRepository {
  createGroup(data: QuestionGroup): Promise<void>;
  getGroupById(groupId: string): Promise<QuestionGroup | null>;
  updateGroup(groupId: string, data: QuestionGroup): Promise<void>;
  getAllGroups(query: QuestionGroupQuery): Promise<GetAllQuestionGroupsResponse>;
  toggleGroupStatus(groupId: string): Promise<QuestionGroup | null>;
}
