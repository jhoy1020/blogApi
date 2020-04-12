export default {
  awsAccessKeyId: process.env.AWS_ACCESS_KEY || '',
  awsEmailSecretKey: '',
  awsGithubSecretKey: process.env.GITHUB_KEY || '',
  awsJwtSecretKey: '',
  awsRegion: process.env.AWS_REGION || '',
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  bucketName: process.env.awsBucketName || '',
  cloudFrontUrl: process.env.AWS_CLOUD_FRONT_URL || '',
  emailFrom: 'contact@local.com',
  emailTo: 'sender@local.com',
  githubOAuthUrl: 'https://github.com/login/oauth/access_token?',
  githubUserUrl: 'https://api.github.com/user',
};
