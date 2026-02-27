# HRMS Lite — Frontend

React single-page application for the HRMS Lite system. Provides a dashboard, employee management, attendance tracking, leave management, and settings. Designed to be deployed on **Vercel**.

## Tech Stack

- **[React 19](https://react.dev/)** — UI library
- **[Vite](https://vitejs.dev/)** — build tool & dev server
- **[React Router v7](https://reactrouter.com/)** — client-side routing
- **[Tailwind CSS v4](https://tailwindcss.com/)** — utility-first styling
- **[Lucide React](https://lucide.dev/)** — icons
- **[date-fns](https://date-fns.org/)** — date formatting

## Project Structure

```
hrms-portal/
├── src/
│   ├── App.jsx               # Root component, routing, providers
│   ├── main.jsx              # React entry point
│   ├── index.css             # Global styles / Tailwind base
│   ├── api/
│   │   └── apiService.js     # All backend API calls + normalizers
│   ├── context/
│   │   ├── AppContext.jsx     # Global employee & attendance state
│   │   ├── AuthContext.jsx    # Authentication state
│   │   └── ThemeContext.jsx   # Dark/light theme
│   ├── components/
│   │   ├── Layout/           # Header, Sidebar, Layout wrapper
│   │   └── common/           # Avatar, Badge, Modal, StatCard, EmptyState
│   └── pages/
│       ├── Dashboard.jsx     # Stats overview & recent activity
│       ├── Employees.jsx     # Employee list, add/edit/delete
│       ├── Attendance.jsx    # Attendance marking & history
│       ├── Leaves.jsx        # Leave requests
│       ├── Settings.jsx      # API URL config, theme, preferences
│       └── Login.jsx         # Authentication screen
├── index.html
├── vite.config.js
├── vercel.json               # SPA rewrite rule for Vercel
└── .env.example
```

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | KPI cards, attendance trend, recent activity |
| `/employees` | Employees | Full employee directory with search & filters |
| `/attendance` | Attendance | Mark/edit attendance, filter by date/status |
| `/leaves` | Leaves | Leave request management |
| `/settings` | Settings | Backend URL, theme, and app preferences |

## Local Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
cd hrms-portal

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local — set VITE_API_URL to your backend URL
```

### Run

```bash
npm run dev
```

App runs at `http://localhost:5173`.

> If no `VITE_API_URL` is set, the app falls back to data stored in `localStorage` (useful for offline / demo mode).

### Build

```bash
npm run build
```

Output is placed in `dist/`.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | No | Base URL of the FastAPI backend. Falls back to `localStorage` or demo mode if not set. |

Example `.env.local`:
```env
VITE_API_URL=https://hrms-api.onrender.com
```

## Deployment — Vercel

1. Import the GitHub repo in the Vercel dashboard.
2. Set **Root Directory** to `hrms-portal`.
3. Add environment variable:
   - `VITE_API_URL` → your Render backend URL (e.g. `https://hrms-api.onrender.com`)
4. Deploy — the existing [`vercel.json`](vercel.json) handles SPA client-side routing automatically.

> After deploying, copy your Vercel URL and update the `CORS_ORIGINS` environment variable on Render to allow requests from it.

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
