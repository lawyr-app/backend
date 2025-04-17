import { FastifyInstance } from "fastify";
import chatRoutes from "./chat";
import userRoutes from "./user";
import messageRoutes from "./message";
import favouriteRoutes from "./favourite";
import shareRoutes from "./share";
import adminRoutes from "./admin";
import paymentRoutes from "./payment";
import webhookRoutes from "./webhook";

const registerRoutes = (fastify: FastifyInstance) => {
  fastify.get("/api/", (req, reply) => {
    reply.send({
      message: "Bhokan bot",
    });
  });
  fastify.register(chatRoutes, { prefix: "/api/chat" });
  fastify.register(userRoutes, { prefix: "/api/user" });
  fastify.register(messageRoutes, { prefix: "/api/message" });
  fastify.register(favouriteRoutes, { prefix: "/api/favourite" });
  fastify.register(shareRoutes, { prefix: "/api/share" });
  fastify.register(adminRoutes, { prefix: "/api/admin" });
  fastify.register(paymentRoutes, { prefix: "/api/payment" });
  fastify.register(webhookRoutes, { prefix: "/api/webhook" });
};

export default registerRoutes;
