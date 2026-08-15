import slugify from 'slugify';
import Product from '../models/Product.model.js';
import Category from '../models/Category.model.js';
import Inventory from '../models/Inventory.model.js';
import ApiError from '../utils/ApiError.js';

const populateCategoria = { path: 'categoria', select: 'nombre slug' };

export async function listarProductosService(query) {
  const { page, limit, categoria, marca, busqueda, precioMin, precioMax, ordenar } = query;
  const filtro = { activo: true };

  if (categoria) {
    const cat = await Category.findOne({ slug: categoria });
    if (!cat) throw ApiError.notFound('Categoría no encontrada');
    filtro.categoria = cat._id;
  }
  if (marca) filtro.marca = marca;
  if (precioMin !== undefined || precioMax !== undefined) {
    filtro.precio = {};
    if (precioMin !== undefined) filtro.precio.$gte = Number(precioMin);
    if (precioMax !== undefined) filtro.precio.$lte = Number(precioMax);
  }
  if (busqueda) {
    filtro.$text = { $search: busqueda };
  }
  filtro.precio = { ...(filtro.precio || {}), $gt: 0 };

  const [items, total] = await Promise.all([
    Product.find(filtro)
      .sort(ordenar)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate(populateCategoria)
      .lean(),
    Product.countDocuments(filtro),
  ]);

  const inventarios = await Inventory.find({
    producto: { $in: items.map((p) => p._id) },
  })
    .select('producto stock')
    .lean();

  const stockMap = new Map(inventarios.map((i) => [String(i.producto), i.stock]));
  const data = items.map((p) => ({ ...p, stock: stockMap.get(String(p._id)) ?? 0 }));

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function listarDestacadosService() {
  const items = await Product.find({ destacado: true, activo: true, precio: { $gt: 0 } })
    .limit(8)
    .populate(populateCategoria)
    .lean();
  const inventarios = await Inventory.find({ producto: { $in: items.map((p) => p._id) } })
    .select('producto stock')
    .lean();
  const stockMap = new Map(inventarios.map((i) => [String(i.producto), i.stock]));
  return items.map((p) => ({ ...p, stock: stockMap.get(String(p._id)) ?? 0 }));
}

export async function obtenerProductoService(slug) {
  const producto = await Product.findOne({ slug, activo: true }).populate(populateCategoria).lean();
  if (!producto) throw ApiError.notFound('Producto no encontrado');

  const [inventario, relacionados] = await Promise.all([
    Inventory.findOne({ producto: producto._id }).select('stock sku').lean(),
    Product.aggregate([
      { $match: { categoria: producto.categoria, _id: { $ne: producto._id }, activo: true, precio: { $gt: 0 } } },
      { $sample: { size: 4 } },
      { $lookup: { from: 'inventories', localField: '_id', foreignField: 'producto', as: 'inv' } },
      {
        $project: {
          nombre: 1, slug: 1, precio: 1, precioAnterior: 1, imagenes: 1,
          descripcionCorta: 1, marca: 1,
          stock: { $ifNull: [{ $arrayElemAt: ['$inv.stock', 0] }, 0] },
        },
      },
    ]),
  ]);

  return {
    ...producto,
    stock: inventario?.stock ?? 0,
    sku: inventario?.sku,
    productosRelacionados: relacionados,
  };
}

export async function crearProductoService(data) {
  const categoria = await Category.findById(data.categoria);
  if (!categoria) throw ApiError.notFound('Categoría no encontrada');

  const slugBase = slugify(data.nombre, { lower: true, strict: true });
  let slug = slugBase;
  let contador = 1;
  while (await Product.exists({ slug })) {
    slug = `${slugBase}-${contador++}`;
  }

  const producto = await Product.create({ ...data, slug, codigo: `WEB-${Date.now()}` });
  await Inventory.create({ producto: producto._id, sku: `WEB-${Date.now()}`, stock: 0 });
  return producto;
}

export async function actualizarProductoService(id, data) {
  const producto = await Product.findById(id);
  if (!producto) throw ApiError.notFound('Producto no encontrado');
  Object.assign(producto, data);
  await producto.save();
  return producto;
}

export async function desactivarProductoService(id) {
  const producto = await Product.findById(id);
  if (!producto) throw ApiError.notFound('Producto no encontrado');
  producto.activo = false;
  await producto.save();
  return producto;
}

export default {
  listarProductosService,
  listarDestacadosService,
  obtenerProductoService,
  crearProductoService,
  actualizarProductoService,
  desactivarProductoService,
};