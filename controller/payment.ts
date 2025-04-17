import { FastifyReply, FastifyRequest } from "fastify";
import { response } from "../utils/response";
import { INTERNAL_SERVER_ERROR, PAYMENT_MESSAGES } from "../constant/messages";
import Razorpay from "razorpay";
import { PaymentModel } from "../model/Payment";
import { PAYMENT_STATUS, PLAN_TYPE, PRICE, TOKENS } from "../constant/payment";
import { ValueOf } from "../constant/types";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

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
    const expireBy = now + 30 * 60;

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

export { initiatePayment };
