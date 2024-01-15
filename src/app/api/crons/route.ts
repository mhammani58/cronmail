import { db } from "@/server/database";
import { emails } from "@/server/database/schema";
import { eq } from "drizzle-orm";
import nodemailer from "nodemailer";
import { z } from "zod";

const schema = z.object({
  emailId: z.string().uuid(),
});

const handler = async (request: Request) => {
  const { searchParams } = new URL(request.url);

  const validation = schema.safeParse({ emailId: searchParams.get("emailId") });

  if (!validation.success) {
    return Response.json({
      success: false,
    });
  }

  const { emailId } = validation.data;

  const email = await db.query.emails.findFirst({
    where: eq(emails.id, emailId),
  });

  if (!email) {
    return Response.json({
      success: false,
    });
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
      user: email.email,
      pass: email.password,
    },
  });

  const targets = await db.query.targets.findMany();

  await Promise.all(
    targets.map((target) => {
      return transporter.sendMail({
        to: target.email,
        from: email.email,
        subject: email.subject,
        text: email.content,
      });
    })
  );

  return Response.json({ success: true });
};

export { handler as POST };
