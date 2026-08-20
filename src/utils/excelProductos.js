import XLSX from 'xlsx';

export const LINEA_MARCA = {
  '01': 'SHAFT', '02': 'MT', '03': 'AGV', '04': 'LS2', '05': 'AP28',
  '06': 'HJC', '07': 'SHARK', '08': 'XECURO', '09': 'XTRONG', '10': 'BELL',
  '11': 'SHOX', '12': 'SPARTAN', '13': 'X_SPORTS', '14': 'ICH', '15': 'X_ONE',
  '16': 'HRO', '17': 'KONTROL', '18': 'ALPINESTARS', '19': 'FP', '24': 'FLY',
  '27': 'GX', '31': 'PRO RIDER', '32': 'INDEX', '44': 'NZI', '55': 'TECH',
  '59': 'ZEUS', '68': 'TATTOO', '70': 'SMK', '82': 'KYT', '83': 'HAX',
  '86': 'DC', '87': 'EDGE', '88': 'FRATELLI', '89': 'AXXES', '91': 'AMX',
  '95': 'CONNOR', '99': 'KOV', '100': 'NICK',
};

export const PREFIJO_TIPO = [
  ['CASCOS', 'Cascos'],
  ['CASCO', 'Cascos'],
  ['VISORES', 'Visores'],
  ['VISOR', 'Visores'],
  ['VISOT', 'Visores'],
  ['GUANTES', 'Guantes'],
  ['CHAQUETAS', 'Chaquetas'],
  ['IMPERMEABLES', 'Impermeables'],
  ['PANTALONES', 'Pantalones'],
  ['PANTALON', 'Pantalones'],
  ['BOTAS', 'Botas'],
  ['MALETEROS', 'Maleteros'],
  ['MALETAS', 'Maleteros'],
  ['ALFORJAS', 'Maleteros'],
  ['TANK', 'Maleteros'],
  ['DRY', 'Maleteros'],
  ['BOLSOS', 'Maleteros'],
  ['MORRALES', 'Maleteros'],
  ['CUBREMALETAS', 'Maleteros'],
  ['RODILLERAS', 'Protecciones'],
  ['PECHERAS', 'Protecciones'],
  ['CHALECOS', 'Protecciones'],
  ['BODY', 'Protecciones'],
  ['PROTECTOR', 'Protecciones'],
  ['SLIDERS', 'Protecciones'],
  ['JERSEYS', 'Jerseys'],
  ['BUSOS', 'Jerseys'],
  ['CAMISETAS', 'Jerseys'],
  ['BOMBILLOS', 'Iluminación'],
  ['LUCES', 'Iluminación'],
  ['LUZ', 'Iluminación'],
  ['DIRECCIONALES', 'Iluminación'],
  ['DIRECCIONAL', 'Iluminación'],
  ['ESPEJOS', 'Espejos'],
  ['MANILARES', 'Controles'],
  ['GUAYAS', 'Controles'],
  ['ACELERADOR', 'Controles'],
  ['SWITCHES', 'Controles'],
  ['TORNILLOS', 'Controles'],
  ['CANDADOS', 'Candados'],
  ['CANDADO', 'Candados'],
  ['LUJOS', 'Accesorios'],
  ['SISTEMAS', 'Sistemas'],
  ['GAFAS', 'Gafas'],
  ['PIJAMAS', 'Ropa'],
  ['ABRIGOS', 'Ropa'],
  ['ABRIGO', 'Ropa'],
  ['CAPAS', 'Ropa'],
  ['GABARDINA', 'Ropa'],
  ['PUFFS', 'Ropa'],
  ['BUFFS', 'Ropa'],
  ['GORRAS', 'Ropa'],
  ['MEDIAS', 'Ropa'],
  ['PASAMONTAÑAS', 'Ropa'],
  ['MASCARA', 'Ropa'],
  ['CINTAS', 'Accesorios'],
  ['PARCHE', 'Accesorios'],
  ['LLAVEROS', 'Accesorios'],
  ['ALCANCIAS', 'Accesorios'],
  ['ESTUCHE', 'Accesorios'],
  ['FUNDAS', 'Accesorios'],
  ['ESTUCHES', 'Accesorios'],
  ['ALARMAS', 'Electrónica'],
  ['ALARMA', 'Electrónica'],
  ['GPS', 'Electrónica'],
  ['INTERCOM', 'Electrónica'],
  ['AURICULAR', 'Electrónica'],
  ['CARGADOR', 'Electrónica'],
  ['BLUETHOOT', 'Electrónica'],
  ['LUBRICANTES', 'Mantenimiento'],
  ['ACEITES', 'Mantenimiento'],
  ['SILICONAS', 'Mantenimiento'],
  ['CERAS', 'Mantenimiento'],
  ['LIMPIADORES', 'Mantenimiento'],
  ['DESENGRASANTES', 'Mantenimiento'],
  ['RENOVADOR', 'Mantenimiento'],
  ['RESTAURADOR', 'Mantenimiento'],
  ['DESMANCHADOR', 'Mantenimiento'],
  ['DETALLADORES', 'Mantenimiento'],
  ['POLILLANTAS', 'Mantenimiento'],
  ['ELIMINADOR', 'Mantenimiento'],
  ['DESINFECTANTE', 'Mantenimiento'],
  ['LAVADOS', 'Mantenimiento'],
  ['RECAMARAS', 'Repuestos'],
  ['REPUESTOS', 'Repuestos'],
  ['CARBURADOR', 'Repuestos'],
  ['FILTROS', 'Repuestos'],
  ['BUJIA', 'Repuestos'],
  ['CUPULAS', 'Repuestos'],
  ['TABLEROS', 'Repuestos'],
  ['PESAS', 'Repuestos'],
  ['BOMBAS', 'Repuestos'],
  ['PITILLOS', 'Repuestos'],
  ['KITS', 'Repuestos'],
  ['SPOOLS', 'Repuestos'],
  ['SPOOL', 'Repuestos'],
  ['PORTECTOR', 'Repuestos'],
  ['ESTABILIZADOR', 'Repuestos'],
  ['TAPAS', 'Repuestos'],
  ['TAPONES', 'Repuestos'],
  ['TOPES', 'Repuestos'],
  ['CALAPIES', 'Repuestos'],
  ['DESCANSADOR', 'Repuestos'],
  ['ARNES', 'Repuestos'],
  ['VARILLAS', 'Repuestos'],
  ['VARILLA', 'Repuestos'],
  ['TENSORES', 'Repuestos'],
  ['MANGAS', 'Repuestos'],
  ['MANIGUETAS', 'Repuestos'],
  ['CAPUCHONES', 'Repuestos'],
  ['CRE', 'Repuestos'],
  ['ALERONES', 'Repuestos'],
  ['OREJAS', 'Repuestos'],
  ['COLA', 'Accesorios'],
  ['CACHOS', 'Accesorios'],
  ['CAMPANAS', 'Accesorios'],
  ['CACHETERAS', 'Accesorios'],
  ['NARIGUERAS', 'Accesorios'],
  ['PIERNERO', 'Protecciones'],
  ['PIERNEROS', 'Protecciones'],
  ['CORTAVIENTOS', 'Protecciones'],
  ['ROMPE', 'Protecciones'],
  ['HANDSAVER', 'Accesorios'],
  ['HANSAVER', 'Accesorios'],
  ['ALPINE', 'Protecciones'],
  ['PINLOOKS', 'Accesorios'],
  ['PULPOS', 'Accesorios'],
  ['MALLAS', 'Accesorios'],
  ['SOPORTES', 'Accesorios'],
  ['BASE', 'Accesorios'],
  ['BASES', 'Accesorios'],
  ['PORTA', 'Accesorios'],
  ['PORTAPLACAS', 'Accesorios'],
  ['SPOILERS', 'Accesorios'],
  ['SPOYLER', 'Accesorios'],
  ['CRESTAS', 'Accesorios'],
  ['REATAS', 'Accesorios'],
  ['JOFFA', 'Ropa'],
  ['JOFFAS', 'Ropa'],
  ['MASCARAS', 'Ropa'],
  ['EXPLORADORAS', 'Ropa'],
  ['ZAPATONES', 'Calzado'],
  ['INTERIORES', 'Cascos'],
  ['SLIDER', 'Protecciones'],
  ['PRO', 'Cascos'],
  ['ALKUTRAX', 'Mantenimiento'],
  ['CEPILLO', 'Mantenimiento'],
  ['MOTO', 'General'],
];

export function normalizeText(s) {
  return String(s ?? '').trim().toUpperCase().replace(/\s+/g, ' ');
}

export function slugify(s) {
  return String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function extraerTipo(referencia, linea, nombre) {
  const ref = normalizeText(referencia);
  if (ref) {
    for (const [pref, tipo] of PREFIJO_TIPO) {
      if (ref === pref || ref.startsWith(pref + ' ')) return tipo;
    }
    const primera = ref.split(' ')[0];
    if (primera) return primera.charAt(0) + primera.slice(1).toLowerCase();
  }
  if (linea && LINEA_MARCA[linea]) return 'Cascos';
  const n = normalizeText(nombre);
  if (n && /\b(CASCO|CASCOS|HELMET|INTEGRAL|ABATIBLE|MODULAR|JET 916)\b/.test(n)) return 'Cascos';
  const tok = n.split(/[ _]/)[0];
  const marcasCasco = new Set(['SHAFT', 'X_SPORTS', 'X_ONE', 'ICH', 'KRM', 'AIROH', 'SPARTAN', 'IDX', 'HRO', 'XTRONG', 'XECURO', 'KONTROL', 'SMK', 'EDGE', 'TECH', 'ZEUS', 'TATTO', 'AXXES', 'AMX', 'INDEX', 'KOV', 'MT', 'SHOX', 'NZI', 'FLY']);
  if (tok && marcasCasco.has(tok)) return 'Cascos';
  return null;
}

export function extraerMarca(referencia, linea, nombre) {
  const tipos = new Set(PREFIJO_TIPO.map(([p]) => p));
  PREFIJO_TIPO.forEach(([p]) => {
    if (p.endsWith('S')) tipos.add(p.slice(0, -1));
  });
  const ref = normalizeText(referencia);
  if (ref) {
    const partes = ref.split(' ');
    if (partes.length >= 2) return partes[1];
  }
  if (linea && LINEA_MARCA[linea]) return LINEA_MARCA[linea];
  const n = normalizeText(nombre);
  const tok = n.split(/[ _]/)[0];
  if (tok && !tipos.has(tok)) return tok;
  return null;
}

export function buildProductsFromWorkbook(wb) {
  const ht = XLSX.utils.sheet_to_json(wb.Sheets['HT Mig Pdtos'], { defval: '', raw: true });
  const ich = XLSX.utils.sheet_to_json(wb.Sheets['ICH'], { defval: '', raw: true });
  const shaft = XLSX.utils.sheet_to_json(wb.Sheets['SHAFT'], { defval: '', raw: true });

  const byCode = new Map();

  const merge = (row, origen) => {
    const codigo = normalizeText(row['CODIGO DEL PRODUCTO'] ?? row['CODIGO'] ?? '');
    if (!codigo) return;
    const existing = byCode.get(codigo);
    const stock = toNum(row['CONTEO EN BODEGA']);
    if (!existing) {
      byCode.set(codigo, {
        codigo,
        origen,
        nombre: String(row['NOMBRE-DESCRIPCION'] ?? row['nombre'] ?? row['DESCRIPCION'] ?? row['__EMPTY_1'] ?? '').trim(),
        referencia: normalizeText(row['REFERENCIA']),
        linea: normalizeText(row['LINEA (O DEFECTO 00)']),
        numeroCategoria: normalizeText(row['NUMERO DE CATEGORIA']),
        precio: toNum(row[' PRECIO DETAL (O DEFECTO 0) '] ?? row[' PRECIO ']),
        precioMayor: toNum(row['PRECIO MAYOR (O DEFECTO 0)']),
        costo: toNum(row['PRECIO DE COSTO']),
        iva: toNum(row['%  IVA']),
        unidadDetal: String(row['UNIDAD - DETAL'] ?? '').trim(),
        unidadMayor: String(row['UNIDAD - MAYOR'] ?? '').trim(),
        factorConversion: toNum(row['FACTOR DE CONVERSION DE DETAL A MAYOR O DEFECTO (1)']) || 1,
        registroInvima: String(row['REGISTO INVIMA'] ?? '').trim(),
        registroCum: String(row['REGISTRO CUM'] ?? '').trim(),
        caracteristicas: String(row['CARACTERISTICAS'] ?? '').trim(),
        ubicacion: String(row['UBICACIÓN'] ?? '').trim(),
        stock,
        color: String(row['COLOR'] ?? '').trim(),
      });
    } else {
      if (stock > 0) existing.stock += stock;
      if (!existing.precio && toNum(row[' PRECIO DETAL (O DEFECTO 0) '] ?? row[' PRECIO ']) > 0)
        existing.precio = toNum(row[' PRECIO DETAL (O DEFECTO 0) '] ?? row[' PRECIO ']);
      if (!existing.nombre && (row['NOMBRE-DESCRIPCION'] || row['nombre'] || row['DESCRIPCION']))
        existing.nombre = String(row['NOMBRE-DESCRIPCION'] ?? row['nombre'] ?? row['DESCRIPCION']).trim();
      if (!existing.referencia) existing.referencia = normalizeText(row['REFERENCIA']);
      if (!existing.linea) existing.linea = normalizeText(row['LINEA (O DEFECTO 00)']);
    }
  };

  ht.forEach((r) => merge(r, 'ht'));
  ich.forEach((r) => merge(r, 'ich'));
  shaft.forEach((r) => merge(r, 'shaft'));

  return [...byCode.values()];
}

export function readWorkbook(buffer) {
  return XLSX.read(buffer, { type: 'buffer' });
}