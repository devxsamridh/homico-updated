import { z } from "zod";

const TIME_SLOTS = ["09:00 - 11:00", "11:00 - 13:00", "14:00 - 16:00", "16:00 - 18:00"];

export const createBookingSchema = z.object({
  service: z.string().regex(/^[a-f\d]{24}$/i, "Invalid service ObjectId"),
  full_name: z.string().trim().min(1, "Full name is required"),
  phone: z
    .string()
    .transform((val) => val.replace(/[\s-]/g, ""))
    .pipe(z.string().regex(/^\+?\d{7,15}$/, "Invalid phone number format")),
  address: z.string().trim().min(1, "Address is required"),
  city: z.string().trim().optional().default(""),
  pincode: z
    .string()
    .trim()
    .refine((val) => val === "" || /^\d{6}$/.test(val), {
      message: "Pincode must be 6 digits if provided",
    })
    .optional()
    .default(""),
  scheduled_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
    .refine(
      (val) => {
        const inputDate = new Date(`${val}T00:00:00.000Z`);
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        return inputDate >= today;
      },
      { message: "Scheduled date must be today or a future date" }
    ),
  time_slot: z.enum(TIME_SLOTS),
  problem: z.string().trim().optional().default(""),
  estimated_price: z.number().optional(), // Client value ignored/overridden server-side
  project: z.string().regex(/^[a-f\d]{24}$/i, "Invalid project ObjectId").optional(),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum([
    "confirmed",
    "vendor_assigned",
    "inspection_completed",
    "quotation_sent",
    "quotation_accepted",
    "quotation_rejected",
    "work_in_progress",
    "completed",
    "cancelled",
  ]),
});

export const assignVendorSchema = z.object({
  vendor: z.string().regex(/^[a-f\d]{24}$/i, "Invalid vendor ObjectId"),
});

