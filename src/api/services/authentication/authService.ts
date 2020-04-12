import { getRepository, Repository } from 'typeorm';
import { User } from '../../../entities';
import JwtTokenGenerator from '../../../services/jwt/jwtTokenGenerator';

export class AuthService {
  /**
   * Creates a new instance of the Auth Service.
   * @param userRepo The user repo.
   */
  constructor(private readonly userRepo: Repository<User>) {
    /** */
  }

  /**
   * Get's the user's data.
   * @param userUUID The user's uuid.
   * @returns The specified user for the given id.
   */
  public getMe = async (userUUID: string): Promise<User> => {
    try {
      return this.userRepo.findOneOrFail({
        select: ['id', 'username', 'uuid', 'isAdmin'],
        where: [{ uuid: userUUID }]
      });
    } catch (error) {
      throw new Error('The specified user does not exist.');
    }
  };

  /**
   * Logs a user into the application.
   * @param username The user's name.
   * @param password The user's password.
   * @returns A authentication payload that contains user data and jwt token.
   */
  public login = async (username: string, password: string): Promise<any> => {
    if (!username || !password) {
      throw new Error('Request failed to include username and/or password.');
    }

    // Check if encrypted password match.
    const user = await this.getUserByUsername(username);
    if (!user.checkIfUnencryptedPasswordIsValid(password) || !user.isAdmin) {
      throw new Error('Invalid password or you are not authorized.');
    }

    return await JwtTokenGenerator.generateAuthPayload(
      '',
      '',
      user.isAdmin,
      user.username,
      user.uuid
    );
  };

  /**
   * Just a stub for now since there is no sessions.
   */
  public logout = async (): Promise<any> => {
    return { auth: false, token: null };
  };

  /**
   * Gets the specified user for the given username.
   * @param username The user's username.
   * @returns The user for the given username.
   */
  private getUserByUsername = async (username: string): Promise<User> => {
    try {
      return this.userRepo.findOneOrFail({
        where: [{ username }]
      });
    } catch (error) {
      throw new Error('The specified user does not exist.');
    }
  };
}

const getAuthService = () => {
  return new AuthService(getRepository(User));
};

export default getAuthService;
