import Report from '../models/Report.js';

// Crear un nuevo reporte diario
export const createDailyReport = async (req, res) => {
  try {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999); // Final del día actual

    // Verificar si ya existe un reporte para hoy
    const existingReport = await Report.findOne({
      startDate: {
        $gte: new Date(now.setHours(0, 0, 0, 0)), // Inicio del día actual
        $lt: endOfDay
      }
    });

    if (existingReport) {
      return res.json({ success: true, report: existingReport });
    }

    const report = new Report({
      startDate: now, // Hora actual de creación
      endDate: endOfDay, // Fin del día actual (23:59:59.999)
      sales: [],
      totalSales: 0,
      totalProducts: 0,
      status: 'active'
    });

    await report.save();
    console.log('Nuevo reporte creado:', report);
    return res.json({ success: true, report });
  } catch (error) {
    console.error('Error al crear reporte diario:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error al crear el reporte diario' 
    });
  }
};

// Obtener reporte actual
export const getCurrentReport = async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const report = await Report.findOne({
      status: 'active',
      startDate: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });
    
    console.log('Fecha actual:', now);
    console.log('Reporte encontrado:', report);

    if (!report) {
      return res.status(404).json({ message: 'No hay reporte activo para hoy' });
    }

    res.json(report);
  } catch (error) {
    console.error('Error al obtener reporte actual:', error);
    res.status(500).json({ message: 'Error al obtener reporte actual' });
  }
};

// Agregar una venta al reporte activo
export const addSaleToReport = async (req, res) => {
  try {
    const { items, total, paymentType } = req.body; // <-- Agrega paymentType aquí
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const activeReport = await Report.findOne({ 
      status: 'active',
      startDate: {
        $gte: today,
        $lt: tomorrow
      }
    });

    if (!activeReport) {
      return res.status(404).json({ message: 'No hay reporte activo' });
    }

    // Corregir la fecha de creación para que use la zona horaria local
    const localDate = new Date();
    
    // Agregamos la venta como un nuevo documento en el array de sales
    activeReport.sales.push({
      items: items.map(item => ({
        productId: item.productId,
        barcode: item.barcode,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        saleType: item.saleType,
        unitsPerSale: item.unitsPerSale,
        subtotal: item.subtotal
      })),
      total,
      paymentType,
      createdAt: localDate // Usar la fecha local
    });

    activeReport.totalSales += total;
    activeReport.totalProducts += items.reduce((acc, item) => acc + (item.quantity * item.unitsPerSale), 0);

    await activeReport.save();
    
    res.json(activeReport);
  } catch (error) {
    console.error('Error en addSaleToReport:', error);
    res.status(500).json({ message: 'Error al agregar venta al reporte' });
  }
};

// Cerrar el reporte actual
export const closeCurrentReport = async () => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    
    const activeReport = await Report.findOne({
      status: 'active',
      startDate: { $lt: startOfDay }
    });

    if (activeReport) {
      activeReport.status = 'closed';
      await activeReport.save();
      console.log('Reporte cerrado exitosamente');
    }
  } catch (error) {
    console.warn('Error al cerrar reporte:', error);
  }
};

// Obtener historial de reportes
export const getReportHistory = async (req, res) => {
  try {
    const reports = await Report.find({ status: 'completed' })
      .sort({ endDate: -1 })
      .limit(30); // Últimos 30 reportes

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener historial de reportes' });
  }
};

export const getReportByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const selectedDate = new Date(date);
    const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

    const report = await Report.findOne({
      startDate: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    if (!report) {
      return res.status(404).json({ message: 'No hay reporte para esta fecha' });
    }

    res.json(report);
  } catch (error) {
    console.error('Error al obtener reporte por fecha:', error);
    res.status(500).json({ message: 'Error al obtener reporte' });
  }
};

// Obtener ventas por día
export const getDailySalesStats = async (req, res) => {
  try {
    // Obtener los últimos 30 días por defecto
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const reports = await Report.find({
      startDate: { $gte: startDate, $lte: endDate },
      status: 'completed'
    });

    // Agrupar ventas por día
    const dailySales = reports.reduce((acc, report) => {
      const date = report.startDate.toISOString().split('T')[0];
      
      if (!acc[date]) {
        acc[date] = {
          totalSales: 0,
          numberOfSales: 0
        };
      }
      
      acc[date].totalSales += report.totalSales;
      acc[date].numberOfSales += report.sales.length;
      
      return acc;
    }, {});

    // Convertir a array y ordenar por fecha
    const dailySalesArray = Object.entries(dailySales).map(([date, stats]) => ({
      date,
      ...stats
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({ success: true, data: dailySalesArray });
  } catch (error) {
    console.error('Error al obtener estadísticas de ventas diarias:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener estadísticas de ventas diarias'
    });
  }
};

export const getReportsByRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Debes proporcionar startDate y endDate' });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    end.setHours(23, 59, 59, 999); // Incluir todo el día final

    const reports = await Report.find({
      startDate: { $gte: start }
    }).sort({ startDate: 1 });

    res.json(reports);
  } catch (error) {
    console.error('Error al obtener reportes por rango:', error);
    res.status(500).json({ message: 'Error al obtener reportes por rango de fechas' });
  }
};