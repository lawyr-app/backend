import { FastifyInstance } from "fastify";
import utilRoutes from "./utils";
import chatRoutes from "./chat";

const registerRoutes = (fastify: FastifyInstance) => {
  fastify.get("/", (req, reply) => {
    reply.send({
      message: "Hello",
    });
  });
  fastify.register(utilRoutes, { prefix: "/utils" });
  fastify.register(chatRoutes, { prefix: "/chat" });
};

export default registerRoutes;
