import { Lucia } from "lucia";
import { BetterSqlite3Adapter } from "@lucia-auth/adapter-sqlite";
import { db } from "./db";
import type { DatabaseUser } from "./db";
import { redirect } from "@remix-run/node";
import { parseCookies } from "oslo/cookie";

// import { webcrypto } from "crypto";
// globalThis.crypto = webcrypto as Crypto;

const adapter = new BetterSqlite3Adapter(db, {
  user: "user",
  session: "session",
});

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes: (attributes) => {
    return {
      username: attributes.username,
    };
  },
});

export async function logout(request: Request) {
  const cookies = request.headers.get("cookie");
  const sessionId = parseCookies(cookies || "").get(lucia.sessionCookieName);

  if (!sessionId) {
    throw redirect("/login");
  }

  await lucia.invalidateSession(sessionId);

  return destroySession();
}

export function destroySession() {
  const sessionCookie = lucia.createBlankSessionCookie();

  return redirect("/login", {
    headers: {
      "Set-Cookie": sessionCookie.serialize(),
    },
  });
}

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: Omit<DatabaseUser, "id">;
  }
}
