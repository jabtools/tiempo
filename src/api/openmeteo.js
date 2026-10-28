/**
 * Cliente de la API gratuita Open-Meteo (https://open-meteo.com).
 * No requiere API key. Devuelve datos normalizados para la interfaz:
 * clima actual, día anterior, día actual y pronóstico de 4 días.
 * Se expone como `window.Tiempo.API`.
 */
(function () {
  window.Tiempo = window.Tiempo || {};

  /** URL base del pronóstico y del histórico reciente de Open-Meteo. */
  const URL_PRONOSTICO = 'https://api.open-meteo.com/v1/forecast';

  /** Zona horaria de las consultas; las fechas y horas llegan en hora local. */
  const ZONA_HORARIA = 'America/Santiago';

  /** Variables de condiciones actuales solicitadas. */
  const VARIABLES_ACTUALES = [
    'temperature_2m', 'relative_humidity_2m', 'apparent_temperature', 'is_day',
    'precipitation', 'weather_code', 'cloud_cover', 'pressure_msl',
    'wind_speed_10m', 'wind_direction_10m', 'wind_gusts_10m'
  ];

  /** Variables diarias solicitadas (máximas, mínimas, lluvia, viento, UV, etc.). */
  const VARIABLES_DIARIAS = [
    'weather_code', 'temperature_2m_max', 'temperature_2m_min',
    'apparent_temperature_max', 'apparent_temperature_min', 'sunrise', 'sunset',
    'uv_index_max', 'precipitation_sum', 'precipitation_probability_max',
    'wind_speed_10m_max', 'wind_gusts_10m_max'
  ];

  /**
   * Extrae la parte horaria "HH:mm" de una cadena ISO local ("2026-10-28T07:12").
   * @param {string} iso Fecha y hora en formato ISO local.
   * @returns {string} Hora en formato "HH:mm" o cadena vacía.
   */
  function extraerHora(iso) {
    return iso ? iso.slice(11, 16) : '';
  }

  /**
   * Convierte la respuesta cruda de Open-Meteo en un objeto simple para la interfaz.
   * Con `past_days=1` y `forecast_days=5`, la lista diaria empieza con ayer,
   * seguido de hoy y de los 4 días siguientes.
   * @param {Object} data Respuesta JSON de Open-Meteo.
   * @returns {{obtenido: Date, actual: Object, ayer: Object|null, hoy: Object, pronostico: Array<Object>}}
   */
  function normalizar(data) {
    const c = data.current;
    const d = data.daily;

    const dias = d.time.map((fecha, i) => ({
      fecha,
      codigo: d.weather_code[i],
      tempMax: d.temperature_2m_max[i],
      tempMin: d.temperature_2m_min[i],
      sensacionMax: d.apparent_temperature_max[i],
      sensacionMin: d.apparent_temperature_min[i],
      amanecer: extraerHora(d.sunrise[i]),
      atardecer: extraerHora(d.sunset[i]),
      uvMax: d.uv_index_max[i],
      lluvia: d.precipitation_sum[i],
      probLluvia: d.precipitation_probability_max[i],
      vientoMax: d.wind_speed_10m_max[i],
      rachasMax: d.wind_gusts_10m_max[i]
    }));

    const fechaHoy = c.time.slice(0, 10);
    const indiceHoy = Math.max(0, dias.findIndex(dia => dia.fecha === fechaHoy));

    return {
      obtenido: new Date(),
      actual: {
        temp: c.temperature_2m,
        sensacion: c.apparent_temperature,
        humedad: c.relative_humidity_2m,
        esDia: c.is_day === 1,
        lluvia: c.precipitation,
        codigo: c.weather_code,
        nubes: c.cloud_cover,
        presion: c.pressure_msl,
        viento: c.wind_speed_10m,
        vientoDir: c.wind_direction_10m,
        rachas: c.wind_gusts_10m,
        hora: extraerHora(c.time)
      },
      ayer: indiceHoy > 0 ? dias[indiceHoy - 1] : null,
      hoy: dias[indiceHoy],
      pronostico: dias.slice(indiceHoy + 1, indiceHoy + 5)
    };
  }

  /**
   * Obtiene el clima de una coordenada desde Open-Meteo.
   * @param {number} lat Latitud de la localidad.
   * @param {number} lon Longitud de la localidad.
   * @returns {Promise<Object>} Datos normalizados (ver `normalizar`).
   * @throws {Error} Si la red falla o la API responde con error.
   */
  async function obtenerClima(lat, lon) {
    const parametros = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      timezone: ZONA_HORARIA,
      current: VARIABLES_ACTUALES.join(','),
      daily: VARIABLES_DIARIAS.join(','),
      past_days: '1',
      forecast_days: '5',
      wind_speed_unit: 'kmh'
    });

    const respuesta = await fetch(`${URL_PRONOSTICO}?${parametros.toString()}`);
    if (!respuesta.ok) {
      throw new Error(`Open-Meteo respondió con HTTP ${respuesta.status}`);
    }

    const data = await respuesta.json();
    if (!data.current || !data.daily) {
      throw new Error('Respuesta de Open-Meteo sin datos de clima');
    }
    return normalizar(data);
  }

  window.Tiempo.API = { obtenerClima };
})();
