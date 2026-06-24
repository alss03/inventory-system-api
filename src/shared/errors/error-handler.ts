import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { AppError } from "./app-error.js";

export function errorHandler(
  error: FastifyError,
  _request: FastifyRequest,
  reply: FastifyReply
) {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: error.name,
      message: error.message,
      statusCode: error.statusCode,
    });
  }

  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: "ValidationError",
      message: "Invalid request data",
      statusCode: 400,
      issues: error.issues,
    });
  }

  console.error(error);

  return reply.status(500).send({
    error: "InternalServerError",
    message: "Unexpected internal server error",
    statusCode: 500,
  });
}