import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyPluginCallback,
} from "fastify";
import { authMiddleware } from "../prehandlers/user";
import {
  processLaw,
  processRegion,
  scrapRegionLaws,
  seedRegions,
  updateUser,
} from "../controller/admin";
import {
  getFavourites,
  getUser,
  getChats,
  getDeletedUsers,
  getMessages,
  getRegions,
  getShares,
  getUsers,
} from "../controller/admin/get";
import {
  deleteFavourite,
  deleteRegion,
  deleteMessage,
  deleteLaw,
  deleteChat,
  deleteShare,
  deleteUser,
  deleteDeletedUser,
} from "../controller/admin/delete";

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

  fastify.register(deleteRoutes, { prefix: "/delete" });
  fastify.register(updateRoutes, { prefix: "/update" });
  fastify.register(getRoutes, { prefix: "/get" });

  done();
};

export default adminRoutes;

const deleteRoutes: FastifyPluginCallback = async (
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
  done
) => {
  fastify.route({
    method: ["DELETE"],
    url: "/favourite/:id",
    handler: deleteFavourite,
  });
  fastify.route({
    method: ["DELETE"],
    url: "/share/:id",
    handler: deleteShare,
  });
  fastify.route({
    method: ["DELETE"],
    url: "/chat/:id",
    handler: deleteChat,
  });
  fastify.route({
    method: ["DELETE"],
    url: "/law/:id",
    handler: deleteLaw,
  });
  fastify.route({
    method: ["DELETE"],
    url: "/message/:id",
    handler: deleteMessage,
  });
  fastify.route({
    method: ["DELETE"],
    url: "/region/:id",
    handler: deleteRegion,
  });
  fastify.route({
    method: ["DELETE"],
    url: "/user/:id",
    handler: deleteUser,
  });
  fastify.route({
    method: ["DELETE"],
    url: "/deleteduser/:id",
    handler: deleteDeletedUser,
  });
  done();
};

const getRoutes: FastifyPluginCallback = async (
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
  done
) => {
  fastify.route({
    method: ["GET"],
    url: "/user/:userId",
    handler: getUser,
  });
  fastify.route({
    method: ["GET"],
    url: "/regions",
    handler: getRegions,
  });
  fastify.route({
    method: ["GET"],
    url: "/users",
    handler: getUsers,
  });
  fastify.route({
    method: ["GET"],
    url: "/shares",
    handler: getShares,
  });
  fastify.route({
    method: ["GET"],
    url: "/favourites",
    handler: getFavourites,
  });
  fastify.route({
    method: ["GET"],
    url: "/deleteusers",
    handler: getDeletedUsers,
  });
  fastify.route({
    method: ["GET"],
    url: "/chats",
    handler: getChats,
  });
  fastify.route({
    method: ["GET"],
    url: "/messages",
    handler: getMessages,
  });

  done();
};

const updateRoutes: FastifyPluginCallback = async (
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
  done
) => {
  fastify.route({
    method: ["PUT"],
    url: "/user/:userId",
    handler: updateUser,
  });

  done();
};
