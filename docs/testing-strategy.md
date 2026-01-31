# Testing Strategy – Shopping List App

## Purpose

This document outlines the testing strategy used in this project and the rationale behind key decisions.

The aim is **high confidence with maintainable automation**, not exhaustive coverage. The strategy reflects real-world QA and test automation practices.

---

## Overall Approach

Testing is treated as a **first-class concern** and structured according to the **test pyramid**:

- Broad coverage at backend and frontend levels
- A small, focused E2E layer for critical user journeys
- Risk-based decisions to balance confidence, speed, and flakiness

Each test level has a clear responsibility and avoids unnecessary duplication.

---

## Test Levels & Scope

### Backend Testing (API / Integration)

**Focus**
- Business logic and API correctness
- Authentication, authorization, and data isolation
- Error handling and negative scenarios

**Approach**
- Integration-style API tests using realistic request/response flows
- Dedicated MongoDB test database
- Explicit testing of unauthorised access and invalid inputs

**Tools**
- Jest, Supertest

---

### Frontend Testing (Component & Integration)

**Focus**
- UI behaviour and state transitions
- Routing and protected pages
- Authentication flows and error states

**Approach**
- Behaviour-driven assertions using React Testing Library
- API interactions mocked with MSW
- Custom hooks tested independently where appropriate

**Tools**
- Vitest, React Testing Library, MSW

---

### End-to-End (E2E) Testing

**Focus**
- Critical user journeys across the full system
- Integration between frontend, backend, and database

**Approach**
- Real browser execution using Playwright
- Dedicated E2E MongoDB database
- Database reset before execution
- Automatic startup and teardown via scripts
- One-command execution (`npm run test:e2e`)

**Tools**
- Playwright, Docker

---

## Coverage & Boundaries

**Covered**
- Authentication and route protection
- CRUD operations for shopping list items
- Per-user data isolation
- Error handling and invalid access attempts
- End-to-end validation of core flows

**Intentionally Not Covered**
- Pixel-perfect UI styling
- Exhaustive cross-browser testing
- E2E testing of low-risk UI edge cases already validated by frontend component and integration tests
- Performance or load testing

---

## Risk-Based Decisions

- High-risk areas (auth, access control, data isolation) are tested at multiple levels
- Lower-risk UI behaviour is validated at the frontend level
- E2E tests are limited to critical paths to control flakiness and maintenance cost

---

## Example Defects This Strategy Targets

- Unauthenticated access to protected routes
- Cross-user data leakage
- UI state desynchronisation after failed API calls
- Backend failures masked by optimistic UI updates
- Invalid or expired token handling errors

---

## CI & Automation

- All test levels run automatically in GitHub Actions
- Backend, frontend, and E2E pipelines run independently
- E2E tests use Docker for a clean, reproducible environment
- Failures provide actionable evidence via reports, screenshots, videos, and traces

CI acts as a **quality gate**, preventing regressions from being merged unnoticed.

---

## Maintenance Principles

- Behaviour-based assertions and stable selectors
- Clear separation of concerns
- Database resets to ensure isolation
- Intentionally small E2E scope to keep long-term maintenance manageable

---

## Summary

This strategy intends to reflect a **pragmatic QA mindset**:
- Test the right things at the right level
- Prioritise risk and confidence over raw coverage
- Use automation to support, not replace, good testing decisions