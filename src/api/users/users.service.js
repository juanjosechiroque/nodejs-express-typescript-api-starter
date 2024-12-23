import { BadRequestError } from "../../errors.js";
import { generateToken } from "../../utils/jwt.js";
import { createUserDao, existsEmailUserDao } from "./users.dao.js";

export async function registerUser({ email, password }) {
    const existingUser = await existsEmailUserDao({ email });
    if (existingUser) {
        throw BadRequestError("Email address is already registered");
    }

    await createUserDao({ email, password });
    const token = generateToken({ email });
    return token;
}
