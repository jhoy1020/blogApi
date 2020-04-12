import { Request, Response } from "express";
import { EHttpErrorCodes } from "../../types";
import UploadService from "../services/upload";

class UploadController {
  /**
   * @returns Gets or creates an instance of the upload service.
   */
  static get uploadService(): UploadService {
    if (!UploadController._uploadService) {
      UploadController._uploadService = new UploadService();
    }
    return UploadController._uploadService;
  }

  /**
   * Creates a new comment and saves it for the specified post.
   */
  public static uploadFile = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const file = req.file;
    const fileName = file.originalname;
    try {
      const url = await UploadController.uploadService.uploadFile(
        file,
        fileName
      );
      res.send(url);
    } catch (error) {
      res.status(EHttpErrorCodes.InternalServerError).send(error);
    }
  };

  private static _uploadService: UploadService = null;
}

export default UploadController;
