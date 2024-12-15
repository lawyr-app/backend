import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyPluginCallback,
} from "fastify";
import { authMiddleware } from "../prehandlers/user";
import {
  getShareById,
  deleteShareById,
  getShared,
  updateShared,
  continueChat,
  createShare,
} from "../controller/share";

const shareRoutes: FastifyPluginCallback = (
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
  done
) => {
  fastify.route({
    method: ["GET", "HEAD"],
    url: "/:id",
    preHandler: [authMiddleware],
    handler: getShareById,
  });

  fastify.route({
    method: ["POST"],
    url: "/continue",
    preHandler: [authMiddleware],
    handler: continueChat,
  });
  
  fastify.route({
    method: ["POST"],
    url: "/create",
    preHandler: [authMiddleware],
    handler: createShare,
  });

  fastify.route({
    method: ["POST"],
    url: "/:sharedId",
    preHandler: [authMiddleware],
    handler: deleteShareById,
  });

  fastify.route({
    method: ["PUT"],
    url: "/:sharedId",
    preHandler: [authMiddleware],
    handler: updateShared,
  });

  fastify.route({
    method: ["GET"],
    url: "/shared",
    preHandler: [authMiddleware],
    handler: getShared,
  });

  done();
};

export default shareRoutes;
