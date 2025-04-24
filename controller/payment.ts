import { FastifyReply, FastifyRequest } from "fastify";
import { response } from "../utils/response";
import { INTERNAL_SERVER_ERROR, PAYMENT_MESSAGES } from "../constant/messages";
import Razorpay from "razorpay";
import { PaymentModel } from "../model/Payment";
import { PAYMENT_STATUS, PLAN_TYPE, PRICE, TOKENS } from "../constant/payment";
import { ValueOf } from "../constant/types";
import { UserModel } from "../model/User";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

type addTokensInTheUserSchemaProps = {
  userId: string;
  tokens: number;
};
const addTokensInTheUserSchema = async ({
  userId,
  tokens,
}: addTokensInTheUserSchemaProps) => {
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return;
    }
    const currentTokens = user.tokensRemaining || 0;
    const newTokens = currentTokens + tokens;

    const currentBoughtTokens = user.tokensBought || 0;
    const updatedTokensBought = currentBoughtTokens + tokens;

    await UserModel.findByIdAndUpdate(userId, {
      tokensRemaining: newTokens,
      tokensBought: updatedTokensBought,
    });
    console.log(
      `updated the user with userId ${userId} with tokens ${newTokens}`
    );
  } catch (error) {
    console.error("Something went wrong in addTokensInTheUserSchema", error);
  }
};

type initiatePaymentReqType = FastifyRequest<{
  Body: {
    type: ValueOf<typeof PLAN_TYPE>;
  };
}>;
const initiatePayment = async (
  req: initiatePaymentReqType,
  reply: FastifyReply
) => {
  try {
    const { type } = req.body;
    const { email, username, _id } = req.user;

    const now = Math.floor(Date.now() / 1000);
    const expireBy = now + 18 * 60;

    if (!type) {
      return reply.send(
        response({
          data: null,
          isError: true,
          message: PAYMENT_MESSAGES.TYPE_CANNOT_BE_EMPTY,
        })
      );
    }

    const amount = (() => {
      switch (type) {
        case PLAN_TYPE.BASIC:
          return PRICE.BASIC;
        case PLAN_TYPE.PRO:
          return PRICE.PRO;
        case PLAN_TYPE.PREMIUM:
          return PRICE.PREMIUM;
        case PLAN_TYPE.ULTRA:
          return PRICE.ULTRA;
        default:
          return 0;
      }
    })();

    const tokens = (() => {
      switch (type) {
        case PLAN_TYPE.BASIC:
          return TOKENS.BASIC;
        case PLAN_TYPE.PRO:
          return TOKENS.PRO;
        case PLAN_TYPE.PREMIUM:
          return TOKENS.PREMIUM;
        case PLAN_TYPE.ULTRA:
          return TOKENS.ULTRA;
        default:
          return 0;
      }
    })();

    try {
      const order = await razorpay.paymentLink.create({
        amount: amount * 100,
        currency: "INR",
        accept_partial: false,
        // first_min_partial_amount: 100,
        description: "For XYZ purpose",
        customer: {
          name: username,
          email,
        },
        notify: {
          sms: false,
          email: false,
        },
        reminder_enable: false,
        callback_url: "https://example-callback-url.com/",
        callback_method: "get",
        expire_by: expireBy,
      });
      if (order) {
        const payment = await PaymentModel.create({
          userId: _id,
          razorPayId: order.id,
          amount: amount,
          tokens: tokens,
          status: PAYMENT_STATUS.INITIATED,
        });
        reply.send(
          response({
            data: order,
            isError: false,
            message: PAYMENT_MESSAGES.PAYMENT_INITIATED_SUCCESSFULLY,
          })
        );
      } else {
        reply.send(
          response({
            data: null,
            isError: true,
            message: PAYMENT_MESSAGES.PAYMENT_INITIATION_FAILED,
          })
        );
      }
    } catch (err) {
      console.error("Order creation failed", err);
      reply.status(500).send(
        response({
          data: null,
          isError: true,
          message: INTERNAL_SERVER_ERROR,
        })
      );
    }
  } catch (error) {
    console.error(`Something went wrong in initiatePayment due to `, error);
    return reply.status(500).send(
      response({
        data: null,
        isError: true,
        message: INTERNAL_SERVER_ERROR,
      })
    );
  }
};

type getPaymentsReqType = FastifyRequest<{
  Querystring: {};
}>;
const getPayments = async (req: getPaymentsReqType, reply: FastifyReply) => {
  try {
    const { _id } = req.user;
    const payments = await PaymentModel.find({ userId: _id }).sort({
      createdAt: -1,
    });
    return reply.send(
      response({
        data: payments,
        isError: false,
        message: PAYMENT_MESSAGES.PAYMENTS_FETCHED_SUCCESSFULLY,
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

type getPaymentReqType = FastifyRequest<{
  Params: {
    id: string;
  };
  Querystring: {
    needRazorpayDetails?: boolean;
  };
}>;
const getPayment = async (req: getPaymentReqType, reply: FastifyReply) => {
  try {
    const { id } = req.params;
    const { _id: userId } = req.user;
    const { needRazorpayDetails } = req.query;

    const paymentDetails = await PaymentModel.findById(id);

    if (!paymentDetails) {
      return reply.status(404).send(
        response({
          data: null,
          isError: true,
          message: PAYMENT_MESSAGES.NO_SUCH_PAYMENT_EXIST,
        })
      );
    }

    if (paymentDetails?.userId?.toString() !== userId.toString()) {
      return reply.status(403).send(
        response({
          data: null,
          isError: true,
          message: PAYMENT_MESSAGES.NO_SUCH_PAYMENT_EXIST,
        })
      );
    }

    if (needRazorpayDetails && paymentDetails.razorPayId) {
      const razorpayDetails = await razorpay.paymentLink.fetch(
        paymentDetails.razorPayId
      );
      return reply.status(200).send(
        response({
          data: {
            ...paymentDetails,
            razorpayDetails,
          },
          isError: false,
          message: PAYMENT_MESSAGES.PAYMENT_FETCHED_SUCCESSFULLY,
        })
      );
    }
    return reply.status(200).send(
      response({
        data: paymentDetails,
        isError: false,
        message: PAYMENT_MESSAGES.PAYMENT_FETCHED_SUCCESSFULLY,
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

export { initiatePayment, getPayments, getPayment, addTokensInTheUserSchema };
