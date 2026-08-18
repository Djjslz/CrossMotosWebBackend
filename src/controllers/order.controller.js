import { successResponse } from '../utils/ApiResponse.js';
import {
  crearPedidoService,
  listarPedidosService,
  obtenerPedidoService,
  cambiarEstadoPedidoService,
  eliminarPedidoService,
} from '../services/order.service.js';

export async function crearPedido(req, res, next) {
  try {
    const data = await crearPedidoService(req.body);
    res.status(201).json(successResponse('Pedido creado', data));
  } catch (err) {
    next(err);
  }
}

export async function listarPedidos(req, res, next) {
  try {
    const { data, pagination } = await listarPedidosService(req.query);
    res.json(successResponse('Pedidos obtenidos', data, pagination));
  } catch (err) {
    next(err);
  }
}

export async function obtenerPedido(req, res, next) {
  try {
    const data = await obtenerPedidoService(req.params.id);
    res.json(successResponse('Pedido obtenido', data));
  } catch (err) {
    next(err);
  }
}

export async function cambiarEstadoPedido(req, res, next) {
  try {
    const data = await cambiarEstadoPedidoService(req.params.id, req.body);
    res.json(successResponse('Estado del pedido actualizado', data));
  } catch (err) {
    next(err);
  }
}

export async function eliminarPedido(req, res, next) {
  try {
    const data = await eliminarPedidoService(req.params.id);
    res.json(successResponse('Pedido eliminado', data));
  } catch (err) {
    next(err);
  }
}

export default { crearPedido, listarPedidos, obtenerPedido, cambiarEstadoPedido, eliminarPedido };