import XLSX from 'xlsx';
import Inventory from '../models/Inventory.model.js';
import Product from '../models/Product.model.js';
import Category from '../models/Category.model.js';
import ApiError from '../utils/ApiError.js';
import {
  slugify,
  extraerTipo,
  extraerMarca,
  buildProductsFromWorkbook,
} from '../utils/excelProductos.js';

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
    { $project: { _id: 1, sku: 1, stock: 1, stockMinimo: 1, ubicacion: 1, stockBajo: 1, ultimaActualizacion: 1, producto: { _id: '$productoDoc._id', nombre: '$productoDoc.nombre', codigo: '$productoDoc.codigo', imagenes: '$productoDoc.imagenes', precio: '$productoDoc.precio', precioAnterior: '$productoDoc.precioAnterior', destacado: '$productoDoc.destacado', activo: '$productoDoc.activo', marca: '$productoDoc.marca', categoria: '$productoDoc.categoria', descripcionCorta: '$productoDoc.descripcionCorta', descripcion: '$productoDoc.descripcion' } } },
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

const COLUMNAS_EXPORT = [
  'CODIGO DEL PRODUCTO',
  'NOMBRE-DESCRIPCION',
  'REFERENCIA',
  'LINEA (O DEFECTO 00)',
  'NUMERO DE CATEGORIA',
  ' PRECIO DETAL (O DEFECTO 0) ',
  'PRECIO MAYOR (O DEFECTO 0)',
  'PRECIO DE COSTO',
  '%  IVA',
  'UNIDAD - DETAL',
  'UNIDAD - MAYOR',
  'FACTOR DE CONVERSION DE DETAL A MAYOR O DEFECTO (1)',
  'REGISTO INVIMA',
  'REGISTRO CUM',
  'CARACTERISTICAS',
  'UBICACIÓN',
  'CONTEO EN BODEGA',
  'COLOR',
];

export async function exportarInventarioService() {
  const registros = await Inventory.aggregate([
    { $lookup: { from: 'products', localField: 'producto', foreignField: '_id', as: 'p' } },
    { $unwind: { path: '$p', preserveNullAndEmptyArrays: true } },
    { $sort: { 'p.codigo': 1 } },
    { $project: { _id: 1, sku: 1, stock: 1, stockMinimo: 1, ubicacion: 1, p: 1 } },
  ]);

  const filas = registros.map((r) => {
    const p = r.p || {};
    return {
      'CODIGO DEL PRODUCTO': p.codigo ?? r.sku ?? '',
      'NOMBRE-DESCRIPCION': p.nombre ?? '',
      REFERENCIA: p.referencia ?? '',
      'LINEA (O DEFECTO 00)': p.linea ?? '',
      'NUMERO DE CATEGORIA': p.numeroCategoria ?? '',
      ' PRECIO DETAL (O DEFECTO 0) ': p.precio ?? 0,
      'PRECIO MAYOR (O DEFECTO 0)': p.precioMayor ?? 0,
      'PRECIO DE COSTO': p.costo ?? 0,
      '%  IVA': p.iva ?? 0,
      'UNIDAD - DETAL': p.unidadDetal ?? '',
      'UNIDAD - MAYOR': p.unidadMayor ?? '',
      'FACTOR DE CONVERSION DE DETAL A MAYOR O DEFECTO (1)': p.factorConversion ?? 1,
      'REGISTO INVIMA': p.registroInvima ?? '',
      'REGISTRO CUM': p.registroCum ?? '',
      CARACTERISTICAS: Array.isArray(p.caracteristicas)
        ? p.caracteristicas.map((c) => c.valor).join(' | ')
        : '',
      'UBICACIÓN': r.ubicacion ?? p.ubicacion ?? '',
      'CONTEO EN BODEGA': r.stock ?? 0,
      COLOR: '',
    };
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(filas, { header: COLUMNAS_EXPORT });
  XLSX.utils.book_append_sheet(wb, ws, 'HT Mig Pdtos');
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  return buffer;
}

export async function importarInventarioService(buffer) {
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const productos = buildProductsFromWorkbook(wb);
  if (!productos.length) throw ApiError.badRequest('El archivo no contiene productos válidos');

  const [existingProducts, existingInventories] = await Promise.all([
    Product.find({}).select('_id codigo').lean(),
    Inventory.find({}).select('_id sku producto').lean(),
  ]);

  const productByCode = new Map(existingProducts.map((p) => [p.codigo, p]));
  const invBySku = new Map(existingInventories.map((i) => [i.sku, i]));

  const productUpdates = [];
  const productInserts = [];
  const inventoryUpdates = [];
  const inventoryInserts = [];
  let creados = 0;
  let actualizados = 0;
  let stockTotal = 0;
  const errores = [];

  for (const p of productos) {
    stockTotal += p.stock;
    const existente = productByCode.get(p.codigo);

    if (existente) {
      const updates = { updatedAt: new Date() };
      if (p.nombre) updates.nombre = p.nombre;
      if (p.referencia) updates.referencia = p.referencia;
      if (p.linea) updates.linea = p.linea;
      if (p.numeroCategoria) updates.numeroCategoria = p.numeroCategoria;
      if (p.precio > 0) {
        updates.precio = p.precio;
        updates.tienePrecio = true;
      }
      if (p.precioMayor > 0) updates.precioMayor = p.precioMayor;
      if (p.costo > 0) updates.costo = p.costo;
      if (p.iva) updates.iva = p.iva;
      if (p.ubicacion) updates.ubicacion = p.ubicacion;
      productUpdates.push({ updateOne: { filter: { _id: existente._id }, update: { $set: updates } } });
      actualizados++;
    } else {
      const tipo = extraerTipo(p.referencia, p.linea, p.nombre) ?? 'General';
      const catDoc = await Category.findOne({ slug: slugify(tipo) });
      const categoria = catDoc ? catDoc._id : null;
      const nombre = p.color && !p.nombre.includes(p.color) ? `${p.nombre} ${p.color}` : p.nombre;
      productInserts.push({
        codigo: p.codigo,
        nombre,
        slug: slugify(`${p.nombre} ${p.codigo}`).slice(0, 80),
        marca: extraerMarca(p.referencia, p.linea, p.nombre),
        categoria,
        precio: p.precio > 0 ? p.precio : 0,
        precioMayor: p.precioMayor,
        costo: p.costo || null,
        iva: p.iva,
        tienePrecio: p.precio > 0,
        referencia: p.referencia || undefined,
        linea: p.linea || undefined,
        numeroCategoria: p.numeroCategoria || undefined,
        ubicacion: p.ubicacion || undefined,
        activo: true,
        destacado: false,
        creadoDesde: p.origen,
      });
      creados++;
    }

    const inv = invBySku.get(p.codigo);
    if (inv) {
      const upd = { stock: p.stock, ultimaActualizacion: new Date() };
      if (p.ubicacion) upd.ubicacion = p.ubicacion;
      inventoryUpdates.push({ updateOne: { filter: { _id: inv._id }, update: { $set: upd } } });
    }
  }

  if (productUpdates.length) await Product.bulkWrite(productUpdates, { ordered: false });

  let nuevosConId = [];
  if (productInserts.length) {
    nuevosConId = await Product.insertMany(productInserts, { ordered: false });
  }
  const idPorCodigoNuevo = new Map(nuevosConId.map((p) => [p.codigo, p._id]));

  for (const p of productos) {
    if (invBySku.has(p.codigo)) continue;
    const prodId = productByCode.get(p.codigo)?._id ?? idPorCodigoNuevo.get(p.codigo);
    if (!prodId) {
      errores.push(p.codigo);
      continue;
    }
    inventoryInserts.push({
      producto: prodId,
      sku: p.codigo,
      stock: p.stock,
      stockMinimo: 5,
      ubicacion: p.ubicacion || undefined,
      ultimaActualizacion: new Date(),
    });
  }

  if (inventoryUpdates.length) await Inventory.bulkWrite(inventoryUpdates, { ordered: false });
  if (inventoryInserts.length) await Inventory.insertMany(inventoryInserts, { ordered: false });

  return {
    archivoProcesado: productos.length,
    creados,
    actualizados,
    stockTotal,
    errores,
  };
}

export default {
  listarInventarioService,
  listarAlertasService,
  ajustarInventarioService,
  exportarInventarioService,
  importarInventarioService,
};