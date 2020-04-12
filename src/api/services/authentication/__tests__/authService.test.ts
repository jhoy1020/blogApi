import JwtTokenGenerator from '../../../../services/jwt/jwtTokenGenerator';
import { AuthService } from '../authService';

describe('AuthService Test Cases.', () => {
  const mockUserRepo = {
    findOneOrFail: jest.fn()
  };
  // @ts-ignore
  const authService = new AuthService(mockUserRepo);

  beforeEach(() => {
    const keys = Object.keys(mockUserRepo);
    for (const key of keys) {
      mockUserRepo[key].mockClear();
    }
  });

  test('Validate user can be found.', async done => {
    const expectedUser = {
      id: '1',
      isAdmin: true,
      username: 'test user',
      uuid: 'uuid1'
    };

    mockUserRepo.findOneOrFail = jest.fn(() => expectedUser);

    const actualUser = await authService.getMe('uuid1');

    expect(mockUserRepo.findOneOrFail.mock.calls.length).toEqual(1);
    expect(mockUserRepo.findOneOrFail.mock.calls[0][0]).toEqual({
      select: ['id', 'username', 'uuid', 'isAdmin'],
      where: [{ uuid: 'uuid1' }]
    });

    expect(actualUser).toEqual(expectedUser);

    done();
  });

  it.each`
    username      | password
    ${''}         | ${'password'}
    ${'username'} | ${''}
    ${''}         | ${''}
  `(
    'Validate error when usernam: %username and password: %password',
    async ({ username, password }) => {
      let actualError = null;
      try {
        await authService.login(username, password);
      } catch (error) {
        actualError = error;
      }
      expect(actualError.message).toEqual(
        'Request failed to include username and/or password.'
      );
    }
  );

  test('Validate user can login.', async done => {
    const expectedUser = {
      checkIfUnencryptedPasswordIsValid: jest.fn(() => true),
      id: '1',
      isAdmin: true,
      username: 'testUser',
      uuid: 'uuid1'
    };

    const jwtTokenGenSpy = spyOn(
      JwtTokenGenerator,
      'generateAuthPayload'
    ).and.returnValue('12345');

    mockUserRepo.findOneOrFail = jest.fn(() => expectedUser);

    const actualPayload = await authService.login('testUser', 'password');

    expect(mockUserRepo.findOneOrFail.mock.calls.length).toEqual(1);
    expect(mockUserRepo.findOneOrFail.mock.calls[0][0]).toEqual({
      where: [{ username: 'testUser' }]
    });
    expect(
      expectedUser.checkIfUnencryptedPasswordIsValid.mock.calls.length
    ).toEqual(1);
    expect(
      expectedUser.checkIfUnencryptedPasswordIsValid.mock.calls[0]
    ).toEqual(['password']);

    expect(actualPayload).toEqual('12345');
    expect(jwtTokenGenSpy).toBeCalledWith('', '', true, 'testUser', 'uuid1');

    done();
  });
});
