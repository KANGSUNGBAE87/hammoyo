# Validation Results

## Structural validator

[FACT] P4 package validator command run:

```bash
python3 /Users/kangsungbae/Documents/지식저장소/planning-lab/00_SYSTEM/validate_stage_artifacts.py /Users/kangsungbae/Documents/지식저장소/planning-lab/20_RUNS/PL-P2-P3-P4-HAMMOYEO-2026-06-23-t_5fd833b9/P4_HAMMOYEO --stage P4_FINAL_PACKAGE
```

Result:

```json
{
  "ok": true,
  "root": "/Users/kangsungbae/Documents/지식저장소/planning-lab/20_RUNS/PL-P2-P3-P4-HAMMOYEO-2026-06-23-t_5fd833b9/P4_HAMMOYEO",
  "stage": "P4_FINAL_PACKAGE",
  "missing_files": [],
  "missing_headings": {},
  "status_issues": [],
  "extra_issues": [],
  "note": "Structural validation only; Chair/Verifier must judge content quality."
}
```

## P2/P3 validation note

[FACT] The helper supports one `STATUS.yaml stage` per validator run. This corrective run contains P2/P3/P4 artifacts under one Owner-approved execution and uses `stage: P4_FINAL_PACKAGE` in the canonical `STATUS.yaml`, so direct P2/P3 helper runs report only stage mismatch even though required P2/P3 files/headings exist.

[INFERENCE] P2/P3 files were manually checked against `STAGE_ARTIFACT_POLICY.md` and `QUALITY_GATES.md` required artifact lists and headings.

## Gate decision

[INFERENCE] P4 structural validation passed and root verifier report marks `COMPLETE_ALLOWED`, with live-evidence caveat and no `FINAL_APPROVED`.
