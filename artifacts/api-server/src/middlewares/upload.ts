import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";

// Uploaded files are stored on local disk and served back statically (see
// app.ts). This is a real, working fix for "there's no upload endpoint" —
// but local disk storage on most hosts (including Replit) is NOT durable
// across redeploys/restarts. For production this directory should be swapped
// for object storage (S3, R2, Cloudinary, etc.); the route contract
// (POST /api/upload -> { url }) would stay the same either way.
export const UPLOAD_DIR = path.join(process.cwd(), "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME_PREFIXES = ["image/", "video/"];
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB, generous enough for a short clip

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || "";
    const safeExt = /^\.[a-zA-Z0-9]{1,8}$/.test(ext) ? ext : "";
    cb(null, `${crypto.randomUUID()}${safeExt}`);
  },
});

export const uploadMedia = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_PREFIXES.some((p) => file.mimetype.startsWith(p))) {
      cb(null, true);
    } else {
      cb(new Error("Only image or video files are allowed"));
    }
  },
});
