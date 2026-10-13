# ATLAS Studio — Website Portfolio Builder

Landing page React + Vite dengan API pesanan serverless untuk Vercel dan penyimpanan PostgreSQL persisten menggunakan Neon.

## Teknologi

- React 19 + Vite 8
- Vercel Node.js Functions (`/api/*`)
- Neon PostgreSQL + `@neondatabase/serverless`
- Validasi input pesanan dan API admin yang dilindungi `ADMIN_API_KEY`

## Menjalankan lokal

```bash
npm install
cp .env.example .env.local
npm run dev
```

Isi `DATABASE_URL` dan `ADMIN_API_KEY` yang valid di `.env.local`. Vite dev server biasa tidak menjalankan direktori `api/` sebagai serverless functions; untuk menguji API secara lokal, gunakan Vercel CLI (`npx vercel dev`).

## Deploy ke Vercel

1. Buat database PostgreSQL di [Neon Console](https://console.neon.tech/).
2. Ambil connection string dari tombol **Connect** di Neon.
3. Tambahkan `DATABASE_URL`, `ADMIN_API_KEY`, dan `VITE_ADMIN_WHATSAPP` ke Vercel Environment Variables.
4. Deploy proyek dari GitHub dengan Build Command `npm run build` dan Output Directory `dist`.
5. Uji `https://DOMAIN-KAMU.vercel.app/api/health` hingga respons menunjukkan `"database":"ok"`.

Tabel `atlas_orders` dibuat otomatis saat API pertama kali mengakses database. Jangan commit file `.env.local` atau membagikan rahasia database.

Panduan endpoint, format request, dan pengelolaan status admin tersedia di [docs/API.md](docs/API.md).
