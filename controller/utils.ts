import { FastifyRequest, FastifyReply } from "fastify";
import { regions } from "../constant/seed";
import { RegionsModel } from "../model/Regions";

const seedRegions = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    for (let region of regions) {
      await RegionsModel.findOneAndUpdate(
        { uniqueId: region.id },
        { name: region.name, uniqueId: region.id },
        { upsert: true }
      );
    }
    res.status(200).send({
      isError: false,
      message: "regions added successfully",
    });
  } catch (error) {
    console.error(`Something went wrong while seeding regions`);
    res.status(400).send({
      isError: false,
      message: "Failed to add regions",
    });
  }
};

export { seedRegions };
