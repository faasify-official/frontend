# FaaSify Frontend

Modern storefront explorer built with React, Vite, TypeScript, and Tailwind CSS.

## Prerequisites
- Node.js 20+ (or the version in `.nvmrc` if present)
- npm 10+

## Installation
Clone the repo and install dependencies:
```bash
npm install
```

## Development
Run the dev server with hot reloading:
```bash
npm run dev
```

The app runs at `http://localhost:5173` by default.

## Available Scripts
- `npm run dev` – start Vite dev server
- `npm run lint` – run ESLint across the project
- `npm run build` – type-check and build production bundle
- `npm run preview` – preview the production build

## Project Structure
```
src/
  components/    # Reusable UI (navbar, product card, etc.)
  context/       # React context providers (cart)
  data/          # Static product data
  hooks/         # Shared hooks (useCart)
  layouts/       # Page layouts
  pages/         # Route components (home, login, product detail, cart, profile)
  index.css      # Tailwind base & custom utilities
  main.tsx       # Router and root rendering
```

## Styling
- Tailwind configuration lives in `tailwind.config.ts`.
- Shared utility classes: `.btn-primary`, `.btn-outline`, and `.card` defined in `src/index.css`.
- Inter font loaded via `index.html`.

## Icons & Routing
- Uses `react-router-dom` for navigation (routes defined in `src/main.tsx`).
- Icons provided via `lucide-react`.

## Testing the Build
```bash
npm run lint
npm run build
```

If everything passes, the production output is emitted to `dist/`.
