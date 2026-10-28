# Clima Santiago

Aplicación local que muestra el clima de localidades de Santiago (Chile) en el navegador:
clima actual, día anterior y pronóstico de los próximos 4 días.

- **Lógica local:** HTML, CSS y JavaScript se ejecutan en el navegador. No requiere servidor propio.
- **Datos externos:** [Open-Meteo](https://open-meteo.com), API REST gratuita, sin API key.
- **Idioma:** español por defecto; botón **English / Español** para cambiar.

## Cómo ejecutarla

Opción rápida: abrir `src/index.html` directamente en el navegador (Chrome, Edge o Firefox).

Alternativa con un servidor estático local (por ejemplo, con Python):

```bash
cd src
python -m http.server 8080
```

Luego visitar `http://localhost:8080`.

## Uso

1. Elegir una localidad en el selector (la elección se recuerda).
2. Pulsar **Actualizar** para volver a consultar los datos. Además, se actualizan solos cada 15 minutos.
3. Usar el botón de idioma para alternar entre español e inglés.

## Estructura

```
src/
├── index.html          Página principal
├── app.js              Estado, eventos y carga de datos
├── config/comunas.js   Localidades de Santiago y sus coordenadas
├── api/openmeteo.js    Cliente de la API Open-Meteo
├── ui/iconos.js        Códigos del tiempo → icono y texto
├── ui/render.js        Construcción de las secciones
├── i18n/es.js          Textos en español
├── i18n/en.js          Textos en inglés
└── styles/main.css     Estilos
```

## Agregar o cambiar localidades

Editar `src/config/comunas.js`. Cada entrada tiene `id`, `nombre`, `lat` y `lon`.

## Notas

- Los datos son pronósticos y mediciones de modelos; pueden diferir de estaciones oficiales.
- Open-Meteo es gratuito para uso no comercial. Revisar sus [condiciones](https://open-meteo.com/en/terms) para otros usos.
- Las reglas de trabajo para agentes de IA están en `AGENTS.md`, y el historial de prompts en `logs/prompts.md`.
