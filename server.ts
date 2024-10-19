import { fastify } from "fastify";
import registerRoutes from "./route";
import { connectDB } from "./utils/connectDb";
import { PORT_NUMBER } from "./constant/envvariables";

require("dotenv").config();

const MONGODB = process.env.MONGODB!;

const server = fastify({
  logger: true,
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
