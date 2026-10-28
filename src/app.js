/**
 * Punto de entrada de la aplicación.
 * Coordina el estado (idioma, localidad, datos), carga el clima desde la API,
 * actualiza la interfaz y gestiona los controles (localidad, idioma, actualizar).
 */
(function () {
  const T = window.Tiempo;

  /** Claves de almacenamiento local para recordar preferencias. */
  const CLAVE_IDIOMA = 'tiempo.idioma';
  const CLAVE_LOCALIDAD = 'tiempo.localidad';

  /** Intervalo de actualización automática: 15 minutos. */
  const INTERVALO_ACTUALIZACION_MS = 15 * 60 * 1000;

  /**
   * Estado global de la aplicación.
   * @type {{idioma: string, comunaId: string, datos: Object|null, claveEstado: string|null, solicitud: number}}
   */
  const estado = {
    idioma: 'es',
    comunaId: 'santiago',
    datos: null,
    claveEstado: null,
    solicitud: 0
  };

  /**
   * Traduce una clave según el idioma activo.
   * @param {string} clave Clave del diccionario de i18n.
   * @returns {string} Texto traducido, o la propia clave si no existe.
   */
  function t(clave) {
    const diccionario = T.I18N[estado.idioma];
    return diccionario[clave] !== undefined ? diccionario[clave] : clave;
  }

  /**
   * Contexto de renderizado: función de traducción y configuración regional.
   * @returns {{t: Function, locale: string}}
   */
  function contexto() {
    return { t, locale: estado.idioma === 'en' ? 'en-US' : 'es-CL' };
  }

  /**
   * Localidad seleccionada actualmente.
   * @returns {{id: string, nombre: string, lat: number, lon: number}}
   */
  function comunaActual() {
    return T.Comunas.find(c => c.id === estado.comunaId) || T.Comunas[0];
  }

  /**
   * Lee una preferencia del almacenamiento local, con respaldo si no está disponible.
   * @param {string} clave Clave de almacenamiento.
   * @param {string} valorPorDefecto Valor a usar si no hay dato.
   * @returns {string} Valor almacenado o por defecto.
   */
  function leerPreferencia(clave, valorPorDefecto) {
    try {
      return localStorage.getItem(clave) || valorPorDefecto;
    } catch (error) {
      return valorPorDefecto;
    }
  }

  /**
   * Guarda una preferencia en el almacenamiento local, si está disponible.
   * @param {string} clave Clave de almacenamiento.
   * @param {string} valor Valor a guardar.
   */
  function guardarPreferencia(clave, valor) {
    try {
      localStorage.setItem(clave, valor);
    } catch (error) {
      // El almacenamiento puede estar bloqueado; la app sigue funcionando sin preferencias.
    }
  }

  /**
   * Muestra u oculta el mensaje de estado (carga o error).
   * @param {string|null} clave Clave de i18n del mensaje, o null para ocultarlo.
   */
  function mostrarEstado(clave) {
    estado.claveEstado = clave;
    const elemento = document.getElementById('estado');
    elemento.hidden = !clave;
    elemento.textContent = clave ? t(clave) : '';
  }

  /**
   * Aplica los textos estáticos (`data-i18n`) y el estado del botón de idioma.
   */
  function aplicarTextos() {
    document.documentElement.lang = estado.idioma;
    document.title = t('titulo');

    document.querySelectorAll('[data-i18n]').forEach(elemento => {
      elemento.textContent = t(elemento.dataset.i18n);
    });

    const boton = document.getElementById('btn-idioma');
    boton.textContent = t('idiomaAlterno');
    boton.setAttribute('aria-pressed', String(estado.idioma === 'en'));

    if (estado.claveEstado) {
      mostrarEstado(estado.claveEstado);
    }
  }

  /**
   * Oculta todas las secciones de datos.
   */
  function ocultarSecciones() {
    ['seccion-actual', 'seccion-ayer', 'seccion-pronostico'].forEach(id => {
      document.getElementById(id).hidden = true;
    });
  }

  /**
   * Reconstruye la interfaz con los datos actuales y el idioma activo.
   * No vuelve a consultar la API.
   */
  function renderTodo() {
    aplicarTextos();
    if (!estado.datos) {
      ocultarSecciones();
      return;
    }

    const ctx = contexto();
    const datos = estado.datos;
    const secciones = {
      'seccion-actual': T.Render.actual(datos, ctx, comunaActual().nombre),
      'seccion-ayer': T.Render.ayer(datos.ayer, ctx),
      'seccion-pronostico': T.Render.pronostico(datos.pronostico, ctx)
    };

    Object.keys(secciones).forEach(id => {
      const elemento = document.getElementById(id);
      elemento.innerHTML = secciones[id];
      elemento.hidden = !secciones[id];
    });
  }

  /**
   * Consulta el clima de la localidad seleccionada y actualiza la interfaz.
   * Si se llama varias veces seguidas, solo la última respuesta se muestra.
   * @returns {Promise<void>}
   */
  async function cargarDatos() {
    const comuna = comunaActual();
    const solicitud = ++estado.solicitud;
    mostrarEstado('cargando');

    try {
      const datos = await T.API.obtenerClima(comuna.lat, comuna.lon);
      if (solicitud !== estado.solicitud) return;
      estado.datos = datos;
      mostrarEstado(null);
      renderTodo();
    } catch (error) {
      if (solicitud !== estado.solicitud) return;
      console.error('Error al obtener el clima:', error);
      estado.datos = null;
      mostrarEstado('errorCarga');
      renderTodo();
    }
  }

  /**
   * Llena el selector de localidades con la lista de comunas.
   */
  function poblarSelector() {
    const selector = document.getElementById('selector-localidad');
    selector.innerHTML = T.Comunas
      .map(c => `<option value="${c.id}">${c.nombre}</option>`)
      .join('');
    selector.value = estado.comunaId;
  }

  /**
   * Alterna entre español e inglés, guarda la preferencia y re-renderiza.
   */
  function alternarIdioma() {
    estado.idioma = estado.idioma === 'es' ? 'en' : 'es';
    guardarPreferencia(CLAVE_IDIOMA, estado.idioma);
    renderTodo();
  }

  /**
   * Asigna los controladores de eventos de la interfaz.
   */
  function vincularEventos() {
    document.getElementById('selector-localidad').addEventListener('change', event => {
      estado.comunaId = event.target.value;
      guardarPreferencia(CLAVE_LOCALIDAD, estado.comunaId);
      cargarDatos();
    });

    document.getElementById('btn-actualizar').addEventListener('click', cargarDatos);
    document.getElementById('btn-idioma').addEventListener('click', alternarIdioma);
  }

  /**
   * Inicializa la aplicación: restaura preferencias, enlaza eventos,
   * carga el clima y programa la actualización automática.
   */
  function iniciar() {
    estado.idioma = leerPreferencia(CLAVE_IDIOMA, 'es') === 'en' ? 'en' : 'es';
    const localidadGuardada = leerPreferencia(CLAVE_LOCALIDAD, 'santiago');
    estado.comunaId = T.Comunas.some(c => c.id === localidadGuardada) ? localidadGuardada : 'santiago';

    poblarSelector();
    vincularEventos();
    cargarDatos();
    setInterval(cargarDatos, INTERVALO_ACTUALIZACION_MS);
  }

  document.addEventListener('DOMContentLoaded', iniciar);
})();
