import {
  QuestionGroup,
  QuestionGroupQuery,
  GetAllQuestionGroupsResponse,
} from "@/interfaces/domain.interface/onboarding.interface";
import { BaseRepository } from "@/repositories/base/base.repository";
import { GroupModel, IGroup } from "@/models/group.model";
import { IGroupRepository } from "@/interfaces/repository-interface/onboarding/group-repository.interface";

export default class GroupRepository
  extends BaseRepository<QuestionGroup, IGroup>
  implements IGroupRepository
{
  constructor() {
    super(GroupModel);
  }

  protected toInterface(doc: IGroup): QuestionGroup {
    return {
      groupId: doc._id.toString(),
      key: doc.key,
      title: doc.title,
      order: doc.order,
      isActive: doc.isActive,
      createdAt: doc.createdAt?.toISOString(),
    };
  }

  async createGroup(data: QuestionGroup): Promise<void> {
    await GroupModel.create({
      key: data.key,
      title: data.title,
      order: data.order,
      isActive: data.isActive ?? true,
    });
  }

  async getGroupById(groupId: string): Promise<QuestionGroup | null> {
    const doc = await GroupModel.findById(groupId);
    return doc ? this.toInterface(doc as IGroup) : null;
  }

  async updateGroup(groupId: string, data: QuestionGroup): Promise<void> {
    await GroupModel.findByIdAndUpdate(groupId, {
      title: data.title,
      order: data.order,
    });
  }

  async getAllGroups(
    query: QuestionGroupQuery,
  ): Promise<GetAllQuestionGroupsResponse> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: "i" } },
        { key: { $regex: query.search, $options: "i" } },
      ];
    }
    if (query.isActive !== undefined) {
      filter.isActive = query.isActive === true ? { $ne: false } : false;
    }

    const [docs, totalItems] = await Promise.all([
      GroupModel.find(filter).sort({ order: 1 }).skip(skip).limit(limit).exec(),
      GroupModel.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: docs.map((doc) => this.toInterface(doc as IGroup)),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
      },
    };
  }

  async toggleGroupStatus(groupId: string): Promise<QuestionGroup | null> {
    const existing = await GroupModel.findById(groupId).exec();
    if (!existing) return null;

    const doc = await GroupModel.findByIdAndUpdate(
      groupId,
      { $set: { isActive: !existing.isActive } },
      { new: true },
    ).exec();
    return doc ? this.toInterface(doc as IGroup) : null;
  }
}
