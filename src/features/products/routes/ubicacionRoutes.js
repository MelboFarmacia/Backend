import express from 'express';
import ubicacionController from '../controllers/ubicacionController.js';

const router = express.Router();

// Rutas básicas CRUD
router.get('/', ubicacionController.getAll);
router.get('/:id', ubicacionController.getById);
router.post('/', ubicacionController.create);
router.put('/:id', ubicacionController.update);
router.delete('/:id', ubicacionController.delete); 

// Ruta para transferir productos entre ubicaciones
router.post('/transferir', ubicacionController.transferirProductos);

export default router;