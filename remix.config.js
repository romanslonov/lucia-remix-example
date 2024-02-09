/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ["**/.*"],
  server: './server.ts',
  serverDependenciesToBundle: [
    "oslo",
  ],
};
