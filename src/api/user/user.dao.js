import User from "./user.model.js";

export async function createUserDao({ email, password }) {
    const user = new User({ email, password });
    await user.save();
    return user;
}

export async function findUserByEmailDao({ email }) {
    return await User.findOne({ email });
}
