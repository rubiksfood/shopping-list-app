# testing-backend.md  
## Shopping List MERN – Backend Test Specification  
Author: **Joshua Pearson**  
Last Updated: 2025-12-10  

---

## 1. Overview

This document describes the **backend test specification** for the MERN Shopping List app.

It complements `TEST_PROCESS_BACKEND.md` by listing:

- Test **scope**
- Test **methodology**
- Concrete **test suites** and **test cases**
- Traceability from **test conditions → test cases → automated tests**

The backend under test includes:

- `/auth` routes (`/auth/register`, `/auth/login`, `/auth/me`)
- `/shopItem` routes (GET, POST, PATCH, DELETE)
- JWT authentication middleware
- MongoDB persistence and per-user data isolation

Automated tests are implemented with **Jest + Supertest** against a dedicated MongoDB **test database** (`shopping_list_test`).

---

## 2. Scope & Objectives

### 2.1 In Scope

- Functional behaviour of backend routes:
  - Authentication
  - Authorization
  - CRUD for shopping items
- Security-related functional behaviour:
  - JWT validation
  - Access control
  - Per-user data isolation
- Error handling and robustness:
  - Missing / invalid inputs
  - Invalid IDs
  - Missing or malformed Authorization headers

### 2.2 Out of Scope

- Frontend behaviour (React, routing, UI)
- End-to-end UI tests (Cypress/Playwright)
- Performance / load testing
- Non-functional requirements (usability, UX, etc.)

### 2.3 Objectives

- Ensure the backend behaves correctly for **valid** and **invalid** requests.
- Verify that **users cannot access or modify other users’ data**.
- Provide a **repeatable, automated regression suite** for backend changes.
- Demonstrate **ISTQB-aligned test design** and documentation.

---

## 3. Test Methodology

### 3.1 Test Levels

- **Unit**  
  - JWT authentication middleware (behaviour with various headers/tokens)

- **Integration**  
  - `/auth` routes (registration, login, current user)
  - `/shopItem` routes (CRUD operations)
  - MongoDB operations using a real test database
  - Interaction between Express, middleware, and DB

### 3.2 Test Types

- **Functional testing** – business logic and API behaviour  
- **Security-related functional testing** – auth, access control  
- **Negative testing** – invalid/missing data, malformed requests  
- **Error handling testing** – invalid ObjectId, missing resources

### 3.3 Test Design Techniques

| Technique                         | Usage                                                                   |
|-----------------------------------|-------------------------------------------------------------------------|
| **Equivalence Partitioning (EP)** | Valid vs invalid inputs (email, password, fields, headers)              |
| **Boundary Value Analysis (BVA)** | Planned for password length and numeric fields (future validation)      |
| **Decision Table Testing (DT)**   | Combinations of valid/invalid email and password on login               |
| **State Transition Testing (ST)** | Item state (`isChecked`), token validity states (valid/invalid/expired) |
| **Error Guessing (EG)**           | Malformed JWT, missing headers, wrong IDs, cross-user access            |

---

## 4. Test Environment

- **Node.js** in ESM mode
- **Express** backend app (`app.js`)
- **MongoDB Atlas** test database (`shopping_list_test`)
- **Jest** test runner
- **Supertest** for HTTP request simulation

**Test command (from `/server`):**

```bash
npm test
```
(Internally runs Jest with appropriate Node/Jest flags and loads `config.test.env`.)

---

# 5. Test Suites & Test Cases

This section lists the formal test cases for the backend, grouped into suites.

Test case IDs are designed to be referenced in code comments, issues, and PRs.

## 5.1 Authentication Suite – `/auth`

Covers:
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

### 5.1.1 Test Conditions

- TCON-AUTH-REG-01: Valid registration
- TCON-AUTH-REG-02: Missing fields in registration
- TCON-AUTH-REG-03: Duplicate registration
- TCON-AUTH-LOG-01: Valid login
- TCON-AUTH-LOG-02: Login with wrong password
- TCON-AUTH-LOG-03: Login with unknown email
- TCON-AUTH-LOG-04: Login fails with missing fields
- TCON-AUTH-ME-01: /auth/me with valid token
- TCON-AUTH-ME-02: /auth/me without token

Todo (once implemented in backend):  
- TCON-AUTH-REG-04: Register with invalid password length  

### 5.1.2 Test Cases – Registration

| TC ID           | Objective                              | Precondition             | Input                                                 | Expected Result                                         | Technique |
| --------------- | -------------------------------------- | --------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------- | --------- |
| AUTH-REG-TC-01  | Register with valid email & password   | Email not registered     | `{"email":"test@example.com","password":"pass123"}` | `201 Created`, body `{ "message": "User created" }`     | EP        |
| AUTH-REG-TC-02  | Registration fails with missing fields | None                     | `{}`, or missing `email` or `password`               | `400 Bad Request`, validation error message             | EP, EG    |
| AUTH-REG-TC-03  | Duplicate registration is rejected     | Email already registered | Register once, then repeat same email/password       | Second attempt: `409 Conflict`, `"User already exists"` | DT, EG    |
| AUTH-REG-TC-04* | Password boundary validation (future)  | Password rules defined (e.g. min len)   | Min-length vs below-min-length passwords              | Min → success, below-min → `4xx`                        | BVA       |
* Planned once backend enforces password length/format.

### 5.1.3 Test Cases – Login

| TC ID          | Objective                             | Precondition         | Input                                                 | Expected Result                             | Technique |
| -------------- | ------------------------------------- | -------------------- | ----------------------------------------------------- | ------------------------------------------- | --------- |
| AUTH-LOG-TC-01 | Login succeeds with valid credentials | User registered      | `{"email":"login@example.com","password":"Pass1234"}` | `200 OK`, body contains `token` string      | EP, DT    |
| AUTH-LOG-TC-02 | Login fails with wrong password       | User registered      | Same email, different password                        | `401 Unauthorized`, `"Invalid credentials"` | DT, EG    |
| AUTH-LOG-TC-03 | Login fails for unknown email         | Email not registered | Email not in DB                                       | `401 Unauthorized`, `"Invalid credentials"` | EP, EG    |
| AUTH-LOG-TC-04 | Login fails with missing fields       | None                 | Empty body or missing password                        | `4xx` error, appropriate message            | EP, EG    |

### 5.1.4 Test Cases - Return user info via /auth/me

| TC ID         | Objective                              | Precondition    | Input                                               | Expected Result                        | Technique |
| ------------- | -------------------------------------- | --------------- | --------------------------------------------------- | -------------------------------------- |---------- |
| AUTH-ME-TC-01 | GET /auth/me succeeds with valid token | User registered | `{"email":"me@example.com","password":"secret123"}` | `200 OK`, body contains `token` string | EP, DT    |
| AUTH-ME-TC-02 | GET /auth/me fails without valid token | None            | Same email, different password                      | `401 Unauthorized`                     | DT, EG    |

## 5.2 Authorization Suite – JWT Middleware

Covers the custom middleware that validates Authorization headers and tokens.

### 5.2.1 Test Conditions

- TCON-AUTHZ-MW-01: No Authorization header
- TCON-AUTHZ-MW-02: Wrong header scheme (not “Bearer”)
- TCON-AUTHZ-MW-03: Invalid token
- TCON-AUTHZ-MW-04: Valid token populates req.userId

### 5.2.2 Test Cases – Middleware

| TC ID          | Objective                                       | Precondition | Input / Setup                                                         | Expected Result                                                               | Technique |
| -------------- | ----------------------------------------------- | ------------ | --------------------------------------------------------------------- | ----------------------------------------------------------------------------- | --------- |
| AUTHZ-MW-TC-01 | Missing `Authorization` header leads to 401     | None         | Call protected test route without header                              | `401 Unauthorized`, `{ "message": "Authorization header missing" }`           | EP, EG    |
| AUTHZ-MW-TC-02 | Wrong scheme (“Token” instead of “Bearer”)      | None         | Header: `Authorization: Token abc`                                    | `401 Unauthorized`, `{ "message": "Invalid Authorization header" }`           | DT        |
| AUTHZ-MW-TC-03 | Invalid token is rejected                       | None         | Header: `Authorization: Bearer invalid.token`                         | `401 Unauthorized`, `{ "message": "Invalid or expired token" }`               | EG        |
| AUTHZ-MW-TC-04 | Valid token allows access and sets `req.userId` | None         | Generate JWT with `{ userId: "12345" }`, send `Authorization: Bearer` | `200 OK` response from test route, response body includes `"userId": "12345"` | ST, EP    |

## 5.3 CRUD Suite – `/shopItem`

Covers:
- GET /shopItem
- GET /shopItem/:id
- POST /shopItem
- PATCH /shopItem/:id
- DELETE /shopItem/:id

### 5.3.1 Test Conditions

- List:
    - TCON-ITEM-LIST-01: Empty list when no items
    - TCON-ITEM-LIST-02: List returns only the current user’s items
- Create:
    - TCON-ITEM-CREATE-01: Valid create item
    - TCON-ITEM-CREATE-02: Invalid/missing fields
- Get by ID:
    - TCON-ITEM-GET-01: Get own item by valid ID
    - TCON-ITEM-GET-02: Get non-existent item
    - TCON-ITEM-GET-03: Get another user’s item
- Update:
    - TCON-ITEM-UPDATE-01: Update own item
    - TCON-ITEM-UPDATE-02: Update non-existent item
    - TCON-ITEM-UPDATE-03: Update another user’s item
- Delete:
    - TCON-ITEM-DELETE-01: Delete own item
    - TCON-ITEM-DELETE-02: Delete non-existent item
    - TCON-ITEM-DELETE-03: Delete another user’s item

### 5.3.2 Test Cases – List & Create

| TC ID           | Objective                                       | Precondition         | Input / Setup                                                   | Expected Result                                                   | Technique |
| --------------- | ----------------------------------------------- | -------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------- | --------- |
| ITEM-LIST-TC-01 | Empty list returned when user has no items      | Authenticated user   | `GET /shopItem`                                                 | `200 OK`, response body is `[]`                                   | EP        |
| ITEM-LIST-TC-02 | Only current user’s items are returned          | Two users with items | Create items for User A & B; `GET /shopItem` as User A          | Only items belonging to User A are in response                    | DT        |
| ITEM-CR-TC-01   | Item creation with valid data succeeds          | Authenticated user   | `POST /shopItem` with full body: name, amount, notes, isChecked | `201 Created`, body includes `{ acknowledged: true, insertedId }` | EP        |
| ITEM-CR-TC-02*  | Item creation with missing required field fails | Authenticated user   | Missing `name` or other required field                          | `4xx` error once validation added                                 | EP, EG    |
(* Planned once backend validation is implemented.)

### 5.3.3 Test Cases – Get by ID

| TC ID          | Objective                                     | Precondition                 | Input / Setup                                                          | Expected Result                  | Technique |
| -------------- | --------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------- | -------------------------------- | --------- |
| ITEM-GET-TC-01 | Get existing item owned by current user       | Item belongs to current user | Create item, then `GET /shopItem/:id` for its ID                       | `200 OK`, item object returned   | EP        |
| ITEM-GET-TC-02 | Get non-existent item returns 404             | None                         | `GET /shopItem/<random valid ObjectId>`                                | `404 Not Found`                  | EG        |
| ITEM-GET-TC-03 | Get other user’s item returns 404 (isolation) | Item owned by different user | Login as User A, request `GET /shopItem/:id_B` where item belongs to B | `404 Not Found`, no data leakage | EG, SEC   |

### 5.3.4 Test Cases – Update

| TC ID          | Objective                          | Precondition                   | Input / Setup                                                                       | Expected Result                               | Technique |
| -------------- | ---------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------- | --------------------------------------------- | --------- |
| ITEM-UPD-TC-01 | Update own item’s `isChecked` flag | Item belongs to current user   | Create item with `isChecked: false`, then `PATCH /shopItem/:id` `{isChecked: true}` | `200 OK`, returned item has `isChecked: true` | ST        |
| ITEM-UPD-TC-02 | Update non-existent item           | None                           | `PATCH /shopItem/<random id>` with any body                                         | `404 Not Found`, no item updated              | EG        |
| ITEM-UPD-TC-03 | Cannot update another user’s item  | Item belongs to different user | Login as User A, `PATCH /shopItem/:id_B` where item belongs to B                    | `404 Not Found`, unchanged item for User B    | SEC, EG   |

### 5.3.5 Test Cases – Delete

| TC ID          | Objective                         | Precondition                   | Input / Setup                                                     | Expected Result                                        | Technique |
| -------------- | --------------------------------- | ------------------------------ | ----------------------------------------------------------------- | ------------------------------------------------------ | --------- |
| ITEM-DEL-TC-01 | Delete own existing item          | Item belongs to current user   | Create item, then `DELETE /shopItem/:id`                          | `200 OK`, body `{ deletedCount: 1 }`                   | ST        |
| ITEM-DEL-TC-02 | Delete non-existent item          | None                           | `DELETE /shopItem/<random id>`                                    | `404 Not Found`, `deletedCount` remains 0 (or similar) | EG        |
| ITEM-DEL-TC-03 | Cannot delete another user’s item | Item belongs to different user | Login as User A, `DELETE /shopItem/:id_B` where item belongs to B | `404 Not Found`, item still present for User B         | SEC, EG   |

---

# 6. Traceability Matrix

Mapping from test conditions → test cases → automated test files.

| Test Condition          | Test Cases          | Automated File                  |
| ----------------------- | ------------------- | ------------------------------- |
| TCON-AUTH-REG-01..03    | AUTH-REG-TC-01..03  | `tests/auth.routes.test.js`     |
| TCON-AUTH-LOG-01..03    | AUTH-LOG-TC-01..03  | `tests/auth.routes.test.js`     |
| TCON-AUTH-ME-01..03     | AUTH-ME-TC-01..03   | `tests/auth.routes.test.js`     |
| TCON-AUTHZ-MW-01..04    | AUTHZ-MW-TC-01..04  | `tests/auth.middleware.test.js` |
| TCON-ITEM-LIST-01..02   | ITEM-LIST-TC-01..02 | `tests/shopItem.routes.test.js` |
| TCON-ITEM-CREATE-01..02 | ITEM-CR-TC-01..02   | `tests/shopItem.routes.test.js` |
| TCON-ITEM-GET-01..03    | ITEM-GET-TC-01..03  | `tests/shopItem.routes.test.js` |
| TCON-ITEM-UPDATE-01..03 | ITEM-UPD-TC-01..03  | `tests/shopItem.routes.test.js` |
| TCON-ITEM-DELETE-01..03 | ITEM-DEL-TC-01..03  | `tests/shopItem.routes.test.js` |

---

# 7. Test Execution

## 7.1 How to Run Backend Tests

From the server directory:
```bash
npm test
```

This command will:
- Load environment variables (including ATLAS_URI, JWT_SECRET, NODE_ENV=test)
- Connect to MongoDB test database
- Run all *.test.js files beneath /tests/
- Output a summary of passed/failed test cases

## 7.2 Interpreting Results

- Green (pass): All expectations met for the test case.
- Red (fail): Investigate:
    - Is the test written correctly?
    - Does the actual behaviour differ from the expected behaviour?
    - Is the environment misconfigured (e.g., DB, env vars)?

---

# 8. Maintenance & Future Improvements

Planned enhancements:
- Add full input validation for item creation and update (e.g., required fields, numeric limits).
- Extend test cases using Boundary Value Analysis (BVA) for password in `register` and the "name" field in `ShopItem`, once validation exists.
- Introduce additional security tests (e.g., rate limiting, brute-force login protection) in a later phase.
- Expand tests to cover any new routes or features (e.g. shared lists, item categories, sorting, filtering).

Test cases in this document should be updated whenever:
- New backend features are added.
- Existing routes are modified.
- Requirements or assumptions change.