import { FastifyReply, FastifyRequest } from "fastify";
import { response } from "../utils/response";
import { regions, RegionType } from "../constant/regions";
import { scrapTheConstitution, scrapTheLaws } from "../utils/scrap";
import { RegionsModel } from "../model/Regions";
import { LawModel } from "../model/Law";
import {
  ADMIN_MESSAGES,
  INTERNAL_SERVER_ERROR,
  USER_MESSAGES,
} from "../constant/messages";
import { processSingleLaw } from "../utils/proessSingleLaw";
import { UserModel } from "../model/User";
import { ShareModel } from "../model/Share";
import { FavouriteModel } from "../model/Favourite";
import { DeletedUserModel } from "../model/DeletedUser";
import { ChatModel } from "../model/Chat";
import { MessageModel } from "../model/Message";
import { HydratedDocument, InferSchemaType } from "mongoose";

type seedRegionsReq = FastifyRequest<{}>;
const seedRegions = async (req: seedRegionsReq, reply: FastifyReply) => {
  try {
    const formattedRegions = regions.map((m) => ({
      uniqueId: m.id,
      name: m.name,
      nameSpaceName: m.nameSpaceName,
    }));
    const addedRegions = await RegionsModel.insertMany(formattedRegions);
    reply.status(201).send(
      response({
        message: "Added successfully",
        data: addedRegions,
        isError: false,
      })
    );
  } catch (error) {
    reply
      .status(500)
      .send(response({ isError: true, message: INTERNAL_SERVER_ERROR }));
  }
};

type scrapRegionLawsReq = FastifyRequest<{
  Params: {
    id: string;
  };
}>;
const scrapRegionLaws = async (
  req: scrapRegionLawsReq,
  reply: FastifyReply
) => {
  try {
    const { id } = req.params;
    if (id) {
      const region = await RegionsModel.findOne({
        uniqueId: id,
      });
      if (!region?._id) {
        reply.send(
          response({
            isError: true,
            message: ADMIN_MESSAGES.REGION_NOT_FOUND,
          })
        );
      }
      const regionId = region?._id;
      const isConstitution = +id === RegionType.Constitution;
      let data: any = [];
      if (isConstitution) {
        const constitutionData = await scrapTheConstitution();
        console.log("constitution data", constitutionData);
        data =
          constitutionData?.length > 0
            ? constitutionData?.map((m) => ({ ...m, regionId }))
            : [];
      } else {
        const scrappedLaws = await scrapTheLaws({ id: String(id) });
        console.log("scrappedLaws", data);
        data =
          scrappedLaws?.length > 0
            ? scrappedLaws?.map((m) => ({ ...m, regionId }))
            : [];
      }
      if (data.length > 0) {
        const laws = await LawModel.insertMany(data);
        reply.send(response({ data: laws, isError: false }));
      } else {
        reply.send(
          response({ data: null, isError: true, message: "Data is empty " })
        );
      }
    }
    console.log("id", id);
    reply.send(response({ data: null, isError: true }));
  } catch (error) {
    console.error("seedRegions", error);
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

type processLawReq = FastifyRequest<{
  Params: {
    lawId: string;
  };
}>;
const processLaw = async (req: processLawReq, reply: FastifyReply) => {
  try {
    const { lawId } = req.params;
    const res = await processSingleLaw({ lawId });
    reply.send(response(res));
  } catch (error) {
    reply.send(response({ isError: true, message: INTERNAL_SERVER_ERROR }));
  }
};

type processRegionReq = FastifyRequest<{
  Params: {
    regionId: string;
  };
}>;
const processRegion = async (req: processRegionReq, reply: FastifyReply) => {
  try {
    const { regionId } = req.params;
    const laws = await LawModel.find({
      regionId,
      $or: [
        { pineconeIds: { $size: 0 } },
        { pineconeIds: { $exists: false } },
        { pineconeIds: null },
        { pineconeIds: undefined },
      ],
    });
    console.log("laws", laws);
    let failedCount = 0;
    for (const law of laws) {
      const res = await processSingleLaw({ lawId: String(law._id) });
      if (res.isError) {
        failedCount++;
      }
    }
    const message =
      failedCount > 0
        ? `${failedCount} failed. Please try again`
        : `Successfull`;
    reply.send(response({ isError: false, message }));
  } catch (error) {
    console.error("Something went wrong in processRegion due to ", error);
    reply.send(response({ isError: true, message: INTERNAL_SERVER_ERROR }));
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

export {
  seedRegions,
  scrapRegionLaws,
  getRegions,
  processLaw,
  processRegion,
  getUsers,
  getShares,
  getFavourites,
  getDeletedUsers,
  getChats,
  getMessages,
  getUser,
  updateUser,
};
