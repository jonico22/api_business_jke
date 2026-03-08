import { Router } from 'express';
import express from 'express';
import { listExternalFiles, listReports, uploadExternalFile, getExternalFile, registerExternalLink, updateExternalFile, deleteExternalFile } from './file.controller';
import auth from '@/middlewares/auth.middleware';
import { upload } from '@/middlewares/upload.middleware';

const router = Router();

/**
 * Rutas para el proxy de archivos de ventas
 * Todas las rutas requieren autenticación
 */

// POST /api/sales/files/upload - Subida física a R2
router.post('/upload', auth, upload.single('file'), uploadExternalFile);

// POST /api/sales/files - Registrar metadatos de enlace externo
router.post('/', auth, express.json(), registerExternalLink);

// GET /api/sales/files/reports - Lista solo reportes
router.get('/reports', auth, listReports);

// GET /api/sales/files/:id - Obtener archivo por ID
router.get('/:id', auth, getExternalFile);

// PUT /api/sales/files/:id - Actualizar metadatos de un archivo
router.put('/:id', auth, express.json(), updateExternalFile);

// DELETE /api/sales/files/:id - Eliminar archivo física y lógicamente
router.delete('/:id', auth, deleteExternalFile);

// GET /api/sales/files - Galería general (excluye reportes)
router.get('/', auth, listExternalFiles);

export default router;
