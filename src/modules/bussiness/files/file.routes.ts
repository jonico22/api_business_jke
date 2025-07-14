import { Router } from "express";
import { uploadFile,deleteFile } from "@/modules/bussiness/files/file.controller";
import  {upload}  from "@/middlewares/upload.middleware";

const router = Router();

router.post(
  '/upload',
  upload.single('file'), // campo 'file' en el form-data
  uploadFile
);
router.delete('/:id', deleteFile);

export default router;