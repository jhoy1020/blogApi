import * as jwt from 'jsonwebtoken';
import AwsManager from '../../aws/awsManager';
import jwtTokenGenerator from '../jwtTokenGenerator';

describe('Jwt Token Generator Test Cases.', () => {
  test('Validate jwt generates token', async done => {
    const getSecretSpy = spyOn(AwsManager, 'getSecret').and.returnValue({
      privateKey: 'shhhItsASecret'
    });

    const jwtSpy = spyOn(jwt, 'sign').and.returnValue('testToken');

    const expectedUser = {
      avatarUrl: 'avatarUrl1',
      role: 'admin',
      username: 'fooUser',
      uuid: '123'
    };

    const payload = await jwtTokenGenerator.generateAuthPayload(
      'token1',
      expectedUser.avatarUrl,
      true,
      expectedUser.username,
      expectedUser.uuid
    );

    expect(getSecretSpy).toBeCalledTimes(1);
    expect(getSecretSpy).toBeCalledWith('jwtKeys');

    expect(jwtSpy).toBeCalledTimes(1);
    expect(jwtSpy).toBeCalledWith(
      {
        accessToken: 'token1',
        avatarUrl: expectedUser.avatarUrl,
        isAdmin: true,
        username: expectedUser.username,
        uuid: expectedUser.uuid
      },
      'shhhItsASecret',
      {
        expiresIn: '1h',
        issuer: 'jhoy blog'
      }
    );

    expect(payload.token).toEqual('testToken');
    expect(payload.user).toEqual(expectedUser);

    done();
  });
});
