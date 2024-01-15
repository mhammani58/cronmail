import {
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
} from "drizzle-orm/pg-core";
import type { AdapterAccount } from "@auth/core/adapters";
import { randomUUID } from "crypto";
import { relations } from "drizzle-orm";

export const users = pgTable("user", {
  id: text("id").notNull().primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

export const emails = pgTable("emails", {
  id: text("id").notNull().primaryKey().$defaultFn(randomUUID),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
});

export type Email = typeof emails.$inferSelect;

export const crons = pgTable("crons", {
  id: text("id").notNull().primaryKey().$defaultFn(randomUUID),
  cronId: text("cronId").notNull().unique(),
  emailId: text("emailId")
    .notNull()
    .references(() => emails.id, { onDelete: "cascade" }),
  hour: integer("hour").notNull(),
  minute: integer("minute").notNull(),
});

export type Cron = typeof crons.$inferSelect;

export const emailsRelations = relations(emails, ({ many }) => ({
  crons: many(crons),
}));

export const cronsRelations = relations(crons, ({ one }) => ({
  email: one(emails, {
    fields: [crons.emailId],
    references: [emails.id],
  }),
}));

export const targets = pgTable("targets", {
  id: text("id").notNull().primaryKey().$defaultFn(randomUUID),
  email: text("email").notNull().unique()
})
