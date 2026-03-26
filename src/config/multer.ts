import multer from "multer";

const allowedDocs = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const allowedVideos = [
  "video/mp4",
  "video/mpeg",
  "video/quicktime",
  "video/x-msvideo", 
  "video/x-matroska",
  "video/webm",
];


export const mediaUpload = multer({
  storage: multer.memoryStorage(),

  limits: { fileSize: 50 * 1024 * 1024 }, 

  fileFilter: (_req, file, cb) => {
    const isImage = file.mimetype.startsWith("image/");
    const isDoc = allowedDocs.includes(file.mimetype);
    const isVideo = allowedVideos.includes(file.mimetype);

    if (isImage || isDoc || isVideo) {
      cb(null, true);
    } else {
      cb(new Error("Only images, videos, or documents are allowed"));
    }
  },
});