import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import XLSX from 'xlsx';
import { MongoMemoryServer } from 'mongodb-memory-server';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_1234567890';
process.env.MONGODB_URI = '';

let mongo;
let server;
let base;

let Product;
let Inventory;
let Category;
let app;

before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());

  ({ default: app } = await import('../src/app.js'));
  ({ default: Product } = await import('../src/models/Product.model.js'));
  ({ default: Inventory } = await import('../src/models/Inventory.model.js'));
  ({ default: Category } = await import('../src/models/Category.model.js'));

  await (await import('../src/models/User.model.js')).default.create({
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
  await Promise.all([Product.deleteMany({}), Inventory.deleteMany({}), Category.deleteMany({})]);
});

async function login() {
  const res = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario: 'davidez', password: 'TestPass2026!' }),
  });
  assert.equal(res.status, 200);
  const body = await res.json();
  return body.data.token;
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

test('GET /api/inventario/exportar devuelve un XLSX válido con los productos', async () => {
  await crearProductoConStock('EXP01', 7, 45000);
  await crearProductoConStock('EXP02', 3, 90000);
  const token = await login();

  const res = await fetch(`${base}/api/inventario/exportar`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(res.status, 200);
  assert.equal(
    res.headers.get('content-type'),
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );

  const buffer = Buffer.from(await res.arrayBuffer());
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const filas = XLSX.utils.sheet_to_json(wb.Sheets['HT Mig Pdtos']);
  assert.equal(filas.length, 2);
  const codigos = filas.map((f) => f['CODIGO DEL PRODUCTO']).sort();
  assert.deepEqual(codigos, ['EXP01', 'EXP02']);
  assert.equal(filas.find((f) => f['CODIGO DEL PRODUCTO'] === 'EXP01')['CONTEO EN BODEGA'], 7);
});

test('GET /api/inventario/exportar sin token → 401', async () => {
  const res = await fetch(`${base}/api/inventario/exportar`);
  assert.equal(res.status, 401);
});

test('POST /api/inventario/importar actualiza stock y precios desde el Excel', async () => {
  await crearProductoConStock('IMP01', 2, 10000);
  await crearProductoConStock('IMP02', 5, 20000);
  const token = await login();

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet([
    {
      'CODIGO DEL PRODUCTO': 'IMP01',
      'NOMBRE-DESCRIPCION': 'Producto IMP01',
      ' PRECIO DETAL (O DEFECTO 0) ': 25000,
      'CONTEO EN BODEGA': 10,
    },
    {
      'CODIGO DEL PRODUCTO': 'IMP02',
      'NOMBRE-DESCRIPCION': 'Producto IMP02',
      ' PRECIO DETAL (O DEFECTO 0) ': 30000,
      'CONTEO EN BODEGA': 0,
    },
  ]);
  XLSX.utils.book_append_sheet(wb, ws, 'HT Mig Pdtos');
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  const fd = new FormData();
  fd.append('archivo', new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'inventario.xlsx');

  const res = await fetch(`${base}/api/inventario/importar`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  const json = await res.json();
  assert.equal(res.status, 200);
  assert.equal(json.data.actualizados, 2);
  assert.equal(json.data.creados, 0);
  assert.equal(json.data.stockTotal, 10);

  const inv1 = await Inventory.findOne({ sku: 'IMP01' }).lean();
  assert.equal(inv1.stock, 10);
  const inv2 = await Inventory.findOne({ sku: 'IMP02' }).lean();
  assert.equal(inv2.stock, 0);

  const prod1 = await Product.findOne({ codigo: 'IMP01' }).lean();
  assert.equal(prod1.precio, 25000);
  assert.equal(prod1.tienePrecio, true);
});

test('POST /api/inventario/importar crea productos nuevos que no existían', async () => {
  const token = await login();

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet([
    {
      'CODIGO DEL PRODUCTO': 'NUEVO01',
      'NOMBRE-DESCRIPCION': 'Casco NUEVO',
      'REFERENCIA': 'CASCO SHAFT',
      ' PRECIO DETAL (O DEFECTO 0) ': 150000,
      'CONTEO EN BODEGA': 4,
    },
  ]);
  XLSX.utils.book_append_sheet(wb, ws, 'HT Mig Pdtos');
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  const fd = new FormData();
  fd.append('archivo', new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'inventario.xlsx');

  const res = await fetch(`${base}/api/inventario/importar`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  const json = await res.json();
  assert.equal(res.status, 200);
  assert.equal(json.data.creados, 1);

  const prod = await Product.findOne({ codigo: 'NUEVO01' }).lean();
  assert.ok(prod);
  assert.equal(prod.precio, 150000);
  const inv = await Inventory.findOne({ sku: 'NUEVO01' }).lean();
  assert.equal(inv.stock, 4);
});

test('POST /api/inventario/importar sin token → 401', async () => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet([{ 'CODIGO DEL PRODUCTO': 'X1', 'CONTEO EN BODEGA': 1 }]);
  XLSX.utils.book_append_sheet(wb, ws, 'HT Mig Pdtos');
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  const fd = new FormData();
  fd.append('archivo', new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'i.xlsx');

  const res = await fetch(`${base}/api/inventario/importar`, { method: 'POST', body: fd });
  assert.equal(res.status, 401);
});