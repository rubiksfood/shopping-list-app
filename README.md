# 🛒 Shopping List App

![CI](https://github.com/rubiksfood/shopping-list-app/actions/workflows/ci-backend.yml/badge.svg)
![CI](https://github.com/rubiksfood/shopping-list-app/actions/workflows/ci-frontend.yml/badge.svg)
![CI](https://github.com/rubiksfood/shopping-list-app/actions/workflows/ci-e2e.yml/badge.svg)

A full-stack MERN application built with a **QA-first mindset**, focusing on test strategy, automation, and system reliability.  
This project demonstrates my ability to design **testable systems**, apply the **test pyramid effectively**, and validate real user behaviour through backend, frontend, and end-to-end (E2E) testing.

> **Primary focus:** QA / Test Automation / SDET roles  

## 🧭 QA Focus & Skills Demonstrated

- Designing systems with **testability as a first-class concern**
- Applying the **test pyramid** across unit, integration, and E2E layers
- API, frontend, and E2E automation
- Writing **security-focused tests** (authentication, access control, data isolation)
- CI-driven regression detection with actionable failure evidence
- Risk-based test selection to maximise confidence while minimising flakiness
- Failure analysis using logs, traces, screenshots, and reports

📄 Detailed testing strategy and rationale: [`testing-strategy.md`](./docs/testing-strategy.md)

## Testing & Quality

In addition to automated test coverage, this project includes structured manual testing to validate real-world failure scenarios and establish regression confidence.

Quality-related artefacts are documented in the [`docs/`](./docs/) directory, including:
- A documented regression test checklist defining expected system behaviour
- Baseline regression run capturing observed behaviour
- Defect tracking via GitHub Issues with clear reproduction steps and evidence

The initial regression run establishes a quality baseline for authentication, session handling, and error handling. 
Subsequent test runs aim to validate changes against this baseline.

The sections below describe the application functionality and architecture that these testing practices are designed to validate.

## 🚀 Overview
This app allows users to create and manage personalised shopping lists with full authentication, CRUD functionality, and persistent data storage in MongoDB. The UX is designed to be fast and intuitive for real-world shopping scenarios.

## 🧰 Tech Stack
- **Frontend**: React (Vite), TailwindCSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JSON Web Tokens (JWT) + protected API routes
- **Misc**: React Router, custom hook, modular components
- **Testing & QA**: Jest, Supertest, Vitest, React Testing Library, MSW, Playwright

## ✨ Key Behaviours & Features

### 🔐 Secure Authentication
- Registration & login with hashed passwords
- JWT-based sessions stored client-side
- Protected API routes and protected frontend pages
- Automatic redirect for unauthenticated users

### 📝 Shopping List Management
- Create, read, update, and delete items
- “Cross off” items with a toggle switch
- “Uncross” items to return them to the active list
- Smart UI grouping: active items at the top, checked items grouped below
- Modal-driven add/edit form for a clean and efficient workflow
- Responsive layout optimised for desktop and mobile

### 🧱 Architecture & Testability Highlights
- Clean separation of concerns to support **independent test layers**
- Backend designed for **API-level integration testing** (Jest + Supertest)
- Frontend structured for **component, integration, and state-based testing** (Vitest + RTL + MSW)
- E2E testing with Playwright validating full system behaviour across UI, API, and database
- Dedicated test databases and strict data isolation for reliable automation

**Potential future QA enhancements**:
- Token expiry and session invalidation testing
- Accessibility smoke checks (ARIA roles, keyboard navigation)
- Cross-browser E2E execution in CI

## 🧪 Testing Strategy

Testing is treated as a **first-class concern** in this project, with clear separation between unit, integration, system, and end-to-end test levels in line with the test pyramid.  

This project includes comprehensive automated testing on the frontend, backend, and E2E, designed using ISTQB-aligned principles and real-world best practices. 
Testing focuses on functional correctness, error handling, security-related behaviour, and regression protection.  

Test cases are designed using equivalence partitioning, state transitions, and negative-path analysis where appropriate. 
While the focus is on automation, test scenarios are derived from exploratory and risk-based analysis before being automated.  

### Example Defects This Test Suite Is Designed to Catch

- Users accessing protected routes after token invalidation
- Cross-user data leakage due to missing ownership checks
- UI state desynchronisation after failed API mutations
- Silent backend failures masked by optimistic UI updates

### 🔹 Backend Testing (Node.js / Express)

Backend testing verifies API correctness, security, and data isolation using Jest and Supertest, backed by a dedicated MongoDB test database.

Key aspects include:

- Integration testing of REST API routes:
  - Authentication (/auth/register, /auth/login, /auth/me)
  - CRUD operations for shopping items (/shopItem)
- JWT authentication & authorization testing, including middleware behaviour
- Security-related functional testing:
  - Access control
  - Per-user data isolation
  - Protection against cross-user access
- Negative and error-handling tests for:
  - Missing or invalid inputs
  - Invalid ObjectIds
  - Missing or malformed Authorization headers
- Tests use realistic request/response flows to validate full backend behaviour

Backend tests ensure that users can only access their own data, that invalid requests fail safely, and that API changes are protected by an automated regression suite.

Run backend tests:  
```
cd server
npm test
```

📄 Detailed backend test specification: [`testing-backend.md`](./server/test-docs/testing-backend.md)

---

### 🔹 Frontend Testing (React)

Frontend testing validates UI behaviour, state transitions, routing, and API interactions using Vitest, React Testing Library, and Mock Service Worker (MSW).

Key aspects include:
- Component & integration testing of pages and UI components (Login, Register, Navbar, ShoppingList, forms)
- Authentication flow testing (login, logout, protected routes, redirects)
- State-based testing for auth state, loading states, and item toggling
- Custom hook testing (useShopItems) for data fetching, loading behaviour, error handling, and CRUD updates
- Mocked API interactions via MSW to simulate success, error, and unauthorised responses
- Behaviour-driven assertions focusing on what the user sees and can do, rather than internal implementation details

Frontend tests run in a JSDOM environment and provide fast, repeatable regression coverage for UI logic and routing.

Run frontend tests:  
```
cd client  
npm test  
```

📄 Detailed frontend test specification: [`testing-frontend.md`](./client/test-docs/testing-frontend.md)

---

### 🔹 End-to-End (E2E) Testing (Playwright)

The project includes a focused, high-value E2E test suite implemented with **Playwright**, designed to validate real user workflows across the **entire system**:

- React frontend
- Express backend
- MongoDB persistence
- Authentication and route protection
- Per-user data isolation

#### E2E Testing Goals
- Validate that all application layers integrate correctly
- Catch regressions that unit and integration tests cannot detect
- Confirm security-related behaviour from a user perspective
- Provide confidence that core flows work in real browser conditions

This E2E suite is intentionally **small, stable, and high-value**, reflecting real-world QA practice where E2E tests are used to protect critical user journeys rather than duplicate lower-level test coverage.

#### Covered User Journeys
- Unauthenticated access is redirected to login
- Login and logout flows
- Access to protected routes after authentication
- Creating and deleting shopping list items
- Data isolation between different users

#### Key Characteristics
- Real browser execution (Playwright-managed browsers)
- Dedicated E2E MongoDB test database
- Database reset before test execution
- Strict data isolation prevents cross-test contamination and mirrors real multi-user risk scenarios
- Automatic startup of backend, frontend, and database via scripts
- One-command execution


Run E2E tests locally:
```bash
npm run test:e2e
```

This command:
- Starts required Docker containers
- Launches backend and frontend services
- Resets the E2E database
- Executes the Playwright test suite


📄 Detailed E2E test specification: [`testing-e2e.md`](./e2e/test-docs/testing-e2e.md)

---

### 🔁 Continuous Integration

This project uses **GitHub Actions** to run automated tests on every push and pull request.

CI pipelines include:

- **Backend CI**
  - Jest + Supertest
  - Real MongoDB service
  - API, auth, and security-related tests

- **Frontend CI**
  - Vitest + React Testing Library + MSW
  - UI behaviour, routing, and state-based tests

- **E2E CI**
  - Playwright running in a real browser
  - Docker-managed MongoDB test database
  - Automatic startup and teardown of services
  - HTML reports, screenshots, videos, and traces uploaded on failure

The CI setup reflects real QA automation workflows, ensuring failures are observable, reproducible, and supported by actionable evidence.

---

## ✅ Overall Testing Goals

Together, the backend, frontend, and E2E test suites:
- Validate correct behaviour under normal and error conditions
- Detect defects early, prevent regressions, and reduce risk before changes reach production
- Demonstrate structured, professional test design
- Reflect real-world QA expectations

This testing approach supports the project’s goal of showcasing not just functionality, but also engineering discipline and test-aware development.

---

## 🛠 Installation & Setup

**Prerequisites**
- Node.js (v18+ recommended)
- npm
- MongoDB Atlas account (or compatible MongoDB instance)

---

### 1. Clone the repository
```
git clone https://github.com/rubiksfood/shopping-list-app.git
```

---

### 2. Install dependencies (one-time setup)

Install dependencies for all parts of the application:
```bash
npm install
cd server && npm install
cd ../client && npm install
```

---

### 3. Configure environment variables
Create a file at server/config.env with the following values:
```
ATLAS_URI="YOUR_MONGODB_URI_HERE"
PORT=5050
JWT_SECRET="your_secret_here"
```

> **Note:**  
> When using MongoDB Atlas, ensure your current IP address is allowed in the Atlas Network Access settings.  
> The application will fail to start if the cluster is not running or the IP is not whitelisted.

---

### 4. Run the application (recommended)

For local development and exploratory testing, start both the backend and frontend together from the repository root:
```
npm run dev
```

This command uses `concurrently` to:
- Start the Express backend
- Start the React frontend
- Run both services in parallel from a single entry point

The app will be available at:
```
http://localhost:5173
```

**Note:**
This workflow is intended for local development and manual exploration.
Automated testing and CI workflows use dedicated scripts and isolated environments.

---

### Alternative: Run backend and frontend separately

If you prefer to run each service manually:

**Backend**
```
cd server
node --env-file=config.env server
```

**Frontend**
```
cd client
npm run dev
```

### Related workflows
- **Run backend tests**: `cd server && npm test`
- **Run frontend tests**: `cd client && npm test`
- **Run E2E tests** (Docker required):
```
npm run test:e2e
```

## 💡 Usage Guide
- Click **Add Item** to open the modal form and create a new entry.
- Fill in the item name, and optionally, the amount and/or any notes.
- Use the toggle switch to **cross off** items as you shop.
- Click **Edit** on any item to modify it from within a modal.
- Click **Delete** to permanently remove an item.
- Crossed-off items automatically move to a separate list, beneath the active list.
- Use **Login / Register / Logout** from the navbar to manage your session.

## 🎯 Why I Created This Project
This project demonstrates:
- Professional QA thinking applied across the full test pyramid
- Automated testing of functional, security-related, and regression scenarios
- CI-driven quality gates with reliable environment orchestration
- Testable system design and clean separation of concerns
- Full-stack development using modern tooling (frontend and backend)
- Secure authentication and protected API integration

It forms part of my transition into QA and software engineering, showcasing not just functionality but also software design thinking and test-aware development.

---

## 📂 Key Areas of Interest

- [`/server`](./server/) – Express backend + API tests
- [`/client`](./client/) – React frontend + UI tests
- [`/e2e`](./e2e/) – Playwright E2E tests, specs, and CI setup

---

> **Positioning note:**  
> This project was intentionally designed to showcase **QA automation and testing strategy** skills, while remaining a complete, production-style application suitable for full-stack development roles.

## 📄 License
MIT License - open for learning, modification, and contribution.