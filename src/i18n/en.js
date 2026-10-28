/**
 * English text dictionary.
 * Keys must match exactly those in `es.js`.
 * Exposed as `window.Tiempo.I18N.en`.
 */
(function () {
  window.Tiempo = window.Tiempo || {};
  window.Tiempo.I18N = window.Tiempo.I18N || {};

  window.Tiempo.I18N.en = {
    titulo: 'Santiago Weather',
    etiquetaLocalidad: 'Location',
    actualizar: 'Refresh',
    idiomaAlterno: 'Español',
    cargando: 'Loading weather data…',
    errorCarga: 'Could not get the weather. Check your connection and try again.',
    fuente: 'Data: Open-Meteo.com (free API)',
    actualizado: 'Updated',
    hoy: 'Today',
    seccionAyer: 'Yesterday',
    seccionPronostico: 'Next 4 days',
    sensacion: 'Feels like',
    max: 'High',
    min: 'Low',
    humedad: 'Humidity',
    presion: 'Pressure',
    lluvia: 'Rain',
    lluviaTotal: 'Total rain',
    probLluvia: 'Rain chance',
    nubosidad: 'Cloud cover',
    viento: 'Wind',
    vientoMax: 'Max. wind',
    rachas: 'Gusts',
    uv: 'UV index',
    amanecer: 'Sunrise',
    atardecer: 'Sunset',
    dirs: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'],
    uv_bajo: 'Low',
    uv_moderado: 'Moderate',
    uv_alto: 'High',
    uv_muy_alto: 'Very high',
    uv_extremo: 'Extreme',
    cond_despejado: 'Clear',
    cond_mayormente_despejado: 'Mostly clear',
    cond_parcialmente_nublado: 'Partly cloudy',
    cond_nublado: 'Overcast',
    cond_niebla: 'Fog',
    cond_llovizna: 'Drizzle',
    cond_llovizna_helada: 'Freezing drizzle',
    cond_lluvia: 'Rain',
    cond_lluvia_helada: 'Freezing rain',
    cond_nieve: 'Snow',
    cond_chubascos: 'Showers',
    cond_chubascos_nieve: 'Snow showers',
    cond_tormenta: 'Thunderstorm',
    cond_tormenta_granizo: 'Thunderstorm with hail'
  };
})();
