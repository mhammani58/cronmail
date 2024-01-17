import { db } from "@/server/database";
import { crons, emails } from "@/server/database/schema";
import { and, eq } from "drizzle-orm";
import nodemailer from "nodemailer";
import { z } from "zod";

const schema = z.object({
  hour: z
    .string()
    .min(1)
    .max(191)
    .transform((v) => parseInt(v) || 0),
  minute: z
    .string()
    .min(1)
    .max(191)
    .transform((v) => parseInt(v) || 0),
});

const handler = async (request: Request) => {
  const { searchParams } = new URL(request.url);

  const validation = schema.safeParse({
    hour: searchParams.get("hour"),
    minute: searchParams.get("minute"),
  });

  if (!validation.success) {
    return Response.json({
      success: false,
    });
  }

  const { hour, minute } = validation.data;

  const dbCrons = await db.query.crons.findMany({
    where: and(eq(crons.hour, hour), eq(crons.minute, minute)),
    with: {
      email: true,
    },
  });

  const targets = await db.query.targets.findMany();

  await Promise.all(
    dbCrons.map(async (cron) => {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        auth: {
          user: cron.email.email,
          pass: cron.email.password,
        },
      });

      return Promise.all(
        targets.map((target) => {
          return transporter.sendMail({
            to: target.email,
            from: cron.email.email,
            subject: cron.email.subject,
            text: cron.email.content,
          });
        })
      );
    })
  );

  return Response.json({ success: true });
};

export { handler as POST };
