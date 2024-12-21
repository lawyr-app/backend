import { FastifyReply, FastifyRequest } from "fastify";
import { ShareModel } from "../model/Share";
import { response } from "../utils/response";
import { INTERNAL_SERVER_ERROR, SHARE_MESSAGES } from "../constant/messages";
import { MessageModel } from "../model/Message";
import { ChatModel } from "../model/Chat";

type getShareByIdReqType = FastifyRequest<{
  Params: {
    id: String;
  };
}>;
const getShareById = async (req: getShareByIdReqType, reply: FastifyReply) => {
  try {
    const { id } = req.params;
    const shared = await ShareModel.findById(id).populate("sharedMessages");
    if (shared && !shared.isDeleted) {
      return reply.status(200).send(
        response({
          data: shared,
          isError: false,
          message: SHARE_MESSAGES.SHARING_FETCHED_SUCCESSFULLY,
        })
      );
    } else {
      return reply.status(400).send(
        response({
          data: null,
          isError: true,
          message: SHARE_MESSAGES.NO_SHARING_EXISTS,
        })
      );
    }
  } catch (error) {
    console.error(`Something went wrong in getShareById due to `, error);
    return reply.status(500).send(
      response({
        data: null,
        isError: true,
        message: INTERNAL_SERVER_ERROR,
      })
    );
  }
};

type continueChatReqType = FastifyRequest<{
  Body: {
    shareId: String;
  };
}>;
const continueChat = async (req: continueChatReqType, reply: FastifyReply) => {
  try {
    const { _id } = req.user;
    const { shareId } = req.body;
    const share = await ShareModel.findById(shareId).populate("sharedMessages");
    if (share && !share.isDeleted) {
      const savedChat = await ChatModel.create({
        firstQuestion: share.title,
        createdBy: _id,
      });
      if (savedChat) {
        const messages = share.sharedMessages
          .map((m) => {
            if ("question" in m && "answer" in m) {
              return {
                question: m?.question,
                answer: m?.answer,
                chatId: savedChat._id,
                createdBy: _id,
              };
            } else {
              return null;
            }
          })
          .filter((f) => f !== null);

        const savedMessages = await MessageModel.insertMany(messages);
        if (savedMessages) {
          reply.status(201).send(
            response({
              data: null,
              isError: true,
              message: SHARE_MESSAGES.CONTINUED_SUCCESS,
            })
          );
        } else {
          reply.status(400).send(
            response({
              data: null,
              isError: true,
              message: SHARE_MESSAGES.CONTINUED_FAILED,
            })
          );
        }
      } else {
        reply.status(400).send(
          response({
            data: null,
            isError: true,
            message: SHARE_MESSAGES.CONTINUED_FAILED,
          })
        );
      }
    } else {
      return reply.status(400).send(
        response({
          data: null,
          isError: true,
          message: SHARE_MESSAGES.NO_SHARING_EXISTS,
        })
      );
    }
  } catch (error) {
    console.error(`Something went wrong in continueChat due to `, error);
    return reply.status(500).send(
      response({
        data: null,
        isError: true,
        message: INTERNAL_SERVER_ERROR,
      })
    );
  }
};

type deleteShareByIdReqType = FastifyRequest<{
  Params: {
    sharedId: String;
  };
}>;
const deleteShareById = async (
  req: deleteShareByIdReqType,
  reply: FastifyReply
) => {
  try {
    const { sharedId } = req.params;
    const deletedShare = await ShareModel.findByIdAndUpdate(
      sharedId,
      {
        isDeleted: true,
      },
      { new: true }
    );
    console.log("deletedShare", deletedShare);
    if (deletedShare) {
      return reply.status(200).send(
        response({
          data: deletedShare,
          isError: false,
          message: SHARE_MESSAGES.SHARING_DELETED_SUCCESSFULLY,
        })
      );
    } else {
      return reply.status(400).send(
        response({
          data: null,
          isError: true,
          message: SHARE_MESSAGES.FAILED_TO_DELETE_SHARING,
        })
      );
    }
  } catch (error) {
    console.error(`Something went wrong in deleteShareById due to `, error);
    return reply.status(500).send(
      response({
        data: null,
        isError: true,
        message: INTERNAL_SERVER_ERROR,
      })
    );
  }
};

type getSharedReqType = FastifyRequest<{
  Querystring: {
    limit: number;
    skip: number;
    search: string;
  };
}>;
const getShared = async (req: getSharedReqType, reply: FastifyReply) => {
  try {
    const { limit = 10, skip = 0, search } = req.query;
    const { _id } = req.user;
    const payload = {
      createdBy: _id,
      isDeleted: false,
      ...(search && { title: { $regex: search, $options: "i" } }),
    };
    const shared = await ShareModel.find(payload).skip(+skip).limit(+limit);
    if (shared) {
      return reply.status(200).send(
        response({
          data: shared,
          isError: false,
          message: SHARE_MESSAGES.SHARING_FETCHED_SUCCESSFULLY,
        })
      );
    } else {
      return reply.status(400).send(
        response({
          data: null,
          isError: true,
          message: SHARE_MESSAGES.FAILED_TO_FETCH_SHARING,
        })
      );
    }
  } catch (error) {
    console.error(`Something went wrong in getShared due to `, error);
    return reply.status(500).send(
      response({
        data: null,
        isError: true,
        message: INTERNAL_SERVER_ERROR,
      })
    );
  }
};

type updateSharedReqType = FastifyRequest<{
  Body: {
    id: String;
    title: String;
    isPublic: Boolean;
  };
}>;
const updateShared = async (req: updateSharedReqType, reply: FastifyReply) => {
  try {
    const { title, isPublic, id } = req.body;
    const updated = await ShareModel.findByIdAndUpdate(
      id,
      {
        title,
        isPublic,
      },
      {
        new: true,
      }
    );
    if (updated) {
      return reply.status(200).send(
        response({
          data: updated,
          isError: false,
          message: SHARE_MESSAGES.SHARED_UPDATING_SUCCESS,
        })
      );
    } else {
      return reply.status(400).send(
        response({
          data: null,
          isError: true,
          message: SHARE_MESSAGES.SHARED_UPDATING_FAILED,
        })
      );
    }
  } catch (error) {
    console.error(`Something went wrong in updateShared due to `, error);
    return reply.status(500).send(
      response({
        data: null,
        isError: true,
        message: INTERNAL_SERVER_ERROR,
      })
    );
  }
};

type createShareReqType = FastifyRequest<{
  Body: {
    title: String;
    chatId: String;
    isPublic: Boolean;
  };
}>;
const createShare = async (req: createShareReqType, reply: FastifyReply) => {
  try {
    const { _id } = req.user;
    const { title, chatId, isPublic } = req.body;
    const messages = await MessageModel.find({
      isDeleted: false,
      chatId,
    });
    const share = await ShareModel.create({
      title,
      chatId,
      createdBy: _id,
      isPublic,
      sharedMessages: messages.map((m) => m._id),
    });
    if (share) {
      return reply.status(201).send(
        response({
          data: share,
          isError: false,
          message: SHARE_MESSAGES.SHARED_SUCCESS,
        })
      );
    } else {
      return reply.status(400).send(
        response({
          data: null,
          isError: true,
          message: SHARE_MESSAGES.SHARED_FAILED,
        })
      );
    }
  } catch (error) {
    console.error(`Something went wrong in createShare due to `, error);
    return reply.status(500).send(
      response({
        data: null,
        isError: true,
        message: INTERNAL_SERVER_ERROR,
      })
    );
  }
};

export {
  getShareById,
  deleteShareById,
  getShared,
  updateShared,
  continueChat,
  createShare,
};
