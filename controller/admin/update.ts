import { FastifyReply, FastifyRequest } from "fastify";
import { UserModel } from "../../model/User";
import { response } from "../../utils/response";
import {
  CHAT_MESSAGES,
  INTERNAL_SERVER_ERROR,
  MESSAGE_MESSAGES,
  SHARE_MESSAGES,
  USER_MESSAGES,
} from "../../constant/messages";
import { ChatModel } from "../../model/Chat";
import { MessageModel } from "../../model/Message";
import { ShareModel } from "../../model/Share";

type UpdateUserRequestType = FastifyRequest<{
  Body: typeof UserModel;
  Params: {
    userId: string;
  };
}>;
const updateUser = async (req: UpdateUserRequestType, reply: FastifyReply) => {
  try {
    const { userId } = req.params;
    const user = await UserModel.findById(userId);
    if (user) {
      const updatedUser = await UserModel.findByIdAndUpdate(userId, req.body, {
        new: true,
      });
      reply.status(200).send(
        response({
          data: updatedUser,
          isError: false,
          message: USER_MESSAGES.USER_FETCHED_SUCCESSFULLY,
        })
      );
    } else {
      reply.status(400).send(
        response({
          data: null,
          isError: true,
          message: USER_MESSAGES.USER_UPDATING_FAILURE,
        })
      );
    }
  } catch (error) {
    console.error(`Something went wrong in updateUser due to `, error);
    return reply.status(500).send(
      response({
        isError: true,
        message: INTERNAL_SERVER_ERROR,
      })
    );
  }
};

type UpdateChatRequestType = FastifyRequest<{
  Body: typeof ChatModel;
  Params: {
    chatId: string;
  };
}>;
const updateChat = async (req: UpdateChatRequestType, reply: FastifyReply) => {
  try {
    const { chatId } = req.params;
    if (chatId) {
      const chat = await ChatModel.findByIdAndUpdate(chatId, req.body, {
        new: true,
      });
      if (chat) {
        return reply.status(200).send(
          response({
            data: chat,
            isError: false,
            message: CHAT_MESSAGES.CHAT_UPDATED_SUCCESSFULLY,
          })
        );
      }
      reply.status(400).send(
        response({
          data: null,
          isError: true,
          message: CHAT_MESSAGES.CHAT_UPDATION_FAILED,
        })
      );
    } else {
      reply.status(400).send(
        response({
          data: null,
          isError: true,
          message: CHAT_MESSAGES.CHAT_UPDATION_FAILED,
        })
      );
    }
  } catch (error) {
    console.error(`Something went wrong in updateChat due to `, error);
    return reply.status(500).send(
      response({
        isError: true,
        message: INTERNAL_SERVER_ERROR,
      })
    );
  }
};

type UpdateMessageRequestType = FastifyRequest<{
  Body: typeof MessageModel;
  Params: {
    messageId: string;
  };
}>;
const updateMessage = async (
  req: UpdateMessageRequestType,
  reply: FastifyReply
) => {
  try {
    const { messageId } = req.params;
    if (messageId) {
      const message = await MessageModel.findByIdAndUpdate(
        messageId,
        req.body,
        {
          new: true,
        }
      );
      if (message) {
        return reply.status(200).send(
          response({
            data: message,
            isError: false,
            message: MESSAGE_MESSAGES.MESSAGE_UPDATED_SUCCESSFULLY,
          })
        );
      }
      reply.status(400).send(
        response({
          data: null,
          isError: true,
          message: MESSAGE_MESSAGES.MESSAGE_UPDATION_FAILED,
        })
      );
    } else {
      reply.status(400).send(
        response({
          data: null,
          isError: true,
          message: MESSAGE_MESSAGES.MESSAGE_UPDATION_FAILED,
        })
      );
    }
  } catch (error) {
    console.error(`Something went wrong in updateMessage due to `, error);
    return reply.status(500).send(
      response({
        isError: true,
        message: INTERNAL_SERVER_ERROR,
      })
    );
  }
};

type UpdateShareRequestType = FastifyRequest<{
  Body: typeof ShareModel;
  Params: {
    shareId: string;
  };
}>;
const updateShare = async (
  req: UpdateShareRequestType,
  reply: FastifyReply
) => {
  try {
    const { shareId } = req.params;
    if (shareId) {
      const share = await ShareModel.findByIdAndUpdate(shareId, req.body, {
        new: true,
      });
      if (share) {
        return reply.status(200).send(
          response({
            data: share,
            isError: false,
            message: SHARE_MESSAGES.SHARED_UPDATING_SUCCESS,
          })
        );
      }
      reply.status(400).send(
        response({
          data: null,
          isError: true,
          message: SHARE_MESSAGES.SHARED_UPDATING_FAILED,
        })
      );
    } else {
      reply.status(400).send(
        response({
          data: null,
          isError: true,
          message: SHARE_MESSAGES.SHARED_UPDATING_FAILED,
        })
      );
    }
  } catch (error) {
    console.error(`Something went wrong in updateShare due to `, error);
    return reply.status(500).send(
      response({
        isError: true,
        message: INTERNAL_SERVER_ERROR,
      })
    );
  }
};

type UpdateFavouriteRequestType = FastifyRequest<{
  Body: typeof ShareModel;
  Params: {
    favouriteId: string;
  };
}>;
const updateFavourite = async (
  req: UpdateFavouriteRequestType,
  reply: FastifyReply
) => {
  try {
    const { favouriteId } = req.params;
  } catch (error) {
    console.error(`Something went wrong in updateFavourite due to `, error);
    return reply.status(500).send(
      response({
        isError: true,
        message: INTERNAL_SERVER_ERROR,
      })
    );
  }
};

type UpdateDeletedUserRequestType = FastifyRequest<{}>;
const updateDeletedUser = async (
  req: UpdateDeletedUserRequestType,
  reply: FastifyReply
) => {
  try {
  } catch (error) {
    console.error(`Something went wrong in updateDeletedUser due to `, error);
    return reply.status(500).send(
      response({
        isError: true,
        message: INTERNAL_SERVER_ERROR,
      })
    );
  }
};

type UpdateRegionRequestType = FastifyRequest<{}>;
const updateRegion = async (
  req: UpdateRegionRequestType,
  reply: FastifyReply
) => {
  try {
  } catch (error) {
    console.error(`Something went wrong in updateRegion due to `, error);
    return reply.status(500).send(
      response({
        isError: true,
        message: INTERNAL_SERVER_ERROR,
      })
    );
  }
};

type UpdateLawRequestType = FastifyRequest<{}>;
const updateLaw = async (req: UpdateLawRequestType, reply: FastifyReply) => {
  try {
  } catch (error) {
    console.error(`Something went wrong in updateLaw due to `, error);
    return reply.status(500).send(
      response({
        isError: true,
        message: INTERNAL_SERVER_ERROR,
      })
    );
  }
};

export {
  updateUser,
  updateChat,
  updateMessage,
  updateShare,
  updateFavourite,
  updateDeletedUser,
  updateRegion,
  updateLaw,
};
