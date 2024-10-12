import mongoose from "mongoose";
require("dotenv").config();

type connectDBProps = {
  onSuccess?: () => void;
  onError?: (err: any) => void;
  mogoUrl: string;
};

export const connectDB = ({
  onSuccess,
  mogoUrl = process.env.MONGODB,
  onError,
}: connectDBProps) => {
  mongoose
    .connect(mogoUrl, {
      ignoreUndefined: true,
    })
    .then(() => {
      onSuccess && onSuccess();
    })
    .catch((err) => {
      onError && onError(err);
    });
};
