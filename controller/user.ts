import { FastifyReply, FastifyRequest } from "fastify";
import { UserModel } from "../model/User";
import { response } from "../utils/response";
import { INTERNAL_SERVER_ERROR, USER_MESSAGES } from "../constant/messages";
import { DeletedUserModel } from "../model/DeletedUser";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../constant/envvariables";
import { generateToken } from "../utils/token";

type userExistsRequestType = FastifyRequest<{
  Body: {
    email: String;
  };
}>;
const userExists = async (req: userExistsRequestType, reply: FastifyReply) => {
  try {
    const { email } = req.body;
    const userExists = await UserModel.findOne({ email, isDeleted: false });
    console.log("userExists", userExists);
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
    username: String;
    social: String;
    isLawyer: Boolean;
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
const signup = async (req: SingupRequestType, reply: FastifyReply) => {
  try {
    const {
      username,
      social,
      isLawyer,
      googleId,
      name,
      googleFirstName,
      googleLastName,
      profileImageUrl,
      email,
      emailVerified,
      accessToken,
      tokenExpiresIn,
      tokenIssuedAt,
      tokenId,
      tokenNotValidBefore,
    } = req.body;
    const userExists = await UserModel.findOne({
      email,
      isDeleted: false,
    });
    if (userExists) {
      return reply.status(409).send(
        response({
          data: null,
          message: USER_MESSAGES.USER_EXISTS,
          isError: false,
        })
      );
    }
    const newUser = await UserModel.create({
      username,
      social,
      isLawyer,
      email,
      profileImageUrl,
      googleMetadata: {
        googleId,
        name,
        googleFirstName,
        googleLastName,
        emailVerified,
        accessToken,
        tokenExpiresIn,
        tokenIssuedAt,
        tokenId,
        tokenNotValidBefore,
      },
    });
    if (newUser) {
      const userId = String(newUser._id);

      const { token, expiresAt } = generateToken({
        userId,
      });
      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        {
          tokenDetails: {
            token,
            expiresAt,
          },
        },
        { new: true }
      );
      reply.status(201).send(
        response({
          data: updatedUser,
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
    const {
      email,
      googleId,
      name,
      googleFirstName,
      googleLastName,
      profileImageUrl,
      emailVerified,
      accessToken,
      tokenExpiresIn,
      tokenIssuedAt,
      tokenId,
      tokenNotValidBefore,
    } = req.body;
    const findUser = await UserModel.findOne({
      email,
      isDeleted: false,
    });
    console.log({
      findUser,
      condition: findUser && !findUser.isDeleted,
    });
    if (findUser && !findUser.isDeleted) {
      const userId = String(findUser._id);
      const { token, expiresAt } = generateToken({
        userId,
      });
      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        {
          email,
          profileImageUrl,
          googleMetadata: {
            googleId,
            name,
            googleFirstName,
            googleLastName,
            emailVerified,
            accessToken,
            tokenExpiresIn,
            tokenIssuedAt,
            tokenId,
            tokenNotValidBefore,
          },
          tokenDetails: {
            token,
            expiresAt,
          },
        },
        {
          new: true,
        }
      ).select("-isDeleted -googleMetadata");
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
            message: USER_MESSAGES.USER_SIGNIN_ERROR,
          })
        );
      }
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

type GetUserRequestType = FastifyRequest<{
  Params: {
    id: String;
  };
}>;
const getUser = async (req: GetUserRequestType, reply: FastifyReply) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(id).select("-isDeleted");
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
  Body: {
    username: String;
  };
}>;
const updateUser = async (req: UpdateUserRequestType, reply: FastifyReply) => {
  try {
    const { _id } = req.user;
    const { username } = req.body;
    const user = await UserModel.findById(_id);
    if (user) {
      const updatedUser = await UserModel.findByIdAndUpdate(
        _id,
        { username },
        { new: true }
      );
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
          message: USER_MESSAGES.USER_DONT_EXISTS,
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

type DeleteUserRequestType = FastifyRequest<{
  Body: {
    reason: String;
  };
}>;
const deleteUser = async (req: DeleteUserRequestType, reply: FastifyReply) => {
  try {
    const { _id } = req.user;
    const { reason } = req.body;
    const user = await UserModel.findById(_id);
    if (user) {
      const deleted = await DeletedUserModel.create({
        userId: _id,
        reason,
      });
      const updatedUser = await user.updateOne(
        {
          isDeleted: true,
        },
        { new: true }
      );
      if (deleted && updatedUser) {
        reply.status(200).send(
          response({
            data: user,
            isError: false,
            message: USER_MESSAGES.USER_DELETED_SUCCESSFULLY,
          })
        );
      } else {
        reply.status(400).send(
          response({
            data: user,
            isError: false,
            message: USER_MESSAGES.USER_DELETION_FAILURE,
          })
        );
      }
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
    console.error(`Something went wrong in updateUser due to `, error);
    return reply.status(500).send(
      response({
        isError: true,
        message: INTERNAL_SERVER_ERROR,
      })
    );
  }
};

export { signup, updateUser, getUser, deleteUser, signin, userExists };
