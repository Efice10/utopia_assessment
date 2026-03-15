# Product Requirements Document (PRD)

## Remaining Features - Implementation Roadmap

---

## Document Information

| Field | Value |
|-------|-------|
| Project | Sejuk Sejuk Service Operations Management System |
| Document Type | Remaining Features PRD |
| Version | 1.0 |
| Date | January 2025 |
| Status | Draft |

---

## 1. Executive Summary

### 1.1 Purpose
This document outlines the requirements for features not yet implemented in the Sejuk Sejuk Service Operations Management System. These features were identified by comparing the current implementation against the original PRD (`docs/assessment.prd.md`).

### 1.2 Scope Overview

| Module | Priority | Effort | Impact |
|--------|----------|--------|--------|
| Authentication Enhancements | Medium | Low | High |
| WhatsApp Notifications System | High | Medium | High |
| KPI Dashboard Enhancement | Medium | Medium | High |
| Advanced AI Features | Low | High | Medium |

---

## 2. Feature Module 1: Authentication Enhancements

### 2.1 Overview
Enhance the authentication system to support role selection at login and provide a role switcher for testing purposes.

### 2.2 User Stories

| ID | As a | I want to | So that |
|----|------|-----------|---------|
| AUTH-ENH-001 | Tester | Select my role at login | I can test different user experiences |
| AUTH-ENH-002 | Developer | Switch roles without logging out | I can quickly test different permission sets |
| AUTH-ENH-003 | Admin | See which role I'm currently using | I understand my current access level |

### 2.3 Functional Requirements

#### 2.3.1 Role Selection at Login

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| AUTH-ENH-004 | Display role selection dropdown on login page | Must Have | Dropdown shows: Admin, Technician, Manager |
| AUTH-ENH-005 | Pre-select role based on user's database role | Should Have | Default selection matches DB role |
| AUTH-ENH-006 | Allow role override for testing | Should Have | Selected role is stored in session |
| AUTH-ENH-007 | Show role indicator in header/avatar | Must Have | Current role visible at all times |

#### 2.3.2 Role Switcher Component

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| AUTH-ENH-008 | Add role switcher to user menu | Should Have | Accessible from header dropdown |
| AUTH-ENH-009 | Show available roles as options | Must Have | Lists all 3 roles: Admin, Technician, Manager |
| AUTH-ENH-010 | Refresh UI on role switch | Must Have | Navigation and permissions update immediately |
| AUTH-ENH-011 | Persist role preference in localStorage | Nice to Have | Role persists across sessions |

### 2.4 Technical Specifications

#### 2.4.1 Data Model Updates

```typescript
// Extend auth store
interface AuthState {
  user: User | null;
  currentRole: 'admin' | 'technician' | 'manager'; // New field
  originalRole: 'admin' | 'technician' | 'manager'; // New field
  isRoleSwitched: boolean; // New field
  setRole: (role: UserRole) => void;
  resetRole: () => void;
}
```

#### 2.4.2 Component Structure

```
src/components/auth/
├── role-selector.tsx        # Role selection dropdown
├── role-switcher.tsx        # Role switcher in user menu
└── role-indicator.tsx       # Visual role indicator
```

### 2.5 UI/UX Requirements

| Element | Specification |
|---------|--------------|
| Role Selector | Dropdown with icons for each role |
| Role Indicator | Badge/chip near username in header |
| Role Switcher | Menu item in user dropdown with "Switch Role" label |
| Visual Feedback | Toast notification on role switch |

---

## 3. Feature Module 2: WhatsApp Notifications System

### 3.1 Overview
Implement a comprehensive WhatsApp notification system with automatic triggers, message logging, and multi-recipient support.

### 3.2 User Stories

| ID | As a | I want to | So that |
|----|------|-----------|---------|
| WAPP-ENH-001 | Technician | Receive WhatsApp notification when assigned | I know about new jobs immediately |
| WAPP-ENH-002 | Customer | Receive WhatsApp when job is complete | I know when to expect feedback |
| WAPP-ENH-003 | Manager | Receive notification when job is done | I can review completed jobs promptly |
| WAPP-ENH-004 | Admin | View history of sent notifications | I can audit communication |

### 3.3 Functional Requirements

#### 3.3.1 Notification Triggers

| ID | Trigger Event | Recipient | Priority | Template |
|----|--------------|-----------|----------|----------|
| WAPP-ENH-005 | Order assigned to technician | Technician | Must Have | Assignment notification |
| WAPP-ENH-006 | Order status → IN_PROGRESS | Customer | Nice to Have | "Technician is on the way" |
| WAPP-ENH-007 | Order status → JOB_DONE | Customer | Must Have | Completion + feedback request |
| WAPP-ENH-008 | Order status → JOB_DONE | Manager | Should Have | Review request |

#### 3.3.2 Message Templates

```typescript
const messageTemplates = {
  technicianAssigned: {
    id: 'tech_assigned',
    template: `Hello {{technician_name}},

You have been assigned a new job:
Order: {{order_no}}
Customer: {{customer_name}}
Address: {{address}}
Service: {{service_type}}
Problem: {{problem_description}}
Quoted Price: RM {{quoted_price}}

Please confirm receipt.
Sejuk Sejuk Service`,
  },
  jobCompleted: {
    id: 'job_completed',
    template: `Hi {{customer_name}},

Your service request {{order_no}} has been completed by {{technician_name}}.

Service: {{service_type}}
Amount: RM {{final_amount}}

Thank you for choosing Sejuk Sejuk Service!`,
  },
  managerReview: {
    id: 'manager_review',
    template: `Hello Manager,

Job {{order_no}} has been completed and is ready for review.

Technician: {{technician_name}}
Customer: {{customer_name}}
Final Amount: RM {{final_amount}}

Please review at your earliest convenience.`,
  },
};
```

#### 3.3.3 Notification UI Components

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| WAPP-ENH-009 | Notification button on order detail | Must Have | Opens WhatsApp with pre-filled message |
| WAPP-ENH-010 | Bulk notification option | Nice to Have | Send to multiple recipients |
| WAPP-ENH-011 | Custom message editor | Should Have | Edit template before sending |
| WAPP-ENH-012 | Notification status indicator | Should Have | Shows sent/pending/failed |

#### 3.3.4 Audit Logging

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| WAPP-ENH-013 | Log all notification attempts | Must Have | Timestamp, recipient, template, status |
| WAPP-ENH-014 | Notification history view | Should Have | Accessible from order detail |
| WAPP-ENH-015 | Filter by date, recipient, status | Nice to Have | Searchable audit log |

### 3.4 Technical Specifications

#### 3.4.1 Database Schema

```sql
-- Notification logs table
CREATE TABLE notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) NOT NULL,
  recipient_type VARCHAR(20) NOT NULL, -- 'technician', 'customer', 'manager'
  recipient_name VARCHAR(255),
  recipient_phone VARCHAR(20),
  template_id VARCHAR(50) NOT NULL,
  message_content TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Create index for faster queries
CREATE INDEX idx_notification_logs_order ON notification_logs(order_id);
CREATE INDEX idx_notification_logs_status ON notification_logs(status);
CREATE INDEX idx_notification_logs_created ON notification_logs(created_at);
```

#### 3.4.2 API Endpoints

```typescript
// POST /api/notifications/send
interface SendNotificationRequest {
  orderId: string;
  recipientType: 'technician' | 'customer' | 'manager';
  templateId: string;
  customMessage?: string;
}

// GET /api/notifications/logs
interface GetNotificationLogsRequest {
  orderId?: string;
  status?: 'pending' | 'sent' | 'failed';
  dateFrom?: string;
  dateTo?: string;
}
```

#### 3.4.3 Component Structure

```
src/components/notifications/
├── notification-button.tsx      # Trigger notification
├── notification-history.tsx     # View notification log
├── notification-template.tsx    # Template editor
├── notification-status.tsx      # Status badge
└── index.ts

src/lib/notifications/
├── templates.ts                 # Message templates
├── whatsapp.ts                  # WhatsApp deep-link generator
└── logger.ts                    # Notification logging
```

### 3.5 UI/UX Requirements

| Element | Specification |
|---------|--------------|
| Notification Button | WhatsApp icon, green color, opens in new tab |
| History Panel | Slide-in sheet from right, shows timeline |
| Status Badge | Green=Sent, Yellow=Pending, Red=Failed |
| Template Preview | Modal showing message with variables filled |

---

## 4. Feature Module 3: KPI Dashboard Enhancement

### 4.1 Overview
Enhance the KPI dashboard with additional metrics, visualizations, leaderboard, and time-based filtering.

### 4.2 User Stories

| ID | As a | I want to | So that |
|----|------|-----------|---------|
| KPI-ENH-001 | Manager | See technician leaderboard | I can identify top performers |
| KPI-ENH-002 | Manager | View charts of performance trends | I can spot patterns over time |
| KPI-ENH-003 | Manager | Filter metrics by time period | I can analyze specific periods |
| KPI-ENH-004 | Manager | See postpone/reschedule metrics | I can identify reliability issues |
| KPI-ENH-005 | Manager | See average completion time | I can measure efficiency |

### 4.3 Functional Requirements

#### 4.3.1 Additional Metrics

| ID | Metric | Formula | Priority | Display |
|----|--------|---------|----------|---------|
| KPI-ENH-006 | Postpone Count | COUNT of status changes to postponed | Should Have | Badge on technician card |
| KPI-ENH-007 | Reschedule Count | COUNT of schedule changes | Should Have | Badge on technician card |
| KPI-ENH-008 | Avg Completion Time | AVG(completed_at - started_at) | Nice to Have | Hours/minutes format |
| KPI-ENH-009 | On-Time Rate | % jobs completed by scheduled date | Nice to Have | Percentage with trend |

#### 4.3.2 Leaderboard View

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| KPI-ENH-010 | Sortable technician ranking | Must Have | Sort by jobs completed, revenue, rating |
| KPI-ENH-011 | Top 3 highlight | Should Have | Gold/Silver/Bronze visual treatment |
| KPI-ENH-012 | Technician avatar | Should Have | Shows profile picture or initials |
| KPI-ENH-013 | Quick stats per row | Must Have | Jobs, Revenue, Completion Rate |

#### 4.3.3 Charts & Visualizations

| ID | Chart Type | Data | Priority | Library |
|----|------------|------|----------|---------|
| KPI-ENH-014 | Bar Chart | Jobs per technician | Must Have | Recharts |
| KPI-ENH-015 | Line Chart | Revenue trend over time | Should Have | Recharts |
| KPI-ENH-016 | Pie Chart | Jobs by service type | Nice to Have | Recharts |
| KPI-ENH-017 | Area Chart | Cumulative revenue | Nice to Have | Recharts |

#### 4.3.4 Time Period Filter

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| KPI-ENH-018 | Preset periods (Today, Week, Month, Year) | Must Have | Quick select buttons |
| KPI-ENH-019 | Custom date range picker | Should Have | Start and end date selection |
| KPI-ENH-020 | Compare with previous period | Nice to Have | Show % change |
| KPI-ENH-021 | Persist filter in URL params | Nice to Have | Shareable filtered views |

### 4.4 Technical Specifications

#### 4.4.1 Database Updates

```sql
-- Add columns for tracking
ALTER TABLE orders ADD COLUMN scheduled_date DATE;
ALTER TABLE orders ADD COLUMN postponed_count INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN rescheduled_count INTEGER DEFAULT 0;

-- Create view for KPI metrics
CREATE VIEW technician_kpi AS
SELECT
  u.id AS technician_id,
  u.name AS technician_name,
  COUNT(o.id) FILTER (WHERE o.status IN ('job_done', 'reviewed', 'closed')) AS jobs_completed,
  COALESCE(SUM(sr.final_amount), 0) AS total_revenue,
  COUNT(o.id) FILTER (WHERE o.postponed_count > 0) AS postponed_jobs,
  AVG(EXTRACT(EPOCH FROM (sr.completed_at - o.updated_at))/3600) AS avg_completion_hours
FROM users u
LEFT JOIN orders o ON o.assigned_technician_id = u.id
LEFT JOIN service_records sr ON sr.order_id = o.id
WHERE u.role = 'technician'
GROUP BY u.id, u.name;
```

#### 4.4.2 Component Structure

```
src/components/kpi/
├── kpi-dashboard.tsx           # Main dashboard container
├── kpi-filters.tsx             # Time period filters
├── kpi-leaderboard.tsx         # Technician ranking
├── kpi-charts/
│   ├── jobs-bar-chart.tsx      # Jobs per technician
│   ├── revenue-line-chart.tsx  # Revenue trend
│   ├── service-pie-chart.tsx   # Service type distribution
│   └── index.ts
├── kpi-cards/
│   ├── metric-card.tsx         # Individual metric
│   ├── trend-indicator.tsx     # Up/down trend
│   └── index.ts
└── index.ts
```

#### 4.4.3 API Endpoints

```typescript
// GET /api/kpi/technicians
interface TechnicianKPI {
  id: string;
  name: string;
  avatar?: string;
  jobsCompleted: number;
  totalRevenue: number;
  avgCompletionTime: number; // hours
  postponeCount: number;
  rescheduleCount: number;
  onTimeRate: number; // percentage
}

// GET /api/kpi/trends
interface KPITrends {
  period: 'daily' | 'weekly' | 'monthly';
  data: Array<{
    date: string;
    jobsCompleted: number;
    revenue: number;
  }>;
}
```

### 4.5 UI/UX Requirements

| Element | Specification |
|---------|--------------|
| Leaderboard | Card list with rank numbers, top 3 highlighted |
| Charts | Responsive, tooltips on hover, legend visible |
| Filters | Horizontal bar with preset buttons + date picker |
| Metric Cards | Large numbers, trend arrows, sparklines |
| Color Coding | Green=good, Yellow=warning, Red=needs attention |

---

## 5. Feature Module 4: Advanced AI Features

### 5.1 Overview
Implement advanced AI capabilities for operational insights, anomaly detection, and document understanding.

### 5.2 User Stories

| ID | As a | I want to | So that |
|----|------|-----------|---------|
| AI-ADV-001 | Manager | Get alerts on unusual job amounts | I can catch potential issues |
| AI-ADV-002 | Manager | Know when jobs lack documentation | I can ensure quality control |
| AI-ADV-003 | Admin | Upload documents to create orders | I can process requests faster |
| AI-ADV-004 | Manager | See workload distribution | I can balance assignments |
| AI-ADV-005 | Manager | Get proactive recommendations | I can make better decisions |

### 5.3 Functional Requirements

#### 5.3.1 AI Workflow Supervisor

| ID | Requirement | Priority | Trigger | Action |
|----|-------------|----------|---------|--------|
| AI-ADV-006 | Flag high variance jobs | Nice to Have | final_amount > quoted_price * 1.5 | Alert in review queue |
| AI-ADV-007 | Alert on missing photos | Nice to Have | Job completed with no files | Show warning badge |
| AI-ADV-008 | Pattern detection | Nice to Have | Unusual patterns detected | Dashboard insight card |

#### 5.3.2 AI Document Understanding

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| AI-ADV-009 | Extract from WhatsApp screenshot | Nice to Have | Parse customer name, phone, address, problem |
| AI-ADV-010 | Extract from service request form | Nice to Have | Parse all order fields |
| AI-ADV-011 | Pre-fill order form | Nice to Have | Extracted data populates form |
| AI-ADV-012 | Confidence score display | Nice to Have | Show extraction confidence % |

#### 5.3.3 AI Operational Insights

| ID | Requirement | Priority | Display |
|----|-------------|----------|---------|
| AI-ADV-013 | Workload distribution analysis | Nice to Have | Chart in dashboard |
| AI-ADV-014 | Overloaded technician alert | Nice to Have | Warning in assignment dropdown |
| AI-ADV-015 | Daily insights summary | Nice to Have | AI-generated summary card |
| AI-ADV-016 | Recommendation engine | Nice to Have | "Consider assigning to X" suggestions |

### 5.4 Technical Specifications

#### 5.4.1 AI Integration Points

```typescript
// New AI tools to add
const advancedAITools = {
  analyzeWorkload: {
    description: 'Analyze current workload distribution across technicians',
    parameters: { branchId: 'string' },
    returns: 'WorkloadAnalysis',
  },
  detectAnomalies: {
    description: 'Detect unusual patterns in recent job data',
    parameters: { period: 'string' },
    returns: 'AnomalyReport',
  },
  extractFromDocument: {
    description: 'Extract structured data from uploaded document image',
    parameters: { imageUrl: 'string' },
    returns: 'ExtractedOrderData',
  },
  generateInsights: {
    description: 'Generate operational insights and recommendations',
    parameters: { context: 'string' },
    returns: 'InsightReport',
  },
};
```

#### 5.4.2 Component Structure

```
src/components/ai/
├── insights/
│   ├── insight-card.tsx        # Single insight display
│   ├── insights-panel.tsx      # Insights sidebar
│   ├── anomaly-alert.tsx       # Anomaly warning
│   └── recommendation.tsx      # AI recommendation
├── document-extract/
│   ├── upload-zone.tsx         # Document upload
│   ├── extraction-preview.tsx  # Extracted data preview
│   └── confidence-badge.tsx    # Confidence indicator
└── workload/
    ├── distribution-chart.tsx  # Workload visualization
    └── overload-warning.tsx    # Warning component
```

### 5.5 UI/UX Requirements

| Element | Specification |
|---------|--------------|
| Insight Card | Icon + title + description + action button |
| Anomaly Alert | Yellow/warning color, dismissible |
| Upload Zone | Drag & drop, preview, extraction animation |
| Confidence Badge | Green (>80%), Yellow (50-80%), Red (<50%) |
| Workload Chart | Bar chart with threshold line |

---

## 6. Implementation Priority Matrix

### 6.1 Phase 1: Quick Wins (Week 1)

| Feature | Effort | Impact | Dependencies |
|---------|--------|--------|--------------|
| Role Selection at Login | Low | High | None |
| Role Switcher Component | Low | High | None |
| WhatsApp Button Enhancement | Low | High | None |
| Basic Notification Logging | Low | Medium | Database table |

### 6.2 Phase 2: Core Enhancements (Week 2)

| Feature | Effort | Impact | Dependencies |
|---------|--------|--------|--------------|
| Automatic Notification Triggers | Medium | High | Logging system |
| KPI Time Filters | Medium | High | None |
| Leaderboard View | Medium | High | None |
| Jobs Bar Chart | Medium | Medium | Recharts |

### 6.3 Phase 3: Advanced Features (Week 3-4)

| Feature | Effort | Impact | Dependencies |
|---------|--------|--------|--------------|
| Additional KPI Metrics | Medium | Medium | Database schema |
| Revenue Trend Charts | Medium | Medium | Recharts |
| AI Anomaly Detection | High | Medium | AI integration |
| AI Document Extraction | High | Medium | Vision AI API |

---

## 7. Technical Dependencies

### 7.1 New Packages Required

```json
{
  "dependencies": {
    "recharts": "^2.12.0",
    "date-fns": "^3.3.0",
    "react-day-picker": "^8.10.0"
  }
}
```

### 7.2 Database Migrations Required

1. `notification_logs` table creation
2. Add `scheduled_date`, `postponed_count`, `rescheduled_count` to orders
3. Create `technician_kpi` view

### 7.3 API Routes to Create

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/notifications/send` | POST | Send notification |
| `/api/notifications/logs` | GET | Get notification history |
| `/api/kpi/technicians` | GET | Get technician KPIs |
| `/api/kpi/trends` | GET | Get trend data |
| `/api/ai/analyze` | POST | AI analysis endpoint |
| `/api/ai/extract` | POST | Document extraction |

---

## 8. Testing Requirements

### 8.1 Unit Tests

- [ ] Role switcher state management
- [ ] Notification template variable replacement
- [ ] KPI metric calculations
- [ ] Date filter logic

### 8.2 Integration Tests

- [ ] Notification logging on send
- [ ] KPI data aggregation
- [ ] AI query with new tools

### 8.3 E2E Tests

- [ ] Login with role selection
- [ ] Complete job → notification flow
- [ ] KPI dashboard filtering

---

## 9. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Role switch time | < 2 seconds | Time from click to UI update |
| Notification send rate | 100% | All triggered notifications logged |
| KPI load time | < 3 seconds | Dashboard initial render |
| Chart render time | < 1 second | Chart visualization |
| AI insight relevance | > 80% | User feedback rating |

---

## 10. Appendices

### 10.1 Component Dependency Graph

```
Authentication
├── role-selector.tsx
│   └── Uses: auth-store
├── role-switcher.tsx
│   └── Uses: auth-store, dropdown-menu
└── role-indicator.tsx
    └── Uses: auth-store, badge

Notifications
├── notification-button.tsx
│   └── Uses: whatsapp.ts, notification-logger
├── notification-history.tsx
│   └── Uses: notification-logs API
└── notification-template.tsx
    └── Uses: templates.ts

KPI Dashboard
├── kpi-dashboard.tsx
│   ├── Uses: kpi-filters, kpi-leaderboard, kpi-charts
├── kpi-filters.tsx
│   └── Uses: date-fns, react-day-picker
├── kpi-leaderboard.tsx
│   └── Uses: kpi API
└── kpi-charts/
    └── Uses: recharts
```

### 10.2 Database Migration Script

```sql
-- Migration: 001_add_notification_and_kpi_features.sql

-- 1. Create notification logs table
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('technician', 'customer', 'manager')),
  recipient_name VARCHAR(255),
  recipient_phone VARCHAR(20),
  template_id VARCHAR(50) NOT NULL,
  message_content TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- 2. Add tracking columns to orders
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS scheduled_date DATE,
  ADD COLUMN IF NOT EXISTS postponed_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rescheduled_count INTEGER DEFAULT 0;

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_notification_logs_order ON notification_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON notification_logs(status);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created ON notification_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_scheduled_date ON orders(scheduled_date);

-- 4. Create KPI view
CREATE OR REPLACE VIEW technician_kpi AS
SELECT
  u.id AS technician_id,
  u.name AS technician_name,
  COUNT(o.id) FILTER (WHERE o.status IN ('job_done', 'reviewed', 'closed')) AS jobs_completed,
  COALESCE(SUM(sr.final_amount), 0) AS total_revenue,
  COUNT(o.id) FILTER (WHERE o.postponed_count > 0) AS postponed_jobs,
  AVG(EXTRACT(EPOCH FROM (sr.completed_at - o.updated_at))/3600) AS avg_completion_hours
FROM users u
LEFT JOIN orders o ON o.assigned_technician_id = u.id
LEFT JOIN service_records sr ON sr.order_id = o.id
WHERE u.role = 'technician' AND u.is_active = true
GROUP BY u.id, u.name;
```

---

**Document Version**: 1.0
**Last Updated**: January 2025
**Author**: Development Team
