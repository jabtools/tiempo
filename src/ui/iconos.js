/**
 * Traducción de los códigos de condición del tiempo (estándar WMO, usados por Open-Meteo)
 * a una clave de texto (para i18n) y a un icono de emoji.
 * Se expone como `window.Tiempo.Iconos`.
 */
(function () {
  window.Tiempo = window.Tiempo || {};

  /**
   * Tabla código WMO → { clave, dia, noche }.
   * @type {Object<number, {clave: string, dia: string, noche: string}>}
   */
  const TABLA = {};

  /**
   * Registra la misma entrada para varios códigos WMO.
   * @param {number[]} codigos Lista de códigos WMO.
   * @param {string} clave Clave de texto (sin prefijo "cond_").
   * @param {string} dia Icono para horas de día.
   * @param {string} [noche] Icono para horas de noche; por defecto, el de día.
   */
  function registrar(codigos, clave, dia, noche) {
    codigos.forEach(codigo => {
      TABLA[codigo] = { clave, dia, noche: noche || dia };
    });
  }

  registrar([0], 'despejado', '☀️', '🌙');
  registrar([1], 'mayormente_despejado', '🌤️', '🌙');
  registrar([2], 'parcialmente_nublado', '⛅', '☁️');
  registrar([3], 'nublado', '☁️');
  registrar([45, 48], 'niebla', '🌫️');
  registrar([51, 53, 55], 'llovizna', '🌦️');
  registrar([56, 57], 'llovizna_helada', '🌧️');
  registrar([61, 63, 65], 'lluvia', '🌧️');
  registrar([66, 67], 'lluvia_helada', '🌧️');
  registrar([71, 73, 75, 77], 'nieve', '🌨️');
  registrar([80, 81, 82], 'chubascos', '🌦️');
  registrar([85, 86], 'chubascos_nieve', '🌨️');
  registrar([95], 'tormenta', '⛈️');
  registrar([96, 99], 'tormenta_granizo', '⛈️');

  /**
   * Devuelve la clave de condición y el icono para un código WMO.
   * Códigos desconocidos se tratan como nublado.
   * @param {number} codigo Código WMO de la condición.
   * @param {boolean} [esDia=true] Indica si el icono corresponde al día o a la noche.
   * @returns {{clave: string, icono: string}} Clave de texto (sin prefijo) e icono emoji.
   */
  function iconoClima(codigo, esDia) {
    const entrada = TABLA[codigo] || { clave: 'nublado', dia: '☁️', noche: '☁️' };
    return {
      clave: entrada.clave,
      icono: esDia === false ? entrada.noche : entrada.dia
    };
  }

  window.Tiempo.Iconos = { iconoClima };
})();
