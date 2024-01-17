/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ["**/.*"],
  serverDependenciesToBundle: [
    "lucia",
    "@lucia-auth/adapter-prisma",
    "oslo",
  ],
};
