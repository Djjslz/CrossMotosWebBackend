import Order from '../models/Order.model.js';
import Product from '../models/Product.model.js';
import Inventory from '../models/Inventory.model.js';
import ApiError from '../utils/ApiError.js';

async function generarNumero() {
  const count = await Order.countDocuments();
  return `CM-${String(count + 1).padStart(4, '0')}`;
}

export async function crearPedidoService(data) {
  const items = [];
  let subtotal = 0;

  for (const item of data.items) {
    const producto = await Product.findOne({ codigo: item.codigo, activo: true }).lean();
    if (!producto) throw ApiError.notFound(`Producto con código ${item.codigo} no encontrado`);
    if (!producto.tienePrecio || !producto.precio || producto.precio <= 0) {
      throw ApiError.badRequest(`El producto ${producto.nombre} no tiene precio asignado`);
    }

    const inventario = await Inventory.findOne({ producto: producto._id }).lean();
    if ((inventario?.stock ?? 0) < item.cantidad) {
      throw ApiError.badRequest(`Stock insuficiente para ${producto.nombre}`);
    }

    const subtotalItem = producto.precio * item.cantidad;
    subtotal += subtotalItem;
    items.push({
      producto: producto._id,
      sku: producto.codigo,
      nombre: producto.nombre,
      marca: producto.marca,
      precio: producto.precio,
      cantidad: item.cantidad,
      subtotal: subtotalItem,
    });
  }

  const pedido = await Order.create({
    numero: await generarNumero(),
    cliente: data.cliente,
    items,
    subtotal,
    total: subtotal,
    tipoEntrega: data.tipoEntrega,
    medioContacto: data.medioContacto,
    vendedor: data.vendedor || '',
    estado: 'recibido',
  });

  return pedido;
}

export async function listarPedidosService(query, user) {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 12;
  const filtro = {};
  if (query.estado) filtro.estado = query.estado;
  if (user?.rol === 'vendedor') {
    filtro.estado = { $nin: ['cancelado'] };
  }

  const [pedidos, total] = await Promise.all([
    Order.find(filtro)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Order.countDocuments(filtro),
  ]);

  return { data: pedidos, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function obtenerPedidoService(id) {
  const pedido = await Order.findById(id)
    .populate('items.producto', 'nombre codigo imagenes')
    .lean();
  if (!pedido) throw ApiError.notFound('Pedido no encontrado');
  return pedido;
}

async function descontarStock(items) {
  const aplicados = [];
  for (const item of items) {
    const res = await Inventory.updateOne(
      { producto: item.producto, stock: { $gte: item.cantidad } },
      { $inc: { stock: -item.cantidad }, $set: { ultimaActualizacion: new Date() } }
    );
    if (res.matchedCount === 0) {
      await restaurarStock(aplicados);
      throw ApiError.badRequest(`Stock insuficiente para ${item.nombre}`);
    }
    aplicados.push({ producto: item.producto, cantidad: item.cantidad });
  }
}

async function restaurarStock(items) {
  for (const item of items) {
    await Inventory.updateOne(
      { producto: item.producto },
      { $inc: { stock: item.cantidad }, $set: { ultimaActualizacion: new Date() } }
    );
  }
}

export async function cambiarEstadoPedidoService(id, data, user) {
  const pedido = await Order.findById(id);
  if (!pedido) throw ApiError.notFound('Pedido no encontrado');

  const estadoActual = pedido.estado;
  if (data.estado === estadoActual) return pedido;

  if (user?.rol === 'vendedor' && data.estado !== 'entregado') {
    throw ApiError.forbidden('Solo puedes marcar pedidos como entregados');
  }

  if (data.estado === 'confirmado' && estadoActual !== 'confirmado') {
    await descontarStock(pedido.items);
  }
  if (data.estado === 'cancelado' && estadoActual === 'confirmado') {
    await restaurarStock(pedido.items);
  }

  if (data.vendedor) pedido.vendedor = data.vendedor;
  pedido.estado = data.estado;
  await pedido.save();
  return pedido;
}

export async function eliminarPedidoService(id) {
  const pedido = await Order.findById(id);
  if (!pedido) throw ApiError.notFound('Pedido no encontrado');
  if (pedido.estado === 'confirmado') {
    await restaurarStock(pedido.items);
  }
  await pedido.deleteOne();
  return { _id: id };
}

export default {
  crearPedidoService,
  listarPedidosService,
  obtenerPedidoService,
  cambiarEstadoPedidoService,
  eliminarPedidoService,
};