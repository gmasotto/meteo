import { ZodType } from "zod";

export class ApiError extends Error {
  status?: number;
  code?: string;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

type ErrorPayload = {
  message?: string;
  cod?: string | number;
};

export async function fetchJson<T>(
  url: string,
  schema?: ZodType<T>,
): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    let message = "Request failed";
    let code: string | undefined;

    try {
      const body = (await response.json()) as ErrorPayload;
      if (body.message) {
        message = body.message;
      }
      if (body.cod !== undefined) {
        code = String(body.cod);
      }
    } catch {
      // Keep fallback error message if payload is not JSON
    }

    throw new ApiError(message, response.status, code);
  }

  const data = (await response.json()) as unknown;

  if (!schema) {
    return data as T;
  }

  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    throw new ApiError("Invalid API response schema", response.status);
  }

  return parsed.data;
}
