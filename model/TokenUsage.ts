import { Schema, model } from "mongoose";
import { MODELS_TYPE } from "../constant/models";
import { subscriptionType } from "../constant/subscription";

const subscriptionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: MODELS_TYPE.User,
    },
    balance: { type: Number, default: 10000, required: true },
    type: {
      type: String,
      required: true,
      default: subscriptionType.FREE,
      enum: [
        subscriptionType.BASIC,
        subscriptionType.FREE,
        subscriptionType.PRO,
      ],
    },
  },
  { timestamps: true }
);

export const SubscriptionModel = model(
  MODELS_TYPE.Subscription,
  subscriptionSchema
);
