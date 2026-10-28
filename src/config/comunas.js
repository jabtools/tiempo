/**
 * Localidades de Santiago (Chile) disponibles en la aplicación.
 * Las coordenadas son aproximadas y se usan para consultar la API de Open-Meteo.
 * Se expone como `window.Tiempo.Comunas`.
 */
(function () {
  window.Tiempo = window.Tiempo || {};

  /**
   * Lista de localidades seleccionables.
   * @type {Array<{id: string, nombre: string, lat: number, lon: number}>}
   */
  window.Tiempo.Comunas = [
    { id: 'santiago', nombre: 'Santiago Centro', lat: -33.4489, lon: -70.6693 },
    { id: 'providencia', nombre: 'Providencia', lat: -33.4260, lon: -70.6100 },
    { id: 'las-condes', nombre: 'Las Condes', lat: -33.4089, lon: -70.5679 },
    { id: 'vitacura', nombre: 'Vitacura', lat: -33.3930, lon: -70.5740 },
    { id: 'nunoa', nombre: 'Ñuñoa', lat: -33.4569, lon: -70.5977 },
    { id: 'la-florida', nombre: 'La Florida', lat: -33.5227, lon: -70.5976 },
    { id: 'puente-alto', nombre: 'Puente Alto', lat: -33.6117, lon: -70.5758 },
    { id: 'maipu', nombre: 'Maipú', lat: -33.5099, lon: -70.7575 },
    { id: 'pudahuel', nombre: 'Pudahuel', lat: -33.4433, lon: -70.7417 },
    { id: 'san-miguel', nombre: 'San Miguel', lat: -33.4978, lon: -70.6510 }
  ];
})();
