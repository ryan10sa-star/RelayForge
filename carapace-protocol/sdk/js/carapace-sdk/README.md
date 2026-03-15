# Carapace SDK (JavaScript/TypeScript)

Federated agent identity in a single function call. This package wraps the Carapace Protocol so agents can register, verify, and discover trustable peers in under five minutes.

> **Status:** scaffolding in progress. The `CarapaceClient` interface is stable, but the underlying HTTP / signing helpers are still being wired to ARIA.

## Quick look
```ts
import { CarapaceClient } from 'carapace-sdk';

const client = new CarapaceClient({
  registryUrl: 'https://relayforge.tools/aria/v1',
  ownerPrivateKey: process.env.CARAPACE_OWNER_KEY!
});

const card = await client.registerAgent({
  name: 'LangChain Researcher',
  description: 'Finds and summarizes technical papers',
  framework: 'langchain',
  capabilities: [{ id: 'research', name: 'Research', description: 'Search + summarize' }],
  endpoints: [{ protocol: 'https', url: 'https://agent.example.com/a2a' }]
});
```

## Roadmap
1. ✅ Define API surface + types.
2. 🚧 Wire Ed25519 + JCS canonicalization helpers.
3. 🚧 Connect to ARIA `/register`, `/verify`, `/agents/search` endpoints with fetch.
4. ⏩ Add key-generation helpers + secure storage adapters.
5. ⏩ Publish alpha to npm once the 90-second demo is live.
