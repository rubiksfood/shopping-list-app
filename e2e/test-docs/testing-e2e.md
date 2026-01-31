# testing-e2e.md  
## Shopping List MERN – End-to-End (E2E) Test Specification (Playwright)  
Author: **Joshua Pearson**  
Last Updated: 2025-12-29  

---

# 1. Overview

This document describes the **end-to-end (E2E) test specification** for the Shopping List MERN application using **Playwright**.

It complements the existing automated test layers:

- **Backend testing** (Jest + Supertest)
- **Frontend testing** (Vitest + React Testing Library + MSW)

E2E testing validates that the **entire system works correctly when integrated**, including:

- React UI and routing
- Authentication and protected routes
- Express backend API
- MongoDB persistence
- User-specific data isolation

The E2E suite is intentionally **small and focused**, targeting only the highest-value user journeys to maximise confidence while minimising flakiness.

---

# 2. Scope & Objectives

## 2.1 In Scope

- Core user journeys across the full stack:
  - Unauthenticated access handling
  - Login and logout flows
  - Access to protected routes
- Critical shopping list functionality:
  - Create and delete items
- Security-related functional behaviour at system level:
  - Per-user data isolation (User A cannot see User B’s items)
- Regression coverage for demo-critical flows used by recruiters

## 2.2 Out of Scope

- Performance and load testing
- Accessibility testing
- Visual regression testing
- Deep negative testing (covered at backend/frontend levels)
- Full CRUD edge cases (edit, toggle grouping) already covered by lower test layers

## 2.3 Objectives

E2E testing aims to:

- Confirm the application works as a **fully integrated system**.
- Validate that authentication, routing, persistence, and UI wiring behave correctly together.
- Provide a **stable regression safety net** for future refactoring.
- Demonstrate professional, ISTQB-aligned E2E test design.

---

# 3. Test Methodology

## 3.1 Test Level

**System Testing (End-to-End)**  
- Tests run in a real browser against services started by the E2E runner/script.

## 3.2 Test Types

| Test Type                               | Description                                                  |
|-----------------------------------------|--------------------------------------------------------------|
| Functional E2E                          | Validates core workflows across UI, API, and DB              |
| Security-related functional E2E         | Validates access control via user-visible behaviour          |
| State-based testing                     | Auth state transitions (logged out → logged in → logged out) |
| Regression testing                      | Small, stable suite executed in CI                           |

## 3.3 Test Design Techniques

| Technique                     | Applied To                                         |
|-------------------------------|----------------------------------------------------|
| Use Case Testing (UC)         | Login → manage list → logout                       |
| State Transition Testing (ST) | Auth lifecycle, item presence/absence              |
| Equivalence Partitioning (EP) | Valid user flows                                   |
| Decision Table Testing (DT)   | Authenticated vs unauthenticated, User A vs User B |
| Error Guessing (EG)           | Unauthenticated access attempts                    |

---

# 4. How to Run (Quick Start)

## 4.1 Prerequisites

- Node.js installed
- Docker installed and running (for the E2E MongoDB database)
- Run `npm install` in root repo, /server + /client (one-time setup). 

## 4.2 Create the E2E env file

1) Copy the example env file:

- `e2e/config.e2e.env.example` → `e2e/config.e2e.env`

2) Edit `e2e/config.e2e.env` and set values to match your local setup (see variables table below).

> The Playwright global setup loads `e2e/config.e2e.env` automatically.

## 4.3 Start services

- Run Docker

The test:e2e script is responsible for starting required backend & frontend services (via Docker and npm scripts) before Playwright execution.

## 4.4 Running the E2E tests

Typical execution flow:

1. Run Docker
2. Run Playwright tests

Example:  
`npm run test:e2e`

On execution:

- Global setup loads `e2e/config.e2e.env`
- Mongo container health is checked (to prevent flaky DB reset)
- DB is reset before tests run
- Playwright executes the specs in `e2e/tests`

---

# 5. Test Environment

## 5.1 Components

- Playwright test runner
- Chromium browser (default; others optional)
- Express backend (started by E2E runner)
- React frontend (started by E2E runner)
- Dedicated MongoDB **E2E test database**

## 5.2 Environment Variables (E2E)

These variables must exist in: `e2e/config.e2e.env`

| Variable name         | Example value               | Used by                  | Description                                                                                               |
|-----------------------|-----------------------------|--------------------------|-----------------------------------------------------------------------------------------------------------|
| `ATLAS_URI`           | `mongodb://127.0.0.1:27017` | Backend, DB reset script | MongoDB connection string (local Mongo or Docker-exposed Mongo).                                          |
| `E2E_DB_NAME`         | `shopping-list-test-e2e`    | Backend, DB reset script | Database used exclusively for E2E tests. Must NOT be your production/dev DB.                              |
| `E2E_BASE_URL`        | `http://localhost:5173`     | Playwright tests         | Base URL of the frontend application under test.                                                          |
| `E2E_BACKEND_URL`     | `http://localhost:5050`     | E2E API helpers/tests    | Backend URL used by E2E helper functions to call API endpoints directly when needed.                      |
| `JWT_SECRET`          | `change-me-for-local-e2e`   | Backend                  | JWT signing secret for E2E environment (non-production only).                                             |
| `NODE_ENV`            | `e2e`                       | Backend                  | Identifies E2E environment and ensures E2E configuration is loaded.                                       |
| `E2E_MONGO_CONTAINER` | `shopping-list-mongo-e2e`   | Playwright global setup  | **Optional**: Docker container name used for Mongo health check. Set this if your container name differs. |
| `PORT`                | `5050`                      | Backend (optional)       | **Optional**: Used if your backend reads `PORT`. If changed, E2E_BACKEND_URL must reflect the same port.  |


## 5.3 Test Data & Isolation Strategy

- E2E tests use a **separate database** (e.g. `shopping-list-test-e2e`)
- Database state is reset before test execution (global setup)
- Test users are created dynamically with unique emails
- Browser storage (localStorage) is cleared between tests
- Production data is never accessed

> Safety note: the DB reset script includes safeguards to prevent accidental deletion of non-test databases.
> Do not bypass these checks.

---

# 6. Test Suites, Conditions, and Test Cases

This section defines E2E test conditions (TCON) and test cases (TC).

---

## 6.1 Routing & Authentication Suite (E2E)

### 6.1.1 Test Conditions

- **TCON-E2E-ROUTE-01:** Unauthenticated access to a protected route redirects to `/login`
- **TCON-E2E-AUTH-01:** Login persists authentication and grants access to protected home route
- **TCON-E2E-AUTH-02:** Logout clears authentication state and redirects to `/login`

### 6.1.2 Test Cases

| TC ID           | Objective                       | Preconditions       | Steps                                            | Expected Result                               | Technique   |
|-----------------|---------------------------------|---------------------|--------------------------------------------------|-----------------------------------------------|-------------|
| E2E-ROUTE-TC-01 | Verify protected route redirect | No token in browser | 1) Navigate to `/`                               | Redirected to `/login`; login form visible    | ST, SEC, EG |
| E2E-AUTH-TC-01  | Verify login grants access      | User exists         | 1) Go to `/login` 2) Enter valid creds 3) Submit | Navigates to `/`; token stored; list rendered | UC, ST      |
| E2E-AUTH-TC-02  | Verify logout clears session    | Logged-in user      | 1) Click Logout                                  | Redirected to `/login`; token removed         | ST, EG      |

---

## 6.2 Shopping List Core Functionality Suite (E2E)

### 6.2.1 Test Conditions

- **TCON-E2E-ITEM-01:** User can create a shopping list item
- **TCON-E2E-ITEM-02:** User can delete a shopping list item

### 6.2.2 Test Cases

| TC ID          | Objective                | Preconditions               | Steps                                         | Expected Result          | Technique |
|----------------|--------------------------|-----------------------------|-----------------------------------------------|--------------------------|-----------|
| E2E-ITEM-TC-01 | Add item appears in list | Logged-in user              | 1) Click “+ Add item” 2) Enter name 3) Submit | Item row visible in list | UC, EP    |
| E2E-ITEM-TC-02 | Delete item removes it   | Logged-in user; item exists | 1) Click Delete                               | Item removed from list   | UC, EG    |

---

## 6.3 Security / Data Isolation Suite (E2E)

### 6.3.1 Test Conditions

- **TCON-E2E-SEC-01:** User cannot see another user’s shopping items

### 6.3.2 Test Cases

| TC ID         | Objective                        | Preconditions                      | Steps                                 | Expected Result                           | Technique   |
|---------------|----------------------------------|------------------------------------|---------------------------------------|-------------------------------------------|-------------|
| E2E-SEC-TC-01 | Verify cross-user data isolation | User A and User B exist with items | 1) Login as User A 2) Navigate to `/` | Only User A’s items visible; not User B’s | SEC, DT, EG |

---

# 7. Traceability Matrix (E2E)

| Test Condition ID | Test Case ID(s) | Playwright Spec File                   |
|-------------------|-----------------|----------------------------------------|
| TCON-E2E-ROUTE-01 | E2E-ROUTE-TC-01 | `e2e/tests/auth.spec.ts`               |
| TCON-E2E-AUTH-01  | E2E-AUTH-TC-01  | `e2e/tests/auth.spec.ts`               |
| TCON-E2E-AUTH-02  | E2E-AUTH-TC-02  | `e2e/tests/auth.spec.ts`               |
| TCON-E2E-ITEM-01  | E2E-ITEM-TC-01  | `e2e/tests/shoppingList.spec.ts`       |
| TCON-E2E-ITEM-02  | E2E-ITEM-TC-02  | `e2e/tests/shoppingList.spec.ts`       |
| TCON-E2E-SEC-01   | E2E-SEC-TC-01   | `e2e/tests/security-isolation.spec.ts` |

---

# 8. Reporting & Evidence

Playwright provides:
- Console execution summary
- HTML report
- Screenshots on failure
- Video and trace artifacts (enabled in CI)

---

# 9. Maintenance & Future Enhancements

Future E2E extensions may include:
- Registration flow (UI-level)
- Token expiry / invalidation behaviour
- Accessibility smoke checks
- Multi-browser execution in CI
- Production build E2E runs

The E2E suite will intentionally remain small and high-value, with broader edge-case coverage handled by backend and frontend automated tests.

# 10. Test Pyramid Alignment

This E2E suite represents the top of the test pyramid:
- Broad coverage at backend and frontend levels
- Narrow, stable E2E coverage for confidence
- Reduced flakiness and fast CI feedback

This aligns with real-world professional testing practice.