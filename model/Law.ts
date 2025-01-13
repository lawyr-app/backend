import { Schema, model } from "mongoose";
import { MODELS_TYPE } from "../constant/models";
const { ObjectId } = Schema.Types;

const lawSchema = new Schema(
  {
    websiteUrl: String,
    pdfUrl: String,
    actDate: String,
    actNumber: String,
    shortTitle: String,
    seoTitle: String,
    error: String,
    rawText: String,
    regionId: {
      type: ObjectId,
      ref: "Region",
    },
    pineconeIds: [String],
  },
  { timestamps: true }
);

export const LawModel = model(MODELS_TYPE.Law, lawSchema);
