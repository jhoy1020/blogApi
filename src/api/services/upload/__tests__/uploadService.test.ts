import * as aws from 'aws-sdk';
import UploadService from '../uploadService';

describe('UploadService Test Cases.', () => {
  const uploadService = new UploadService();

  test('Validate upload of a file.', async done => {
    const expectedParams = {
      ACL: 'public-read',
      Body: 'fileBuffer',
      Bucket: 'joshhoy',
      ContentType: 'fileType',
      Key: 'testFile'
    };

    let actualParams = null;
    const s3Mock = {
      putObject: jest.fn(s3Params => {
        actualParams = s3Params;
      })
    };

    spyOn(aws, 'S3').and.returnValue(s3Mock);

    await uploadService.uploadFile({ buffer: 'fileBuffer' }, 'testFile');

    expect(s3Mock.putObject.mock.calls.length).toEqual(1);
    expect(actualParams).toEqual(expectedParams);

    done();
  });
});
