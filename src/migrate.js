import 'dotenv/config';
import XLSX from 'xlsx';
import connectDB from './config/db.js';
import Category from './models/Category.model.js';
import Product from './models/Product.model.js';
import Inventory from './models/Inventory.model.js';
import {
  slugify,
  toNum,
  extraerTipo,
  extraerMarca,
  buildProductsFromWorkbook,
} from './utils/excelProductos.js';

const EXCEL_PATH = 'src/inventario.xlsx';

function buildProducts() {
  const wb = XLSX.readFile(EXCEL_PATH);
  return buildProductsFromWorkbook(wb);
}

async function migrate() {
  const dryRun = process.argv.includes('--dry-run');

  if (!dryRun) {
    await connectDB();
    console.log('🗑️  Limpiando colecciones...');
    await Promise.all([Category.deleteMany({}), Product.deleteMany({}), Inventory.deleteMany({})]);
  }

  const products = buildProducts();
  console.log(`📦 Total productos unificados: ${products.length}`);

  const categoriasMap = new Map();
  products.forEach((p) => {
    const tipo = extraerTipo(p.referencia, p.linea, p.nombre) ?? 'General';
    if (!categoriasMap.has(tipo)) {
      categoriasMap.set(tipo, { nombre: tipo, slug: slugify(tipo), orden: categoriasMap.size + 1 });
    }
  });

  if (dryRun) {
    console.log('🏷️  Categorías detectadas:');
    [...categoriasMap.values()].forEach((c) => console.log(`   - ${c.nombre} (${products.filter((p) => (extraerTipo(p.referencia, p.linea, p.nombre) ?? 'General') === c.nombre).length} productos)`));

    const porMarca = {};
    products.forEach((p) => {
      const m = extraerMarca(p.referencia, p.linea, p.nombre) ?? '(sin marca)';
      porMarca[m] = (porMarca[m] || 0) + 1;
    });
    console.log('\n🏭 Top marcas:');
    Object.entries(porMarca)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 25)
      .forEach(([m, c]) => console.log(`   - ${m}: ${c}`));

    const conStock = products.filter((p) => p.stock > 0).length;
    const totalStock = products.reduce((a, p) => a + p.stock, 0);
    const sinPrecio = products.filter((p) => p.precio <= 0).length;
    console.log(`\n📊 Stock total: ${totalStock} unidades en ${conStock} productos`);
    console.log(`⚠️  Productos sin precio: ${sinPrecio}`);
    console.log('\n🧪 Modo DRY-RUN: no se escribió nada en la BD.');
    process.exit(0);
  }

  const catDocs = await Category.insertMany([...categoriasMap.values()]);
  catDocs.forEach((c) => categoriasMap.set(c.nombre, c));
  console.log(`🏷️  Categorías creadas: ${catDocs.length}`);

  const productDocs = [];
  const inventoryDocs = [];
  let sinPrecio = 0;

  for (const p of products) {
    const tipo = extraerTipo(p.referencia, p.linea, p.nombre) ?? 'General';
    const cat = categoriasMap.get(tipo);
    const marca = extraerMarca(p.referencia, p.linea, p.nombre);
    const tienePrecio = p.precio > 0;
    if (!tienePrecio) sinPrecio++;

    const slug = slugify(`${p.nombre} ${p.codigo}`).slice(0, 80);
    const nombre = p.color && !p.nombre.includes(p.color) ? `${p.nombre} ${p.color}` : p.nombre;

    productDocs.push({
      codigo: p.codigo,
      nombre,
      slug,
      marca,
      categoria: cat._id,
      precio: p.precio > 0 ? p.precio : 0,
      precioMayor: p.precioMayor,
      costo: p.costo || null,
      iva: p.iva,
      tienePrecio,
      unidadDetal: p.unidadDetal,
      unidadMayor: p.unidadMayor,
      factorConversion: p.factorConversion,
      referencia: p.referencia || undefined,
      linea: p.linea || undefined,
      numeroCategoria: p.numeroCategoria || undefined,
      registroInvima: p.registroInvima || undefined,
      registroCum: p.registroCum || undefined,
      caracteristicas: p.caracteristicas
        ? [{ clave: 'Características', valor: p.caracteristicas }]
        : [],
      ubicacion: p.ubicacion || undefined,
      activo: true,
      destacado: false,
      creadoDesde: p.origen,
    });
  }

  const inserted = await Product.insertMany(productDocs, { ordered: false });
  console.log(`✅ Productos insertados: ${inserted.length}`);
  console.log(`⚠️  Productos sin precio: ${sinPrecio}`);

  for (const [i, p] of products.entries()) {
    inventoryDocs.push({
      producto: inserted[i]._id,
      sku: p.codigo,
      stock: p.stock,
      stockMinimo: 5,
      ubicacion: p.ubicacion || undefined,
      ultimaActualizacion: new Date(),
    });
  }
  await Inventory.insertMany(inventoryDocs, { ordered: false });
  console.log(`✅ Inventarios insertados: ${inventoryDocs.length}`);

  const totalStock = inventoryDocs.reduce((a, b) => a + b.stock, 0);
  console.log(`📊 Stock total en bodega: ${totalStock} unidades`);
}

migrate()
  .then(() => {
    console.log('🎉 Migración completada');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Error en migración:', err.message);
    process.exit(1);
  });
