# Product Requirements Document (PRD)

## Sejuk Sejuk Service - Operations Management System

---

## 1. Executive Summary

### 1.1 Product Overview
Sejuk Sejuk Service Operations Management System is a digital platform designed to manage the end-to-end workflow of air-conditioner installation, servicing, and repair operations for Sejuk Sejuk Service Sdn Bhd.

### 1.2 Business Context
| Aspect | Details |
|--------|---------|
| Company | Sejuk Sejuk Service Sdn Bhd |
| Service | Air-conditioner installation, servicing, and repair |
| Scale | 5 branches nationwide, 40+ technician teams |
| Primary Users | Admin staff (desktop), Technicians (mobile), Managers (desktop) |

### 1.3 Problem Statement
The current manual process for managing service orders, technician assignments, and job completions is inefficient and lacks visibility. The business requires a digitised system to:
- Streamline order creation and assignment
- Enable field technicians to complete jobs efficiently
- Provide management with operational visibility
- Leverage AI for operational insights

---

## 2. Business Objectives

| Objective | Success Criteria |
|-----------|------------------|
| Digitise full service workflow | Complete order-to-closure cycle in system |
| Improve technician efficiency | Reduce job completion time by enabling mobile workflows |
| Enable real-time visibility | Dashboard showing live operational metrics |
| Leverage AI capabilities | Operational query assistant for managers |

---

## 3. User Personas

### 3.1 Admin Staff
- **Role**: Creates orders and assigns technicians
- **Device**: Desktop
- **Key Tasks**: Order creation, technician assignment, customer data entry
- **Pain Points**: Manual coordination, lack of tracking

### 3.2 Technician
- **Role**: Executes service jobs in the field
- **Device**: Mobile (primary)
- **Key Tasks**: View assigned jobs, complete service, upload photos, record payments
- **Pain Points**: Paperwork, slow communication, manual reporting

### 3.3 Manager
- **Role**: Reviews completed jobs and monitors performance
- **Device**: Desktop
- **Key Tasks**: Job review, KPI monitoring, operational queries
- **Pain Points**: Lack of visibility into team performance, manual reporting

---

## 4. System Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                      ORDER LIFECYCLE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌──────────┐    ┌───────────┐    ┌──────────────┐            │
│   │   NEW    │───►│  ASSIGNED │───►│  IN PROGRESS │            │
│   └──────────┘    └───────────┘    └──────────────┘            │
│                                            │                    │
│                                            ▼                    │
│   ┌──────────┐    ┌───────────┐    ┌──────────────┐            │
│   │  CLOSED  │◄───│  REVIEWED │◄───│   JOB DONE   │            │
│   └──────────┘    └───────────┘    └──────────────┘            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.1 Workflow Steps

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 1 | Admin | Creates order | Status: NEW |
| 2 | Admin | Assigns technician | Status: ASSIGNED, notify technician |
| 3 | Technician | Starts job | Status: IN PROGRESS |
| 4 | Technician | Completes job | Status: JOB DONE, notify customer & manager |
| 5 | Manager | Reviews job | Status: REVIEWED |
| 6 | System | Closes job | Status: CLOSED |

---

## 5. Functional Requirements

### 5.1 Authentication Module

| ID | Requirement | Priority |
|----|-------------|----------|
| AUTH-001 | Mock login system with role selection | Must Have |
| AUTH-002 | Role-based access: Admin, Technician, Manager | Must Have |
| AUTH-003 | Role switcher for testing different personas | Should Have |
| AUTH-004 | Basic authentication implementation | Nice to Have |

---

### 5.2 Module 1: Admin Portal - Order Submission

#### 5.2.1 Order Creation Form

| ID | Requirement | Priority |
|----|-------------|----------|
| ORD-001 | Auto-generate Order Number (format: ORD-YYYYMMDD-XXXX) | Must Have |
| ORD-002 | Customer Name input field | Must Have |
| ORD-003 | Phone number input field with validation | Must Have |
| ORD-004 | Address input field | Must Have |
| ORD-005 | Problem Description textarea | Must Have |
| ORD-006 | Service Type dropdown (Installation, Servicing, Repair, Gas Refill, Others) | Must Have |
| ORD-007 | Quoted Price input field | Must Have |
| ORD-008 | Technician Assignment dropdown (populated from technician list) | Must Have |
| ORD-009 | Admin Notes textarea | Should Have |

#### 5.2.2 Order Submission Actions

| ID | Requirement | Priority |
|----|-------------|----------|
| ORD-010 | Display order summary after submission | Should Have |
| ORD-011 | Send WhatsApp notification to assigned technician | Nice to Have |
| ORD-012 | Persist order to database with status "NEW" or "ASSIGNED" | Must Have |

#### 5.2.3 Data Model - Orders

```json
{
  "id": "UUID",
  "order_no": "ORD-20250115-0001",
  "customer_name": "string",
  "phone": "string",
  "address": "string",
  "problem_description": "string",
  "service_type": "enum",
  "quoted_price": "decimal",
  "assigned_technician_id": "UUID",
  "admin_notes": "string",
  "status": "enum",
  "created_at": "timestamp",
  "created_by": "UUID"
}
```

---

### 5.3 Module 2: Technician Portal - Service Job

#### 5.3.1 Job List View

| ID | Requirement | Priority |
|----|-------------|----------|
| TECH-001 | Display list of assigned jobs for logged-in technician | Must Have |
| TECH-002 | Filter jobs by status (Pending, In Progress, Completed) | Should Have |
| TECH-003 | Mobile-first responsive design | Must Have |

#### 5.3.2 Job Completion Form

| ID | Requirement | Priority |
|----|-------------|----------|
| TECH-004 | Display Order ID (read-only) | Must Have |
| TECH-005 | Work Done description field | Must Have |
| TECH-006 | Extra Charges input field | Should Have |
| TECH-007 | File upload for photos/videos/PDFs (max 6 files) | Must Have |
| TECH-008 | Final Amount auto-calculated (quoted + extra charges) | Must Have |
| TECH-009 | Remarks field | Should Have |
| TECH-010 | Auto-capture technician name and timestamp | Must Have |

#### 5.3.3 Payment Recording (Optional)

| ID | Requirement | Priority |
|----|-------------|----------|
| TECH-011 | Payment Amount input | Nice to Have |
| TECH-012 | Payment Method dropdown (Cash, Online Transfer, Card) | Nice to Have |
| TECH-013 | Receipt Photo upload | Nice to Have |

#### 5.3.4 Notifications

| ID | Requirement | Priority |
|----|-------------|----------|
| TECH-014 | Generate WhatsApp feedback message for customer | Nice to Have |
| TECH-015 | Notify manager/accounts when job completed | Should Have |

#### 5.3.5 Data Model - Service Completion

```json
{
  "id": "UUID",
  "order_id": "UUID",
  "technician_id": "UUID",
  "work_done": "string",
  "extra_charges": "decimal",
  "final_amount": "decimal",
  "files": ["url1", "url2", "..."],
  "remarks": "string",
  "completed_at": "timestamp",
  "payment": {
    "amount": "decimal",
    "method": "enum",
    "receipt_url": "string"
  }
}
```

---

### 5.4 Module 3: WhatsApp Notification Trigger

#### 5.4.1 Notification Logic

| ID | Requirement | Priority |
|----|-------------|----------|
| WAPP-001 | Trigger notification when status changes to "JOB DONE" | Must Have |
| WAPP-002 | Generate message template with dynamic fields | Must Have |
| WAPP-003 | Open WhatsApp with pre-filled message (deep-link) | Must Have |

#### 5.4.2 Message Template

```
Hi {{customer_name}},
Job {{order_id}} has been completed by Technician {{technician_name}} at {{completion_time}}.
Please check and leave feedback.
Thank you!
```

#### 5.4.3 Technical Implementation

| ID | Requirement | Priority |
|----|-------------|----------|
| WAPP-004 | Backend trigger on status change | Should Have |
| WAPP-005 | WhatsApp deep-link URL generation | Must Have |
| WAPP-006 | Message logging for audit trail | Should Have |

---

### 5.5 Bonus Module: KPI Dashboard

#### 5.5.1 Metrics Display

| ID | Requirement | Priority |
|----|-------------|----------|
| KPI-001 | Jobs Completed per technician (weekly minimum) | Must Have |
| KPI-002 | Total Revenue per technician | Must Have |
| KPI-003 | Postpone/Reschedule count per technician | Should Have |
| KPI-004 | Average job completion time | Nice to Have |

#### 5.5.2 Visualization

| ID | Requirement | Priority |
|----|-------------|----------|
| KPI-005 | Card layout for individual metrics | Should Have |
| KPI-006 | Leaderboard view | Nice to Have |
| KPI-007 | Simple charts (bar/line) | Nice to Have |
| KPI-008 | Time period filter (daily, weekly, monthly) | Nice to Have |

---

### 5.6 AI Module: Operations Query Window

#### 5.6.1 Core Functionality

| ID | Requirement | Priority |
|----|-------------|----------|
| AI-001 | Natural language query input | Must Have |
| AI-002 | Interpret user questions about service data | Must Have |
| AI-003 | Retrieve relevant data from database | Must Have |
| AI-004 | Format and display AI response | Must Have |

#### 5.6.2 Supported Query Types

| Query Category | Example Questions |
|----------------|-------------------|
| Technician Performance | "What jobs did technician Ali complete last week?" |
| Comparison | "Which technician completed the most jobs this week?" |
| Daily Summary | "How many jobs were completed today?" |
| Revenue | "What is the total revenue this month?" |

#### 5.6.3 System Flow

```
User Question → Query Interpretation → Data Retrieval → AI Response Generation
```

#### 5.6.4 Constraints

| ID | Requirement |
|----|-------------|
| AI-005 | AI must query structured data, not raw database access |
| AI-006 | Responses based on controlled queries |
| AI-007 | Handle unsupported queries gracefully |

---

### 5.7 Advanced AI Features (Optional)

#### 5.7.1 AI Workflow Supervisor

| ID | Requirement | Priority |
|----|-------------|----------|
| AI-ADV-001 | Flag jobs where final amount >> quoted price | Nice to Have |
| AI-ADV-002 | Alert on completed jobs without photos | Nice to Have |
| AI-ADV-003 | Detect unusual patterns in job data | Nice to Have |

#### 5.7.2 AI Document Understanding

| ID | Requirement | Priority |
|----|-------------|----------|
| AI-ADV-004 | Extract structured data from uploaded documents | Nice to Have |
| AI-ADV-005 | Parse customer name, service type, amount, date | Nice to Have |

#### 5.7.3 AI Operational Insight

| ID | Requirement | Priority |
|----|-------------|----------|
| AI-ADV-006 | Analyze workload distribution | Nice to Have |
| AI-ADV-007 | Identify overloaded technicians | Nice to Have |
| AI-ADV-008 | Provide proactive recommendations | Nice to Have |

---

## 6. Non-Functional Requirements

### 6.1 Performance

| ID | Requirement |
|----|-------------|
| NFR-001 | Page load time < 3 seconds |
| NFR-002 | Mobile interface optimized for 3G networks |
| NFR-003 | File upload support for images up to 10MB each |

### 6.2 Usability

| ID | Requirement |
|----|-------------|
| NFR-004 | Mobile-first design for technician portal |
| NFR-005 | Clean, minimal UI focusing on task completion |
| NFR-006 | Touch-friendly interface elements (min 44px tap targets) |

### 6.3 Security

| ID | Requirement |
|----|-------------|
| NFR-007 | Role-based access control |
| NFR-008 | Audit trail for key actions |
| NFR-009 | Secure file storage |

### 6.4 Reliability

| ID | Requirement |
|----|-------------|
| NFR-010 | Offline capability for viewing assigned jobs (Nice to Have) |
| NFR-011 | Data persistence with automatic sync |

---

## 7. Technical Specifications

### 7.1 Recommended Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React |
| Styling | Tailwind CSS |
| Backend/Database | Supabase |
| File Storage | Supabase Storage |
| Deployment | Vercel |
| AI API | OpenAI / Claude / Gemini |

### 7.2 Data Entities

```
┌─────────────────┐     ┌─────────────────┐
│     Users       │     │    Orders       │
├─────────────────┤     ├─────────────────┤
│ id              │     │ id              │
│ name            │◄────│ assigned_tech   │
│ role            │     │ customer_name   │
│ phone           │     │ status          │
│ created_at      │     │ ...             │
└─────────────────┘     └────────┬────────┘
                                 │
                        ┌────────▼────────┐
                        │ ServiceRecords  │
                        ├─────────────────┤
                        │ id              │
                        │ order_id        │
                        │ work_done       │
                        │ files[]         │
                        │ completed_at    │
                        └─────────────────┘
```

### 7.3 Mock Data

#### Technicians
| ID | Name |
|----|------|
| 1 | Ali |
| 2 | John |
| 3 | Bala |
| 4 | Yusoff |

#### Sample Order
```json
{
  "orderId": "ORDER1234",
  "customerName": "Ahmad",
  "address": "No. 12, Jalan Sejuk, Shah Alam",
  "service": "Aircond cleaning",
  "assignedTechnician": "Ali",
  "status": "Pending"
}
```

---

## 8. Access Control Matrix

| Feature | Admin | Technician | Manager |
|---------|-------|------------|---------|
| Create Order | Yes | No | No |
| Assign Technician | Yes | No | No |
| View Own Jobs | No | Yes | Yes (All) |
| Complete Job | No | Yes (Own only) | No |
| Review Job | No | No | Yes |
| View Dashboard | Yes | No | Yes |
| AI Queries | No | No | Yes |

---

## 9. UI/UX Guidelines

### 9.1 Design Principles
- Clean, functional interface (internal tool aesthetic)
- Task-focused workflows
- Minimal decorative elements
- Clear visual hierarchy

### 9.2 Responsive Breakpoints
| Device | Breakpoint |
|--------|------------|
| Mobile | < 640px |
| Tablet | 640px - 1024px |
| Desktop | > 1024px |

### 9.3 Color Guidelines
- No specific brand colors required
- Use semantic colors: success (green), warning (yellow), error (red)
- Maintain sufficient contrast for readability

---

## 10. Deliverables

### 10.1 Required Deliverables
| Item | Description |
|------|-------------|
| Live Demo | Deployed on Netlify/Vercel/Firebase |
| Source Code | GitHub repository |
| README | Documentation of implementation |

### 10.2 README Contents
- Modules implemented
- Tech stack used
- Architecture decisions
- Challenges and assumptions
- AI integration details
- Limitations

---

## 11. Success Metrics

| Metric | Target |
|--------|--------|
| Module Completion | 1-2 modules with clear explanation |
| Code Quality | Clean, maintainable code |
| Documentation | Clear README with decisions explained |
| UX | Intuitive, task-focused interface |

---

## 12. Appendices

### 12.1 Order Status Definitions

| Status | Definition |
|--------|------------|
| NEW | Order created, not assigned |
| ASSIGNED | Technician assigned |
| IN PROGRESS | Technician started work |
| JOB DONE | Service completed, pending review |
| REVIEWED | Manager reviewed the job |
| CLOSED | Job fully closed |

### 12.2 Service Types

| Type | Description |
|------|-------------|
| Installation | New air-conditioner installation |
| Servicing | Regular maintenance/cleaning |
| Repair | Fix malfunctioning unit |
| Gas Refill | Recharge refrigerant |
| Inspection | Check and report unit condition |
| Others | Miscellaneous services |

---

**Document Version**: 1.0
**Last Updated**: January 2025
**Author**: Product Team
