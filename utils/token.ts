import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../constant/envvariables";

type generateTokenProps = {
  userId: String;
};
const generateToken = ({ userId }: generateTokenProps) => {
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return {
    token,
    expiresAt,
  };
};

export { generateToken };
