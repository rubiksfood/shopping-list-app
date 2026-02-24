# test-process-backend.md  
## Shopping List MERN – Backend Test Process  
Author: **Joshua Pearson**  
Last Updated: 2025-12-10  

---

# 0. Introduction

This document describes the **backend test process** for the MERN Shopping List app, following the ISTQB Foundation Level structure of test activities:

1. Test Planning  
2. Test Analysis  
3. Test Design  
4. Test Implementation  
5. Test Execution  
6. Test Completion  

The backend includes:  
- Authentication routes (`/auth/register`, `/auth/login`, `/auth/me`)  
- Shopping item CRUD routes (`/shopItem`)  
- JWT authentication middleware  
- MongoDB interactions  

This document provides a professional, structured QA perspective designed for recruiters & QA team workflows.

---

# 1. Test Planning (Backend)

## 1.1 Scope

### **In Scope**
- Behaviour of backend routes (auth + shopItem)
- JWT-based authentication & authorization
- MongoDB interactions, including:
  - Correct CRUD behaviour
  - User-specific data isolation
- Functional testing, negative testing, and error-handling paths
- Automated testing using Jest + Supertest
- Using a dedicated MongoDB test database

### **Out of Scope (this iteration)**
- Performance/load testing  
- Non-functional requirements  
- E2E tests
- UI behaviour

---

## 1.2 Objectives

Backend testing aims to:

- Validate core backend functionality before integrating with frontend or E2E workflows.
- Ensure correct handling of valid and invalid inputs.
- Confirm authorization logic prevents cross-user data access.
- Provide a reliable automated regression suite.
- Demonstrate ISTQB-aligned planning, design, and analysis.

---

## 1.3 Test Strategy (High Level)

### Test Levels
| Level                 | Purpose                                           | Tools            |
|-----------------------|---------------------------------------------------|------------------|
| Unit                  | Validate isolated authentication middleware       | Jest             |
| Integration           | Validate full route behaviour: Express + DB + JWT | Jest + Supertest |
| System (Backend-only) | Validate backend as a standalone system           | Jest + Supertest |

**Unit tests**:  
- JWT middleware input/output correctness  

**Integration tests**:  
- `/auth` and `/shopItem` end-to-end logic  
- MongoDB operations  
- JWT generation/verification  

---

### Test Types

| Type                                | Description                                   |
|-------------------------------------|-----------------------------------------------|
| Functional testing                  | Expected behaviour under valid/invalid inputs |
| Security-related functional testing | JWT, authorization, user ID isolation         |
| Negative testing                    | Missing data, malformed requests              |
| Error-handling testing              | DB errors, invalid ObjectIds                  |

---

## 1.4 Test Environment

### Environment Components
- Node.js (ESM mode)
- Express.js application exported from `app.js`
- MongoDB Atlas Test Database: `shopping-list-test`
- Jest test runner
- Supertest HTTP testing library

### Environment Variables
Located in `config.test.env`:
- `ATLAS_URI` → points to MongoDB cluster  
- `JWT_SECRET` → used for signing tokens  
- `NODE_ENV=test` → ensures backend uses test DB  

### Database State
- Collections cleared before each test (`beforeEach`)  
- Ensures deterministic, isolated test conditions  

---

## 1.5 Entry & Exit Criteria

### Entry Criteria
- Backend routes implemented and functioning
- Test environment configured
- MongoDB test DB accessible
- Jest + Supertest smoke test runs successfully

### **Exit Criteria**
- All planned backend test cases implemented + passing
- No open high severity defects in backend
- All tests run in local + CI without failures
- Documentation (i.e. this file) updated

---

## 1.6 Risks & Mitigations

| Risk                            | Impact                            | Mitigation                                             |
|---------------------------------|-----------------------------------|--------------------------------------------------------|
| ESM/Jest config issues          | Tests fail or won’t run           | Use minimal config; document expected settings         |
| MongoDB latency                 | Slower tests; timeouts            | Keep DB operations minimal; increase timeout if needed |
| Incorrect cleanup between tests | Flaky tests                       | Use consistent `beforeEach` cleanup                    |
| JWT time-based issues           | Token expiry logic fails in tests | Stub expiration or extend token lifespan for testing   |

---

# 2. Test Analysis (Backend)

Test Analysis identifies **test conditions** - what must be tested based on requirements, code, and expected behaviour.

---

## 2.1 Sources for Test Conditions
- Backend API description (README.md)
- Express routes and controllers
- JWT middleware implementation
- MongoDB schema for shop items
- Implicit security requirements:
  - Users must not access each other’s data.
  - Missing authorization must result in 401.

---

## 2.2 Identified Test Conditions

### **Authentication**
- TCON-AUTH-REG-01: Register with valid credentials  
- TCON-AUTH-REG-02: Register with missing fields  
- TCON-AUTH-REG-03: Register with duplicate email  
- TCON-AUTH-LOG-01: Login with valid credentials  
- TCON-AUTH-LOG-02: Login with wrong password  
- TCON-AUTH-LOG-03: Login with unknown email  
- TCON-AUTH-LOG-04: Login fails with missing fields  
- TCON-AUTH-ME-01: `/auth/me` with valid token  
- TCON-AUTH-ME-02: `/auth/me` with missing/invalid token

Todo (once implemented in backend):  
- TCON-AUTH-REG-04: Register with invalid password length  

### **Authorization**
- TCON-AUTHZ-MW-01: Missing Authorization header  
- TCON-AUTHZ-MW-02: Wrong header format  
- TCON-AUTHZ-MW-03: Invalid JWT  
- TCON-AUTHZ-MW-04: Valid JWT → correct `req.userId`  

### **CRUD (Shop Items)**
- TCON-ITEM-LIST-01: List when no items exist  
- TCON-ITEM-LIST-02: List only user’s items  
- TCON-ITEM-CREATE-01: Create valid item  
- TCON-ITEM-CREATE-02: Create with invalid or missing fields  
- TCON-ITEM-GET-01: Get own item  
- TCON-ITEM-GET-02: Get non-existent item  
- TCON-ITEM-GET-03: Get another user’s item  
- TCON-ITEM-UPDATE-01: Update own item  
- TCON-ITEM-UPDATE-02: Update non-existent item  
- TCON-ITEM-UPDATE-03: Update another user’s item  
- TCON-ITEM-DELETE-01: Delete own item  
- TCON-ITEM-DELETE-02: Delete non-existent item  
- TCON-ITEM-DELETE-03: Delete another user’s item  

---

# 3. Test Design (Backend)

Test Design converts conditions into **formal test cases**, inputs, and expected results using ISTQB techniques.

---

## 3.1 Test Design Techniques Used

| Technique                     | Example Application                                |
|-------------------------------|----------------------------------------------------|
| Equivalence Partitioning (EP) | Valid vs invalid fields in /auth and /shopItem     |
| Boundary Value Analysis (BVA) | Planned password length & numeric `amount` checks  |
| Decision Table Testing (DT)   | Email/password validity combinations for login     |
| State Transition Testing (ST) | JWT lifecycle, item `isChecked` toggling           |
| Error Guessing (EG)*          | Malformed JWT, incorrect ObjectIds, missing fields |

---

## 3.2 Conversion of Test Conditions into Test Cases

### **Authentication Examples**
- Valid registration -> expect 201  
- Duplicate email -> expect 409  
- Wrong password -> 401  
- Missing fields -> 400  
- `/auth/me` w/out token -> 401  

### **Authorization Examples**
- No header -> 401  
- `Token abc` instead of `Bearer <jwt>` -> 401  
- Invalid token -> 401  
- Valid token -> route executes; `req.userId` populated  

### **CRUD Examples**
- Get empty list -> `[]`  
- Create item -> returns insertedId  
- Update item -> updated fields returned  
- User A accessing User B's item -> 404  
- Delete item -> `deletedCount: 1`  

---

## 3.3 Traceability

Mapping between:

- Test conditions → Test cases → Test automation files

Example:

| Test Condition      | Test Cases     | File                      |
|---------------------|----------------|---------------------------|
| TCON-AUTH-LOG-01    | AUTH-LOG-TC-01 | `auth.routes.test.js`     |
| TCON-AUTHZ-MW-03    | AUTHZ-MW-TC-03 | `auth.middleware.test.js` |
| TCON-ITEM-UPDATE-03 | ITEM-UPD-TC-03 | `shopItem.routes.test.js` |

---

# 4. Test Implementation (Backend)

Test Implementation produces the actual **testware**, including scripts, configs, and utilities.

---

## 4.1 Backend Testware Produced

### **Project Structure**
```
server/
  app.js
  server.js
  jest.config.cjs
  db/
    connection.js
  tests/
    setup.js
    auth.routes.test.js
    auth.middleware.test.js
    shopItem.routes.test.js
```

### **Key Implementation Elements**
- `app.js` exports Express app without `.listen()`
- `server.js` only starts the HTTP server
- `tests/setup.js`:
  - Imports MongoDB connection
  - Clears DB before each test
- Jest config for ESM tests
- Test scripts added to `package.json`:
  ```json
  "test": "cross-env NODE_ENV=test node --env-file=config.test.env --experimental-vm-modules ./node_modules/jest/bin/jest.js --runInBand"
  ```

## 4.2 Test Data Strategy

- DB cleared between tests (beforeEach)
- Tests create users and items dynamically per test case
- No persistent fixtures → avoids cross-test pollution
- Token creation:
  - Either generated via /auth/login
  - Or via jwt.sign() in middleware unit tests

# 5. Test Execution (Backend)

Execution involves running tests, capturing results, logging failures, and triaging issues.

## 5.1 Running Tests
```
cd server
npm test
```

### What Happens During Execution:

- Jest loads config
- MongoDB connects to shopping-list-test
- Before each test → all collections cleared
- Supertest runs HTTP calls directly against app.js

## 5.2 Logging & Observing Results

Jest output includes:
- Test suite summary
- Individual test results
- Clear error messages on failures
- Stack traces for debugging

Failures are classified as:
- **Test defect** – bad expectation or setup
- **Product defect** – real backend bug
- **Environment defect** – DB connection, env vars, misconfigured test files

## 5.3 Defect Handling Process

Defects are:
1. Reproduced manually via Postman or cURL
2. Logged in GitHub Issues with:
    - Steps to reproduce
    - Expected vs actual
    - Related test case
3. Fixed → tests re-run → regression test added if needed
4. Issue closed

# 6. Test Completion (Backend)

Completion evaluates whether goals were met and prepares testware for maintenance.

## 6.1 Exit Criteria Evaluation

- ✓ All planned test cases implemented
- ✓ All tests pass in local environment
- ✓ No open high-severity backend defects
- ✓ Regression coverage established
- ✓ Documentation updated

## 6.2 Coverage Assessment
### Functional Coverage

- /auth routes fully covered
- /shopItem CRUD fully covered
- Authentication middleware covered

### Risk Coverage

- Data isolation verified
- Token misuse scenarios covered
- Invalid ObjectId handling tested

### Gaps / Future Testing
- Add BVA for password and item validation, once added
- Add performance testing if needed

## 6.3 Testware Maintenance Plan

Ongoing testing steps:
- Update test cases when backend logic changes
- Add new tests for new features (shared lists, categories, sorting, etc.)
- Keep DB cleanup logic consistent
- Maintain CI pipeline to prevent regressions

## 6.4 Lessons Learned

- Documenting test conditions before writing tests improves clarity
- Separating app.js from server.js greatly simplifies automated testing
- Using a real test database gives high-confidence results
- Automating error-handling scenarios (invalid token, missing fields) catches subtle bugs early
- Structured ISTQB approach makes the work easy to communicate to employers