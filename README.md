# Bambinos.live — AI Program Manager Operations Platform (Stage 2)

> **Production Prototype & Business Solution for the Student Renewal → Class Scheduling Pipeline**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.3-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4+-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Python-3.12+-3776AB?logo=python)](https://python.org/)

---

## 📌 Executive Summary

Bambinos.live conducts interactive live classes for children aged 4–16 across multiple disciplines (English, Maths, Gita, Chess, and Science). In the current operational workflow, renewals traverse 4 disconnected touchpoints:
1. `invoices` — Razorpay/Stripe renewal link payment receipts.
2. `faculty_form_unapproved` — Educators manually submitting renewal forms.
3. `booking_requests` — Operations team manually reviewing and approving batch continuation.
4. `class_schedule_bookings` — Live class session scheduling.

This platform replaces that error-prone, asynchronous relay with a **deterministic, 5-layer automated reconciliation engine**. It automatically approves clean renewals in real time, guarantees batch capacity guardrails (maximum 6 students), detects 16 distinct operational exceptions with exact reason codes, and generates contextual follow-up message drafts for Teachers, Parents, and Operations desks.

---

## 🚀 Key Modules & Architecture

1. **Executive Overview Dashboard**: High-level telemetry displaying 8 calculated KPIs (Total Invoices, Verified Payments, Auto-Approved, Orphaned Forms, Pending Bookings, Unscheduled Students, Flagged Exceptions, Automation Rate) and 6 visual charts.
2. **Renewal Pipeline**: 4-stage Kanban/table view tracking each student from payment confirmation to live class scheduling with full cross-table audit histories.
3. **Reconciliation Engine**: 5-layer rule validation pipeline evaluating invoices, faculty forms, booking requests, schedules, and master reference roster.
4. **Exception Center**: Triage table for 16 failure modes with drawer inspection, status updating, desk assignment, internal notes, and one-click exports.
5. **Data Management**: File inspector for all 5 production tables with schema validation, search, pagination, and single-file CSV replacement.
6. **Automation Workflow Simulator**: Interactive simulator demonstrating Happy Path (zero-touch fast path) vs Exception Path (safe-halt triage) with execution latency metrics.
7. **Message Center**: AI/NLP-assisted draft generator constructing contextual messages for Teachers, Parents, and Operations with one-click clipboard copying.
8. **SLA Monitoring**: Tracks Payment-to-Form (4h), Payment-to-Approval (8h), Payment-to-Scheduling (24h), and Critical Exception TTR with historical compliance analytics.
9. **Operations Reports & Documentation**: In-app deliverables for Root Cause Analysis, Operational Leakage Audit, SOPs, Change Management, 30-60-90 Day Roadmap, and one-click PDF compilation.

---

## 📂 Repository Structure

```
d:/bambos/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI application & REST endpoints
│   │   ├── models.py            # Pydantic schemas, enums, & data models
│   │   ├── reconciliation.py    # 5-layer reconciliation rule engine
│   │   ├── metrics.py           # SLA metrics, TAT, & telemetry
│   │   ├── messaging.py         # AI/NLP follow-up draft generator
│   │   └── reports.py           # ReportLab PDF Case Report generator
│   └── tests/
│       └── test_reconciliation.py # 11 comprehensive automated unit tests
├── frontend/
│   ├── src/
│   │   ├── components/          # Sidebar, TopHeader, MetricCard, StatusBadge
│   │   ├── pages/               # 10 full-featured dashboard modules
│   │   ├── api.ts               # Axios client connecting to backend
│   │   ├── types.ts             # TypeScript interface definitions
│   │   ├── App.tsx              # Root application router & state manager
│   │   └── index.css            # Tailwind CSS design system
│   └── package.json
├── data/                        # 5 official masked production CSV datasets
│   ├── 1_invoices.csv
│   ├── 2_faculty_form_unapproved.csv
│   ├── 3_booking_requests.csv
│   ├── 4_class_schedule_bookings.csv
│   └── reference_active_batches_and_students.csv
├── outputs/                     # Downloadable CSVs, JSONs, & Case Report PDF
│   ├── Bambinos_Operations_TakeHome_Case_Report.pdf
│   ├── bambinos_reconciliation_summary.json
│   ├── bambinos_auto_approved_renewals.csv
│   ├── bambinos_operational_exceptions.csv
│   ├── bambinos_draft_communications.csv
│   └── bambinos_booking_ready_records.csv
├── prompts/                     # Exact system prompts used for AI workflows
├── workflows_or_scripts/        # n8n blueprint & reconciliation CLI
└── README.md
```

---

## 🛠️ Quick Start Instructions

### Prerequisites
- Python 3.10+
- Node.js v18+ and npm

### 1. Run the Backend API (FastAPI)
```bash
# In the repository root
python -m uvicorn backend.app.main:app --reload --port 8000
```
- API Documentation (Swagger): `http://localhost:8000/docs`
- Healthcheck: `http://localhost:8000/`

### 2. Run the Frontend (Vite + React + Tailwind)
```bash
cd frontend
npm install
npm run dev
```
- Access the web application at: `http://localhost:5173`

### 3. Run Automated Unit Tests
```bash
python -m unittest backend.tests.test_reconciliation
```
*Executes 11 comprehensive test cases validating clean approvals, failed payment halts, partial payments, batch overflow safeguards, duplicate forms, and invoice ID typos.*

### 4. Run CLI Headless Reconciliation
```bash
python workflows_or_scripts/reconciliation_cli.py --generate-pdf
```

---

## 📊 Summary of Actual Dataset Findings

- **Total Invoices**: 13
- **Verified Payments**: 11
- **Auto-Approved Clean Renewals**: 3 (27.3% of eligible paid renewals)
- **Already Scheduled**: 1 (Invoice 84901, preventing duplicate class booking)
- **Orphaned Invoices (Missing Forms)**: 2 (Invoices 84906, 84910)
- **Batch Capacity Overflow**: 1 (Invoice 84905, Batch 9205 is 6/6 full)
- **Failed Payment Halted**: 1 (Invoice 84911, Gateway payment failed)
- **Partial / Installment Payment**: 1 (Invoice 84909, Installment 1 of 2)
- **Parent Contact Discrepancy**: 1 (Invoice 84904, Payer phone differs from registered profile)
- **Invoice Transposition Typo**: 1 (Invoice 84913, Teacher entered 84931)
- **Duplicate Faculty Form**: 1 (Invoice 84908, Teacher resubmitted due to browser lag)

---

## 📑 Compulsory Take-Home Submission Checklist

- [x] **Case Report / Deck (`COMPULSORY` — PDF):** Generated at `outputs/Bambinos_Operations_TakeHome_Case_Report.pdf`.
- [x] **GitHub Repository (`COMPULSORY`):**
  - [x] `README.md` — Complete solution documentation & run instructions.
  - [x] `prompts/` — Exact system prompts used in AI reconciliation workflows.
  - [x] `outputs/` / `results/` — Output tables, reconciled CSVs/JSONs.
  - [x] `workflows_or_scripts/` — Production n8n workflow export & Python CLI.
  - [x] Complete functional Frontend & Backend with 11 passing automated tests.

