# Sejuk Sejuk Service - Air-Conditioner Service Management Platform

A modern web application for managing air-conditioner service operations, built with Next.js 15. It provides a comprehensive dashboard for admins, managers, and technicians to manage service orders, track technician performance, and streamline operations.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [AI Integration](#ai-integration)
- [Authentication System](#authentication-system)
- [Database Schema](#database-schema)
- [Challenges & Assumptions](#challenges--assumptions)
- [Limitations](#limitations)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)

---

## Features

### Dashboard
- Overview statistics with KPIs (total orders, revenue, completion rate)
- Revenue and jobs charts with date filtering
- Technician leaderboard
- Branch-based filtering (HQ sees all, branches see their own)

### Orders Management
- Create new service orders with customer details
- Track order status lifecycle: `NEW` → `ASSIGNED` → `IN_PROGRESS` → `JOB_DONE` → `REVIEWED` → `CLOSED`
- Assign technicians to orders
- Service types: installation, servicing, repair, gas refill, inspection, others

### Jobs (Technician Workflow)
- Technicians view only their assigned jobs (role-based filtering)
- Job completion with work details, extra charges, and payment collection
- Photo/document upload for job records
- WhatsApp notification to customer on completion

### Technicians Management
- Create technician accounts with temporary passwords
- Force password change on first login
- Branch assignment for technicians
- Performance tracking (completed jobs, revenue)

### Branches Management
- Multi-branch support
- HQ flag for head office
- Branch filtering across the application

### AI Assistant
- Natural language interface for operations
- Create orders, assign technicians, update status via chat
- Workload analysis and anomaly detection
- Streaming responses for real-time feedback

### Audit Logs
- Track all system actions (create, update, delete, login, logout)
- Filter by action type, entity, user, date range
- Admin-only access

---

## Tech Stack

### Core Framework
| Technology | Purpose |
|------------|---------|
| **Next.js 15** | React framework with App Router & Turbopack |
| **React 19** | UI library |
| **TypeScript 5** | Type safety |

### Styling & UI
| Technology | Purpose |
|------------|---------|
| **Tailwind CSS 4** | Utility-first CSS |
| **Radix UI** | Accessible primitives (dialog, select, tabs, etc.) |
| **Framer Motion 12** | Animations |
| **Lucide React** | Icons |
| **Recharts** | Charts and data visualization |

### State Management
| Technology | Purpose |
|------------|---------|
| **Zustand 5** | Global state (auth, chat, branch selection) |
| **TanStack Query** | Server state management |
| **React Hook Form** | Form handling |
| **Zod** | Schema validation |

### Backend & Database
| Technology | Purpose |
|------------|---------|
| **Supabase** | Authentication and PostgreSQL database |
| **@supabase/ssr** | Server-side Supabase client |

### AI Integration
| Technology | Purpose |
|------------|---------|
| **@anthropic-ai/sdk** | Anthropic API client |
| **Z.AI proxy** | Uses `glm-4.5` model as Claude API proxy |

---

## Architecture

### Route Groups Structure

```
src/app/
├── (auth)/                    # Authentication routes (public)
│   ├── login/page.tsx         # Login page
│   ├── signup/page.tsx        # Self-registration
│   ├── forgot-password/       # Password reset
│   └── change-password/       # Forced password change
│
├── (protected)/               # Authenticated routes
│   ├── layout.tsx             # Protected layout with sidebar
│   ├── dashboard/             # Dashboard & settings
│   ├── orders/                # Order management
│   ├── jobs/                  # Technician jobs
│   ├── technicians/           # Technician management
│   ├── branches/              # Branch management
│   ├── ai-assistant/          # AI chat interface
│   └── audit-logs/            # Audit log viewer
│
├── api/                       # API routes
│   ├── ai/query/              # AI query endpoint
│   ├── audit-logs/            # Audit logs API
│   └── admin/create-user/     # Admin user creation
│
└── layout.tsx                 # Root layout
```

### Component Organization

```
src/components/
├── ui/                        # Base UI components (shadcn-style)
├── layouts/                   # Sidebar, header, branch switcher
├── dashboard/                 # Dashboard charts and stats
├── orders/                    # Order forms and lists
├── technicians/               # Technician management
├── chat/                      # AI chat interface
├── shared/                    # Reusable components
└── auth/                      # Auth-related forms
```

### Key Architecture Decisions

1. **Route Groups** - Separate layouts for auth, protected, and public routes
2. **Thin Pages** - Page files only contain metadata and component imports
3. **Component Co-location** - Components organized by feature
4. **Custom Hooks** - Data fetching logic extracted to hooks folder
5. **Server Components** - Used where possible for better performance

---

## AI Integration

### Configuration
- **Provider**: Z.AI proxy for Anthropic API
- **Model**: `glm-4.5` (configurable via `AI_MODEL` env var)
- **Streaming**: Real-time responses for better UX

### Available Tools

| Tool | Description |
|------|-------------|
| `create_order` | Create a new service order |
| `update_order` | Update an existing order |
| `delete_order` | Delete/cancel an order |
| `assign_technician` | Assign a technician to an order |
| `update_order_status` | Update order status |
| `detect_anomalies` | Analyze data for unusual patterns |
| `analyze_workload` | Analyze technician workload distribution |
| `generate_insights` | Generate operational insights |

### Example Queries
- "Create a repair order for Ahmad at 123 Jalan Merdeka, phone 012-3456789"
- "What jobs did technician Ali complete last week?"
- "Check for anomalies in our operations"
- "Analyze the workload distribution among technicians"

---

## Authentication System

### User Roles

| Role | Access |
|------|--------|
| **Admin** | Dashboard, Orders, Technicians, Branches, AI Assistant, Audit Logs |
| **Manager** | Dashboard, All Jobs (branch), AI Assistant |
| **Technician** | Dashboard, My Jobs only |

### Auth Flow

1. **Login**: Email/password via Supabase Auth
2. **Session**: Cookie-based, persisted in Zustand store
3. **Route Protection**: Middleware checks authentication
4. **First Login**: Technicians created by admin must change password

### Security Features
- Force password change on first login (`must_change_password` flag)
- Cookie-based middleware for route protection
- Role-based navigation filtering
- Ownership verification on job access

---

## Database Schema

### Core Tables

#### `users`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (matches Supabase Auth ID) |
| email | VARCHAR | User email |
| name | VARCHAR | Full name |
| phone | VARCHAR | Phone number |
| role | ENUM | admin, technician, manager |
| branch_id | UUID | FK to branches |
| is_active | BOOLEAN | Active status |
| must_change_password | BOOLEAN | Force password change |

#### `orders`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| order_no | VARCHAR | Human-readable order number |
| customer_name | VARCHAR | Customer name |
| phone | VARCHAR | Contact phone |
| address | TEXT | Service address |
| problem_description | TEXT | Issue description |
| service_type | ENUM | installation, servicing, repair, etc. |
| quoted_price | DECIMAL | Estimated price |
| assigned_technician_id | UUID | FK to users |
| status | ENUM | Order status |
| branch_id | UUID | FK to branches |

#### `branches`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR | Branch name |
| address | TEXT | Branch address |
| is_hq | BOOLEAN | Headquarters flag |
| is_active | BOOLEAN | Active status |

#### `service_records`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| order_id | UUID | FK to orders |
| technician_id | UUID | FK to users |
| work_done | TEXT | Work description |
| final_amount | DECIMAL | Total amount |
| payment_method | ENUM | cash, online_transfer, card |

#### `audit_logs`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK to users |
| action | VARCHAR | create, update, delete, login, logout |
| entity | VARCHAR | user, order, service_record, branch |
| description | TEXT | Action description |
| old_values | JSONB | Previous state |
| new_values | JSONB | New state |

---

## Challenges & Assumptions

### 1. Technician Access Control
**Challenge**: Initially, technicians could view and complete any job regardless of assignment.

**Solution**:
- Implemented role-based filtering in jobs list (`useOrders({ technicianId: user.id })`)
- Added ownership verification on job detail pages
- Display "Access Denied" message if technician tries to access another's job

### 2. Password Management for New Technicians
**Challenge**: Creating a technician only added a database record, no auth credentials.

**Solution**:
- Created `/api/admin/create-user` endpoint using Supabase admin API
- Added `must_change_password` flag to users table
- Implemented forced password change flow with cookie-based middleware check
- Set cookie to persist state across page reloads

### 3. Branch Assignment
**Challenge**: The `branch_id` wasn't being set in users table during technician creation.

**Solution**: Added `branch_id` field to the user insert operation in `useCreateTechnician` hook.

### 4. Hardcoded Fallback IDs
**Challenge**: Service records used `'tech-001'` as fallback technician ID.

**Solution**: Removed fallback, now uses authenticated user's ID with validation.

### 5. AI Model Selection
**Assumption**: Using Z.AI's `glm-5` model as a Claude API proxy for cost-effectiveness. The API structure remains compatible with Anthropic SDK.

### 6. File Uploads
**Assumption**: Files are stored as filenames only. Production would need Supabase Storage integration.

### 7. Notifications
**Assumption**: WhatsApp uses URL generation (wa.me links) rather than Business API. SMS/Email would need provider integrations.

---

## Limitations

### Security
- **RLS Policies**: Frontend checks are in place, but database-level Row Level Security needs to be applied using `docs/migrations/003_branch_access_control.sql`
- **No OAuth**: Only email/password authentication
- **No MFA**: Multi-factor authentication not implemented

### AI Integration
- **No Persistent Chat History**: Lost on page refresh
- **No Conversation Context**: Each session starts fresh
- **Limited Error Recovery**: No retry mechanism for failed AI requests

### Notifications
- **WhatsApp**: URL-based, not API-based
- **No SMS/Email Provider**: Integration needed for production
- **No Retry Queue**: Failed notifications aren't retried

### File Uploads
- **Mock Implementation**: Only filenames stored, no actual file upload
- **No Storage Buckets**: Supabase Storage would need to be configured

### Dashboard Analytics
- **No Real-time Updates**: Statistics require manual page refresh
- **No Caching**: Analytics queries run on every page load

### Audit Logs
- **No Retention Policy**: No automatic cleanup of old logs
- **No Export**: Cannot export audit logs

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, pnpm, or bun
- Supabase account

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run production server
npm run start
```

### Database Setup

1. Run the schema files in Supabase SQL Editor:
   - `supabase/supabase-schema.sql` - Main schema
   - `supabase/audit-logs.sql` - Audit logs table

2. Set up authentication:
   - Run `scripts/seed-auth-users.ts` to create initial auth users

3. Apply RLS policies:
   - `docs/migrations/003_branch_access_control.sql` - Role-based access control

### Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Fix linting issues
npm run type-check   # TypeScript checking
npm run ci           # Run full CI pipeline
```

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI (Z.AI proxy for Anthropic API)
AI_API_KEY=your_ai_api_key
AI_MODEL=glm-5

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## License

This project is proprietary and confidential.

---

## Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Supabase](https://supabase.com/) - Open Source Firebase Alternative
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Radix UI](https://www.radix-ui.com/) - Accessible UI Primitives
- [Lucide](https://lucide.dev/) - Beautiful Icons
