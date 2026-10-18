import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { getPagination } from "../utils/pagination.js";
import { escapeRegex } from "../utils/escapeRegex.js";
import { env } from "../config/env.js";

export async function listUsers(req, res) {
  const { role, is_active, search } = req.query;
  const filter = {};

  if (role) filter.role = role;
  if (is_active !== undefined) filter.is_active = is_active === "true";
  if (search) {
    const escaped = escapeRegex(search);
    filter.$or = [
      { full_name: { $regex: escaped, $options: "i" } },
      { email: { $regex: escaped, $options: "i" } },
      { username: { $regex: escaped, $options: "i" } },
    ];
  }

  const { isPaginated, page, limit, skip } = getPagination(req.query);

  if (isPaginated) {
    const [count, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter).sort({ created_at: -1 }).skip(skip).limit(limit),
    ]);
    return res.status(200).json({
      count,
      page,
      limit,
      results: users.map((u) => u.toJSON()),
    });
  }

  const users = await User.find(filter).sort({ created_at: -1 }).limit(limit);
  res.status(200).json(users.map((u) => u.toJSON()));
}

export async function getUser(req, res) {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  res.status(200).json(user.toJSON());
}

export async function createUser(req, res) {
  const { email, username, full_name, phone, password, role, is_active } = req.body;

  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    const fieldErrors = {};
    if (existing.email === email) fieldErrors.email = ["Email already in use."];
    if (existing.username === username) fieldErrors.username = ["Username already in use."];
    throw new ApiError(409, "User already exists", fieldErrors);
  }

  const password_hash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);
  const user = await User.create({
    email,
    username,
    full_name,
    phone: phone || "",
    password_hash,
    role: role || "customer",
    is_active: is_active !== undefined ? is_active : true,
  });

  res.status(201).json(user.toJSON());
}

export async function updateUser(req, res) {
  const targetId = req.params.id;
  const user = await User.findById(targetId);
  if (!user) throw new ApiError(404, "User not found");

  // Prevent admin from deactivating or demoting themselves
  if (req.user.id === targetId) {
    if (req.body.is_active === false) {
      throw new ApiError(400, "You cannot deactivate your own admin account");
    }
    if (req.body.role && req.body.role !== "admin") {
      throw new ApiError(400, "You cannot demote your own admin account");
    }
  }

  const allowedUpdates = ["full_name", "phone", "role", "is_active"];
  for (const key of allowedUpdates) {
    if (req.body[key] !== undefined) {
      user[key] = req.body[key];
    }
  }

  await user.save();
  res.status(200).json(user.toJSON());
}

