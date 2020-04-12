import * as nodemailer from 'nodemailer';
import config from '../../../config';
import AwsManager from '../../../services/aws/awsManager';

/**
 * ToDo: Pull this out into it's owner service and own container that
 * pulls messages off of some kind of queue.
 */
export default class EmailService {
  /**
   * Sends an email.
   * @param email The person's email.
   * @param message The message to be sent.
   * @param name The person the message was from.
   */
  public sendEmail = async (
    email: string,
    message: string,
    name: string
  ): Promise<void> => {
    const transporter = nodemailer.createTransport({
      SES: new AwsManager.instance.SES({
        apiVersion: '2010-12-01'
      }),
      sendingRate: 1
    });

    const emailInfo = await AwsManager.getSecret(config.awsEmailSecretKey);
    const mailOptions = {
      from: emailInfo ? emailInfo.emailFrom : config.emailFrom,
      subject: `Message from ${name}`,
      text: `${email} ${message}`,
      to: emailInfo ? emailInfo.emailTo : config.emailTo
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(`Failed to send email: ${error}`);
      } else {
        console.log(`Email sent: ${info.response}`);
      }
    });
  };
}
