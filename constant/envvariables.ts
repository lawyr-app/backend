require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MONGODB_URL = process.env.MONGODB;
const PORT_NUMBER = process.env.PORT ? +process.env.PORT : 7000;
const PINECONE = process.env.PINECONE;
const JWT_SECRET = process.env.JWT_SECRET;

export {
  MONGODB_URL,
  PORT_NUMBER,
  PINECONE,
  GEMINI_API_KEY,
  JWT_SECRET,
};
