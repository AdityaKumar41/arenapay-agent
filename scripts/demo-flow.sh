#!/usr/bin/env bash
set -euo pipefail

# arenapay Demo Flow Verification Script
# Verifies all services are running and demo endpoints work.

ORACLE_URL="${ORACLE_URL:-http://localhost:8000}"
API_URL="${API_URL:-http://localhost:3000}"
MINIAPP_URL="${MINIAPP_URL:-http://localhost:5173}"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m'

pass=0
fail=0

check() {
  local desc="$1"
  local url="$2"
  local expected="${3:-200}"

  status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" 2>/dev/null || echo "000")
  if [ "$status" = "$expected" ]; then
    echo -e "  ${GREEN}✓${NC} $desc (HTTP $status)"
    pass=$((pass + 1))
  else
    echo -e "  ${RED}✗${NC} $desc (HTTP $status, expected $expected)"
    fail=$((fail + 1))
  fi
}

check_json() {
  local desc="$1"
  local url="$2"
  local method="${3:-GET}"
  local body="${4:-}"

  if [ "$method" = "POST" ]; then
    response=$(curl -s --max-time 5 -X POST -H "Content-Type: application/json" -d "$body" "$url" 2>/dev/null || echo "ERROR")
  else
    response=$(curl -s --max-time 5 "$url" 2>/dev/null || echo "ERROR")
  fi

  if [ "$response" != "ERROR" ] && echo "$response" | python3 -c "import sys,json; json.load(sys.stdin)" 2>/dev/null; then
    echo -e "  ${GREEN}✓${NC} $desc"
    pass=$((pass + 1))
  else
    echo -e "  ${RED}✗${NC} $desc"
    fail=$((fail + 1))
  fi
}

echo ""
echo "================================================"
echo "  arenapay - Demo Flow Verification"
echo "================================================"
echo ""

echo "1. Service Health Checks"
echo "------------------------"
check "Oracle health" "$ORACLE_URL/health"
check "API health" "$API_URL/health"
check "Mini-App serves index" "$MINIAPP_URL"

echo ""
echo "2. Oracle Endpoints"
echo "-------------------"
check_json "Score compute" "$ORACLE_URL/score/compute" "POST" '{"address":"EQTestDemoAddress001"}'
check_json "Score lookup" "$ORACLE_URL/score/EQTestDemoAddress001"
check_json "Threat analysis" "$ORACLE_URL/threat/analyze" "POST" '{"sender_address":"EQTestDemoAddress001","recipient_address":"EQTestDemoAddress002","amount_nanoton":1000000000}'
check_json "Identity lookup" "$ORACLE_URL/identity/EQTestDemoAddress001"

echo ""
echo "3. API Endpoints"
echo "----------------"
check_json "Reputation fetch" "$API_URL/api/v1/reputation/EQTestDemoAddress001"
check_json "Payment preview" "$API_URL/api/v1/payment/preview" "POST" '{"senderAddress":"EQTestDemoAddress001","recipientAddress":"EQTestDemoAddress002","amountNanoton":1000000000}'
check_json "Threat check" "$API_URL/api/v1/threat/check" "POST" '{"senderAddress":"EQTestDemoAddress001","recipientAddress":"EQTestDemoAddress002","amountNanoton":1000000000}'

echo ""
echo "4. Demo Tier Verification"
echo "-------------------------"

# Compute a score and verify tier mapping
score_response=$(curl -s --max-time 5 -X POST -H "Content-Type: application/json" \
  -d '{"address":"EQTestDemoAddress001"}' \
  "$ORACLE_URL/score/compute" 2>/dev/null || echo "{}")

score=$(echo "$score_response" | python3 -c "import sys,json; print(json.load(sys.stdin).get('score', -1))" 2>/dev/null || echo "-1")
tier=$(echo "$score_response" | python3 -c "import sys,json; print(json.load(sys.stdin).get('tier', 'unknown'))" 2>/dev/null || echo "unknown")

if [ "$score" != "-1" ]; then
  echo -e "  ${GREEN}✓${NC} Score computed: $score (tier: $tier)"
  pass=$((pass + 1))
else
  echo -e "  ${RED}✗${NC} Failed to compute score"
  fail=$((fail + 1))
fi

echo ""
echo "================================================"
echo -e "  Results: ${GREEN}$pass passed${NC}, ${RED}$fail failed${NC}"
echo "================================================"
echo ""

if [ "$fail" -gt 0 ]; then
  echo -e "${YELLOW}Some checks failed. Make sure all services are running:${NC}"
  echo "  docker compose up -d"
  echo "  # or manually start oracle, api, and mini-app"
  exit 1
else
  echo -e "${GREEN}All checks passed! Ready for demo.${NC}"
fi
