\# Task Tracker Application - MVP Version v1.0



\[cite\_start]A web-based project and task management application designed to enhance team collaboration, transparency, and real-time progress tracking\[cite: 235, 236, 255]. \[cite\_start]Built with a decoupled client-server architecture using the PERN stack variant (PostgreSQL, Express, React, Node.js) and Prisma ORM\[cite: 255, 258].



\---



\## 🚀 Fitur Utama (MVP Core Features)



\### 4.1 Authentication \& Security

\* \[cite\_start]\*\*Register:\*\* Pendaftaran akun baru menggunakan email unik dan password\[cite: 263, 270].

\* \[cite\_start]\*\*Login \& JWT Token:\*\* Autentikasi pengguna berbasis JSON Web Token (JWT) dengan enkripsi password menggunakan Bcrypt\[cite: 260, 271].

\* \[cite\_start]\*\*Route Protection:\*\* Pembatasan akses halaman dashboard; otomatis melakukan redirect ke halaman login jika pengguna belum terautentikasi\[cite: 272].

\* \[cite\_start]\*\*Token Validation:\*\* Validasi otomatis untuk mendeteksi token yang tidak valid atau telah kedaluwarsa (\*expired\*)\[cite: 273].



\### 4.2 Project Management

\* \[cite\_start]\*\*Create Project:\*\* Pembuatan proyek baru terpusat oleh Project Manager\[cite: 236, 264, 275].

\* \[cite\_start]\*\*Project Dashboard:\*\* Menampilkan daftar seluruh proyek yang dimiliki atau melibatkan pengguna secara dinamis\[cite: 276].

\* \[cite\_start]\*\*CRUD Project:\*\* Kemampuan untuk memperbarui (edit) informasi dan menghapus proyek yang sudah tidak aktif\[cite: 277].



\### 4.3 Task Management

\* \[cite\_start]\*\*Task Creation:\*\* Membuat unit tugas baru di dalam proyek spesifik\[cite: 279].

\* \[cite\_start]\*\*Status Lifecycle:\*\* Mengubah status pengerjaan tugas secara fleksibel (\*To Do\* / \*In Progress\* / \*Done\*)\[cite: 280].

\* \[cite\_start]\*\*Assignment \& Deadline:\*\* Menetapkan penanggung jawab (\*assignee\*) dan batas waktu (\*deadline\*) penyelesaian tugas\[cite: 281].



\### 4.4 Comment System

\* \[cite\_start]\*\*Add Comment:\*\* Membuka kolom diskusi dengan menambahkan komentar kontekstual langsung di dalam tugas tertentu\[cite: 236, 283].

\* \[cite\_start]\*\*Comment History:\*\* Menampilkan riwayat diskusi tim secara kronologis dan berurutan\[cite: 284].



\---



\## 🛠️ Tech Stack



\* \[cite\_start]\*\*Frontend:\*\* React, Vite, Tailwind CSS, Zustand (State Management), Axios (HTTP Client)\[cite: 255, 260].

\* \[cite\_start]\*\*Backend:\*\* Node.js, Express.js, JWT, Bcrypt\[cite: 255, 260].

\* \[cite\_start]\*\*Database \& ORM:\*\* PostgreSQL, Prisma ORM\[cite: 255, 260].



\---



\## 💻 Cara Menjalankan Aplikasi (Local Setup)



\### Prerequisites

Pastikan perangkat Anda sudah terinstal:

\* \[Node.js](https://nodejs.org/) (versi 18 atau terbaru)

\* \[PostgreSQL](https://www.postgresql.org/)



\### 1. Kloning Repositori

```bash

git clone \[https://github.com/zhura24/task-tracker.git](https://github.com/zhura24/task-tracker.git)

cd task-tracker

