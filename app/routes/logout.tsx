import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { logout } from "~/lib/auth.server";

export const loader = async () => redirect("/");

export const action = async ({ request }: ActionFunctionArgs) =>
  logout(request);
