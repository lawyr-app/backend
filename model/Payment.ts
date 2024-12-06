import { Schema, model } from "mongoose";
import { MODELS_TYPE } from "../constant/models";
const { ObjectId } = Schema.Types;

const paymentSchema = new Schema(
  {
    userId: { type: ObjectId, ref: MODELS_TYPE.User },
    subscriptionId: { type: ObjectId, ref: MODELS_TYPE.Subscription },
  },
  { timestamps: true }
);

export const paymentModel = model(MODELS_TYPE.Payment, paymentSchema);
