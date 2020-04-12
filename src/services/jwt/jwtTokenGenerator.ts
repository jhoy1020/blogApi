import * as jwt from 'jsonwebtoken';
import config from '../../config';
import AwsManager from '../aws/awsManager';

export default class JwtTokenGenerator {
  /**
   * Generates a jwt token with the users data.
   * @param accessToken Git's access token.
   * @param avatarUrl User's avatar url.
   * @param isAdmin Indicates if the user is an admin.
   * @param username The user's login.
   * @param uuid: The user's uuid.
   */
  public static generateAuthPayload = async (
    accessToken: string,
    avatarUrl: string,
    isAdmin: boolean,
    username: string,
    uuid: string,
  ): Promise<any> => {
    // Generate the payload.
    const payload = {
      accessToken,
      avatarUrl,
      isAdmin,
      username,
      uuid,
    };
    const jwtKeys = await AwsManager.getSecret(config.awsJwtSecretKey);
    return {
      token: jwt.sign(payload, jwtKeys.privateKey, {
        expiresIn: '',
        issuer: '',
      }),
      user: {
        avatarUrl,
        role: isAdmin ? 'admin' : 'visitor',
        username,
        uuid,
      },
    };
  };
}
