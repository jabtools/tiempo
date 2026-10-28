/**
 * Prueba la aplicación en un navegador real (Chrome o Edge en modo headless).
 *
 * Para cada combinación de localidad (Providencia, Pudahuel) e idioma (es, en):
 *  1. Abre `src/index.html` y borra las preferencias guardadas.
 *  2. Cambia el idioma con el botón y la localidad con el selector.
 *  3. Verifica el contenido renderizado y que no haya errores de consola.
 *  4. Guarda una captura de pantalla en `tests/capturas/`.
 *
 * Uso: node tests/probar-navegador.js
 * No requiere dependencias: usa el protocolo DevTools y el WebSocket de Node 22+.
 * Código de salida: 0 si todas las pruebas pasan, 1 si alguna falla.
 */
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { pathToFileURL } = require('url');

/** Raíz del proyecto (carpeta padre de `tests/`). */
const RAIZ = path.resolve(__dirname, '..');

/** URL local de la aplicación. */
const URL_APP = pathToFileURL(path.join(RAIZ, 'src', 'index.html')).href;

/** Carpeta donde se guardan las capturas (ignorada por Git). */
const CARPETA_CAPTURAS = path.join(__dirname, 'capturas');

/** Puerto de depuración remota del navegador. */
const PUERTO = 9333;

/** Tiempo máximo para esperar datos de la API, en milisegundos. */
const TIMEOUT_MS = 45000;

/** Rutas posibles de Chrome y Edge en Windows. */
const NAVEGADORES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];

/** Combinaciones que deben pasar en cada entrega. */
const CASOS = [
  { localidad: 'providencia', nombre: 'Providencia', idioma: 'es' },
  { localidad: 'providencia', nombre: 'Providencia', idioma: 'en' },
  { localidad: 'pudahuel', nombre: 'Pudahuel', idioma: 'es' },
  { localidad: 'pudahuel', nombre: 'Pudahuel', idioma: 'en' }
];

/** Textos esperados (presentes) y que no deben aparecer (ausentes) por idioma. */
const TEXTOS = {
  es: {
    presentes: ['Ayer', 'Próximos 4 días', 'Sensación térmica', 'English'],
    ausentes: ['Yesterday', 'Next 4 days', 'Feels like', 'Español'],
    boton: 'English'
  },
  en: {
    presentes: ['Yesterday', 'Next 4 days', 'Feels like', 'Español'],
    ausentes: ['Ayer', 'Próximos 4 días', 'Sensación térmica', 'English'],
    boton: 'Español'
  }
};

/**
 * Busca el primer navegador instalado (Chrome o Edge).
 * @returns {string} Ruta del ejecutable.
 * @throws {Error} Si no se encuentra ninguno.
 */
function buscarNavegador() {
  const ruta = NAVEGADORES.find(r => fs.existsSync(r));
  if (!ruta) throw new Error('No se encontró Chrome ni Edge en las rutas habituales');
  return ruta;
}

/**
 * Repite una función hasta que devuelva un valor verdadero o se agote el tiempo.
 * @param {Function} fn Función (puede ser asíncrona) que devuelve un booleano.
 * @param {number} ms Tiempo máximo en milisegundos.
 * @param {string} descripcion Texto para el mensaje de error.
 * @returns {Promise<any>} El primer valor verdadero devuelto por `fn`.
 * @throws {Error} Si se agota el tiempo.
 */
async function esperar(fn, ms, descripcion) {
  const limite = Date.now() + ms;
  let ultimoError;
  while (Date.now() < limite) {
    try {
      const valor = await fn();
      if (valor) return valor;
    } catch (error) {
      ultimoError = error;
    }
    await new Promise(r => setTimeout(r, 250));
  }
  const detalle = ultimoError ? ` (${ultimoError.message})` : '';
  throw new Error(`Tiempo agotado: ${descripcion}${detalle}`);
}

/**
 * Abre una conexión WebSocket con el protocolo DevTools de una pestaña.
 * @param {string} urlWs URL `webSocketDebuggerUrl` de la pestaña.
 * @returns {Promise<{enviar: Function, eventos: Array<Object>, cerrar: Function}>}
 *   `enviar` ejecuta un comando CDP; `eventos` acumula los eventos recibidos.
 */
function conectarCDP(urlWs) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(urlWs);
    const pendientes = new Map();
    const eventos = [];
    let secuencia = 0;

    ws.onopen = () => resolve({
      enviar(metodo, parametros = {}) {
        const id = ++secuencia;
        ws.send(JSON.stringify({ id, method: metodo, params: parametros }));
        return new Promise((res, rej) => pendientes.set(id, { res, rej }));
      },
      eventos,
      cerrar: () => ws.close()
    });
    ws.onerror = reject;
    ws.onmessage = evento => {
      const mensaje = JSON.parse(evento.data);
      if (mensaje.id && pendientes.has(mensaje.id)) {
        const { res, rej } = pendientes.get(mensaje.id);
        pendientes.delete(mensaje.id);
        if (mensaje.error) rej(new Error(mensaje.error.message));
        else res(mensaje.result);
      } else if (mensaje.method) {
        eventos.push(mensaje);
      }
    };
  });
}

/**
 * Evalúa una expresión JavaScript en la página y devuelve su valor.
 * @param {Object} cdp Conexión creada por `conectarCDP`.
 * @param {string} expresion Código a ejecutar en la página.
 * @returns {Promise<any>} Valor devuelto por la expresión.
 * @throws {Error} Si la expresión lanza una excepción.
 */
async function evaluar(cdp, expresion) {
  const resultado = await cdp.enviar('Runtime.evaluate', {
    expression: expresion,
    returnByValue: true,
    awaitPromise: true
  });
  if (resultado.exceptionDetails) {
    const exc = resultado.exceptionDetails.exception;
    throw new Error(exc ? exc.description : resultado.exceptionDetails.text);
  }
  return resultado.result.value;
}

/**
 * Navega a una URL y espera a que la página termine de cargar.
 * @param {Object} cdp Conexión creada por `conectarCDP`.
 * @param {string} url Dirección a abrir.
 */
async function abrir(cdp, url) {
  await cdp.enviar('Page.navigate', { url });
  await new Promise(r => setTimeout(r, 300));
  await esperar(() => evaluar(cdp, 'document.readyState === "complete"'), 10000, 'cargar la página');
}

/**
 * Espera a que la sección de clima muestre la localidad indicada y deje de cargar.
 * Falla de inmediato si la aplicación muestra un mensaje de error.
 * @param {Object} cdp Conexión creada por `conectarCDP`.
 * @param {string} nombre Nombre de la localidad esperada.
 */
async function esperarDatos(cdp, nombre) {
  await esperar(async () => {
    const estado = await evaluar(cdp, `(() => {
      const e = document.getElementById('estado');
      const h = document.querySelector('#seccion-actual h2');
      if (!e.hidden && !/Cargando|Loading/.test(e.textContent)) return 'error';
      if (e.hidden && h && h.textContent.includes(${JSON.stringify(nombre)})) return 'listo';
      return 'esperando';
    })()`);
    if (estado === 'error') throw new Error('La aplicación mostró un error al cargar los datos');
    return estado === 'listo';
  }, TIMEOUT_MS, `datos de ${nombre}`);
}

/**
 * Indica si un evento CDP corresponde a un error de consola o una excepción.
 * @param {Object} evento Evento recibido por DevTools.
 * @returns {boolean} Verdadero si es un error.
 */
function esError(evento) {
  if (evento.method === 'Runtime.exceptionThrown') return true;
  if (evento.method === 'Runtime.consoleAPICalled') return evento.params.type === 'error';
  if (evento.method === 'Log.entryAdded') return evento.params.entry.level === 'error';
  return false;
}

/**
 * Ejecuta una combinación de localidad e idioma y devuelve sus resultados.
 * @param {Object} cdp Conexión creada por `conectarCDP`.
 * @param {{localidad: string, nombre: string, idioma: string}} caso Combinación a probar.
 * @returns {Promise<{titulo: string, ok: boolean, pruebas: Array<[string, boolean]>, error?: string}>}
 */
async function ejecutarCaso(cdp, caso) {
  const titulo = `${caso.nombre} · ${caso.idioma}`;
  const inicio = cdp.eventos.length;

  try {
    await abrir(cdp, URL_APP);
    await evaluar(cdp, 'localStorage.clear()');
    await abrir(cdp, URL_APP);
    await esperarDatos(cdp, 'Santiago Centro');

    if (caso.idioma === 'en') {
      await evaluar(cdp, "document.getElementById('btn-idioma').click()");
      await esperar(() => evaluar(cdp, "document.getElementById('btn-idioma').textContent === 'Español'"), 5000, 'cambiar a inglés');
    }

    await evaluar(cdp, `(() => {
      const selector = document.getElementById('selector-localidad');
      selector.value = ${JSON.stringify(caso.localidad)};
      selector.dispatchEvent(new Event('change'));
    })()`);
    await esperarDatos(cdp, caso.nombre);

    const d = await evaluar(cdp, `(() => {
      const txt = document.body.innerText;
      const visible = id => !document.getElementById(id).hidden;
      const claves = Object.keys(window.Tiempo.I18N[${JSON.stringify(caso.idioma)}])
        .filter(k => /_|[a-z][A-Z]/.test(k));
      return {
        idioma: document.documentElement.lang,
        titulo: document.querySelector('#seccion-actual h2')?.textContent ?? '',
        seccionActual: visible('seccion-actual'),
        seccionAyer: visible('seccion-ayer'),
        seccionPronostico: visible('seccion-pronostico'),
        dias: document.querySelectorAll('#seccion-pronostico .dia').length,
        temperatura: document.querySelector('.temp-grande')?.textContent ?? '',
        boton: document.getElementById('btn-idioma').textContent,
        clavesSinTraducir: claves.filter(k => txt.includes(k)),
        texto: txt
      };
    })()`);

    const errores = cdp.eventos.slice(inicio).filter(esError);
    const textos = TEXTOS[caso.idioma];
    const faltantes = textos.presentes.filter(p => !d.texto.includes(p));
    const sobrantes = textos.ausentes.filter(p => d.texto.includes(p));

    const pruebas = [
      ['Sin errores de consola ni excepciones', errores.length === 0],
      [`Título de la localidad: ${caso.nombre}`, d.titulo.includes(caso.nombre)],
      [`Atributo lang = ${caso.idioma}`, d.idioma === caso.idioma],
      ['Sección Ahora visible', d.seccionActual],
      ['Sección Ayer visible', d.seccionAyer],
      ['Sección Próximos días visible', d.seccionPronostico],
      ['4 días de pronóstico', d.dias === 4],
      ['Temperatura actual mostrada', /-?\d+°/.test(d.temperatura)],
      [`Botón de idioma: "${textos.boton}"`, d.boton === textos.boton],
      [`Textos esperados presentes${faltantes.length ? ' (faltan: ' + faltantes.join(', ') + ')' : ''}`, faltantes.length === 0],
      [`Sin textos del otro idioma${sobrantes.length ? ' (aparecen: ' + sobrantes.join(', ') + ')' : ''}`, sobrantes.length === 0],
      [`Sin claves i18n sin traducir${d.clavesSinTraducir.length ? ' (' + d.clavesSinTraducir.join(', ') + ')' : ''}`, d.clavesSinTraducir.length === 0]
    ];

    const { data } = await cdp.enviar('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
    const archivo = path.join(CARPETA_CAPTURAS, `${caso.localidad}-${caso.idioma}.png`);
    fs.writeFileSync(archivo, Buffer.from(data, 'base64'));

    return { titulo, ok: pruebas.every(([, ok]) => ok), pruebas };
  } catch (error) {
    return { titulo, ok: false, pruebas: [], error: error.message };
  }
}

/**
 * Función principal: arranca el navegador, ejecuta los casos e imprime el resumen.
 * @returns {Promise<void>}
 */
async function main() {
  fs.mkdirSync(CARPETA_CAPTURAS, { recursive: true });
  const ejecutable = buscarNavegador();
  const perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'tiempo-prueba-'));

  const proceso = spawn(ejecutable, [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--remote-allow-origins=*',
    `--remote-debugging-port=${PUERTO}`,
    `--user-data-dir=${perfil}`,
    'about:blank'
  ], { stdio: 'ignore' });

  const resultados = [];
  try {
    await esperar(async () => (await fetch(`http://127.0.0.1:${PUERTO}/json/version`)).ok, 15000, 'arrancar el navegador');
    const destino = await (await fetch(`http://127.0.0.1:${PUERTO}/json/new?about:blank`, { method: 'PUT' })).json();
    const cdp = await conectarCDP(destino.webSocketDebuggerUrl);

    await cdp.enviar('Page.enable');
    await cdp.enviar('Runtime.enable');
    await cdp.enviar('Log.enable');
    await cdp.enviar('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });

    for (const caso of CASOS) {
      resultados.push(await ejecutarCaso(cdp, caso));
    }
    cdp.cerrar();
  } finally {
    proceso.kill();
    try {
      fs.rmSync(perfil, { recursive: true, force: true });
    } catch (error) {
      // El navegador puede conservar bloqueado el perfil temporal; no afecta el resultado.
    }
  }

  let fallos = 0;
  resultados.forEach(resultado => {
    console.log(`\n${resultado.ok ? 'PASA' : 'FALLA'}  ${resultado.titulo}`);
    resultado.pruebas.forEach(([descripcion, ok]) => {
      console.log(`  ${ok ? '✔' : '✘'} ${descripcion}`);
      if (!ok) fallos++;
    });
    if (resultado.error) {
      console.log(`  ✘ Error: ${resultado.error}`);
      fallos++;
    }
  });

  const total = resultados.filter(r => r.ok).length;
  console.log(`\nResultado: ${total}/${resultados.length} combinaciones pasan. Capturas en tests/capturas/.`);
  process.exitCode = fallos > 0 ? 1 : 0;
}

main().catch(error => {
  console.error('La prueba no pudo completarse:', error.message);
  process.exitCode = 1;
});
