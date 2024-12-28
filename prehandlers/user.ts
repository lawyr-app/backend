import { FastifyReply, FastifyRequest } from "fastify";
import { UserModel } from "../model/User";
import { response } from "../utils/response";
import { TOKEN_MESSAGES, USER_MESSAGES } from "../constant/messages";
import { jwtDecode } from "jwt-decode";

const googleAuthMiddleware = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const authHeader = request?.headers?.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return reply
      .status(401)
      .send(response({ isError: true, message: TOKEN_MESSAGES.TOKEN_INVALID }));
  }

  try {
    const decodedToken = jwtDecode(token);
    if (decodedToken && "userId" in decodedToken) {
      const { userId } = decodedToken;
      const user = await UserModel.findOne({
        _id: userId,
        isDeleted: false,
      });
      if (!user) {
        return reply
          .status(401)
          .send(
            response({ isError: true, message: USER_MESSAGES.USER_DONT_EXISTS })
          );
      }
      if (user && !user?.tokenDetails?.expiresAt) {
        return reply
          .status(401)
          .send(
            response({ isError: true, message: TOKEN_MESSAGES.TOKEN_EXPIRED })
          );
      }
      if (
        user?.tokenDetails?.expiresAt &&
        new Date() > new Date(user.tokenDetails.expiresAt)
      ) {
        return reply
          .status(401)
          .send(
            response({ isError: true, message: TOKEN_MESSAGES.TOKEN_EXPIRED })
          );
      }
      request.user = user;
    } else {
      return reply
        .status(401)
        .send(
          response({ isError: true, message: TOKEN_MESSAGES.TOKEN_INVALID })
        );
    }
  } catch (err) {
    console.error(err);
    return reply
      .status(401)
      .send(response({ isError: true, message: TOKEN_MESSAGES.TOKEN_INVALID }));
  }
};

export const authMiddleware = googleAuthMiddleware;
