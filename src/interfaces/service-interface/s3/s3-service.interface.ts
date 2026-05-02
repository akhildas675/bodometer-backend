export interface IS3Service {
  uploadFile(
    file: Express.Multer.File,
    folder: string
  ): Promise<string>;

  deleteFile(fileUrl: string): Promise<void>;
}
