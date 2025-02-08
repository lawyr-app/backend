import { FastifyReply, FastifyRequest } from "fastify";
import { response } from "../utils/response";
import { ChatModel } from "../model/Chat";
import { MessageModel } from "../model/Message";
import { CHAT_MESSAGES, INTERNAL_SERVER_ERROR } from "../constant/messages";
import { FavouriteModel } from "../model/Favourite";

type InitiateChatRequestType = FastifyRequest<{
  Body: {
    question: string;
    regionId: string;
  };
}>;
const initiateChat = async (
  req: InitiateChatRequestType,
  reply: FastifyReply
) => {
  try {
    const { _id } = req.user;
    const { question, regionId } = req.body;
    const savedChat = await ChatModel.create({
      firstQuestion: question,
      createdBy: _id,
      regionId,
    });
    if (savedChat) {
      reply.send(
        response({
          data: savedChat,
          isError: false,
        })
      );
    } else {
      reply.send(
        response({
          data: "Failed to Initiate Chat. Please try again",
          isError: true,
        })
      );
    }
  } catch (error) {
    console.error(`Something went wrong in initiateChat due to `, error);
    reply.send(
      response({
        isError: true,
      })
    );
  }
};

type GetChatByIdRequestType = FastifyRequest<{
  Params: {
    id: string;
  };
  Querystring: {
    fetchMessages: boolean;
    fetchFavouriteId: boolean;
  };
}>;
const getChatById = async (
  req: GetChatByIdRequestType,
  reply: FastifyReply
) => {
  try {
    const { id } = req.params;
    const { _id } = req.user;
    const { fetchMessages, fetchFavouriteId } = req.query;
    const chat = await ChatModel.findById(id, {
      isDeleted: 0,
    });

    let messages: any = [];
    let favouritedId = null;
    if (fetchFavouriteId) {
      const favourited = await FavouriteModel.findOne({
        createdBy: _id,
        isDeleted: false,
        chatId: id,
      });
      favouritedId = favourited?._id;
    }
    if (fetchMessages) {
      messages = await MessageModel.find({
        chatId: id,
        createdBy: _id,
      })
        .sort({ createdAt: 1 })
        .limit(10)
        .skip(0);
    }
    if (chat) {
      const chatJson = chat.toJSON();
      reply.send(
        response({
          data: {
            ...chatJson,
            messages,
            favouritedId,
          },
          isError: false,
          message: CHAT_MESSAGES.CHAT_FETCHED_SUCCESSFULLY,
        })
      );
    } else {
      reply.send(
        response({
          data: null,
          isError: true,
          message: CHAT_MESSAGES.FAILED_TO_FETCH_CHAT,
        })
      );
    }
  } catch (error) {
    console.error("Something went wrong in getChatById due to", error);
    reply.send(
      response({
        isError: true,
        message: INTERNAL_SERVER_ERROR,
      })
    );
  }
};

type softDeleteChatReqType = FastifyRequest<{
  Params: {
    chatId: String;
  };
}>;
const softDeleteChat = async (
  req: softDeleteChatReqType,
  reply: FastifyReply
) => {
  try {
    const { _id } = req.user;
    const { chatId } = req.params;
    if (!chatId) {
      reply.send(
        response({
          isError: true,
          message: CHAT_MESSAGES.CHAT_ID_REQUIRED,
        })
      );
    }
    const chat = await ChatModel.findById(chatId);
    if (chat) {
      if (String(chat.createdBy) === String(_id)) {
        await chat.updateOne({
          isDeleted: true,
        });
        reply.status(200).send(
          response({
            isError: false,
            message: CHAT_MESSAGES.CHAT_DELETION_SUCCESS,
          })
        );
      } else {
        reply.status(400).send(
          response({
            isError: true,
            message: CHAT_MESSAGES.CHAT_DELETION_FAILED,
          })
        );
      }
    } else {
      reply.status(400).send(
        response({
          isError: true,
          message: CHAT_MESSAGES.CHAT_DONT_EXISTS,
        })
      );
    }
  } catch (error) {
    console.error("Something went wrong in softDeleteChat due to", error);
    reply.status(500).send(
      response({
        isError: true,
        message: INTERNAL_SERVER_ERROR,
      })
    );
  }
};

type GetChatsRequestType = FastifyRequest<{
  Querystring: {
    limit: number;
    skip: number;
    search: string;
    needIsFavouritedFlag: string;
  };
}>;
const getChats = async (req: GetChatsRequestType, reply: FastifyReply) => {
  try {
    let {
      limit = 10,
      skip = 0,
      search = "",
      needIsFavouritedFlag = false,
    } = req.query;
    needIsFavouritedFlag = needIsFavouritedFlag === "true";
    const { _id } = req.user;
    const payload = {
      isDeleted: false,
      createdBy: _id,
      ...(search && { firstQuestion: { $regex: search, $options: "i" } }),
    };

    const chats = await ChatModel.find(payload)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (!needIsFavouritedFlag) {
      sendChats(reply, chats);
      return;
    }

    const chatsWithFavouritedFlag = await Promise.all(
      chats.map(async (m) => {
        const favourited = await FavouriteModel.findOne({
          createdBy: _id,
          isDeleted: false,
          chatId: m._id,
        });

        const jsonChat = m.toObject();
        return {
          ...jsonChat,
          favouritedId: favourited?._id ?? null,
        };
      })
    );
    sendChats(reply, chatsWithFavouritedFlag);
  } catch (error) {
    console.error("Something went wrong in getChatById due to", error);
    reply.send(
      response({
        isError: true,
      })
    );
  }
};

const sendChats = (reply: FastifyReply, data: any) => {
  if (data) {
    reply.send(
      response({
        data: data,
        isError: false,
        message: CHAT_MESSAGES.CHATS_FETCHED_SUCCESSFULLY,
      })
    );
  } else {
    reply.send(
      response({
        data: [],
        isError: true,
        message: CHAT_MESSAGES.FAILED_TO_FETCH_CHATS,
      })
    );
  }
};

export { initiateChat, getChatById, softDeleteChat, getChats };
