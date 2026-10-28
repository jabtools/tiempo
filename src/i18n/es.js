/**
 * Diccionario de textos en español (idioma por defecto).
 * Las claves deben coincidir exactamente con las de `en.js`.
 * Se expone como `window.Tiempo.I18N.es`.
 */
(function () {
  window.Tiempo = window.Tiempo || {};
  window.Tiempo.I18N = window.Tiempo.I18N || {};

  window.Tiempo.I18N.es = {
    titulo: 'Clima Santiago',
    etiquetaLocalidad: 'Localidad',
    actualizar: 'Actualizar',
    idiomaAlterno: 'English',
    cargando: 'Cargando datos del clima…',
    errorCarga: 'No se pudo obtener el clima. Revisa tu conexión e inténtalo de nuevo.',
    fuente: 'Datos: Open-Meteo.com (API gratuita)',
    actualizado: 'Actualizado',
    hoy: 'Hoy',
    seccionAyer: 'Ayer',
    seccionPronostico: 'Próximos 4 días',
    sensacion: 'Sensación térmica',
    max: 'Máx',
    min: 'Mín',
    humedad: 'Humedad',
    presion: 'Presión',
    lluvia: 'Lluvia',
    lluviaTotal: 'Lluvia total',
    probLluvia: 'Prob. de lluvia',
    nubosidad: 'Nubosidad',
    viento: 'Viento',
    vientoMax: 'Viento máx.',
    rachas: 'Ráfagas',
    uv: 'Índice UV',
    amanecer: 'Amanecer',
    atardecer: 'Atardecer',
    dirs: ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'],
    uv_bajo: 'Bajo',
    uv_moderado: 'Moderado',
    uv_alto: 'Alto',
    uv_muy_alto: 'Muy alto',
    uv_extremo: 'Extremo',
    cond_despejado: 'Despejado',
    cond_mayormente_despejado: 'Mayormente despejado',
    cond_parcialmente_nublado: 'Parcialmente nublado',
    cond_nublado: 'Nublado',
    cond_niebla: 'Niebla',
    cond_llovizna: 'Llovizna',
    cond_llovizna_helada: 'Llovizna helada',
    cond_lluvia: 'Lluvia',
    cond_lluvia_helada: 'Lluvia helada',
    cond_nieve: 'Nieve',
    cond_chubascos: 'Chubascos',
    cond_chubascos_nieve: 'Chubascos de nieve',
    cond_tormenta: 'Tormenta',
    cond_tormenta_granizo: 'Tormenta con granizo'
  };
})();
