import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyPluginCallback,
} from "fastify";
import { authMiddleware } from "../prehandlers/user";
import {
  getRegions,
  processLaw,
  processRegion,
  scrapRegionLaws,
  seedRegions,
} from "../controller/admin";

const adminRoutes: FastifyPluginCallback = (
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
  done
) => {
  fastify.route({
    method: ["GET"],
    url: "/seed-regions",
    preHandler: [authMiddleware],
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

  done();
};

export default adminRoutes;
