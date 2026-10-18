import { ApiError } from "../utils/ApiError.js";

/**
 * Zod validation middleware for body, query, and params.
 * Strictly parses and replaces request data with the stripped/validated output.
 */
export function validate({ body, query, params } = {}) {
  return (req, res, next) => {
    try {
      if (body) {
        req.body = body.parse(req.body);
      }
      if (query) {
        req.query = query.parse(req.query);
      }
      if (params) {
        req.params = params.parse(req.params);
      }
      next();
    } catch (err) {
      if (err.errors) {
        const fieldErrors = {};
        for (const issue of err.errors) {
          const path = issue.path.join(".") || "non_field_errors";
          if (!fieldErrors[path]) {
            fieldErrors[path] = [];
          }
          fieldErrors[path].push(issue.message);
        }
        return next(new ApiError(400, "Validation failed", fieldErrors));
      }
      next(err);
    }
  };
}

const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;

/**
 * Validates 24-character hexadecimal MongoDB ObjectIds in req.params.
 */
export function validateObjectId(...paramNames) {
  return (req, res, next) => {
    for (const name of paramNames) {
      const val = req.params[name];
      if (!val || !OBJECT_ID_REGEX.test(val)) {
        return next(new ApiError(400, `Invalid ${name} format`));
      }
    }
    next();
  };
}

