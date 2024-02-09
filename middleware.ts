import { lucia } from "~/lib/auth.server";
import type { Request, Response } from "express";
import { parseCookies } from "oslo/cookie";

export async function auth(request: Request, response: Response) {
  const sessionId = parseCookies(request.headers.cookie || "").get(
    lucia.sessionCookieName
  );

  if (!sessionId) {
    return { user: null, session: null };
  }

  const result = await lucia.validateSession(sessionId);

  if (result.session && result.session.fresh) {
    const sessionCookie = lucia.createSessionCookie(result.session.id);

    response.setHeader("Set-Cookie", sessionCookie.serialize());
  }

  if (!result.session) {
    const sessionCookie = lucia.createBlankSessionCookie();

    response.setHeader("Set-Cookie", sessionCookie.serialize());
  }

  return result;
}
