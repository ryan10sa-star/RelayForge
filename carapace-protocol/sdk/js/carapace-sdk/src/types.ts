export interface Capability {
  id: string;
  name: string;
  description: string;
}

export interface Endpoint {
  protocol: string;
  url: string;
  auth?: 'none' | 'api_key' | 'oauth2';
}

export interface RegisterAgentOptions {
  name: string;
  description: string;
  framework: string;
  version?: string;
  capabilities: Capability[];
  endpoints: Endpoint[];
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface AgentCard extends RegisterAgentOptions {
  id: string;
  owner: {
    public_key: string;
    did?: string;
  };
  signature: string;
  issued_at: string;
  updated_at: string;
}

export interface VerifyResult {
  agent_id: string;
  verified: boolean;
  reason?: string;
}

export interface DiscoverFilters {
  capability?: string;
  framework?: string;
  tag?: string;
  text?: string;
  limit?: number;
}
