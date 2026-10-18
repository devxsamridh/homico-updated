import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function generateTokens(user) {
  const payload = {
    userId: user.id || user._id.toString(),
    role: user.role,
  };

  const access = jwt.sign(
    { ...payload, type: "access" },
    env.JWT_ACCESS_SECRET,
    { algorithm: "HS256", expiresIn: env.ACCESS_TOKEN_EXPIRES_IN }
  );

  const refresh = jwt.sign(
    { ...payload, type: "refresh" },
    env.JWT_REFRESH_SECRET,
    { algorithm: "HS256", expiresIn: env.REFRESH_TOKEN_EXPIRES_IN }
  );

  return { access, refresh };
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, { algorithms: ["HS256"] });
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET, { algorithms: ["HS256"] });
}

