# 📋 Task Tracker Application (MVP v1.0)

Aplikasi manajemen proyek dan tugas berbasis web untuk mempermudah kolaborasi tim secara terpusat, transparan, dan real-time. Aplikasi ini dibuat menggunakan arsitektur terpisah antara Frontend (React) dan Backend (Express + PostgreSQL).

---

## 🚀 Fitur Utama Sistem

| Modul | Kemappan Fitur |
| :--- | :--- |
| **🔐 Autentikasi** | • Daftar akun baru & Login aman berbasis token (JWT).<br>• Pembatasan akses halaman (otomatis ditolak jika belum login).<br>• Validasi otomatis untuk mendeteksi token tidak valid atau expired. |
| **📁 Manajemen Proyek** | • Membuat proyek baru oleh Project Manager.<br>• Dashboard dinamis untuk memantau daftar proyek aktif.<br>• Fitur untuk mengedit dan menghapus proyek yang tidak aktif. |
| **📌 Pengaturan Tugas** | • Membuat unit tugas baru di dalam proyek spesifik.<br>• Mengubah status tugas (*To Do / In Progress / Done*).<br>• Mengatur penanggung jawab (*assignee*) & tenggat waktu (*deadline*). |
| **💬 Kolom Diskusi** | • Menambahkan komentar langsung di dalam tugas tertentu.<br>• Menampilkan riwayat chat/diskusi tim secara berurutan. |

---

## 🛠️ Teknologi yang Digunakan

* **Tampilan (Frontend):** React, Vite, Tailwind CSS, Zustand, Axios.
* **Server (Backend):** Node.js, Express.js, JWT, Bcrypt.
* **Basis Data:** PostgreSQL & Prisma ORM.

---

## 💻 Langkah Praktis Menjalankan Aplikasi

### Persyaratan Dasar
Sebelum mulai, pastikan laptop kamu sudah terinstal **Node.js** dan **PostgreSQL**.

### 1. Ambil Kode dari GitHub
Buka CMD/Terminal di laptopmu, lalu ketik perintah ini:
```bash
git clone [https://github.com/zhura24/task-tracker.git](https://github.com/zhura24/task-tracker.git)
cd task-tracker