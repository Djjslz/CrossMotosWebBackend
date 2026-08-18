import Contact from '../models/Contact.model.js';
import ApiError from '../utils/ApiError.js';

export async function crearContactoService(data) {
  return Contact.create(data);
}

export async function listarContactosService(query) {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 12;
  const filtro = {};
  if (query.leido !== undefined) filtro.leido = query.leido === 'true';
  if (query.busqueda) {
    filtro.$or = [
      { nombre: { $regex: query.busqueda, $options: 'i' } },
      { telefono: { $regex: query.busqueda, $options: 'i' } },
      { email: { $regex: query.busqueda, $options: 'i' } },
      { mensaje: { $regex: query.busqueda, $options: 'i' } },
    ];
  }

  const [contactos, total] = await Promise.all([
    Contact.find(filtro)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Contact.countDocuments(filtro),
  ]);

  return { data: contactos, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function obtenerContactoService(id) {
  const contacto = await Contact.findById(id).lean();
  if (!contacto) throw ApiError.notFound('Mensaje no encontrado');
  return contacto;
}

export async function marcarLeidoService(id, leido = true) {
  const contacto = await Contact.findById(id);
  if (!contacto) throw ApiError.notFound('Mensaje no encontrado');
  contacto.leido = leido;
  await contacto.save();
  return contacto;
}

export async function eliminarContactoService(id) {
  const contacto = await Contact.findById(id);
  if (!contacto) throw ApiError.notFound('Mensaje no encontrado');
  await contacto.deleteOne();
  return { _id: id };
}

export default {
  crearContactoService,
  listarContactosService,
  obtenerContactoService,
  marcarLeidoService,
  eliminarContactoService,
};