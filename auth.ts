import { lucia } from "~/lib/auth.server";
import type { Request, Response, NextFunction } from "express";
import { parseCookies } from "oslo/cookie";
import { verifyRequestOrigin } from "lucia";

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

export function csrfProtection(
  request: Request,
  response: Response,
  next: NextFunction
) {
  if (request.method === "GET") {
    return next();
  }
  const originHeader = request.headers.origin ?? null;
  // NOTE: You may need to use `X-Forwarded-Host` instead
  const hostHeader = request.headers.host ?? null;
  if (
    !originHeader ||
    !hostHeader ||
    !verifyRequestOrigin(originHeader, [hostHeader])
  ) {
    return response.status(403).end();
  }

  return next();
}
