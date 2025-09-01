// This file provide validation for advertisment

import { z } from "zod";

export const PurchaseFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name is too short" })
    .max(50, { message: "Name is too long" })
    .regex(/^[a-zA-Z0-9 .,'-]+$/, { message: "Name contains invalid characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  message: z
    .string()
    .max(1000, { message: "Message too long" })
    .refine((val) => !/<script|<\/script/i.test(val), {
      message: "Malicious content detected",
    }),
});

export type PurchaseFormData = z.infer<typeof PurchaseFormSchema>;
