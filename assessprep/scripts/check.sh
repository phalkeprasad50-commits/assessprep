#!/usr/bin/env bash
# Quick health check for the local AssessPrep stack.
set -euo pipefail

declare -A CHECKS=(
  ["app health"]="http://localhost:8080/actuator/health"
  ["app metrics"]="http://localhost:8080/actuator/prometheus"
  ["prometheus"]="http://localhost:9090/-/ready"
  ["grafana"]="http://localhost:3000/api/health"
)

failed=0
for name in "${!CHECKS[@]}"; do
  url="${CHECKS[$name]}"
  if curl -fsS --max-time 5 "$url" >/dev/null; then
    echo "OK    $name  ($url)"
  else
    echo "FAIL  $name  ($url)"
    failed=1
  fi
done

exit "$failed"
