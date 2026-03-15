import fetch from 'cross-fetch';
import { signPayload } from './crypto.js';
import type {
  AgentCard,
  DiscoverFilters,
  RegisterAgentOptions,
  VerifyResult
} from './types.js';

export interface CarapaceClientOptions {
  registryUrl: string;
  ownerPrivateKey: string;
  fetchImpl?: typeof fetch;
}

export class CarapaceClient {
  private registryUrl: string;
  private ownerPrivateKey: string;
  private fetchImpl: typeof fetch;

  constructor(options: CarapaceClientOptions) {
    this.registryUrl = options.registryUrl.replace(/\/$/, '');
    this.ownerPrivateKey = options.ownerPrivateKey;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async registerAgent(payload: RegisterAgentOptions): Promise<AgentCard> {
    const signedPayload = await this.buildSignedPayload(payload);

    const response = await this.fetchImpl(`${this.registryUrl}/agents/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signedPayload)
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to register agent: ${response.status} ${text}`);
    }

    return (await response.json()) as AgentCard;
  }

  async verifyAgent(agentId: string): Promise<VerifyResult> {
    const response = await this.fetchImpl(`${this.registryUrl}/agents/${agentId}/verify`, {
      method: 'POST'
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to verify agent: ${response.status} ${text}`);
    }

    return (await response.json()) as VerifyResult;
  }

  async discoverAgents(filters: DiscoverFilters = {}): Promise<AgentCard[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const url = `${this.registryUrl}/agents/search${params.size ? `?${params.toString()}` : ''}`;
    const response = await this.fetchImpl(url);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to discover agents: ${response.status} ${text}`);
    }

    return (await response.json()) as AgentCard[];
  }

  private async buildSignedPayload(payload: RegisterAgentOptions) {
    const issued_at = new Date().toISOString();
    const unsignedCard = {
      ...payload,
      issued_at
    };

    const signature = await signPayload(unsignedCard, {
      privateKey: this.ownerPrivateKey
    });

    return {
      card: unsignedCard,
      signature
    };
  }
}
