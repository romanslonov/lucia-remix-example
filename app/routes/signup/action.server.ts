import { json, redirect } from "@remix-run/node";
import { Argon2id } from "oslo/password";
import { lucia } from "~/lib/auth.server";
import { db } from "~/lib/db";
import { SqliteError } from "better-sqlite3";
import { generateId } from "lucia";

export async function signup(request: Request) {
  const formData = await request.formData();

  const username = formData.get("username");
  // username must be between 4 ~ 31 characters, and only consists of lowercase letters, 0-9, -, and _
  // keep in mind some database (e.g. mysql) are case insensitive
  if (
    typeof username !== "string" ||
    username.length < 3 ||
    username.length > 31 ||
    !/^[a-z0-9_-]+$/.test(username)
  ) {
    return json({
      error: "Invalid username",
    });
  }
  const password = formData.get("password");
  if (
    typeof password !== "string" ||
    password.length < 6 ||
    password.length > 255
  ) {
    return json({
      error: "Invalid password",
    });
  }

  const hashedPassword = await new Argon2id().hash(password);
  const userId = generateId(15);

  try {
    db.prepare("INSERT INTO user (id, username, password) VALUES(?, ?, ?)").run(
      userId,
      username,
      hashedPassword
    );

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    return redirect("/", {
      headers: {
        "Set-Cookie": sessionCookie.serialize(),
      },
    });
  } catch (e) {
    if (e instanceof SqliteError && e.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return json({
        error: "Username already used",
      });
    }
    return json({
      error: "An unknown error occurred",
    });
  }
}
