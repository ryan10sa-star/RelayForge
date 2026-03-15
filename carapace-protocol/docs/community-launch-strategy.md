# Carapace Protocol — Community Launch Strategy

**Version:** 0.1.0 Draft
**Date:** March 15, 2026
**Status:** Pre-review

---

## Objective

Launch the Carapace protocol as an open standard for agent identity, attracting early adopters who will validate the schema, build implementations, and provide feedback before v1.0.

---

## Target Audiences

### Primary

1. **Agent framework developers** — Teams building agent orchestration frameworks (LangChain, CrewAI, AutoGen, etc.) who need a standard identity format
2. **Registry operators** — Organizations building agent directories or marketplaces that need interoperable identity cards
3. **Security-focused teams** — Groups building agent trust and verification systems who need cryptographic identity foundations

### Secondary

4. **Individual developers** — Developers experimenting with multi-agent systems who want discoverable, verifiable agents
5. **Enterprise platform teams** — Organizations deploying agents internally who need governance and audit trails

---

## Launch Phases

### Phase 1: Quiet Launch (Week 1–2)

**Goal:** Get the spec in front of 10–20 trusted reviewers for early feedback.

Actions:
- Publish the `carapace-protocol/` directory to the public GitHub repository
- Share directly with known contacts in the agent framework space
- Collect feedback on schema completeness, naming, and signing flow usability
- Fix any critical issues before broader announcement

### Phase 2: Community Announcement (Week 3–4)

**Goal:** Public awareness. Drive traffic to the repo and start building a contributor base.

Actions:
- Publish a blog post on relayforge.tools explaining the problem Carapace solves (agent identity gap, the Moltbook example)
- Post to relevant communities: Hacker News, Reddit (r/MachineLearning, r/LocalLLaMA), Twitter/X, Discord servers for LangChain, CrewAI, and MCP
- Create a GitHub Discussions board for protocol questions and proposals
- Tag the release as `v0.1.0-draft`

### Phase 3: Adoption Push (Week 5–8)

**Goal:** Get at least 3 independent implementations started.

Actions:
- Publish reference implementation snippets (signing, verification, A2A generation) in Python and JavaScript
- Create a "Getting Started" guide with step-by-step instructions for creating and signing an identity card
- Reach out to agent framework maintainers about native Carapace support
- Host an online workshop or live coding session demonstrating the protocol

### Phase 4: Feedback Integration (Week 9–12)

**Goal:** Incorporate community feedback into v0.2.0.

Actions:
- Review all GitHub issues and discussions
- Prioritize schema changes based on implementer feedback
- Publish v0.2.0 draft with community-requested features (reputation, input/output modes, multi-turn support)
- Recognize early contributors in release notes

---

## Success Metrics

| Metric | Target (12 weeks) |
|--------|-------------------|
| GitHub stars | 100+ |
| Unique contributors | 10+ |
| Independent implementations | 3+ |
| Identity cards created (any registry) | 50+ |
| Schema change proposals | 5+ |

---

## Key Messages

1. **"Agent identity is broken."** — Agents today are anonymous. There's no standard way to verify who built an agent, what it can do, or whether it's trustworthy. Carapace fixes this.

2. **"The math protects the identity."** — Cryptographic signing means even a compromised registry can't forge identity cards. Trust is rooted in math, not databases.

3. **"Carapace is a superset, not a silo."** — Full compatibility with A2A and MCP means adopting Carapace doesn't lock you out of other ecosystems.

4. **"Open spec, open governance."** — Anyone can implement Carapace. The schema is public, the signing flow is documented, and governance is transparent.

---

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Low initial adoption | Focus on framework integrations (LangChain plugin, CrewAI adapter) to lower the barrier |
| Competing standards emerge | Maintain A2A/MCP compatibility so Carapace agents work everywhere regardless |
| Schema instability deters implementers | Clearly label as draft, commit to backward-compatible changes after v1.0 |
| Security vulnerability in signing flow | Pre-launch security review, responsible disclosure process, bug bounty consideration |
