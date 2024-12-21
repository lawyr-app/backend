import { Schema, model } from "mongoose";
import { MODELS_TYPE } from "../constant/models";
const { ObjectId } = Schema.Types;

const messageSchema = new Schema(
  {
    question: String,
    answer: String,
    chatId: {
      type: ObjectId,
      ref: MODELS_TYPE.Chat,
    },
    createdBy: {
      type: ObjectId,
      ref: MODELS_TYPE.User,
    },
    sharedId: {
      type: ObjectId,
      ref: MODELS_TYPE.Share,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const MessageModel = model(MODELS_TYPE.Message, messageSchema);
