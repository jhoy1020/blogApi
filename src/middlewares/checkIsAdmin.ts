import { NextFunction, Request, Response } from "express";
import EHttpErrorCodes from "../types/httpErrorCodes";

const checkIsAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { isAdmin } = res.locals.jwtPayload;
  // Check if array of authorized roles includes the user's role.
  if (!isAdmin) {
    res.status(EHttpErrorCodes.Unauthorized).send();
    return;
  }
  next();
};

export default checkIsAdmin;
