import express from 'express';
import {
  createDailyReport,
  addSaleToReport,
  closeCurrentReport,
  getCurrentReport,
  getReportHistory,
  getReportByDate,
  getDailySalesStats,
  getReportsByRange
} from '../controllers/reportController.js';
import { generateReportPDF } from '../controllers/pdfController.js';
import { generateReportExcel } from '../controllers/excelController.js';

const router = express.Router();

router.post('/create', createDailyReport);
router.post('/add-sale', addSaleToReport);
router.post('/close', closeCurrentReport);
router.get('/current', getCurrentReport);
router.get('/history', getReportHistory);
router.post('/generate-pdf', generateReportPDF);
router.get('/by-date/:date', getReportByDate);
router.get('/generate-excel/:reportId', generateReportExcel);
router.get('/generate-excel', generateReportExcel); // Nueva ruta sin parámetros para el rango
router.get('/daily-stats', getDailySalesStats);
router.get('/by-range', getReportsByRange);

export default router;