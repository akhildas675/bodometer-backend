import mongoose, { Document, Schema } from "mongoose";

export interface ICategory extends Document {
  categoryId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  media: {
    image: {
      url: string;
    };
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    media: {
      image: {
        url: {
          type: String,
          required: true,
        },
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export const CategoryModel = mongoose.model<ICategory>(
  "Category",
  CategorySchema,
);
