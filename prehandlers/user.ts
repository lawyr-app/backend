import {
  FastifyReply,
  FastifyRequest,
  FastifyInstance,
  FastifyPluginOptions,
} from "fastify";
import { UserModel } from "../model/User";
const { OAuth2Client } = require("google-auth-library");

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_AUTH;
const client = new OAuth2Client(CLIENT_ID);

const googleAuthMiddleware = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const authHeader = request?.headers?.authorization;

  if (!authHeader) {
    return reply.status(401).send({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return reply.status(401).send({ error: "Invalid authorization format" });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const user = await UserModel.findOne({
      googleId: payload.sub,
    });
    request.user = user;
  } catch (err) {
    console.error(err);
    return reply.status(401).send({ error: "Invalid token" });
  }
};

export const authMiddleware = googleAuthMiddleware;
