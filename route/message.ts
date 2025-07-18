import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyPluginCallback,
} from "fastify";
import { authMiddleware } from "../prehandlers/user";
import {
  getChatUserMessages,
  getMessage,
  startMessage,
} from "../controller/message";
import { subscriptionMiddleware } from "../prehandlers/subscription";

const messageRoutes: FastifyPluginCallback = (
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
  done
) => {
  fastify.route({
    method: ["POST"],
    url: "/start",
    preHandler: [authMiddleware, subscriptionMiddleware],
    handler: startMessage,
  });

  fastify.route({
    method: ["GET", "HEAD"],
    url: "/user/:chatId",
    preHandler: [authMiddleware],
    handler: getChatUserMessages,
  });

  fastify.route({
    method: ["GET"],
    url: "/get/:id",
    handler: getMessage,
  });

  done();
};

export default messageRoutes;
