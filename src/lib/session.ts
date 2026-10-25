import { cookies } from "next/headers";
import { getIronSession, type SessionOptions } from "iron-session";
import type { Role } from "@prisma/client";

export type SessionData = {
  userId: string;
  username: string;
  role: Role;
};

export const sessionOptions: SessionOptions = {
  cookieName: "fadak_session",
  password: process.env.SESSION_SECRET as string,
  cookieOptions: {
    // Browsers only send "secure" cookies over https. The shop runs on plain
    // http inside its own network (http://192.168.x.x:3000), so this is off
    // unless COOKIE_SECURE=true, which an https deployment should set.
    secure: process.env.COOKIE_SECURE === "true",
  },
};

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}
