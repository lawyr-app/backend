import { Schema, model } from "mongoose";
import { MODELS_TYPE } from "../constant/models";
import { TOKENS } from "../constant/payment";

const userSchema = new Schema(
  {
    // UI fields
    username: String,
    social: String,
    isLawyer: Boolean,
    email: String,
    profileImageUrl: String,
    isDeleted: {
      type: Boolean,
      default: false,
    },
    tokenDetails: {
      token: { type: String },
      expiresAt: { type: Date },
    },
    googleMetadata: {
      googleId: String,
      name: String,
      googleFirstName: String,
      googleLastName: String,
      emailVerified: Boolean,
      accessToken: String,
      tokenExpiresIn: Number,
      tokenIssuedAt: Number,
      tokenId: String,
      tokenNotValidBefore: Number,
    },
    // every time we buy token we will increment over here
    // and we will decrement when we use it
    tokensRemaining: {
      type: Number,
      default: TOKENS.FREE,
    },
  },
  { timestamps: true }
);

export const UserModel = model(MODELS_TYPE.User, userSchema);

// access_token: "ya29.a0AeDClZDhmeY_4oJLr0eVGFjhh_6MjdrAxYS-RmLulqVe7UpoH6SH9coqX9liClLpSBRd2yQJsFufErSb27oiG8TDrNu-B0gc2TXojQvXu6yelswvEvu6JdL42Xkz9gGoMbcgDjN-Vu9fK_7oi9AmIDXnT3-J-fnRJKmccp_OaCgYKAa0SARASFQHGX2MigDEzsgBvCZ-q4w9ldY2Olw0175";
// authuser: "0";
// expires_in: 3599;
// prompt: "consent";
// scope: "email profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid";
// token_type: "Bearer";

// aud: "985470791312-5aa1q8847dupfjg6p5klqh5j7rc4u62t.apps.googleusercontent.com";
// azp: "985470791312-5aa1q8847dupfjg6p5klqh5j7rc4u62t.apps.googleusercontent.com";
// email: "iamsiddhesh22@gmail.com";
// email_verified: true;
// exp: 1733151773;
// family_name: "dabholkar";
// given_name: "siddhesh";
// iat: 1733148173;
// iss: "https://accounts.google.com";
// jti: "22706e641be7767ff784c4ede029df4bd8635b72";
// name: "siddhesh dabholkar";
// nbf: 1733147873;
// picture: "https://lh3.googleusercontent.com/a/ACg8ocI6CEeqXw2p1ZbnWQiFYmS58cWXieRljP1NsYB451rqiWh89YWa=s96-c";
// sub: "104015242030723290663";
