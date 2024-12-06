import { FastifyInstance } from "fastify";
import utilRoutes from "./utils";
import chatRoutes from "./chat";
import userRoutes from "./user";

const registerRoutes = (fastify: FastifyInstance) => {
  fastify.get("/api/", (req, reply) => {
    reply.send({
      message: "Hello",
    });
  });
  fastify.register(utilRoutes, { prefix: "/api/utils" });
  fastify.register(chatRoutes, { prefix: "/api/chat" });
  fastify.register(userRoutes, { prefix: "/api/user" });
};

export default registerRoutes;
