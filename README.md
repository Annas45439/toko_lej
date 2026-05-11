# toko_lej

## Stack Aplikasi
- Next.js 14 (App Router) + React 18 + TypeScript
- Prisma ORM + MySQL

## Keamanan Input
Keamanan input **tidak cukup** hanya dengan memblokir tanda petik tunggal (`'`) secara global.  
Pada proyek ini, pendekatan yang dipakai adalah:

1. **Validasi whitelist per-field** untuk field terbatas:
   - `username`: hanya huruf/angka/`._-`
   - `phone`: hanya angka, spasi, `+`, `-`, `()`
   - `name` (pelanggan/suplier/produk): huruf/angka/spasi dan tanda baca umum termasuk apostrof
2. **Field bebas** (mis. `address`, `description`) tetap menerima apostrof, lalu dinormalisasi inputnya.
3. **Validasi server-side** diterapkan pada route API utama (`user`, `pelanggan`, `suplier`, `produk`), tidak hanya di frontend.
4. **Query database** menggunakan Prisma (parameterized query), tidak menggunakan string concatenation dari input user.
5. Jika suatu saat perlu merender input user ke HTML mentah (`dangerouslySetInnerHTML`), gunakan helper:
   - `sanitizeTextForHtml(...)` dari `src/lib/input-security.ts`.
