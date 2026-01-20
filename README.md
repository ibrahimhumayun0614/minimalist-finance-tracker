# Cloudflare Workers Full-Stack Template

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/ibrahimhumayun0614/minimalist-finance-tracker)

A production-ready full-stack boilerplate powered by Cloudflare Workers, featuring Durable Objects for stateful entities, Hono for the API, React with TanStack Query for the frontend, shadcn/ui for components, and Tailwind CSS for styling. This template demonstrates a real-world chat application with users, chat boards, and messages, while providing an extensible foundation for your own projects.

## Features

- **Serverless Backend**: Hono-based API with CORS, logging, and error handling.
- **Durable Objects**: Global storage and indexed entities (Users, Chats, Messages) with ACID transactions, pagination, and seeding.
- **Real-time Chat Demo**: Create users/chats, send messages, list with cursors.
- **Modern Frontend**: React 18, Router, TanStack Query, shadcn/ui, Tailwind, dark mode, sidebar layout.
- **Type-Safe**: Full TypeScript with shared types between frontend/backend.
- **Developer Experience**: Hot reload, error reporting, theme toggle, mobile-responsive.
- **Production-Ready**: Bundled with Vite, Tailwind JIT, ESLint, auto-deploy to Cloudflare.
- **Extensible**: Add entities/routes easily via `worker/entities.ts` and `worker/user-routes.ts`.

## Tech Stack

| Category | Technologies |
|----------|--------------|
| **Backend** | Cloudflare Workers, Hono, Durable Objects |
| **Frontend** | React, Vite, TanStack Query, React Router |
| **UI/UX** | shadcn/ui, Tailwind CSS, Lucide Icons, Framer Motion |
| **State** | Zustand, Immer |
| **Forms/Data** | React Hook Form, Zod |
| **Other** | Bun (package manager), TypeScript, ESLint |

## Prerequisites

- [Bun](https://bun.sh/) installed (recommended for fastest setup)
- [Cloudflare Account](https://dash.cloudflare.com/) with Workers enabled
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install/) (`bunx wrangler@latest` works)

## Installation

1. Clone or download the repository.
2. Install dependencies:

   ```bash
   bun install
   ```

3. (Optional) Generate Worker types:

   ```bash
   bun run cf-typegen
   ```

## Development

Start the development server (frontend + proxied Worker API):

```bash
bun dev
```

- Frontend: http://localhost:3000 (Vite HMR)
- API: http://localhost:3000/api/* (proxied to Worker)

Make a production build:

```bash
bun run build
```

Preview the build:

```bash
bun run preview
```

Lint the code:

```bash
bun run lint
```

## Usage Examples

### API (fully type-safe)

Fetch users with pagination:

```ts
// src/lib/api-client.ts usage
const { items: users, next } = await api<{ items: User[]; next: string | null }>('/api/users?limit=10');
```

Create a chat:

```bash
curl -X POST http://localhost:3000/api/chats \
  -H "Content-Type: application/json" \
  -d '{"title": "My Chat"}'
```

Send message:

```bash
curl -X POST http://localhost:3000/api/chats/c1/messages \
  -H "Content-Type: application/json" \
  -d '{"userId": "u1", "text": "Hello!"}'
```

Available endpoints: `/api/users`, `/api/chats`, `/api/chats/:id/messages`, health checks, error reporting.

### Frontend Customization

- Replace `src/pages/HomePage.tsx` with your app.
- Use `AppLayout` for sidebar: `import { AppLayout } from '@/components/layout/AppLayout'`.
- API calls: `import { api } from '@/lib/api-client'`.
- Components: All shadcn/ui primitives available in `src/components/ui/*`.
- Hooks: `useTheme`, `useMobile`.

### Extending the Backend

1. Add entity in `worker/entities.ts` (extends `IndexedEntity`).
2. Add routes in `worker/user-routes.ts` (uses `ok/bad/notFound` helpers).
3. Restart dev server (auto-reloads).

## Deployment

Deploy to Cloudflare Workers (free tier available):

1. Login to Wrangler:

   ```bash
   bunx wrangler@latest login
   ```

2. (Optional) Configure `wrangler.jsonc` (name, bindings already set).

3. Deploy:

   ```bash
   bun run deploy
   ```

Your app will be live at `https://<your-worker>.<your-subdomain>.workers.dev`.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/ibrahimhumayun0614/minimalist-finance-tracker)

**Pro Tip**: Enable Observability in Cloudflare dashboard for logs/metrics.

## Customization Guide

- **Entities**: Extend `IndexedEntity` in `worker/entities.ts`, add static `indexName`, `seedData`.
- **Routes**: Import entities in `worker/user-routes.ts`, use helpers like `UserEntity.list(env)`.
- **Frontend**: Edit `src/pages/`, use TanStack Query for data fetching.
- **Styling**: `tailwind.config.js` pre-configured with animations, gradients.
- **Seeds**: Mock data auto-seeds on first API call.

## Troubleshooting

- **Worker routes not loading**: Check console, ensure `worker/user-routes.ts` exports `userRoutes`.
- **Types missing**: Run `bun run cf-typegen`.
- **CORS issues**: Pre-configured for `*`.
- **Durable Objects**: Auto-migrates on deploy.

## License

MIT License. See [LICENSE](LICENSE) for details.

---

Built with ❤️ for Cloudflare Workers. Questions? Check Cloudflare Docs or open an issue.