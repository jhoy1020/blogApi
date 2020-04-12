import config from '../../../config';
import AwsManager from '../../../services/aws/awsManager';

export default class UploadService {
  /**
   * Uploads a file to aws s3 bucket.
   * @param file The file to be uploaded.
   * @param fileName The name of the file.
   */
  public uploadFile = async (file: any, fileName: string): Promise<string> => {
    const s3Params = {
      ACL: 'public-read',
      Body: file.buffer,
      Bucket: config.bucketName,
      ContentType: 'fileType',
      Key: fileName
    };
    const s3 = new AwsManager.instance.S3();
    s3.putObject(s3Params, s3Error => {
      if (s3Error) {
        throw s3Error;
      }
    });
    return `${config.cloudFrontUrl}/${fileName}`;
  };
}
