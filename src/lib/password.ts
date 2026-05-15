import bcrypt from "bcryptjs";

const saltRounds = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, saltRounds);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
