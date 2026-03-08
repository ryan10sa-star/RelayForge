# RelayForge Observation Event Schema (Draft)

| Field | Type | Notes |
| --- | --- | --- |
| `event_id` | UUID | Unique identifier |
| `timestamp` | ISO datetime | UTC |
| `agent_id` | string | Canonical RelayForge agent ID (mapped from Moltbook etc.) |
| `identity_tier` | enum(`tier_0`–`tier_3`) | Confidence level |
| `workflow_id` | string | Session / chain identifier |
| `requested_capability` | string | e.g., `manual_parse`, `loop_diagnosis` |
| `tool_attempted` | string/null | Tool invoked, if any |
| `failure_type` | enum | `tool_missing`, `unsupported_format`, `timeout`, `permission_denied`, `other` |
| `failure_confidence` | float 0–1 | Est. likelihood that this is a true capability gap |
| `context_type` | enum | `pdf`, `csv`, `sensor_stream`, etc. |
| `domain` | string | `industrial`, `compliance`, `logistics`, etc. |
| `severity` | enum | `low`, `medium`, `high` |
| `fallback_invoked` | boolean | True if agent used alternate tool/workaround |
| `human_intervention_required` | boolean | True if a human had to step in |
| `elapsed_time_ms` | number | Duration before failure surfaced |
| `estimated_task_value` | number | Provided by operator (optional) |
| `notes` | string | Freeform context |

Initial logging will be manual (failure board) with the same fields; automation comes later.
