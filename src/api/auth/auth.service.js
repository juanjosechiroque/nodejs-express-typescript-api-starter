import {
    registerUser as registerUserDomain,
    loginUser as loginUserDomain,
} from "../user/user.service.js";

export async function registerUser({ email, password }) {
    return registerUserDomain({ email, password });
}

export async function loginUser({ email, password }) {
    return loginUserDomain({ email, password });
}
