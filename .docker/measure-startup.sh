#!/bin/bash
# NFR-T1: how long does a container take to be *ready*? Ready = DISPLAY live (Xvfb + WM)
# and sshd accepting connections. Measured from a cold `docker run` of a built tag.
#
#   ./.docker/measure-startup.sh                                   # the two default tags
#   ./.docker/measure-startup.sh xyteam/autobdd-base:dev           # specific tags
#
# The polling runs INSIDE the container (a single docker exec), so docker-exec latency does
# not inflate the numbers; elapsed time is measured against the clock captured on the host
# immediately before `docker run`, which is what a user experiences.
set -euo pipefail

TAGS=("$@")
[ "${#TAGS[@]}" -eq 0 ] && TAGS=("xyteam/autobdd-base:dev" "xyteam/autobdd-framework:dev")

NAME=abdd-startup-measure
PORT=24222
BUDGET_MS=10000   # NFR-T1

for tag in "${TAGS[@]}"; do
    docker rm -f "$NAME" >/dev/null 2>&1 || true
    start=$(date +%s%N)
    docker run -d --name "$NAME" --privileged --shm-size 512M -p "${PORT}:22" \
        -e USER="${USER:-root}" -e HOSTOS="$(uname -s)" -e USERID="$(id -u)" -e GROUPID="$(id -g)" \
        -e PASSWORD=ubuntu -e RESOLUTION=1920x1200x24 \
        "$tag" /root/autobdd-dev.startup.sh >/dev/null

    out=$(docker exec -e T0="${start}" "$NAME" bash -c '
        ms() { echo $(( ($(date +%s%N) - T0) / 1000000 )); }
        d=""; s=""
        for _ in $(seq 1 600); do
            [ -z "$d" ] && DISPLAY=:1 xdpyinfo >/dev/null 2>&1 && d=$(ms)
            [ -z "$s" ] && (exec 3<>/dev/tcp/127.0.0.1/22) 2>/dev/null && s=$(ms)
            [ -n "$d" ] && [ -n "$s" ] && break
            sleep 0.05
        done
        echo "${d:-timeout} ${s:-timeout}"' 2>/dev/null) || out="timeout timeout"

    docker rm -f "$NAME" >/dev/null 2>&1 || true

    read -r disp_ms ssh_ms <<<"${out:-timeout timeout}" || true
    if [ "${disp_ms:-timeout}" = timeout ] || [ "${ssh_ms:-timeout}" = timeout ]; then
        printf '%-42s NOT READY (display=%s sshd=%s)\n' "$tag" "${disp_ms:-?}" "${ssh_ms:-?}"
        continue
    fi

    ready=$(( disp_ms > ssh_ms ? disp_ms : ssh_ms ))
    verdict=ok
    [ "$ready" -gt "$BUDGET_MS" ] && verdict="OVER BUDGET"
    printf '%-42s display=%5s ms  sshd=%5s ms  ready=%5s ms  (NFR-T1 <= %s ms)  %s\n' \
        "$tag" "$disp_ms" "$ssh_ms" "$ready" "$BUDGET_MS" "$verdict"
done
