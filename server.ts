import { fastify } from "fastify";
import registerRoutes from "./route";
import { connectDB } from "./utils/connectDb";

require("dotenv").config();

const PORT = process.env.PORT || 7000;
const MONGODB = process.env.MONGODB!;

const server = fastify({
  logger: true,
});

registerRoutes(server);

connectDB({
  onSuccess: () => {
    server
      .listen({
        port: 8000,
        host: "0.0.0.0",
      })
      .then((res) => {
        console.log(`server running at ${res}`);
      })
      .catch((err) => {
        console.log(`server couldnt run on ${PORT} due to ${err}`);
        process.exit(1);
      });
  },
  mogoUrl: MONGODB,
});
