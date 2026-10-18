import { Vendor } from "../models/Vendor.js";
import { User } from "../models/User.js";
import { ServiceCategory } from "../models/ServiceCategory.js";
import { ApiError } from "../utils/ApiError.js";
import { getPagination } from "../utils/pagination.js";

function sanitizeVendorForUser(vendor, currentUser) {
  const obj = vendor.toJSON ? vendor.toJSON() : vendor;
  const isPrivileged =
    currentUser && (currentUser.role === "admin" || (currentUser.role === "vendor" && obj.user?.toString() === currentUser.id));

  if (!isPrivileged) {
    delete obj.email;
    delete obj.phone;
  }
  return obj;
}

export async function listVendors(req, res) {
  const { category, city, is_available, is_verified } = req.query;
  const filter = {};

  // Visibility: Non-admins only see verified vendors
  if (req.user.role !== "admin") {
    filter.is_verified = true;
  } else if (is_verified !== undefined) {
    filter.is_verified = is_verified === "true";
  }

  if (city) filter.city = city;
  if (is_available !== undefined) filter.is_available = is_available === "true";

  if (category) {
    if (/^[a-f\d]{24}$/i.test(category)) {
      filter.service_categories = category;
    } else {
      const cat = await ServiceCategory.findOne({ slug: category });
      if (cat) filter.service_categories = cat._id;
      else return res.status(200).json([]);
    }
  }

  const { isPaginated, page, limit, skip } = getPagination(req.query);

  if (isPaginated) {
    const [count, vendors] = await Promise.all([
      Vendor.countDocuments(filter),
      Vendor.find(filter)
        .populate("service_categories", "name slug")
        .sort({ business_name: 1 })
        .skip(skip)
        .limit(limit),
    ]);
    return res.status(200).json({
      count,
      page,
      limit,
      results: vendors.map((v) => sanitizeVendorForUser(v, req.user)),
    });
  }

  const vendors = await Vendor.find(filter)
    .populate("service_categories", "name slug")
    .sort({ business_name: 1 })
    .limit(limit);

  res.status(200).json(vendors.map((v) => sanitizeVendorForUser(v, req.user)));
}

export async function getVendor(req, res) {
  const vendor = await Vendor.findById(req.params.id).populate("service_categories", "name slug");
  if (!vendor) throw new ApiError(404, "Vendor not found");

  // Non-admins cannot view unverified vendors
  if (req.user.role !== "admin" && !vendor.is_verified) {
    throw new ApiError(404, "Vendor not found");
  }

  res.status(200).json(sanitizeVendorForUser(vendor, req.user));
}

export async function createVendor(req, res) {
  const { user: userId, business_name, description, phone, email, service_categories, city, pincode, is_verified, is_available } = req.body;

  const targetUser = await User.findById(userId);
  if (!targetUser) throw new ApiError(404, "User not found");

  const existing = await Vendor.findOne({ user: userId });
  if (existing) throw new ApiError(409, "Vendor profile already exists for this user");

  // Upgrade customer to vendor if applicable
  if (targetUser.role === "customer") {
    targetUser.role = "vendor";
    await targetUser.save();
  }

  const vendor = await Vendor.create({
    user: userId,
    business_name,
    description: description || "",
    phone,
    email,
    service_categories: service_categories || [],
    city,
    pincode,
    is_verified: is_verified !== undefined ? is_verified : false,
    is_available: is_available !== undefined ? is_available : true,
  });

  res.status(201).json(vendor.toJSON());
}

export async function updateVendor(req, res) {
  const vendor = await Vendor.findById(req.params.id);
  if (!vendor) throw new ApiError(404, "Vendor not found");

  const isAdmin = req.user.role === "admin";
  const isOwner = req.user.role === "vendor" && vendor.user.toString() === req.user.id;

  if (!isAdmin && !isOwner) {
    throw new ApiError(403, "You do not have permission to update this vendor profile");
  }

  // Permitted fields for vendor owner
  const vendorAllowed = ["description", "phone", "email", "city", "pincode", "is_available", "service_categories"];
  // Admin-only fields: business_name, is_verified, user
  if (!isAdmin) {
    for (const key of ["business_name", "is_verified", "user"]) {
      if (req.body[key] !== undefined) {
        throw new ApiError(403, `Only administrators can update '${key}'`);
      }
    }
  }

  const allowedUpdates = isAdmin
    ? [...vendorAllowed, "business_name", "is_verified"]
    : vendorAllowed;

  for (const key of allowedUpdates) {
    if (req.body[key] !== undefined) {
      vendor[key] = req.body[key];
    }
  }

  await vendor.save();
  res.status(200).json(sanitizeVendorForUser(vendor, req.user));
}

