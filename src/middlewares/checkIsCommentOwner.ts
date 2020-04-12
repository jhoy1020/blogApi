import { NextFunction, Request, Response } from "express";
import { getRepository } from "typeorm";
import { Visitor } from "../entities";
import EHttpErrorCodes from "../types/httpErrorCodes";

const checkIsCommentOwner = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const commentUUID = req.params.commentUUID;
  const { isAdmin, uuid } = res.locals.jwtPayload;

  let isOwner = false;
  try {
    const visitor = await getRepository(Visitor).findOneOrFail({
      relations: ["comments"],
      where: { uuid }
    });
    isOwner = visitor.comments.find(v => v.uuid === commentUUID) !== undefined;
  } catch (error) {
    console.log(error);
  }

  if (!isOwner && !isAdmin) {
    res.status(EHttpErrorCodes.Unauthorized).send();
    return;
  }
  next();
};

export default checkIsCommentOwner;
