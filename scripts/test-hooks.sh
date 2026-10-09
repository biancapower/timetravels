#!/usr/bin/env bash
set -euo pipefail

# Regression test for scripts/claude-guard.sh. Sources the guard's
# guard_check() function (does not copy its patterns) and runs it against
# three lists:
#   must_block  - commands the guard must refuse (exit 2 from the hook)
#   must_allow  - commands the guard must let through
#   known_gaps  - commands that conceptually should be blocked but the
#                 current regex does not catch; asserted as "currently
#                 allowed" so a future fix to claude-guard.sh shows up here
#                 as a test change, not a silent behavior change.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/claude-guard.sh"

fail=0

# --- must_block: every destructive form from CLAUDE.md's "Claude never" ---
must_block=(
  'git push --force origin main'
  'git push -f origin main'
  'git push --force origin feature-branch'
  'git push --force'
  'git push -f'
  'git push -uf origin feature'
  'git push --force-with-lease'
  'git push origin +feature'
  'git push --force-with-lease origin main'
  'git push origin +main'
  'git push origin +refs/heads/main:main'
  'GIT_SSH_COMMAND=ssh git push --force origin main'
  'sudo git push --force origin main'
  '/usr/bin/git push --force origin main'
  'git -C /tmp/repo push --force origin main'
  'bash -c "git push --force origin main"'
  '(git push --force origin main)'
  'echo done && git push --force origin main'
  'echo done; git push --force origin main'
  'git commit --no-verify -m wip'
  'wrangler deploy'
  'wrangler pages deploy ./dist'
  'pnpm publish'
  'npm publish --tag beta'
  'gh repo edit owner/repo --visibility public'
  'gh release create v1.0.0'
  'git tag v1.0.0'
  'git tag -a v1.0.0 -m "release"'
  'git push --tags'
  'git push origin --follow-tags'
  'git push origin refs/tags/v1.0.0'
  # Documented over-block: "--no-verify anywhere" also catches it inside
  # an unrelated grep argument. False positive, not a security gap.
  'grep -- --no-verify README.md'
  # Documented over-block: any short-flag cluster containing f in a
  # command that also mentions git and push, such as rm -rf before a push.
  'rm -rf dist && git push'
)

# --- must_allow: routine commands that must not be touched ---
must_allow=(
  'git push'
  'git push origin feature'
  'git push -u origin feature'
  'git push origin feature && echo a+b'
  'git tag --list'
  'git tag -l'
  'pnpm test'
  'pnpm run build'
  'npm install'
  'wrangler --version'
  'gh repo view owner/repo'
  'gh pr create --title x --body y'
  "git commit -m 'fix: something'"
  'git log --oneline -5'
)

# --- known_gaps: honestly documented holes in the regex, not fixed here ---
known_gaps=(
  # Quote-splitting: bash removes the empty '' and runs a real
  # --force, but the raw string the hook sees never contains the
  # literal substring "--force".
  "git push --forc''e origin main"
  # Pushing a tag by its bare name looks the same as pushing a branch.
  'git push origin v1.0.0'
  # Base64 + eval: the dangerous command never appears as plaintext in
  # the string the hook scans.
  'eval "$(base64 -d <<< Z2l0IHB1c2ggLS1mb3JjZSBvcmlnaW4gbWFpbg==)"'
)

check_list() {
  local label="$1" expect="$2"
  shift 2
  local cmd reason blocked
  for cmd in "$@"; do
    if reason="$(guard_check "$cmd")"; then
      blocked=allow
    else
      blocked=block
    fi
    if [ "$blocked" != "$expect" ]; then
      echo "FAIL [$label] expected $expect, got $blocked: $cmd"
      fail=$((fail + 1))
    fi
  done
}

check_list "must_block" block "${must_block[@]}"
check_list "must_allow" allow "${must_allow[@]}"
check_list "known_gaps" allow "${known_gaps[@]}"

# --- hook entrypoint: the JSON payload Claude Code sends, end to end ---
run_hook() {
  local cmd="$1" path="$2" status=0
  jq -cn --arg c "$cmd" '{tool_name: "Bash", tool_input: {command: $c}}' \
    | PATH="$path" "$SCRIPT_DIR/claude-guard.sh" >/dev/null 2>&1 || status=$?
  echo "$status"
}

check_hook() {
  local label="$1" expect="$2" cmd="$3" path="$4" got
  got="$(run_hook "$cmd" "$path")"
  if [ "$got" != "$expect" ]; then
    echo "FAIL [hook:$label] expected exit $expect, got $got: $cmd"
    fail=$((fail + 1))
  fi
}

# A PATH holding the tools the guard needs, except jq.
no_jq_bin="$(mktemp -d)"
trap 'rm -rf "$no_jq_bin"' EXIT
for tool in bash cat grep; do
  ln -s "$(command -v "$tool")" "$no_jq_bin/$tool"
done

check_hook "escaped quotes" 2 'bash -c "git push --force origin main"' "$PATH"
check_hook "routine" 0 'git status' "$PATH"
check_hook "no jq fails closed" 2 'git status' "$no_jq_bin"
hook_cases=3

total=$(( ${#must_block[@]} + ${#must_allow[@]} + ${#known_gaps[@]} + hook_cases ))

if [ "$fail" -eq 0 ]; then
  echo "test-hooks: PASS - ${total} cases (${#must_block[@]} block, ${#must_allow[@]} allow, ${#known_gaps[@]} known-gap, ${hook_cases} hook)"
  exit 0
else
  echo "test-hooks: FAIL - ${fail}/${total} cases wrong"
  exit 1
fi
