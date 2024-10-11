import { FastifyInstance } from "fastify";
import addressRoutes from "./utils";

const registerRoutes = (fastify: FastifyInstance) => {
  fastify.register(addressRoutes);
};

export default registerRoutes;
