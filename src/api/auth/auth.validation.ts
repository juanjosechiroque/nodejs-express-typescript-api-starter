import { z } from "zod";

export const loginSchema = z.object({
    email: z.email().trim().toLowerCase().max(254, "Email must be at most 254 characters long"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .max(72, "Password must be at most 72 characters long")
        .refine((password) => Buffer.byteLength(password, "utf8") <= 72, {
            message: "Password must be at most 72 bytes long",
        }),
});
