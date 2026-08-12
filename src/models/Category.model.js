import { Schema, model } from 'mongoose';

const categorySchema = new Schema({
  nombre: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  descripcion: { type: String },
  imagen: { type: String },
  orden: { type: Number, default: 0 },
  activo: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

categorySchema.index({ slug: 1 });
categorySchema.index({ orden: 1 });

const Category = model('Category', categorySchema);

export default Category;