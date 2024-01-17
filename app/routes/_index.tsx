import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { requireUser } from "~/lib/auth.server";

export const meta: MetaFunction = () => {
  return [{ title: "Lucia example" }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { user } = await requireUser(request);

  return json({ user });
}

export default function Index() {
  const { user } = useLoaderData<typeof loader>();
  return (
    <>
      <h1>Hi, {user.username}!</h1>
      <p>Your user ID is {user.id}.</p>
      <Form action="/logout" method="post">
        <button type="submit">Sign out</button>
      </Form>
    </>
  );
}
