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
  },
  { timestamps: true }
);

export const ChatModel = model(MODELS_TYPE.Message, messageSchema);
