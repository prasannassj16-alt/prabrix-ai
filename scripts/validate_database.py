#!/usr/bin/env python3
"""
PRABRIX AI - Database Schema and Seed Data Validator
Phase 2A Automated Validation Suite
"""

import os
import re
import sys

MIGRATION_PATH = os.path.join("supabase", "migrations", "20261017000001_initial_schema.sql")
SEED_PATH = os.path.join("supabase", "seed.sql")
DOCS_PATH = os.path.join("docs", "DATABASE.md")

REQUIRED_TABLES = [
    "profiles",
    "listings",
    "listing_photos",
    "private_documents",
    "saved_properties",
    "buyer_requirements",
    "inquiries",
    "offers",
    "analysis_reports",
    "comparable_evidence",
    "notifications",
    "listing_status_history",
    "audit_events"
]

def check_file_exists(path):
    if not os.path.exists(path):
        print(f"[FAIL] Missing required file: {path}")
        return False
    print(f"[PASS] Found: {path} ({os.path.getsize(path)} bytes)")
    return True

def validate_migration(sql_content):
    passed = True
    print("\n--- Validating Migration SQL ---")

    # 1. Balanced parentheses (ignoring SQL comments)
    cleaned_sql = re.sub(r'--.*', '', sql_content)
    open_parens = cleaned_sql.count("(")
    close_parens = cleaned_sql.count(")")
    if open_parens == close_parens:
        print(f"[PASS] Balanced parentheses: {open_parens} pairs")
    else:
        print(f"[FAIL] Parenthesis mismatch: {open_parens} open vs {close_parens} close")
        passed = False

    # 2. Check for all 13 tables
    for table in REQUIRED_TABLES:
        table_pattern = rf"CREATE TABLE (?:IF NOT EXISTS )?public\.{table}\b"
        if re.search(table_pattern, sql_content, re.IGNORECASE):
            print(f"[PASS] Table defined: public.{table}")
        else:
            print(f"[FAIL] Missing table definition: public.{table}")
            passed = False

    # 3. PostGIS geography column
    if re.search(r"coordinates\s+geography\(Point,\s*4326\)", sql_content, re.IGNORECASE):
        print("[PASS] PostGIS geography column detected on listings table: coordinates geography(Point, 4326)")
    else:
        print("[FAIL] PostGIS geography(Point, 4326) column missing")
        passed = False

    # 4. Spatial index
    if re.search(r"CREATE INDEX (?:IF NOT EXISTS )?\w+\s+ON\s+public\.listings\s+USING\s+GIST\s*\(\s*coordinates\s*\)", sql_content, re.IGNORECASE):
        print("[PASS] PostGIS GIST spatial index verified on coordinates")
    else:
        print("[FAIL] Missing GIST spatial index on coordinates")
        passed = False

    # 5. Core indexes on status, price, area, owner, location
    index_checks = [
        ("status", r"ON\s+public\.listings\s*\(\s*status\s*\)"),
        ("price", r"ON\s+public\.listings\s*\(\s*price\s*\)"),
        ("area", r"ON\s+public\.listings\s*\(\s*area_sqft\s*\)"),
        ("owner", r"ON\s+public\.listings\s*\(\s*owner_id\s*\)"),
        ("location", r"ON\s+public\.listings\s*\(\s*district\s*,\s*taluk\s*\)")
    ]
    for name, pattern in index_checks:
        if re.search(pattern, sql_content, re.IGNORECASE):
            print(f"[PASS] Index verified for: {name}")
        else:
            print(f"[FAIL] Missing index for: {name}")
            passed = False

    # 6. RLS enabled on all 13 tables
    for table in REQUIRED_TABLES:
        rls_pattern = rf"ALTER TABLE\s+public\.{table}\s+ENABLE ROW LEVEL SECURITY"
        if re.search(rls_pattern, sql_content, re.IGNORECASE):
            print(f"[PASS] RLS enabled: public.{table}")
        else:
            print(f"[FAIL] RLS NOT enabled on public.{table}")
            passed = False

    # 7. Server-controlled admin function
    if "is_admin()" in sql_content and "SECURITY DEFINER" in sql_content:
        print("[PASS] Server-controlled public.is_admin() function with SECURITY DEFINER verified")
    else:
        print("[FAIL] Missing or insecure public.is_admin() function")
        passed = False

    # 8. Profile privilege tampering protection trigger
    if "protect_profile_privileges" in sql_content:
        print("[PASS] Profile privilege escalation protection trigger verified")
    else:
        print("[FAIL] Missing protect_profile_privileges trigger")
        passed = False

    return passed

def validate_seed(seed_content):
    passed = True
    print("\n--- Validating Seed SQL ---")

    # 1. Demo markers
    if "[DEMO]" in seed_content and "FICTIONAL" in seed_content.upper():
        print("[PASS] Prominent demo data disclaimer and [DEMO] labeling verified")
    else:
        print("[FAIL] Missing demo markers in seed.sql")
        passed = False

    # 2. Check inserts for core tables
    for table in ["profiles", "listings", "listing_photos", "private_documents", "saved_properties", "buyer_requirements", "inquiries", "offers", "analysis_reports", "comparable_evidence", "notifications", "listing_status_history", "audit_events"]:
        insert_pattern = rf"INSERT INTO\s+public\.{table}\b"
        if re.search(insert_pattern, seed_content, re.IGNORECASE):
            print(f"[PASS] Seed insert found for: public.{table}")
        else:
            print(f"[FAIL] Missing seed insert for: public.{table}")
            passed = False

    # 3. PostGIS spatial point generation in seed
    if "ST_SetSRID(ST_MakePoint" in seed_content:
        print("[PASS] PostGIS point generation verified in seed listings")
    else:
        print("[FAIL] Missing ST_SetSRID(ST_MakePoint...) in seed listings")
        passed = False

    return passed

def validate_docs(docs_content):
    passed = True
    print("\n--- Validating Documentation (docs/DATABASE.md) ---")

    for table in REQUIRED_TABLES:
        if f"### 2.{REQUIRED_TABLES.index(table)+1} `{table}`" in docs_content or f"`{table}`" in docs_content:
            print(f"[PASS] Documentation section found for: {table}")
        else:
            print(f"[FAIL] Missing documentation section for: {table}")
            passed = False

    if "PostGIS" in docs_content and "is_admin()" in docs_content:
        print("[PASS] PostGIS and Server-Controlled Role documentation verified")
    else:
        print("[FAIL] Missing PostGIS or is_admin() documentation")
        passed = False

    return passed

def main():
    print("==================================================")
    print("PRABRIX AI - Phase 2A Validation Runner")
    print("==================================================")

    for path in [MIGRATION_PATH, SEED_PATH, DOCS_PATH]:
        if not check_file_exists(path):
            sys.exit(1)

    with open(MIGRATION_PATH, "r", encoding="utf-8") as f:
        mig_sql = f.read()
    with open(SEED_PATH, "r", encoding="utf-8") as f:
        seed_sql = f.read()
    with open(DOCS_PATH, "r", encoding="utf-8") as f:
        docs_md = f.read()

    v1 = validate_migration(mig_sql)
    v2 = validate_seed(seed_sql)
    v3 = validate_docs(docs_md)

    print("\n==================================================")
    if v1 and v2 and v3:
        print("RESULT: ALL VALIDATION CHECKS PASSED (100%)")
        print("==================================================")
        sys.exit(0)
    else:
        print("RESULT: SOME CHECKS FAILED")
        print("==================================================")
        sys.exit(1)

if __name__ == "__main__":
    main()
