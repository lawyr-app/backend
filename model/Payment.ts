import { Schema, model } from "mongoose";
import { MODELS_TYPE } from "../constant/models";
import { PAYMENT_STATUS, PLAN_TYPE, TOKENS } from "../constant/payment";
const { ObjectId } = Schema.Types;

const paymentSchema = new Schema(
  {
    userId: { type: ObjectId, ref: MODELS_TYPE.User },
    razorPayId: String,
    amount: Number,
    tokens: {
      type: Number,
      enum: [
        TOKENS.FREE,
        TOKENS.BASIC,
        TOKENS.PRO,
        TOKENS.PREMIUM,
        TOKENS.ULTRA,
      ],
      default: TOKENS.FREE,
    },
    plan: {
      type: String,
      enum: [
        PLAN_TYPE.FREE,
        PLAN_TYPE.BASIC,
        PLAN_TYPE.PRO,
        PLAN_TYPE.PREMIUM,
        PLAN_TYPE.ULTRA,
      ],
      default: PLAN_TYPE.FREE,
    },
    status: {
      type: String,
      enum: [
        PAYMENT_STATUS.SUCCESS,
        PAYMENT_STATUS.FAILED,
        PAYMENT_STATUS.PENDING,
        PAYMENT_STATUS.INITIATED,
        PAYMENT_STATUS.EXPIRED,
        PAYMENT_STATUS.CANCELLED,
      ],
      default: PAYMENT_STATUS.INITIATED,
    },
  },
  { timestamps: true }
);

export const PaymentModel = model(MODELS_TYPE.Payment, paymentSchema);
