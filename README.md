# 🔐 Secure Transactions Mini App

A production-ready monorepo demonstrating secure envelope encryption using AES-256-GCM, built with Fastify, Next.js, PNPM workspaces, and Turbo.

This project showcases secure transaction storage with encryption and decryption capabilities, deployed using Vercel.

---

## 🚀 Live Demo

Frontend:
https://secure-transactions-mini-app-web.vercel.app

Backend API:
https://secure-transactions-mini-app-api.vercel.app

---

## 🏗 Architecture

Monorepo structure using PNPM + Turbo:


---

## 🔐 Security Design

This project implements envelope encryption:

- AES-256-GCM symmetric encryption
- Random per-transaction Data Encryption Key (DEK)
- Master key-based key wrapping
- Authenticated encryption with nonce + tag
- Tamper detection during decryption

Each encrypted record includes:

- `payload_nonce`
- `payload_ct`
- `payload_tag`
- `dek_wrapped`
- `dek_wrap_nonce`
- `dek_wrap_tag`

This ensures:

- Confidentiality
- Integrity
- Tamper resistance

---

## 🧠 Tech Stack

### Backend
- Fastify
- TypeScript
- Custom crypto package
- Serverless-compatible handler

### Frontend
- Next.js (App Router)
- TypeScript
- Fetch API
- Environment-based API configuration

### Monorepo
- PNPM Workspaces
- Turbo
- TypeScript project references

### Deployment
- Vercel (separate API + Web projects)
- Environment variables for API routing

---

## ⚙️ Local Development

### 1️⃣ Install dependencies

```bash
pnpm install
