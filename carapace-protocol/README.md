# Carapace Protocol

**Version:** 0.1.0 Draft
**Date:** March 15, 2026

---

## What Is Carapace?

Carapace is an open identity and trust protocol for autonomous AI agents. It gives every agent a cryptographically signed **identity card** — a machine-readable badge that proves who the agent is, who owns it, what it can do, and provides verifiable provenance for relying parties.

Think of it as a passport for agents: issued by the owner, signed with their private key, verifiable by anyone, and portable across registries and protocols.

---

## Core Concepts

### Agent Identity Card

The identity card is the central artifact. It contains:

- **Identity** — unique `agent_id`, human-readable name, description
- **Owner** — who created and controls this agent (with verified ownership)
- **Capabilities** — what the agent can do (structured as skills with input/output schemas)
- **Endpoints** — where to reach the agent (HTTPS, A2A, or other protocols)
- **Verification** — cryptographic signature proving the card is authentic (Ed25519)
- **Registry** — which registry node stores and serves this card
- **Status** — lifecycle state: `active`, `suspended`, or `revoked`

See [`schemas/agent-identity-card.schema.json`](schemas/agent-identity-card.schema.json) for the full JSON Schema.

### Signing Flow

Every identity card is signed by the owner using Ed25519 (or ES256/ES384 for compatibility). The signature covers the entire card, canonicalized via JCS (RFC 8785). No private keys ever touch the registry.

See [`docs/signing-flow-design.md`](docs/signing-flow-design.md) for the complete flow.

### Protocol Compatibility

Carapace is a superset of Google's A2A agent card format. Any Carapace agent can auto-generate a valid `/.well-known/agent.json` for A2A discovery. Carapace agents can also be wrapped as MCP servers via a shim adapter.

- [`docs/a2a-mapping.md`](docs/a2a-mapping.md) — A2A field mapping and auto-generation
- [`docs/mcp-compatibility.md`](docs/mcp-compatibility.md) — MCP shim pattern and limitations

---

## Repository Structure

```
carapace-protocol/
├── README.md                              ← you are here
├── schemas/
│   ├── agent-identity-card.schema.json    ← the badge (JSON Schema)
│   └── examples/
│       └── sheldon-identity-card.json     ← filled-in example
└── docs/
    ├── signing-flow-design.md             ← cryptographic signing flow
    ├── a2a-mapping.md                     ← A2A compatibility mapping
    ├── mcp-compatibility.md               ← MCP shim design
    ├── governance.md                      ← protocol governance
    ├── community-launch-strategy.md       ← launch and adoption plan
    └── codex-review-flags.md              ← AI review safety flags
```

---

## Quick Start

1. **Read the schema** — [`schemas/agent-identity-card.schema.json`](schemas/agent-identity-card.schema.json) defines every field
2. **See an example** — [`schemas/examples/sheldon-identity-card.json`](schemas/examples/sheldon-identity-card.json) is a complete filled-in card
3. **Understand signing** — [`docs/signing-flow-design.md`](docs/signing-flow-design.md) explains how cards are signed and verified
4. **Check compatibility** — [`docs/a2a-mapping.md`](docs/a2a-mapping.md) and [`docs/mcp-compatibility.md`](docs/mcp-compatibility.md) cover interoperability

---

## Status

This is a v0.1.0 draft. The schema, signing flow, and compatibility mappings are defined. Implementation (registry API, SDK libraries, signing tools) is next.

---

## License

This specification is licensed under the Creative Commons Attribution 4.0 International License ([CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)).
