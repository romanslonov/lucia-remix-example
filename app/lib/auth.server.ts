import { Lucia } from "lucia";
import { BetterSqlite3Adapter } from "@lucia-auth/adapter-sqlite";
import { db } from "./db";
import type { DatabaseUser } from "./db";
import { parseCookies } from "oslo/cookie";
import { redirect } from "@remix-run/node";

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

export function getSessionId(request: Request) {
  const cookies = request.headers.get("cookie");
  return parseCookies(cookies || "").get(lucia.sessionCookieName);
}

export function destroySession() {
  const sessionCookie = lucia.createBlankSessionCookie();

  return redirect("/login", {
    headers: {
      "Set-Cookie": sessionCookie.serialize(),
    },
  });
}

export async function requireUser(request: Request) {
  const sessionId = getSessionId(request);

  if (!sessionId) {
    throw destroySession();
  }

  const result = await lucia.validateSession(sessionId);

  if (result.session && result.session.fresh) {
    const sessionCookie = lucia.createSessionCookie(result.session.id);

    throw redirect(request.url, {
      headers: {
        "Set-Cookie": sessionCookie.serialize(),
      },
    });
  }

  if (!result.session) {
    throw destroySession();
  }

  return result;
}

export async function requireGuest(request: Request) {
  const sessionId = getSessionId(request);

  if (!sessionId) {
    return;
  }

  const result = await lucia.validateSession(sessionId);

  if (result.session) {
    throw redirect("/");
  }
}

export async function logout(request: Request) {
  const sessionId = getSessionId(request);

  if (!sessionId) {
    throw redirect("/login");
  }

  await lucia.invalidateSession(sessionId);

  return destroySession();
}

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: Omit<DatabaseUser, "id">;
  }
}
