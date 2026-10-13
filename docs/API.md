# ATLAS Portfolio Builder API — Neon PostgreSQL + Vercel

Semua endpoint menggunakan origin website yang sama. API berjalan sebagai Vercel Node.js Functions di direktori `api/` dan menggunakan driver resmi Neon `@neondatabase/serverless`.

## Environment variables

Atur variabel ini di **Vercel → Project → Settings → Environment Variables**, lalu lakukan redeploy:

- `DATABASE_URL`: connection string PostgreSQL dari Neon Console. Pada dialog **Connect**, pilih connection string yang sesuai; pooled connection direkomendasikan untuk aplikasi serverless. Pertahankan `sslmode=require` bila disediakan.
- `ADMIN_API_KEY`: secret panjang dan acak untuk endpoint admin. Jangan gunakan awalan `VITE_`.
- `VITE_ADMIN_WHATSAPP`: nomor WhatsApp Admin dalam format internasional, tanpa tanda `+` atau spasi. Contoh: `6281234567890`.

Jangan pernah commit `DATABASE_URL` atau `ADMIN_API_KEY`. File `.env.example` hanya berisi placeholder.

## Skema database

Tabel `atlas_orders` dan indeksnya dibuat otomatis saat API pertama kali mengakses database. Tidak perlu membuat tabel manual. Semua pesanan tersimpan permanen di PostgreSQL Neon sampai dihapus secara eksplisit.

## `GET /api/health`

Memeriksa koneksi ke Neon sekaligus memastikan skema pesanan tersedia. Respons sukses:

```json
{ "ok": true, "service": "atlas-portfolio-api", "database": "ok" }
```

Jika `DATABASE_URL` belum diatur atau koneksi gagal, endpoint mengembalikan HTTP 503.

## `POST /api/orders`

Membuat pesanan baru. Endpoint ini tidak membutuhkan API key; data divalidasi di server.

```json
{
  "name": "Nama Pelanggan",
  "phone": "081234567890",
  "email": "nama@example.com",
  "packageName": "Growth",
  "notes": "Saya membutuhkan landing page untuk usaha saya.",
  "payment": "QRIS",
  "website": ""
}
```

`packageName` harus salah satu dari `Starter`, `Growth`, atau `Custom`. `payment` harus salah satu dari `QRIS`, `DANA`, atau `Transfer Bank`. Respons sukses berstatus HTTP 201 dan berisi ID pesanan. `website` adalah honeypot opsional untuk mengabaikan bot sederhana.

## `GET /api/orders?limit=50` (admin)

Membaca hingga 100 pesanan terbaru. Sertakan header `Authorization: Bearer <ADMIN_API_KEY>` atau `x-admin-api-key: <ADMIN_API_KEY>`. Jangan letakkan secret di frontend atau URL.

## `PATCH /api/orders` (admin)

Mengubah status pesanan dengan autentikasi admin yang sama.

```json
{ "id": "ID_PESANAN", "status": "contacted" }
```

Status yang didukung: `new`, `contacted`, `in_progress`, `completed`, `cancelled`.

Contoh menggunakan `curl`:

```bash
curl -H "Authorization: Bearer $ADMIN_API_KEY" \
  "https://DOMAIN-KAMU.vercel.app/api/orders?limit=20"

curl -X PATCH "https://DOMAIN-KAMU.vercel.app/api/orders" \
  -H "Authorization: Bearer $ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"id":"ID_PESANAN","status":"contacted"}'
```

## Deploy ke Vercel

1. Buat project database PostgreSQL di [Neon Console](https://console.neon.tech/).
2. Buka **Connect**, salin connection string, dan jangan membagikannya secara publik.
3. Push seluruh isi proyek ke GitHub, lalu import repository tersebut ke Vercel.
4. Pada **Settings → Environment Variables**, tambahkan `DATABASE_URL`, `ADMIN_API_KEY`, dan `VITE_ADMIN_WHATSAPP` untuk environment yang diperlukan.
5. Gunakan Framework Preset `Vite`, Build Command `npm run build`, dan Output Directory `dist`. Konfigurasi install memakai `npm install`.
6. Deploy/redeploy, lalu buka `/api/health`. Bila `database` bernilai `ok`, coba kirim pesanan dari formulir website.

API admin disediakan sebagai endpoint, bukan dashboard admin grafis. Gunakan `curl`, Postman, atau aplikasi admin dari server tepercaya. Jangan kirim `ADMIN_API_KEY` ke kode frontend.
