import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { generateTokens, verifyRefreshToken } from "../utils/token.js";
import { ApiError } from "../utils/ApiError.js";
import { env } from "../config/env.js";

// Dummy bcrypt hash to equalize timing when user is not found (Rule C11)
const DUMMY_HASH = "$2a$12$e80yq7z1l4yQ0pM9aP9.8.7gU6Vp0N/O1u4G2jW8m3Z.1K5b0c.6u";

export async function register(req, res) {
  const { email, username, full_name, phone, password } = req.body;

  // Race-safe unique check or duplicate key handling
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    const fieldErrors = {};
    if (existingUser.email === email) {
      fieldErrors.email = ["A user with this email already exists."];
    }
    if (existingUser.username === username) {
      fieldErrors.username = ["A user with this username already exists."];
    }
    throw new ApiError(409, "User already exists", fieldErrors);
  }

  const password_hash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);

  // Role is strictly stripped/forced to customer (Rule C12)
  const user = await User.create({
    email,
    username,
    full_name,
    phone: phone || "",
    password_hash,
    role: "customer",
    is_active: true,
  });

  const tokens = generateTokens(user);

  res.status(201).json({
    access: tokens.access,
    refresh: tokens.refresh,
    user: user.toJSON(),
  });
}

export async function login(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password_hash");

  if (!user || !user.is_active) {
    // Timing attack mitigation
    await bcrypt.compare(password, DUMMY_HASH);
    throw new ApiError(401, "Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  const tokens = generateTokens(user);

  res.status(200).json({
    access: tokens.access,
    refresh: tokens.refresh,
    user: user.toJSON(),
  });
}

export async function refresh(req, res) {
  const { refresh } = req.body;

  try {
    const decoded = verifyRefreshToken(refresh);
    if (decoded.type !== "refresh") {
      throw new ApiError(401, "Invalid token type");
    }

    const user = await User.findById(decoded.userId).select("is_active role email full_name");
    if (!user || !user.is_active) {
      throw new ApiError(401, "User is inactive or not found");
    }

    const tokens = generateTokens(user);

    // Rule C13: return only { access } - NO refresh token rotation
    res.status(200).json({
      access: tokens.access,
    });
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(401, "Invalid or expired refresh token");
  }
}

export async function me(req, res) {
  const user = await User.findById(req.user.id);
  if (!user || !user.is_active) {
    throw new ApiError(401, "User not found or inactive");
  }

  res.status(200).json(user.toJSON());
}

