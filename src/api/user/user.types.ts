import type { z } from "zod";
import { loginSchema } from "../auth/auth.validation.js";

export type UserCredentials = z.infer<typeof loginSchema>;
