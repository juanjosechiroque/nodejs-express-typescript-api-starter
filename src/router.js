import { Router }  from "express";

import routerProducts from "./api/products/products.router.js";

const router = Router();

router.use("/products", routerProducts);

export default router;