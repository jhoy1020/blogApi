import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import config from '../config';
import AwsManager from '../services/aws/awsManager';
import JwtTokenGenerator from '../services/jwt/jwtTokenGenerator';
import EHttpErrorCodes from '../types/httpErrorCodes';

const checkJwt = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  // Get the jwt token from the head.
  const token = req.headers.authorization as string;
  if (!token || !token.startsWith('bearer')) {
    res.send(EHttpErrorCodes.Unauthorized).send();
    return;
  }
  const jwtKeys = await AwsManager.getSecret(config.awsJwtSecretKey);
  let jwtPayload = null;
  try {
    jwtPayload = jwt.verify(token.split(' ')[1], jwtKeys.privateKey, {
      expiresIn: '',
      issuer: '',
    });
    res.locals.jwtPayload = jwtPayload;
  } catch (error) {
    // If token is not valid, respond with 401 (unauthorized).
    res.status(EHttpErrorCodes.Unauthorized).send();
    return;
  }

  // We want to send a new token on every request.
  const { accessToken, avatarUrl, isAdmin, username, uuid } = jwtPayload;
  const newToken = await JwtTokenGenerator.generateAuthPayload(
    accessToken || '',
    avatarUrl,
    isAdmin,
    username,
    uuid,
  );

  res.setHeader('token', newToken);
  next();
};

export default checkJwt;
