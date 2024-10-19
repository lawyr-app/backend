import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyPluginCallback,
} from "fastify";
import { initiateChat } from "../controller/chat";

const chatRoutes: FastifyPluginCallback = (
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
  done
) => {
  console.log("Registering routes");
  fastify.post("/initiate", initiateChat);
  done();
};

export default chatRoutes;
