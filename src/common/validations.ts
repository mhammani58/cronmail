import { z } from "zod";

export const createEmailSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  subject: z.string().min(1),
  content: z.string().min(1),
  timestamps: z.array(
    z.object({
      hour: z.number().int().gte(0).lte(23),
      minute: z.number().int().gte(0).lte(59),
    }),
  ),
});

export type CreateEmailPayload = z.infer<typeof createEmailSchema>;

export const updateEmailSchema = z.object({
  emailId: z.string().uuid(),
  email: z.string().email(),
  password: z.string().min(1),
  subject: z.string().min(1),
  content: z.string().min(1),
  timestamps: z.array(
    z.object({
      hour: z.number().int().gte(0).lte(23),
      minute: z.number().int().gte(0).lte(59),
    }),
  ),
});

export type UpdateEmailPayload = z.infer<typeof updateEmailSchema>;
