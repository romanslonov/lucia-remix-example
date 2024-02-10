import { createRequestHandler } from "@remix-run/express";
import { broadcastDevReady, installGlobals } from "@remix-run/node";
import express from "express";
import * as build from "@remix-run/dev/server-build";
import { auth, csrfProtection } from "./auth";

// patch in Remix runtime globals
installGlobals();

const app = express();
app.use(express.static("public"));

// CSRF protection
app.use(csrfProtection);

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
