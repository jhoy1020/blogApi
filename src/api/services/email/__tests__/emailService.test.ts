import * as nodemailer from 'nodemailer';
import AwsManager from '../../../../services/aws/awsManager';
import EmailService from '../emailService';

describe('EmailService Test Cases.', () => {
  const emailService = new EmailService();

  test('Validate email is sent.', async done => {
    const awsManagerSpy = spyOn(AwsManager, 'getSecret').and.returnValue({
      emailFrom: 'no@one.com',
      emailTo: 'every@one.com'
    });

    const expectedEmail = {
      from: 'no@one.com',
      subject: 'Message from NoYouDont',
      text: 'foo@foo.com you got mail.',
      to: 'every@one.com'
    };

    let actualEmail = null;
    const mockTransporter = {
      sendMail: jest.fn(email => {
        actualEmail = email;
      })
    };

    spyOn(nodemailer, 'createTransport').and.returnValue(mockTransporter);

    await emailService.sendEmail('foo@foo.com', 'you got mail.', 'NoYouDont');

    expect(awsManagerSpy).toBeCalledTimes(1);
    expect(awsManagerSpy).toBeCalledWith('EmailInfo');

    expect(mockTransporter.sendMail.mock.calls.length).toEqual(1);
    expect(actualEmail).toEqual(expectedEmail);

    done();
  });
});
