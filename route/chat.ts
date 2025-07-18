import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyPluginCallback,
} from "fastify";
import {
  getChatById,
  getChats,
  initiateChat,
  softDeleteChat,
} from "../controller/chat";
import { authMiddleware } from "../prehandlers/user";
import { subscriptionMiddleware } from "../prehandlers/subscription";

const chatRoutes: FastifyPluginCallback = (
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
  done
) => {
  fastify.route({
    method: ["POST"],
    url: "/initiate",
    preHandler: [authMiddleware, subscriptionMiddleware],
    handler: initiateChat,
  });

  fastify.route({
    method: ["GET", "HEAD"],
    url: "/:id",
    preHandler: [authMiddleware],
    handler: getChatById,
  });

  fastify.route({
    method: ["DELETE"],
    url: "/:chatId",
    preHandler: [authMiddleware],
    handler: softDeleteChat,
  });

  fastify.route({
    method: ["GET"],
    url: "/chats",
    preHandler: [authMiddleware],
    handler: getChats,
  });

  done();
};

export default chatRoutes;
