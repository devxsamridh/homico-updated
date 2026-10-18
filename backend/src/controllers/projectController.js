import { Project } from "../models/Project.js";
import { Booking } from "../models/Booking.js";
import { MaterialOrder } from "../models/MaterialOrder.js";
import { ApiError } from "../utils/ApiError.js";
import { getPagination } from "../utils/pagination.js";
import { PROJECT_TRANSITIONS, canTransition } from "../utils/transitions.js";

export async function createProject(req, res) {
  const { name, description, site_address, city, pincode, start_date, estimated_end_date, budget } =
    req.body;

  const sDate = new Date(`${start_date}T00:00:00.000Z`);
  const eDate = new Date(`${estimated_end_date}T00:00:00.000Z`);

  if (eDate < sDate) {
    throw new ApiError(400, "Estimated end date cannot be earlier than start date");
  }

  const project = await Project.create({
    owner: req.user.id,
    name,
    description: description || "",
    site_address,
    city,
    pincode,
    start_date: sDate,
    estimated_end_date: eDate,
    budget,
    status: "planning",
  });

  res.status(201).json(project.toJSON());
}

export async function listProjects(req, res) {
  const filter = {};
  if (req.user.role !== "admin") {
    filter.owner = req.user.id;
  }

  const { isPaginated, page, limit, skip } = getPagination(req.query);

  if (isPaginated) {
    const [count, projects] = await Promise.all([
      Project.countDocuments(filter),
      Project.find(filter).sort({ created_at: -1 }).skip(skip).limit(limit),
    ]);
    return res.status(200).json({
      count,
      page,
      limit,
      results: projects.map((p) => p.toJSON()),
    });
  }

  const projects = await Project.find(filter).sort({ created_at: -1 }).limit(limit);
  res.status(200).json(projects.map((p) => p.toJSON()));
}

export async function getProject(req, res) {
  const filter = { _id: req.params.id };
  if (req.user.role !== "admin") {
    filter.owner = req.user.id;
  }

  const project = await Project.findOne(filter);
  if (!project) throw new ApiError(404, "Project not found");

  // Include lightweight lists of linked bookings and material orders
  const [bookings, material_orders] = await Promise.all([
    Booking.find({ project: project._id })
      .select("service status scheduled_date estimated_price")
      .populate("service", "title"),
    MaterialOrder.find({ project: project._id }).select("status total_amount created_at"),
  ]);

  const obj = project.toJSON();
  obj.bookings = bookings.map((b) => b.toJSON());
  obj.material_orders = material_orders.map((m) => m.toJSON());

  res.status(200).json(obj);
}

export async function updateProject(req, res) {
  const filter = { _id: req.params.id };
  if (req.user.role !== "admin") {
    filter.owner = req.user.id;
  }

  const project = await Project.findOne(filter);
  if (!project) throw new ApiError(404, "Project not found");

  const isAdmin = req.user.role === "admin";
  const currentStatus = project.status;

  if (req.body.status) {
    const targetStatus = req.body.status;
    if (!isAdmin) {
      // Owner can only cancel
      if (targetStatus !== "cancelled") {
        throw new ApiError(403, "Project owners can only cancel projects");
      }
    }

    if (!canTransition(PROJECT_TRANSITIONS, currentStatus, targetStatus)) {
      throw new ApiError(409, `Cannot transition project from '${currentStatus}' to '${targetStatus}'`);
    }

    project.status = targetStatus;
  }

  const descriptiveFields = ["name", "description", "site_address", "city", "pincode", "budget"];
  for (const f of descriptiveFields) {
    if (req.body[f] !== undefined) project[f] = req.body[f];
  }

  await project.save();
  res.status(200).json(project.toJSON());
}

