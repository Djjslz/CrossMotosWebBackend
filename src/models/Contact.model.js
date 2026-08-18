import { Schema, model } from 'mongoose';

const contactSchema = new Schema(
  {
    nombre: { type: String, required: true, trim: true },
    telefono: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    asunto: { type: String, trim: true, maxlength: 120 },
    mensaje: { type: String, required: true, trim: true, maxlength: 1000 },
    origen: { type: String, enum: ['whatsapp', 'formulario'], default: 'formulario' },
    leido: { type: Boolean, default: false },
  },
  { timestamps: true }
);

contactSchema.index({ leido: 1 });
contactSchema.index({ createdAt: -1 });

const Contact = model('Contact', contactSchema);

export default Contact;