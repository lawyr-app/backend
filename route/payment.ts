import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyPluginCallback,
} from "fastify";
import { authMiddleware } from "../prehandlers/user";
import { initiatePayment } from "../controller/payment";

const paymentRoutes: FastifyPluginCallback = (
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
  done
) => {
  fastify.route({
    method: ["POST"],
    url: "/initiate",
    preHandler: [authMiddleware],
    handler: initiatePayment,
  });

  done();
};

export default paymentRoutes;
