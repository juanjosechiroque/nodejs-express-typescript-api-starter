import User from "./user.model.js";
import type { UserCredentials } from "./user.types.js";

export async function createUserDao({ email, password }: UserCredentials) {
    const user = new User({ email, password });
    await user.save();
    return user;
}

export async function findUserByEmailDao({ email }: Pick<UserCredentials, "email">) {
    return await User.findOne({ email });
}
