import { FastifyReply, FastifyRequest } from "fastify";
import { response } from "../utils/response";
import { INTERNAL_SERVER_ERROR } from "../constant/messages";
import crypto from "crypto";
import { PAYMENT_STATUS, TOKENS } from "../constant/payment";
import { PaymentModel } from "../model/Payment";

const handleRazorpay = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    // Verify webhook signature
    const webhookSecret = "chedi-webhook"; // Consider moving to .env
    const shasum = crypto.createHmac("sha256", webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (digest !== req.headers["x-razorpay-signature"]) {
      console.error("Invalid webhook signature");
      return reply.status(400).send(
        response({
          data: null,
          isError: true,
          message: "INVALID_SIGNATURE",
        })
      );
    }

    // Webhook signature is valid
    console.log("Valid webhook request:", req.body);

    const { event, payload } = req.body;

    if (
      event === "payment_link.paid" ||
      event === "payment_link.cancelled" ||
      event === "payment_link.expired"
    ) {
      const paymentLinkDetails = payload.payment_link.entity;
      const razorPayId = paymentLinkDetails.id;

      const status = (() => {
        // created
        // partially_paid
        // expired
        // cancelled
        // paid
        if (paymentLinkDetails.status === "paid") {
          return PAYMENT_STATUS.SUCCESS;
        }
        if (paymentLinkDetails.status === "expired") {
          return PAYMENT_STATUS.EXPIRED;
        }
        if (paymentLinkDetails.status === "cancelled") {
          return PAYMENT_STATUS.CANCELLED;
        }
        return "";
      })();

      let paymentRecord = await PaymentModel.findOne({ razorPayId });

      if (paymentRecord?.status === PAYMENT_STATUS.SUCCESS) {
        return reply.status(200).send(
          response({
            data: null,
            isError: false,
            message: "Payment success",
          })
        );
      }

      if (!paymentRecord) {
        return reply.status(400).send(
          response({
            data: null,
            isError: true,
            message: "NO_PAYMENT_ID",
          })
        );
      }

      paymentRecord.status = status;
      await paymentRecord.save();

      console.log(`Payment ${status} saved for razorPayId: ${razorPayId}`);
    }

    // Acknowledge webhook
    return reply.status(200).send(
      response({
        data: null,
        isError: false,
        message: "Webhook processed successfully",
      })
    );
  } catch (error) {
    console.error("Error in handleRazorpay:", error);
    return reply.status(500).send(
      response({
        data: null,
        isError: true,
        message: INTERNAL_SERVER_ERROR,
      })
    );
  }
};

export { handleRazorpay };
