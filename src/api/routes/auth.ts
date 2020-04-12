import { Router } from "express";
import { checkIsAdmin, checkJwt } from "../../middlewares";
import AuthController from "../controllers/authController";

const router = Router();

// Login route.
router.post("/login", AuthController.login);

// Logout route.
router.get("/logout", [checkJwt], AuthController.logout);

// Get me.
router.get("/me", [checkJwt, checkIsAdmin], AuthController.getMe);

export default router;
