import axios from 'axios';
import { validate } from 'class-validator';
import queryString = require('querystring');
import { getRepository, Repository } from 'typeorm';
import * as uuid from 'uuid';
import config from '../../../config';
import { Comment, Post, Visitor } from '../../../entities';
import AwsManager from '../../../services/aws/awsManager';
import JwtTokenGenerator from '../../../services/jwt/jwtTokenGenerator';

export class BlogService {
  /**
   * Creates a new instance of the blog service.
   * @param commentRepo The comment repository.
   * @param postRepo The post repository.
   * @param visitorRepo The visitor repository.
   */
  constructor(
    private readonly commentRepo: Repository<Comment>,
    private readonly postRepo: Repository<Post>,
    private readonly visitorRepo: Repository<Visitor>
  ) {
    /** */
  }

  /**
   * Creates a new comment for the given post.
   * @param text The text of the comment.
   * @param commentUUID The uuid for the comment.
   * @param createdAt When the comment was created.
   * @param postUUID The post's uuid that the comment is for.
   * @param visitor The visitor making the comment.
   * @returns The new created comment.
   */
  public createComment = async (
    text: string,
    commentUUID: string,
    createdAt: Date,
    postUUID: string,
    visitor: Visitor
  ): Promise<Comment> => {
    const post = await this.getPost(postUUID);
    const newComment = new Comment();
    newComment.createdAt = createdAt;
    newComment.post = post;
    newComment.text = text;
    newComment.uuid = commentUUID;
    newComment.visitor = visitor;
    this.validate(newComment);
    try {
      return this.saveComment(newComment);
    } catch (error) {
      throw new Error('Could not save the comment');
    }
  };

  /**
   * Creates a new post.
   * @param createdAt The creation date.
   * @param imageUrl The image url for the post.
   * @param text The text for the post.
   * @param postUUID The post's uuid.
   * @param title The title of the post.
   * @returns The new created post.
   */
  public createPost = async (
    createdAt: Date,
    imageUrl: string,
    text: string,
    postUUID: string,
    title: string,
    isPublished: boolean
  ): Promise<Post> => {
    const newPost = new Post();
    newPost.createdAt = createdAt;
    newPost.imageUrl = imageUrl;
    newPost.text = text;
    newPost.uuid = postUUID;
    newPost.title = title;
    newPost.isPublished = isPublished;
    await this.validate(newPost);
    return this.savePost(newPost);
  };

  /**
   * Deletes the specified comment.
   * @param commentUUID The comment's uuid.
   */
  public deleteComment = async (commentUUID: string): Promise<void> => {
    // Determine if the comment exist, if it doesn't pass the failure
    // up.  Otherwise delete the comment.
    const comment = await this.getComment(commentUUID);
    await this.commentRepo.delete(comment.id);
  };

  /**
   * Deletes the specified post.
   * @param postUUID The post's uuid.
   */
  public deletePost = async (postUUID: string): Promise<void> => {
    // Determine if the post exist, if it doesn't pass the failure
    // up.  Otherwise delete the post.
    const post = await this.getPost(postUUID);
    await this.postRepo.delete(post.id);
  };

  /**
   * Deletes the specified visitor.
   * @param visitorUUID The visitor's uuid.
   */
  public deleteVisitor = async (visitorUUID: string): Promise<void> => {
    const visitor = await this.getVisitor(visitorUUID);
    await this.visitorRepo.delete(visitor.id);
  };

  /**
   * Edits a post.
   * @param imageUrl The new image url.
   * @param text The updated text.
   * @param postUUID The uuid of the post.
   * @param title The updated title.
   * @param isPublished Indicates if the post is visible to users.
   * @returns The updated post.
   */
  public editPost = async (
    imageUrl: string,
    text: string,
    postUUID: string,
    title: string,
    isPublished: boolean
  ): Promise<Post> => {
    const updatePost = await this.getPost(postUUID);
    updatePost.imageUrl = imageUrl;
    updatePost.title = title;
    updatePost.text = text;
    updatePost.isPublished = isPublished;
    await this.validate(updatePost);
    return this.savePost(updatePost);
  };

  /**
   * Gets the comment for the given uuid.
   * @param commentUUID The comment's uuid.
   * @returns The comment for the given uuid.
   */
  public getComment = async (commentUUID: string): Promise<Comment> => {
    try {
      return this.commentRepo.findOneOrFail({
        uuid: commentUUID,
      });
    } catch (error) {
      throw new Error('The specified comment does not exist.');
    }
  };

  /**
   * Gets the comments for the post.
   * @param postUUID The post's uuid.
   * @returns A list of comments for the specified post.
   */
  public getComments = async (postUUID: string): Promise<Comment[]> => {
    try {
      // Need to get user's name and uuid.
      const post = await this.postRepo.findOneOrFail({
        relations: ['comments', 'comments.visitor'],
        where: [{ uuid: postUUID }],
      });
      return post.comments.sort((a, b) =>
        a.createdAt <= b.createdAt ? -1 : 1
      );
    } catch (error) {
      throw new Error('The specified post does not exist.');
    }
  };

  /**
   * Gets or creates the given user if the user is not in the db.
   * @param avatarUrl The user's url.
   * @param username The user's name.
   * @param visitorUUID The visitor's uuid.
   * @returns A new or exsiting visitor.
   */
  public getOrCreateVisitor = async (
    avatarUrl: string,
    username: string,
    visitorUUID: string
  ): Promise<Visitor> => {
    let visitor: Visitor = null;
    try {
      visitor = await this.visitorRepo.findOneOrFail({
        where: { avatarUrl },
      });
      if (visitor.username !== username) {
        await this.saveVisitor({ ...visitor, username });
      }
      return visitor;
    } catch (error) {
      visitor = null;
    }
    visitor = new Visitor();
    visitor.username = username;
    visitor.uuid = visitorUUID;
    visitor.avatarUrl = avatarUrl;
    await this.validate(visitor);
    return this.saveVisitor(visitor);
  };

  /**
   * Gets the specified post.
   * @param postUUID The post's uuid.
   * @returns The post for the spcified post's uuid.
   */
  public getPost = async (postUUID: string): Promise<Post> => {
    try {
      return this.postRepo.findOneOrFail({
        where: [{ uuid: postUUID }],
      });
    } catch (error) {
      throw new Error('The specified post does not exist.');
    }
  };

  /**
   * Get's a list of posts.
   * @param offset The offset to start on.
   * @param limit The limit of posts to retrieve.
   * @returns A list of posts.
   */
  public getPosts = async (offset?: number, limit?: number): Promise<any> => {
    // Get the total number of posts to determine if there should be a 'next' link.
    const postTotal = await this.postRepo.count();

    // Fetch the posts, if values are undefined it should return everything.
    const posts = await this.postRepo
      .createQueryBuilder('post')
      .select(['"createdAt"', '"imageUrl"', 'post', 'title', 'uuid'])
      .skip(offset || 0)
      .take(limit || postTotal)
      .orderBy('"createdAt"', 'DESC')
      .getMany();

    const payload = {
      nextOffset: postTotal,
      posts,
      previousOffset: 0,
    };

    if (limit) {
      // Compute the next offset.
      const nextOffset = offset + limit;
      payload.previousOffset = offset;
      payload.nextOffset = nextOffset >= postTotal ? 0 : nextOffset;
    }

    return payload;
  };

  /**
   * Get's the visitor.
   * @param visitorUUID The visitor's uuid.
   * @param visitorUsername The visitor's username.
   * @returns The visitor for the specified visitor's uuid.
   */
  public getVisitor = async (
    visitorUUID: string = '',
    visitorUsername: string = ''
  ): Promise<Visitor> => {
    try {
      const visitor = await this.visitorRepo
        .createQueryBuilder('visitor')
        .select(['"avatarUrl"', 'uuid', 'username'])
        .where('uuid = :uuid', { uuid: visitorUUID })
        .orWhere('username = :username', { username: visitorUsername })
        .execute();
      return visitor[0];
    } catch (error) {
      throw new Error('The specified user does not exist.');
    }
  };

  /**
   * Gets a list of visitors.
   * @param offset The offset to start on.
   * @param limit The limit of visitors to retrieve.
   * @returns A list of visitors.
   */
  public getVisitors = async (
    offset?: number,
    limit?: number
  ): Promise<any> => {
    // Get the total number of posts to determine if there should be a 'next' link.
    const visitorTotal = await this.visitorRepo.count();

    const visitors = await this.visitorRepo
      .createQueryBuilder('visitor')
      .skip(offset || 0)
      .take(limit || visitorTotal)
      .getMany();

    const payload = {
      nextOffset: visitorTotal,
      previousOffset: 0,
      users: visitors,
    };

    if (limit) {
      // Compute the next offset.
      const nextOffset = offset + limit;
      payload.previousOffset = offset;
      payload.nextOffset = nextOffset >= visitorTotal ? 0 : nextOffset;
    }

    return payload;
  };

  /**
   * Logs a user into github and gets their username and avatar url.
   * @param code The user's github user token.
   * @returns A authentication payload that contains user data and jwt token.
   */
  public loginWithGithub = async (code: string): Promise<any> => {
    // Get the access token from git that allows us to query for the user's
    // data.
    const accessToken = await this.getUsersGithubAccessToken(code);

    // Construct the user url and header to obtain the user's username
    // and avatar url.
    const header = {
      headers: {
        Authorization: `token ${accessToken}`,
      },
    };

    const response = await axios.get(config.githubUserUrl, header);
    const { login, avatar_url } = response.data;

    // check if user exsist in db.
    const visitor = await this.getVisitor('', login);
    const visitorUUID = visitor && visitor.uuid ? visitor.uuid : uuid();

    return JwtTokenGenerator.generateAuthPayload(
      accessToken,
      avatar_url,
      false,
      login,
      visitorUUID
    );
  };

  /**
   * Uses the code after the user logins to generate an access token to
   * get the user's github data.
   * @param code The code given back from github when the user signs in.
   */
  private getUsersGithubAccessToken = async (code: string): Promise<string> => {
    const gitHubInfo = await AwsManager.getSecret(config.awsGithubSecretKey);
    const githubUrl =
      config.githubOAuthUrl +
      queryString.stringify({
        client_id: gitHubInfo.gitHubClientId,
        client_secret: gitHubInfo.gitHubSecretKey,
        code,
      });

    // Call github to obtain the access code.
    // Construct the header and authorization url to obtain the access token
    // that allows us to access the users data.
    const response = await axios.post(githubUrl, null, {
      headers: {
        Accept: 'application/json',
      },
    });

    const { access_token } = response.data;
    return access_token;
  };

  /**
   * Saves a comment to the repo.
   * @param comment The comment to save or update.
   * @returns The saved comment.
   */
  private saveComment = async (comment: Comment): Promise<Comment> => {
    try {
      return this.commentRepo.save(comment);
    } catch (error) {
      throw new Error('Could not save the comment');
    }
  };

  /**
   * Saves a post to the repo.
   * @param post The post to save or update.
   * @returns The saved comment.
   */
  private savePost = async (post: Post): Promise<Post> => {
    try {
      return this.postRepo.save(post);
    } catch (error) {
      throw new Error('Failed to save post.');
    }
  };

  /**
   * Saves a visitor to the repo.
   * @param visitor The visitor to save or update.
   * @returns The saved visitor.
   */
  private saveVisitor = async (visitor: Visitor): Promise<Visitor> => {
    try {
      return this.visitorRepo.save(visitor);
    } catch (error) {
      throw new Error('Failed to save user.');
    }
  };

  /**
   * Validates the specified entity.
   * @param entity The entity to validate.
   */
  private validate = async (entity: any): Promise<void> => {
    const errors = await validate(entity);
    if (errors.length) {
      const errorMsg = errors.join(', ');
      throw new Error(errorMsg);
    }
  };
}

const getBlogService = (): BlogService => {
  return new BlogService(
    getRepository(Comment),
    getRepository(Post),
    getRepository(Visitor)
  );
};
export default getBlogService;
