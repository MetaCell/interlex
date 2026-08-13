/**
 * Who may merge a pull request.
 *
 * The backend checks this twice, against two different sets:
 *
 *   Stage 1 (middleware, against the group in the request path — which for a merge must be the
 *   PR's *to* group): skipped entirely when that group is your own username; otherwise your
 *   role there must be admin, owner or contributor.
 *
 *   Stage 4 (mergePull, against the PR's real to-group): passes automatically when the to-group
 *   is you; otherwise any role better than `view` — admin, owner, contributor *or curator*.
 *
 * The narrower stage wins, so the effective requirement is contributor-or-better. Curator is
 * the role documented as "can review, merge, and submit prs" and is what mergePull itself
 * accepts, but stage 1 turns it away with a 401 — surfaced here as its own reason rather than
 * being folded into "no permission", because it is a backend gap, not a user error.
 */

/** Roles stage 1 lets through — the effective requirement for merging. */
export const MERGE_ROLES = new Set(['admin', 'owner', 'contributor']);

/** Roles mergePull itself accepts; the extra one is blocked earlier. */
export const REVIEW_ROLES = new Set([...MERGE_ROLES, 'curator']);

/**
 * Role payloads differ per endpoint: `/priv/role` may answer with a bare string or an object,
 * `/priv/role-other` with [role, group] pairs. Reduce whatever arrives to a lowercase role.
 */
export const normalizeRole = (value) => {
  if (!value) return null;
  if (typeof value === 'string') return value.trim().toLowerCase() || null;
  if (Array.isArray(value)) return normalizeRole(value[0]);
  if (typeof value === 'object') {
    const candidate = value.role ?? value['user-role'] ?? value['own-role'] ?? value.user_role;
    return normalizeRole(candidate);
  }
  return null;
};

/**
 * Is this user an InterLex admin?
 *
 * The only signal available is `GET /<group>/priv/role-other`, which answers an admin with
 * `[["admin", "empty"]]` — the role is what matters, the group name that comes with it is a
 * placeholder and carries no meaning, so this looks at the role alone.
 *
 * An admin reviews changes to curated, so the UI treats them as a reviewer of every request;
 * the backend still has the final say and its refusal is surfaced if it disagrees.
 */
export const isAdminFromRoles = (pairs) =>
  (Array.isArray(pairs) ? pairs : []).some(pair => normalizeRole(pair) === 'admin');

/** [[role, group], ...] (GET /<group>/priv/role-other) -> { group: role }. */
export const rolesByGroupFromPairs = (pairs) => {
  const map = {};
  (Array.isArray(pairs) ? pairs : []).forEach(pair => {
    if (Array.isArray(pair) && pair.length >= 2) {
      map[String(pair[1])] = normalizeRole(pair[0]);
    }
  });
  return map;
};

/**
 * Can this user merge this request, and if not, why not?
 * `role` is the user's role in the PR's to-group, when known.
 */
export const mergeEligibility = ({ user, record, role, isAdmin = false }) => {
  if (!user?.groupname) {
    return { canReview: false, canMerge: false, reason: 'Log in to review this merge request.' };
  }
  if (!record) {
    return { canReview: false, canMerge: false, reason: null };
  }

  const status = String(record.rawStatus || '').toLowerCase();
  const toGroup = record.toGroup;

  // Merging into your own group short-circuits both checks, and an admin reviews everything.
  const ownGroup = toGroup === user.groupname;
  const normalized = normalizeRole(role);
  const canMergeRole = isAdmin || ownGroup || MERGE_ROLES.has(normalized);
  const canReviewRole = isAdmin || ownGroup || REVIEW_ROLES.has(normalized);

  if (!canReviewRole) {
    return {
      canReview: false,
      canMerge: false,
      reason: `You need contributor or better on "${toGroup}" to review this merge request.`,
    };
  }

  // Only a pending request can be merged; mergePull requires status = 'pending'.
  if (status && status !== 'pending') {
    return {
      canReview: true,
      canMerge: false,
      reason: `This merge request is ${status} and can no longer be merged.`,
    };
  }

  if (!canMergeRole) {
    return {
      canReview: true,
      canMerge: false,
      reason:
        `Curators can merge in the data model, but the API rejects them at the permission check ` +
        `— contributor or better on "${toGroup}" is required.`,
    };
  }

  return { canReview: true, canMerge: true, reason: null };
};
