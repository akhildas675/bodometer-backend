import mongoose, { Document, Schema } from "mongoose";

export interface ICategoryModel extends Document{
    categoryName:string,
    description:string,
    media:{
        image:string,
        coverPhoto:string,
    }
    detailDescription:string[],
    keyFeatures:string[],
    isActive:boolean,
    createdAt:Date,
    updatedAt:Date,

}

const CategorySchema = new Schema<ICategoryModel>(
  {
    categoryName: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    media: {
      image: {
        type: String,
        required: true
      },
      coverPhoto: {
        type: String,
        required: true
      }
    },
    detailDescription: {
      type: [String],
      required: true
    },
    keyFeatures: {
      type: [String],
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export const CategoryModel = mongoose.model<ICategoryModel>("Category", CategorySchema);