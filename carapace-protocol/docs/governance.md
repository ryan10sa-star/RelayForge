# Carapace Protocol — Governance

**Version:** 0.1.0 Draft
**Date:** March 15, 2026
**Status:** Pre-review

---

## Purpose

This document defines how the Carapace protocol is maintained, who makes decisions, and how changes are proposed and adopted. The goal is transparency: anyone building on Carapace should know how the rules are set and who sets them.

---

## Governance Model

Carapace uses a **Benevolent Steward** model during the v0.x phase. A single core team makes final decisions, with public input welcomed through issues and discussions.

### Phases

| Phase | Model | Criteria to Advance |
|-------|-------|---------------------|
| v0.x (current) | Benevolent Steward — core team decides | Stable schema, 3+ independent implementations, active community |
| v1.x | Open Governance — RFC process with community vote | Formal spec ratification, governance charter adopted |
| v2.x+ | Standards Body Candidate — submit to relevant standards org | Broad adoption, interoperability proven |

---

## Decision-Making Process

### Schema Changes

Any change to `agent-identity-card.schema.json` follows this process:

1. **Proposal** — Open a GitHub issue with the `schema-change` label describing the change, motivation, and impact
2. **Discussion** — Minimum 7-day comment period for community input
3. **Review** — Core team evaluates backward compatibility, security impact, and alignment with protocol goals
4. **Decision** — Core team approves, requests changes, or rejects with written rationale
5. **Implementation** — Approved changes are merged with a schema version bump

### Breaking Changes

Breaking changes (removing required fields, changing field semantics, altering signing behavior) require:

- A migration guide
- A deprecation notice at least one minor version before removal
- Explicit approval from all core team members

### Documentation Changes

Non-normative documentation (guides, examples, explanations) can be updated via standard pull request with one core team review.

---

## Roles

### Core Team

The core team maintains the protocol spec, schema, and reference implementations. Members are listed in the repository `MAINTAINERS` file (to be created).

Responsibilities:
- Review and merge schema changes
- Maintain backward compatibility guarantees
- Publish release notes for each version
- Respond to security reports within 48 hours

### Contributors

Anyone who submits issues, pull requests, or participates in discussions. Contributors are credited in release notes.

### Implementers

Organizations or individuals building registries, SDKs, or agents that conform to the Carapace protocol. Implementers are encouraged to report compatibility issues and participate in interoperability testing.

---

## Versioning

Carapace follows [Semantic Versioning](https://semver.org/):

- **Patch** (0.1.x) — Bug fixes, typo corrections, non-normative documentation updates
- **Minor** (0.x.0) — Additive changes (new optional fields, new endpoint types, new algorithms)
- **Major** (x.0.0) — Breaking changes (field removal, semantic changes, signing flow changes)

The `schema_version` field in each identity card tracks which version of the schema it conforms to.

---

## Security Policy

Security vulnerabilities in the protocol design or reference implementations should be reported privately to the core team before public disclosure. Use the contact method specified in the repository `SECURITY.md` file (to be created).

The core team commits to:
- Acknowledge receipt within 24 hours
- Provide an initial assessment within 72 hours
- Coordinate disclosure timeline with the reporter

---

## Intellectual Property

The Carapace protocol specification is published under an open license to ensure free implementation by anyone. Specific licensing terms will be finalized before v1.0.

No contributor may introduce patent-encumbered features without explicit disclosure and core team approval.

---

## Amendments

This governance document can be amended through the same process as schema changes: proposal, discussion, review, and core team decision. Governance changes require unanimous core team approval.
