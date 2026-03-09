import bcrypt from "bcrypt";
import { BadRequestError, UnauthorizedError } from "../../errors.js";
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

export async function loginUser({ email, password }) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await existsEmailUserDao({ email: normalizedEmail });

    if (!user || !user.password) {
        throw UnauthorizedError("Invalid email or password");
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        throw UnauthorizedError("Invalid email or password");
    }

    return generateToken({ email: normalizedEmail });
}
