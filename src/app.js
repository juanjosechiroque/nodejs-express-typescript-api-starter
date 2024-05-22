import express from "express";
import router from "./router.js";
import cors from "cors";
import { errorGenericHandler } from "./middleware.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(router);
app.use(errorGenericHandler);

export default app;
