import {
  json,
  redirect,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [{ title: "Lucia example" }];
};

export async function loader({ context }: LoaderFunctionArgs) {
  const { user, session } = context;

  if (!session || !user) {
    throw redirect("/login");
  }

  return json({ user, session });
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
