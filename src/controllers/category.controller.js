import { successResponse } from '../utils/ApiResponse.js';
import {
  listarCategoriasService,
  listarTodasCategoriasService,
  crearCategoriaService,
  actualizarCategoriaService,
  eliminarCategoriaService,
} from '../services/category.service.js';

export async function listarCategorias(req, res, next) {
  try {
    const data = await listarCategoriasService();
    res.json(successResponse('Categorías obtenidas', data));
  } catch (err) {
    next(err);
  }
}

export async function listarTodasCategorias(req, res, next) {
  try {
    const data = await listarTodasCategoriasService();
    res.json(successResponse('Categorías obtenidas', data));
  } catch (err) {
    next(err);
  }
}

export async function crearCategoria(req, res, next) {
  try {
    const data = await crearCategoriaService(req.body);
    res.status(201).json(successResponse('Categoría creada', data));
  } catch (err) {
    next(err);
  }
}

export async function actualizarCategoria(req, res, next) {
  try {
    const data = await actualizarCategoriaService(req.params.id, req.body);
    res.json(successResponse('Categoría actualizada', data));
  } catch (err) {
    next(err);
  }
}

export async function eliminarCategoria(req, res, next) {
  try {
    const data = await eliminarCategoriaService(req.params.id);
    res.json(successResponse('Categoría eliminada', data));
  } catch (err) {
    next(err);
  }
}

export default { listarCategorias, listarTodasCategorias, crearCategoria, actualizarCategoria, eliminarCategoria };