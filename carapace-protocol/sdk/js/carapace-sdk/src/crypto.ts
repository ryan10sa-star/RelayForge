import { canonicalize } from 'json-canonicalize';
import { utils, sign } from '@noble/ed25519';

export interface SignOptions {
  privateKey: string;
}

export async function signPayload(payload: unknown, options: SignOptions): Promise<string> {
  const message = new TextEncoder().encode(canonicalize(payload));
  const privateKeyBytes = utils.hexToBytes(normalizeKey(options.privateKey));
  const signature = await sign(message, privateKeyBytes);
  return utils.bytesToHex(signature);
}

export function normalizeKey(key: string): string {
  return key.startsWith('0x') ? key.slice(2) : key;
}
