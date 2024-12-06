import { Schema, model } from "mongoose";
import { MODELS_TYPE } from "../constant/models";

const subscriptionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: MODELS_TYPE.User,
    },
  },
  { timestamps: true }
);

export const SubscriptionModel = model(
  MODELS_TYPE.Subscription,
  subscriptionSchema
);
