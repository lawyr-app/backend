import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyPluginCallback,
} from "fastify";
import { handleRazorpay } from "../controller/webhook";

const webhookRoutes: FastifyPluginCallback = (
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
  done
) => {
  fastify.route({
    method: ["POST"],
    url: "/razorpay",
    handler: handleRazorpay,
  });

  done();
};

export default webhookRoutes;
