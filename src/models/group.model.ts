import mongoose, { Schema, Document } from "mongoose";

export interface IGroup extends Document {
  key: string;        
  title: string;      
  order: number;      
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GroupSchema = new Schema<IGroup>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    order: {
      type: Number,
      required: true,
      index: true
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  { timestamps: true }
);

export const GroupModel = mongoose.model("Group", GroupSchema);