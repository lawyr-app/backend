import { Schema, model } from "mongoose";
import { MODELS_TYPE } from "../constant/models";
const { ObjectId } = Schema.Types;

const favouriteSchema = new Schema(
  {
    chatId: {
      type: ObjectId,
      ref: MODELS_TYPE.Chat,
    },
    createdBy: {
      type: ObjectId,
      ref: MODELS_TYPE.User,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const FavouriteModel = model(MODELS_TYPE.Favourite, favouriteSchema);
