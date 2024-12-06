import { Schema, model } from "mongoose";
import { MODELS_TYPE } from "../constant/models";

const chatSchema = new Schema(
  {
    firstMessage: String,
  },
  { timestamps: true }
);

export const ChatModel = model(MODELS_TYPE.Chat, chatSchema);
