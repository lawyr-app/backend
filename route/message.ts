import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyPluginCallback,
} from "fastify";
import { authMiddleware } from "../prehandlers/user";
import { getChatUserMessages, startMessage } from "../controller/message";

const messageRoutes: FastifyPluginCallback = (
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
  done
) => {
  fastify.route({
    method: ["POST"],
    url: "/start",
    preHandler: [authMiddleware],
    handler: startMessage,
  });

  fastify.route({
    method: ["GET", "HEAD"],
    url: "/user/:chatId",
    preHandler: [authMiddleware],
    handler: getChatUserMessages,
  });

  done();
};

export default messageRoutes;
