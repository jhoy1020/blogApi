import { Router } from "express";
import EmailController from "../controllers/emailController";

const router = Router();

// Sends an email.
router.post("/", EmailController.sendEmail);

export default router;
