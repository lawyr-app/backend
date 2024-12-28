require("dotenv").config();

const GROQ_API_KEY = process.env.GROQ;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MONGODB_URL = process.env.MONGODB;
const PORT_NUMBER = process.env.PORT ? +process.env.PORT : 7000;
const HUGGING_FACE_TOKEN = process.env.HF_TOKEN;
const PINECONE = process.env.PINECONE;

export {
  GROQ_API_KEY,
  MONGODB_URL,
  PORT_NUMBER,
  HUGGING_FACE_TOKEN,
  PINECONE,
  GEMINI_API_KEY,
};
