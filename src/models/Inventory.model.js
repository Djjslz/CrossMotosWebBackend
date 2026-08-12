import { Schema, model } from 'mongoose';

const inventorySchema = new Schema(
  {
    producto: { type: Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    stock: { type: Number, required: true, default: 0, min: 0 },
    stockMinimo: { type: Number, default: 5 },
    ubicacion: { type: String, trim: true },
    ultimaActualizacion: { type: Date, default: Date.now },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

inventorySchema.virtual('stockBajo').get(function () {
  return this.stock <= this.stockMinimo;
});

inventorySchema.index({ producto: 1 });
inventorySchema.index({ sku: 1 });
inventorySchema.index({ stock: 1 });

const Inventory = model('Inventory', inventorySchema);

export default Inventory;