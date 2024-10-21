import { Schema, model } from "mongoose";
const { ObjectId } = Schema.Types;

const embeddingSchema = new Schema(
  {
    content: String,
    part: Number,
    embeddings: [Number],
    vector: [[Number]],
    lawId: {
      type: ObjectId,
      ref: "Region",
    },
    regionId: {
      type: ObjectId,
      ref: "Region",
    },
    pineconeIds: [String],
  },
  { timestamps: true }
);

export const EmbeddingModel = model("Embedding", embeddingSchema);
