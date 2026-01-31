# Test Run Report

## 1. Test Run Overview
- **Test Run ID:** TR-YYYY-MM-DD-<feature-name>
- **Date:** YYYY-MM-DD
- **Tester:** Joshua Pearson
- **Application:** Shopping List App
- **Version / Commit:** <commit-hash>
- **Environment:** 
  - OS: 
  - Browser (if applicable): 
  - Backend runtime: 

---

## 2. Scope of Testing
**Reason for test run:**  
Regression testing following implementation of `<feature name>`.

**In scope:**
- Core user flows (add, edit, delete items)
- Data persistence
- Input validation
- Feature-specific functionality

**Out of scope:**
- Performance testing
- Security testing
- Cross-browser testing (beyond primary browser)

---

## 3. Test Approach
- Manual regression testing executed using documented checklist  
- Selected automated tests executed (where applicable)

**Regression checklist used:**  
`docs/regression-test-checklist.md`

---

## 4. Test Execution Summary

| Checklist ID | Description                    | Result | Notes             |
|--------------|--------------------------------|--------|-------------------|
| RC-01        | App loads successfully         | Pass   | No console errors |
| RC-02        | Add new item                   | Pass   |                   |
| RC-03        | Mark item complete             | Pass   |                   |
| RC-04        | Delete item                    | Fail   | See Issue #12     |
| RC-05        | Data persistence after refresh | Pass   |                   |
| RC-06        | Empty input validation         | Pass   |                   |

---

## 5. Defects Identified
| Issue ID | Severity | Status | Description                           |
|----------|----------|--------|---------------------------------------|
| #12      | Medium   | Open   | Deleting last item causes UI crash    |
| #13      | Low      | Open   | Error message unclear for empty input |

---

## 6. Overall Test Result
**Test run status:**  
☑ Pass with defects  
☐ Pass  
☐ Fail

**Summary:**  
Regression testing identified two defects introduced after the feature change. Core functionality remains usable, but fixes are required before release.

---

## 7. Retest / Verification Notes
(To be completed after fixes are applied)

- Issue #12: ☐ Fixed ☐ Verified  
- Issue #13: ☐ Fixed ☐ Verified  

---

## 8. Additional Notes
- No data loss observed
- No backend errors logged
- Recommend retesting delete flow after fix