import { FastifyReply, FastifyRequest } from "fastify";
import { response } from "../../utils/response";
import { UserModel } from "../../model/User";
import {
  ADMIN_MESSAGES,
  INTERNAL_SERVER_ERROR,
  USER_MESSAGES,
} from "../../constant/messages";
import { MessageModel } from "../../model/Message";
import { ChatModel } from "../../model/Chat";
import { DeletedUserModel } from "../../model/DeletedUser";
import { FavouriteModel } from "../../model/Favourite";
import { ShareModel } from "../../model/Share";
import { RegionsModel } from "../../model/Regions";
import { HydratedDocument } from "mongoose";
import { LawModel } from "../../model/Law";

type GetUserRequestType = FastifyRequest<{
  Params: {
    userId: String;
  };
}>;
const getUser = async (req: GetUserRequestType, reply: FastifyReply) => {
  try {
    const { userId } = req.params;
    const user = await UserModel.findById(userId);
    if (user) {
      reply.status(200).send(
        response({
          data: user,
          isError: false,
          message: USER_MESSAGES.USER_FETCHED_SUCCESSFULLY,
        })
      );
    } else {
      reply.status(400).send(
        response({
          data: null,
          isError: true,
          message: USER_MESSAGES.USER_DONT_EXISTS,
        })
      );
    }
  } catch (error) {
    console.error(`Something went wrong in getUser due to `, error);
    return reply.status(500).send(
      response({
        isError: true,
        message: INTERNAL_SERVER_ERROR,
      })
    );
  }
};

type getUsersReq = FastifyRequest<{
  Querystring: {
    skip: number;
    limit: number;
    search: string;
  };
}>;
const getUsers = async (req: getUsersReq, reply: FastifyReply) => {
  try {
    const { skip, limit, search } = req.query;
    const users = await UserModel.find({
      ...(search && { username: { $regex: search, $options: "i" } }),
    })
      .skip(+skip)
      .limit(+limit);

    reply.send(
      response({
        data: users,
        isError: false,
        message: ADMIN_MESSAGES.FETCHED_USERS_SUCCESSFULLY,
      })
    );
  } catch (error) {
    console.error("Something went wrong in getUsers due to ", error);
    reply.send(response({ isError: true, message: INTERNAL_SERVER_ERROR }));
  }
};

type getSharesReq = FastifyRequest<{
  Querystring: {
    skip: number;
    limit: number;
    search: string;
  };
}>;
const getShares = async (req: getSharesReq, reply: FastifyReply) => {
  try {
    const { skip, limit, search } = req.query;
    const shares = await ShareModel.find({
      ...(search && { title: { $regex: search, $options: "i" } }),
    })
      .skip(+skip)
      .limit(+limit);
    reply.send(
      response({
        data: shares,
        isError: false,
        message: ADMIN_MESSAGES.FETCHED_SHARES_SUCCESSFULLY,
      })
    );
  } catch (error) {
    console.error("Something went wrong in getShares due to ", error);
    reply.send(response({ isError: true, message: INTERNAL_SERVER_ERROR }));
  }
};

type getFavouritesReq = FastifyRequest<{
  Querystring: {
    skip: number;
    limit: number;
    search: string;
  };
}>;
const getFavourites = async (req: getFavouritesReq, reply: FastifyReply) => {
  try {
    const { skip, limit, search } = req.query;
    const favourites = await FavouriteModel.find({
      ...(search && { title: { $regex: search, $options: "i" } }),
    })
      .skip(+skip)
      .limit(+limit);
    reply.send(
      response({
        data: favourites,
        isError: false,
        message: ADMIN_MESSAGES.FETCHED_FAVOURITES_SUCCESSFULLY,
      })
    );
  } catch (error) {
    console.error("Something went wrong in getFavourites due to ", error);
    reply.send(response({ isError: true, message: INTERNAL_SERVER_ERROR }));
  }
};

type getDeletedUsersReq = FastifyRequest<{
  Querystring: {
    skip: number;
    limit: number;
    search: string;
  };
}>;
const getDeletedUsers = async (
  req: getDeletedUsersReq,
  reply: FastifyReply
) => {
  try {
    const { skip, limit, search } = req.query;
    const searchQuery = search
      ? {
          $or: [
            { username: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};
    const deletedUsers = await DeletedUserModel.find(searchQuery)
      .skip(+skip)
      .limit(+limit)
      .populate({
        path: "userId",
        match: searchQuery,
      });
    const filteredDeletedUsers = deletedUsers.filter(
      (deletedUser) => deletedUser.userId
    );
    reply.send(
      response({
        data: filteredDeletedUsers,
        isError: false,
        message: ADMIN_MESSAGES.FETCHED_DELETED_USERS_SUCCESSFULLY,
      })
    );
  } catch (error) {
    console.error("Something went wrong in getDeletedUsers due to ", error);
    reply.send(response({ isError: true, message: INTERNAL_SERVER_ERROR }));
  }
};

type getChatsReq = FastifyRequest<{
  Querystring: {
    skip: number;
    limit: number;
    search: string;
  };
}>;
const getChats = async (req: getChatsReq, reply: FastifyReply) => {
  try {
    const { skip, limit, search } = req.query;
    const chats = await ChatModel.find({
      ...(search && { firstQuestion: { $regex: search, $options: "i" } }),
    })
      .skip(+skip)
      .limit(+limit);
    reply.send(
      response({
        data: chats,
        isError: false,
        message: ADMIN_MESSAGES.FETCHED_CHATS_SUCCESSFULLY,
      })
    );
  } catch (error) {
    console.error("Something went wrong in getChats due to ", error);
    reply.send(response({ isError: true, message: INTERNAL_SERVER_ERROR }));
  }
};

type getMessagesReq = FastifyRequest<{
  Querystring: {
    skip: number;
    limit: number;
    search: string;
  };
}>;
const getMessages = async (req: getMessagesReq, reply: FastifyReply) => {
  try {
    const { skip, limit, search } = req.query;
    const messages = await MessageModel.find({
      ...(search && { question: { $regex: search, $options: "i" } }),
    })
      .skip(+skip)
      .limit(+limit);
    reply.send(
      response({
        data: messages,
        isError: false,
        message: ADMIN_MESSAGES.FETCHED_MESSAGES_SUCCESSFULLY,
      })
    );
  } catch (error) {
    console.error("Something went wrong in getMessages due to ", error);
    reply.send(response({ isError: true, message: INTERNAL_SERVER_ERROR }));
  }
};

const getRegionProcessStatus = async ({
  regions,
}: {
  regions: HydratedDocument<typeof RegionsModel.schema>[];
}) => {
  try {
    return await Promise.all(
      regions.map(async (m) => {
        const laws = await LawModel.find({ regionId: m._id });
        console.log("laws", laws);

        const totalLaws = laws.length;
        const processedLaws = laws.filter(
          (f) => f.pineconeIds.length > 0
        ).length;

        return {
          ...m?.toObject(),
          totalLaws,
          processedLaws,
        };
      })
    );
  } catch (error) {
    console.error("getRegionProcessStatus", error);
    return [];
  }
};

type getRegionsReq = FastifyRequest<{
  Querystring: {
    needProcessStatus: boolean;
  };
}>;
const getRegions = async (req: getRegionsReq, reply: FastifyReply) => {
  try {
    const { needProcessStatus } = req.query;
    const regions = await RegionsModel.find();
    if (!regions) {
      return reply.send(
        response({
          data: regions,
          isError: false,
          message: ADMIN_MESSAGES.FAULED_TO_FETCH_REGION,
        })
      );
    }
    if (needProcessStatus) {
      const processed = await getRegionProcessStatus({ regions });
      reply.send(
        response({
          data: processed,
          isError: false,
          message: ADMIN_MESSAGES.FETCHED_REGIONS_SUCCESSFULLY,
        })
      );
    } else {
      reply.send(
        response({
          data: regions,
          isError: false,
          message: ADMIN_MESSAGES.FETCHED_REGIONS_SUCCESSFULLY,
        })
      );
    }
  } catch (error) {
    console.error("getRegions", error);
    reply.send(response({ isError: true, message: INTERNAL_SERVER_ERROR }));
  }
};

type getSingleRegionReq = FastifyRequest<{
  Params: {
    id: string;
  };
}>;
const getSingleRegion = async (
  req: getSingleRegionReq,
  reply: FastifyReply
) => {
  try {
    const { id } = req.params;
    const region = await RegionsModel.findById(id);
    if (region) {
      const processed = await getRegionProcessStatus({ regions: [region] });
      reply.send(
        response({
          data: processed[0],
          isError: false,
          message: ADMIN_MESSAGES.FETCHED_REGIONS_SUCCESSFULLY,
        })
      );
    } else {
      return reply.send(
        response({
          data: null,
          isError: false,
          message: ADMIN_MESSAGES.FAULED_TO_FETCH_REGION,
        })
      );
    }
  } catch (error) {
    console.error("getSingleRegion", error);
    reply.send(response({ isError: true, message: INTERNAL_SERVER_ERROR }));
  }
};

type getRegionLawsReq = FastifyRequest<{
  Params: {
    id: string;
  };
  Querystring: {
    skip: number;
    limit: number;
  };
}>;
const getRegionLaws = async (req: getRegionLawsReq, reply: FastifyReply) => {
  try {
    const { id } = req.params;
    const { skip, limit } = req.query;
    const laws = await LawModel.find({ regionId: id })
      .skip(+skip)
      .limit(+limit);
    reply.send(
      response({
        data: laws,
        isError: false,
        message: ADMIN_MESSAGES.LAWS_FETCHED_SUCCESSFULLY,
      })
    );
  } catch (error) {
    console.error("getRegionLaws", error);
    reply.send(response({ isError: true, message: INTERNAL_SERVER_ERROR }));
  }
};

type getLawsReq = FastifyRequest<{
  Params: {
    id: string;
  };
}>;
const getLaw = async (req: getLawsReq, reply: FastifyReply) => {
  try {
    const { id } = req.params;
    const law = await LawModel.findById(id);
    if (law) {
      reply.send(
        response({
          data: law,
          isError: true,
          message: ADMIN_MESSAGES.LAW_FETCHED_SUCCESSFULLY,
        })
      );
    } else {
      reply.send(
        response({
          data: null,
          isError: true,
          message: ADMIN_MESSAGES.FAILED_TO_FETCH_REGION,
        })
      );
    }
  } catch (error) {
    console.error("getLaw", error);
    reply.send(response({ isError: true, message: INTERNAL_SERVER_ERROR }));
  }
};

export {
  getUser,
  getMessages,
  getChats,
  getDeletedUsers,
  getFavourites,
  getShares,
  getUsers,
  getRegions,
  getSingleRegion,
  getRegionLaws,
  getLaw,
};
