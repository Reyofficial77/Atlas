export interface ApiRequest {
  method?: string;
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
  query?: Record<string, string | string[] | undefined>;
}

export interface ApiResponse {
  status(code: number): ApiResponse;
  json(data: unknown): ApiResponse;
  setHeader(name: string, value: string): ApiResponse;
  end(): void;
}

export function setSecurityHeaders(res: ApiResponse) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
}

export function getHeader(req: ApiRequest, name: string): string {
  const value = req.headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export function readJsonBody(body: unknown): Record<string, unknown> {
  if (typeof body === "string") {
    try {
      const parsed: unknown = JSON.parse(body);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : {};
    } catch {
      return {};
    }
  }

  if (body && typeof body === "object" && !Array.isArray(body)) {
    return body as Record<string, unknown>;
  }

  return {};
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Terjadi kesalahan server.";
}
