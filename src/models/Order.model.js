import { Schema, model } from 'mongoose';

const orderSchema = new Schema(
  {
    numero: { type: String, required: true, unique: true, trim: true },
    cliente: {
      nombre: { type: String, required: true, trim: true },
      telefono: { type: String, required: true, trim: true },
      email: { type: String, lowercase: true, trim: true },
      ciudad: { type: String, trim: true },
      direccion: { type: String, trim: true },
      notas: { type: String, trim: true, maxlength: 500 },
    },
    items: [
      {
        producto: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        sku: { type: String, required: true, uppercase: true, trim: true },
        nombre: { type: String, required: true, trim: true },
        marca: { type: String, trim: true },
        precio: { type: Number, required: true, min: 0 },
        cantidad: { type: Number, required: true, min: 1 },
        subtotal: { type: Number, required: true, min: 0 },
      },
    ],
    subtotal: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    tipoEntrega: { type: String, enum: ['recojo_en_tienda', 'envio'], default: 'recojo_en_tienda' },
    medioContacto: { type: String, enum: ['whatsapp', 'formulario', 'admin'], default: 'formulario' },
    vendedor: { type: String, trim: true, default: '' },
    estado: {
      type: String,
      enum: ['recibido', 'cotizado', 'confirmado', 'entregado', 'cancelado'],
      default: 'recibido',
    },
  },
  { timestamps: true }
);

orderSchema.index({ estado: 1 });
orderSchema.index({ estado: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });

const Order = model('Order', orderSchema);

export default Order;
