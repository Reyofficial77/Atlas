import { checkDatabase } from "./_lib/neon";
import { setSecurityHeaders, type ApiRequest, type ApiResponse } from "./_lib/http";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  setSecurityHeaders(res);

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method tidak diizinkan." });
  }

  try {
    const connected = await checkDatabase();
    if (!connected) {
      return res.status(503).json({ ok: false, service: "atlas-portfolio-api", database: "error" });
    }
    return res.status(200).json({ ok: true, service: "atlas-portfolio-api", database: "ok" });
  } catch (error) {
    console.error("[api/health] Neon database check failed", error);
    return res.status(503).json({
      ok: false,
      service: "atlas-portfolio-api",
      database: "error",
      error: process.env.DATABASE_URL ? "Koneksi database gagal. Periksa DATABASE_URL dan status database Neon." : "DATABASE_URL belum dikonfigurasi di Vercel.",
    });
  }
}
