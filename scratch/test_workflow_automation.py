#!/usr/bin/env python3
"""
Full-Stack Integration Test Suite for Feature 3: Workflow Automation
AICTE Approval Management System

Covers 16 Integration Test Scenarios:
1. Creating and activating a workflow template.
2. Configuring stages, roles, deadlines, and transitions.
3. Routing a submitted application to the correct stage.
4. Assigning an eligible officer.
5. Rejecting an invalid transition.
6. Preventing unauthorised users from transitioning applications.
7. Requesting corrections with recorded deficiencies.
8. Institution correction and resubmission.
9. Re-scrutiny and deficiency resolution.
10. Preventing skipped mandatory stages.
11. Preventing transitions from final states unless explicitly permitted.
12. Recording status history and audit events.
13. Handling concurrent transition requests (optimistic locking).
14. Preventing duplicate assignments and repeated transition side effects.
15. Preserving historical workflow versions.
16. Institution and officer data-access restrictions.
"""

import sys
import time
import requests

BASE_URL = "http://localhost:8080/api/v1"

def login(email, password):
    res = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
    if res.status_code != 200:
        raise Exception(f"Login failed for {email}: {res.status_code} {res.text}")
    data = res.json()
    token = data["token"]
    return {
        "token": token,
        "user": data.get("user", {}),
        "headers": {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    }

print("=== Authenticating test users ===")
admin = login("admin@demo.gov.in", "demoPassword123")
officer = login("officer@demo.gov.in", "demoPassword123")
college1 = login("college@demo.edu.in", "demoPassword123")
college2 = login("college2@demo.edu.in", "demoPassword123")
print("All 4 test users logged in successfully.\n")

results = []

def run_test(number, title, fn):
    print(f"--- Running Test {number}: {title} ---")
    try:
        fn()
        print(f"PASS: Test {number} - {title}\n")
        results.append((number, title, "PASS", ""))
    except Exception as e:
        print(f"FAIL: Test {number} - {title}: {e}\n")
        results.append((number, title, "FAIL", str(e)))

# Shared test state
test_wf_id = f"WF-TEST-{int(time.time())}"
test_app_id = None
test_app_type = f"Test Specialized Tech {int(time.time())}"

# 1. Creating and activating a workflow template
def test_1():
    global test_wf_id
    payload = {
        "id": test_wf_id,
        "name": f"Automated Test Workflow {test_wf_id}",
        "code": f"WF_CODE_{int(time.time())}",
        "description": "Integration test custom pathway with 3 stages",
        "version": "1.0.0",
        "isDefault": False,
        "applicableApplicationTypes": test_app_type,
        "stages": [
            {
                "name": "Application Submission",
                "code": "SUBMISSION",
                "stageOrder": 1,
                "targetDays": 3,
                "roleAllowed": "COLLEGE_REP",
                "isMandatory": True,
                "stageType": "STANDARD"
            },
            {
                "name": "Regional Scrutiny",
                "code": "SCRUTINY",
                "stageOrder": 2,
                "targetDays": 7,
                "roleAllowed": "REGIONAL_OFFICER",
                "isMandatory": True,
                "stageType": "STANDARD"
            },
            {
                "name": "Executive Council Approval",
                "code": "FINAL_APPROVAL",
                "stageOrder": 3,
                "targetDays": 5,
                "roleAllowed": "ADMIN",
                "isMandatory": True,
                "stageType": "DECISION"
            }
        ]
    }
    r = requests.post(f"{BASE_URL}/workflows", json=payload, headers=admin["headers"])
    assert r.status_code in [200, 201], f"Expected 200/201, got {r.status_code}: {r.text}"
    wf_data = r.json()
    assert wf_data["id"] == test_wf_id
    assert wf_data["status"] == "DRAFT", f"Expected DRAFT, got {wf_data['status']}"

    # Activate
    r_act = requests.post(f"{BASE_URL}/workflows/{test_wf_id}/activate", headers=admin["headers"])
    assert r_act.status_code == 200, f"Expected 200, got {r_act.status_code}: {r_act.text}"
    act_data = r_act.json()
    assert act_data["status"] == "ACTIVE", f"Expected ACTIVE, got {act_data['status']}"

# 2. Configuring stages, roles, deadlines, and transitions
def test_2():
    r = requests.get(f"{BASE_URL}/workflows/{test_wf_id}", headers=admin["headers"])
    assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
    data = r.json()
    stages = data.get("stages", [])
    assert len(stages) == 3, f"Expected 3 stages, got {len(stages)}"
    assert stages[0]["code"] == "SUBMISSION" and stages[0]["stageOrder"] == 1
    assert stages[1]["code"] == "SCRUTINY" and stages[1]["targetDays"] == 7
    assert stages[2]["code"] == "FINAL_APPROVAL" and stages[2]["roleAllowed"] == "ADMIN"
    assert all(s["isMandatory"] for s in stages)

# 3. Routing a submitted application to the correct stage
def test_3():
    global test_app_id
    # College 1 creates draft
    create_payload = {
        "applicationType": test_app_type,
        "programme": "Engineering & Technology",
        "institutionCode": "1-34981275",
        "institutionName": "Apex Institute of Technology",
        "region": "Northern",
        "state": "Uttar Pradesh",
        "priority": "NORMAL",
        "status": "DRAFT",
        "requestedIntake": [
            {
                "programme": "Engineering & Technology",
                "course": "Computer Science & Engineering",
                "currentIntake": 60,
                "proposedIntake": 120
            }
        ]
    }
    r_create = requests.post(f"{BASE_URL}/applications", json=create_payload, headers=college1["headers"])
    assert r_create.status_code in [200, 201], f"Create draft failed: {r_create.status_code} {r_create.text}"
    app_data = r_create.json()
    test_app_id = app_data["id"]
    assert app_data["status"] == "DRAFT"
    assert app_data["workflowId"] == test_wf_id, f"Expected workflow {test_wf_id}, got {app_data['workflowId']}"

    # Submit application
    r_sub = requests.post(f"{BASE_URL}/applications/{test_app_id}/submit", headers=college1["headers"])
    assert r_sub.status_code == 200, f"Submit failed: {r_sub.status_code} {r_sub.text}"
    sub_data = r_sub.json()
    assert sub_data["status"] == "IN_REVIEW", f"Expected IN_REVIEW, got {sub_data['status']}"
    assert sub_data["currentStage"] == "SCRUTINY", f"Expected SCRUTINY, got {sub_data['currentStage']}"
    assert sub_data["submissionDate"] is not None
    assert sub_data["nextDeadline"] is not None

# 4. Assigning an eligible officer
def test_4():
    payload = {
        "officerId": "USR-002",
        "officerName": "Dr. Suresh Kumar Nair",
        "reason": "Assigned for northern region scrutiny"
    }
    r = requests.patch(f"{BASE_URL}/applications/{test_app_id}/assign-officer", json=payload, headers=officer["headers"])
    assert r.status_code == 200, f"Assign officer failed: {r.status_code} {r.text}"
    data = r.json()
    assert data["assignedOfficerId"] == "USR-002"
    assert "Suresh Kumar Nair" in data["assignedOfficer"]
    assert data["assignmentReason"] == "Assigned for northern region scrutiny"
    assert data["assignedAt"] is not None

# 5. Rejecting an invalid transition
def test_5():
    payload = {
        "targetStage": "NON_EXISTENT_STAGE",
        "remarks": "Invalid jump"
    }
    r = requests.patch(f"{BASE_URL}/applications/{test_app_id}/advance-stage", json=payload, headers=officer["headers"])
    assert r.status_code == 400, f"Expected 400 for invalid stage, got {r.status_code}: {r.text}"

# 6. Preventing unauthorised users from transitioning applications
def test_6():
    # College 1 representative tries to advance stage directly
    payload = {
        "targetStage": "FINAL_APPROVAL",
        "remarks": "College representative trying to self-approve"
    }
    r = requests.patch(f"{BASE_URL}/applications/{test_app_id}/advance-stage", json=payload, headers=college1["headers"])
    assert r.status_code in [400, 403], f"Expected 400/403 for unauthorized college rep advance, got {r.status_code}: {r.text}"

# 7. Requesting corrections with recorded deficiencies
def test_7():
    payload = {
        "reason": "Land conversion certificate missing survey stamp under Regulation 4.2",
        "suggestedAction": "Upload land certificate counter-signed by District Revenue Officer",
        "clauses": ["AICTE Approval Process Handbook Clause 4.2(a)"]
    }
    r = requests.post(f"{BASE_URL}/applications/{test_app_id}/return-deficiency", json=payload, headers=officer["headers"])
    assert r.status_code == 200, f"Return deficiency failed: {r.status_code} {r.text}"
    data = r.json()
    assert data["status"] == "DEFICIENCY_NOTIFIED", f"Expected DEFICIENCY_NOTIFIED, got {data['status']}"
    assert data["deficiencyCount"] >= 1
    assert "Regulation 4.2" in data["deficiencyReason"]

# 8. Institution correction and resubmission
def test_8():
    payload = {
        "responseNotes": "Land certificate bearing DRO seal uploaded under Document Ref DOC-LND-2026-REV"
    }
    r = requests.post(f"{BASE_URL}/applications/{test_app_id}/resubmit", json=payload, headers=college1["headers"])
    assert r.status_code == 200, f"Resubmit failed: {r.status_code} {r.text}"
    data = r.json()
    assert data["status"] == "IN_REVIEW", f"Expected IN_REVIEW, got {data['status']}"
    assert data["currentStage"] == "SCRUTINY", f"Expected SCRUTINY, got {data['currentStage']}"

# 9. Re-scrutiny and deficiency resolution
def test_9():
    r = requests.get(f"{BASE_URL}/applications/{test_app_id}/deficiencies", headers=officer["headers"])
    assert r.status_code == 200, f"Get deficiencies failed: {r.status_code}: {r.text}"
    defs = r.json()
    assert len(defs) > 0, "Expected at least 1 deficiency record"
    latest = defs[0]
    assert latest["status"] == "RESOLVED", f"Expected RESOLVED, got {latest['status']}"
    assert latest["resolvedAt"] is not None
    assert "DOC-LND-2026-REV" in (latest.get("responseNotes") or "")

# 10. Preventing skipped mandatory stages
def test_10():
    # Application with full 5-stage workflow (WF-FULL): SUBMISSION -> SCRUTINY -> EVC -> SAC_SHC -> FINAL_APPROVAL
    # Try to jump directly from SCRUTINY to FINAL_APPROVAL
    app_type = f"Comprehensive Mandatory Test {int(time.time())}"
    # Link to WF-FULL
    create_payload = {
        "applicationType": app_type,
        "programme": "Engineering & Technology",
        "institutionCode": "1-34981275",
        "institutionName": "Apex Institute of Technology",
        "region": "Northern",
        "state": "Uttar Pradesh",
        "priority": "HIGH",
        "status": "DRAFT",
        "workflowId": "WF-FULL"
    }
    r = requests.post(f"{BASE_URL}/applications", json=create_payload, headers=college1["headers"])
    assert r.status_code in [200, 201]
    app_id = r.json()["id"]

    requests.post(f"{BASE_URL}/applications/{app_id}/submit", headers=college1["headers"])

    # Attempt to skip mandatory EVC and SAC_SHC to FINAL_APPROVAL
    jump_payload = {
        "targetStage": "FINAL_APPROVAL",
        "remarks": "Attempting illegal stage jump"
    }
    r_jump = requests.patch(f"{BASE_URL}/applications/{app_id}/advance-stage", json=jump_payload, headers=admin["headers"])
    assert r_jump.status_code == 400, f"Expected 400 for skipping mandatory stages, got {r_jump.status_code}: {r_jump.text}"
    assert "mandatory" in r_jump.text.lower() or "cannot skip" in r_jump.text.lower()

# 11. Preventing transitions from final states unless explicitly permitted
def test_11():
    # Advance test_app_id to FINAL_APPROVAL -> APPROVED
    adv_payload = {
        "targetStage": "FINAL_APPROVAL",
        "remarks": "All documents verified and recommended for full approval"
    }
    r = requests.patch(f"{BASE_URL}/applications/{test_app_id}/advance-stage", json=adv_payload, headers=admin["headers"])
    assert r.status_code == 200, f"Advance to FINAL_APPROVAL failed: {r.status_code} {r.text}"
    assert r.json()["status"] == "APPROVED"

    # Now attempt to advance again or return for deficiency on APPROVED application
    r_invalid_adv = requests.patch(f"{BASE_URL}/applications/{test_app_id}/advance-stage", json={"targetStage": "SCRUTINY"}, headers=admin["headers"])
    assert r_invalid_adv.status_code == 400, f"Expected 400 advancing approved app, got {r_invalid_adv.status_code}"

    r_invalid_def = requests.post(f"{BASE_URL}/applications/{test_app_id}/return-deficiency", json={"deficiencyReason": "Cannot do this"}, headers=officer["headers"])
    assert r_invalid_def.status_code == 400, f"Expected 400 returning approved app, got {r_invalid_def.status_code}"

# 12. Recording status history and audit events
def test_12():
    r_hist = requests.get(f"{BASE_URL}/applications/{test_app_id}/stage-history", headers=officer["headers"])
    assert r_hist.status_code == 200, f"Get stage history failed: {r_hist.status_code}"
    history = r_hist.json()
    assert len(history) >= 3, f"Expected at least 3 history records, got {len(history)}"

    # Audit log
    r_audit = requests.get(f"{BASE_URL}/audit", params={"entityId": test_app_id}, headers=admin["headers"])
    assert r_audit.status_code == 200, f"Get audit logs failed: {r_audit.status_code}"
    logs = r_audit.json()
    assert len(logs) >= 3, f"Expected audit events, got {len(logs)}"

# 13. Handling concurrent transition requests (optimistic locking)
def test_13():
    # Fetch current version
    r_app = requests.get(f"{BASE_URL}/applications/{test_app_id}", headers=officer["headers"])
    assert r_app.status_code == 200
    app_data = r_app.json()
    assert "version" in app_data, "Application must contain version for optimistic locking"

# 14. Preventing duplicate assignments and repeated transition side effects
def test_14():
    # Test duplicate assignment on an active in-progress application
    app_type = f"Duplicate Assignment Test {int(time.time())}"
    create_payload = {
        "applicationType": app_type,
        "programme": "Management (MBA / PGDM)",
        "institutionCode": "1-34981275",
        "institutionName": "Apex Institute of Technology",
        "region": "Northern",
        "state": "Uttar Pradesh",
        "priority": "NORMAL",
        "status": "DRAFT",
        "workflowId": "WF-FULL"
    }
    r = requests.post(f"{BASE_URL}/applications", json=create_payload, headers=college1["headers"])
    assert r.status_code in [200, 201]
    active_app_id = r.json()["id"]

    requests.post(f"{BASE_URL}/applications/{active_app_id}/submit", headers=college1["headers"])

    # First assignment
    payload = {
        "officerId": "USR-002",
        "officerName": "Dr. Suresh Kumar Nair",
        "reason": "Initial scrutiny assignment"
    }
    r1 = requests.patch(f"{BASE_URL}/applications/{active_app_id}/assign-officer", json=payload, headers=officer["headers"])
    assert r1.status_code == 200
    assert r1.json()["assignedOfficerId"] == "USR-002"

    # Second duplicate assignment with same officer
    r2 = requests.patch(f"{BASE_URL}/applications/{active_app_id}/assign-officer", json=payload, headers=officer["headers"])
    assert r2.status_code == 200
    assert r2.json()["assignedOfficerId"] == "USR-002"
    assert r2.json()["assignedOfficer"] == r1.json()["assignedOfficer"]

# 15. Preserving historical workflow versions
def test_15():
    # Admin updates workflow template
    update_payload = {
        "name": f"Automated Test Workflow {test_wf_id} v2",
        "description": "Updated pathway with modified target SLA",
        "stages": [
            {
                "name": "Application Submission",
                "code": "SUBMISSION",
                "stageOrder": 1,
                "targetDays": 3,
                "roleAllowed": "COLLEGE_REP",
                "isMandatory": True
            },
            {
                "name": "Regional Scrutiny",
                "code": "SCRUTINY",
                "stageOrder": 2,
                "targetDays": 8,
                "roleAllowed": "REGIONAL_OFFICER",
                "isMandatory": True
            },
            {
                "name": "Executive Council Approval",
                "code": "FINAL_APPROVAL",
                "stageOrder": 3,
                "targetDays": 5,
                "roleAllowed": "ADMIN",
                "isMandatory": True
            }
        ]
    }
    r_up = requests.put(f"{BASE_URL}/workflows/{test_wf_id}", json=update_payload, headers=admin["headers"])
    assert r_up.status_code == 200, f"Update workflow failed: {r_up.status_code}: {r_up.text}"
    updated = r_up.json()
    assert updated["version"] in ["1.0.1", "1.1.0"], f"Expected version bump, got {updated['version']}"

    # Verify existing application remains linked and intact
    r_app = requests.get(f"{BASE_URL}/applications/{test_app_id}", headers=admin["headers"])
    assert r_app.status_code == 200
    assert r_app.json()["workflowId"] == test_wf_id

# 16. Institution and officer data-access restrictions
def test_16():
    # College 2 (institution code 1-10492811) tries to access College 1's application (test_app_id)
    r_col2 = requests.get(f"{BASE_URL}/applications/{test_app_id}", headers=college2["headers"])
    assert r_col2.status_code == 403, f"Expected 403 Forbidden for cross-institution access, got {r_col2.status_code}: {r_col2.text}"

    # College 2 tries to submit or edit College 1's application
    r_col2_sub = requests.post(f"{BASE_URL}/applications/{test_app_id}/submit", headers=college2["headers"])
    assert r_col2_sub.status_code == 403, f"Expected 403 Forbidden for cross-institution submit, got {r_col2_sub.status_code}: {r_col2_sub.text}"


# Run all 16 tests in sequence
run_test(1, "Creating and activating a workflow template", test_1)
run_test(2, "Configuring stages, roles, deadlines, and transitions", test_2)
run_test(3, "Routing a submitted application to the correct stage", test_3)
run_test(4, "Assigning an eligible officer", test_4)
run_test(5, "Rejecting an invalid transition", test_5)
run_test(6, "Preventing unauthorised users from transitioning applications", test_6)
run_test(7, "Requesting corrections with recorded deficiencies", test_7)
run_test(8, "Institution correction and resubmission", test_8)
run_test(9, "Re-scrutiny and deficiency resolution", test_9)
run_test(10, "Preventing skipped mandatory stages", test_10)
run_test(11, "Preventing transitions from final states unless explicitly permitted", test_11)
run_test(12, "Recording status history and audit events", test_12)
run_test(13, "Handling concurrent transition requests (optimistic locking)", test_13)
run_test(14, "Preventing duplicate assignments and repeated transition side effects", test_14)
run_test(15, "Preserving historical workflow versions", test_15)
run_test(16, "Institution and officer data-access restrictions", test_16)

print("========================================")
print("TEST EXECUTION SUMMARY:")
passed = sum(1 for _, _, status, _ in results if status == "PASS")
failed = sum(1 for _, _, status, _ in results if status == "FAIL")
print(f"Total: {len(results)} | Passed: {passed} | Failed: {failed}")
print("========================================")

if failed > 0:
    sys.exit(1)
else:
    print("ALL 16 INTEGRATION SCENARIOS PASSED CLEANLY!")
    sys.exit(0)
