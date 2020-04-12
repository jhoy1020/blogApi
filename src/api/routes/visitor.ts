import { Router } from "express";
import { checkIsAdmin, checkJwt } from "../../middlewares";
import VisitorController from "../controllers/visitorController";

const router = Router();

// The user regex for the user's id in the user endpoints.
const USER_UUID_REGEX_STR = "/:userUUID";

// Delete visitor.
router.delete(
  USER_UUID_REGEX_STR,
  [checkJwt, checkIsAdmin],
  VisitorController.deleteVisitor
);

// Get all visitors.
router.get("/", [checkJwt, checkIsAdmin], VisitorController.getVisitors);

// Get one visitor.
router.get(
  USER_UUID_REGEX_STR,
  [checkJwt, checkIsAdmin],
  VisitorController.getVisitor
);

// Gets the current logged in user's data.
router.get("/me", [checkJwt], VisitorController.getMe);

export default router;
