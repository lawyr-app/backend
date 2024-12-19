import { Schema, model } from "mongoose";
import { MODELS_TYPE } from "../constant/models";
const { ObjectId } = Schema.Types;

const chatSchema = new Schema(
  {
    firstQuestion: String,
    isDeleted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: ObjectId,
      ref: MODELS_TYPE.User,
    },
    continuedSharedId: {
      type: ObjectId,
      ref: MODELS_TYPE.Share,
    },
  },
  { timestamps: true }
);

export const ChatModel = model(MODELS_TYPE.Chat, chatSchema);
