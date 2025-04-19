import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyPluginCallback,
} from "fastify";
import { authMiddleware } from "../prehandlers/user";
import { getPayment, getPayments, initiatePayment } from "../controller/payment";

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
  fastify.route({
    method: ["GET"],
    url: "/payments",
    preHandler: [authMiddleware],
    handler: getPayments,
  });
  fastify.route({
    method: ["GET"],
    url: "/payment/:id",
    preHandler: [authMiddleware],
    handler: getPayment,
  });

  done();
};

export default paymentRoutes;
