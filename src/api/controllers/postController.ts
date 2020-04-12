import { Request, Response } from 'express';
import { EHttpErrorCodes } from '../../types';
import BlogService, { getBlogService } from '../services/blog';

class PostController {
  /**
   * @returns Gets or creates an instance of the post service.
   */
  static get blogService(): BlogService {
    if (!PostController._blogService) {
      PostController._blogService = getBlogService();
    }
    return PostController._blogService;
  }

  /**
   * Creates a new comment and saves it for the specified post.
   */
  public static createComment = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const postUUID: string = req.params.postUUID;
    const { commentUUID, createdAt, text } = req.body;
    const { avatarUrl, username, uuid } = res.locals.jwtPayload;
    try {
      const visitor = await PostController.blogService.getOrCreateVisitor(
        avatarUrl,
        username,
        uuid
      );
      const comment = await PostController.blogService.createComment(
        text,
        commentUUID,
        createdAt,
        postUUID,
        visitor
      );
      res.send(comment);
    } catch (error) {
      res.status(EHttpErrorCodes.Conflict).send('Failed to create comment.');
      return;
    }
  };

  /**
   * Create a new post and saves it in the db.
   */
  public static createPost = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const {
      createdAt,
      imageUrl,
      isPublished,
      text,
      postUUID,
      title
    } = req.body;
    try {
      const post = await PostController.blogService.createPost(
        createdAt,
        imageUrl,
        text,
        postUUID,
        title,
        isPublished
      );
      res.send(post);
    } catch (error) {
      res
        .status(EHttpErrorCodes.Conflict)
        .send(`Failed to create post: ${error}`);
      return;
    }
  };

  /**
   * Deletes the specified comment.
   */
  public static deleteComment = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const commentUUID = req.params.commentUUID;
    try {
      await PostController.blogService.deleteComment(commentUUID);
    } catch (error) {
      res
        .status(EHttpErrorCodes.InternalServerError)
        .send(`Failed to delete comment: ${error}`);
      return;
    }
    res.status(EHttpErrorCodes.NoContent).send('Comment deleted.');
  };

  /**
   * Deletes the specified post.
   */
  public static deletePost = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const postUUID = req.params.postUUID;
    try {
      await PostController.blogService.deletePost(postUUID);
    } catch (error) {
      res
        .status(EHttpErrorCodes.InternalServerError)
        .send(`Failed to delete post: ${error}`);
      return;
    }
    res.status(EHttpErrorCodes.NoContent).send('Post deleted.');
  };

  /**
   * Edit and updates a specified post.
   */
  public static editPost = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const postUUID = req.params.postUUID;
    const { imageUrl, text, title, isPublished } = req.body;
    try {
      const post = await PostController.blogService.editPost(
        imageUrl,
        text,
        postUUID,
        title,
        isPublished
      );
      res.send(post);
    } catch (error) {
      res
        .status(EHttpErrorCodes.Conflict)
        .send(`Failed to update post: ${error}`);
      return;
    }
  };

  /**
   * Get all comments for the specific post.
   */
  public static getComments = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const postUUID = req.params.postUUID;
    try {
      const comments = await PostController.blogService.getComments(postUUID);
      res.send(comments);
    } catch (error) {
      res
        .status(EHttpErrorCodes.NoContent)
        .send('Failed to get comments for the post.');
    }
  };

  /**
   * Get a specific post for the given id.
   */
  public static getPost = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const postUUID = req.params.postUUID;
    try {
      const post = await PostController.blogService.getPost(postUUID);
      res.send(post);
    } catch (error) {
      res
        .status(EHttpErrorCodes.Conflict)
        .send('Failed to find specified post.');
    }
  };

  /**
   * Get a set of posts from the database.  Check to see if there is an offset
   * and / or limit.
   */
  public static getPosts = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const offset = parseInt(req.query.offset, 10);
    const limit = parseInt(req.query.limit, 10);
    // Fetch the posts, if values are undefined it should return everything.
    const posts = await PostController.blogService.getPosts(offset, limit);
    res.send(posts);
  };

  private static _blogService: BlogService = null;
}

export default PostController;
