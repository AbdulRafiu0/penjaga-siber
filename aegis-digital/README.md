# Aegis Digital — Getting Started

## Run locally in VS Code

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

## Build for production

```bash
npm run build
npm run preview
```

## Before you go live — things left as placeholders

Search the codebase for `TODO` comments. In particular:

- **`src/pages/about.tsx`** — the Leadership Team section has a `[Your Name]` placeholder card. Fill in your real name, role, and background.
- **`src/pages/about.tsx`** — "Our Story" section has generic placeholder copy. Replace with your real founding story.
- **`src/pages/verify.tsx`** and **`src/pages/verify-letter.tsx`** — the certificate/letter lookup currently points at an empty in-memory object (`mockCertificates` / `mockLetters`), so every search correctly returns "not found." Wire these up to your real backend/database once it exists, so only certificates and letters you've actually issued will verify successfully.
- **`src/pages/home.tsx`** — the stats section starts at realistic values (0 interns, founded 2026). Update as your program grows.
- No testimonials section is included yet — add one once you have real intern feedback to share.
- **`src/pages/admin.tsx`** and **`src/pages/dashboard.tsx`** still contain sample/seed data for demoing the internal UI (not public-facing) — replace with real data once your backend is connected.

## Backend

This is a frontend-only Vite + React app. You mentioned you'll set up the backend yourself — the pages that currently use local mock/placeholder state (`apply.tsx`, `login.tsx`, `register.tsx`, `verify.tsx`, `verify-letter.tsx`, `dashboard.tsx`, `admin.tsx`) are exactly where you'll want to wire in real API calls.
