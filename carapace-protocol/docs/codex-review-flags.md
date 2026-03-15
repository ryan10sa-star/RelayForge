# Carapace Protocol — Codex Review Flags

**Version:** 0.1.0 Draft
**Date:** March 15, 2026
**Status:** Pre-review

---

## Purpose

When AI coding assistants (Codex, Copilot, Claude, etc.) review or generate code that interacts with the Carapace protocol, certain patterns require extra scrutiny. This document defines review flags — patterns that should trigger warnings, additional checks, or human review.

---

## Flags

### 🔴 Critical — Block Merge

These patterns must be caught and fixed before any code is merged.

#### FLAG-001: Private Key in Identity Card

**Pattern:** A `verification` object containing a `private_key` field, or any field that appears to contain a private key value.

**Why:** Private keys must NEVER appear in identity cards. The card contains only the public key. Including a private key would compromise the owner's signing authority.

**Check:** Reject any identity card JSON where:
- A field named `private_key`, `secret_key`, or `signing_key` exists
- The `verification.public_key` value is longer than expected for the algorithm (Ed25519: 44 base64url chars)
- Any field value matches known private key prefixes

#### FLAG-002: Signature Over Partial Card

**Pattern:** Signing only a subset of the card fields instead of the full canonicalized card.

**Why:** Partial signatures allow an attacker to modify unsigned fields without detection. The signing flow requires the ENTIRE card (minus the signature field itself) to be canonicalized and signed.

**Check:** Verify that the signing implementation:
- Includes all fields in the canonical form
- Only excludes `verification.signature` (set to `""` during signing)
- Does not skip optional fields that are present

#### FLAG-003: Skipped Signature Verification

**Pattern:** Accepting an identity card without verifying its signature.

**Why:** An unverified card is untrustworthy. Any code path that consumes identity cards must verify the signature before trusting the contents.

**Check:** Ensure every card ingestion path includes:
- Signature verification call
- Handling of verification failure (reject or mark as unverified)

---

### 🟡 Warning — Requires Review

These patterns are not necessarily wrong but need a human to confirm intent.

#### FLAG-004: Non-Standard Algorithm

**Pattern:** Using an algorithm other than Ed25519, ES256, or ES384 for signing.

**Why:** The protocol specifies three supported algorithms. Using others may indicate a bug, a compatibility issue, or an intentional extension that needs documentation.

**Check:** Flag any `verification.algorithm` value not in `["Ed25519", "ES256", "ES384"]`.

#### FLAG-005: Missing Canonicalization

**Pattern:** Signing raw JSON without JCS canonicalization.

**Why:** Non-canonical JSON produces different byte sequences for the same logical content, causing signature verification to fail across implementations. JCS (RFC 8785) ensures deterministic serialization.

**Check:** Verify that signing code:
- Sorts object keys lexicographically
- Removes extra whitespace
- Normalizes numbers and Unicode
- Or uses a JCS library

#### FLAG-006: Hardcoded Key Material

**Pattern:** Public keys, key IDs, or signatures hardcoded in application source code (not test fixtures).

**Why:** Hardcoded cryptographic material suggests the signing flow is not dynamic. Keys should be loaded from secure storage at runtime.

**Check:** Flag base64url strings longer than 32 characters in non-test source files that appear in `verification` object contexts.

#### FLAG-007: Mutable agent_id

**Pattern:** Code that modifies the `agent_id` of an existing identity card.

**Why:** The `agent_id` is the permanent identifier. It must never change after creation. Code that mutates it likely has a logic error.

**Check:** Flag any assignment to `agent_id` that is not part of initial card creation.

---

### 🟢 Informational — Log for Awareness

#### FLAG-008: Unverified Owner Import

**Pattern:** Importing an A2A or external agent card and setting `owner.verified = true`.

**Why:** Imported cards from non-Carapace sources should always start as `owner.verified = false`. Only the registry can verify ownership after the owner claims the card.

**Check:** Flag any A2A-to-Carapace conversion that sets `verified: true`.

#### FLAG-009: Empty Federation Peers

**Pattern:** A registered card with an empty `registry.federation_peers` array.

**Why:** This is normal for newly registered cards but may indicate a federation configuration issue for cards that have been registered for a long time.

**Check:** Informational only. Log for monitoring dashboards.

#### FLAG-010: Null Reputation

**Pattern:** `reputation: null` in a card.

**Why:** Expected in v0.1.0 (reputation is reserved for v0.2.0). This flag exists so we can track when to remove the null default.

**Check:** Informational only. Will become a warning in v0.2.0 when reputation is implemented.

---

## Integration

These flags should be implemented as:

1. **Linter rules** — Static analysis rules that run in CI/CD pipelines on code that handles identity cards
2. **Schema validation hooks** — Pre-commit checks on identity card JSON files
3. **AI review prompts** — Instructions added to AI code review tool configurations so they flag these patterns during pull request reviews

---

## Adding New Flags

To propose a new flag:

1. Open a GitHub issue with the `codex-flag` label
2. Include: pattern description, why it matters, suggested severity, and detection method
3. Follow the standard governance review process
