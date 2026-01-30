# test-process-frontend.md  
## Shopping List MERN – Frontend Test Process  
Author: **Joshua Pearson**  
Last Updated: 2025-12-16  

---

# 0. Introduction  

This document describes the **frontend test process** for the Shopping List MERN application, following the ISTQB Foundation Level lifecycle of testing activities:

1. Test Planning  
2. Test Analysis  
3. Test Design  
4. Test Implementation  
5. Test Execution  
6. Test Completion  

The frontend consists of:

- React components (functional components + hooks)
- React Context (AuthContext)
- Routing & ProtectedRoute
- Pages:
  - LoginPage  
  - RegisterPage  
  - ShoppingListPage  
- Forms, validation, API interaction
- UI state transitions and rendering logic

Testing is carried out using:

- **Vitest**
- **React Testing Library** (component & integration testing)
- **Mock Service Worker (MSW)** or manual mocks (mocking API responses)
- **JSDOM** (browser-like environment)

This document focuses exclusively on **frontend testing**. Backend and E2E processes are documented separately.

---

# 1. Test Planning (Frontend)

## 1.1 Scope

### **In Scope**

- Component-level testing of:
  - Navbar  
  - ShoppingList  
  - ShoppingListForm  
  - ProtectedRoute
  - Item toggling behaviour (ToggleSwitch verified via ShoppingList integration)  
- Page-level testing of:
  - LoginPage  
  - RegisterPage  
  - ShoppingListPage  
- Testing React Context:
  - AuthContext provider  
  - Authentication state transitions  
- Testing custom hooks:
  - `useShopItems`  
- UI validation:
  - Form validation  
  - Error message display  
- Routing:
  - Redirects for unauthorized users
  - Navigation after login/logout
- API interaction mocking

### **Out of Scope**

- Backend behaviour (covered in backend test process)  
- Full end-to-end flows (covered in E2E test process)  
- Performance, load, and accessibility testing  
- Browser compatibility testing  

---

## 1.2 Objectives

Frontend testing aims to:

- Validate that **UI components behave correctly** under all expected states.
- Ensure **correct interactions** with the backend API (mocked).
- Validate **authentication flows and redirects**.
- Confirm that **React Context and custom hooks** update UI as expected.
- Provide a **repeatable, automated test suite** guarding against UI regressions.
- Demonstrate ISTQB-aligned professional QA practices.

---

## 1.3 Test Strategy (High-Level)

### **Test Levels**

| Level                  | Purpose                                           | Tools              |
|------------------------|---------------------------------------------------|--------------------|
| Unit                   | Validate small components, hooks                  | Vitest + RTL       |
| Integration            | Validate group of components + context + routing  | Vitest + RTL       |
| System (Frontend-only) | Validate complete UI workflow with mocked backend | Vitest + RTL + MSW |

---

### **Test Types**

| Test Type                               | Description                               |
|-----------------------------------------|-------------------------------------------|
| **Functional testing**                  | UI behaviour, form validation, rendering  |
| **State-based testing**                 | Auth state, item list state, UI updating  |
| **Error-handling testing**              | Form errors, network errors, 401 handling |
| **Security-related functional testing** | ProtectedRoute behaviour                  |
| **Negative testing**                    | Invalid credentials, missing inputs       |
| **Regression testing**                  | Ensured through automation                |

---

## 1.4 Test Environment

### **Environment Components**

- **React 18**
- **Vite** dev environment
- **Vitest** configured via Vite
- **React Testing Library** for behaviour-focused testing
- **Mock Service Worker (MSW)** or manual mocks for API calls
- **JSDOM** simulating browser environment

### **Key Environment Characteristics**

- Tests run fully in-memory (no real backend).
- API calls return mocked responses.
- Routes tested using **MemoryRouter**.

---

## 1.5 Entry & Exit Criteria

### **Entry Criteria**

- Core UI components implemented
- API call functions defined
- Authentication logic working with mocked backend
- Basic render test runs successfully

### **Exit Criteria**

- All planned test cases implemented and passing
- No high-severity UI defects open
- All tests pass in CI pipeline
- Updated test documentation and mapping

---

## 1.6 Risks & Mitigations

| Risk                                   | Impact          | Mitigation                           |
|----------------------------------------|-----------------|--------------------------------------|
| Mocking API inaccurately               | False positives | Use MSW and realistic responses      |
| Changes in UI structure break tests    | High            | Use semantic queries, not classnames |
| Context-dependent tests become fragile | Medium          | Wrap components in proper providers  |
| Routing issues hard to test            | Medium          | Use MemoryRouter + robust helpers    |

---

# 2. Test Analysis (Frontend)

Test Analysis identifies **test conditions** derived from UI behaviour and functional requirements.

---

## 2.1 Sources for Test Conditions

- UI/UX behaviour described in app’s workflow  
- React component structure (Navbar, pages, etc.)  
- Routing logic (`App.jsx`, `ProtectedRoute.jsx`)  
- State logic in:
  - AuthContext  
  - useShopItems  
- Form requirements for login/register  
- API requirements for CRUD operations (mocked)

---

## 2.2 Identified Test Conditions

### **Authentication UI**

- Valid login form submission
- Invalid login (wrong email/password)
- Validation errors on empty fields
- Register form → valid + invalid inputs
- Auth state updates correctly upon login/logout

### **Routing & Access Control**

- Unauthenticated users cannot access `/shopping-list`
- Authenticated users can access protected route
- Redirect to login after logout

### **Component Rendering & Behaviour**

- Navbar shows correct buttons based on auth state
- ShoppingList renders items returned by hook
- Toggling an item calls update function
- Form submits correct data
- Error messages appear when inputs invalid

### **React Context (AuthContext)**

- Initial authentication state is correctly derived from persisted token (if present)
- Login updates context  
- Logout clears context  
- Unauthorized responses (401) clear context (if implemented)

### **Custom Hook (`useShopItems`)**

- Fetches items on mount
- Handles loading state
- API errors are handled gracefully (logging & UI stabilisation)
- Updates item list after create/update/delete

---

# 3. Test Design (Frontend)

Frontend test design uses ISTQB techniques to derive meaningful test coverage.

---

## 3.1 Test Design Techniques

| Technique                         | Application                                     |
|-----------------------------------|-------------------------------------------------|
| **Equivalence Partitioning (EP)** | Valid/invalid form data, credentials            |
| **Boundary Value Analysis (BVA)** | Planned for stricter input validation           |
| **Decision Table Testing (DT)**   | Login form credential combinations              |
| **State Transition Testing (ST)** | Auth states, item checked/unchecked             |
| **Error Guessing (EG)**           | Network failures, incorrect input, 401 handling |
| **Use Case Testing**              | Login → access → CRUD → logout                  |

---

## 3.2 Example Test Case Derivation

### **Authentication UI**
- Empty fields → error messages  
- Invalid email → error  
- Valid email/password → navigate to shopping list  
- Backend 401 (mocked) → show error message  

### **ProtectedRoute**
- Without token → redirect to login  
- With token → allow access  

### **ShoppingListPage**
- Initially fetches items (mock success)  
- Renders item components  
- Clicking toggle updates item  
- Delete removes item  

### **Navbar**
- When authed: show "Logout"  
- When not authed: show "Login/Register"  

---

# 4. Test Implementation (Frontend)

Here the testware is created: configurations, mocks, utilities, and test files.

---

## 4.1 Frontend Testware Produced

### **Test Directory Structure**

```
client/
  src/
    test/
      AuthContext.test.jsx
      LoginPage.msw.test.jsx
      Navbar.test.jsx
      ProtectedRoute.test.jsx
      RegisterPage.msw.test.jsx
      RoutesHarness.jsx
      setupTests.js
      ShopItemForm.test.jsx
      ShoppingListPage.test.jsx
      TestUtilities.jsx
      useShopItems.test.jsx
    test/msw/
        handlers.js
        server.js (msw)
```

### **Key Implementation Elements**

- `setupTests.js` configures:
  - React Testing Library defaults  
  - MSW server setup/teardown  
- API calls are intercepted and mocked  
- Components wrapped in:
  - `AuthProvider`  
  - `MemoryRouter`

---

## 4.2 Test Data Strategy

- Mocked API responses emulate real backend behaviour  
- Different handlers used for:
  - success responses  
  - validation errors  
  - 401 unauthorized  
  - empty lists  
- No persistent test data  
- Each test resets handlers  

---

# 5. Test Execution (Frontend)

---

## 5.1 Running Tests

From the `client` directory:

```bash
npm test
```

What happens:
- JSDOM environment loads
- MSW mock server starts
- Component and page tests run
- Coverage (optional) generated via:
```
npm test -- --coverage
```

---

## 5.2 Test Result Interpretation

- Green → expected UI behaviour confirmed
- Red → investigate:
    - Incorrect test expectation
    - Regression in UI logic
    - Mock API mismatch
    - Context or routing issue

## 5.3 Defect Handling

Defects discovered during automated or manual testing are:
1. Documented in GitHub Issues
2. Linked to:
    - Test case
    - Component or route
3. Fixed in code
4. Regression test added if necessary
5. Tests re-run in CI

---

# 6. Test Completion (Frontend)

---

## 6.1 Exit Criteria Validation

- All planned frontend tests implemented + passing
- Authentication, routing, forms, and state logic covered
- UI regression suite stable
- No unaddressed high-severity UI bugs
- Documentation updated

## 6.2 Coverage Assessment

**Functional Coverage**
- Authentication UI
- Form validation
- Protected routes
- List rendering
- CRUD operations via mocked API

**State Coverage**
- Logged-in vs logged-out
- Item toggled vs untoggled
- Loading, success, and error states

**Risk Coverage**
- Unauthorized access
- Data isolation (frontend-side)
- Network error handling

## 6.3 Testware Maintenance

Future changes require:
- Updating test cases
- Extending MSW handlers
- Maintaining routing and context tests
- Adding coverage for new features (shared lists, sorting, categories, etc.)

## 6.4 Lessons Learned

- React Testing Library encourages correct behaviour-based testing.
- MSW provides reliable, realistic mock API behaviour.
- Testing Context & Hooks early makes UI issues easier to track.
- Separating unit, integration, and pseudo-system tests improves clarity.
- Documenting ISTQB-aligned process helps to internalise testing procedures and practices.