<div align="center">

# 🏆 Global Smile

### AI-Powered Patient Acquisition & Trust Engine for Prosthodontic Clinics
*1st Prize Winner — Codegnan Elevate X Hackathon (12-hour sprint across 3 live evaluation phases)*

[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

</div>

---

## 🚀 Overview

**Global Smile** is a patient acquisition and trust-building engine designed for prosthodontic clinics to attract international/interstate patients and retain them through transparency. Built from scratch in a **12-hour hackathon sprint**, it secured **1st Place** among competing teams and immediate internship offers.

### ✨ Key Features

- 🦷 **AI Smile Visualizer**: Direct interactive 3D model visualization using `@react-three/fiber` and `Three.js` allowing patients to preview treatment and prosthodontic outcomes before scheduling.
- 🌍 **Dental Tourism Calculator**: Detailed pricing comparisons showing treatment and travel cost optimization for patients visiting from other regions/countries.
- 🔐 **Transparency Dashboard**: An interactive roadmap showing clinical steps, sterilization standards, and milestones to demystify complex treatments.
- 📲 **AI Follow-up Engine**: Autonomous check-ins and smart post-treatment advice driven by Gemini AI integration, coupled with Twilio SMS integration.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React, Vite, TypeScript, Tailwind CSS, Radix UI, Recharts |
| **3D Rendering** | `@react-three/fiber` (Three.js react wrapper), `@react-three/drei` |
| **Backend** | Node.js, Express.js, nodemon |
| **Database & ORM** | PostgreSQL (Neon serverless), Prisma ORM |
| **AI & Telephony** | Google Gemini (OpenAI SDK wrapper), Twilio API (SMS communication) |
| **Build & Tooling** | Vite, TypeScript compiler (`tsc`), ESLint |

---

## ⚡ Quick Start

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/surendravarikallu/Global-Smile.git
   cd Global-Smile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up database schemas**
   ```bash
   npx prisma db push
   ```

4. **Start the development servers (Client + Server concurrently)**
   ```bash
   npm run dev
   ```

---

## 🧪 Testing

Global Smile uses **Jest** with `jest-environment-jsdom` to test React helpers and custom hooks.

To run tests:
```bash
# Run Jest tests
npm run test

# Run tests with code coverage maps
npm run test:coverage
```

For configuration details, refer to the **[Testing Documentation (docs/TESTING.md)](docs/TESTING.md)**.

---

## 📁 Project Structure

```
Global-Smile/
├── docs/
│   └── TESTING.md         # Testing architecture & configurations
├── prisma/
│   └── schema.prisma      # PostgreSQL database model schema
├── server/
│   ├── index.cjs          # Express app entry & API routes
│   └── prisma.cjs         # Prisma database connection
├── src/
│   ├── components/        # UI components (dashboard, visualizer, calculator)
│   ├── context/           # React authentication and theme contexts
│   ├── lib/
│   │   ├── utils.ts       # Class merging utilities
│   │   └── utils.test.ts  # Class merging unit tests
│   ├── App.tsx            # Main routes
│   └── main.tsx           # React bootstrap entry point
├── jest.config.cjs        # Jest test configuration
├── tailwind.config.js     # Tailwind setup configuration
└── tsconfig.json          # TypeScript compilation configuration
```

---

<div align="center">

**Developed by [Surendra Varikallu](https://surendravarikallu.dev/)**

[![Portfolio](https://img.shields.io/badge/Portfolio-surendravarikallu.dev-5A67D8?style=flat-square)](https://surendravarikallu.dev/)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/in/surendravarikallu)

</div>
