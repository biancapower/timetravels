#!/usr/bin/env bash
set -euo pipefail

# Claude Code PreToolUse hook for the Bash tool.
#
# Reads the hook payload Claude Code sends on stdin
# (https://code.claude.com/docs/en/hooks), pulls out tool_input.command,
# and exits 2 with a one-line reason on stderr to block the small set of
# destructive commands CLAUDE.md says a human must run instead. Exit 0
# allows the command through to the normal permission flow.
#
# Detection below is substring/regex matching on the raw command string,
# not a shell parser. That is a deliberate tradeoff: it still matches the
# command inside env-var prefixes, sudo, absolute paths, git -C, bash -c
# wrappers, subshells, and &&/; chains, because those forms still contain
# the literal substrings we look for. It can be defeated by real
# obfuscation (quote-splitting, command substitution, base64+eval) --
# scripts/test-hooks.sh documents those as known gaps rather than hiding
# them.
#
# Patterns live in guard_check() below so scripts/test-hooks.sh can
# source this file and exercise the same logic the hook runs.

GUARD_NO_VERIFY='--no-verify'
GUARD_FORCE_FLAG='--force|(^|[[:space:]])-[a-zA-Z]*f[a-zA-Z]*([[:space:]]|$)'
GUARD_PLUS_REFSPEC='(^|[[:space:]])\+[^[:space:]]'
GUARD_WRANGLER_DEPLOY='\bwrangler\b[[:space:]]+(pages[[:space:]]+)?deploy\b'
GUARD_PUBLISH='\b(pnpm|npm)\b[[:space:]]+publish\b'
GUARD_GH_VISIBILITY='\bgh\b[[:space:]]+repo[[:space:]]+edit\b.*--visibility\b'
GUARD_GH_RELEASE='\bgh\b[[:space:]]+release[[:space:]]+create\b'
GUARD_LIST_FLAG='(^|[[:space:]])(-l|--list)([[:space:]]|$)'

# guard_check CMD
# Prints a one-line reason and returns 1 if CMD should be blocked;
# returns 0 (silent) if it is allowed.
guard_check() {
  local cmd="$1"

  # Forced git push to any branch: --force (also matches
  # --force-with-lease, since "--force" is a prefix of it), a short-flag
  # cluster containing f (-f, -uf), or a "+" refspec (which forces
  # implicitly even without --force).
  if grep -qE -- '\bgit\b' <<<"$cmd" \
    && grep -qE -- '\bpush\b' <<<"$cmd" \
    && { grep -qE -- "$GUARD_FORCE_FLAG" <<<"$cmd" || grep -qE -- "$GUARD_PLUS_REFSPEC" <<<"$cmd"; }; then
    echo "blocked: force-push; a human does this"
    return 1
  fi

  if grep -qF -- "$GUARD_NO_VERIFY" <<<"$cmd"; then
    echo "blocked: --no-verify bypasses hooks"
    return 1
  fi

  if grep -qE -- "$GUARD_WRANGLER_DEPLOY" <<<"$cmd"; then
    echo "blocked: wrangler deploy; a human deploys"
    return 1
  fi

  if grep -qE -- "$GUARD_PUBLISH" <<<"$cmd"; then
    echo "blocked: package publish; a human publishes"
    return 1
  fi

  if grep -qE -- "$GUARD_GH_VISIBILITY" <<<"$cmd"; then
    echo "blocked: gh repo edit --visibility changes repo visibility; a human does this"
    return 1
  fi

  if grep -qE -- "$GUARD_GH_RELEASE" <<<"$cmd"; then
    echo "blocked: gh release create tags a release; a human does this"
    return 1
  fi

  # git tag, unless it's a listing (-l / --list). Both tokens present
  # anywhere is deliberately loose -- see test-hooks.sh known gaps.
  if grep -qE -- '\bgit\b' <<<"$cmd" && grep -qE -- '\btag\b' <<<"$cmd"; then
    if ! grep -qE -- "$GUARD_LIST_FLAG" <<<"$cmd"; then
      echo "blocked: git tag creates a release tag; a human does this"
      return 1
    fi
  fi

  return 0
}

# Only run as a hook when executed directly, not when sourced by the test.
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
  payload="$(cat)"

  # Without jq the command cannot be read reliably, so fail closed.
  if ! command -v jq >/dev/null 2>&1; then
    echo "blocked: the guard needs jq to read the command; install jq" >&2
    exit 2
  fi
  command_str="$(jq -r '.tool_input.command // ""' <<<"$payload")"

  if [ -z "$command_str" ]; then
    exit 0
  fi

  if ! reason="$(guard_check "$command_str")"; then
    echo "$reason" >&2
    exit 2
  fi

  exit 0
fi
