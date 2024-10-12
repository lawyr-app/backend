import { Schema, model } from "mongoose";

const regionsSchema = new Schema(
  {
    name: String,
    uniqueId: String,
    lastTrained: Date,
  },
  { timestamps: true }
);

export const RegionsModel = model("Region", regionsSchema);
