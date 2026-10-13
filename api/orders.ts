import { timingSafeEqual } from "node:crypto";
import { getDatabase } from "./_lib/neon";
import {
  errorMessage,
  getHeader,
  readJsonBody,
  setSecurityHeaders,
  type ApiRequest,
  type ApiResponse,
} from "./_lib/http";

type OrderStatus = "new" | "contacted" | "in_progress" | "completed" | "cancelled";

type Order = {
  id: string;
  name: string;
  phone: string;
  email: string;
  packageName: "Starter" | "Growth" | "Custom";
  notes: string;
  payment: "QRIS" | "DANA" | "Transfer Bank";
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
};

const PACKAGES = new Set(["Starter", "Growth", "Custom"]);
const PAYMENTS = new Set(["QRIS", "DANA", "Transfer Bank"]);
const STATUSES = new Set<OrderStatus>(["new", "contacted", "in_progress", "completed", "cancelled"]);

function textValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function authorized(req: ApiRequest): boolean {
  const expected = process.env.ADMIN_API_KEY;
  if (!expected) return false;

  const bearer = getHeader(req, "authorization").replace(/^Bearer\s+/i, "");
  const supplied = getHeader(req, "x-admin-api-key") || bearer;
  if (!supplied) return false;

  const left = Buffer.from(supplied);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

function validateOrder(body: Record<string, unknown>): Omit<Order, "id" | "status" | "createdAt" | "updatedAt"> | string {
  const name = textValue(body.name);
  const phone = textValue(body.phone);
  const email = textValue(body.email).toLowerCase();
  const packageName = textValue(body.packageName);
  const notes = textValue(body.notes);
  const payment = textValue(body.payment);

  if (name.length < 2 || name.length > 100) return "Nama harus berisi 2–100 karakter.";
  if (phone.length > 30 || phone.replace(/\D/g, "").length < 7) return "Nomor telepon tidak valid.";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Alamat email tidak valid.";
  if (!PACKAGES.has(packageName)) return "Paket website tidak valid.";
  if (notes.length < 10 || notes.length > 3000) return "Catatan harus berisi 10–3000 karakter.";
  if (!PAYMENTS.has(payment)) return "Metode pembayaran tidak valid.";

  return {
    name,
    phone,
    email,
    packageName: packageName as Order["packageName"],
    notes,
    payment: payment as Order["payment"],
  };
}

function isoDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toISOString();
}

function mapOrder(row: Record<string, unknown>): Order {
  return {
    id: String(row.id),
    name: String(row.name),
    phone: String(row.phone),
    email: String(row.email),
    packageName: row.packageName as Order["packageName"],
    notes: String(row.notes),
    payment: row.payment as Order["payment"],
    status: row.status as OrderStatus,
    createdAt: isoDate(row.createdAt),
    updatedAt: isoDate(row.updatedAt),
  };
}

function adminAuthError() {
  return {
    ok: false,
    error: process.env.ADMIN_API_KEY
      ? "API key admin tidak valid."
      : "ADMIN_API_KEY belum dikonfigurasi di Vercel.",
  };
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  setSecurityHeaders(res);

  try {
    if (req.method === "POST") {
      const body = readJsonBody(req.body);

      // Honeypot: quietly discard simple bot submissions.
      if (textValue(body.website)) {
        return res.status(201).json({ ok: true, order: { id: "received", status: "new" } });
      }

      const validated = validateOrder(body);
      if (typeof validated === "string") {
        return res.status(400).json({ ok: false, error: validated });
      }

      const sql = await getDatabase();
      const id = crypto.randomUUID();
      const createdRows = await sql`
        INSERT INTO atlas_orders
          (id, name, phone, email, package_name, notes, payment, status, created_at, updated_at)
        VALUES
          (${id}, ${validated.name}, ${validated.phone}, ${validated.email}, ${validated.packageName},
           ${validated.notes}, ${validated.payment}, 'new', NOW(), NOW())
        RETURNING created_at AS "createdAt"
      `;
      const createdAt = isoDate((createdRows[0] as Record<string, unknown>).createdAt);

      return res.status(201).json({
        ok: true,
        order: { id, status: "new", createdAt },
      });
    }

    if (req.method === "GET") {
      if (!authorized(req)) {
        return res.status(process.env.ADMIN_API_KEY ? 401 : 503).json(adminAuthError());
      }

      const requestedLimit = Number(req.query?.limit ?? 50);
      const limit = Number.isInteger(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 50;
      const sql = await getDatabase();
      const rows = await sql`
        SELECT
          id, name, phone, email,
          package_name AS "packageName",
          notes, payment, status,
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM atlas_orders
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
      const orders = (rows as Record<string, unknown>[]).map(mapOrder);
      return res.status(200).json({ ok: true, totalReturned: orders.length, orders });
    }

    if (req.method === "PATCH") {
      if (!authorized(req)) {
        return res.status(process.env.ADMIN_API_KEY ? 401 : 503).json(adminAuthError());
      }

      const body = readJsonBody(req.body);
      const id = textValue(body.id);
      const status = textValue(body.status) as OrderStatus;
      if (!id || !STATUSES.has(status)) {
        return res.status(400).json({ ok: false, error: "Sertakan id pesanan dan status yang valid." });
      }

      const sql = await getDatabase();
      const rows = await sql`
        UPDATE atlas_orders
        SET status = ${status}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING
          id, name, phone, email,
          package_name AS "packageName",
          notes, payment, status,
          created_at AS "createdAt",
          updated_at AS "updatedAt"
      `;
      const row = (rows as Record<string, unknown>[])[0];
      if (!row) return res.status(404).json({ ok: false, error: "Pesanan tidak ditemukan." });

      return res.status(200).json({ ok: true, order: mapOrder(row) });
    }

    res.setHeader("Allow", "GET, POST, PATCH");
    return res.status(405).json({ ok: false, error: "Method tidak diizinkan." });
  } catch (error) {
    const message = errorMessage(error);
    console.error("[api/orders] Request failed", error);
    const missingConfig = message.includes("DATABASE_URL");
    return res.status(missingConfig ? 503 : 500).json({
      ok: false,
      error: missingConfig
        ? message
        : "Terjadi kesalahan saat memproses pesanan. Periksa konfigurasi dan log backend Vercel.",
    });
  }
}
