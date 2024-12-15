import { Schema, model } from "mongoose";
import { MODELS_TYPE } from "../constant/models";
const { ObjectId } = Schema.Types;

const shareSchema = new Schema(
  {
    chatId: {
      type: ObjectId,
      ref: MODELS_TYPE.Chat,
    },
    createdBy: {
      type: ObjectId,
      ref: MODELS_TYPE.User,
    },
    title: String,
    isPublic: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const ShareModel = model(MODELS_TYPE.Share, shareSchema);
