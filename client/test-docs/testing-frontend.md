# testing-frontend.md  
## Shopping List MERN – Frontend Test Specification  
Author: **Joshua Pearson**  
Last Updated: 2025-12-16  

---

# 1. Overview  

This document describes the **frontend test specification** for the Shopping List MERN application.  
It complements `TEST_PROCESS_FRONTEND.md` by defining:

- Test **scope**
- Test **methodology**
- Detailed **test conditions**
- Formal **test cases**
- End-to-end traceability from **conditions → cases → automated test files**

Frontend testing includes:

- React components (UI)
- React pages (container components)
- React Context (AuthContext)
- Routing & ProtectedRoute
- Custom hooks (useShopItems)
- Form validation and UI state transitions
- Mocked API interactions using MSW

All tests use **Vitest + React Testing Library (RTL)** in a **JSDOM** environment.

---

# 2. Scope & Objectives

## 2.1 In Scope

- UI behaviour of React components
- Form validation (login/register)
- Rendering and updating item lists
- React Context logic (AuthContext)
- Routing behaviours (ProtectedRoute redirects)
- Component integration flows
- Error-handling behaviours
- API interactions through mocked fetch/MSW

## 2.2 Out of Scope

- Backend API functionality (covered separately)
- End-to-end UI testing (Cypress?)
- Performance, accessibility, and cross-browser testing

## 2.3 Objectives

- Validate correct UI functionality under normal and error conditions.
- Ensure navigation, routing, and redirects function as intended.
- Confirm state updates propagate correctly across components and context.
- Prevent UI regressions by maintaining an automated test suite.
- Demonstrate ISTQB-aligned testing methodology.

---

# 3. Test Methodology

## 3.1 Test Levels

| Level                  | Description                         | Tools                       |
|------------------------|-------------------------------------|-----------------------------|
| Unit                   | Component-level testing             | Vitest + RTL                |
| Integration            | UI + Context + Routing              | Vitest + RTL + MemoryRouter |
| System (frontend-only) | Full page flows with mocked backend | Vitest + RTL + MSW          |

## 3.2 Test Types

| Type                                    | Description                                       |
|-----------------------------------------|---------------------------------------------------|
| **Functional testing**                  | UI behaviour, correctness of rendering and events |
| **Negative testing**                    | Incorrect inputs, failed API responses            |
| **State-based testing**                 | Auth state, loading state, item toggling          |
| **Error-handling testing**              | Validation, API errors, unauthorized responses    |
| **Security-related functional testing** | Access control via ProtectedRoute                 |
| **Regression testing**                  | Executed automatically via Vitest                 |

## 3.3 Test Design Techniques

| Technique                     | Applied To                                  |
|-------------------------------|---------------------------------------------|
| Equivalence Partitioning (EP) | Valid/invalid form data                     |
| Boundary Value Analysis (BVA) | Planned for stricter validation later       |
| Decision Table Testing (DT)   | Login email/password combinations           |
| State Transition Testing (ST) | Auth login/logout → UI state changes        |
| Error Guessing (EG)           | API failure, 401 unauthorized, broken input |
| Use Case Testing              | Login → navigate → CRUD → logout            |

---

# 4. Test Environment

- **React Testing Library**
- **Vitest** with Vite config
- **JSDOM** virtual browser
- **Mock Service Worker (MSW)** for API mocking
- **MemoryRouter** for routing simulation
- **AuthProvider** wrapper for context-dependent components

Command:

```bash
cd client
npm test
```

---

# 5. Test Suites & Test Cases

Below are the detailed frontend test suites.

## 5.1 Authentication UI Suite (Login & Register Pages)

### 5.1.1 Test Conditions

- TCON-AUTHUI-INPUT-01:  Required input fields are enforced via HTML constraints  
- TCON-AUTHUI-INPUT-02:  Email format is constrained at input level  
- TCON-AUTHUI-SUBMIT-01: Valid login submission is processed correctly  
- TCON-AUTHUI-SUBMIT-02: Valid registration submission is processed correctly  
- TCON-AUTHUI-ERROR-01:  Authentication-related server errors are handled and shown to the user  
- TCON-AUTHUI-NAV-01:    Successful login triggers correct post-login navigation  
- TCON-AUTHUI-NAV-02:    Successful registration triggers navigation to the login page  

**Note**: Client-side validation is implemented using HTML constraint validation (required, type="email").  
The UI does not display custom validation messages; errors are shown only for server responses (e.g. invalid credentials).  

### 5.1.2 Test Cases – LoginPage

| TC ID              | Objective                                            | Input / Setup                        | Expected Result                                                | Technique|
|--------------------|------------------------------------------------------|--------------------------------------|----------------------------------------------------------------|----------|
| AUTHUI-LOGIN-TC-01 | Required fields are enforced via HTML constraints    | Render page                          | Email + Password inputs have `required` attribute              | EP, EG   |
| AUTHUI-LOGIN-TC-02 | Invalid email formats are constrained at input level | Render page                          | Email input uses `type="email"` (HTML constraint validation)   | EP       |
| AUTHUI-LOGIN-TC-03 | Valid credentials trigger login flow & persist token | Enter valid email + password, submit | Token stored in localStorage & authenticated state established | EP, UC   |
| AUTHUI-LOGIN-TC-04 | Invalid credentials trigger UI error message         | Enter valid email + wrong password   | Error text rendered “Invalid credentials”, no token persisted  | EG       |
| AUTHUI-LOGIN-TC-05 | Successful login redirects user to `/` route         | Valid login (MSW returns token)      | User is navigated to `/` route & next view is rendered         | ST, UC   |

### 5.1.3 Test Cases – RegisterPage

| TC ID            | Objective                                             | Input / Setup                        | Expected Result                                                 | Technique|
|------------------|-------------------------------------------------------|--------------------------------------|-----------------------------------------------------------------|----------|
| AUTHUI-REG-TC-01 | Required fields are enforced via HTML constraints     | Render page                          | Email + Password inputs have `required` attribute               | EP, EG   |
| AUTHUI-REG-TC-02 | Valid registration triggers registration flow         | Enter valid email + password, submit | User is registered (MSW 201) & navigated to `/login`            | EP, UC   |
| AUTHUI-REG-TC-03 | Duplicate email shows a user-visible error message    | Register existing email              | Error text rendered “User already exists”, no token persisted   | DT, EG   |
| AUTHUI-REG-TC-04 | Successful registration redirects user to login route | Valid registration                   | User is navigated to the `/login` route & next view is rendered | ST, UC   |

## 5.2 Navigation & Routing Suite (ProtectedRoute / Navbar)

### 5.2.1 Test Conditions

- TCON-ROUTE-AUTH-01: Unauthenticated user redirected
- TCON-ROUTE-AUTH-02: Authenticated user allowed access
- TCON-NAV-UI-01: Navbar renders authentication-dependent links
- TCON-NAV-ACT-01: Logout clears persisted authentication state
- TCON-NAV-ACT-02: Logout triggers navigation to Login route

### 5.2.2 Test Cases – ProtectedRoute

| TC ID            | Objective                                 | Setup                     | Expected Result             | Technique |
| ---------------- | ----------------------------------------- | ------------------------- | --------------------------- | --------- |
| ROUTE-PROT-TC-01 | Redirect unauthenticated user to `/login` | AuthContext: user = null  | Gets redirected             | SEC, ST   |
| ROUTE-PROT-TC-02 | Allow access when authenticated           | AuthContext: user present | Child component is rendered | EP, ST    |

### 5.2.3 Test Cases – Navbar

| TC ID     | Objective                                             | Setup                            | Expected Result                                                   | Technique |
| --------- | ----------------------------------------------------- | -------------------------------- | ----------------------------------------------------------------- | --------- |
| NAV-TC-01 | Navbar shows Login/Register when unauthenticated      | No token in storage              | Login and Register links visible; Logout not rendered             | ST        |
| NAV-TC-02 | Navbar shows Logout and user email when authenticated | Valid token in storage           | Logout button visible; user email rendered; Login/Register hidden | ST        |
| NAV-TC-03 | Clicking Logout clears authentication state           | Authenticated user               | Token removed from storage; Login/Register links rendered         | ST, EG    |
| NAV-TC-04 | Logout navigates user to Login page                   | Authenticated user; click Logout | Login page rendered after action                                  | UC        |

## 5.3 Component Suite (ShoppingList, ToggleSwitch, ShopItemForm)

### 5.3.1 Test Conditions

- TCON-COMP-LIST-01: Item list renders from hook-provided `items`
- TCON-COMP-LIST-02: Empty list is handled (no empty-state message is expected)
- TCON-COMP-ITEM-01: Toggling an item calls the hook handler `toggleCheck` with correct arguments
- TCON-COMP-ITEM-02: Deleting an item calls the hook handler `deleteItem` with correct ID
- TCON-COMP-FORM-01: Form enforces required fields via HTML constraints validation (no custom error UI)
- TCON-COMP-FORM-02: Valid form submission calls `onSubmit` with correct payload

### 5.3.2 Test Cases – ShoppingList

| TC ID           | Objective                             | Setup                       | Expected Result                                | Technique |
| --------------- | ------------------------------------- | --------------------------- | ---------------------------------------------- | --------- |
| COMP-LIST-TC-01 | Renders list from hook-provided items | Hook returns items          | Item details are visible in the DOM            | EP        |
| COMP-LIST-TC-02 | Handles empty list without error      | Hook returns empty array    | No item rows are rendered                      | EP, EG    |
| COMP-LIST-TC-03 | Toggle item calls toggleCheck handler | Click toggle on item        | `toggleCheck` called with (itemId, !isChecked) | ST        |
| COMP-LIST-TC-04 | Delete item calls delete handler      | Click delete on item        | `deleteItem` called with correct ID            | UC        |


### 5.3.3 Test Cases – ShopItemForm

| TC ID           | Objective                                         | Setup                                 | Expected Result                                           | Technique |
| --------------- | ------------------------------------------------- | ------------------------------------- | --------------------------------------------------------- | --------- |
| COMP-FORM-TC-01 | Required name field enforced via HTML constraints | Render form; check required attribute | Name input has `required` attribute (no message expected) | EP, EG    |
| COMP-FORM-TC-02 | Valid input triggers submit callback with payload | Enter valid name, submit              | `onSubmit` called with correct payload                    | EP, UC    |


## 5.4 Context & Hook Suite (AuthContext & useShopItems)

### 5.4.1 Test Conditions

**AuthContext**
- TCON-AUTHCTX-01: login updates user state  
- TCON-AUTHCTX-02: logout clears user state  
- TCON-AUTHCTX-03: unauthorized API call resets state

**useShopItems**
- TCON-HOOK-ITEMS-01: fetch items on mount  
- TCON-HOOK-ITEMS-02: handle loading state  
- TCON-HOOK-ITEMS-03: handle API failures gracefully 
- TCON-HOOK-ITEMS-04: update item list after create/update/delete  

### 5.4.2 Test Cases – AuthContext

| TC ID          | Objective                | Setup           | Expected Result       | Technique |
| -------------- | ------------------------ | --------------- | --------------------- | --------- |
| AUTHCTX-TC-01  | Login updates auth state | login() called  | user object populated | ST        |
| AUTHCTX-TC-02  | Logout clears auth state | logout() called | user set to null      | ST        |
| AUTHCTX-TC-03  | 401 resets auth state    | Mock 401        | AuthContext resets    | EG        |

### 5.4.3 Test Cases – useShopItems

| TC ID            | Objective                            | Mock Setup              | Expected Result                                         | Technique |
| ---------------- | ------------------------------------ | ----------------------- | ------------------------------------------------------- | --------- |
| HOOK-ITEMS-TC-01 | Fetch items on hook mount            | Items returned          | `items` state contains array                            | EP        |
| HOOK-ITEMS-TC-02 | Handles loading state correctly      | Slow response simulated | `loading` === true, then `loading` === false            | ST        |
| HOOK-ITEMS-TC-03 | Handles API failures gracefully      | 500 or network error    | `loading` === false, item unchanged, call console.error | EG        |
| HOOK-ITEMS-TC-04 | Updates list on create/update/delete | Mocks for success       | `items` array updated accordingly                       | ST, UC    |

---

# 6. Traceability Matrix

## 6.1 Authentication UI (Login & Registration)

| Test Condition ID     | Test Case ID(s)                      | Description                                       | Automated Test File                                                     |
| --------------------- | ------------------------------------ | ------------------------------------------------- | ----------------------------------------------------------------------- |
| TCON-AUTHUI-INPUT-01  | AUTHUI-LOGIN-TC-01, AUTHUI-REG-TC-01 | Required fields enforced via HTML constraints     | `src/test/LoginPage.msw.test.jsx`, `src/test/RegisterPage.msw.test.jsx` |
| TCON-AUTHUI-INPUT-02  | AUTHUI-LOGIN-TC-02                   | Email format constrained at input level           | `src/test/LoginPage.msw.test.jsx`                                       |
| TCON-AUTHUI-SUBMIT-01 | AUTHUI-LOGIN-TC-03                   | Valid login submission processed correctly        | `src/test/LoginPage.msw.test.jsx`                                       |
| TCON-AUTHUI-SUBMIT-02 | AUTHUI-REG-TC-02                     | Valid registration submission processed correctly | `src/test/RegisterPage.msw.test.jsx`                                    |
| TCON-AUTHUI-ERR-01    | AUTHUI-LOGIN-TC-04, AUTHUI-REG-TC-03 | Auth-related server errors handled and shown      | `src/test/LoginPage.msw.test.jsx`, `src/test/RegisterPage.msw.test.jsx` |
| TCON-AUTHUI-NAV-01    | AUTHUI-LOGIN-TC-05                   | Successful login triggers post-login navigation   | `src/test/LoginPage.msw.test.jsx`                                       |
| TCON-AUTHUI-NAV-02    | AUTHUI-REG-TC-04                     | Successful registration navigates to login page   | `src/test/RegisterPage.msw.test.jsx`                                    |


## 6.2 Routing & Access Control

| Test Condition ID  | Test Case ID(s)  | Description                              | Automated Test File                |
| ------------------ | ---------------- | ---------------------------------------- | ---------------------------------- |
| TCON-ROUTE-AUTH-01 | ROUTE-PROT-TC-01 | Unauthenticated user redirected to login | `src/test/ProtectedRoute.test.jsx` |
| TCON-ROUTE-AUTH-02 | ROUTE-PROT-TC-02 | Authenticated user allowed access        | `src/test/ProtectedRoute.test.jsx` |

## 6.3 Authentication State Management (AuthContext)

| Test Condition ID | Test Case ID(s) | Description                        | Automated Test File             |
| ----------------- | --------------- | ---------------------------------- | ------------------------------- |
| TCON-AUTHCTX-01   | AUTHCTX-TC-01   | Login updates authentication state | `src/test/AuthContext.test.jsx` |
| TCON-AUTHCTX-02   | AUTHCTX-TC-02   | Logout clears authentication state | `src/test/AuthContext.test.jsx` |
| TCON-AUTHCTX-03   | AUTHCTX-TC-03   | Invalid token resets auth state    | `src/test/AuthContext.test.jsx` |

## 6.4 Navigation UI (Navbar)

| Test Condition ID | Test Case ID(s) | Description                                   | Automated Test File        |
| ----------------- | --------------- | --------------------------------------------- | -------------------------- |
| TCON-NAV-UI-01    | NAV-TC-01       | Navbar renders authentication-dependent links | `src/test/Navbar.test.jsx` |
| TCON-NAV-ACT-01   | NAV-TC-03       | Logout clears persisted authentication state  | `src/test/Navbar.test.jsx` |
| TCON-NAV-ACT-02   | NAV-TC-04       | Logout triggers navigation to Login route     | `src/test/Navbar.test.jsx` |

## 6.5 Component Suite (Shopping List & Form)

| Test Condition ID | Test Case ID(s) | Description                                | Automated Test File                  |
| ----------------- | --------------- | ------------------------------------------ | ------------------------------------ |
| TCON-COMP-LIST-01 | COMP-LIST-TC-01 | Item list renders from hook-provided items | `src/test/ShoppingListPage.test.jsx` |
| TCON-COMP-LIST-02 | COMP-LIST-TC-02 | Empty list handled without errors          | `src/test/ShoppingListPage.test.jsx` |
| TCON-COMP-ITEM-01 | COMP-LIST-TC-03 | Toggle item calls correct handler          | `src/test/ShoppingListPage.test.jsx` |
| TCON-COMP-ITEM-02 | COMP-LIST-TC-04 | Delete item calls delete handler           | `src/test/ShoppingListPage.test.jsx` |
| TCON-COMP-FORM-01 | COMP-FORM-TC-01 | Required form fields enforced via HTML     | `src/test/ShopItemForm.test.jsx`     |
| TCON-COMP-FORM-02 | COMP-FORM-TC-02 | Valid submission calls submit callback     | `src/test/ShopItemForm.test.jsx`     |

## 6.6 Custom Hook (useShopItems)

| Test Condition ID  | Test Case ID(s)  | Description                      | Automated Test File             |
| ------------------ | ---------------- | -------------------------------- | ------------------------------- |
| TCON-HOOK-ITEMS-01 | HOOK-ITEMS-TC-01 | Fetch items on hook mount        | `src/test/useShopItems.test.jsx` |
| TCON-HOOK-ITEMS-02 | HOOK-ITEMS-TC-02 | Handles loading state            | `src/test/useShopItems.test.jsx` |
| TCON-HOOK-ITEMS-03 | HOOK-ITEMS-TC-03 | API failures handled gracefully  | `src/test/useShopItems.test.jsx` |
| TCON-HOOK-ITEMS-04 | HOOK-ITEMS-TC-04 | Item list updates after CRUD ops | `src/test/useShopItems.test.jsx` |


- TCON-HOOK-ITEMS-01: fetch items on mount  
- TCON-HOOK-ITEMS-02: handle loading state  
- TCON-HOOK-ITEMS-03: handle API failures gracefully 
- TCON-HOOK-ITEMS-04: update item list after create/update/delete  

---

# 7. Test Execution

Run all tests using:
```
npm test
```

To generate coverage:
```
npm test -- --coverage
```

---

# 8. Maintenance & Future Enhancements

Areas planned for future extension:
- Stricter client-side validation (BVA test cases)
- More robust error boundary tests
- UI accessibility tests (ARIA roles, tab order)
- Snapshot tests for visual regression (optional)
- Tests for future planned features (shared lists, categories, filters, sorting)

All new UI features must include:
- Updated test conditions
- Added/updated test cases
- Proper mocking of new API calls