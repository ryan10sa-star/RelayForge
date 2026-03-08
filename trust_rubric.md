# RelayForge Trust Panel

Each tool displays the following metrics:

| Metric | Description |
| --- | --- |
| Verification | `Unverified`, `Submitted`, `RelayForge Verified` |
| Last Audit | Date of most recent manual review & sandbox test |
| Median Latency | Rolling 7-day median response time |
| Success Rate | % of successful invocations (rolling 7-day) |
| Sandbox | `Available` / `Required` / `Not Provided` |
| Permissions | Declared scope (read-only, read-write, external network, etc.) |
| Maintainer SLA | Avg response time to incidents/updates |
| Rollback | Whether previous versions can be restored |
| Version | Current version & release date |
| Notes | Open findings, special considerations |

## Verification States
- **Unverified:** Tool submitted, not yet reviewed.
- **Submitted:** Maintainer provided manifest + evidence; review scheduled.
- **RelayForge Verified:** Passed sandbox tests, documentation review, and owner identity check.

## Display Format
```
Verification: ✅ RelayForge Verified
Last audit: 2026-03-01 (14 days ago)
Median latency: 420 ms
Success rate: 98.3%
Sandbox: Available
Permissions: Read-only | On-prem data allowed: No
Maintainer SLA: <24h
Rollback: Yes (versions 1.0–1.2)
```
