import { randomBytes } from 'crypto';

export function generateBackHalf(): string {
  return randomBytes(3).toString('base64url').slice(0, 4);
}
