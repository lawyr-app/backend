import { FastifyReply, FastifyRequest } from "fastify";
import { response } from "../../utils/response";
import { INTERNAL_SERVER_ERROR } from "../../constant/messages";

const deleteFavourite = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
  } catch (error) {
    console.error(`Something went wrong in deleteFavourite due to `, error);
    return reply.status(500).send(
      response({
        isError: true,
        message: INTERNAL_SERVER_ERROR,
      })
    );
  }
};

const deleteShare = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
  } catch (error) {
    console.error(`Something went wrong in deleteShare due to `, error);
    return reply.status(500).send(
      response({
        isError: true,
        message: INTERNAL_SERVER_ERROR,
      })
    );
  }
};

const deleteChat = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
  } catch (error) {
    console.error(`Something went wrong in deleteChat due to `, error);
    return reply.status(500).send(
      response({
        isError: true,
        message: INTERNAL_SERVER_ERROR,
      })
    );
  }
};

const deleteMessage = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
  } catch (error) {
    console.error(`Something went wrong in deleteMessage due to `, error);
    return reply.status(500).send(
      response({
        isError: true,
        message: INTERNAL_SERVER_ERROR,
      })
    );
  }
};

const deleteLaw = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
  } catch (error) {
    console.error(`Something went wrong in deleteLaw due to `, error);
    return reply.status(500).send(
      response({
        isError: true,
        message: INTERNAL_SERVER_ERROR,
      })
    );
  }
};

const deleteRegion = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
  } catch (error) {
    console.error(`Something went wrong in deleteRegion due to `, error);
    return reply.status(500).send(
      response({
        isError: true,
        message: INTERNAL_SERVER_ERROR,
      })
    );
  }
};

export {
  deleteFavourite,
  deleteShare,
  deleteChat,
  deleteMessage,
  deleteLaw,
  deleteRegion,
};
