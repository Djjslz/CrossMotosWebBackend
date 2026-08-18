import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createOrderSchema, listarPedidosQuery, cambiarEstadoSchema } from '../src/validations/order.validation.js';
import { createContactSchema, listarContactosQuery, marcarLeidoSchema } from '../src/validations/contact.validation.js';

const clienteValido = { nombre: 'Ana Pérez', telefono: '3001234567' };

test('createOrderSchema: pedido válido con items', () => {
  const r = createOrderSchema.safeParse({
    cliente: clienteValido,
    items: [{ codigo: 'A001', cantidad: 2 }],
    tipoEntrega: 'envio',
    medioContacto: 'formulario',
  });
  assert.equal(r.success, true);
  assert.equal(r.data.tipoEntrega, 'envio');
});

test('createOrderSchema: items vacíos falla', () => {
  const r = createOrderSchema.safeParse({ cliente: clienteValido, items: [] });
  assert.equal(r.success, false);
  assert.equal(r.error.issues[0].path.join('.'), 'items');
});

test('createOrderSchema: sin items falla', () => {
  const r = createOrderSchema.safeParse({ cliente: clienteValido });
  assert.equal(r.success, false);
});

test('createOrderSchema: cliente sin nombre falla', () => {
  const r = createOrderSchema.safeParse({ cliente: { telefono: '300' }, items: [{ codigo: 'A', cantidad: 1 }] });
  assert.equal(r.success, false);
});

test('createOrderSchema: cliente sin teléfono falla', () => {
  const r = createOrderSchema.safeParse({ cliente: { nombre: 'Ana' }, items: [{ codigo: 'A', cantidad: 1 }] });
  assert.equal(r.success, false);
});

test('createOrderSchema: cantidad 0 o negativa falla', () => {
  const r = createOrderSchema.safeParse({ cliente: clienteValido, items: [{ codigo: 'A', cantidad: 0 }] });
  assert.equal(r.success, false);
});

test('createOrderSchema: email inválido falla, vacío pasa', () => {
  const malo = createOrderSchema.safeParse({
    cliente: { ...clienteValido, email: 'correo-mal' },
    items: [{ codigo: 'A', cantidad: 1 }],
  });
  assert.equal(malo.success, false);
  const vacio = createOrderSchema.safeParse({
    cliente: { ...clienteValido, email: '' },
    items: [{ codigo: 'A', cantidad: 1 }],
  });
  assert.equal(vacio.success, true);
});

test('createOrderSchema: tipoEntrega y medioContacto inválidos fallan', () => {
  const r1 = createOrderSchema.safeParse({ cliente: clienteValido, items: [{ codigo: 'A', cantidad: 1 }], tipoEntrega: 'otro' });
  assert.equal(r1.success, false);
  const r2 = createOrderSchema.safeParse({ cliente: clienteValido, items: [{ codigo: 'A', cantidad: 1 }], medioContacto: 'telefono' });
  assert.equal(r2.success, false);
});

test('cambiarEstadoSchema: estados válidos e inválidos', () => {
  for (const estado of ['recibido', 'cotizado', 'confirmado', 'entregado', 'cancelado']) {
    assert.equal(cambiarEstadoSchema.safeParse({ estado }).success, true);
  }
  assert.equal(cambiarEstadoSchema.safeParse({ estado: 'pagado' }).success, false);
  assert.equal(cambiarEstadoSchema.safeParse({}).success, false);
});

test('listarPedidosQuery: defaults y filtro de estado', () => {
  const r = listarPedidosQuery.safeParse({});
  assert.equal(r.success, true);
  assert.equal(r.data.page, 1);
  assert.equal(r.data.limit, 12);
  const r2 = listarPedidosQuery.safeParse({ estado: 'confirmado', page: 3 });
  assert.equal(r2.success, true);
  assert.equal(r2.data.estado, 'confirmado');
  assert.equal(r2.data.page, 3);
  assert.equal(listarPedidosQuery.safeParse({ estado: 'otro' }).success, false);
});

test('createContactSchema: válido e inválido', () => {
  const ok = createContactSchema.safeParse({
    nombre: 'Ana',
    telefono: '3001234567',
    mensaje: 'Hola',
    origen: 'whatsapp',
  });
  assert.equal(ok.success, true);
  assert.equal(ok.data.origen, 'whatsapp');
  assert.equal(createContactSchema.safeParse({ nombre: 'Ana', telefono: '300', mensaje: '' }).success, false);
  assert.equal(createContactSchema.safeParse({ nombre: 'Ana', telefono: '300', mensaje: 'Hola', origen: 'otro' }).success, false);
});

test('listarContactosQuery: filtro leído', () => {
  const r = listarContactosQuery.safeParse({ leido: 'false', page: 2 });
  assert.equal(r.success, true);
  assert.equal(r.data.leido, 'false');
  assert.equal(listarContactosQuery.safeParse({ leido: 'quizas' }).success, false);
});

test('marcarLeidoSchema: default true y booleano', () => {
  assert.equal(marcarLeidoSchema.safeParse({}).data.leido, true);
  assert.equal(marcarLeidoSchema.safeParse({ leido: false }).data.leido, false);
});