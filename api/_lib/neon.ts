import { neon } from "@neondatabase/serverless";

function getConnectionString(): string {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL belum dikonfigurasi. Tambahkan connection string Neon pada Environment Variables Vercel.",
    );
  }
  return connectionString;
}

export function getSql() {
  return neon(getConnectionString());
}

let schemaInitialization: Promise<void> | undefined;

/** Initialize the table lazily. IF NOT EXISTS makes concurrent cold starts safe. */
export async function getDatabase() {
  const sql = getSql();

  if (!schemaInitialization) {
    schemaInitialization = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS atlas_orders (
          id TEXT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          phone VARCHAR(30) NOT NULL,
          email VARCHAR(254) NOT NULL,
          package_name VARCHAR(16) NOT NULL CHECK (package_name IN ('Starter', 'Growth', 'Custom')),
          notes TEXT NOT NULL,
          payment VARCHAR(20) NOT NULL CHECK (payment IN ('QRIS', 'DANA', 'Transfer Bank')),
          status VARCHAR(20) NOT NULL DEFAULT 'new'
            CHECK (status IN ('new', 'contacted', 'in_progress', 'completed', 'cancelled')),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS atlas_orders_created_at_idx
        ON atlas_orders (created_at DESC)
      `;
    })().catch((error: unknown) => {
      schemaInitialization = undefined;
      throw error;
    });
  }

  await schemaInitialization;
  return sql;
}

export async function checkDatabase() {
  const sql = await getDatabase();
  const result = await sql`SELECT 1 AS ok`;
  return result[0]?.ok === 1 || result[0]?.ok === "1";
}
