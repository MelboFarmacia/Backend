import express from 'express';
import { getTopSellingProducts, getMonthlySalesStats, getProductsSalesStats, getEarningsStats, getFinancialMetrics } from '../controllers/statsController.js';

const router = express.Router();

router.get('/top-selling', getTopSellingProducts);
router.get('/monthly-sales', getMonthlySalesStats);
router.get('/products-sales', getProductsSalesStats);
router.get('/earnings', getEarningsStats);
router.get('/financial-metrics', getFinancialMetrics);

export default router;