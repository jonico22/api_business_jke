import { Router } from "express";
import { uploadFile, registerExternalFile, deleteFile, getFile, listFiles } from "@/modules/bussiness/files/file.controller";
import { upload } from "@/middlewares/upload.middleware";

const router = Router();

router.get('/', listFiles);
router.get('/:id', getFile);
router.post(
  '/upload',
  upload.single('file'), // campo 'file' en el form-data
  uploadFile
);
router.post('/register', registerExternalFile);
router.delete('/:id', deleteFile);

export default router;