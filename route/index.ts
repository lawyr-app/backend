import { FastifyInstance } from "fastify";
import utilRoutes from "./utils";
import chatRoutes from "./chat";
import userRoutes from "./user";
import messageRoutes from "./message";
import favouriteRoutes from "./favourite";
import shareRoutes from "./share";

const registerRoutes = (fastify: FastifyInstance) => {
  fastify.get("/api/", (req, reply) => {
    reply.send({
      message: "Hello",
    });
  });
  fastify.register(utilRoutes, { prefix: "/api/utils" });
  fastify.register(chatRoutes, { prefix: "/api/chat" });
  fastify.register(userRoutes, { prefix: "/api/user" });
  fastify.register(messageRoutes, { prefix: "/api/message" });
  fastify.register(favouriteRoutes, { prefix: "/api/favourite" });
  fastify.register(shareRoutes, { prefix: "/api/share" });
};

export default registerRoutes;
