import { Material } from "../models/Material.js";
import { ApiError } from "../utils/ApiError.js";
import { escapeRegex } from "../utils/escapeRegex.js";
import { getPagination } from "../utils/pagination.js";

export async function listMaterials(req, res) {
  const { category, search, in_stock, vendor, mine } = req.query;
  const filter = { is_active: true };

  if (category) filter.category = category;
  if (in_stock === "true") filter.stock = { $gt: 0 };
  if (vendor) filter.vendor = vendor;

  // Vendor querying their own materials
  if (mine === "true") {
    if (!req.vendorProfile) {
      return res.status(200).json([]);
    }
    filter.vendor = req.vendorProfile._id;
  }

  if (search) {
    filter.name = { $regex: escapeRegex(search), $options: "i" };
  }

  const { isPaginated, page, limit, skip } = getPagination(req.query);

  const queryBuilder = (q) =>
    q.populate("vendor", "business_name").sort({ name: 1 });

  if (isPaginated) {
    const [count, items] = await Promise.all([
      Material.countDocuments(filter),
      queryBuilder(Material.find(filter)).skip(skip).limit(limit),
    ]);
    return res.status(200).json({
      count,
      page,
      limit,
      results: items.map((m) => m.toJSON()),
    });
  }

  const items = await queryBuilder(Material.find(filter)).limit(limit);
  res.status(200).json(items.map((m) => m.toJSON()));
}

export async function getMaterial(req, res) {
  const material = await Material.findOne({ _id: req.params.id, is_active: true }).populate(
    "vendor",
    "business_name"
  );
  if (!material) throw new ApiError(404, "Material not found");
  res.status(200).json(material.toJSON());
}

export async function createMaterial(req, res) {
  const data = { ...req.body };

  if (req.user.role === "vendor") {
    if (!req.vendorProfile) throw new ApiError(403, "Vendor profile required");
    data.vendor = req.vendorProfile._id;
  } else if (req.user.role === "admin") {
    data.vendor = req.body.vendor || null;
  }

  const material = await Material.create({
    name: data.name,
    category: data.category,
    description: data.description || "",
    price: data.price,
    unit: data.unit,
    stock: data.stock,
    vendor: data.vendor,
    is_active: data.is_active !== undefined ? data.is_active : true,
  });

  res.status(201).json(material.toJSON());
}

export async function updateMaterial(req, res) {
  const filter = { _id: req.params.id };
  if (req.user.role === "vendor") {
    if (!req.vendorProfile) throw new ApiError(403, "Vendor profile required");
    filter.vendor = req.vendorProfile._id;
  }

  const material = await Material.findOne(filter);
  if (!material) throw new ApiError(404, "Material not found");

  const fields = ["name", "category", "description", "price", "unit", "stock", "is_active"];
  for (const f of fields) {
    if (req.body[f] !== undefined) material[f] = req.body[f];
  }

  if (req.user.role === "admin" && req.body.vendor !== undefined) {
    material.vendor = req.body.vendor;
  }

  await material.save();
  res.status(200).json(material.toJSON());
}

export async function deleteMaterial(req, res) {
  // Soft delete per prompt
  const filter = { _id: req.params.id };
  if (req.user.role === "vendor") {
    if (!req.vendorProfile) throw new ApiError(403, "Vendor profile required");
    filter.vendor = req.vendorProfile._id;
  }

  const material = await Material.findOne(filter);
  if (!material) throw new ApiError(404, "Material not found");

  material.is_active = false;
  await material.save();
  res.status(200).json(material.toJSON());
}

