import { Request, Response } from "express";
import { EHttpErrorCodes } from "../../types";
import EmailService from "../services/email";

class EmailController {
  /**
   * @returns Gets or creates an instance of the email service.
   */
  static get emailService(): EmailService {
    if (!EmailController._emailService) {
      EmailController._emailService = new EmailService();
    }
    return EmailController._emailService;
  }

  /**
   * Sends a message from a user.
   */
  public static sendEmail = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { email, message, name } = req.body;
    try {
      await EmailController.emailService.sendEmail(email, message, name);
    } catch (error) {
      res.status(EHttpErrorCodes.InternalServerError).send(error);
      return;
    }
    res.status(EHttpErrorCodes.Ok).send("Message Sent.");
  };

  private static _emailService: EmailService = null;
}

export default EmailController;
