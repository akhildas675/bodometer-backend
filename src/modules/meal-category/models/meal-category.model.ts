import mongoose, { Schema, Document } from "mongoose";

export interface IMealCategory extends Document {
    title:string;
    description:string;
    isActive:boolean;
    createdAt:Date;
    updatedAt:Date;
}

const MealCategorySchema = new Schema<IMealCategory>(
    {
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,

    },
    isActive:{
        type:Boolean,
        default:true
    }

},
{timestamps:true})

export const MealCategoryModel = mongoose.model<IMealCategory>("MealCategory",MealCategorySchema)