# FarmSetu 🌾 — Connecting Farmers, Markets & Government

**FarmSetu** is a complete, full-stack MERN (MongoDB, Express.js, React.js, Node.js) agricultural platform designed to connect **Farmers**, **Agricultural Shopkeepers**, and **Government Agriculture Officers**.

---

## 🌟 Key Modules & Features

### 👨‍🌾 1. Farmer Portal
- **Digital Farm Records**: Multi-year historical crop logs (2026, 2025, 2024), survey numbers, cultivated acreage, inputs, and official officer verification statuses (`VERIFIED`, `UNDER_VERIFICATION`, `RETURNED_FOR_CORRECTION`).
- **Register New Crop**: Pre-registers crop schedules, land parcel details, and uploads identity/land documents beforehand to eliminate waiting lines at government Sachivalayam offices.
- **Agricultural Shops & Stock Discovery**: Real-time product search (e.g. "Urea", "DAP", "Cotton Seeds") comparing shop prices and live stock availability (`🟢 In Stock` vs `🔴 Temporarily Out of Stock`). *Strictly for discovery; no e-commerce payments.*
- **Weather & Severe Alerts**: 5-day forecasts, rainfall probability, and field advisories for spraying, fertilizer application, and irrigation.
- **Government Benefits & Policies**: Official notifications, fertilizer subsidies, crop insurance, and personalized recommendations based on crop and state.
- **FarmSetu AI & Voice Assistant**: Interactive text and speech-to-text / text-to-speech assistant answering queries on pest management, fertilizer ratios, and crop care.
- **Farmer Profile**: Displays unique government-issued Farmer ID (`FMR000123`), land holding area, verification status, and password change modal.

### 🏪 2. Shopkeeper Portal
- **My Shops Dashboard**: Manage multiple store branches with location-based filtering.
- **Shop Details**: Editable location & address headers, customer ratings, and complete product inventory management.
- **Product Inventory CRUD**: Add/edit/delete products across 6 agricultural categories (Tools, Machines, Fertilizer, Pesticide, Seeds, Others) with stock status controls (`Full`, `In Stock`, `Low Stock`, `Out of Stock`, `Empty`) and confirmation popups.
- **Shopkeeper Profile**: Merchant details, trade license number, and password sub-form.

### 🏛️ 3. Government Agriculture Officer Portal
- **Dedicated Officer Portal**: Pending verification queue filtered by assigned area jurisdiction (e.g., Vijayawada Mandal, Krishna District).
- **Comprehensive Verification Review**: Side-by-side verification of farmer profile, land survey data, crop schedules, and attached documents (Aadhaar, Passbook, Land Title).
- **Audit Decision Actions**:
  - ✅ **Verify & Approve**: Certifies crop record and updates farmer status.
  - ↩️ **Return for Correction**: Requires reason note to the farmer with resubmission support.
  - ❌ **Reject**: Flags non-compliant submissions with audit logs.
- **Officer Farmer Search**: Direct search by Farmer ID (`FMR000123`), Name, Mobile number, or Location.
- **Verified Archive & Export**: Download verified crop records as structured CSV data or printable reports.
- **Officer Profile**: Official username format, Officer ID, license number, and assigned area configuration.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18+ (Tested on v22)
- **npm**: v9+

### 1. Server Setup
```bash
cd server
npm install
npm start
```
> **Note**: If `MONGODB_URI` in `.env` is blank or omitted, FarmSetu **automatically launches an in-memory MongoDB instance and seeds realistic demo data out-of-the-box!**

### 2. Client Setup
```bash
cd client
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🔑 Demo Login Credentials

| Role | Username / Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **👨‍🌾 Farmer** | `farmer@farmsetu.com` | `farmer123` | Farmer ID: `FMR000123` (Ramesh Patel) |
| **🏪 Shopkeeper** | `shopkeeper@farmsetu.com` | `shop123` | Suresh Agro Agencies |
| **🏛️ Officer** | `officer@farmsetu.com` | `officer123` | AAO Dr. V. Sharma (Vijayawada Area) |

*(Quick 1-Click Demo Fill buttons are also provided on the login page!)*

---

## 📐 Technology Architecture

```text
React.js (Vite + Tailwind CSS + Lucide Icons + Web Speech API)
   ↓
Axios / REST APIs (Bearer JWT Auth)
   ↓
Node.js + Express.js
   ↓
Mongoose ODM
   ↓
MongoDB / MongoMemoryServer
```

---

## 📜 Verification & Audit Workflow

```text
1. Farmer pre-registers crop details and documents
               ↓
2. Status set to "SUBMITTED" / "UNDER_VERIFICATION"
               ↓
3. Officer reviews survey boundaries and documents
               ↓
┌───────────────┬──────────────────────────┬──────────────┐
│  ✅ Verify    │ ↩️ Return for Correction │  ❌ Reject   │
└───────────────┴──────────────────────────┴──────────────┘
               ↓
4. Status and audit log updated in MongoDB
               ↓
5. Farmer instantly sees status & remarks on Dashboard
```
