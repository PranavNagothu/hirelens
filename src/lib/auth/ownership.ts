// The security spine.
//
// Every object in HireLens (an Application, and the Candidate and Job it hangs off) belongs to one
// Organization. The single authorization rule is: a caller may only reach objects owned by THEIR
// org. This module is the one place that rule is expressed, so every route enforces it identically.
//
// The route handlers call `assertOwnsOrg` and treat a false result as a 404 (not 403): we do not
// even confirm that another org's object exists. That is the correct, ownership-enforced behavior.
//
// (When we later build the deliberately-vulnerable demo variant for the BoLD audit, THIS is the
// check that gets removed. Keeping it isolated here makes the secure/vulnerable diff a single, clear
// edit rather than a scatter of forgotten checks.)
import type { CurrentUser } from "./user";

/** True iff the caller's organization owns a resource carrying `resourceOrgId`. */
export function ownsOrg(user: CurrentUser, resourceOrgId: string): boolean {
  return user.orgId === resourceOrgId;
}
