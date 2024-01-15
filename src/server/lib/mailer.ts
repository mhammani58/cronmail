import { env } from "@/common/env.mjs";
import nodemailer from "nodemailer";

export const mailer = nodemailer.createTransport({
  service : "gmail",
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS
  }
})
