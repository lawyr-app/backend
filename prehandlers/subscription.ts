import { FastifyReply, FastifyRequest } from "fastify";
import { ChatModel } from "../model/Chat";
import { MessageModel } from "../model/Message";
import { response } from "../utils/response";
import { SUBSCRIPTION_MESSAGES } from "../constant/messages";

const subscriptionMiddleware = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const userDetails = request.user;

  const chatsLength = await ChatModel.countDocuments({
    createdBy: userDetails._id,
  });
  const messagesLength = await MessageModel.countDocuments({
    createdBy: userDetails._id,
  });

  console.log({
    chatsLength,
    messagesLength,
    "userDetails._id": userDetails._id,
  });

  if (chatsLength >= 3) {
    return reply.status(401).send(
      response({
        isError: true,
        message: SUBSCRIPTION_MESSAGES.CHAT_LIMIT_EXCEED,
      })
    );
  }
  if (messagesLength >= 2) {
    return reply.status(401).send(
      response({
        isError: true,
        message: SUBSCRIPTION_MESSAGES.MESSAGES_LIMIT_EXCEED,
      })
    );
  }
};

export { subscriptionMiddleware };
