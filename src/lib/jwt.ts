import config from '@/config';
import jwt from 'jsonwebtoken';

export type TokenPayload = { userId: string };
export type ResetLinkPayload = { email: string };

/**
 * Gera um Access Token de curta duração (15 minutos) usando JWT.
 */
export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: '15m' });
};

/**
 * Gera um Refresh Token de longa duração (7 dias) usando JWT.
 */
export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: '7d' });
};

/**
 * Gera um token de redefinição de senha (Reset Link) usando JWT.
 */
export const generateResetLinkToken = (payload: ResetLinkPayload): string => {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: '60m' });
};

// Validação de Tokens

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.JWT_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.JWT_SECRET) as TokenPayload;
};

export const verifyResetLinkToken = (token: string): ResetLinkPayload => {
  return jwt.verify(token, config.JWT_SECRET) as ResetLinkPayload;
};
