import { ApiError } from "../utils/ApiError.js";

/**
 * Central Express error handler.
 * Formats response conforming strictly to Rule C2:
 * { ...fieldErrors, success: false, detail: "<summary>", message: "<summary>" }
 * Note: fieldErrors keys are serialized FIRST so frontend RegisterForm's
 * `Object.values(data || {})[0]?.[0]` accesses the error string array directly.
 */
export function errorMiddleware(err, req, res, next) {
  let statusCode = 500;
  let detail = "Internal server error";
  let fieldErrors = null;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    detail = err.detail;
    fieldErrors = err.fieldErrors;
  } else if (err.name === "ZodError") {
    statusCode = 400;
    detail = "Validation failed";
    fieldErrors = {};
    for (const issue of err.errors) {
      const path = issue.path.join(".") || "non_field_errors";
      if (!fieldErrors[path]) fieldErrors[path] = [];
      fieldErrors[path].push(issue.message);
    }
  } else if (err.name === "ValidationError") {
    // Mongoose ValidationError
    statusCode = 400;
    detail = "Validation failed";
    fieldErrors = {};
    for (const field of Object.keys(err.errors)) {
      fieldErrors[field] = [err.errors[field].message];
    }
  } else if (err.name === "CastError") {
    statusCode = 400;
    detail = `Invalid format for ${err.path}`;
    fieldErrors = { [err.path]: [`Invalid format for ${err.path}`] };
  } else if (err.code === 11000) {
    // Mongo duplicate key
    statusCode = 409;
    const key = Object.keys(err.keyPattern || err.keyValue || {})[0] || "field";
    detail = `A record with this ${key} already exists.`;
    fieldErrors = { [key]: [`A record with this ${key} already exists.`] };
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    detail = "Token expired";
  } else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    detail = "Invalid token";
  } else if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    statusCode = 400;
    detail = "Malformed JSON body";
  } else {
    // Unhandled error
    if (process.env.NODE_ENV !== "test") {
      console.error("Unhandled Error:", err);
    }
    statusCode = 500;
    detail = "Internal server error";
  }

  // Construct error body keeping field errors at the beginning for Rule C2 compatibility
  const responseBody = {};
  if (fieldErrors && Object.keys(fieldErrors).length > 0) {
    for (const [k, v] of Object.entries(fieldErrors)) {
      responseBody[k] = v;
    }
  }

  responseBody.success = false;
  responseBody.detail = detail;
  responseBody.message = detail;

  res.status(statusCode).json(responseBody);
}

export function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    detail: "Not found",
    message: "Not found",
  });
}

