import bcrypt from "bcrypt";
import { BadRequestError, UnauthorizedError } from "../../errors.js";
import { generateToken } from "../../utils/jwt.js";
import { createUserDao, existsEmailUserDao } from "./user.dao.js";

const EMAIL_ALREADY_REGISTERED_MESSAGE = "Email address is already registered";

export async function registerUser({ email, password }) {
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await existsEmailUserDao({ email: normalizedEmail });

    if (existingUser) {
        throw BadRequestError(EMAIL_ALREADY_REGISTERED_MESSAGE);
    }

    let user;
    try {
        user = await createUserDao({ email: normalizedEmail, password });
    } catch (err) {
        if (err.code === 11000) {
            throw BadRequestError(EMAIL_ALREADY_REGISTERED_MESSAGE);
        }
        throw err;
    }

    const token = generateToken({
        sub: user._id.toString(),
        email: normalizedEmail,
    });
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

    return generateToken({
        sub: user._id.toString(),
        email: normalizedEmail,
    });
}
