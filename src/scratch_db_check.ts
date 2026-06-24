import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./config/db";
import { UserModel } from "./models/user.model";
import { SubscriptionPlanModel } from "./modules/subscription/models/subscription-plan.model";
import { UserSubscriptionModel } from "./modules/subscription/models/user-subscription.model";

async function run() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("MONGO_URI is not set!");
    return;
  }
  await connectDB(mongoUri);

  const user = await UserModel.findOne({ email: "akhildas@gmail.com" });
  if (!user) {
    console.error("User not found!");
    return;
  }

  const plan = await SubscriptionPlanModel.findOne({ isActive: true });
  if (!plan) {
    console.error("Active subscription plan not found!");
    return;
  }

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30);

  const existingSub = await UserSubscriptionModel.findOne({ userId: user._id });
  if (existingSub) {
    existingSub.subscriptionPlanId = plan._id;
    existingSub.startDate = startDate;
    existingSub.endDate = endDate;
    existingSub.status = "active";
    await existingSub.save();
    console.log("Updated existing subscription:", existingSub);
  } else {
    const newSub = await UserSubscriptionModel.create({
      userId: user._id,
      subscriptionPlanId: plan._id,
      startDate,
      endDate,
      status: "active",
      autoRenew: false,
    });
    console.log("Created new subscription:", newSub);
  }

  process.exit(0);
}

run().catch(console.error);
