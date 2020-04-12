import { Router } from "express";
import { checkIsAdmin, checkIsCommentOwner, checkJwt } from "../../middlewares";
import PostController from "../controllers/postController";

const router = Router();

/**
 *  The regex for the post's id in the post endpoints.
 */
const POST_UUID_REGEX_STR = ":postUUID";

/**
 * The regex for the comment's id in the post/comment endpoints
 */
const COMMENT_UUID_REGEX_STR = ":commentUUID";

// Delete the comment.
router.delete(
  `/${POST_UUID_REGEX_STR}/comments/${COMMENT_UUID_REGEX_STR}`,
  [checkJwt, checkIsCommentOwner],
  PostController.deleteComment
);

// Delete one post.
router.delete(
  `/${POST_UUID_REGEX_STR}`,
  [checkJwt, checkIsAdmin],
  PostController.deletePost
);

// Get all posts.
router.get("/", PostController.getPosts);

// Get one post.
router.get(`/${POST_UUID_REGEX_STR}`, PostController.getPost);

// Gets all the comments for the given post.
router.get(`/${POST_UUID_REGEX_STR}/comments`, PostController.getComments);

// Edit one post.
router.patch(
  `/${POST_UUID_REGEX_STR}`,
  [checkJwt, checkIsAdmin],
  PostController.editPost
);

// Create a new post.
router.post("/", [checkJwt, checkIsAdmin], PostController.createPost);

// Create a new comment.
router.post(
  `/${POST_UUID_REGEX_STR}/comments`,
  [checkJwt],
  PostController.createComment
);

export default router;
