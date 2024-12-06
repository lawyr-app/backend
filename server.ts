import { fastify } from "fastify";
import registerRoutes from "./route";
import { connectDB } from "./utils/connectDb";
import { PORT_NUMBER } from "./constant/envvariables";
import cors from "@fastify/cors";

require("dotenv").config();

const MONGODB = process.env.MONGODB!;

const server = fastify({
  logger: true,
});

server.register(cors, {
  origin: "*", // Replace '*' with your specific domain(s) if needed
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
});

registerRoutes(server);

connectDB({
  onSuccess: () => {
    server
      .listen({
        port: PORT_NUMBER,
        host: "0.0.0.0",
      })
      .then((res) => {
        console.log(`server running at ${res}`);
      })
      .catch((err) => {
        console.log(`server couldnt run on ${PORT_NUMBER} due to ${err}`);
      });
  },
  mogoUrl: MONGODB,
});
