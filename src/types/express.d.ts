import type { JwtPayload } from "../utils/jwt.js";

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
            validatedQuery?: Record<string, unknown>;
        }
    }
}

export {};
