import bcrypt from "bcryptjs";

export const USERNAME_PATTERN = /^[a-zA-Z0-9._-]{3,30}$/;
export const MIN_PASSWORD_LENGTH = 6;

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
