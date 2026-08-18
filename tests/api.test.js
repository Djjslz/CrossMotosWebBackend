import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_1234567890';
process.env.MONGODB_URI = '';

let mongo;
let server;
let base;

let User;
let Product;
let Inventory;
let Order;
let Contact;
let app;

before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());

  ({ default: app } = await import('../src/app.js'));
  ({ default: User } = await import('../src/models/User.model.js'));
  ({ default: Product } = await import('../src/models/Product.model.js'));
  ({ default: Inventory } = await import('../src/models/Inventory.model.js'));
  ({ default: Order } = await import('../src/models/Order.model.js'));
  ({ default: Contact } = await import('../src/models/Contact.model.js'));

  await User.create({
    nombre: 'Davidez',
    email: 'davidez@test.com',
    password: 'TestPass2026!',
    rol: 'admin',
  });

  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
  await mongo.stop();
});

beforeEach(async () => {
  await Promise.all([Order.deleteMany({}), Product.deleteMany({}), Inventory.deleteMany({}), Contact.deleteMany({})]);
});

async function api(path, options = {}) {
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const body = await res.json().catch(() => null);
  return { status: res.status, body };
}

async function crearProductoConStock(sku, stock, precio = 50000) {
  const producto = await Product.create({
    codigo: sku,
    nombre: `Producto ${sku}`,
    slug: `producto-${sku.toLowerCase()}`,
    precio,
    tienePrecio: true,
    activo: true,
  });
  await Inventory.create({ producto: producto._id, sku, stock });
  return producto;
}

async function login() {
  const r = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ usuario: 'davidez', password: 'TestPass2026!' }),
  });
  assert.equal(r.status, 200);
  return r.body.data.token;
}

test('POST /api/pedidos es público y crea cotización', async () => {
  await crearProductoConStock('A001', 10, 60000);

  const r = await api('/api/pedidos', {
    method: 'POST',
    body: JSON.stringify({
      cliente: { nombre: 'Ana', telefono: '3001234567' },
      items: [{ codigo: 'A001', cantidad: 2 }],
    }),
  });

  assert.equal(r.status, 201);
  assert.equal(r.body.data.numero, 'CM-0001');
  assert.equal(r.body.data.total, 120000);
  assert.equal(r.body.data.estado, 'recibido');
});

test('POST /api/pedidos valida items vacíos con 400', async () => {
  const r = await api('/api/pedidos', {
    method: 'POST',
    body: JSON.stringify({ cliente: { nombre: 'Ana', telefono: '3001234567' }, items: [] }),
  });
  assert.equal(r.status, 400);
  assert.equal(r.body.errors[0].campo, 'items');
});

test('GET /api/pedidos sin token → 401, con token → 200', async () => {
  const sin = await api('/api/pedidos');
  assert.equal(sin.status, 401);

  const token = await login();
  const con = await api('/api/pedidos', { headers: { Authorization: `Bearer ${token}` } });
  assert.equal(con.status, 200);
  assert.ok(con.body.pagination);
  assert.equal(con.body.data.length, 0);
});

test('POST /api/contactos es público y GET requiere admin', async () => {
  const crear = await api('/api/contactos', {
    method: 'POST',
    body: JSON.stringify({
      nombre: 'Ana',
      telefono: '3001234567',
      mensaje: '¿Tienen visores?',
      origen: 'whatsapp',
    }),
  });
  assert.equal(crear.status, 201);
  assert.equal(crear.body.data.leido, false);

  const sin = await api('/api/contactos');
  assert.equal(sin.status, 401);

  const token = await login();
  const con = await api('/api/contactos', { headers: { Authorization: `Bearer ${token}` } });
  assert.equal(con.status, 200);
  assert.equal(con.body.pagination.total, 1);
});

test('flujo completo: pedido → confirmar descuenta stock → cancelar restaura', async () => {
  await crearProductoConStock('FLUJO', 5, 30000);
  const token = await login();

  const crear = await api('/api/pedidos', {
    method: 'POST',
    body: JSON.stringify({
      cliente: { nombre: 'Ana', telefono: '3001234567' },
      items: [{ codigo: 'FLUJO', cantidad: 2 }],
    }),
  });
  assert.equal(crear.status, 201);
  const id = crear.body.data._id;

  const confirmar = await api(`/api/pedidos/${id}/estado`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ estado: 'confirmado' }),
  });
  assert.equal(confirmar.status, 200);
  assert.equal(confirmar.body.data.estado, 'confirmado');

  let inventario = await api('/api/inventario?busqueda=FLUJO', {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(inventario.body.data[0].stock, 3);

  const cancelar = await api(`/api/pedidos/${id}/estado`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ estado: 'cancelado' }),
  });
  assert.equal(cancelar.status, 200);

  inventario = await api('/api/inventario?busqueda=FLUJO', {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(inventario.body.data[0].stock, 5);
});

test('GET /api/productos devuelve data y pagination (para el frontend)', async () => {
  await crearProductoConStock('CAT01', 3, 10000);
  await crearProductoConStock('CAT02', 4, 20000);

  const r = await api('/api/productos?limit=1');
  assert.equal(r.status, 200);
  assert.equal(r.body.data.length, 1);
  assert.equal(r.body.pagination.total, 2);
  assert.equal(r.body.pagination.totalPages, 2);
  assert.ok(r.body.data[0].stock !== undefined);
});

test('PUT /api/contactos/:id/leido marca como leído', async () => {
  const contacto = await Contact.create({
    nombre: 'Ana',
    telefono: '3001234567',
    mensaje: 'Hola',
  });
  const token = await login();

  const r = await api(`/api/contactos/${contacto._id}/leido`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ leido: true }),
  });
  assert.equal(r.status, 200);
  assert.equal(r.body.data.leido, true);
});

test('auth: login con email también funciona', async () => {
  const r = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ usuario: 'davidez@test.com', password: 'TestPass2026!' }),
  });
  assert.equal(r.status, 200);
  assert.equal(r.body.data.usuario.rol, 'admin');
});