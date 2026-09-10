#!/bin/sh
# Deletes the remote branches whose commits are already on main or on
# develop. Run it from a clone with push rights — it is a shell script
# rather than something that happened in a session because this
# repository's git gateway answers a delete push with HTTP 403 while
# taking ordinary pushes fine, so the branches could be listed but not
# removed.
#
#   sh test/tools/prune-branches.sh          # list what it would delete
#   sh test/tools/prune-branches.sh --delete # delete it
#
# It works out the list rather than carrying one, so it stays right as
# more branches are merged. Nothing unmerged is ever named: a branch is
# only listed when every one of its commits is already reachable from
# main or develop, which is the definition of having nothing of its own
# left to lose.
set -e

KEEP="main develop checkpoint/live-2026-09-04 known-good known-good-2026-09-04"

git fetch origin --prune

merged=""
for ref in $(git for-each-ref --format='%(refname:short)' refs/remotes/origin \
             | sed 's|^origin/||' | grep -v '^HEAD$'); do
  case " $KEEP " in *" $ref "*) continue ;; esac
  case "$ref" in claude/*) continue ;; esac      # a session's own branch
  sha=$(git rev-parse "origin/$ref")
  if git merge-base --is-ancestor "$sha" origin/main ||
     git merge-base --is-ancestor "$sha" origin/develop; then
    merged="$merged $ref"
  fi
done

if [ -z "$merged" ]; then
  echo "nothing to prune"
  exit 0
fi

count=$(echo $merged | wc -w | tr -d ' ')
if [ "$1" != "--delete" ]; then
  echo "$count merged branches; --delete to remove them:"
  for ref in $merged; do echo "  $ref"; done
  echo
  echo "kept: $KEEP, and anything with commits of its own"
  exit 0
fi

# In batches, because one push per branch is one round trip per branch.
echo $merged | xargs -n 20 git push origin --delete
echo "deleted $count"
