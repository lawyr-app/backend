import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyPluginCallback,
} from "fastify";
import { authMiddleware } from "../prehandlers/user";
import {
  deleteFavourite,
  getFavourites,
  makeFavourite,
} from "../controller/favourite";

const favouriteRoutes: FastifyPluginCallback = (
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
  done
) => {
  fastify.route({
    method: ["DELETE"],
    url: "/:favouriteId",
    preHandler: [authMiddleware],
    handler: deleteFavourite,
  });

  fastify.route({
    method: ["POST"],
    url: "/:chatId",
    preHandler: [authMiddleware],
    handler: makeFavourite,
  });

  fastify.route({
    method: ["GET", "HEAD"],
    url: "/favourites",
    preHandler: [authMiddleware],
    handler: getFavourites,
  });

  done();
};

export default favouriteRoutes;
