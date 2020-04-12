import { Router } from "express";
import { checkIsAdmin, checkJwt } from "../../middlewares";
import UploadController from "../controllers/uploadController";

const router = Router();

// Create a new post.
router.post("/", [checkJwt, checkIsAdmin], UploadController.uploadFile);

export default router;
