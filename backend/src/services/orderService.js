import { Material } from "../models/Material.js";
import { MaterialOrder } from "../models/MaterialOrder.js";
import { Project } from "../models/Project.js";
import { ApiError } from "../utils/ApiError.js";
import { ORDER_TRANSITIONS, canTransition } from "../utils/transitions.js";

export async function createOrderService(user, data) {
  // 1. Consolidate duplicate material entries by summing quantities
  const quantityMap = {};
  for (const item of data.items) {
    quantityMap[item.material] = (quantityMap[item.material] || 0) + item.quantity;
  }
  const uniqueMaterialIds = Object.keys(quantityMap);

  // 2. Validate Project ownership if provided
  if (data.project) {
    const project = await Project.findOne({ _id: data.project, owner: user.id });
    if (!project) throw new ApiError(404, "Project not found or not owned by user");
  }

  // 3. Load materials in a single query ($in)
  const materials = await Material.find({
    _id: { $in: uniqueMaterialIds },
    is_active: true,
  });

  if (materials.length !== uniqueMaterialIds.length) {
    const foundIds = materials.map((m) => m._id.toString());
    const missing = uniqueMaterialIds.filter((id) => !foundIds.includes(id));
    throw new ApiError(404, `Materials not found or inactive: ${missing.join(", ")}`);
  }

  const materialsById = {};
  for (const mat of materials) {
    materialsById[mat._id.toString()] = mat;
  }

  // 4. Atomic stock decrement with rollback on failure
  const successfulDecrements = [];
  try {
    for (const matId of uniqueMaterialIds) {
      const qty = quantityMap[matId];
      const res = await Material.updateOne(
        { _id: matId, stock: { $gte: qty } },
        { $inc: { stock: -qty } }
      );

      if (res.modifiedCount === 0) {
        throw new ApiError(
          409,
          `Insufficient stock for material '${materialsById[matId].name}' (requested ${qty})`
        );
      }
      successfulDecrements.push({ matId, qty });
    }
  } catch (err) {
    // Rollback already applied decrements
    for (const dec of successfulDecrements) {
      await Material.updateOne({ _id: dec.matId }, { $inc: { stock: dec.qty } });
    }
    throw err;
  }

  // 5. Build order snapshot items
  let total_amount = 0;
  const items = uniqueMaterialIds.map((matId) => {
    const mat = materialsById[matId];
    const qty = quantityMap[matId];
    const unit_price = mat.price;
    const subtotal = unit_price * qty;
    total_amount += subtotal;

    return {
      material: mat._id,
      vendor: mat.vendor || null,
      name: mat.name,
      unit: mat.unit,
      unit_price,
      quantity: qty,
      subtotal,
    };
  });

  const order = await MaterialOrder.create({
    user: user.id,
    project: data.project || null,
    items,
    delivery_address: data.delivery_address,
    city: data.city || "",
    pincode: data.pincode || "",
    total_amount,
    status: "pending",
  });

  return order;
}

export async function updateOrderStatusService(orderId, targetStatus, user) {
  const order = await MaterialOrder.findById(orderId);
  if (!order) throw new ApiError(404, "Material order not found");

  const currentStatus = order.status;

  if (targetStatus === "cancelled") {
    // Customer cancellation
    if (user.role === "customer") {
      if (order.user.toString() !== user.id) {
        throw new ApiError(404, "Material order not found");
      }
      if (currentStatus !== "pending") {
        throw new ApiError(409, "Customers can only cancel pending orders");
      }
    } else if (user.role === "admin") {
      if (!["pending", "confirmed", "processing"].includes(currentStatus)) {
        throw new ApiError(409, `Cannot cancel order in '${currentStatus}' status`);
      }
    } else {
      throw new ApiError(403, "Not authorized to cancel order");
    }

    // Restore stock for all items
    for (const item of order.items) {
      await Material.updateOne({ _id: item.material }, { $inc: { stock: item.quantity } });
    }

    order.status = "cancelled";
    await order.save();
    return order;
  }

  // Admin transitions
  if (user.role !== "admin") {
    throw new ApiError(403, "Only administrators can update order status");
  }

  if (!canTransition(ORDER_TRANSITIONS, currentStatus, targetStatus)) {
    throw new ApiError(409, `Cannot transition order from '${currentStatus}' to '${targetStatus}'`);
  }

  order.status = targetStatus;
  await order.save();
  return order;
}

