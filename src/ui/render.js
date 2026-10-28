/**
 * Renderizado de las secciones de la interfaz.
 * Cada función recibe los datos normalizados y un contexto `ctx`
 * con la función de traducción `t` y la configuración regional `locale`.
 * Devuelve HTML como cadena. Se expone como `window.Tiempo.Render`.
 */
(function () {
  window.Tiempo = window.Tiempo || {};
  const Iconos = window.Tiempo.Iconos;

  /**
   * Escapa caracteres especiales de HTML para evitar inyección.
   * @param {string} texto Texto a escapar.
   * @returns {string} Texto seguro para insertar en HTML.
   */
  function esc(texto) {
    return String(texto).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);
  }

  /**
   * Formatea un número según el idioma.
   * @param {number|null|undefined} valor Número a formatear.
   * @param {{locale: string}} ctx Contexto de idioma.
   * @param {number} [decimales=0] Cantidad máxima de decimales.
   * @returns {string} Número formateado o "–" si no hay dato.
   */
  function numero(valor, ctx, decimales) {
    if (valor === null || valor === undefined || Number.isNaN(valor)) return '–';
    return new Intl.NumberFormat(ctx.locale, { maximumFractionDigits: decimales || 0 }).format(valor);
  }

  /**
   * Formatea una temperatura redondeada con su símbolo.
   * @param {number} valor Temperatura en °C.
   * @param {{locale: string}} ctx Contexto de idioma.
   * @returns {string} Ejemplo: "21°".
   */
  function temperatura(valor, ctx) {
    if (valor === null || valor === undefined) return '–';
    return `${numero(Math.round(valor), ctx)}°`;
  }

  /**
   * Devuelve la clase CSS de color según la temperatura.
   * @param {number} valor Temperatura en °C.
   * @returns {string} Nombre de la clase CSS.
   */
  function claseTemperatura(valor) {
    if (valor < 10) return 'temp-frio';
    if (valor < 22) return 'temp-templado';
    return 'temp-calor';
  }

  /**
   * Obtiene el nivel textual del índice UV.
   * @param {number} valor Índice UV máximo.
   * @param {Function} t Función de traducción.
   * @returns {string} Nivel traducido (bajo, moderado, alto, muy alto, extremo).
   */
  function nivelUV(valor, t) {
    if (valor === null || valor === undefined) return '';
    let clave = 'uv_extremo';
    if (valor < 3) clave = 'uv_bajo';
    else if (valor < 6) clave = 'uv_moderado';
    else if (valor < 8) clave = 'uv_alto';
    else if (valor < 11) clave = 'uv_muy_alto';
    return t(clave);
  }

  /**
   * Genera la flecha y la dirección cardinal del viento.
   * La flecha apunta hacia donde sopla el viento (grados de origen + 180).
   * @param {number} grados Dirección de origen del viento en grados.
   * @param {{t: Function}} ctx Contexto con la función de traducción.
   * @returns {string} HTML con flecha y abreviatura de dirección.
   */
  function direccionViento(grados, ctx) {
    const dirs = ctx.t('dirs');
    const indice = Math.round(grados / 45) % 8;
    return `<span class="flecha" style="transform: rotate(${grados + 180}deg)" aria-hidden="true">↑</span> ${dirs[indice]}`;
  }

  /**
   * Formatea una fecha larga (ej.: "martes 28 de octubre").
   * @param {string} fecha Fecha en formato "YYYY-MM-DD".
   * @param {{locale: string}} ctx Contexto de idioma.
   * @returns {string} Fecha legible.
   */
  function fechaLarga(fecha, ctx) {
    return new Date(`${fecha}T12:00:00`).toLocaleDateString(ctx.locale, {
      weekday: 'long', day: 'numeric', month: 'long'
    });
  }

  /**
   * Devuelve el nombre del día de la semana.
   * @param {string} fecha Fecha en formato "YYYY-MM-DD".
   * @param {{locale: string}} ctx Contexto de idioma.
   * @returns {string} Nombre del día.
   */
  function diaSemana(fecha, ctx) {
    return new Date(`${fecha}T12:00:00`).toLocaleDateString(ctx.locale, { weekday: 'long' });
  }

  /**
   * Devuelve día y mes abreviados (ej.: "28 oct").
   * @param {string} fecha Fecha en formato "YYYY-MM-DD".
   * @param {{locale: string}} ctx Contexto de idioma.
   * @returns {string} Fecha corta.
   */
  function fechaCorta(fecha, ctx) {
    return new Date(`${fecha}T12:00:00`).toLocaleDateString(ctx.locale, { day: 'numeric', month: 'short' });
  }

  /**
   * Genera una tarjeta de parámetro meteorológico.
   * @param {string} icono Emoji del parámetro.
   * @param {string} etiqueta Nombre del parámetro.
   * @param {string} valor Valor ya formateado (puede incluir HTML controlado).
   * @param {string} [detalle=''] Texto complementario opcional.
   * @returns {string} HTML de la tarjeta.
   */
  function parametro(icono, etiqueta, valor, detalle) {
    return `
      <div class="parametro">
        <span class="param-icono" aria-hidden="true">${icono}</span>
        <div>
          <p class="param-etiqueta">${esc(etiqueta)}</p>
          <p class="param-valor">${valor}</p>
          ${detalle ? `<p class="param-detalle">${detalle}</p>` : ''}
        </div>
      </div>`;
  }

  /**
   * Renderiza la sección "Ahora" con el hero y los parámetros actuales.
   * @param {Object} datos Datos normalizados del clima.
   * @param {Object} ctx Contexto de idioma (`t`, `locale`).
   * @param {string} nombreLocalidad Nombre visible de la localidad.
   * @returns {string} HTML de la sección.
   */
  function seccionActual(datos, ctx, nombreLocalidad) {
    const { t } = ctx;
    const a = datos.actual;
    const h = datos.hoy;
    const cond = Iconos.iconoClima(a.codigo, a.esDia);
    const hora = datos.obtenido.toLocaleTimeString(ctx.locale, { hour: '2-digit', minute: '2-digit' });

    const hero = `
      <div class="tarjeta tarjeta-hero">
        <div class="hero-principal">
          <div class="hero-icono" aria-hidden="true">${cond.icono}</div>
          <div>
            <p class="etiqueta">${esc(t('hoy'))} · ${esc(fechaLarga(h.fecha, ctx))}</p>
            <p class="temp-grande ${claseTemperatura(a.temp)}">${temperatura(a.temp, ctx)}</p>
            <p class="condicion">${esc(t('cond_' + cond.clave))}</p>
            <p class="sub">${esc(t('sensacion'))}: ${temperatura(a.sensacion, ctx)} · ${esc(t('actualizado'))} ${hora}</p>
          </div>
        </div>
        <div class="hero-minmax">
          <div><span>${esc(t('max'))}</span><strong class="max">${temperatura(h.tempMax, ctx)}</strong></div>
          <div><span>${esc(t('min'))}</span><strong class="min">${temperatura(h.tempMin, ctx)}</strong></div>
        </div>
      </div>`;

    const parametros = `
      <div class="params">
        ${parametro('💧', t('humedad'), `${numero(a.humedad, ctx)}%`)}
        ${parametro('⏱️', t('presion'), `${numero(a.presion, ctx)} hPa`)}
        ${parametro('🌧️', t('lluvia'), `${numero(a.lluvia, ctx, 1)} mm`, `${esc(t('probLluvia'))}: ${numero(h.probLluvia, ctx)}%`)}
        ${parametro('☁️', t('nubosidad'), `${numero(a.nubes, ctx)}%`)}
        ${parametro('💨', t('viento'), `${numero(a.viento, ctx)} km/h`, `${direccionViento(a.vientoDir, ctx)} · ${esc(t('rachas'))}: ${numero(a.rachas, ctx)} km/h`)}
        ${parametro('☀️', t('uv'), numero(h.uvMax, ctx, 1), esc(nivelUV(h.uvMax, t)))}
        ${parametro('🌅', t('amanecer'), esc(h.amanecer))}
        ${parametro('🌇', t('atardecer'), esc(h.atardecer))}
      </div>`;

    return `
      <h2 class="titulo-seccion">${esc(nombreLocalidad)}</h2>
      ${hero}
      ${parametros}`;
  }

  /**
   * Renderiza la sección "Ayer" con un resumen del día anterior.
   * @param {Object|null} dia Datos del día anterior, o null si no existen.
   * @param {Object} ctx Contexto de idioma.
   * @returns {string} HTML de la sección (cadena vacía si no hay datos).
   */
  function seccionAyer(dia, ctx) {
    if (!dia) return '';
    const { t } = ctx;
    const cond = Iconos.iconoClima(dia.codigo, true);

    return `
      <h2 class="titulo-seccion">${esc(t('seccionAyer'))}</h2>
      <div class="tarjeta tarjeta-compacta">
        <div class="fila-dia">
          <span class="icono-grande" aria-hidden="true">${cond.icono}</span>
          <div>
            <p class="fecha">${esc(fechaLarga(dia.fecha, ctx))}</p>
            <p class="condicion">${esc(t('cond_' + cond.clave))}</p>
          </div>
          <div class="minmax">
            <span class="max">${temperatura(dia.tempMax, ctx)}</span>
            <span class="min">${temperatura(dia.tempMin, ctx)}</span>
          </div>
        </div>
        <div class="resumen-dia">
          ${parametro('🌧️', t('lluviaTotal'), `${numero(dia.lluvia, ctx, 1)} mm`)}
          ${parametro('💨', t('vientoMax'), `${numero(dia.vientoMax, ctx)} km/h`)}
          ${parametro('☀️', t('uv'), numero(dia.uvMax, ctx, 1), esc(nivelUV(dia.uvMax, t)))}
          ${parametro('🌅', t('amanecer'), esc(dia.amanecer))}
        </div>
      </div>`;
  }

  /**
   * Renderiza la sección de pronóstico de los próximos días en tarjetas.
   * @param {Array<Object>} dias Lista de días del pronóstico.
   * @param {Object} ctx Contexto de idioma.
   * @returns {string} HTML de la sección.
   */
  function seccionPronostico(dias, ctx) {
    const { t } = ctx;
    const tarjetas = dias.map(dia => {
      const cond = Iconos.iconoClima(dia.codigo, true);
      return `
        <article class="tarjeta dia">
          <p class="dia-nombre">${esc(diaSemana(dia.fecha, ctx))}</p>
          <p class="dia-fecha">${esc(fechaCorta(dia.fecha, ctx))}</p>
          <span class="icono-grande" aria-hidden="true">${cond.icono}</span>
          <p class="condicion">${esc(t('cond_' + cond.clave))}</p>
          <p class="minmax">
            <span class="max">${temperatura(dia.tempMax, ctx)}</span>
            <span class="min">${temperatura(dia.tempMin, ctx)}</span>
          </p>
          <ul class="dia-detalles">
            <li>🌧️ ${numero(dia.probLluvia, ctx)}% · ${numero(dia.lluvia, ctx, 1)} mm</li>
            <li>💨 ${numero(dia.vientoMax, ctx)} km/h</li>
            <li>☀️ UV ${numero(dia.uvMax, ctx, 1)}</li>
          </ul>
        </article>`;
    }).join('');

    return `
      <h2 class="titulo-seccion">${esc(t('seccionPronostico'))}</h2>
      <div class="grid-dias">${tarjetas}</div>`;
  }

  window.Tiempo.Render = {
    actual: seccionActual,
    ayer: seccionAyer,
    pronostico: seccionPronostico
  };
})();
