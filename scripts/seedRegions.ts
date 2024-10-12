import { regions } from "../constant/seed";
import { RegionsModel } from "../model/Regions";
import { connectDB } from "../utils/connectDb";

require("dotenv").config();

const handleSeed = async () => {
  try {
    for (let region of regions) {
      await RegionsModel.findOneAndUpdate(
        { uniqueId: region.id },
        { name: region.name, uniqueId: region.id },
        { upsert: true }
      );
    }
    console.log("regions added successfully");
  } catch (error) {
    console.error(`Something went wrong while seeding regions`, error);
  }
};

connectDB({
  onSuccess: () => {
    handleSeed();
  },
  mogoUrl:
    process.env.MONGODB ??
    "mongodb+srv://siddheshonlinebusiness:BBkMecu2JNCsdHJm@cluster0.qpouu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
});
