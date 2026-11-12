# 01 – Project Overview

## Problem statement
Citizens need a structured digital channel to raise concerns involving infrastructure, healthcare, education and public services, while the CMO needs visibility into routing, department action and resolution.

## Objectives
- Allow citizens to register, submit and track grievances.
- Generate a unique reference number and preserve status history.
- Let CMO administrators review, prioritize and assign grievances.
- Let department officers record investigation progress and action-taken reports.
- Provide AI-assisted category, department, priority and summary suggestions for human review.

## Scope and roles
- **Citizen:** registration, login, submission, attachment upload, tracking, dashboard and feedback API.
- **CMO administrator:** grievance oversight, filters, assignment, priority and status updates, statistics.
- **Department officer:** department-scoped queue, remarks, action report and status update.
- **Public visitor:** informational pages, contact enquiry and reference tracking.

## Core workflow
Citizen submits → reference ID generated → CMO review → department assignment → officer investigation → action-taken report → CMO review → citizen update → resolved or reopened.

## Statuses
`SUBMITTED`, `UNDER_REVIEW`, `IN_PROGRESS`, `RESOLVED`, `REOPENED` (displayed in title case in the UI).

## Prototype boundary
Fictional data only. This application is a recruitment prototype and does not represent an authorized government service.
