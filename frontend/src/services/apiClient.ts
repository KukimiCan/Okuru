import { config } from "../lib/config";
import type { ApiErrorBody, ApiRequestOptions, ApiSuccess } from "../types/api";

export class ApiClientError extends Error {
  code: string;
  details: unknown[];
  status: number;

  constructor(message: string, code: string, status: number, details: unknown[] = []) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

let accessTokenProvider: (() => Promise<string | null> | string | null) | null = null;

export function setAccessTokenProvider(
  provider: (() => Promise<string | null> | string | null) | null,
) {
  accessTokenProvider = provider;
}

function buildUrl(path: string) {
  const normalizedBase = config.apiBaseUrl.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

async function getAccessToken(token?: string | null) {
  if (token !== undefined) {
    return token;
  }

  if (!accessTokenProvider) {
    return null;
  }

  return accessTokenProvider();
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const token = await getAccessToken(options.token);
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const payload = (await response.json().catch(() => null)) as
    | ApiSuccess<T>
    | ApiErrorBody
    | null;

  if (!response.ok) {
    const errorPayload = payload && "error" in payload ? payload.error : null;
    throw new ApiClientError(
      errorPayload?.message ?? "API request failed",
      errorPayload?.code ?? "API_ERROR",
      response.status,
      errorPayload?.details ?? [],
    );
  }

  if (!payload || !("data" in payload)) {
    throw new ApiClientError("API response is invalid", "INVALID_RESPONSE", response.status);
  }

  return payload.data;
}
