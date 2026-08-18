import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Product from '../src/models/Product.model.js';
import Inventory from '../src/models/Inventory.model.js';
import Order from '../src/models/Order.model.js';
import {
  crearPedidoService,
  cambiarEstadoPedidoService,
  eliminarPedidoService,
} from '../src/services/order.service.js';

let mongo;

before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

after(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

beforeEach(async () => {
  await Promise.all([Order.deleteMany({}), Product.deleteMany({}), Inventory.deleteMany({})]);
});

const cliente = { nombre: 'Ana Pérez', telefono: '3001234567', ciudad: 'Medellín' };

async function crearProducto(overrides = {}) {
  const stock = overrides.stock ?? 10;
  const { stock: _omitir, ...data } = overrides;
  const codigo = data.codigo || 'P001';
  const producto = await Product.create({
    codigo,
    nombre: 'Casco Test',
    slug: `producto-${codigo.toLowerCase()}`,
    precio: 100000,
    tienePrecio: true,
    marca: 'TEST',
    activo: true,
    ...data,
  });
  await Inventory.create({ producto: producto._id, sku: producto.codigo, stock });
  return producto;
}

async function stockDe(sku) {
  const inv = await Inventory.findOne({ sku }).lean();
  return inv?.stock ?? 0;
}

test('crea pedido con snapshot de precios, total y numero', async () => {
  await crearProducto({ codigo: 'A001', precio: 50000 });
  await crearProducto({ codigo: 'B001', precio: 70000 });

  const pedido = await crearPedidoService({
    cliente,
    items: [
      { codigo: 'A001', cantidad: 2 },
      { codigo: 'B001', cantidad: 1 },
    ],
    tipoEntrega: 'envio',
    medioContacto: 'formulario',
  });

  assert.equal(pedido.numero, 'CM-0001');
  assert.equal(pedido.estado, 'recibido');
  assert.equal(pedido.tipoEntrega, 'envio');
  assert.equal(pedido.items.length, 2);
  assert.equal(pedido.items[0].precio, 50000);
  assert.equal(pedido.items[1].precio, 70000);
  assert.equal(pedido.total, 170000);
  assert.equal(pedido.cliente.nombre, 'Ana Pérez');
});

test('crearPedidoService no descuenta stock al crear', async () => {
  await crearProducto({ codigo: 'STK', stock: 5 });
  await crearPedidoService({ cliente, items: [{ codigo: 'STK', cantidad: 2 }] });
  assert.equal(await stockDe('STK'), 5);
});

test('rechaza producto inexistente con 404', async () => {
  await assert.rejects(
    () => crearPedidoService({ cliente, items: [{ codigo: 'NO_EXISTE', cantidad: 1 }] }),
    (err) => err.statusCode === 404
  );
});

test('rechaza producto sin precio con 400', async () => {
  await crearProducto({ codigo: 'SINP', tienePrecio: false, precio: null });
  await assert.rejects(
    () => crearPedidoService({ cliente, items: [{ codigo: 'SINP', cantidad: 1 }] }),
    (err) => err.statusCode === 400 && /no tiene precio/i.test(err.message)
  );
});

test('rechaza stock insuficiente al crear', async () => {
  await crearProducto({ codigo: 'POC', stock: 2 });
  await assert.rejects(
    () => crearPedidoService({ cliente, items: [{ codigo: 'POC', cantidad: 5 }] }),
    (err) => err.statusCode === 400 && /stock insuficiente/i.test(err.message)
  );
});

test('confirmar pedido descuenta stock atómicamente', async () => {
  await crearProducto({ codigo: 'STK', stock: 5 });
  const pedido = await crearPedidoService({ cliente, items: [{ codigo: 'STK', cantidad: 2 }] });

  const actualizado = await cambiarEstadoPedidoService(pedido._id, { estado: 'confirmado' });
  assert.equal(actualizado.estado, 'confirmado');
  assert.equal(await stockDe('STK'), 3);
});

test('cancelar pedido confirmado restaura stock', async () => {
  await crearProducto({ codigo: 'STK', stock: 5 });
  const pedido = await crearPedidoService({ cliente, items: [{ codigo: 'STK', cantidad: 2 }] });

  await cambiarEstadoPedidoService(pedido._id, { estado: 'confirmado' });
  assert.equal(await stockDe('STK'), 3);

  await cambiarEstadoPedidoService(pedido._id, { estado: 'cancelado' });
  assert.equal(await stockDe('STK'), 5);
});

test('confirmar dos veces no descuenta dos veces', async () => {
  await crearProducto({ codigo: 'STK', stock: 5 });
  const pedido = await crearPedidoService({ cliente, items: [{ codigo: 'STK', cantidad: 2 }] });

  await cambiarEstadoPedidoService(pedido._id, { estado: 'confirmado' });
  await cambiarEstadoPedidoService(pedido._id, { estado: 'confirmado' });
  assert.equal(await stockDe('STK'), 3);
});

test('transición recibido → cotizado → confirmado → entregado', async () => {
  await crearProducto({ codigo: 'FLUJO', stock: 5 });
  const pedido = await crearPedidoService({ cliente, items: [{ codigo: 'FLUJO', cantidad: 1 }] });

  await cambiarEstadoPedidoService(pedido._id, { estado: 'cotizado' });
  assert.equal(await stockDe('FLUJO'), 5);

  await cambiarEstadoPedidoService(pedido._id, { estado: 'confirmado' });
  assert.equal(await stockDe('FLUJO'), 4);

  await cambiarEstadoPedidoService(pedido._id, { estado: 'entregado' });
  assert.equal(await stockDe('FLUJO'), 4);
});

test('confirmar con stock insuficiente hace rollback completo', async () => {
  await crearProducto({ codigo: 'OK', stock: 10 });
  await crearProducto({ codigo: 'NO', stock: 5 });

  const pedido = await crearPedidoService({
    cliente,
    items: [
      { codigo: 'OK', cantidad: 2 },
      { codigo: 'NO', cantidad: 5 },
    ],
  });

  await Inventory.updateOne({ sku: 'NO' }, { $inc: { stock: -4 } });

  await assert.rejects(
    () => cambiarEstadoPedidoService(pedido._id, { estado: 'confirmado' }),
    (err) => err.statusCode === 400 && /stock insuficiente/i.test(err.message)
  );

  assert.equal(await stockDe('OK'), 10);
  assert.equal(await stockDe('NO'), 1);
});

test('eliminar pedido confirmado restaura stock', async () => {
  await crearProducto({ codigo: 'STK', stock: 5 });
  const pedido = await crearPedidoService({ cliente, items: [{ codigo: 'STK', cantidad: 2 }] });

  await cambiarEstadoPedidoService(pedido._id, { estado: 'confirmado' });
  assert.equal(await stockDe('STK'), 3);

  await eliminarPedidoService(pedido._id);
  assert.equal(await stockDe('STK'), 5);
});

test('eliminar pedido recibido no toca stock', async () => {
  await crearProducto({ codigo: 'STK', stock: 5 });
  const pedido = await crearPedidoService({ cliente, items: [{ codigo: 'STK', cantidad: 2 }] });

  await eliminarPedidoService(pedido._id);
  assert.equal(await stockDe('STK'), 5);
});

test('cambiar estado de pedido inexistente lanza 404', async () => {
  await assert.rejects(
    () => cambiarEstadoPedidoService(new mongoose.Types.ObjectId(), { estado: 'confirmado' }),
    (err) => err.statusCode === 404
  );
});