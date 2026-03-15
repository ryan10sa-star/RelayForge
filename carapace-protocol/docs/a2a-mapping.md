# Carapace → A2A Agent Card Mapping

**Version:** 0.1.0 Draft
**Date:** March 15, 2026
**Purpose:** Ensure any agent registered with Carapace can auto-generate a valid A2A Agent Card for /.well-known/agent.json discovery.

---

## Why This Matters

Google's Agent-to-Agent (A2A) protocol discovers agents by fetching `/.well-known/agent.json` from the agent's host. If Carapace agents can't produce this file, they're invisible to the A2A ecosystem. This mapping ensures compatibility without requiring agents to maintain two separate identity systems.

---

## Field Mapping

### Direct Mappings (1:1)

| Carapace Field | A2A Agent Card Field | Notes |
|---|---|---|
| `agent_name` | `name` | Direct copy |
| `description` | `description` | Direct copy |
| `endpoints[].url` (where protocol="a2a") | `url` | Use the A2A-protocol endpoint |
| `capabilities[].name` | `skills[].name` | Direct copy |
| `capabilities[].description` | `skills[].description` | Direct copy |
| `capabilities[].tags` | `skills[].tags` | Direct copy |
| `capabilities[].input_schema` | `skills[].inputSchema` | Rename key (camelCase for A2A) |
| `capabilities[].output_schema` | `skills[].outputSchema` | Rename key |
| `endpoints[].authentication.type` | `securitySchemes[].type` | Map to OpenAPI security scheme format |
| `protocol_version` | `protocolVersion` | Carapace version in metadata; A2A has its own version field |

### Transformations Required

| Carapace Field | A2A Agent Card Field | Transformation |
|---|---|---|
| `capabilities[].capability_id` | `skills[].id` | Rename field |
| `capabilities[].async_supported` | `skills[].executionModes` | `true` → `["sync", "async"]`, `false` → `["sync"]` |
| `endpoints[].authentication` | `securitySchemes` | Flatten from per-endpoint to card-level; A2A defines auth at the card level, not per-endpoint |
| `owner.owner_id` | `provider.organization` | Extract display name or org from namespaced ID |
| `agent_id` | `id` | Direct copy but field name changes |

### Carapace Fields With No A2A Equivalent (our additions)

These fields exist in Carapace but have no corresponding A2A field. They represent Carapace's value-add over A2A:

| Carapace Field | Purpose | Handling |
|---|---|---|
| `owner` (full object) | Verified owner identity | No A2A equivalent — this is a core Carapace differentiator. Can be included in A2A's `provider` as metadata. |
| `verification` (full object) | Cryptographic signature | A2A has no signing mechanism. This is Carapace's trust layer. Not included in A2A card. |
| `registry` (full object) | Registry node info | A2A is self-hosted, not registry-based. Not included in A2A card. |
| `chain_anchors` | Blockchain identity links | No A2A equivalent. Could go in A2A's custom metadata if supported. |
| `heartbeat` | Proactive agent schedules | No A2A equivalent. Carapace addition for OpenClaw-style agents. |
| `reputation` | Trust scoring | No A2A equivalent. Carapace v0.2.0 feature. |
| `status` | Lifecycle status (active/suspended/revoked) | A2A assumes cards are active if hosted. Revocation is handled by removing the well-known file. |
| `metadata` | Extensible key-value store | Could map to A2A's custom extensions if supported. |

### A2A Fields With No Carapace Equivalent

| A2A Field | Purpose | Decision |
|---|---|---|
| `defaultInputModes` | Preferred input formats (text, audio, video) | ADD to Carapace v0.2.0 as optional field. Not critical for v0.1.0 identity use case. |
| `defaultOutputModes` | Preferred output formats | Same as above — v0.2.0 candidate. |
| `supportsMultiTurn` | Can the agent handle multi-message conversations | CONSIDER adding to capability object. Useful for discovery. Low priority for v0.1.0. |

---

## Auto-Generation Logic

When a Carapace-registered agent needs to produce an A2A-compatible `/.well-known/agent.json`:

```
Pseudocode:

function carapace_to_a2a(card):
    a2a = {}
    a2a.id = card.agent_id
    a2a.name = card.agent_name
    a2a.description = card.description or ""
    
    # Find the A2A endpoint
    a2a_endpoint = find(card.endpoints, where protocol == "a2a")
    if a2a_endpoint:
        a2a.url = a2a_endpoint.url
    else:
        # Fall back to first HTTPS endpoint
        a2a.url = find(card.endpoints, where protocol == "https").url
    
    # Map capabilities to skills
    a2a.skills = []
    for cap in card.capabilities:
        skill = {}
        skill.id = cap.capability_id
        skill.name = cap.name
        skill.description = cap.description
        skill.tags = cap.tags or []
        if cap.input_schema:
            skill.inputSchema = cap.input_schema
        if cap.output_schema:
            skill.outputSchema = cap.output_schema
        if cap.async_supported:
            skill.executionModes = ["sync", "async"]
        else:
            skill.executionModes = ["sync"]
        a2a.skills.append(skill)
    
    # Map auth
    a2a.securitySchemes = []
    for endpoint in card.endpoints:
        if endpoint.authentication and endpoint.authentication.type != "none":
            scheme = map_to_openapi_security_scheme(endpoint.authentication)
            a2a.securitySchemes.append(scheme)
    
    # Provider info from owner
    a2a.provider = {}
    if card.owner.display_name:
        a2a.provider.organization = card.owner.display_name
    
    return a2a
```

---

## Hosting the A2A Card

Two options for making the A2A card available:

### Option A: Self-Hosted (preferred for full A2A compatibility)
The agent operator hosts the generated JSON at their domain:
```
https://my-agent.example.com/.well-known/agent.json
```
The Carapace card's `well_known_uri` field points here.

### Option B: Registry-Proxied
The ARIA registry generates and serves the A2A card on behalf of the agent:
```
https://relayforge.tools/.well-known/agents/{agent_id}.json
```
Less "pure" from an A2A perspective (the agent isn't self-hosting) but much easier for agents that don't have their own domain.

**Recommendation:** Support both. Default to registry-proxied for ease of onboarding. Encourage self-hosting for production agents.

---

## Round-Trip Compatibility

The mapping should be reversible. An A2A agent card fetched from the wild should be importable into a Carapace registry:

```
function a2a_to_carapace(a2a_card):
    card = new CarapaceIdentityCard()
    card.agent_id = a2a_card.id or generate_uuid()
    card.agent_name = a2a_card.name
    card.description = a2a_card.description
    
    # Import skills as capabilities
    for skill in a2a_card.skills:
        cap = new Capability()
        cap.capability_id = skill.id
        cap.name = skill.name
        cap.description = skill.description
        cap.tags = skill.tags
        cap.input_schema = skill.inputSchema
        cap.output_schema = skill.outputSchema
        cap.async_supported = "async" in (skill.executionModes or [])
        card.capabilities.append(cap)
    
    # These fields will be empty/unverified since A2A has no equivalent
    card.owner = { owner_id: "unknown:imported", verified: false }
    card.verification = null  # A2A cards aren't signed
    card.status = "active"
    
    return card
```

**Important:** An imported A2A card has `owner.verified = false` and no valid `verification` signature. It's a "provisional" identity — discoverable but not trusted until the owner claims and signs it.

---

## Summary

Carapace is a SUPERSET of A2A's agent card. Every A2A field has a Carapace equivalent. Carapace adds owner verification, cryptographic signing, registry federation, blockchain anchoring, and reputation — none of which A2A provides. The mapping is clean and auto-generation is straightforward.

An agent registered with Carapace is automatically A2A-compatible. An A2A agent can be imported into Carapace but starts as unverified. This is by design — Carapace adds trust, it doesn't remove accessibility.
