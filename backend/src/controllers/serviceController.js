import { ServiceCategory } from "../models/ServiceCategory.js";
import { ServiceItem } from "../models/ServiceItem.js";
import { ApiError } from "../utils/ApiError.js";
import { escapeRegex } from "../utils/escapeRegex.js";
import { getPagination } from "../utils/pagination.js";

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

export async function listCategories(req, res) {
  // Rule C10: Fetch active categories and active items with 2 queries to avoid N+1
  const categories = await ServiceCategory.find({ is_active: true }).sort({ name: 1 });
  const categoryIds = categories.map((c) => c._id);

  const items = await ServiceItem.find({
    category: { $in: categoryIds },
    is_active: true,
  }).sort({ title: 1 });

  const itemsByCat = {};
  for (const item of items) {
    const catId = item.category.toString();
    if (!itemsByCat[catId]) itemsByCat[catId] = [];
    itemsByCat[catId].push(item.toJSON());
  }

  const result = categories.map((cat) => {
    const obj = cat.toJSON();
    obj.items = itemsByCat[cat.id] || [];
    return obj;
  });

  const { isPaginated, page, limit } = getPagination(req.query);
  if (isPaginated) {
    return res.status(200).json({
      count: result.length,
      page,
      limit,
      results: result.slice((page - 1) * limit, page * limit),
    });
  }

  res.status(200).json(result);
}

export async function getCategoryBySlug(req, res) {
  const category = await ServiceCategory.findOne({ slug: req.params.slug, is_active: true });
  if (!category) throw new ApiError(404, "Category not found");

  const items = await ServiceItem.find({ category: category._id, is_active: true }).sort({ title: 1 });
  const obj = category.toJSON();
  obj.items = items.map((i) => i.toJSON());

  res.status(200).json(obj);
}

export async function listItems(req, res) {
  const { category, search, is_hourly } = req.query;
  const filter = { is_active: true };

  if (category) {
    if (/^[a-f\d]{24}$/i.test(category)) {
      filter.category = category;
    } else {
      const cat = await ServiceCategory.findOne({ slug: category });
      if (cat) filter.category = cat._id;
      else return res.status(200).json([]);
    }
  }

  if (is_hourly !== undefined) {
    filter.is_hourly = is_hourly === "true";
  }

  if (search) {
    filter.title = { $regex: escapeRegex(search), $options: "i" };
  }

  const { isPaginated, page, limit, skip } = getPagination(req.query);

  if (isPaginated) {
    const [count, items] = await Promise.all([
      ServiceItem.countDocuments(filter),
      ServiceItem.find(filter)
        .populate("category", "name slug")
        .sort({ title: 1 })
        .skip(skip)
        .limit(limit),
    ]);
    return res.status(200).json({
      count,
      page,
      limit,
      results: items.map((i) => i.toJSON()),
    });
  }

  const items = await ServiceItem.find(filter)
    .populate("category", "name slug")
    .sort({ title: 1 })
    .limit(limit);

  res.status(200).json(items.map((i) => i.toJSON()));
}

// Admin CRUD operations (Extensibility ➕)
export async function createCategory(req, res) {
  const { name, description, is_active } = req.body;
  const slug = slugify(name);

  const existing = await ServiceCategory.findOne({ slug });
  if (existing) throw new ApiError(409, "Category with this name or slug already exists");

  const category = await ServiceCategory.create({
    name,
    slug,
    description: description || "",
    is_active: is_active !== undefined ? is_active : true,
  });

  res.status(201).json(category.toJSON());
}

export async function updateCategory(req, res) {
  const category = await ServiceCategory.findById(req.params.id);
  if (!category) throw new ApiError(404, "Category not found");

  if (req.body.name) {
    category.name = req.body.name;
    category.slug = slugify(req.body.name);
  }
  if (req.body.description !== undefined) category.description = req.body.description;
  if (req.body.is_active !== undefined) category.is_active = req.body.is_active;

  await category.save();
  res.status(200).json(category.toJSON());
}

export async function deleteCategory(req, res) {
  // Soft delete per prompt
  const category = await ServiceCategory.findById(req.params.id);
  if (!category) throw new ApiError(404, "Category not found");

  category.is_active = false;
  await category.save();

  res.status(200).json(category.toJSON());
}

export async function createServiceItem(req, res) {
  const { category, title, description, is_hourly, hourly_rate, inspection_fee, is_active } = req.body;
  const cat = await ServiceCategory.findById(category);
  if (!cat) throw new ApiError(404, "Category not found");

  const slug = slugify(title);
  const existing = await ServiceItem.findOne({ slug });
  if (existing) throw new ApiError(409, "Service item with this title already exists");

  const item = await ServiceItem.create({
    category,
    title,
    slug,
    description: description || "",
    is_hourly: !!is_hourly,
    hourly_rate: hourly_rate || 0,
    inspection_fee: inspection_fee !== undefined ? inspection_fee : 89,
    is_active: is_active !== undefined ? is_active : true,
  });

  res.status(201).json(item.toJSON());
}

export async function updateServiceItem(req, res) {
  const item = await ServiceItem.findById(req.params.id);
  if (!item) throw new ApiError(404, "Service item not found");

  if (req.body.title) {
    item.title = req.body.title;
    item.slug = slugify(req.body.title);
  }
  if (req.body.category) {
    const cat = await ServiceCategory.findById(req.body.category);
    if (!cat) throw new ApiError(404, "Category not found");
    item.category = req.body.category;
  }
  if (req.body.description !== undefined) item.description = req.body.description;
  if (req.body.is_hourly !== undefined) item.is_hourly = req.body.is_hourly;
  if (req.body.hourly_rate !== undefined) item.hourly_rate = req.body.hourly_rate;
  if (req.body.inspection_fee !== undefined) item.inspection_fee = req.body.inspection_fee;
  if (req.body.is_active !== undefined) item.is_active = req.body.is_active;

  await item.save();
  res.status(200).json(item.toJSON());
}

export async function deleteServiceItem(req, res) {
  // Soft delete per prompt
  const item = await ServiceItem.findById(req.params.id);
  if (!item) throw new ApiError(404, "Service item not found");

  item.is_active = false;
  await item.save();

  res.status(200).json(item.toJSON());
}

