import { Schema, model } from "mongoose";
const { ObjectId } = Schema.Types;

const lawSchema = new Schema(
  {
    websiteUrl: String,
    actDate: String,
    actNumber: String,
    shortTitle: String,
    pdfUrl: String,
    isTrained: {
      type: Boolean,
      default: false,
    },
    error: String,
    uniqueId: String,
    regionId: {
      type: ObjectId,
      ref: "Region",
    },
    embeddingsId: [
      {
        type: ObjectId,
        ref: "Embedding",
      },
    ],
  },
  { timestamps: true }
);

export const LawModel = model("Law", lawSchema);
