# Smoke & Regression Checklist – Shopping List App

Author: Joshua Pearson  
Test level: System / End-to-End (manual support for automated coverage)  
Scope: Shopping List App (full-stack MERN)
Last updated: 29.01.26

---

## 1. Purpose

This checklist defines a lightweight set of smoke and regression checks for the Shopping List App. 
It is intended to support rapid verification after changes and to complement the automated test suites.

The checklist focuses on:
- Core user journeys
- High-risk functionality
- Areas historically prone to regression

---

## 2. Smoke Checklist

The smoke checklist is executed:
- After major changes
- After environment setup
- Before deeper testing or demos

### Authentication
- [ ] **SC-01** Application loads successfully
- [ ] **SC-02** User can register with valid credentials
- [ ] **SC-03** User can log in with valid credentials
- [ ] **SC-04** Invalid login is rejected with clear feedback
- [ ] **SC-05** Logged-out users cannot access protected pages

### Shopping List – Core Flow
- [ ] **SC-06** User can create a new shopping item
- [ ] **SC-07** Newly created item appears in the active list
- [ ] **SC-08** User can mark an item as completed
- [ ] **SC-09** Completed items appear in the correct list section
- [ ] **SC-10** User can delete an item

### Persistence
- [ ] **SC-11** Items persist after page refresh
- [ ] **SC-12** User sees only their own items after login

---

## 3. Regression Checklist

The regression checklist targets areas with higher change frequency or risk.

### Item Management
- [ ] **RC-01** Editing an item updates only intended fields
- [ ] **RC-02** Item completion state is persisted correctly
- [ ] **RC-03** Rapid add/edit/delete actions do not corrupt state

### Authorization & Data Isolation
- [ ] **RC-04** User cannot access another user’s items via API manipulation
- [ ] **RC-05** Invalid or missing JWT results in 401 responses
- [ ] **RC-06** Expired or invalid sessions are handled gracefully in the UI

### Error Handling
- [ ] **RC-07** Backend errors are surfaced to the UI in a controlled manner
- [ ] **RC-08** Application does not crash on failed requests
- [ ] **RC-09** User receives actionable feedback on failure

### UI State & Navigation
- [ ] **RC-10** Navigation reflects authentication state correctly
- [ ] **RC-11** Logout clears user data from the UI
- [ ] **RC-12** No duplicate or stale items appear after updates

Note: Severity is assessed based on user impact, data integrity, and system stability.

---

## 4. Traceability Notes

- Smoke checklist IDs (**SC-xx**) represent the minimum set of checks required to establish basic application health.  
- Regression checklist IDs (**RC-xx**) represent higher-risk areas that should be revalidated after changes.  
- These test IDs are local to this checklist.

---

## 5. Exit Criteria

- All smoke checks pass
- No unresolved high-severity regressions in authentication, data isolation, or core CRUD flows

---

## 6. Design rationale (reference)

This checklist follows a risk-based testing approach to provide fast, meaningful confidence in application stability after changes. The smoke checks focus on verifying the minimum viable health of the system—authentication, core CRUD flows, and data persistence - ensuring the app is usable before further testing or deployment. The regression checks target areas with higher architectural or historical risk, such as state management, authorization, error handling, and UI consistency, where changes are more likely to introduce subtle defects. Together, the checklists balance speed and coverage, prioritising user-visible impact and high-severity failure modes while deliberately excluding lower-risk or specialist concerns (such as performance or accessibility) that are better handled through dedicated testing activities.