import { MaterialOrder } from "../models/MaterialOrder.js";
import { ApiError } from "../utils/ApiError.js";
import { getPagination } from "../utils/pagination.js";
import { createOrderService, updateOrderStatusService } from "../services/orderService.js";

export async function createOrder(req, res) {
  const order = await createOrderService(req.user, req.body);
  res.status(201).json(order.toJSON());
}

export async function listOrders(req, res) {
  const filter = {};

  if (req.user.role === "customer") {
    filter.user = req.user.id;
  } else if (req.user.role === "vendor") {
    if (!req.vendorProfile) return res.status(200).json([]);
    filter["items.vendor"] = req.vendorProfile._id;
  } else if (req.user.role === "admin") {
    if (req.query.status) filter.status = req.query.status;
    if (req.query.user) filter.user = req.query.user;
  }

  const { isPaginated, page, limit, skip } = getPagination(req.query);

  const formatOrderForUser = (order) => {
    const obj = order.toJSON();
    if (req.user.role === "vendor") {
      const vendorIdStr = req.vendorProfile._id.toString();
      obj.items = obj.items.filter(
        (it) => it.vendor && it.vendor.toString() === vendorIdStr
      );
      obj.vendor_subtotal = obj.items.reduce((acc, it) => acc + it.subtotal, 0);
    }
    return obj;
  };

  if (isPaginated) {
    const [count, orders] = await Promise.all([
      MaterialOrder.countDocuments(filter),
      MaterialOrder.find(filter).sort({ created_at: -1 }).skip(skip).limit(limit),
    ]);
    return res.status(200).json({
      count,
      page,
      limit,
      results: orders.map(formatOrderForUser),
    });
  }

  const orders = await MaterialOrder.find(filter).sort({ created_at: -1 }).limit(limit);
  res.status(200).json(orders.map(formatOrderForUser));
}

export async function getOrder(req, res) {
  const filter = { _id: req.params.id };

  if (req.user.role === "customer") {
    filter.user = req.user.id;
  } else if (req.user.role === "vendor") {
    if (!req.vendorProfile) throw new ApiError(404, "Order not found");
    filter["items.vendor"] = req.vendorProfile._id;
  }

  const order = await MaterialOrder.findOne(filter);
  if (!order) throw new ApiError(404, "Order not found");

  const obj = order.toJSON();
  if (req.user.role === "vendor") {
    const vendorIdStr = req.vendorProfile._id.toString();
    obj.items = obj.items.filter(
      (it) => it.vendor && it.vendor.toString() === vendorIdStr
    );
    obj.vendor_subtotal = obj.items.reduce((acc, it) => acc + it.subtotal, 0);
  }

  res.status(200).json(obj);
}

export async function updateOrderStatus(req, res) {
  const order = await updateOrderStatusService(req.params.id, req.body.status, req.user);
  res.status(200).json(order.toJSON());
}

