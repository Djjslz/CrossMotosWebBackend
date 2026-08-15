import slugify from 'slugify';
import Category from '../models/Category.model.js';
import Product from '../models/Product.model.js';
import ApiError from '../utils/ApiError.js';

export async function listarCategoriasService() {
  return Category.find({ activo: true }).sort({ orden: 1, nombre: 1 });
}

export async function listarTodasCategoriasService() {
  return Category.find().sort({ orden: 1, nombre: 1 });
}

export async function crearCategoriaService(data) {
  const slug = slugify(data.nombre, { lower: true, strict: true });
  const existe = await Category.findOne({ slug });
  if (existe) throw ApiError.conflict('Ya existe una categoría con ese nombre');
  return Category.create({ ...data, slug });
}

export async function actualizarCategoriaService(id, data) {
  const categoria = await Category.findById(id);
  if (!categoria) throw ApiError.notFound('Categoría no encontrada');
  if (data.nombre && data.nombre !== categoria.nombre) {
    categoria.slug = slugify(data.nombre, { lower: true, strict: true });
  }
  Object.assign(categoria, data);
  await categoria.save();
  return categoria;
}

export async function eliminarCategoriaService(id) {
  const categoria = await Category.findById(id);
  if (!categoria) throw ApiError.notFound('Categoría no encontrada');
  const activos = await Product.countDocuments({ categoria: id, activo: true });
  if (activos > 0) {
    throw ApiError.badRequest(`No se puede eliminar: hay ${activos} producto(s) activo(s) en esta categoría`);
  }
  await categoria.deleteOne();
  return categoria;
}

export default {
  listarCategoriasService,
  listarTodasCategoriasService,
  crearCategoriaService,
  actualizarCategoriaService,
  eliminarCategoriaService,
};