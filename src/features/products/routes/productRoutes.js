import express from 'express';
import { 
  getProducts, 
  createProduct, 
  findByBarcode, 
  updateStock, 
  deleteProduct, 
  updateProduct, 
  findByType, 
  getProductTypes,
  getHistoricoProductos,
  generateHistoricoExcel 
} from '../controllers/productController.js';

const router = express.Router();

router.get('/', getProducts);
router.post('/', createProduct);
router.get('/barcode/:barcode', findByBarcode);
router.post('/update-stock', updateStock);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.get('/type/:type', findByType);
router.get('/types', getProductTypes);
router.get('/historico', getHistoricoProductos);
router.get('/historico/excel', generateHistoricoExcel);

export default router;