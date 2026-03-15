# Carapace → MCP Compatibility Notes

**Version:** 0.1.0 Draft
**Date:** March 15, 2026
**Purpose:** Document how Carapace agent capabilities translate to MCP tool definitions and the architectural differences between the two models.

---

## Fundamental Difference

**Carapace treats agents as autonomous peers.** An agent has an identity, makes decisions, and can be delegated tasks it completes independently.

**MCP treats servers as subservient tools.** An MCP server exposes functions (tools, resources, prompts) that a host LLM calls and controls directly.

These are different paradigms. A Carapace agent CAN be wrapped as an MCP server, but information is lost in translation. This document explains what maps, what doesn't, and how the shim works.

---

## Capability → Tool Mapping

### What Maps

| Carapace Capability Field | MCP Tool Field | Notes |
|---|---|---|
| `capability_id` | `name` | MCP tool names are typically snake_case |
| `description` | `description` | Direct copy |
| `input_schema` | `inputSchema` | Direct copy — both use JSON Schema |
| `tags` | No equivalent | Lost in translation. MCP has no tagging/categorization. |
| `output_schema` | No equivalent | MCP tools return unstructured content blocks, not schema-validated output. |
| `async_supported` | No equivalent | MCP is synchronous by default. See below. |

### MCP tools/list Response (generated from Carapace)

```json
{
  "tools": [
    {
      "name": "code_review",
      "description": "Reviews code for bugs, security issues, performance problems, and adherence to project standards.",
      "inputSchema": {
        "type": "object",
        "properties": {
          "code": { "type": "string" },
          "language": { "type": "string" },
          "review_focus": { "type": "array", "items": { "type": "string" } }
        },
        "required": ["code"]
      }
    }
  ]
}
```

---

## What's Lost in Translation

### 1. Autonomy
In Carapace, you delegate a task: "Review this PR and fix what you find." The agent decides how to handle it.

In MCP, the host LLM calls specific tools in sequence: "Call code_review with this input." "Now call apply_fix with this input." The host controls every step.

**Impact:** When wrapping a Carapace agent as an MCP server, each capability becomes a tool call, but the agent's ability to chain actions, ask for clarification, or take initiative is suppressed.

### 2. Async Task Execution
Carapace capabilities can declare `async_supported: true`, meaning the agent accepts a task and works on it over time (potentially minutes or hours), reporting status updates.

MCP expects tools to return results immediately (or within a reasonable timeout). There is no native concept of "I'm working on it, check back later."

**Workaround:** The MCP shim can use MCP's subscription/notification mechanism to simulate async behavior, but this is implementation-specific and not all MCP hosts support it.

### 3. Agent Identity
MCP servers don't have identity. They're anonymous functions exposed on a connection. The host knows it connected to "a server at this address" but there's no verified badge, no owner info, no reputation.

**Impact:** A Carapace agent wrapped as an MCP server loses its identity context. The MCP host doesn't know or care that it's talking to a verified, signed, reputable agent.

### 4. Output Schema
Carapace capabilities can define `output_schema` so consumers know what structured data to expect. MCP tools return generic `content` blocks (text, images, etc.) with no schema validation.

**Impact:** Structured output guarantees are lost. The MCP host gets unstructured content and has to interpret it.

### 5. Discovery
In Carapace, agents are discoverable via the ARIA registry (search by capability, framework, tags). In MCP, discovery only happens after you've already connected to the server — you call `tools/list` on a live connection.

**Impact:** You can't find MCP servers by capability without already knowing their address. Carapace's discovery layer adds this.

---

## The Shim Pattern

A "shim" is a thin adapter that sits between the MCP host and the Carapace agent, translating between protocols.

```
MCP Host (e.g., Claude Desktop, VS Code)
    |
    | JSON-RPC over stdio or SSE
    |
[Carapace-MCP Shim]
    |
    | HTTPS / A2A
    |
Carapace Agent (via ARIA registry)
```

### What the shim does:

1. **On initialization:** Reads the agent's Carapace identity card. Translates capabilities into MCP tool definitions. Responds to `tools/list` with the generated tool list.

2. **On tool call:** Receives the MCP `tools/call` request. Translates it into a task delegation to the Carapace agent (via A2A or HTTPS endpoint). Waits for the response (or polls if async). Returns the result as MCP content blocks.

3. **On resource request:** If the Carapace agent exposes data resources, the shim can translate them into MCP `resources/list` and `resources/read` responses.

### What the shim does NOT do:

- It doesn't give the MCP host access to the agent's signing keys
- It doesn't expose owner information through MCP (MCP has no mechanism for this)
- It doesn't support full async — it either blocks until done or times out
- It doesn't federate — MCP connections are point-to-point

---

## When to Use the Shim

**Use the shim when:**
- You want a Carapace agent to be usable from Claude Desktop, VS Code, or other MCP hosts
- You're integrating with an existing MCP-based workflow
- The host application only speaks MCP

**Don't use the shim when:**
- Both sides support A2A — use native A2A instead (full capability preserved)
- You need async task execution — MCP can't handle it well
- Identity verification matters — MCP strips it away

---

## Implementation Priority

The MCP shim is NOT a v0.1.0 deliverable. It's documented here so:
1. The schema design doesn't accidentally break MCP compatibility
2. Sheldon knows what the adapter needs when we build it (v0.2.0+)
3. We can include "MCP compatible via shim" in our marketing without lying

The capability `input_schema` field using standard JSON Schema is the key compatibility hook. As long as that stays clean, the shim is straightforward to build later.

---

## Summary

MCP is a subset of what Carapace offers. Every MCP tool can be represented as a Carapace capability. Not every Carapace capability can be fully represented as an MCP tool (async, identity, structured output, and discovery are lost). The shim bridges the gap for environments that require MCP, but native A2A is the preferred protocol for agent-to-agent interaction in the Carapace ecosystem.

Carapace agents speak A2A natively. They tolerate MCP when they have to. They're never limited by it.
