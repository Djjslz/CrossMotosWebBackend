import Inventory from '../models/Inventory.model.js';
import Product from '../models/Product.model.js';
import ApiError from '../utils/ApiError.js';

export async function listarInventarioService(query) {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 12;
  const busqueda = query.busqueda?.trim();

  const match = {};
  if (busqueda) {
    match.$or = [{ sku: { $regex: busqueda, $options: 'i' } }, { nombre: { $regex: busqueda, $options: 'i' } }];
  }

  const base = [
    { $lookup: { from: 'products', localField: 'producto', foreignField: '_id', as: 'productoDoc' } },
    { $unwind: { path: '$productoDoc', preserveNullAndEmptyArrays: true } },
    { $match: { 'productoDoc.activo': true } },
  ];

  if (busqueda) {
    base.push({
      $match: {
        $or: [
          { sku: { $regex: busqueda, $options: 'i' } },
          { 'productoDoc.nombre': { $regex: busqueda, $options: 'i' } },
        ],
      },
    });
  }

  const [result] = await Inventory.aggregate([
    ...base,
    { $set: { stockBajo: { $lte: ['$stock', '$stockMinimo'] } } },
    { $project: { _id: 1, sku: 1, stock: 1, stockMinimo: 1, ubicacion: 1, stockBajo: 1, ultimaActualizacion: 1, producto: { _id: '$productoDoc._id', nombre: '$productoDoc.nombre', imagenes: '$productoDoc.imagenes' } } },
    {
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [{ $sort: { stock: 1 } }, { $skip: (page - 1) * limit }, { $limit: limit }],
      },
    },
  ]);

  const total = result.metadata[0]?.total ?? 0;
  return {
    data: result.data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function listarAlertasService() {
  const items = await Inventory.aggregate([
    { $match: { $expr: { $lte: ['$stock', '$stockMinimo'] } } },
    { $lookup: { from: 'products', localField: 'producto', foreignField: '_id', as: 'productoDoc' } },
    { $unwind: '$productoDoc' },
    { $set: { stockBajo: true } },
    { $project: { _id: 1, sku: 1, stock: 1, stockMinimo: 1, ubicacion: 1, stockBajo: 1, producto: { _id: '$productoDoc._id', nombre: '$productoDoc.nombre', imagenes: '$productoDoc.imagenes' } } },
  ]);
  return items;
}

export async function ajustarInventarioService(id, data) {
  const inventario = await Inventory.findById(id);
  if (!inventario) throw ApiError.notFound('Inventario no encontrado');

  const nuevoStock = inventario.stock + Number(data.ajuste);
  if (nuevoStock < 0) throw ApiError.badRequest('El stock no puede quedar negativo');

  inventario.stock = nuevoStock;
  if (data.stockMinimo !== undefined) inventario.stockMinimo = Number(data.stockMinimo);
  if (data.ubicacion !== undefined) inventario.ubicacion = data.ubicacion;
  inventario.ultimaActualizacion = new Date();
  await inventario.save();
  return inventario;
}

export default { listarInventarioService, listarAlertasService, ajustarInventarioService };