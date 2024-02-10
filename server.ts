import { createRequestHandler } from "@remix-run/express";
import { broadcastDevReady, installGlobals } from "@remix-run/node";
import express from "express";
import * as build from "@remix-run/dev/server-build";
import { auth } from "./auth";
import { verifyRequestOrigin } from "lucia";

// patch in Remix runtime globals
installGlobals();

const app = express();
app.use(express.static("public"));

// CSRF protection
app.use((request, response, next) => {
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
});

// and your app is "just a request handler"
app.all(
  "*",
  createRequestHandler({
    build,
    getLoadContext: async (request, response) => {
      const { session, user } = await auth(request, response);
      return {
        session,
        user,
      };
    },
  })
);

app.listen(3000, () => {
  if (process.env.NODE_ENV === "development") {
    broadcastDevReady(build);
  }
  console.log("App listening on http://localhost:3000");
});
