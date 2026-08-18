import { Schema, model } from 'mongoose';

const productSchema = new Schema(
  {
    codigo: { type: String, required: true, unique: true, uppercase: true, trim: true }, // CODIGO DEL PRODUCTO (SKU)
    nombre: { type: String, required: true, trim: true }, // NOMBRE-DESCRIPCION
    slug: { type: String, required: true, unique: true },
    descripcion: { type: String }, // CARACTERISTICAS extendido o texto libre
    descripcionCorta: { type: String, maxlength: 200 },
    marca: { type: String, trim: true }, // derivada de REFERENCIA/LINEA
    categoria: { type: Schema.Types.ObjectId, ref: 'Category' },
    imagenes: [{ type: String }],
    precio: { type: Number, min: 0 }, // PRECIO DETAL
    precioAnterior: { type: Number, min: 0 },
    precioMayor: { type: Number, default: 0, min: 0 },
    costo: { type: Number, min: 0 }, // PRECIO DE COSTO
    iva: { type: Number, default: 0 }, // % IVA
    tienePrecio: { type: Boolean, default: false }, // marcador para precios pendientes
    unidadDetal: { type: String, trim: true },
    unidadMayor: { type: String, trim: true },
    factorConversion: { type: Number, default: 1 },
    referencia: { type: String, trim: true }, // REFERENCIA original (linea/marca)
    linea: { type: String, trim: true }, // LINEA (codigo de marca)
    numeroCategoria: { type: String, trim: true }, // NUMERO DE CATEGORIA original
    registroInvima: { type: String, trim: true },
    registroCum: { type: String, trim: true },
    caracteristicas: [{ clave: String, valor: String }],
    ubicacion: { type: String, trim: true },
    destacado: { type: Boolean, default: false },
    activo: { type: Boolean, default: true },
    creadoDesde: { type: String, enum: ['ht', 'ich', 'shaft'], default: 'ht' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

productSchema.pre('save', function () {
  this.updatedAt = new Date();
});

productSchema.index({ categoria: 1 });
productSchema.index({ marca: 1 });
productSchema.index({ precio: 1 });
productSchema.index({ activo: 1 });
productSchema.index({ nombre: 'text', descripcion: 'text' });

const Product = model('Product', productSchema);

export default Product;