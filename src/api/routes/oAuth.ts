import { Router } from "express";
import OAuthController from "../controllers/oAuthController";

const router = Router();

// Sends the access token to github to retrieve the user's avatar
// and username and creates a jwt token for that user.
router.post("/", OAuthController.loginWithGithub);

export default router;
