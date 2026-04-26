# 🔐 Panduan Setup GitHub Secrets - STEP BY STEP

## ⚠️ JANGAN BINGUNG - Ikuti langkah ini dengan TELITI!

---

## 📋 Info yang Sudah Kita Punya:

```
AZURE_SUBSCRIPTION_ID = 8703a211-bd78-4dbc-a1e2-3d94d1a21d3
AZURE_TENANT_ID = c645c7c8-7c00-412b-8e33-446ce676322f
AZURE_CLIENT_ID = ? (kita cari tahu)
```

---

## 🔍 STEP 1: Cari AZURE_CLIENT_ID

### Lokasi yang PASTI:

**Di Azure Portal:**
1. Buka App Service: **toko-lej**
2. Sidebar kiri → Cari **"Settings"** section
3. Klik **"Identity"**
4. Tunggu halaman load
5. Lihat **Tab "System assigned"** (pilih ini)
6. Ada field bertulisan **"Object (principal) ID"**
7. **COPY angka yang ada di field itu** (ada icon copy di sebelahnya)

---

## 🎯 STEP 2: Buka GitHub Secrets

**1. Buka browser → https://github.com/Annas45439/toko_lej**

**2. Di menu bar atas, klik: Settings**

**3. Di sidebar kiri, cari: "Secrets and variables"**

**4. Klik: "Actions"**

Sekarang Anda di halaman: **"Repository secrets"**

---

## ➕ STEP 3: Add Secret PERTAMA

**Klik tombol berwarna hijau: "New repository secret"**

### Form yang muncul:

| Field | Isi dengan |
|-------|-----------|
| **Name** | `AZURE_SUBSCRIPTION_ID` (persis seperti ini) |
| **Secret** | `8703a211-bd78-4dbc-a1e2-3d94d1a21d3` |

**Terus klik: "Add secret"**

✅ Secret pertama sudah masuk!

---

## ➕ STEP 4: Add Secret KEDUA

**Klik lagi: "New repository secret"**

### Form yang muncul:

| Field | Isi dengan |
|-------|-----------|
| **Name** | `AZURE_TENANT_ID` (persis seperti ini) |
| **Secret** | `c645c7c8-7c00-412b-8e33-446ce676322f` |

**Terus klik: "Add secret"**

✅ Secret kedua sudah masuk!

---

## ➕ STEP 5: Add Secret KETIGA

**Klik lagi: "New repository secret"**

### Form yang muncul:

| Field | Isi dengan |
|-------|-----------|
| **Name** | `AZURE_CLIENT_ID` (persis seperti ini) |
| **Secret** | ??? (TUNGGU ANDA KASIH TAHU) |

**STOP DI SINI!**

---

## 🆘 SEKARANG:

1. **Buka Azure Portal**
2. **Ke App Service toko-lej**
3. **Sidebar → Identity**
4. **Lihat "Object (principal) ID"**
5. **Salin angkanya**
6. **Kirim ke saya: "AZURE_CLIENT_ID = [ANGKA]"**

Setelah Anda kirim angkanya, saya kasih tahu cara lanjutannya!

---

## 📸 Jika Masih Bingung:

- Screenshot halaman Azure di mana AZURE_CLIENT_ID berada
- Saya akan circle/tandai dan jelaskan lebih detail

**JANGAN TAKUT SALAH!** 💪 
Anda hanya copy-paste angka, gampang kok!

---

## ✅ Checklist:

- [ ] Buka Azure Portal → toko-lej
- [ ] Klik Settings → Identity
- [ ] Copy "Object (principal) ID"
- [ ] Kirim value-nya ke saya
- [ ] Nanti saya guide lanjutannya

**READY? Mulai dari step 1!** 🚀
