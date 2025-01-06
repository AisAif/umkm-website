#!/bin/bash

# Periksa file .env
echo "Memeriksa file .env..."
if [ ! -f ".env" ]; then
  echo "❌ File .env tidak ditemukan!"
  echo "Silakan buat file .env atau salin dari .env.example:"
  echo "  cp .env.example .env"
  exit 1
else
  echo "✔️ File .env ditemukan."
fi

# Pastikan Node.js terpasang
echo "Memeriksa apakah Node.js terpasang..."
if ! command -v node &> /dev/null; then
  echo "❌ Node.js tidak ditemukan!"
  echo "Pastikan Node.js sudah terinstal dengan benar."
  exit 1
else
  echo "✔️ Node.js ditemukan."
fi

# Pastikan Docker Compose terpasang
echo "Memeriksa apakah Docker Compose terpasang..."
if ! command -v docker compose &> /dev/null; then
  echo "❌ Docker Compose tidak ditemukan!"
  echo "Pastikan Docker Compose sudah terinstal dengan benar."
  exit 1
else
  echo "✔️ Docker Compose ditemukan."
fi

# Jalankan Migrasi Database
echo "Melakukan migrasi database..."
node ace migration:run
if [ $? -ne 0 ]; then
  echo "❌ Terjadi kesalahan saat melakukan migrasi database."
  exit 1
else
  echo "✔️ Migrasi database berhasil."
fi

# Jalankan Docker Compose dengan file .env
echo "Menjalankan container dengan file .env..."
docker compose --env-file ./.env up -d
if [ $? -ne 0 ]; then
  echo "❌ Terjadi kesalahan saat menjalankan Docker Compose."
  exit 1
else
  echo "✔️ Docker Compose berhasil dijalankan."
fi
