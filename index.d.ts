import "fastify";

declare module "pdf-parse";
declare module "fastify" {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
  }

  interface FastifyRequest {
    user?: any; // Define the shape of `user` if known
  }
}

declare module "jsonwebtoken";
