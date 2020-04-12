import { Request, Response } from 'express';
import { EHttpErrorCodes } from '../../types';
import BlogService, { getBlogService } from '../services/blog';

class VisitorController {
  /**
   * @returns Gets or creates an instance of the post service.
   */
  static get blogService(): BlogService {
    if (!VisitorController._blogService) {
      VisitorController._blogService = getBlogService();
    }
    return VisitorController._blogService;
  }

  /**
   * Deletes a user from the database for the given UUID.
   */
  public static deleteVisitor = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const visitorUUID: string = req.params.userUUID;
    try {
      await VisitorController.blogService.deleteVisitor(visitorUUID);
    } catch (error) {
      res.status(EHttpErrorCodes.InternalServerError).send(error);
      return;
    }
    res.status(EHttpErrorCodes.NoContent).send();
  };

  /**
   * Gets the data for the user that is logged in.
   */
  public static getMe = async (req: Request, res: Response): Promise<void> => {
    const { uuid } = res.locals.jwtPayload;
    try {
      const visitor = await VisitorController.blogService.getVisitor(uuid);
      res.send({ ...visitor, role: 'visitor' });
    } catch (error) {
      res.status(EHttpErrorCodes.NotFound).send('Failed to find your data.');
      return;
    }
  };

  /**
   * Gets a visitor by UUID.
   */
  public static getVisitor = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const visitor = await VisitorController.blogService.getVisitor(
        req.params.userUUID
      );
      res.send(visitor);
    } catch (error) {
      res.status(EHttpErrorCodes.NotFound).send('Visitor not found.');
      return;
    }
  };

  /**
   * Gets the visitors in the database.  If there is an offset start there to
   * the given limit.
   */
  public static getVisitors = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const offset = parseInt(req.query.offset, 10);
    const limit = parseInt(req.query.limit, 10);
    // Fetch the visitors, if values are undefined it should return everything.
    const payload = await VisitorController.blogService.getVisitors(
      offset,
      limit
    );
    res.send(payload);
  };

  private static _blogService: BlogService = null;
}

export default VisitorController;
