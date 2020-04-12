import * as aws from 'aws-sdk';
import config from '../../config';

aws.config.update({
  accessKeyId: config.awsAccessKeyId,
  region: config.awsRegion,
  secretAccessKey: config.awsSecretAccessKey
});

export default class AwsManager {
  public static get instance() {
    return aws;
  }

  /**
   * Gets aws secrets used by the site.
   * @param secretName The secret to retrieve.
   */
  public static getSecret = async (secretName: string): Promise<any> => {
    try {
      const secretsManager = new aws.SecretsManager();

      const data = await secretsManager
        .getSecretValue({ SecretId: secretName })
        .promise();

      if (!data) {
        return '';
      }

      if (data.SecretString) {
        return JSON.parse(data.SecretString);
      }
    } catch (error) {
      switch (error.code) {
        case 'DecryptionFailureException':
        case 'InternalServiceErrorException':
        case 'InvalidParameterException':
        case 'InvalidRequestException':
        case 'ResourceNotFoundException':
          throw error;
        default:
          console.log(error);
          return;
      }
    }
  };
}
