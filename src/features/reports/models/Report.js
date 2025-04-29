import mongoose from 'mongoose';

const saleItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  saleType: {
    type: String,
    enum: ['unit', 'blister', 'box'],
    required: true
  },
  unitsPerSale: {
    type: Number,
    required: true
  },
  subtotal: {
    type: Number,
    required: true
  }
});

const saleSchema = new mongoose.Schema({
  items: [saleItemSchema],
  total: {
    type: Number,
    required: true
  },
  paymentType: { 
    type: String,
    enum: ['transferencia', 'TC', 'efectivo'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const reportSchema = new mongoose.Schema({
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  sales: [{
    items: [{
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      barcode: String,
      name: String,
      price: Number,
      quantity: Number,
      saleType: {
        type: String,
        enum: ['unit', 'blister', 'box']
      },
      unitsPerSale: Number,
      subtotal: Number
    }],
    total: Number,
    paymentType: {
      type: String,
      enum: ['transferencia', 'TC', 'efectivo']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  totalSales: {
    type: Number,
    default: 0
  },
  totalProducts: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'inactive'],
    default: 'active'
  }
}, { timestamps: true });

export default mongoose.model('Report', reportSchema);