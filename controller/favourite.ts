import { FastifyReply, FastifyRequest } from "fastify";
import { response } from "../utils/response";
import {
  CHAT_MESSAGES,
  FAVOURITE_MESSAGES,
  INTERNAL_SERVER_ERROR,
} from "../constant/messages";
import { FavouriteModel } from "../model/Favourite";

type getFavouritesReqType = FastifyRequest<{
  Querystring: {
    skip: number;
    limit: number;
    search: string;
  };
}>;
const getFavourites = async (
  req: getFavouritesReqType,
  reply: FastifyReply
) => {
  try {
    const { _id } = req.user;
    const { skip = 0, limit = 10, search = "" } = req.query;
    const payload = {
      createdBy: _id,
      isDeleted: false,
      search,
    };
    if (!search) {
      delete payload.search;
    }
    const favourites = await FavouriteModel.find(payload)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    reply.send(
      response({
        isError: false,
        data: favourites,
        message: FAVOURITE_MESSAGES.FAVOURITES_FETCHED_SUCCESSFULLY,
      })
    );
  } catch (error) {
    console.error("Something went wrong in getFavourites due to", error);
    reply.send(
      response({
        isError: true,
        message: INTERNAL_SERVER_ERROR,
      })
    );
  }
};

type makeFavouriteReqType = FastifyRequest<{
  Params: {
    chatId: String;
  };
}>;
const makeFavourite = async (
  req: makeFavouriteReqType,
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
    } else {
      const favourite = await FavouriteModel.create({
        chatId,
        createdBy: _id,
      });
      if (favourite) {
        reply.status(201).send(
          response({
            isError: false,
            data: favourite,
            message: FAVOURITE_MESSAGES.FAVOURITE_CREATION_SUCCESS,
          })
        );
      } else {
        reply.status(400).send(
          response({
            isError: true,
            data: null,
            message: FAVOURITE_MESSAGES.FAVOURITE_CREATION_FAILURE,
          })
        );
      }
    }
  } catch (error) {
    console.error("Something went wrong in makeFavourite due to", error);
    reply.send(
      response({
        isError: true,
        message: INTERNAL_SERVER_ERROR,
      })
    );
  }
};

type deleteFavouriteReqType = FastifyRequest<{
  Params: {
    favouriteId: String;
  };
}>;
const deleteFavourite = async (
  req: deleteFavouriteReqType,
  reply: FastifyReply
) => {
  try {
    const { favouriteId } = req.params;
    const favourite = await FavouriteModel.findById(favouriteId);
    if (favourite) {
      await favourite.updateOne({
        isDeleted: true,
      });
      reply.send(
        response({
          isError: false,
          data: null,
          message: FAVOURITE_MESSAGES.FAVOURITE_DELETION_SUCCESS,
        })
      );
    } else {
      reply.send(
        response({
          isError: true,
          data: null,
          message: FAVOURITE_MESSAGES.FAVOURITE_DONT_EXISTS,
        })
      );
    }
  } catch (error) {
    console.error("Something went wrong in deleteFavourite due to", error);
    reply.send(
      response({
        isError: true,
        message: INTERNAL_SERVER_ERROR,
      })
    );
  }
};

export { getFavourites, makeFavourite, deleteFavourite };
