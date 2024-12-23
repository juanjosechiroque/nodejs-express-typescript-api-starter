import supertest from "supertest";
import app from "../app.js";
export const api = supertest(app);
