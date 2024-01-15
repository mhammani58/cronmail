"use server";

import { env } from "@/common/env.mjs";
import { db } from "../database";
import { createEmailSchema, updateEmailSchema } from "@/common/validations";
import { eq } from "drizzle-orm";
import { crons, emails } from "../database/schema";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";

const auth = <T extends Array<any>, U>(fn: (...args: T) => U) => {
  return async (...args: T) => {
    const session = await getServerSession(authOptions);

    if (!session) {
      throw new Error("Unauthenticated");
    }

    return await fn(...args);
  };
};

function subtractOneHour(hour: number) {
  hour = (hour + 24) % 24;

  // Subtract one hour
  let newHour = (hour - 1 + 24) % 24;

  return newHour;
}

interface CreateCronProps {
  hour: number;
  minute: number;
  emailId: string;
}

const createCron = async ({ hour, minute, emailId }: CreateCronProps) => {
  const endpoint = new URL("/api/crons", env.NEXTAUTH_URL).toString();
  const url = `https://qstash.upstash.io/v2/schedules/${endpoint}?emailId=${emailId}`;

  const newHour = subtractOneHour(hour);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.QSTASH_TOKEN}`,
      "Upstash-Cron": `${minute} ${newHour} * * *`,
    },
  });

  return {
    response,
    data: await response.json(),
    hour,
    minute,
  };
};

const deleteCron = async (id: string) => {
  return await fetch(`https://qstash.upstash.io/v2/schedules/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${env.QSTASH_TOKEN}`,
    },
  });
};

export const getEmailsAction = auth(async () => {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("Unauthenticated");
  }

  return db.query.emails.findMany();
});

const showEmailSchema = z.object({
  emailId: z.string().uuid(),
});

export const showEmailAction = auth(async (body: unknown) => {
  const validation = showEmailSchema.safeParse(body);

  if (!validation.success) return undefined;

  return await db.query.emails.findFirst({
    where: eq(emails.id, validation.data.emailId),
    with: {
      crons: true,
    },
  });
});

export const deleteEmailAction = auth(async (body: unknown) => {
  const input = showEmailSchema.parse(body);

  const email = await db.query.emails.findFirst({
    where: eq(emails.id, input.emailId),
    with: {
      crons: true,
    },
  });

  if (!email) {
    throw new Error("Email not found");
  }

  await Promise.all(
    email.crons.map((cron) => {
      return deleteCron(cron.cronId);
    })
  );

  await db.delete(emails).where(eq(emails.id, input.emailId));
});

export const createEmailAction = auth(async (body: unknown) => {
  const input = createEmailSchema.parse(body);

  const emailCheck = await db.query.emails.findFirst({
    where: eq(emails.email, input.email),
  });

  if (emailCheck) {
    throw new Error("Email address already exists");
  }

  const [email] = await db
    .insert(emails)
    .values({
      email: input.email,
      password: input.password,
      subject: input.subject,
      content: input.subject,
    })
    .returning({
      id: emails.id,
    });

  // wait for crons to be created
  const createdCrons = await Promise.allSettled(
    input.timestamps.map((timestamp) => {
      return createCron({
        ...timestamp,
        emailId: email.id,
      });
    })
  );

  // check crons
  for (let cron of createdCrons) {
    if (cron.status === "rejected" || !("scheduleId" in cron.value.data)) {
      await Promise.all([
        ...createdCrons.map((cron) => {
          if (cron.status === "rejected") {
            return undefined;
          }

          return deleteCron(cron.value.data.scheduleId);
        }),
        db.delete(emails).where(eq(emails.id, email.id)),
      ]);

      throw new Error("Something went wrong");
    }
  }

  if (createdCrons.length) {
    await db.insert(crons).values(
      createdCrons
        .map((v) => (v.status === "fulfilled" ? v.value : undefined))
        .filter((v) => v)
        .map((cron) => {
          return {
            cronId: cron!.data.scheduleId,
            emailId: email.id,
            hour: cron!.hour,
            minute: cron!.minute,
          };
        })
    );
  }
});

export const updateEmailAction = auth(async (body: unknown) => {
  const input = updateEmailSchema.parse(body);

  const email = await db.query.emails.findFirst({
    where: eq(emails.id, input.emailId),
    with: {
      crons: true,
    },
  });

  if (!email) {
    throw new Error("Email not found");
  }

  const emailCheck = await db.query.emails.findFirst({
    where: eq(emails.email, input.email),
  });

  if (emailCheck && emailCheck.id !== email.id) {
    throw new Error("Email address already taken");
  }

  await db
    .update(emails)
    .set({
      email: input.email,
      password: input.password,
      subject: input.subject,
      content: input.content,
    })
    .where(eq(emails.id, email.id));

  await Promise.all(
    email.crons.map((cron) => {
      return deleteCron(cron.cronId);
    })
  );

  const createdCrons = await Promise.all(
    input.timestamps.map((cron) => {
      return createCron({
        hour: cron.hour,
        minute: cron.minute,
        emailId: email.id,
      });
    })
  );

  await db.delete(crons).where(eq(crons.emailId, email.id));

  if (createdCrons.length) {
    await db.insert(crons).values(
      createdCrons.map((cron) => {
        return {
          cronId: cron.data.scheduleId,
          emailId: email.id,
          minute: cron.minute,
          hour: cron.hour,
        };
      })
    );
  }

  return;
});
