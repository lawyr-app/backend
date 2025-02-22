import { FastifyReply, FastifyRequest } from "fastify";
import { response } from "../../utils/response";
import { regions, RegionType } from "../../constant/regions";
import { scrapTheConstitution, scrapTheLaws } from "../../utils/scrap";
import { RegionsModel } from "../../model/Regions";
import { LawModel } from "../../model/Law";
import {
  ADMIN_MESSAGES,
  INTERNAL_SERVER_ERROR,
  USER_MESSAGES,
} from "../../constant/messages";
import { processSingleLaw } from "../../utils/proessSingleLaw";
import { UserModel } from "../../model/User";

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

export { seedRegions, scrapRegionLaws, processLaw, processRegion };
