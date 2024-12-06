import { FastifyReply, FastifyRequest } from "fastify";
import { UserModel } from "../model/User";
import { response } from "../utils/response";
import { INTERNAL_SERVER_ERROR, USER_MESSAGES } from "../constant/messages";

type userExistsRequestType = FastifyRequest<{
  Params: {
    googleId: String;
  };
}>;
const userExists = async (req: userExistsRequestType, reply: FastifyReply) => {
  try {
    const { googleId } = req.params;
    const userExists = await UserModel.findOne({ googleId });
    return reply.status(200).send(
      response({
        data: !!userExists,
        message: userExists
          ? USER_MESSAGES.USER_EXISTS
          : USER_MESSAGES.USER_DONT_EXISTS,
        isError: false,
      })
    );
  } catch (error) {
    return reply.status(500).send(
      response({
        data: null,
        isError: true,
        message: INTERNAL_SERVER_ERROR,
      })
    );
  }
};

type SingupRequestType = FastifyRequest<{
  Body: {
    aud: String;
    azp: String;
    email: String;
    email_verified: Boolean;
    exp: Number;
    family_name: String;
    given_name: String;
    iat: Number;
    iss: String;
    jti: String;
    name: String;
    nbf: Number;
    picture: String;
    token: String;
    sub: String;
  };
}>;
const signup = async (req: SingupRequestType, reply: FastifyReply) => {
  try {
    const { sub } = req.body;
    const userExists = await UserModel.findOne({ googleId: sub });
    if (userExists) {
      return reply.status(409).send(
        response({
          data: null,
          message: USER_MESSAGES.USER_EXISTS,
          isError: false,
        })
      );
    }
    const newUser = await UserModel.create(req.body);
    console.log("newUser", newUser);
    if (newUser) {
      reply.status(201).send(
        response({
          data: newUser,
          isError: false,
          message: USER_MESSAGES.USER_CREATION_SUCCESS,
        })
      );
    } else {
      reply.status(400).send(
        response({
          data: null,
          isError: true,
          message: USER_MESSAGES.USER_CREATION_FAILURE,
        })
      );
    }
  } catch (error) {
    console.error(`Something went wrong in signup due to `, error);
    return reply.status(500).send(
      response({
        data: null,
        isError: true,
        message: INTERNAL_SERVER_ERROR,
      })
    );
  }
};

type SinginRequestType = FastifyRequest<{
  Body: {
    googleId: String;
    name: String;
    googleFirstName: String;
    googleLastName: String;
    profileImageUrl: String;
    email: String;
    emailVerified: Boolean;
    accessToken: String;
    tokenExpiresIn: Number;
    tokenIssuedAt: Number;
    tokenId: String;
    tokenNotValidBefore: Number;
  };
}>;
const signin = async (req: SinginRequestType, reply: FastifyReply) => {
  try {
    const { googleId } = req.body;
    const updatedUser = await UserModel.findOneAndUpdate(
      { googleId },
      req.body,
      { new: true }
    );
    console.log("updatedUser", updatedUser);
    if (updatedUser) {
      reply.status(200).send(
        response({
          data: updatedUser,
          isError: false,
          message: USER_MESSAGES.USER_SIGNIN_SUCCESS,
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
    console.error(`Something went wrong in signin due to `, error);
    return reply.status(500).send(
      response({
        data: null,
        isError: true,
        message: INTERNAL_SERVER_ERROR,
      })
    );
  }
};

const updateUser = async (req: FastifyRequest, reply: FastifyReply) => {};

const getUser = async (req: FastifyRequest, reply: FastifyReply) => {};

const deleteUser = async (req: FastifyRequest, reply: FastifyReply) => {};

export { signup, updateUser, getUser, deleteUser, signin, userExists };
