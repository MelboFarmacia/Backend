import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    index: true, // Agregar índice para búsquedas más rápidas
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'employee'],
    default: 'employee',
    index: true, // Agregar índice para búsquedas por rol
  },
});

// Asegurar que los índices existan
/*userSchema.pre('save', async function(next) {
  try {
    await this.collection.createIndex({ email: 1 }, { unique: true });
    next();
  } catch (error) {
    next(error);
  }
});*/

export default mongoose.model('User', userSchema);
