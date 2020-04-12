import { Request, Response } from "express";
import { EHttpErrorCodes } from "../../types";
import AuthService, { getAuthService } from "../services/authentication";

class AuthController {
  /**
   * @returns Gets or creates an instance of the auth service.
   */
  static get authService(): AuthService {
    if (!AuthController._authService) {
      AuthController._authService = getAuthService();
    }
    return AuthController._authService;
  }

  /**
   * Gets the logged in users data.
   */
  public static getMe = async (req: Request, res: Response): Promise<void> => {
    const { uuid } = res.locals.jwtPayload;
    try {
      const response = await AuthController.authService.getMe(uuid);
      res.send({ ...response, role: "admin" });
    } catch (error) {
      res.status(EHttpErrorCodes.InternalServerError).send(error);
      return;
    }
  };

  /**
   * Logs the user and creates an authentication token.
   */
  public static login = async (req: Request, res: Response): Promise<void> => {
    const { username, password } = req.body;
    try {
      const response = await AuthController.authService.login(
        username,
        password
      );
      res.send(response);
    } catch (error) {
      const errorCode =
        !username || !password
          ? EHttpErrorCodes.BadRequest
          : EHttpErrorCodes.Unauthorized;
      res.status(errorCode).send();
    }
  };

  /**
   * Logs the user out of the application.
   */
  public static logout = async (req: Request, res: Response): Promise<void> => {
    res.status(EHttpErrorCodes.Ok).send(AuthController.authService.logout);
  };

  private static _authService: AuthService = null;
}

export default AuthController;
