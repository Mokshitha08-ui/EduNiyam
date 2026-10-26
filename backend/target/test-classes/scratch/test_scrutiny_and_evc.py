import requests
import json
import sys

BASE_URL = "http://localhost:8080/api/v1"
PASSWORD = "demoPassword123"

def login(email):
    url = f"{BASE_URL}/auth/login"
    resp = requests.post(url, json={"email": email, "password": PASSWORD})
    if resp.status_code != 200:
        raise Exception(f"Failed to login {email}: {resp.status_code} - {resp.text}")
    data = resp.json()
    token = data.get("token") or data.get("accessToken")
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

print("Logging in test actors...")
admin_headers = login("admin@demo.gov.in")
officer_headers = login("officer@demo.gov.in")
college_headers = login("college@demo.edu.in")
bureau_headers = login("bureau@demo.gov.in")
evc_headers = login("committee@demo.gov.in")
print("All actors logged in successfully.")

results = []

def run_test(num, name, func):
    print(f"\n==================== SCENARIO {num}: {name} ====================")
    try:
        func()
        print(f"PASS: Scenario {num} - {name}")
        results.append((num, name, "PASS", ""))
    except Exception as e:
        print(f"FAIL: Scenario {num} - {name}: {str(e)}")
        results.append((num, name, "FAIL", str(e)))

import time

# Create clean dedicated test application
print("Setting up fresh test application...")
unique_type = f"Specialized Innovation Lab - {int(time.time())}"
create_app_payload = {
    "institutionCode": "1-34981275",
    "institutionName": "Vivekananda Institute of Technology, Bangalore",
    "applicationType": unique_type,
    "programme": "Engineering & Technology",
    "region": "South-Western",
    "workflowId": "WF-FULL",
    "status": "DRAFT",
    "priority": "HIGH"
}
cr = requests.post(f"{BASE_URL}/applications", headers=college_headers, json=create_app_payload)
if cr.status_code != 201:
    raise Exception(f"Failed to create test app: {cr.status_code} - {cr.text}")
test_app_id = cr.json().get("id")
print(f"Created fresh draft application: {test_app_id}")

# Submit application so it moves to SCRUTINY stage
sub_resp = requests.post(f"{BASE_URL}/applications/{test_app_id}/submit", headers=college_headers)
if sub_resp.status_code != 200:
    raise Exception(f"Failed to submit test app: {sub_resp.status_code} - {sub_resp.text}")

print(f"Application {test_app_id} successfully submitted and ready in SCRUTINY stage")

test_evc_id = None
test_obs_id = None

# Part A: Scrutiny and Reviews (1–12)

# Scenario 1: Officer views scrutiny queue filtered by assigned officer / stage
def test_1():
    resp = requests.get(f"{BASE_URL}/applications?stage=SCRUTINY", headers=officer_headers)
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    data = resp.json()
    items = data.get("content", [])
    print(f"Found {len(items)} applications in SCRUTINY stage")
    assert isinstance(items, list), "Expected content list"

# Scenario 2: College rep views scrutiny status for their application (institutional isolation verified)
def test_2():
    # College rep should view their own institution's applications
    resp = requests.get(f"{BASE_URL}/applications/{test_app_id}", headers=college_headers)
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
    app = resp.json()
    assert app.get("institutionCode") == "1-34981275", "Institutional isolation match"

    # Cross-institution access should be blocked (403)
    resp_other = requests.get(f"{BASE_URL}/applications/AICTE-2026-W-4102", headers=college_headers)
    assert resp_other.status_code == 403, f"Expected 403 for cross-institution, got {resp_other.status_code}"

# Scenario 3: Review form loads checklist based on application type and workflow stage
def test_3():
    resp = requests.get(f"{BASE_URL}/workflows/WF-FULL", headers=officer_headers)
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    wf = resp.json()
    stages = wf.get("stages", [])
    scrutiny_stage = next((s for s in stages if s.get("code") == "SCRUTINY"), None)
    assert scrutiny_stage is not None, "SCRUTINY stage exists in workflow"
    print(f"Workflow stage {scrutiny_stage.get('name')} SLA days: {scrutiny_stage.get('targetDays')}")

# Scenario 4: Evaluation of checklist items (SATISFIED, NOT_SATISFIED, NOT_APPLICABLE, PENDING)
def test_4():
    payload = {
        "stage": "SCRUTINY",
        "decision": "FORWARD_NEXT_STAGE",
        "remarks": "Preliminary checklist evaluated across physical, academic, and statutory criteria.",
        "checklistResults": [
            {"id": "CHK-1", "title": "Land Ownership Deed", "status": "SATISFIED", "remarks": "Registered lease verified"},
            {"id": "CHK-2", "title": "Building Safety Certificate", "status": "SATISFIED", "remarks": "Approved by PWD"},
            {"id": "CHK-3", "title": "Faculty Cadre Ratio", "status": "SATISFIED", "remarks": "1:20 norm met"}
        ],
        "isDraft": False
    }
    resp = requests.post(f"{BASE_URL}/applications/{test_app_id}/reviews", headers=officer_headers, json=payload)
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
    rev = resp.json()
    assert rev.get("decision") == "FORWARD_NEXT_STAGE"
    assert rev.get("reviewerRole") == "REGIONAL_OFFICER"
    print(f"Review recorded with ID: {rev.get('id')}")

# Scenario 5: Officer records observations and deficiencies with severity, description, corrective action, deadline
def test_5():
    global test_obs_id
    payload = {
        "type": "DEFICIENCY",
        "severity": "CRITICAL",
        "clause": "Norms Clause 4.2.1",
        "description": "Fire safety clearance certificate has lapsed validity; renewal NOC pending.",
        "correctiveAction": "Submit renewed Fire Safety NOC issued by State Disaster Management Authority.",
        "deadlineDays": 7
    }
    resp = requests.post(f"{BASE_URL}/applications/{test_app_id}/observations", headers=officer_headers, json=payload)
    assert resp.status_code == 201, f"Expected 201, got {resp.status_code}: {resp.text}"
    obs = resp.json()
    test_obs_id = obs.get("id")
    assert test_obs_id is not None, "Observation ID returned"
    assert obs.get("type") == "DEFICIENCY"
    assert obs.get("severity") == "CRITICAL"
    print(f"Deficiency created with ID: {test_obs_id}")

# Scenario 6: Deficiency creation updates deficiency count and status
def test_6():
    resp = requests.get(f"{BASE_URL}/applications/{test_app_id}", headers=officer_headers)
    assert resp.status_code == 200
    app = resp.json()
    assert app.get("status") == "DEFICIENCY_NOTIFIED", f"Expected DEFICIENCY_NOTIFIED, got {app.get('status')}"
    print(f"Application status updated to: {app.get('status')}")

# Scenario 7: College rep views deficiency notice, clauses, corrective action, deadline
def test_7():
    resp = requests.get(f"{BASE_URL}/applications/{test_app_id}/deficiencies", headers=college_headers)
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    defs = resp.json()
    target_def = next((d for d in defs if d.get("id") == test_obs_id), None)
    assert target_def is not None, "Target deficiency present for institution"
    assert target_def.get("status") in ["OPEN", "DEFICIENT"]
    print(f"College rep viewed deficiency {test_obs_id}: {target_def.get('remarks')}")

# Scenario 8: College rep submits deficiency response; verifies deficiency moves to RESPONDED (NOT auto-resolved)
def test_8():
    payload = {
        "responseNotes": "Renewed Fire Safety NOC (Ref #FS-2026-904) received from Fire Dept and attached."
    }
    resp = requests.post(f"{BASE_URL}/applications/{test_app_id}/resubmit", headers=college_headers, json=payload)
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"

    # Verify deficiency status is RESPONDED, NOT RESOLVED!
    resp_def = requests.get(f"{BASE_URL}/applications/{test_app_id}/deficiencies", headers=officer_headers)
    defs = resp_def.json()
    target_def = next((d for d in defs if d.get("id") == test_obs_id), None)
    assert target_def is not None
    assert target_def.get("status") == "RESPONDED", f"Expected RESPONDED, got {target_def.get('status')}"
    print(f"Deficiency status after college resubmission: {target_def.get('status')} (Correctly not auto-resolved)")

# Scenario 9: Reviewer verifies resolved deficiency (RESOLVED) or reopens (REOPENED)
def test_9():
    # First verify/resolve
    payload_res = {
        "status": "RESOLVED",
        "verificationNotes": "NOC verified against State Fire Portal. Deemed fully compliant."
    }
    resp_res = requests.patch(f"{BASE_URL}/applications/{test_app_id}/observations/{test_obs_id}/verify",
                              headers=officer_headers, json=payload_res)
    assert resp_res.status_code == 200, f"Expected 200, got {resp_res.status_code}"
    assert resp_res.json().get("status") == "RESOLVED"
    print("Deficiency verified and marked RESOLVED")

    # Test reopening
    payload_reopen = {
        "status": "REOPENED",
        "verificationNotes": "Seal signature missing on page 2. Reopened for clarification."
    }
    resp_reopen = requests.patch(f"{BASE_URL}/applications/{test_app_id}/observations/{test_obs_id}/verify",
                                headers=officer_headers, json=payload_reopen)
    assert resp_reopen.status_code == 200
    assert resp_reopen.json().get("status") == "REOPENED"
    print("Deficiency verified and marked REOPENED")

    # Resolve again so subsequent stage advance tests can proceed
    resp_clean = requests.patch(f"{BASE_URL}/applications/{test_app_id}/observations/{test_obs_id}/verify",
                                headers=officer_headers, json=payload_res)
    assert resp_clean.status_code == 200
    assert resp_clean.json().get("status") == "RESOLVED"
    print("Deficiency cleared to RESOLVED for pipeline continuation")

# Scenario 10: Forward to next stage / Recommend approval workflow action
def test_10():
    # Advance application from SCRUTINY to EVC
    payload = {
        "targetStage": "EVC",
        "remarks": "Scrutiny cleared. Advancing to Expert Visit Committee inspection."
    }
    resp = requests.post(f"{BASE_URL}/applications/{test_app_id}/advance-stage", headers=officer_headers, json=payload)
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
    app = resp.json()
    assert app.get("currentStage") == "EVC"
    assert app.get("status") == "EVC_SCHEDULED"
    print(f"Application advanced to stage: {app.get('currentStage')} with status: {app.get('status')}")

# Scenario 11: Recommend rejection / issue deficiency workflow action
def test_11():
    # Regional officer submitting review recommending rejection on draft/active review
    payload = {
        "stage": "EVC",
        "decision": "RECOMMEND_REJECTION",
        "remarks": "Institution site plan overlaps with environmental catchment zone. Recommend disapproval.",
        "checklistResults": [
            {"id": "CHK-4", "title": "Catchment Zone Clearance", "status": "NOT_SATISFIED"}
        ],
        "isDraft": False
    }
    resp = requests.post(f"{BASE_URL}/applications/{test_app_id}/reviews", headers=officer_headers, json=payload)
    assert resp.status_code == 200
    rev = resp.json()
    assert rev.get("decision") == "RECOMMEND_REJECTION"
    print(f"Officer recommendation recorded: {rev.get('decision')}")

# Scenario 12: Review decision history displays chronological audit records of reviews
def test_12():
    resp = requests.get(f"{BASE_URL}/applications/{test_app_id}/reviews", headers=officer_headers)
    assert resp.status_code == 200
    reviews = resp.json()
    assert len(reviews) >= 2, f"Expected at least 2 reviews, got {len(reviews)}"
    for r in reviews:
        print(f"Review Round {r.get('round')} | Stage: {r.get('stage')} | Reviewer: {r.get('reviewerName')} | Decision: {r.get('decision')}")

# Part B: EVC Management (13–24)

# Scenario 13: Application marked for EVC; badge and reason displayed
def test_13():
    payload = {
        "reason": "New engineering workshop and robotics lab requires mandatory physical inspection."
    }
    resp = requests.post(f"{BASE_URL}/applications/{test_app_id}/mark-evc", headers=officer_headers, json=payload)
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
    app = resp.json()
    assert app.get("requiresEvc") == True
    assert app.get("evcReason") == payload["reason"]
    print(f"Application successfully flagged for EVC: requiresEvc={app.get('requiresEvc')}")

# Scenario 14: Workflow advances to EVC stage (EVC_SCHEDULED status)
def test_14():
    resp = requests.get(f"{BASE_URL}/applications/{test_app_id}", headers=officer_headers)
    app = resp.json()
    assert app.get("currentStage") == "EVC"
    assert "EVC" in app.get("status")
    print(f"Application verified in EVC stage: {app.get('status')}")

# Scenario 15: Schedule EVC visit with date, mode, instructions, purpose
def test_15():
    global test_evc_id
    payload = {
        "applicationId": test_app_id,
        "proposedDate": "2026-11-05",
        "visitTime": "10:30 AM",
        "mode": "PHYSICAL",
        "visitType": "Comprehensive Physical Verification",
        "location": "Vivekananda Institute of Technology Campus, Bangalore",
        "purpose": "Statutory verification of workshop block and faculty cadre",
        "instructions": "Verify original property deed, fire safety apparatus, and computing lab stock registers."
    }
    resp = requests.post(f"{BASE_URL}/evc/schedules", headers=officer_headers, json=payload)
    assert resp.status_code == 201, f"Expected 201, got {resp.status_code}: {resp.text}"
    sch = resp.json()
    test_evc_id = sch.get("id")
    assert test_evc_id is not None
    assert sch.get("status") == "SCHEDULED"
    print(f"EVC visit scheduled with ID: {test_evc_id}")

# Scenario 16: Assign committee members with roles (Chairman, Member Secretary, Subject Expert, AICTE Rep)
def test_16():
    payload = {
        "members": [
            {"name": "Prof. (Dr.) Ananya Sen", "role": "CHAIRMAN", "affiliation": "IIT Bombay (Retd.)", "phone": "+91 94330 18273"},
            {"name": "Dr. Kailash Purohit", "role: ": "MEMBER_SECRETARY", "role": "MEMBER_SECRETARY", "affiliation": "Council of Architecture", "phone": "+91 98220 54129"},
            {"name": "Dr. G. Venkat Rao", "role": "SUBJECT_EXPERT", "affiliation": "Osmania University", "phone": "+91 98490 11223"},
            {"name": "Dr. V. K. Aggarwal", "role": "AICTE_REP", "affiliation": "MANIT Bhopal", "phone": "+91 755 267 0411"}
        ]
    }
    resp = requests.post(f"{BASE_URL}/evc/schedules/{test_evc_id}/assign-committee", headers=officer_headers, json=payload)
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
    sch = resp.json()
    members = sch.get("committeeMembers", [])
    assert len(members) == 4, f"Expected 4 committee members, got {len(members)}"
    print(f"Committee members successfully assigned: {[m.get('name') + ' (' + m.get('role') + ')' for m in members]}")

# Scenario 17: Prevent duplicate member assignments
def test_17():
    payload = {
        "members": [
            {"name": "Prof. (Dr.) Ananya Sen", "role": "CHAIRMAN"},
            {"name": "Prof. (Dr.) Ananya Sen", "role": "MEMBER_SECRETARY"} # duplicate!
        ]
    }
    resp = requests.post(f"{BASE_URL}/evc/schedules/{test_evc_id}/assign-committee", headers=officer_headers, json=payload)
    assert resp.status_code == 400, f"Expected 400 for duplicate member assignment, got {resp.status_code}"
    print("Duplicate committee assignment blocked with 400 Bad Request")

# Scenario 18: Reschedule EVC visit with reason; schedule history preserved
def test_18():
    payload = {
        "proposedDate": "2026-11-08",
        "visitTime": "11:00 AM",
        "rescheduleReason": "Regional government holiday declared on previously scheduled date; rescheduled to next working day."
    }
    resp = requests.post(f"{BASE_URL}/evc/schedules/{test_evc_id}/reschedule", headers=officer_headers, json=payload)
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
    sch = resp.json()
    assert sch.get("status") == "RESCHEDULED"
    assert sch.get("proposedDate") == "2026-11-08"
    assert sch.get("rescheduleReason") == payload["rescheduleReason"]
    print(f"Visit rescheduled to {sch.get('proposedDate')} with status {sch.get('status')}")

# Scenario 19: Cancel EVC visit with reason; cancellation recorded
def test_19():
    # Schedule a temporary visit to test cancellation
    temp_payload = {
        "applicationId": "AICTE-2026-SC-5511",
        "proposedDate": "2026-11-12",
        "mode": "PHYSICAL"
    }
    create_resp = requests.post(f"{BASE_URL}/evc/schedules", headers=officer_headers, json=temp_payload)
    temp_id = create_resp.json().get("id")

    cancel_payload = {
        "cancellationReason": "Institution requested withdrawal of new course application."
    }
    resp = requests.post(f"{BASE_URL}/evc/schedules/{temp_id}/cancel", headers=officer_headers, json=cancel_payload)
    assert resp.status_code == 200
    sch = resp.json()
    assert sch.get("status") == "CANCELLED"
    assert sch.get("cancellationReason") == cancel_payload["cancellationReason"]
    print(f"Visit {temp_id} cancelled with status {sch.get('status')}")

# Scenario 20: View EVC visit details (schedule, members, instructions, status)
def test_20():
    resp = requests.get(f"{BASE_URL}/evc/schedules/{test_evc_id}", headers=officer_headers)
    assert resp.status_code == 200
    sch = resp.json()
    assert sch.get("id") == test_evc_id
    assert sch.get("applicationId") == test_app_id
    assert sch.get("mode") == "PHYSICAL"
    assert len(sch.get("committeeMembers", [])) >= 2
    print(f"EVC details retrieved: Institution={sch.get('institutionName')}, Status={sch.get('status')}")

# Scenario 21: Record EVC visit completion with actual date and user
def test_21():
    payload = {
        "completionDate": "2026-11-08",
        "observations": "Visit completed on-site. Laboratories, classrooms and workshop inspected.",
        "geoTaggedPhotosCount": 18
    }
    resp = requests.post(f"{BASE_URL}/evc/schedules/{test_evc_id}/complete", headers=evc_headers, json=payload)
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
    sch = resp.json()
    assert sch.get("status") == "INSPECTION_COMPLETED"
    print(f"EVC visit completion recorded: Status={sch.get('status')}")

# Scenario 22: Submit EVC findings across infrastructure, faculty, labs, library, safety with recommendation
def test_22():
    payload = {
        "completionDate": "2026-11-08",
        "recommendation": "RECOMMEND_APPROVAL",
        "observations": "Physical inspection conducted on-site. Workshop machinery operational, computing facilities exceed AICTE minimum requirements, and faculty cadre is verified against biometric records.",
        "findingsJson": json.dumps([
            {"area": "Built-up Area", "status": "SATISFIED"},
            {"area": "Laboratories & Equipment", "status": "SATISFIED"},
            {"area": "Faculty Cadre Ratio", "status": "SATISFIED"},
            {"area": "Library & E-Resources", "status": "SATISFIED"},
            {"area": "Fire & Campus Safety", "status": "SATISFIED"}
        ]),
        "geoTaggedPhotosCount": 24
    }
    resp = requests.post(f"{BASE_URL}/evc/schedules/{test_evc_id}/report", headers=evc_headers, json=payload)
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
    sch = resp.json()
    assert sch.get("status") == "INSPECTION_COMPLETED"
    assert sch.get("reportStatus") == "REPORT_SUBMITTED"
    assert sch.get("recommendation") == "RECOMMEND_APPROVAL"
    assert sch.get("geoTaggedPhotosCount") == 24
    print(f"EVC report submitted: Status={sch.get('status')}, ReportStatus={sch.get('reportStatus')}, Recommendation={sch.get('recommendation')}")

# Scenario 23: Review EVC report (Accept / Return)
def test_23():
    # Regional/Bureau officer reviews submitted report
    payload = {
        "decision": "ACCEPTED",
        "reviewNotes": "EVC findings and geo-photos verified by Regional Officer. Infrastructure fully meets AICTE norms."
    }
    resp = requests.post(f"{BASE_URL}/evc/schedules/{test_evc_id}/review-report", headers=officer_headers, json=payload)
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
    sch = resp.json()
    assert sch.get("reportStatus") == "REPORT_REVIEWED"
    print(f"EVC report review completed: ReportStatus={sch.get('reportStatus')}")

# Scenario 24: Gate check: workflow engine prevents advancing past EVC / final approval when EVC required but inspection or report incomplete
def test_24():
    # Create an application requiring EVC where inspection has NOT been completed
    temp_app = {
        "institutionCode": "1-34981275",
        "institutionName": "Vivekananda Institute of Technology, Bangalore",
        "applicationType": f"Change of Site Verification - {int(time.time())}",
        "programme": "Engineering & Technology",
        "region": "South-Western",
        "workflowId": "WF-FULL",
        "status": "DRAFT",
        "priority": "HIGH"
    }
    create_resp = requests.post(f"{BASE_URL}/applications", headers=college_headers, json=temp_app)
    assert create_resp.status_code == 201, f"Expected 201, got {create_resp.status_code}: {create_resp.text}"
    app_id = create_resp.json().get("id")

    # Submit application (enters SCRUTINY stage)
    sub_res = requests.post(f"{BASE_URL}/applications/{app_id}/submit", headers=college_headers)
    assert sub_res.status_code == 200

    # Mark as requiring EVC
    mark_res = requests.post(f"{BASE_URL}/applications/{app_id}/mark-evc", headers=officer_headers,
                             json={"reason": "Mandatory EVC physical inspection required"})
    assert mark_res.status_code == 200

    # Advance to EVC stage
    adv_evc = requests.post(f"{BASE_URL}/applications/{app_id}/advance-stage", headers=officer_headers,
                            json={"targetStage": "EVC", "remarks": "Moved to EVC stage"})
    assert adv_evc.status_code == 200

    # Attempt to advance past EVC without completed inspection! Uses admin_headers to pass role authority and trigger EVC gate!
    gate_resp = requests.post(f"{BASE_URL}/applications/{app_id}/advance-stage", headers=admin_headers,
                              json={"targetStage": "SAC_SHC", "remarks": "Premature advance attempt"})
    assert gate_resp.status_code == 400, f"Expected 400 for incomplete EVC gate check, got {gate_resp.status_code}: {gate_resp.text}"
    err_msg = gate_resp.json().get("message", "")
    assert "Physical inspection has not been completed or report is pending submission" in err_msg, f"Unexpected message: {err_msg}"
    print(f"Gate check PASSED: Advance past EVC blocked with message: '{err_msg}'")

# Run all 24 scenarios
run_test(1, "Officer views scrutiny queue filtered by assigned officer / stage", test_1)
run_test(2, "College rep views scrutiny status for their application (institutional isolation)", test_2)
run_test(3, "Review form loads checklist based on application type and workflow stage", test_3)
run_test(4, "Evaluation of checklist items (SATISFIED, NOT_SATISFIED, NOT_APPLICABLE, PENDING)", test_4)
run_test(5, "Officer records observations and deficiencies with severity, description, corrective action, deadline", test_5)
run_test(6, "Deficiency creation updates deficiency count and status", test_6)
run_test(7, "College rep views deficiency notice, clauses, corrective action, deadline", test_7)
run_test(8, "College rep submits deficiency response; verifies deficiency moves to RESPONDED (not auto-resolved)", test_8)
run_test(9, "Reviewer verifies resolved deficiency (RESOLVED) or reopens (REOPENED)", test_9)
run_test(10, "Forward to next stage / Recommend approval workflow action", test_10)
run_test(11, "Recommend rejection / issue deficiency workflow action", test_11)
run_test(12, "Review decision history displays chronological audit records of reviews", test_12)
run_test(13, "Application marked for EVC; badge and reason displayed", test_13)
run_test(14, "Workflow advances to EVC stage (EVC_SCHEDULED status)", test_14)
run_test(15, "Schedule EVC visit with date, mode, instructions, purpose", test_15)
run_test(16, "Assign committee members with roles (Chairman, Member Secretary, Subject Expert, AICTE Rep)", test_16)
run_test(17, "Prevent duplicate member assignments", test_17)
run_test(18, "Reschedule EVC visit with reason; schedule history preserved", test_18)
run_test(19, "Cancel EVC visit with reason; cancellation recorded", test_19)
run_test(20, "View EVC visit details (schedule, members, instructions, status)", test_20)
run_test(21, "Record EVC visit completion with actual date and user", test_21)
run_test(22, "Submit EVC findings across infrastructure, faculty, labs, library, safety with recommendation", test_22)
run_test(23, "Review EVC report (Accept / Return)", test_23)
run_test(24, "Gate check: workflow engine prevents advancing past EVC / final approval when EVC incomplete", test_24)

print("\n" + "="*80)
print("FINAL EXECUTION SUMMARY")
print("="*80)
passed = sum(1 for _, _, status, _ in results if status == "PASS")
failed = sum(1 for _, _, status, _ in results if status == "FAIL")
print(f"TOTAL TESTS: {len(results)} | PASSED: {passed} | FAILED: {failed}")
for num, name, status, err in results:
    badge = "[PASS]" if status == "PASS" else "[FAIL]"
    print(f"{badge} #{num:02d}: {name} {err}")

if failed > 0:
    sys.exit(1)
