import { randomBytes } from 'crypto';
/**
 * Generates a random string of 4 characters to be used as the back half of a shortened link.
 */
export function generateBackHalf(): string {
  return randomBytes(3).toString('base64url').slice(0, 4);
}
