import { Router } from "express";
import { registerUserHandler } from "./users.controller.js";
import { authenticate } from "../../middleware/authMiddleware.js";

const router = Router();

router.post("/signup", registerUserHandler);
router.get("/protected", authenticate, (req, res) => {
    res.status(200).json({ message: "Ruta protegida accesible" });
});

export default router;
