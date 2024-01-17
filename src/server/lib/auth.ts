import { AuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { mailer } from "./mailer";
import { env } from "@/common/env.mjs";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "../database";
import { users } from "../database/schema";
import { sql } from "drizzle-orm";

export const authOptions: AuthOptions = {
  adapter: DrizzleAdapter(db) as never,
  secret: env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    EmailProvider({
      sendVerificationRequest: async ({ identifier: to, url }) => {
        await mailer.sendMail({
          to,
          from: env.SMTP_USER,
          subject: "Sign In",
          html: `<a href="${url}" >Sign IN</a>`,
        });
      },
    }),
  ],
  //callbacks: {
  //  signIn: async ({ user: requestUser }) => {
  //    const user = await db.query.users.findFirst();

  //    if (!user) {
  //      return true;
  //    }

  //    if (user.email !== requestUser.email) {
  //      return false;
  //    }

  //    return true;
  //  },
  //},
};
