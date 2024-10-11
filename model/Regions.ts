import { Schema, model } from "mongoose";
const { ObjectId } = Schema.Types;

const regionsSchema = new Schema(
  {
    name: String,
    uniqueId: String,
    lastTrained: Date,
    laws: [
      {
        type: ObjectId,
        ref: "Region",
      },
    ],
  },
  { timestamps: true }
);

export const RegionsModel = model("Region", regionsSchema);
