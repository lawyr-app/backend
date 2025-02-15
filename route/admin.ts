import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyPluginCallback,
} from "fastify";
import { authMiddleware } from "../prehandlers/user";
import {
  getChats,
  getDeletedUsers,
  getMessages,
  getRegions,
  getShares,
  getUsers,
  processLaw,
  processRegion,
  scrapRegionLaws,
  seedRegions,
  getFavourites,
  getUser,
  updateUser,
} from "../controller/admin";

const adminRoutes: FastifyPluginCallback = (
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
  done
) => {
  fastify.route({
    method: ["GET"],
    url: "/seed-regions",
    // preHandler: [authMiddleware],
    handler: seedRegions,
  });

  fastify.route({
    method: ["GET"],
    url: "/get-regions",
    // preHandler: [authMiddleware],
    handler: getRegions,
  });

  fastify.route({
    method: ["GET"],
    url: "/scrap-region/:id",
    // preHandler: [authMiddleware],
    handler: scrapRegionLaws,
  });

  fastify.route({
    method: ["GET"],
    url: "/process-law/:lawId",
    // preHandler: [authMiddleware],
    handler: processLaw,
  });

  fastify.route({
    method: ["GET"],
    url: "/process-region/:regionId",
    // preHandler: [authMiddleware],
    handler: processRegion,
  });

  fastify.route({
    method: ["GET"],
    url: "/get-users",
    // preHandler: [authMiddleware],
    handler: getUsers,
  });

  fastify.route({
    method: ["GET"],
    url: "/get-deleted-users",
    // preHandler: [authMiddleware],
    handler: getDeletedUsers,
  });

  fastify.route({
    method: ["GET"],
    url: "/get-shares",
    // preHandler: [authMiddleware],
    handler: getShares,
  });

  fastify.route({
    method: ["GET"],
    url: "/get-chats",
    // preHandler: [authMiddleware],
    handler: getChats,
  });
  fastify.route({
    method: ["GET"],
    url: "/get-messages",
    // preHandler: [authMiddleware],
    handler: getMessages,
  });
  fastify.route({
    method: ["GET"],
    url: "/get-favourites",
    // preHandler: [authMiddleware],
    handler: getFavourites,
  });

  fastify.route({
    method: ["GET"],
    url: "/get-user/:userId",
    // preHandler: [authMiddleware],
    handler: getUser,
  });

  fastify.route({
    method: ["PUT"],
    url: "/update-user/:userId",
    // preHandler: [authMiddleware],
    handler: updateUser,
  });

  done();
};

export default adminRoutes;
