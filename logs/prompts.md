# Log de prompts y cambios

## 2026-10-27 | agente: plan (claude-haiku-5-5)
- **Prompt:** Describir la aplicación de clima y proponer un borrador de `AGENTS.md` con las reglas solicitadas.
- **Cambios:** Ninguno (modo plan). Se propuso el borrador de `AGENTS.md`.

## 2026-10-27 | agente: plan (claude-haiku-5-5)
- **Prompt:** Decisiones: log en `prompts.md`, Open-Meteo, arquitectura A (HTML/JS puro), implementar todo.
- **Cambios:** Ninguno (modo plan).

## 2026-10-28 00:04 | agente: build (claude-haiku-5-5)
- **Prompt:** Respuestas del usuario: 1) log en `prompts.md`; 2) confirmado el borrador de `AGENTS.md`; 3) arquitectura A (HTML/JS puro, Open-Meteo); 4) "implementar todo".
- **Cambios:** Ninguno en archivos; se registran las decisiones.

## 2026-10-28 00:04 | agente: build (claude-haiku-5-5)
- **Prompt:** Crear `AGENTS.md` y el log de prompts; implementar la aplicación completa.
- **Cambios:**
  - Creados `AGENTS.md` y `logs/prompts.md`.
  - Creados `src/index.html`, `src/app.js`, `src/styles/main.css`.
  - Creados `src/config/comunas.js` (10 comunas con coordenadas), `src/api/openmeteo.js` (cliente Open-Meteo y normalización de datos), `src/ui/iconos.js` (códigos WMO → icono), `src/ui/render.js` (secciones Hoy, Ayer, Próximos 4 días).
  - Creados `src/i18n/es.js` y `src/i18n/en.js`.
  - Creado `README.md`.
  - Verificada la sintaxis de los scripts con `node --check` (sin errores).
  - Ajustado `AGENTS.md`: se quitó la referencia a geocodificación, que no se usa.
  - Corregido en `src/ui/render.js` y `src/app.js` para mostrar el nombre de la localidad en la sección de hoy.

## 2026-10-28 00:18 (aprox.) | agente: build (claude-haiku-5-5)
- **Prompt:** Agregar y mejorar el proceso: siempre probar en navegador con Providencia y Pudahuel, en español e inglés; incluir la regla en `AGENTS.md`; al final, validar si se hace commit.
- **Cambios:**
  - `AGENTS.md`: nuevas secciones "Verificación obligatoria" (reglas 10-13) y "Cierre de entrega" (regla 14).
  - Creados `tests/probar-navegador.js` (prueba con Chrome/Edge headless) y `.gitignore` (ignora `tests/capturas/`, `.env`).
  - Resultado de la prueba: 4/4 combinaciones pasan (sin errores de consola, textos correctos, sin claves sin traducir).

## 2026-10-28 00:19 | agente: build (claude-haiku-5-5)
- **Prompt:** Confirmación de cambios anteriores; capturas fuera de Git; hacer commit si las pruebas son exitosas.
- **Cambios:** Se hace commit de la versión inicial.
- **Defectos conocidos (pendientes, no corregidos):**
  - El fondo de `body` usa `background-attachment: fixed`: bajo "Próximos 4 días" se ve blanco y el texto no se lee en la captura de página completa. Corrección propuesta: quitar `fixed` y usar `min-height: 100vh`.
  - Las fechas largas muestran "De" en mayúscula por `text-transform: capitalize`. Corrección propuesta: quitar la transformación CSS y capitalizar solo la primera letra en `render.js`.
  - Propuesta no aprobada: regla de revisión visual de capturas y verificación automática de contraste en la prueba.
