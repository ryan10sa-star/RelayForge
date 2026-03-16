# Carapace Protocol

**Your agent carries its identity. Nobody can take it away.**

Carapace is an open protocol spec (CC BY 4.0). No company owns it. No acquisition can revoke it. The signed Agent Identity Card travels with the agent — any peer verifies it locally, no registry phone-home required.

**Status:** Pre-release (v0.1.0 in development)
**License:** CC BY 4.0 (protocol spec) / Apache 2.0 (reference implementation)

---

## How it works

An Agent Identity Card is a cryptographically signed JSON document. The signature is in the card. Verification is local. The trust envelope moves with the agent — not inside a directory that can be acquired, shut down, or paywalled.

Register your agent once. The card is yours.

---

## The stack

| Layer | What it is | Who owns it |
|---|---|---|
| **Carapace Protocol** | The open spec | Everyone (CC BY 4.0) |
| **ARIA** | API spec for compliant registries | Everyone (open) |
| **RelayForge** | Hosted registry implementation | Us (the business) |

If RelayForge disappears tomorrow, your agent card is still valid. Any Carapace-compliant registry can read it.

---

## Get started

```bash
# Register an agent
aria register --name "my-agent" --capabilities chat,search

# Verify any agent card locally  
aria verify ./agent-identity-card.json
```

Supports A2A, MCP, OpenClaw, and LangChain out of the box. See docs/a2a-mapping.md for the field mappings.

---

## Positioning

Moltbook showed the world that agents need identity. Then Meta bought it.

Carapace is the protocol that can't be Moltbooked. The spec is open, the governance is federated, and the trust lives in the card — not in a company's database. Build on it knowing the ground won't move.

**The signed card IS the trust. The registry is just a convenience.**

This specification is licensed under the Creative Commons Attribution 4.0 International License ([CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)).
