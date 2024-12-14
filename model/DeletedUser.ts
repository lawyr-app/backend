import { Schema, model } from "mongoose";
import { MODELS_TYPE } from "../constant/models";
const { ObjectId } = Schema.Types;

const deletedUserSchema = new Schema(
  {
    userId: {
      type: ObjectId,
      ref: MODELS_TYPE.User,
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
