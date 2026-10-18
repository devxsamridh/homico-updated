import { Router } from "express";
import {
  createProject,
  listProjects,
  getProject,
  updateProject,
} from "../controllers/projectController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { validate, validateObjectId } from "../middleware/validationMiddleware.js";
import {
  createProjectSchema,
  updateProjectSchema,
} from "../validators/projectValidators.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(listProjects));
router.post("/", requireRole("customer"), validate({ body: createProjectSchema }), asyncHandler(createProject));
router.get("/:id", validateObjectId("id"), asyncHandler(getProject));
router.patch("/:id", validateObjectId("id"), validate({ body: updateProjectSchema }), asyncHandler(updateProject));

export default router;

