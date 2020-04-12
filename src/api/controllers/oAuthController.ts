import { Request, Response } from 'express';
import { EHttpErrorCodes } from '../../types';
import BlogService, { getBlogService } from '../services/blog';

class OAuthController {
  /**
   * @returns Gets or creates an instance of the post service.
   */
  static get blogService(): BlogService {
    if (!OAuthController._blogService) {
      OAuthController._blogService = getBlogService();
    }
    return OAuthController._blogService;
  }

  /**
   * Uses the access token to get the necessary user's data and
   * generates a jwt token for the user.
   */
  public static loginWithGithub = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { token } = req.body;
    try {
      const response = await OAuthController.blogService.loginWithGithub(token);
      res.send(response);
    } catch (error) {
      res.status(EHttpErrorCodes.BadRequest).send(error);
    }
  };

  private static _blogService: BlogService = null;
}

export default OAuthController;
