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
    secure: process.env.NODE_ENV === "production",
  },
};

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}
