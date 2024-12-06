import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyPluginCallback,
} from "fastify";
import {
  generateAndSaveEmbeddings,
  handleSeedRegions,
  scrapAndStoreActUrls,
  scrapPdfUsingActUrls,
} from "../controller/utils";

const utilRoutes: FastifyPluginCallback = (
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
  done
) => {
  fastify.get(`/seed-regions`, handleSeedRegions);
  fastify.get(`/scrap-and-store-act-urls`, scrapAndStoreActUrls);
  fastify.get(`/scrap-pdfs`, scrapPdfUsingActUrls);
  fastify.get(`/gen-and-save-embeddings`, generateAndSaveEmbeddings);
  done();
};

export default utilRoutes;
