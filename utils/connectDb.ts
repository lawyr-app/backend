import mongoose from "mongoose";
import { MONGODB_URL } from "../constant/envvariables";

type connectDBProps = {
  onSuccess?: () => void;
  onError?: (err: any) => void;
  mogoUrl: string;
};

export const connectDB = ({
  onSuccess,
  mogoUrl = MONGODB_URL!,
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
