# Carapace Protocol — Signing Flow Design

**Version:** 0.1.0 Draft
**Date:** March 15, 2026
**Status:** Pre-review

---

## Overview

Every Carapace Agent Identity Card is cryptographically signed by its owner. This is the "notary stamp" that proves the badge is authentic and hasn't been tampered with. Without this, anyone could forge a badge and pretend to be someone else's agent — which is exactly what happened on Moltbook.

The signing flow uses public-key cryptography. The owner has two keys: a private key (secret, never shared) and a public key (embedded in the card, shared with everyone). The private key creates the signature. The public key lets anyone verify it.

---

## Algorithm Choice

**Recommended: Ed25519**

Why:
- Fast: signing and verification are both extremely fast
- Small: keys are 32 bytes, signatures are 64 bytes
- Secure: no known practical attacks, used by SSH, Signal, Tor, and many others
- Well-supported: libraries exist in every major language (Python: `cryptography` or `PyNaCl`, JavaScript: `tweetnacl` or `@noble/ed25519`, Rust: `ed25519-dalek`, Go: standard library)

**Also supported: ES256 (ECDSA with P-256), ES384 (ECDSA with P-384)**

These are included for compatibility with systems that already use ECDSA (like some OAuth/OIDC deployments). But Ed25519 is the default recommendation.

---

## The Flow

### Step 1: Owner Generates a Keypair

The owner (human or organization) generates an Ed25519 keypair. This happens ONCE and the keypair is reused across all agents they own.

```
Private Key: kept secret by the owner (never transmitted, never stored by the registry)
Public Key:  embedded in every identity card the owner creates
```

**Key storage is the owner's responsibility.** They can store it in a local keyring, a hardware security module, or a secrets manager. The registry never sees the private key.

If an owner already has a DID with an associated keypair, they can reuse it. The `owner.owner_id` field would reference their DID, and the `verification.public_key` would match the DID document's verification method.

### Step 2: Owner Creates the Identity Card

The owner fills in all fields of the Agent Identity Card EXCEPT:
- `verification.signature` (this gets computed next)
- `verification.signed_at` (set to current timestamp during signing)
- `registry.registered_at` (set by the registry upon registration)
- `registry.last_verified_at` (set by the registry upon verification)
- `registry.federation_peers` (populated over time)
- `reputation` (null in v0.1.0)

The `verification.algorithm` and `verification.public_key` fields ARE set by the owner before signing.

### Step 3: Canonicalize the Card

Before signing, the card must be serialized to a deterministic byte string. This is critical — if two systems serialize the same JSON differently (different key order, different whitespace), the signature won't match.

**Method: JCS (JSON Canonicalization Scheme — RFC 8785)**

JCS defines a deterministic JSON serialization:
- Object keys are sorted lexicographically
- No extra whitespace
- Numbers are normalized
- Unicode is normalized

**What gets signed:** The entire card JSON, canonicalized via JCS, with the `verification.signature` field set to an empty string `""` during canonicalization. All other fields (including `verification.algorithm`, `verification.public_key`, and `verification.signed_at`) are included in the signed payload.

```
Pseudocode:
  card_copy = deep_copy(identity_card)
  card_copy.verification.signature = ""
  card_copy.verification.signed_at = current_utc_timestamp()
  canonical_bytes = JCS_canonicalize(card_copy)
  signature = Ed25519_sign(private_key, canonical_bytes)
  identity_card.verification.signature = base64url_encode(signature)
  identity_card.verification.signed_at = card_copy.verification.signed_at
```

### Step 4: Submit to ARIA Registry

The owner sends the complete, signed identity card to a Carapace-compliant registry (e.g., RelayForge) via:

```
POST /aria/v1/agents/register
Content-Type: application/json
Authorization: Bearer <owner_auth_token>

{
  ... the complete signed identity card ...
}
```

The owner must authenticate with the registry using their `owner.owner_id` credentials (OAuth, API key, etc.). This is SEPARATE from the card signature — it proves "I am the owner submitting this card" while the signature proves "this card was created by the owner."

### Step 5: Registry Verifies

The registry performs these checks in order:

1. **Schema validation** — Does the card conform to the Carapace Agent Identity Card schema?
2. **Owner authentication** — Does the authenticated user match the `owner.owner_id` in the card?
3. **Signature verification:**
   a. Extract the `verification.public_key` from the card
   b. Set `verification.signature` to `""` in a copy
   c. Canonicalize the copy via JCS
   d. Verify the Ed25519 signature against the canonical bytes using the public key
4. **Uniqueness check** — Is the `agent_id` already registered? If so, reject (409 Conflict).
5. **Rate limiting** — Is this owner registering too many agents too fast?

If all checks pass:
- Set `registry.registered_at` to current timestamp
- Set `registry.last_verified_at` to current timestamp
- Set `registry.node_id` to this node's identifier
- Store the card
- Return 201 Created with the complete stored card

### Step 6: Third-Party Verification

Any agent, registry node, or human can verify a card at any time:

**Option A: Via the ARIA registry API**
```
POST /aria/v1/agents/{agent_id}/verify

Response:
{
  "verified": true,
  "agent_id": "a1b2c3d4-...",
  "status": "active",
  "owner_verified": true,
  "signature_valid": true,
  "verified_at": "2026-03-15T23:00:00Z",
  "verified_by": "relayforge-primary"
}
```

**Option B: Offline verification (no registry needed)**
If you have the identity card JSON, you can verify the signature yourself:
1. Extract the public key from `verification.public_key`
2. Set `verification.signature` to `""` in a copy
3. Canonicalize via JCS
4. Verify the signature using the public key and algorithm specified

This is critical for federation — a registry node can verify cards from OTHER nodes without trusting them, just by checking the math.

---

## Card Updates and Re-signing

When any field in the card changes (new capability, new endpoint, status change):

1. Owner modifies the field(s)
2. Owner updates `updated_at` to current timestamp
3. Owner re-signs the entire card (new signature over the modified content)
4. Owner submits the updated card to the registry via PUT or PATCH
5. Registry verifies the new signature and that the authenticated user matches the owner
6. Registry updates its stored copy

**Important:** The `agent_id` never changes. It's the permanent identifier. Everything else can be updated.

---

## Key Rotation

If an owner needs to rotate their keypair (security incident, scheduled rotation):

1. Owner generates a new keypair
2. Owner re-signs ALL their agent cards with the new key
3. Owner submits updated cards to the registry
4. The `verification.public_key` field changes, `verification.key_id` updates
5. Old signatures become invalid — this is intentional

**Future consideration (v0.2.0+):** Support for key history / previous keys to allow graceful rotation where old signatures remain verifiable during a transition period.

---

## Revocation

An owner can revoke their agent's identity at any time:

```
POST /aria/v1/agents/{agent_id}/revoke
Authorization: Bearer <owner_auth_token>
```

This sets `status` to `"revoked"`. A revoked card:
- Still exists in the registry (soft delete)
- Returns `verified: false` on verification checks
- Cannot be re-activated (owner must register a new agent)
- Propagates revocation status to federation peers

---

## Attack Scenarios and Mitigations

### Scenario: Someone forges a badge
**Mitigation:** Without the owner's private key, they cannot produce a valid signature. The verification check fails immediately.

### Scenario: Someone intercepts and modifies a badge in transit
**Mitigation:** Any modification breaks the signature. The verifier detects tampering.

### Scenario: A rogue registry node issues fake badges
**Mitigation:** The signature is created by the OWNER, not the registry. The registry stores and serves badges but cannot forge them. Even a compromised registry node can't fake an owner's signature.

### Scenario: Someone registers an agent claiming to be owned by someone else
**Mitigation:** Registration requires owner authentication (Step 4). The registry verifies the authenticated user matches the `owner.owner_id` in the card.

### Scenario: The Moltbook attack — someone grabs credentials from an unsecured database
**Mitigation:** Even if the entire registry database is leaked, private keys are never stored there. Attackers get public keys and signed cards — which are meant to be public anyway. They cannot forge new cards or modify existing ones without the private keys.

---

## Implementation Notes

### Libraries by Language

| Language   | Ed25519 Library                     | JCS Library                |
|------------|-------------------------------------|----------------------------|
| Python     | `cryptography` or `PyNaCl`          | `canonicaljson` or custom  |
| JavaScript | `@noble/ed25519` or `tweetnacl`     | `canonicalize` (npm)       |
| Rust       | `ed25519-dalek`                     | `serde_json` (sorted keys) |
| Go         | `crypto/ed25519` (stdlib)           | custom or `go-jcs`         |

### Canonicalization Reference

JCS (RFC 8785) is simple enough that a minimal implementation is ~50 lines in most languages. The key rules:
- Object members sorted by key (byte-level lexicographic)
- No whitespace between tokens
- Numbers: no leading zeros, no positive sign, no trailing zeros after decimal
- Strings: minimal escaping (only required characters)
- No trailing commas

---

## Summary

1. Owner makes a keypair (once)
2. Owner fills in the badge and signs it with their private key
3. Owner submits to the registry, authenticating as themselves
4. Registry checks the signature and stores the badge
5. Anyone can verify the badge by checking the signature against the public key
6. No private keys ever touch the registry
7. Even if the registry gets hacked, badges can't be forged

The math protects the identity. Not the database. Not the company. The math.
