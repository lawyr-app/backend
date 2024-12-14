import { Schema, model } from "mongoose";
import { MODELS_TYPE } from "../constant/models";
const { ObjectId } = Schema.Types;

const deletedUserSchema = new Schema(
  {
    userId: {
      type: ObjectId,
      ref: "Embedding",
    },
    reason: String,
  },
  {
    timestamps: true,
  }
);

export const DeletedUserModel = model(
  MODELS_TYPE.DeletedUser,
  deletedUserSchema
);
