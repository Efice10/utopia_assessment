# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**[Project Name]** - A modern web application built with Next.js.

### Platform Components

| Route Group | Purpose | URL |
|-------------|---------|-----|
| `(admin)` | Admin Dashboard | domain.com/admin |
| `(public)` | Public-facing pages | domain.com |
| `(auth)` | Authentication | domain.com/login |
| `(account)` | User Account | domain.com/account |

---

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Fix linting issues
npm run type-check   # TypeScript checking
npm run ci           # Run full CI pipeline (type-check, lint, format)
```

---

## Architecture Overview

### Single Project Structure (Route Groups)

```
project/
├── src/
│   ├── app/
│   │   ├── (admin)/                    # Admin Dashboard Routes
│   │   │   ├── admin/
│   │   │   │   ├── page.tsx            # Dashboard home
│   │   │   │   ├── [module]/           # Feature modules
│   │   │   │   └── settings/           # Configuration
│   │   │   └── layout.tsx              # Admin sidebar layout
│   │   │
│   │   ├── (public)/                   # Public Routes
│   │   │   ├── page.tsx                # Landing page
│   │   │   ├── about/                  # About page
│   │   │   └── layout.tsx              # Public header/footer
│   │   │
│   │   ├── (account)/                  # User Account Routes
│   │   │   ├── account/
│   │   │   │   ├── page.tsx            # Account overview
│   │   │   │   ├── profile/            # Profile settings
│   │   │   │   └── preferences/        # User preferences
│   │   │   └── layout.tsx              # Account layout
│   │   │
│   │   ├── (auth)/                     # Shared Auth Routes
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── globals.css
│   │   └── layout.tsx                  # Root layout
│   │
│   ├── components/
│   │   ├── ui/                         # Base UI components (shadcn)
│   │   ├── admin/                      # Admin-specific components
│   │   ├── public/                     # Public-facing components
│   │   └── shared/                     # Shared components
│   │
│   ├── lib/
│   │   ├── utils.ts                    # Utility functions
│   │   ├── api.ts                      # API client
│   │   ├── constants.ts                # App constants
│   │   └── stores/                     # Zustand stores
│   │
│   ├── types/
│   │   └── index.ts                    # Type definitions
│   │
│   └── hooks/                          # Custom React hooks
│
├── public/                             # Static assets
├── CLAUDE.md                           # This file
└── package.json
```

### Import Pattern

```tsx
// Importing from project
import { Button, Card, Sheet } from '@/components/ui';
import { DataTable, StatCard } from '@/components/admin';
import type { User, Entity } from '@/types';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
```

---

## UX Laws & User Perception Rules

> **These rules are NON-NEGOTIABLE.** They guide all design and development decisions.

### 1. Users Should Never Lose Context

- Use slide-in panels/drawers instead of modals for forms
- Breadcrumbs must always show current location
- Page transitions should preserve scroll position when returning
- Multi-step flows show progress indicators

```tsx
// ✅ GOOD - Drawer preserves context
<Sheet open={isOpen} onOpenChange={setIsOpen}>
  <SheetContent>
    <EditForm />
  </SheetContent>
</Sheet>

// ❌ BAD - Modal blocks context
<Dialog>
  <DialogContent className="max-w-4xl">
    <EditForm />
  </DialogContent>
</Dialog>
```

### 2. Users Should Never Wait Without Feedback

- ALL buttons show loading state when clicked
- Skeleton loaders for data fetching (not spinners)
- Optimistic updates where safe
- Toast notifications for async operations

```tsx
// ✅ GOOD - Loading feedback
<Button disabled={isLoading}>
  {isLoading ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Saving...
    </>
  ) : (
    'Save Changes'
  )}
</Button>

// ❌ BAD - No feedback
<Button onClick={handleSave}>Save Changes</Button>
```

### 3. Users Should Always See Status

- Every record must show its status visually
- Use color-coded badges consistently:
  - **Green** = Success, Confirmed, Paid, Active
  - **Yellow** = Pending, Processing, Warning
  - **Red** = Cancelled, Rejected, Failed, Overdue
  - **Blue** = Info, New, Scheduled
- Row highlighting in tables for quick scanning

```tsx
// Status badge pattern
function getStatusBadge(status: string) {
  const variants = {
    active: 'success',
    pending: 'warning',
    inactive: 'destructive',
    completed: 'default',
  };
  return <Badge variant={variants[status]}>{status}</Badge>;
}
```

### 4. Users Should Never Guess What's Clickable

- Interactive elements have hover states
- Buttons look like buttons (not flat text)
- Links are underlined or clearly styled
- Cursor changes on hover (`cursor-pointer`)
- Touch targets minimum 44x44px

```tsx
// ✅ GOOD - Clear interactive element
<button className="px-4 py-2 rounded-lg bg-primary text-white
  hover:bg-primary/90 active:scale-[0.98] transition-all cursor-pointer">
  Submit
</button>

// ❌ BAD - Unclear if clickable
<span onClick={handleClick} className="text-blue-500">
  Submit
</span>
```

### 5. Data Density Should Adapt to Screen Size

- Desktop: Full data tables with all columns
- Tablet: Condensed tables, hide non-essential columns
- Mobile: Card-based layouts, no horizontal scroll

```tsx
// Responsive table pattern
<ModernTable
  data={items}
  columns={columns}
  cardRenderer={MobileCard}  // Card view on mobile
/>
```

### 6. Empty States Must Educate, Not Punish

- Empty states explain WHY it's empty
- Always provide a clear action to fix it
- Use friendly illustrations (not error icons)
- Never show "No data" without context

```tsx
// ✅ GOOD - Helpful empty state
<EmptyState
  icon={FileText}
  title="No items yet"
  description="Get started by creating your first item."
>
  <Button>
    <Plus className="mr-2 h-4 w-4" />
    Create First Item
  </Button>
</EmptyState>

// ❌ BAD - Unhelpful empty state
<div className="text-center text-gray-500">
  No data found.
</div>
```

### 7. Errors Must Be Recoverable

- Error messages explain what went wrong
- Always provide a way to retry or fix
- Never dead-end users
- Log errors for debugging, show friendly messages to users

```tsx
// ✅ GOOD - Recoverable error
<ErrorState
  title="Operation failed"
  description="Something went wrong. Please try again."
>
  <Button onClick={retry}>Try Again</Button>
  <Button variant="outline" onClick={goBack}>
    Go Back
  </Button>
</ErrorState>
```

### 8. Forms Must Prevent Mistakes

- Validate in real-time (not just on submit)
- Show character counts for text limits
- Disable submit until form is valid
- Confirm destructive actions

```tsx
// Real-time validation pattern
<Input
  {...register('email')}
  error={errors.email?.message}
  className={errors.email ? 'border-red-500' : ''}
/>
{errors.email && (
  <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
)}
```

---

## Modern UI/UX Design System

### Design Philosophy

The system should feel **clean, professional, and trustworthy**.

**Key Characteristics:**
- Clean, balanced color palette
- Generous whitespace
- Smooth animations
- Glass morphism effects (subtle)
- Rounded corners (8-16px)

### Neo-Glassmorphism Pattern

```tsx
// Glass Card Pattern
<div className="rounded-xl border border-white/10 bg-white/80
  backdrop-blur-sm shadow-lg dark:bg-gray-900/80">
  {/* Content */}
</div>

// Use GlassCard component
import { GlassCard } from '@/components/ui';

<GlassCard className="p-6">
  {/* Content */}
</GlassCard>
```

### Color System

**Brand Colors:**
```tsx
const colors = {
  primary: 'blue',         // Main brand color
  secondary: 'slate',      // Secondary elements
  accent: 'violet',        // Highlights
};
```

**Status Colors:**
```tsx
const statusColors = {
  success: 'emerald-500',   // Active, Paid, Confirmed
  warning: 'amber-500',     // Pending, Processing
  danger: 'rose-500',       // Error, Cancelled, Failed
  info: 'sky-500',          // Info, New, Scheduled
};
```

**Module Accent Colors:**
```tsx
const moduleColors = {
  dashboard: { color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
  users: { color: 'text-blue-600', bg: 'bg-blue-500/10' },
  content: { color: 'text-violet-600', bg: 'bg-violet-500/10' },
  analytics: { color: 'text-amber-600', bg: 'bg-amber-500/10' },
  settings: { color: 'text-slate-600', bg: 'bg-slate-500/10' },
};
```

### Animation Patterns

**Use Tailwind CSS for:**
- Simple hover effects: `hover:scale-105`, `hover:-translate-y-0.5`
- Basic transitions: `transition-all duration-150 ease-out`
- State changes: `active:scale-[0.98]`, `focus:ring-2`

**Use Framer Motion for:**
- Page transitions
- Scroll-triggered animations
- Staggered list animations
- Number counters

```tsx
// Hybrid animation approach
<motion.div
  className="transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, delay }}
>
  {children}
</motion.div>
```

### Modern Table Design

Tables should feel like **interactive dashboards**, not spreadsheets.

**Required Features:**
- Soft card rows with hover lift
- No heavy borders (use spacing)
- Row hover actions (Edit/Delete appear on hover)
- Color-coded row highlighting by status
- Sticky headers
- Media-rich cells (avatars, badges, progress)

```tsx
import { ModernTable, type ColumnDef, type RowAction } from '@/components/ui';

const columns: ColumnDef<Entity>[] = [
  {
    id: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarFallback>{getInitials(row.name)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{row.name}</p>
          <p className="text-xs text-muted-foreground">{row.email}</p>
        </div>
      </div>
    ),
  },
  // ... more columns
];

<ModernTable
  data={entities}
  columns={columns}
  rowActions={actions}
  getRowHighlight={(row) => row.status === 'active' ? 'success' : null}
  enableRowHighlight
  searchable
/>
```

### StatCard Component

```tsx
import { StatCard, StatCardGrid } from '@/components/ui';

<StatCardGrid columns={4}>
  <StatCard
    label="Total Users"
    value={1234}
    icon={Users}
    variant="info"
    trend={{ value: '+12%', direction: 'up' }}
  />
  <StatCard
    label="Revenue"
    value="$12,450"
    icon={DollarSign}
    variant="success"
  />
  <StatCard
    label="Pending"
    value={5}
    icon={Clock}
    variant="warning"
  />
</StatCardGrid>
```

---

## Page Organization Guidelines

### Page Files Should Be Thin

**Page files should ONLY contain:**
- Metadata exports
- Server component wrapper
- Animation wrapper (if needed)
- Single content component import

```tsx
// ✅ GOOD - Clean page file (< 30 lines)
import type { Metadata } from 'next';
import { DashboardContent } from '@/components/dashboard/dashboard-content';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'View your dashboard and analytics.',
};

export default function DashboardPage() {
  return <DashboardContent />;
}
```

### Component Organization

```
src/components/
├── dashboard/
│   ├── dashboard-content.tsx     # Main content
│   ├── dashboard-stats.tsx       # Stats section
│   ├── dashboard-chart.tsx       # Charts
│   └── index.ts                  # Barrel exports
├── users/
│   ├── users-content.tsx
│   ├── user-form.tsx
│   └── index.ts
├── shared/
│   ├── page-header.tsx
│   ├── stat-card.tsx
│   ├── empty-state.tsx
│   └── index.ts
└── ui/                           # Base UI components
    ├── button.tsx
    ├── input.tsx
    └── index.ts
```

### Separation of Concerns

| Layer | Responsibility | Location |
|-------|---------------|----------|
| Pages | Route + metadata | `app/` |
| Layouts | Structure + navigation | `app/*/layout.tsx` |
| Components | UI + interaction | `components/` |
| Hooks | Reusable logic | `hooks/` |
| Utils | Pure functions | `lib/` |
| Types | Type definitions | `types/` |
| Store | State management | `lib/stores/` |

---

## Admin Routes Structure

### Route Groups

```
src/app/(admin)/
├── layout.tsx                    # Admin sidebar + header layout
│
└── admin/
    ├── page.tsx                  # Dashboard home (/admin)
    │
    ├── users/
    │   ├── page.tsx              # Users list (/admin/users)
    │   └── [id]/page.tsx         # User detail
    │
    ├── content/
    │   ├── page.tsx              # Content list (/admin/content)
    │   └── categories/page.tsx   # Categories management
    │
    ├── analytics/
    │   └── page.tsx              # Analytics hub (/admin/analytics)
    │
    └── settings/
        ├── layout.tsx            # Settings sub-layout
        ├── page.tsx              # General settings (/admin/settings)
        └── integrations/page.tsx # API integrations
```

### Admin Sidebar Navigation

```tsx
const adminNavigation = [
  { title: 'Dashboard', href: '/admin', icon: Home },
  { title: 'Users', href: '/admin/users', icon: Users },
  { title: 'Content', href: '/admin/content', icon: FileText },
  { title: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { title: 'Settings', href: '/admin/settings', icon: Settings },
];
```

---

## Public/Customer Routes Structure

### Route Groups

```
src/app/(public)/
├── layout.tsx                    # Public header/footer layout
├── page.tsx                      # Landing page (/)
│
├── features/
│   └── page.tsx                  # Features page (/features)
│
├── pricing/
│   └── page.tsx                  # Pricing page (/pricing)
│
├── about/page.tsx                # About us (/about)
└── contact/page.tsx              # Contact (/contact)

src/app/(account)/
├── layout.tsx                    # Account layout with nav
│
└── account/
    ├── page.tsx                  # Account overview (/account)
    ├── profile/page.tsx          # Profile settings (/account/profile)
    └── preferences/page.tsx      # Preferences (/account/preferences)
```

---

## Multi-Step Flow UX Design

> **Core Philosophy:** Multi-step flows should feel like a guided journey, not filling a form.

### Mindset Shift

| ❌ Old Mindset | ✅ Modern Mindset |
|---------------|-------------------|
| User fills form → submit | User goes through a guided journey |
| Data collection | Experience selection |
| Efficiency-focused | Clarity-focused |
| Desktop-first | Mobile-first, thumb-friendly |

---

### Design Patterns for Multi-Step Flows

#### Pattern 1: Story-Based Step Flow

Each step = full screen with minimal inputs.

```
Step 1: Choose Option       ● ○ ○ ○
Step 2: Configure           ● ● ○ ○
Step 3: Your Details        ● ● ● ○
Step 4: Review & Confirm    ● ● ● ●
```

**Rules:**
- Big typography + strong visuals
- Progress indicator always visible
- "Next" button feels rewarding
- Back button always accessible
- Maximum 2-3 inputs per screen

#### Pattern 2: Card-Based Selection (Not Dropdowns)

```
❌ BAD: <select><option>Basic Plan</option></select>

✅ GOOD:
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Basic     │  │  Pro        │  │  Enterprise │
│   $9/mo     │  │  $29/mo     │  │  $99/mo     │
│             │  │             │  │             │
│ ✓ Feature 1 │  │ ✓ Feature 1 │  │ ✓ All       │
│ ✓ Feature 2 │  │ ✓ Feature 2 │  │ ✓ Priority  │
│             │  │ ✓ Feature 3 │  │ ✓ Custom    │
│             │  │             │  │             │
│  [ Select ] │  │  [ Select ] │  │  [ Select ] │
└─────────────┘  └─────────────┘  └─────────────┘
```

**Benefits:** Easier comparison, touch-friendly, clear differences.

#### Pattern 3: One-Question-Per-Screen

For details collection, use conversational style:

```
Screen 1: "What's your name?"
          [ First name ] [ Last name ]
                                    [ Next → ]

Screen 2: "How can we reach you?"
          [ Email address ]
                                    [ Next → ]

Screen 3: "Any additional notes?"
          [ Notes or comments ]
                                    [ Next → ]
```

**Benefits:** Feels conversational, less intimidating, higher completion rate.

#### Pattern 4: Inline Confirmation (No Blank Pages)

```tsx
// ❌ BAD: redirect to /confirmation
router.push('/confirmation');

// ✅ GOOD: animate confirmation in-place
<AnimatePresence>
  {isConfirmed && (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="confirmation-card"
    >
      <CheckCircle className="text-emerald-500 w-16 h-16" />
      <h2>Success!</h2>
      <p>Your submission has been received.</p>
      <Summary data={data} />
    </motion.div>
  )}
</AnimatePresence>
```

#### Pattern 5: Mobile-First, Thumb-Friendly

```tsx
// Mobile layout
<div className="min-h-screen flex flex-col">
  {/* Progress at top - visible but not in thumb zone */}
  <ProgressIndicator step={currentStep} total={4} />

  {/* Content in middle - scrollable */}
  <main className="flex-1 overflow-y-auto p-4">
    {children}
  </main>

  {/* CTA fixed at bottom - easy thumb access */}
  <div className="sticky bottom-0 p-4 bg-white border-t">
    <Button className="w-full h-14 text-lg">
      Continue
    </Button>
  </div>
</div>
```

**Rules:**
- Touch targets minimum 44x44px (ideally 48x48px)
- Bottom-fixed CTA always visible
- Avoid tiny dropdowns
- Progress dots near thumb reach
- No horizontal scrolling

---

### Public Page Component Checklist

When building public-facing components:

- [ ] Mobile-first design (test on phone first)
- [ ] Large touch targets (min 44px)
- [ ] Bottom-fixed CTAs on mobile
- [ ] Card-based selections (no dropdowns for important choices)
- [ ] Progress indicators for multi-step flows
- [ ] Loading states with skeleton, not spinners
- [ ] Success animations on completion
- [ ] Trust indicators visible where appropriate
- [ ] Clear information at every step
- [ ] Smooth page transitions (Framer Motion)

---

## State Management

### Zustand Pattern

```tsx
// lib/stores/app-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  selectedItem: Item | null;
  preferences: Preferences | null;

  // Actions
  setItem: (item: Item) => void;
  setPreferences: (prefs: Preferences) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedItem: null,
      preferences: null,

      setItem: (item) => set({ selectedItem: item }),
      setPreferences: (prefs) => set({ preferences: prefs }),
      reset: () => set({
        selectedItem: null,
        preferences: null,
      }),
    }),
    { name: 'app-store' }
  )
);
```

### Form Handling Pattern

```tsx
// Using React Hook Form + Zod
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Invalid phone number'),
});

type FormData = z.infer<typeof schema>;

function MyForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  return (
    <Form {...form}>
      <FormField name="name" control={form.control} render={...} />
    </Form>
  );
}
```

---

## API Integration Pattern

### API Client

```tsx
// lib/api-client.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}
```

### Usage with React Query

```tsx
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Entity } from '@/types';

// Fetch entities
export function useEntities() {
  return useQuery({
    queryKey: ['entities'],
    queryFn: () => apiClient<Entity[]>('/api/entities'),
  });
}

// Create entity
export function useCreateEntity() {
  return useMutation({
    mutationFn: (data: CreateEntityData) =>
      apiClient('/api/entities', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  });
}
```

---

## Formatting Utilities

```tsx
// lib/utils/format-currency.ts
export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

// lib/utils/format-date.ts
export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTime(date: string | Date) {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(date: string | Date) {
  return `${formatDate(date)} ${formatTime(date)}`;
}
```

---

## Technology Stack

### Core

- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5** - Type safety

### Styling & UI

- **Tailwind CSS 4** - Utility-first CSS
- **Radix UI** - Accessible primitives
- **Framer Motion** - Animations
- **Lucide React** - Icons

### State & Data

- **Zustand** - Global state management
- **React Query** - Server state management
- **React Hook Form** - Form handling
- **Zod** - Schema validation

### Development

- **pnpm** - Package manager
- **ESLint** - Linting
- **Prettier** - Formatting
- **Husky** - Git hooks

---

## Checklist for New Features

Before submitting a new feature, verify:

### UX Requirements
- [ ] Users never lose context (drawers over modals)
- [ ] Loading states on all async actions
- [ ] Status is always visible (color-coded badges)
- [ ] Interactive elements have hover states
- [ ] Responsive design (mobile-first)
- [ ] Empty states are helpful, not punishing
- [ ] Errors are recoverable with clear actions
- [ ] Forms validate in real-time

### Code Requirements
- [ ] Page files are thin (< 30 lines)
- [ ] Uses shared components from `@/components/ui`
- [ ] Uses shared types from `@/types`
- [ ] Follows existing patterns in codebase
- [ ] TypeScript strict mode passes
- [ ] Linting passes (`npm run lint`)
- [ ] Mobile responsive
- [ ] Dark mode support

### Design Requirements
- [ ] Uses glass card patterns appropriately
- [ ] Tables follow modern table design
- [ ] Consistent color coding for statuses
- [ ] Proper spacing (4px grid)
- [ ] Icons from Lucide React only

---

## Roles & Permissions System

This project uses a permission-based access control system. **When creating new modules or features, you MUST implement permission checks.**

### Using PermissionGate Component

Wrap any UI element that requires permission:

```tsx
import { PermissionGate } from '@/components/shared/permission-gate';

// Single permission
<PermissionGate permission="users.create">
  <Button>Add User</Button>
</PermissionGate>

// Multiple permissions (ANY of them)
<PermissionGate permission={['users.edit', 'users.delete']}>
  <ActionButtons />
</PermissionGate>

// Multiple permissions (ALL required)
<PermissionGate permission={['roles.view', 'roles.edit']} requireAll>
  <EditRoleButton />
</PermissionGate>

// With fallback content
<PermissionGate
  permission="users.delete"
  fallback={<span className="text-muted-foreground">No access</span>}
>
  <DeleteButton />
</PermissionGate>
```

### Adding Permission to Navigation

Update navigation config:

```tsx
// In navItems array
{
  title: 'New Module',
  href: '/admin/new-module',
  icon: SomeIcon,
  permission: 'new_module.view', // Add this
},

// For nested items
{
  title: 'Settings',
  icon: Settings,
  permission: ['settings.view', 'integrations.view'], // Any of these
  items: [
    { title: 'General', href: '/admin/settings', permission: 'settings.view' },
    { title: 'Integrations', href: '/admin/settings/integrations', permission: 'integrations.view' },
  ],
},
```

### Using Permission Hooks

```tsx
import { useAuthStore } from '@/lib/auth-store';

function MyComponent() {
  const { hasPermission, hasAnyPermission } = useAuthStore();

  // Check single permission
  if (hasPermission('users.create')) {
    // Can create users
  }

  // Check multiple permissions (any)
  if (hasAnyPermission(['users.edit', 'users.delete'])) {
    // Can edit OR delete
  }
}
```

### Protecting Table Row Actions

```tsx
const actions: RowAction<Entity>[] = [
  {
    label: 'Edit',
    icon: Pencil,
    onClick: handleEdit,
    permission: 'entities.edit', // Action hidden if no permission
  },
  {
    label: 'Delete',
    icon: Trash2,
    onClick: handleDelete,
    permission: 'entities.delete',
    variant: 'destructive',
  },
];
```

### Adding New Module Checklist

When creating a new module, ensure:

- [ ] Add permissions to backend permission enum
- [ ] Update permission seeder with default role assignments
- [ ] Protect backend routes with permission middleware
- [ ] Add `permission` prop to navigation item
- [ ] Wrap Create/Add buttons with `<PermissionGate permission="module.create">`
- [ ] Wrap Edit buttons with `<PermissionGate permission="module.edit">`
- [ ] Wrap Delete buttons with `<PermissionGate permission="module.delete">`
- [ ] Add permission checks to table row actions

### Permission Naming Convention

```
{module}.{action}

Examples:
- users.view
- users.create
- users.edit
- users.delete
```

---

## Settings Layout Convention

The settings section uses a **dedicated layout pattern** to eliminate code duplication.

### Settings Directory Structure

```
src/app/(admin)/admin/settings/
├── layout.tsx              # Settings layout wrapper
├── page.tsx                # General settings
├── profile/page.tsx        # Profile settings
├── security/page.tsx       # Security settings
└── integrations/page.tsx   # Integrations
```

### Layout Architecture

```tsx
// settings/layout.tsx
import type { Metadata } from 'next';
import { SettingsLayout } from '@/components/settings/settings-layout';

export const metadata: Metadata = {
  title: {
    template: '%s | Settings',
    default: 'Settings',
  },
  description: 'Manage your settings and preferences.',
};

export default function SettingsLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SettingsLayout>{children}</SettingsLayout>;
}
```

### Individual Settings Pages

```tsx
// settings/profile/page.tsx
import type { Metadata } from 'next';
import { ProfileSettings } from '@/components/settings/profile-settings';

export const metadata: Metadata = {
  title: 'Profile',
  description: 'Manage your profile information.',
};

export default function ProfileSettingsPage() {
  return <ProfileSettings />; // No layout wrapper needed!
}
```

---

## Deployment Notes

This template is optimized for **Vercel deployment** but can be deployed anywhere that supports Next.js.

Key considerations:

- Uses server-side rendering for better SEO
- Authentication is cookie-based (secure for production)
- All animations are client-side hydrated
- Bundle analysis available with `npm run analyze`
