import axios from 'axios';
import AwsManager from '../../../../services/aws/awsManager';
import JwtTokenGenerator from '../../../../services/jwt/jwtTokenGenerator';
import { BlogService } from '../blogService';

describe('BlogService Test Cases.', () => {
  const mockCommentRepo = {
    save: jest.fn()
  };

  const mockPostRepo = {
    findOneOrFail: jest.fn()
  };

  const mockVisitorRepo = {
    createQueryBuilder: jest.fn()
  };

  // We need to add a @ts-ignore flag to prevent build errors when
  // sending in mock repos into the blog service.
  const blogService = new BlogService(
    // @ts-ignore
    mockCommentRepo,
    mockPostRepo,
    mockVisitorRepo
  );

  /**
   * Make sure to reset each mock function.
   */
  beforeEach(() => {
    let keys = Object.keys(mockCommentRepo);
    for (const key of keys) {
      mockCommentRepo[key].mockClear();
    }
    keys = Object.keys(mockPostRepo);
    for (const key of keys) {
      mockPostRepo[key].mockClear();
    }
    keys = Object.keys(mockVisitorRepo);
    for (const key of keys) {
      mockVisitorRepo[key].mockClear();
    }
  });

  test('Validate create comment test.', async done => {
    const expectedComment = {
      createdAt: new Date(),
      post: { uuid: 'post-1' },
      text: 'new comment',
      uuid: 'comment-1',
      visitor: { uuid: 'visitor-1' }
    };

    mockPostRepo.findOneOrFail = jest.fn(() => {
      return expectedComment.post;
    });

    let actualComment;
    mockCommentRepo.save = jest.fn(comment => {
      actualComment = comment;
      return actualComment;
    });

    await blogService.createComment(
      expectedComment.text,
      expectedComment.uuid,
      expectedComment.createdAt,
      expectedComment.post.uuid,
      expectedComment.visitor
    );

    expect(mockPostRepo.findOneOrFail.mock.calls.length).toEqual(1);
    expect(mockCommentRepo.save.mock.calls.length).toEqual(1);
    expect(actualComment).toEqual(expectedComment);

    done();
  });

  test('Validate login with github.', async done => {
    const getSecretSpy = spyOn(AwsManager, 'getSecret').and.returnValue({
      gitHubClientId: 'gitHubClinetId',
      gitHubSecretKey: 'getHubSecretKey'
    });

    const axiosPostSpy = spyOn(axios, 'post').and.returnValue({
      data: {
        access_token: 'accessToken'
      }
    });

    const axiosGetSpy = spyOn(axios, 'get').and.returnValue({
      data: {
        avatar_url: 'avatar_url',
        login: 'user1'
      }
    });

    const jwtTokenSpy = spyOn(
      JwtTokenGenerator,
      'generateAuthPayload'
    ).and.returnValue({});

    mockVisitorRepo.createQueryBuilder = jest.fn(() => ({
      select: jest.fn(() => ({
        where: jest.fn(() => ({
          orWhere: jest.fn(() => ({
            execute: jest.fn(() => [{ uuid: '1' }])
          }))
        }))
      }))
    }));

    await blogService.loginWithGithub('code');

    expect(getSecretSpy).toBeCalledTimes(1);
    expect(getSecretSpy).toBeCalledWith('GitHub-Test');

    expect(axiosPostSpy).toBeCalledTimes(1);
    expect(
      axiosPostSpy
    ).toBeCalledWith(
      'https://github.com/login/oauth/access_token?client_id=gitHubClinetId&client_secret=getHubSecretKey&code=code',
      null,
      { headers: { Accept: 'application/json' } }
    );

    expect(axiosGetSpy).toBeCalledTimes(1);
    expect(jwtTokenSpy).toBeCalledWith(
      'accessToken',
      'avatar_url',
      false,
      'user1',
      '1'
    );

    done();
  });
});
