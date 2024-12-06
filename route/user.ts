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

const userRoutes: FastifyPluginCallback = (
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
  done
) => {
  fastify.get("/user/:userId", getUser);
  fastify.delete("/user/:userId", deleteUser);
  fastify.put("/signin", signin);
  fastify.post("/signup", signup);
  fastify.put("/update", updateUser);
  fastify.get("/exists/:googleId", userExists);
  done();
};

export default userRoutes;
