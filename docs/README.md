# AssetFlow — AI-Powered Enterprise Asset & Resource Management System

![AssetFlow Banner](https://img.shields.io/badge/AssetFlow-Enterprise%20ERP-4F46E5?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-10B981?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-7C3AED?style=for-the-badge)

## Overview

AssetFlow is a production-ready, enterprise-grade Asset & Resource Management System that digitizes the complete asset lifecycle. Built with modern web technologies, it provides real-time tracking, AI-powered insights, and comprehensive reporting.

## Features

- **Asset Lifecycle Management** — Registration, allocation, transfer, disposal
- **Resource Booking** — Meeting rooms, vehicles, projectors with conflict detection
- **Maintenance Tracking** — Raise, approve, assign, and track maintenance requests
- **QR Code System** — Auto-generate, download, scan QR codes for instant asset lookup
- **AI Insights** — Health scores, maintenance predictions, duplicate detection, NL search
- **Audit System** — Scheduled audits with discrepancy detection
- **Reports** — PDF/Excel exports for utilization, costs, warranty
- **RBAC** — Admin, Asset Manager, Department Head, Employee roles
- **Dark Mode** — Full dark/light theme support
- **Notifications** — Email + in-app notifications

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript, TailwindCSS |
| UI Components | Shadcn UI, Framer Motion, Recharts |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB Atlas, Mongoose |
| Auth | JWT, bcryptjs, Role-Based Access Control |
| Storage | Local disk (Cloudinary-ready) |
| AI | OpenRouter API (rule-based + LLM) |
| Email | Nodemailer + Gmail SMTP |

## Quick Start

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x
- MongoDB Atlas account

### 1. Clone & Setup
```bash
git clone <repo-url>
cd assetflow
```

### 2. Backend Setup
```bash
cd assetflow-backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run seed       # Seed demo data
npm run dev        # Start backend (port 5000)
```

### 3. Frontend Setup
```bash
cd assetflow-frontend
npm install
cp .env.example .env
npm run dev        # Start frontend (port 5173)
```

### 4. Default Login Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@assetflow.com | Admin@123 |
| Asset Manager | manager@assetflow.com | Manager@123 |
| Dept. Head | head@assetflow.com | Head@123 |
| Employee | employee@assetflow.com | Employee@123 |

## Project Structure
```
odoo_hackathon/
├── docs/                    # Documentation
├── assetflow-backend/       # Express API
└── assetflow-frontend/      # React App
```

## API Base URL
- Development: `http://localhost:5000/api`
- Production: Configured via environment variable

## License
MIT © 2024 AssetFlow Team
