import supertest from "supertest";
import app from "../app.js";

export const V1 = "/v1";
export const api = supertest(app);
