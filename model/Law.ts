import { Schema, model } from "mongoose";
const { ObjectId } = Schema.Types;

const lawSchema = new Schema(
  {
    websiteUrl: String,
    actDate: Date,
    actNumber: Date,
    shortTitle: String,
    pdfs: [
      {
        title: String,
        pdfUrl: String,
      },
    ],
    isTrained: {
      type: Boolean,
      default: false,
    },
    error: String,
  },
  { timestamps: true }
);

export const LawModel = model("Law", lawSchema);
