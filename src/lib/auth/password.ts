// Password hashing. bcrypt with a work factor of 10 — passwords are never stored or compared in
// plaintext. Kept tiny and dependency-light on purpose.
import bcrypt from "bcryptjs";

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
