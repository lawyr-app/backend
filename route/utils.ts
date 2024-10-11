import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyPluginCallback,
} from "fastify";
import { seedRegions } from "../controller/utils";

const utilRoutes: FastifyPluginCallback = (
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
  done
) => {
  fastify.get("/seed-regions", seedRegions);
  done();
};

export default utilRoutes;
