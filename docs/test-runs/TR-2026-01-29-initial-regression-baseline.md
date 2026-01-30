# Test Run Report

## 1. Test Run Overview
- **Test Run ID:** TR-2026-01-29-initial-regression-baseline
- **Date:** 2026-01-29
- **Tester:** Joshua Pearson
- **Application:** Shopping List App
- **Version / Commit:** e773604 (docs/qa-baseline-workflow)
- **Environment:**
  - OS: Windows 11
  - Browser: Firefox 47.0.2 (64-bit) [primary browser for baseline]
  - Backend runtime: Node.js 18
  - Database: MongoDB (local)

---

## 2. Scope of Testing

**Reason for test run:**  
Initial execution of the newly created regression checklist to establish a baseline for future regression testing.

This test run serves to:
- Validate current system behaviour against documented expectations
- Identify existing gaps in error handling and session management
- Establish a known-good (and known-bad) baseline for future comparisons

**In scope:**
- Authentication and session handling
- Error handling during backend unavailability
- User feedback on failure scenarios
- Per-user access control

**Out of scope:**
- Performance testing
- Accessibility testing
- Cross-browser testing

---

## 3. Test Approach

- Manual regression testing executed using the newly defined regression checklist  
- This is the **first execution** of the checklist; failures may represent existing behaviour rather than newly introduced regressions  
- Backend availability and session state were intentionally manipulated to validate negative paths  
- Authentication and authorization scenarios were validated via:
  - UI flows
  - Browser developer tools (network inspection, local storage)
  - Direct API requests using **Postman** (JWT modification, missing/invalid token scenarios)

**Regression checklist used:**  
[`docs/regression-test-checklist.md`](../regression-test-checklist.md)

---

## 4. Test Execution Summary

| Checklist ID | Description                                                  | Result | Notes                                                         |
|--------------|--------------------------------------------------------------|--------|---------------------------------------------------------------|
| RC-04        | User cannot access another user’s items via API manipulation | Pass   | Verified via Postman and browser dev tools using second user  |
| RC-05        | Invalid or missing JWT results in 401 responses              | Pass   | Confirmed via Postman and UI requests                         |
| RC-06        | Expired or invalid sessions handled gracefully in UI         | Fail   | Session invalidation works but lacks user-facing feedback     |
| RC-07        | Backend errors surfaced in a controlled manner               | Fail   | Raw browser error exposed to UI                               |
| RC-09        | User receives actionable feedback on failure                 | Fail   | Error messages not actionable                                 |

All smoke checks passed.

---

## 5. Detailed Observations

### RC-06 — Expired or invalid sessions handled gracefully in the UI

**Baseline observation**

**Test A: Backend restart**
- Backend server stopped and restarted during an active user session
- User remained logged in
- Existing JWT continued to be accepted

**Assessment:**  
Expected behaviour for stateless JWT authentication. No defect logged.

---

**Test B: Manual JWT removal**
- JWT token deleted from browser local storage using developer tools
- Page refreshed

**Observed behaviour:**
- User logged out successfully
- No explanation provided to the user

**Expected behaviour:**
- User is logged out
- UI provides clear feedback (e.g. “Your session has expired. Please log in again.”)

**Result:**  
❌ Baseline gap identified in user feedback

---

### RC-07 — Backend errors surfaced to the UI in a controlled manner

**Baseline observation**
- Backend server shut down
- Login attempted via UI

**Observed behaviour:**
- UI displays a browser-native network error message ("NetworkError when attempting to fetch resource.") in Firefox
- Network request fails during CORS preflight

**Result:**  
❌ Baseline gap identified in error handling

---

### RC-09 — User receives actionable feedback on failure

**Baseline observation**
- Backend unavailable → raw network error shown
- Session invalidation → silent logout with no explanation

**Result:**  
❌ Baseline gap identified in user-facing feedback

---

## 6. Defects Identified

| Issue ID | Severity | Status | Description                                                                                       |
|----------|----------|--------|---------------------------------------------------------------------------------------------------|
| #1       | Medium   | Open   | Raw “NetworkError when attempting to fetch resource.” error exposed to user during backend outage |
| #2       | Medium   | Open   | Session termination provides no user-facing explanation                                           |

---

## 7. Overall Test Result

**Test run status:**  
☑ Pass with known baseline gaps  
☐ Pass  
☐ Fail

**Summary:**  
This initial regression run establishes a baseline for authentication, authorization, and error handling behaviour. Core security controls function correctly, but user-facing error communication and session-expiry feedback require improvement. These issues are treated as known baseline gaps rather than newly introduced regressions.

---

## 8. Retest / Verification Notes
(To be completed after fixes are applied)

- Issue #1: ☐ Fixed ☐ Verified  
- Issue #2: ☐ Fixed ☐ Verified  

---

## 9. Additional Notes
- No data leakage observed
- No application crashes occurred
- API behaviour was validated via UI, browser developer tools, and Postman
- This test run should be used as a reference point for future regression comparisons
- Initial exploratory testing was performed in another browser; Firefox was chosen as the primary browser for this baseline run and the error message differs slightly by browser.