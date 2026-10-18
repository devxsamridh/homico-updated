import { verifyAccessToken } from "../utils/token.js";
import { User } from "../models/User.js";
import { Vendor } from "../models/Vendor.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Authenticates request using Bearer access token.
 * Re-fetches user role and active status directly from DB to immediately reflect demotions/deactivations.
 */
export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiError(401, "Authentication required"));
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = verifyAccessToken(token);
    if (decoded.type !== "access") {
      return next(new ApiError(401, "Invalid token type"));
    }

    const user = await User.findById(decoded.userId).select("role is_active email full_name").lean();
    if (!user || !user.is_active) {
      return next(new ApiError(401, "User account is inactive or not found"));
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
      full_name: user.full_name,
    };
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new ApiError(401, "Token expired"));
    }
    return next(new ApiError(401, "Invalid token"));
  }
}

/**
 * Loads vendor profile for vendor users.
 * Attaches req.vendorProfile with Vendor document.
 */
export async function loadVendorProfile(req, res, next) {
  if (req.user?.role !== "vendor") {
    return next();
  }

  const vendor = await Vendor.findOne({ user: req.user.id });
  if (!vendor) {
    return next(new ApiError(403, "Vendor profile not found for this account"));
  }

  req.vendorProfile = vendor;
  next();
}

