import ExcelJS from 'exceljs';
import Report from '../models/Report.js';

const formatDate = (date) => {
  const d = new Date(date);
  const localDate = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
  return localDate.toISOString().split('T')[0];
};

export const generateReportExcel = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { startDate, endDate } = req.query;

    let reports = [];
    let fileName = '';

    if (reportId && reportId !== 'undefined' && reportId !== 'null') {
      // Individual
      const report = await Report.findById(reportId).populate('sales.items.productId');
      if (!report) {
        return res.status(404).json({ message: 'Reporte no encontrado' });
      }
      reports = [report];
      fileName = `reporte-${formatDate(report.startDate)}.xlsx`;
    } else if (startDate && endDate) {
      // Rango
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      reports = await Report.find({
        startDate: { $gte: start, $lte: end }
      }).populate('sales.items.productId');
      
      if (!reports.length) {
        return res.status(404).json({ message: 'No hay reportes en el rango' });
      }
      fileName = `reporte-rango-${formatDate(startDate)}_a_${formatDate(endDate)}.xlsx`;
    } else {
      return res.status(400).json({ message: 'Parámetros insuficientes' });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte de Ventas');

    // Configurar columnas
    worksheet.columns = [
      { header: 'Fecha', key: 'date', width: 20 },
      { header: 'Producto', key: 'product', width: 40 },
      { header: 'Cantidad', key: 'quantity', width: 12 },
      { header: 'Tipo de Venta', key: 'saleType', width: 15 },
      { header: 'Precio Unitario', key: 'price', width: 15 },
      { header: 'Subtotal', key: 'subtotal', width: 15 }
    ];

    // Estilo básico para el encabezado
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '2F75B5' }
    };

    // Agregar datos
    let currentRow = 2;
    let total = 0;

    reports.forEach(report => {
      report.sales.forEach(sale => {
        sale.items.forEach(item => {
          const saleDate = new Date(sale.createdAt);
          const localDate = new Date(saleDate.getTime() + saleDate.getTimezoneOffset() * 60000);

          worksheet.addRow({
            date: localDate.toLocaleString('es-GT', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }),
            product: item.productId?.name || item.name,
            quantity: item.quantity,
            saleType: formatSaleType(item.saleType),
            price: `Q${item.price.toFixed(2)}`,
            subtotal: `Q${item.subtotal.toFixed(2)}`
          });

          worksheet.getCell(`E${currentRow}`).numFmt = '"Q"#,##0.00';
          worksheet.getCell(`F${currentRow}`).numFmt = '"Q"#,##0.00';

          total += item.subtotal;
          currentRow++;
        });
      });
    });

    // Agregar total
    worksheet.addRow(['Total', '', '', '', '', total]);
    const totalRow = worksheet.getRow(currentRow);
    totalRow.font = { bold: true };
    totalRow.getCell(6).numFmt = '"Q"#,##0.00';
    totalRow.getCell(6).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'E2EFD9' }
    };

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.send(buffer);

  } catch (error) {
    console.error('Error al generar Excel:', error);
    res.status(500).json({ message: 'Error al generar el archivo Excel' });
  }
};

// Funciones auxiliares
const formatSaleType = (type) => {
  switch (type) {
    case 'unit': return 'Unidad';
    case 'blister': return 'Blister';
    case 'box': return 'Caja';
    default: return type;
  }
};
