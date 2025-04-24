import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyPluginCallback,
} from "fastify";
import {
  signup,
  updateUser,
  getUser,
  deleteUser,
  signin,
  userExists,
} from "../controller/user";
import { authMiddleware } from "../prehandlers/user";

const userRoutes: FastifyPluginCallback = (
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
  done
) => {
  fastify.route({
    method: ["GET"],
    url: "/:userId",
    preHandler: [authMiddleware],
    handler: getUser,
  });

  fastify.route({
    method: ["POST"],
    url: "/delete",
    preHandler: [authMiddleware],
    handler: deleteUser,
  });

  fastify.route({
    method: ["PUT"],
    url: "/signin",
    handler: signin,
  });

  fastify.route({
    method: ["POST"],
    url: "/signup",
    handler: signup,
  });

  fastify.route({
    method: ["PUT"],
    url: "/update",
    preHandler: [authMiddleware],
    handler: updateUser,
  });

  fastify.route({
    method: ["POST"],
    url: "/exists",
    handler: userExists,
  });
  done();
};

export default userRoutes;
