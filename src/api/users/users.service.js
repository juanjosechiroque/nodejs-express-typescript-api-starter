import { BadRequestError } from "../../errors.js";
import { generateToken } from "../../utils/jwt.js";
import { createUserDao, existsEmailUserDao } from "./users.dao.js";

export async function registerUser({ email, password }) {
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await existsEmailUserDao({ email: normalizedEmail });

    if (existingUser) {
        throw BadRequestError("Email address is already registered");
    }

    await createUserDao({ email: normalizedEmail, password });
    const token = generateToken({ email: normalizedEmail });
    return token;
}
