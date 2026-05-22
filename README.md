# 📋 Task Tracker Application (MVP v1.0)

[cite_start]Aplikasi manajemen proyek dan tugas berbasis web untuk mempermudah kolaborasi tim secara terpusat, transparan, dan real-time[cite: 235, 236]. [cite_start]Aplikasi ini dibuat menggunakan arsitektur terpisah antara Frontend (React) dan Backend (Express + PostgreSQL)[cite: 255, 258].

---

## 🚀 Fitur Utama Sistem

| Modul | Kemampuan Fitur |
| :--- | :--- |
| **🔐 Autentikasi** | [cite_start]• Daftar akun baru & Login aman berbasis token (JWT) [cite: 260, 270, 271][cite_start].<br>• Pembatasan akses halaman (otomatis ditolak jika belum login)[cite: 272, 273]. |
| **📁 Manajemen Proyek** | [cite_start]• Membuat proyek baru oleh Project Manager [cite: 236, 275][cite_start].<br>• Dashboard dinamis untuk memantau daftar proyek aktif [cite: 276][cite_start].<br>• Fitur untuk mengedit dan menghapus proyek[cite: 277]. |
| **📌 Pengaturan Tugas** | [cite_start]• Membuat tugas baru di dalam tiap proyek [cite: 279][cite_start].<br>• Mengubah status tugas (*To Do / In Progress / Done*) [cite: 280][cite_start].<br>• Mengatur penanggung jawab (*assignee*) & tenggat waktu (*deadline*)[cite: 281]. |
| **💬 Kolom Diskusi** | [cite_start]• Menambahkan komentar langsung di dalam tugas tertentu [cite: 236, 283][cite_start].<br>• Menampilkan riwayat chat/diskusi tim secara berurutan[cite: 284]. |

---

## 🛠️ Teknologi yang Digunakan

* [cite_start]**Tampilan (Frontend):** React, Vite, Tailwind CSS, Zustand, Axios[cite: 255, 260].
* [cite_start]**Server (Backend):** Node.js, Express.js, JWT, Bcrypt[cite: 255, 260].
* [cite_start]**Basis Data:** PostgreSQL & Prisma ORM[cite: 255, 260].

---

## 💻 Langkah Praktis Menjalankan Aplikasi

### Persyaratan Dasar
Sebelum mulai, pastikan laptop kamu sudah terinstal **Node.js** dan **PostgreSQL**.

### 1. Ambil Kode dari GitHub
Buka CMD/Terminal di laptopmu, lalu ketik perintah ini:
```bash
git clone [https://github.com/zhura24/task-tracker.git](https://github.com/zhura24/task-tracker.git)
cd task-tracker