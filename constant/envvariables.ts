require("dotenv").config();

const GROQ_API_KEY = process.env.GROQ;
const MONGODB_URL = process.env.MONGODB;
const PORT_NUMBER = process.env.PORT ? +process.env.PORT : 7000;
const HUGGING_FACE_TOKEN = process.env.HF_TOKEN;

export { GROQ_API_KEY, MONGODB_URL, PORT_NUMBER, HUGGING_FACE_TOKEN };
