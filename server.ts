import { fastify } from "fastify";
import mongoose from "mongoose";
import registerRoutes from "./route";

const PORT = process.env.PORT || 7000;
const MONGODB = process.env.MONGODB;

const server = fastify({
  logger: true,
});

registerRoutes(server);

const start = async () => {
  try {
    await server.listen({ port: +PORT });
    console.log("Server started successfully");
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
start();
