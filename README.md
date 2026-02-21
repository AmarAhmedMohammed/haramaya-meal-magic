<div align="center">

<!-- Header Banner -->
<img src="https://img.shields.io/badge/🏫_Haramaya_University-Smart_Meal_System-1a472a?style=for-the-badge&labelColor=0d2818" alt="HU Smart Meal" width="600"/>

<br/>
<br/>

# 🍽️ Haramaya University — Smart Meal System

<p align="center">
  <em>A comprehensive, real-time cafeteria management platform for Haramaya University — featuring QR/barcode scanning, role-based dashboards, anti-cheat meal tracking, multi-cafeteria support, and automated student registration with email notifications.</em>
</p>

<p align="center">
  <strong>ሀረማያ ዩኒቨርሲቲ የምግብ ስርዓት</strong>
</p>

<br/>

<!-- Tech Badges -->
<p align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React"/>
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/>
  <img src="https://img.shields.io/badge/Firebase-12.7-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase"/>
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Radix_UI-49_Components-161618?style=flat-square&logo=radixui&logoColor=white" alt="Radix UI"/>
  <img src="https://img.shields.io/badge/Framer_Motion-Animations-0055FF?style=flat-square&logo=framer&logoColor=white" alt="Framer Motion"/>
  <img src="https://img.shields.io/badge/React_Router-6.30-CA4245?style=flat-square&logo=reactrouter&logoColor=white" alt="React Router"/>
  <img src="https://img.shields.io/badge/Recharts-Analytics-22B5BF?style=flat-square" alt="Recharts"/>
  <img src="https://img.shields.io/badge/Brevo-Email_API-0B996E?style=flat-square" alt="Brevo"/>
  <img src="https://img.shields.io/badge/Zod-Validation-3E67B1?style=flat-square" alt="Zod"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Production-brightgreen?style=flat-square" alt="Status"/>
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License"/>
  <img src="https://img.shields.io/badge/Students-15,000+-1a472a?style=flat-square" alt="Students"/>
  <img src="https://img.shields.io/badge/Cafeterias-3-d4a574?style=flat-square" alt="Cafeterias"/>
</p>

<br/>

<!-- Separator -->
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%"/>

</div>

<br/>

## 📋 Table of Contents

<details open>
<summary><b>Click to expand / collapse</b></summary>

<br/>

| #   | Section                                          |
| --- | ------------------------------------------------ |
| 🎯  | [Overview](#-overview)                           |
| ✨  | [Features](#-features)                           |
| 🏗️  | [System Architecture](#️-system-architecture)     |
| 👥  | [Role-Based Access](#-role-based-access)         |
| 🧩  | [Pages & Components](#-pages--components)        |
| 📐  | [Data Models](#-data-models)                     |
| 🎨  | [Design System](#-design-system)                 |
| 🔐  | [Environment Variables](#-environment-variables) |
| 🛠️  | [Tech Stack](#️-tech-stack)                       |
| 📁  | [Project Structure](#-project-structure)         |
| 🚀  | [Getting Started](#-getting-started)             |
| 🤝  | [Contributing](#-contributing)                   |
| 📄  | [License](#-license)                             |

</details>

<br/>

---

<br/>

## 🎯 Overview

<table>
<tr>
<td>

**Haramaya University Smart Meal System** is a full-stack web application designed to modernize and secure cafeteria meal service for 15,000+ university students. It replaces manual paper-based tracking with a real-time digital system featuring **QR code/barcode scanning**, **anti-cheat meal locks**, and **role-based dashboards** for administrators, registrars, and cafe service operators.

### 🌟 Key Highlights

- **🔍 Instant QR/Barcode Scanning** — Uses the native `BarcodeDetector` API for sub-second student verification
- **🔒 3-Hour Anti-Cheat Lock** — Prevents duplicate meal scans across all cafeterias per meal window
- **🏢 3 Cafeterias** — Muslim Cafe, Christian Cafe, and Freshman Cafe with individual tracking
- **📧 Automated Email** — QR codes sent to students via Brevo API upon registration
- **🌐 Trilingual Support** — English, Amharic (አማርኛ), and Oromo interfaces
- **📊 Real-time Analytics** — Live dashboards with meal counts, scan history, and trend charts
- **🗓️ Ethiopian Calendar** — Built-in support for the Ethiopian date system
- **📱 Fully Responsive** — Works on desktop, tablet, and mobile (camera scanning supported)
- **🔥 Firebase Backend** — Firestore real-time database with authentication and cloud storage

<br/>

> 🏫 _Built specifically for Haramaya University's cafeteria operations, serving breakfast, lunch, and dinner across three cafeterias with configurable meal windows._

</td>
</tr>
</table>

<br/>

## ✨ Features

<div align="center">

### 🔐 Authentication & Security

| Feature                    | Description                                              | Status |
| :------------------------- | :------------------------------------------------------- | :----: |
| 🔑 **Admin Login**         | Firebase email/password authentication for admin users   |   ✅   |
| 🪪 **Staff Login**         | Email + Staff ID verification (registrar & cafe service) |   ✅   |
| 🛡️ **Role-Based Access**   | Super Admin, Registrar, Cafe Service with route guards   |   ✅   |
| 🔒 **Anti-Cheat Lock**     | 3-hour configurable meal lock per student per meal type  |   ✅   |
| 🚫 **JS Blocker**          | Prevents access if JavaScript is disabled in the browser |   ✅   |
| 💾 **Session Persistence** | Staff sessions stored in localStorage for persistence    |   ✅   |

### 🍽️ Meal Management

| Feature                       | Description                                                    | Status |
| :---------------------------- | :------------------------------------------------------------- | :----: |
| 📸 **QR/Barcode Scanner**     | Real-time camera scanning using `BarcodeDetector` API          |   ✅   |
| ⌨️ **Manual Entry**           | Keyboard input fallback for barcode/student ID entry           |   ✅   |
| ⏰ **Smart Meal Windows**     | Configurable breakfast, lunch, dinner time windows             |   ✅   |
| 🏢 **Multi-Cafeteria**        | Muslim, Christian, Freshman cafeterias with separate tracking  |   ✅   |
| 📊 **Live Dashboard**         | Real-time meal counts, scan history, and approval/denial stats |   ✅   |
| 🔊 **Audio Feedback**         | Success/error sounds on scan results                           |   ✅   |
| 🌙 **Cross-Midnight Support** | Handles meal windows crossing midnight                         |   ✅   |

### 👨‍💼 Administration

| Feature                   | Description                                                     | Status |
| :------------------------ | :-------------------------------------------------------------- | :----: |
| 👥 **Student Management** | Full CRUD: add, edit, delete, search students                   |   ✅   |
| 📥 **Bulk Import**        | CSV/Excel import for student data (graduated, restricted lists) |   ✅   |
| 🪪 **ID Card Generation** | Printable student ID cards with photo and QR code               |   ✅   |
| 👔 **Staff Management**   | Create/delete registrar and cafe service staff accounts         |   ✅   |
| ⚙️ **System Settings**    | Configure meal times, lock duration, language, scanning toggle  |   ✅   |
| 📧 **Support Tickets**    | Staff can submit support tickets to admin                       |   ✅   |
| 📈 **Analytics**          | Recharts-powered visual analytics and meal trend data           |   ✅   |

### 📝 Student Registration

| Feature                     | Description                                                    | Status |
| :-------------------------- | :------------------------------------------------------------- | :----: |
| 📷 **Photo Capture**        | Camera capture or file upload for student photos               |   ✅   |
| 🗜️ **Image Compression**    | Automatic compression to fit Firestore document limits (400KB) |   ✅   |
| 📧 **Email QR Code**        | QR code auto-generated and sent via Brevo API on registration  |   ✅   |
| 🆔 **Duplicate Detection**  | Validates unique student ID and email before registration      |   ✅   |
| 🏢 **Cafeteria Assignment** | Muslim, Christian, or Freshman cafe selection                  |   ✅   |

### 🌍 Localization & UX

| Feature                   | Description                                     | Status |
| :------------------------ | :---------------------------------------------- | :----: |
| 🇺🇸🇪🇹 **Trilingual**       | English, Amharic (አማርኛ), Oromo language support |   ✅   |
| 📅 **Ethiopian Calendar** | Built-in Ethiopian date converter               |   ✅   |
| 🌙 **Dark Mode**          | Theme support via `next-themes`                 |   ✅   |
| ✨ **Framer Motion**      | Smooth animations throughout the interface      |   ✅   |
| 📱 **PWA Ready**          | Service worker included for offline capability  |   ✅   |

</div>

<br/>

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                        🌐 CLIENT (Browser)                          │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                     React 18 + TypeScript                       │ │
│  │                                                                  │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐│ │
│  │  │  React Router │  │ React Query  │  │   Context Providers    ││ │
│  │  │  (6 routes)   │  │ (caching)    │  │  Auth | Meal | Student ││ │
│  │  └──────────────┘  └──────────────┘  └────────────────────────┘│ │
│  │                                                                  │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐│ │
│  │  │  Admin   │  │Registrar │  │  Cafe    │  │  Shared UI       ││ │
│  │  │Dashboard │  │Dashboard │  │ Service  │  │ (49 Radix/shadcn ││ │
│  │  │          │  │          │  │Dashboard │  │  components)     ││ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘│ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                              │                                       │
│                    ┌─────────┴─────────┐                             │
│                    │   Firebase SDK     │                             │
│                    │   (v12.7.0)        │                             │
│                    └─────────┬─────────┘                             │
└──────────────────────────────┼───────────────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │  ☁️  FIREBASE CLOUD  │
                    │                      │
                    │  ┌────────────────┐  │
                    │  │   Firestore    │  │     ┌─────────────────┐
                    │  │  (Real-time    │  │     │  📧 Brevo API   │
                    │  │   Database)    │  │     │  (SMTP Email)   │
                    │  ├────────────────┤  │     │  QR Code in     │
                    │  │ Authentication │  │◄────│  email on       │
                    │  │ (Email/Pass +  │  │     │  registration   │
                    │  │  Anonymous)    │  │     └─────────────────┘
                    │  ├────────────────┤  │
                    │  │ Cloud Storage  │  │
                    │  │ (Student Imgs) │  │
                    │  ├────────────────┤  │
                    │  │   Analytics    │  │
                    │  └────────────────┘  │
                    └─────────────────────┘
```

<br/>

## 👥 Role-Based Access

<div align="center">

<table>
<tr>
<th align="center">Role</th>
<th align="center">Login Method</th>
<th align="center">Dashboard</th>
<th align="left">Permissions</th>
</tr>
<tr>
<td align="center">🔑 <b>Super Admin</b></td>
<td align="center">Email + Password<br/>(Firebase Auth)</td>
<td align="center"><code>/admin/dashboard</code></td>
<td>Full system access: settings, staff CRUD, student management, analytics, ID cards, import/export, support tickets</td>
</tr>
<tr>
<td align="center">📝 <b>Registrar</b></td>
<td align="center">Email + Staff ID<br/>(Firestore verify)</td>
<td align="center"><code>/registrar/dashboard</code></td>
<td>Register students (photo + QR), edit/delete students, send email with QR code, submit support tickets</td>
</tr>
<tr>
<td align="center">🍽️ <b>Cafe Service</b></td>
<td align="center">Email + Staff ID<br/>(Firestore verify)</td>
<td align="center"><code>/cafe/dashboard</code></td>
<td>Scan QR/barcodes, verify meal eligibility, view scan history, real-time meal counts</td>
</tr>
</table>

### 🔄 Authentication Flow

```
┌─────────────┐     ┌──────────────────┐     ┌───────────────────┐
│  Index Page  │────▶│   Login Portal    │────▶│  Role Redirect    │
│  (3 buttons) │     │  Admin | Staff   │     │                   │
└─────────────┘     └──────────────────┘     │  Admin ──▶ /admin  │
                                              │  Registrar ──▶     │
                     Admin: Firebase Auth     │    /registrar      │
                     Staff: Firestore query   │  Cafe ──▶ /cafe    │
                     + Anonymous Firebase     └───────────────────┘
```

</div>

<br/>

## 🧩 Pages & Components

<div align="center">

### 📄 Pages (12 Routes)

| Route                  | Component                  | Description                             |
| :--------------------- | :------------------------- | :-------------------------------------- |
| `/`                    | `Index.tsx`                | Landing page with hero, features, stats |
| `/login`               | `Login.tsx`                | Unified login portal (admin/staff)      |
| `/login/:type`         | `Login.tsx`                | Direct login by role type               |
| `/dashboard`           | `Dashboard.tsx`            | General redirect                        |
| `/admin/dashboard`     | `AdminDashboard.tsx`       | Full admin control center (1342 lines)  |
| `/admin/manage`        | `ManageAdmins.tsx`         | Admin account management (48KB)         |
| `/admin/id-cards`      | `IDCards.tsx`              | Student ID card generator               |
| `/admin/graduated`     | `ImportGraduated.tsx`      | CSV import for graduated students       |
| `/admin/restricted`    | `ImportRestricted.tsx`     | CSV import for restricted students      |
| `/registrar/dashboard` | `RegistrarDashboard.tsx`   | Student registration (51KB)             |
| `/cafe/dashboard`      | `CafeServiceDashboard.tsx` | QR scanner & meal tracking (35KB)       |
| `*`                    | `NotFound.tsx`             | 404 page                                |

### 🧱 Shared Components

| Category       | Components                                                                                                                                                                                                                                                                                                      | Count  |
| :------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----: |
| **UI Library** | Accordion, Alert, Badge, Button, Calendar, Card, Carousel, Chart, Checkbox, Command, Dialog, Drawer, Dropdown, Form, Input, Label, Menubar, Navigation, Pagination, Popover, Progress, Radio, Select, Separator, Sheet, Sidebar, Skeleton, Slider, Switch, Table, Tabs, Textarea, Toast, Toggle, Tooltip + more | **49** |
| **Layout**     | Layout wrapper component                                                                                                                                                                                                                                                                                        |   1    |
| **Scanner**    | InlineScanner (BarcodeDetector)                                                                                                                                                                                                                                                                                 |   1    |
| **Students**   | Student list/detail components                                                                                                                                                                                                                                                                                  |   1    |
| **Modals**     | InactiveStaffModal                                                                                                                                                                                                                                                                                              |   1    |
| **Navigation** | NavLink                                                                                                                                                                                                                                                                                                         |   1    |

### ⚙️ Context Providers (4)

| Provider              | Purpose                                      |
| :-------------------- | :------------------------------------------- |
| `AuthContext`         | Auth state, signIn/signOut, role checking    |
| `MealSettingsContext` | Meal windows, lock duration, system settings |
| `StudentsContext`     | Real-time student list, CRUD operations      |
| `LanguageContext`     | i18n language switching (en/am/or)           |

</div>

<br/>

## 📐 Data Models

<div align="center">

### 📊 Firestore Collections

```
Firestore Database
│
├── 📁 students/
│   ├── {studentId}
│   │   ├── studentId: "UGPR0680/16"
│   │   ├── fullName: "Amar Ahmed"
│   │   ├── fullNameAmharic: "አማር አህመድ"
│   │   ├── email: "student@haramaya.edu.et"
│   │   ├── department: "Computer Science"
│   │   ├── year: 3
│   │   ├── photoURL: "data:image/jpeg;base64,..."
│   │   ├── cafeStatus: "cafe" | "none"
│   │   ├── cafeteriaType: "muslim" | "christian" | "fresh"
│   │   ├── status: "active" | "graduated" | "persecuted" | "suspended"
│   │   ├── lastMeal: { mealType, timestamp, cafeteriaId }
│   │   ├── monthlyQuota: number | null
│   │   └── usedQuota: number
│   └── ...
│
├── 📁 admins/
│   └── {uid} → email, displayName, role, createdAt
│
├── 📁 staff/
│   └── {staffId} → email, fullName, role, cafeteriaType, isActive
│
├── 📁 mealLogs/
│   └── {logId} → studentId, mealType, cafeteriaId, result, timestamp
│
├── 📁 settings/
│   └── system → mealWindows, lockDuration, language, scanningEnabled
│
└── 📁 supportTickets/
    └── {ticketId} → staffId, subject, message, status
```

### 🍽️ Meal Eligibility Logic

```
Student Scans QR Code
         │
         ▼
    ┌────────────┐     ❌ "Student not found"
    │ Student     │────────────────────────────▶ DENIED
    │ exists?     │
    └─────┬──────┘
          │ ✅
          ▼
    ┌────────────┐     ❌ "Not registered for cafeteria"
    │ cafeStatus  │────────────────────────────▶ DENIED
    │ = "cafe"?   │
    └─────┬──────┘
          │ ✅
          ▼
    ┌────────────┐     ❌ "Belongs to Muslim Cafe, not Christian"
    │ Correct     │────────────────────────────▶ DENIED
    │ cafeteria?  │
    └─────┬──────┘
          │ ✅
          ▼
    ┌────────────┐     ❌ "Monthly quota exhausted"
    │ Quota       │────────────────────────────▶ DENIED
    │ available?  │
    └─────┬──────┘
          │ ✅
          ▼
    ┌────────────┐     ❌ "Already scanned for this meal"
    │ 3-hour      │────────────────────────────▶ DENIED
    │ lock clear? │     (shows next allowed time)
    └─────┬──────┘
          │ ✅
          ▼
    ✅ GRANTED — Meal logged
```

</div>

<br/>

## 🎨 Design System

<div align="center">

### 🎨 Color Palette

<table>
<tr>
<td align="center" width="110">
<img src="https://via.placeholder.com/50x50/1a472a/FFFFFF?text=Pri" alt="Primary"/>
<br/><b>#1a472a</b>
<br/><sub>Primary Green</sub>
</td>
<td align="center" width="110">
<img src="https://via.placeholder.com/50x50/0d2818/FFFFFF?text=Dark" alt="Dark Green"/>
<br/><b>#0d2818</b>
<br/><sub>Dark Green</sub>
</td>
<td align="center" width="110">
<img src="https://via.placeholder.com/50x50/d4a574/333333?text=Gold" alt="Gold"/>
<br/><b>#d4a574</b>
<br/><sub>Accent Gold</sub>
</td>
<td align="center" width="110">
<img src="https://via.placeholder.com/50x50/11bf00/FFFFFF?text=OK" alt="Success"/>
<br/><b>#11bf00</b>
<br/><sub>Success</sub>
</td>
<td align="center" width="110">
<img src="https://via.placeholder.com/50x50/dc2626/FFFFFF?text=Err" alt="Error"/>
<br/><b>#dc2626</b>
<br/><sub>Error Red</sub>
</td>
<td align="center" width="110">
<img src="https://via.placeholder.com/50x50/f59e0b/333333?text=Warn" alt="Amber"/>
<br/><b>#f59e0b</b>
<br/><sub>Admin Amber</sub>
</td>
</tr>
</table>

### 🖋️ Typography

| Element    | Font                         | Weight         |
| :--------- | :--------------------------- | :------------- |
| Headings   | System UI / -apple-system    | 700 (Bold)     |
| Body       | System UI (Segoe UI, Roboto) | 400 (Regular)  |
| Mono (IDs) | `font-mono`                  | 600 (Semibold) |
| Amharic    | Native Unicode rendering     | 400–700        |

### 📱 Responsive Breakpoints

| Breakpoint    | Target           | Usage                        |
| :------------ | :--------------- | :--------------------------- |
| `sm` (640px)  | Mobile landscape | Stack to grid transitions    |
| `md` (768px)  | Tablet           | 2-column layouts             |
| `lg` (1024px) | Desktop          | Full multi-column dashboards |

</div>

<br/>

## 🔐 Environment Variables

<div align="center">

> ⚠️ **IMPORTANT:** All sensitive API keys are stored in `.env` and **never committed** to version control.

</div>

### 🔧 Setup

1. Copy the example file:

   ```bash
   cp .env.example .env
   ```

2. Fill in your credentials in `.env`:

| Variable                            | Description                        | Used In                  |
| :---------------------------------- | :--------------------------------- | :----------------------- |
| `VITE_FIREBASE_API_KEY`             | Firebase Web API Key               | `src/lib/firebase.ts`    |
| `VITE_FIREBASE_AUTH_DOMAIN`         | Firebase Auth Domain               | `src/lib/firebase.ts`    |
| `VITE_FIREBASE_PROJECT_ID`          | Firebase Project ID                | `src/lib/firebase.ts`    |
| `VITE_FIREBASE_STORAGE_BUCKET`      | Firebase Storage Bucket            | `src/lib/firebase.ts`    |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Cloud Messaging Sender ID | `src/lib/firebase.ts`    |
| `VITE_FIREBASE_APP_ID`              | Firebase App ID                    | `src/lib/firebase.ts`    |
| `VITE_FIREBASE_MEASUREMENT_ID`      | Google Analytics Measurement ID    | `src/lib/firebase.ts`    |
| `VITE_BREVO_API_KEY`                | Brevo (Sendinblue) SMTP API Key    | `RegistrarDashboard.tsx` |
| `VITE_SENDER_EMAIL`                 | Email sender address               | `RegistrarDashboard.tsx` |
| `VITE_SENDER_NAME`                  | Email sender display name          | `RegistrarDashboard.tsx` |

> 💡 All Vite env variables must be prefixed with `VITE_` to be exposed to client-side code via `import.meta.env`.

<br/>

## 🛠️ Tech Stack

<div align="center">

<table>
<tr>
<td align="center" width="110">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="48" height="48" alt="React" />
<br /><b>React 18</b>
<br /><sub>UI Library</sub>
</td>
<td align="center" width="110">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="48" height="48" alt="TypeScript" />
<br /><b>TypeScript</b>
<br /><sub>Type Safety</sub>
</td>
<td align="center" width="110">
<img src="https://vitejs.dev/logo.svg" width="48" height="48" alt="Vite" />
<br /><b>Vite 5</b>
<br /><sub>Build Tool</sub>
</td>
<td align="center" width="110">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg" width="48" height="48" alt="Firebase" />
<br /><b>Firebase 12</b>
<br /><sub>Backend</sub>
</td>
<td align="center" width="110">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" width="48" height="48" alt="Tailwind" />
<br /><b>Tailwind 3</b>
<br /><sub>Styling</sub>
</td>
</tr>
</table>

### 📦 Key Dependencies

| Package                   | Version     | Purpose                                 |
| :------------------------ | :---------- | :-------------------------------------- |
| `react` / `react-dom`     | `^18.3.1`   | Core UI framework                       |
| `typescript`              | `^5.8.3`    | Static type checking                    |
| `vite`                    | `^5.4.19`   | Lightning-fast HMR dev server + bundler |
| `firebase`                | `^12.7.0`   | Auth, Firestore, Storage, Analytics     |
| `tailwindcss`             | `^3.4.17`   | Utility-first CSS framework             |
| `react-router-dom`        | `^6.30.1`   | Client-side routing (12 routes)         |
| `framer-motion`           | `^12.23.26` | Animation engine                        |
| `@tanstack/react-query`   | `^5.83.0`   | Server state management & caching       |
| `recharts`                | `^2.15.4`   | Data visualization charts               |
| `react-hook-form` + `zod` | Latest      | Form validation                         |
| `@radix-ui/*`             | Latest      | 49 accessible UI primitives (shadcn/ui) |
| `qrcode`                  | `^1.5.4`    | QR code generation for student cards    |
| `html5-qrcode`            | `^2.3.8`    | QR/barcode scanning via camera          |
| `papaparse`               | `^5.5.3`    | CSV parsing for student import          |
| `xlsx`                    | `^0.18.5`   | Excel file reading for bulk import      |
| `date-fns`                | `^3.6.0`    | Date utilities                          |
| `ethiopian-date`          | `^0.0.6`    | Ethiopian calendar conversion           |
| `next-themes`             | `^0.3.0`    | Dark/light mode theme switching         |
| `sonner`                  | `^1.7.4`    | Beautiful toast notifications           |
| `vaul`                    | `^0.9.9`    | Drawer component                        |
| `lucide-react`            | `^0.462.0`  | Icon library                            |

</div>

<br/>

## 📁 Project Structure

```
haramaya-meal-magic/
│
├── 📄 .env.example                          # Env var template (safe to commit)
├── 📄 .env                                  # Actual secrets (GITIGNORED)
├── 📄 .gitignore                            # Git ignore rules (includes .env)
├── 📄 package.json                          # Dependencies & scripts
├── 📄 vite.config.ts                        # Vite config (port 8080, SWC, aliases)
├── 📄 tailwind.config.ts                    # Tailwind theme + custom HU colors
├── 📄 tsconfig.json                         # TypeScript config
├── 📄 postcss.config.js                     # PostCSS config
├── 📄 eslint.config.js                      # ESLint config
├── 📄 components.json                       # shadcn/ui component config
├── 📄 firebase.rules                        # Firebase RTDB security rules
├── 📄 firestore.rules                       # Firestore security rules
├── 📄 index.html                            # Entry HTML (noscript blocker)
│
├── 📁 public/                               # Static assets
│   ├── 🍎 favicon.ico
│   ├── 🖼️ logo192.png / logo512.png
│   ├── 📄 manifest.json
│   └── 🤖 robots.txt
│
└── 📁 src/                                  # Source code
    ├── 📄 main.tsx                           # React entry point
    ├── 📄 App.tsx                            # Root: providers + routes
    ├── 📄 App.css                            # App-level styles
    ├── 📄 index.css                          # Global Tailwind + custom CSS
    ├── 📄 vite-env.d.ts                      # Vite type declarations
    │
    ├── 📁 types/
    │   └── 📄 index.ts                       # All TypeScript interfaces
    │       ├── Student, Staff, Admin
    │       ├── MealLog, Cafeteria, SystemSettings
    │       ├── SupportTicket, OfflineQueueItem
    │       └── DashboardStats, LocalizedStrings
    │
    ├── 📁 lib/                               # Core logic
    │   ├── 🔥 firebase.ts                    # Firebase init (reads .env)
    │   ├── 📦 firestore.ts                   # CRUD operations (597 lines)
    │   │   ├── Students: create, update, delete, get, search
    │   │   ├── Cafeterias: create, update, getAll
    │   │   ├── MealSettings: get, update
    │   │   ├── MealLogs: create, query
    │   │   └── Real-time: subscribeToStudents/Settings/Logs
    │   ├── 🪪 staffAuth.ts                   # Staff auth (369 lines)
    │   │   ├── generateStaffId, createStaff
    │   │   ├── verifyStaffLogin, getStaffByEmail
    │   │   └── subscribeToStaff, supportTickets
    │   ├── 🍽️ mealLogic.ts                   # Meal eligibility engine
    │   │   ├── getCurrentMealType (cross-midnight)
    │   │   ├── checkMealEligibility (6-step check)
    │   │   └── validateStudentBarcode
    │   ├── 🌍 i18n.ts                        # Trilingual translations
    │   ├── 📅 ethiopianCalendar.ts            # Ethiopian date converter
    │   ├── 📊 csvUtils.ts / excelUtils.ts     # CSV/Excel import helpers
    │   ├── 🖼️ imageUtils.ts                   # Photo compression
    │   └── 🔧 utils.ts                       # General utilities
    │
    ├── 📁 contexts/                          # React context providers
    │   ├── 🔐 AuthContext.tsx                # Auth state + role guards
    │   ├── 🍽️ MealSettingsContext.tsx        # Meal windows + system config
    │   ├── 👩‍🎓 StudentsContext.tsx             # Real-time student list
    │   └── 🌍 LanguageContext.tsx             # i18n language state
    │
    ├── 📁 hooks/                             # Custom React hooks
    │   ├── 📱 use-mobile.tsx                  # Mobile detection
    │   ├── 🔔 use-toast.ts                   # Toast notification hook
    │   ├── 📦 useFirestore.ts                # Firestore query hook
    │   └── 🪪 useStaffStatus.ts             # Staff activity status
    │
    ├── 📁 pages/                             # Route components
    │   ├── 🏠 Index.tsx                       # Landing page
    │   ├── 🔑 Login.tsx                       # Unified login
    │   ├── 📊 Dashboard.tsx                   # Redirect hub
    │   ├── 📸 Scanner.tsx                     # QR scanner page
    │   ├── 👩‍🎓 Students.tsx                    # Student list (36KB)
    │   ├── ⚙️ Settings.tsx                    # Settings page
    │   ├── ❌ NotFound.tsx                    # 404 page
    │   │
    │   ├── 📁 admin/                         # Admin pages
    │   │   ├── 🎛️ AdminDashboard.tsx          # Main admin (50KB)
    │   │   ├── 👔 ManageAdmins.tsx            # Admin management (48KB)
    │   │   ├── 🪪 IDCards.tsx                 # ID card generator
    │   │   ├── 📥 ImportGraduated.tsx         # Graduate import
    │   │   ├── 📥 ImportRestricted.tsx        # Restricted import
    │   │   └── 📝 RegisterStudent.tsx         # Admin student reg
    │   │
    │   ├── 📁 registrar/
    │   │   └── 📝 RegistrarDashboard.tsx      # Registration + QR email (51KB)
    │   │
    │   └── 📁 cafe/
    │       └── 🍽️ CafeServiceDashboard.tsx   # Scan + track (35KB)
    │
    ├── 📁 components/                        # Reusable components
    │   ├── 📁 ui/                            # 49 shadcn/ui components
    │   ├── 📁 layout/                        # Layout wrapper
    │   ├── 📁 scanner/                       # InlineScanner
    │   └── 📁 students/                      # Student sub-components
    │
    ├── 📁 assets/
    │   └── 🏫 hu-logo.png                    # Haramaya University logo
    │
    └── 📁 images/                            # (if any additional images)
```

<br/>

## 🚀 Getting Started

### 📋 Prerequisites

<table>
<tr>
<td>

| Requirement          | Version                  |
| :------------------- | :----------------------- |
| **Node.js**          | `≥ 18.x`                 |
| **npm**              | `≥ 9.x`                  |
| **Git**              | Latest                   |
| **Firebase Project** | Firestore + Auth enabled |
| **Brevo Account**    | SMTP API key for emails  |

</td>
</tr>
</table>

### ▶️ Quick Start

<details open>
<summary><b>Step-by-step guide</b></summary>

<br/>

**1️⃣ Clone the repository**

```bash
git clone https://github.com/AmarAhmedMohammed/haramaya-meal-magic.git
cd haramaya-meal-magic
```

**2️⃣ Configure environment variables**

```bash
cp .env.example .env
# Edit .env with your Firebase & Brevo credentials
```

**3️⃣ Install dependencies**

```bash
npm install
```

**4️⃣ Start the development server**

```bash
npm run dev
```

**5️⃣ Open in browser**

```
🌐 http://localhost:8080
```

</details>

### 📜 Available Scripts

| Command             | Description                                   |
| :------------------ | :-------------------------------------------- |
| `npm run dev`       | 🔄 Start Vite dev server with HMR (port 8080) |
| `npm run build`     | 📦 Create optimized production build          |
| `npm run build:dev` | 📦 Build in development mode                  |
| `npm run preview`   | 👁️ Preview production build locally           |
| `npm run lint`      | 🔍 Run ESLint checks                          |

### 🔥 Firebase Setup

<details>
<summary><b>Setting up Firebase for this project</b></summary>

<br/>

1. Create a project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Authentication** → Email/Password + Anonymous sign-in
3. Create a **Firestore Database** in production mode
4. Deploy security rules from `firestore.rules`
5. Enable **Cloud Storage** for student photos
6. Enable **Google Analytics** (optional)
7. Copy your Web App configuration to `.env`

</details>

<br/>

## 🤝 Contributing

<table>
<tr>
<td>

Contributions are always welcome! Here's how you can help:

1. 🍴 **Fork** the repository
2. 🌿 **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. 💾 **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. 📤 **Push** to the branch (`git push origin feature/amazing-feature`)
5. 🔃 **Open** a Pull Request

### 💡 Contribution Ideas

- 📲 Convert to a Progressive Web App with offline scanning
- 🧪 Add comprehensive test coverage (Jest + Testing Library)
- 📊 Add more analytics (weekly trends, cafeteria comparison charts)
- 🔔 Push notifications for meal time reminders
- 📱 Native mobile app (React Native) for cafe service staff
- 🗄️ Offline queue for scan results when network is down
- 🎨 Enhanced dark mode with system preference detection
- 📈 Admin export to PDF reports

</td>
</tr>
</table>

<br/>

## 📄 License

<div align="center">

This project is licensed under the **MIT License**.

<br/>

```
MIT License — feel free to use this project for learning and development.
```

> ⚠️ **Disclaimer:** This project was developed for **Haramaya University's** cafeteria meal management. All university logos, branding, and trademarks belong to **Haramaya University**. This project is an official university initiative.

<br/>

---

<br/>

<p align="center">
  <b>⭐ If you found this project helpful, please give it a star!</b>
</p>

<p align="center">
  Made with ❤️ for Haramaya University 🏫
</p>

<p align="center">
  <em>ለሀረማያ ዩኒቨርሲቲ በፍቅር የተሰራ</em>
</p>

<br/>

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%"/>

<br/>

<p align="center">
  <img src="https://img.shields.io/badge/Meal_Magic_🍽️-Haramaya_University-1a472a?style=for-the-badge" alt="Meal Magic"/>
</p>

</div>
