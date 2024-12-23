import User from "./users.model.js";

export async function createUserDao({ email, password }) {
    const user = new User({ email, password });
    await user.save();
    return user;
}

export async function existsEmailUserDao({ email }) {
    return await User.findOne({ email });
}
