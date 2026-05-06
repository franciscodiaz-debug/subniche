import { SignJWT, jwtVerify } from "jose"

const JWT_EXPIRY = "7d"

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error("JWT_SECRET environment variable is not set")
  return new TextEncoder().encode(secret)
}

export async function signJwt(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(getSecret())
}

export async function verifyJwt(token: string): Promise<{ sub: string }> {
  const { payload } = await jwtVerify(token, getSecret())
  if (!payload.sub) throw new Error("Invalid JWT: missing sub")
  return { sub: payload.sub }
}
