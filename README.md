# TaskForge

A modern task management application built with Next.js 16, React 19, Tailwind 4, Prisma, and shadcn/ui.

## Features

- **Dashboard** - Overview with charts, stats, and upcoming deadlines
- **Projects** - Project management with filtering and search
- **Board** - Kanban board with drag-and-drop task reordering
- **Team** - Team member management with workload visualization
- **Dark Mode** - Full dark mode support with next-themes
- **Responsive** - Mobile-first design with sidebar sheet on mobile

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind 4 + shadcn/ui (New York style)
- **Database**: SQLite + Prisma ORM
- **State**: Zustand + TanStack Query
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Drag & Drop**: @dnd-kit
- **Notifications**: Sonner
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Initialize database
npm run db:push
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Prisma Studio |

## Project Structure

```
├── app/
│   ├── api/           # API routes
│   ├── globals.css    # Global styles
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Main page (SPA shell)
├── components/
│   ├── ui/            # shadcn/ui components
│   ├── *.tsx          # Custom components
├── lib/
│   ├── api.ts         # API client
│   ├── colors.ts      # Color token system
│   ├── dates.ts       # Date utilities
│   ├── prisma.ts      # Prisma client
│   ├── query.ts       # TanStack Query setup
│   ├── store.ts       # Zustand store
│   ├── utils.ts       # Utility functions
│   └── validations.ts # Zod schemas
├── prisma/
│   ├── schema.prisma  # Database schema
│   └── seed.ts        # Database seed
└── public/            # Static assets
```

## Color System

TaskForge uses a custom color token system with the following palette:
- **Primary**: Emerald
- **Status Colors**: Todo (Slate), In Progress (Amber), Review (Violet), Done (Emerald)
- **Priority Colors**: Low (Slate), Medium (Sky), High (Orange), Urgent (Rose)
- **Accent Colors**: Violet, Amber, Rose, Cyan, Orange, Teal, Pink, Sky

## License

MIT