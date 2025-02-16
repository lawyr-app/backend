import { FastifyReply, FastifyRequest } from "fastify";
import { response } from "../../utils/response";
import {
  ADMIN_MESSAGES,
  CHAT_MESSAGES,
  FAVOURITE_MESSAGES,
  INTERNAL_SERVER_ERROR,
  MESSAGE_MESSAGES,
  SHARE_MESSAGES,
  USER_MESSAGES,
} from "../../constant/messages";
import { FavouriteModel } from "../../model/Favourite";
import { ShareModel } from "../../model/Share";
import { ChatModel } from "../../model/Chat";
import { MessageModel } from "../../model/Message";
import { LawModel } from "../../model/Law";
import { RegionsModel } from "../../model/Regions";
import { UserModel } from "../../model/User";
import { DeletedUserModel } from "../../model/DeletedUser";

type DeleteFavouriteReq = FastifyRequest<{
  Params: {
    id: String;
  };
}>;
const deleteFavourite = async (
  req: DeleteFavouriteReq,
  reply: FastifyReply
) => {
  try {
    const { id } = req.params;
    const favourites = await FavouriteModel.findByIdAndDelete(id);
    if (favourites) {
      return reply.status(200).send(
        response({
          data: favourites,
          isError: false,
          message: FAVOURITE_MESSAGES.FAVOURITE_DELETION_SUCCESS,
        })
      );
    } else {
      return reply.status(400).send(
        response({
          isError: true,
          message: FAVOURITE_MESSAGES.FAVOURITE_DELETION_FAILURE,
        })
      );
    }
  } catch (error) {
    console.error(`Something went wrong in deleteFavourite due to `, error);
    return reply.status(500).send(
      response({
        isError: true,
        message: INTERNAL_SERVER_ERROR,
      })
    );
  }
};

type DeleteShareReq = FastifyRequest<{
  Params: {
    id: String;
  };
}>;
const deleteShare = async (req: DeleteShareReq, reply: FastifyReply) => {
  try {
    const { id } = req.params;
    const share = await ShareModel.findByIdAndDelete(id);
    if (share) {
      return reply.status(200).send(
        response({
          data: share,
          isError: false,
          message: SHARE_MESSAGES.SHARING_DELETED_SUCCESSFULLY,
        })
      );
    } else {
      return reply.status(400).send(
        response({
          isError: true,
          message: SHARE_MESSAGES.FAILED_TO_DELETE_SHARING,
        })
      );
    }
  } catch (error) {
    console.error(`Something went wrong in deleteShare due to `, error);
    return reply.status(500).send(
      response({
        isError: true,
        message: INTERNAL_SERVER_ERROR,
      })
    );
  }
};

type DeleteChatReq = FastifyRequest<{
  Params: {
    id: String;
  };
}>;
const deleteChat = async (req: DeleteChatReq, reply: FastifyReply) => {
  try {
    const { id } = req.params;
    const chat = await ChatModel.findByIdAndDelete(id);
    if (chat) {
      return reply.status(200).send(
        response({
          data: chat,
          isError: false,
          message: CHAT_MESSAGES.CHAT_DELETION_SUCCESS,
        })
      );
    } else {
      return reply.status(400).send(
        response({
          isError: true,
          message: CHAT_MESSAGES.CHAT_DELETION_FAILED,
        })
      );
    }
  } catch (error) {
    console.error(`Something went wrong in deleteChat due to `, error);
    return reply.status(500).send(
      response({
        isError: true,
        message: INTERNAL_SERVER_ERROR,
      })
    );
  }
};

type DeleteMessageReq = FastifyRequest<{
  Params: {
    id: String;
  };
}>;
const deleteMessage = async (req: DeleteMessageReq, reply: FastifyReply) => {
  try {
    const { id } = req.params;
    const message = await MessageModel.findByIdAndDelete(id);
    if (message) {
      return reply.status(200).send(
        response({
          data: message,
          isError: false,
          message: MESSAGE_MESSAGES.MESSAGE_DELETED_SUCCESSFULLY,
        })
      );
    } else {
      return reply.status(400).send(
        response({
          isError: true,
          message: MESSAGE_MESSAGES.MESSAGE_DELETION_FAILURE,
        })
      );
    }
  } catch (error) {
    console.error(`Something went wrong in deleteMessage due to `, error);
    return reply.status(500).send(
      response({
        isError: true,
        message: INTERNAL_SERVER_ERROR,
      })
    );
  }
};

type DeleteLawReq = FastifyRequest<{
  Params: {
    id: String;
  };
}>;
const deleteLaw = async (req: DeleteLawReq, reply: FastifyReply) => {
  try {
    const { id } = req.params;
    const law = await LawModel.findByIdAndDelete(id);
    if (law) {
      return reply.status(200).send(
        response({
          data: law,
          isError: false,
          message: ADMIN_MESSAGES.LAW_DELETED_SUCCESSFULLY,
        })
      );
    } else {
      return reply.status(400).send(
        response({
          isError: true,
          message: ADMIN_MESSAGES.FAILED_TO_DELETE_LAW,
        })
      );
    }
  } catch (error) {
    console.error(`Something went wrong in deleteLaw due to `, error);
    return reply.status(500).send(
      response({
        isError: true,
        message: INTERNAL_SERVER_ERROR,
      })
    );
  }
};

type DeleteRegionReq = FastifyRequest<{
  Params: {
    id: String;
  };
}>;
const deleteRegion = async (req: DeleteRegionReq, reply: FastifyReply) => {
  try {
    const { id } = req.params;
    const region = await RegionsModel.findByIdAndDelete(id);
    if (region) {
      return reply.status(200).send(
        response({
          data: region,
          isError: false,
          message: ADMIN_MESSAGES.REGION_DELETED_SUCCESSFULLY,
        })
      );
    } else {
      return reply.status(400).send(
        response({
          isError: true,
          message: ADMIN_MESSAGES.FAILED_TO_DELETE_REGION,
        })
      );
    }
  } catch (error) {
    console.error(`Something went wrong in deleteRegion due to `, error);
    return reply.status(500).send(
      response({
        isError: true,
        message: INTERNAL_SERVER_ERROR,
      })
    );
  }
};

type DeleteUserReq = FastifyRequest<{
  Params: {
    id: String;
  };
}>;
const deleteUser = async (req: DeleteUserReq, reply: FastifyReply) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findByIdAndDelete(id);
    if (user) {
      return reply.status(200).send(
        response({
          data: user,
          isError: false,
          message: USER_MESSAGES.USER_DELETED_SUCCESSFULLY,
        })
      );
    } else {
      return reply.status(400).send(
        response({
          isError: true,
          message: USER_MESSAGES.USER_DELETION_FAILURE,
        })
      );
    }
  } catch (error) {
    console.error(`Something went wrong in deleteRegion due to `, error);
    return reply.status(500).send(
      response({
        isError: true,
        message: INTERNAL_SERVER_ERROR,
      })
    );
  }
};

type DeleteDeletedUserReq = FastifyRequest<{
  Params: {
    id: String;
  };
}>;
const deleteDeletedUser = async (
  req: DeleteDeletedUserReq,
  reply: FastifyReply
) => {
  try {
    const { id } = req.params;
    const user = await DeletedUserModel.findByIdAndDelete(id);
    if (user) {
      return reply.status(200).send(
        response({
          data: user,
          isError: false,
          message: ADMIN_MESSAGES.DELETE_DELETED_USER_SUCCESSFULLY,
        })
      );
    } else {
      return reply.status(400).send(
        response({
          isError: true,
          message: ADMIN_MESSAGES.DELETING_DELETED_USER_FAILED,
        })
      );
    }
  } catch (error) {
    console.error(`Something went wrong in deleteDeletedUser due to `, error);
    return reply.status(500).send(
      response({
        isError: true,
        message: INTERNAL_SERVER_ERROR,
      })
    );
  }
};

export {
  deleteFavourite,
  deleteShare,
  deleteChat,
  deleteMessage,
  deleteLaw,
  deleteRegion,
  deleteUser,
  deleteDeletedUser,
};
