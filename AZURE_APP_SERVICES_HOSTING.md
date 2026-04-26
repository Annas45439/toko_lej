# 🚀 Panduan Hosting di Azure App Services - toko-lej

## ✅ Prasyarat
- ✓ Aplikasi Next.js siap (sudah ada)
- ✓ Database MySQL Azure sudah terhubung
- ✓ Akun Azure sudah ada
- ✓ Git repository sudah siap

---

## 📋 LANGKAH 1: Siapkan Aplikasi untuk Production

### 1.1 Update `.env` untuk Production
Pastikan file `.env` sudah berisi:
```env
DATABASE_URL="mysql://username:password@server.mysql.database.azure.com/database"
NEXTAUTH_URL="https://your-app-name.azurewebsites.net"
NEXTAUTH_SECRET="generate-with-openssl"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 1.2 Build Aplikasi Lokal (Test)
```bash
npm install
npm run build
npm start
```
Jika berjalan normal di http://localhost:3000, lanjut ke step berikutnya.

---

## 📦 LANGKAH 2: Push ke Repository Git

```bash
# Push ke GitHub repo Anda
git add .
git commit -m "Initial commit for Azure deployment"
git branch -M main
git push -u origin main
```

**Repo Anda:** `https://github.com/Annas45439/toko_lej.git`

---

## ☁️ LANGKAH 3: Buat Azure App Services

### 3.1 Login ke Azure Portal
Buka: https://portal.azure.com/

### 3.2 Buat Resource Baru
1. Klik **"Create a resource"**
2. Cari **"Web App"**
3. Klik **"Create"**

### 3.3 Isi Form
| Kolom | Nilai |
|-------|-------|
| **Subscription** | Pilih subscription Anda |
| **Resource Group** | Pilih yang sudah ada atau buat baru (misal: `toko-lej-rg`) |
| **Name** | `toko-lej` atau nama unik (harus unique di seluruh Azure) |
| **Publish** | **Code** |
| **Runtime Stack** | **Node 20 LTS** |
| **Operating System** | **Linux** |
| **App Service Plan** | Buat baru atau pilih yang ada (misal: `toko-lej-plan`) |
| **Pricing** | **B1 (Shared compute)** - cukup untuk dev/small apps |

### 3.4 Review & Create
Klik **"Review + create"** → **"Create"**

⏳ Tunggu ~2-5 menit sampai deployment selesai.

---

## 🔗 LANGKAH 4: Deploy dari GitHub

### 4.1 Konfigurasi GitHub Integration
1. Masuk ke Azure App Service yang baru dibuat
2. Di sidebar kiri, cari **"Deployment"** → **"Deployment Center"**
3. Pilih **"GitHub"** sebagai source
4. Klik **"Connect"** → Authorize Azure dengan GitHub
5. Pilih:
   - **Organization**: USERNAME Anda
   - **Repository**: `toko-lej`
   - **Branch**: `main`

### 4.2 Pilih Build Provider
- Pilih **"GitHub Actions"** (recommended)
- Klik **"Save"**

Azure akan membuat GitHub Actions workflow otomatis.

**Konfirmasi:**
- **Organization**: `Annas45439`
- **Repository**: `toko_lej`
- **Branch**: `main`

⏳ Tunggu deployment pertama selesai (~5-10 menit).

---

## ⚙️ LANGKAH 5: Setup Environment Variables

### 5.1 Di Azure Portal
1. Buka App Service Anda
2. Sidebar → **"Settings"** → **"Configuration"**
3. Klik **"New application setting"**

### 5.2 Tambahkan Semua Variabel
Tambahkan satu per satu:

| Name | Value |
|------|-------|
| `DATABASE_URL` | `mysql://user:pass@server.mysql.database.azure.com/dbname` |
| `NEXTAUTH_URL` | `https://toko-lej.azurewebsites.net` |
| `NEXTAUTH_SECRET` | (hasil openssl rand -base64 32) |
| `NODE_ENV` | `production` |

3. Klik **"Save"** di atas

---

## ✅ LANGKAH 6: Verifikasi Deployment

### 6.1 Cek Status Deployment
1. Sidebar → **"Deployment"** → **"Deployment Center"**
2. Lihat workflow di GitHub Actions (status harus "✓ Success")

### 6.2 Akses Aplikasi
- Buka: `https://toko-lej.azurewebsites.net`
- Atau klik **"Browse"** di Azure Portal

### 6.3 Test Login
- Coba login dengan kredensial yang ada di database
- Jika berhasil, deployment sukses! 🎉

---

## 🔧 LANGKAH 7: Konfigurasi Lanjutan (Opsional)

### 7.1 Custom Domain
1. Sidebar → **"Custom domains"**
2. Klik **"Add custom domain"**
3. Ikuti instruksi untuk menambahkan domain Anda

### 7.2 SSL Certificate
- Azure memberikan SSL gratis otomatis ✅

### 7.3 Monitoring & Logs
1. Sidebar → **"Log stream"**
2. Lihat real-time logs aplikasi
3. Gunakan untuk debugging jika ada error

---

## 🐛 TROUBLESHOOTING

### Error: "Cannot connect to database"
**Solusi:**
- ✓ Pastikan `DATABASE_URL` sudah benar di Configuration
- ✓ Cek di Azure MySQL: **"Connection security"** → izinkan koneksi dari Azure services
- ✓ Restart app service

### Error: "NEXTAUTH_SECRET is missing"
**Solusi:**
- ✓ Generate secret: `openssl rand -base64 32`
- ✓ Tambahkan ke Configuration sebagai `NEXTAUTH_SECRET`

### Aplikasi blank/tidak load
**Solusi:**
- ✓ Lihat Log Stream untuk error message
- ✓ Pastikan build sukses di GitHub Actions
- ✓ Cek apakah `npm run build` berjalan tanpa error

### Deployment gagal di GitHub Actions
**Solusi:**
- ✓ Buka `.github/workflows/` file
- ✓ Pastikan Node version cocok (20 LTS)
- ✓ Restart deployment manual dari Deployment Center

---

## 📊 Quick Checklist

- [ ] `.env` sudah lengkap
- [ ] `npm run build` berjalan lancar
- [ ] Code sudah di push ke GitHub (main branch)
- [ ] Web App sudah dibuat di Azure
- [ ] GitHub Integration sudah connected
- [ ] Environment variables sudah set di Configuration
- [ ] DATABASE_URL dan NEXTAUTH_SECRET sudah ada
- [ ] Deployment workflow berhasil (GitHub Actions)
- [ ] Bisa akses aplikasi di URL Azure
- [ ] Bisa login dengan credentials dari database

---

## 📞 Support
Jika ada error, lihat:
1. **Log Stream** di Azure Portal
2. **GitHub Actions** workflow logs
3. Cek konfigurasi DATABASE_URL di Azure MySQL

**Selamat hosting! 🚀**
