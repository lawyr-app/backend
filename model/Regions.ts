import { Schema, model } from "mongoose";
import { MODELS_TYPE } from "../constant/models";

const regionsSchema = new Schema(
  {
    name: String,
    uniqueId: String,
    lastTrained: Date,
  },
  { timestamps: true }
);

export const RegionsModel = model(MODELS_TYPE.Region, regionsSchema);
