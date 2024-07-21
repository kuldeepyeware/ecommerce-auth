import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "12345678",
);
const alg = "HS256";

export async function createToken(payload: { id: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setExpirationTime("1d")
    .sign(JWT_SECRET);
}

export async function verifyAuth(
  token: string | undefined,
): Promise<{ id: string } | null> {
  try {
    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (typeof payload === "object" && "id" in payload) {
      return { id: payload.id as string };
    }
    return null;
  } catch {
    return null;
  }
}
