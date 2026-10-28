# AGENTS.md

## Proyecto
Aplicación local de clima para localidades de Santiago (Chile), visualizada en un navegador HTML5.
- La lógica se ejecuta localmente (HTML/CSS/JavaScript sin servidor de aplicación).
- Los datos que no son locales se obtienen vía API REST pública y gratuita: **Open-Meteo** (`api.open-meteo.com`).
- Las localidades son una lista fija de comunas de Santiago con coordenadas (`src/config/comunas.js`).
- Muestra: clima actual, día anterior y pronóstico de 4 días.
- Parámetros: temperatura, sensación térmica, condición de nubes, presión, lluvia, humedad, viento, índice UV, amanecer/atardecer.
- Interfaz con colores accesibles, tipografía legible e iconos por condición climática.
- Idioma por defecto: español. Botón toggle para cambiar a inglés.

## Reglas para agentes
1. **Confirmación previa:** antes de crear, modificar o eliminar cualquier archivo, indicar qué cambiará y en qué archivos fuente, y esperar confirmación explícita del usuario.
2. **Subagentes:** las tareas simples (buscar, leer, renombrar, formatear, redactar textos menores) se delegan a subagentes.
3. **Documentación del código:** todo módulo, función y clase lleva comentarios claros (propósito, parámetros y retorno). Comentarios en español.
4. **Log de prompts:** registrar en `logs/prompts.md` cada prompt solicitado y un resumen de los cambios aplicados, con fecha, hora y agente utilizado. Formato de entrada:
   ```
   ## YYYY-MM-DD HH:mm | agente: <nombre-del-agente>
   - **Prompt:** <texto solicitado por el usuario>
   - **Cambios:** <resumen de archivos creados/modificados>
   ```
5. **Lógica local:** el cálculo, formateo y presentación ocurren en el navegador. Solo los datos climáticos y de geocodificación se piden a APIs externas.
6. **Traducción:** todo texto visible va en el diccionario de i18n (`es`, `en`). No se permiten cadenas literales en la UI.
7. **Secretos:** Open-Meteo no requiere API key. Si en el futuro se usa una, va en un archivo `.env` (ignorado por Git), nunca en el código ni en el log.
8. **Compatibilidad con `file://`:** los scripts se cargan como scripts clásicos (no `type="module"`), para que `index.html` funcione abriéndose directamente en el navegador.
9. **Sin dependencias:** no añadir librerías, frameworks ni herramientas de build sin confirmación.

## Verificación obligatoria
10. **Prueba en navegador:** toda entrega se prueba en un navegador real (Chrome o Edge, modo headless) con `node tests/probar-navegador.js` antes de presentarla.
11. **Cobertura mínima:** las localidades **Providencia** y **Pudahuel**, en **español** e **inglés** (4 combinaciones). Cada prueba usa los controles reales (selector de localidad y botón de idioma) y verifica: sin errores de consola, secciones Ahora / Ayer / Próximos 4 días visibles, 4 días de pronóstico, textos en el idioma correcto, sin claves i18n sin traducir y captura de pantalla.
12. **Fallos:** si alguna prueba falla, la entrega no se presenta como terminada. Se corrige el problema y se repite la batería completa.
13. **Capturas:** se guardan en `tests/capturas/`, carpeta ignorada por Git. Nunca se suben al repositorio.

## Cierre de entrega
14. **Commit:** si todas las pruebas pasan, se hace commit de la versión con un mensaje en español que describe los cambios. Si alguna prueba falla, no se hace commit. Al terminar se informa el hash del commit.

## Convenciones técnicas
- Código fuente en `src/`; estilos en `src/styles/`; i18n en `src/i18n/`; configuración en `src/config/`; cliente de API en `src/api/`; componentes de interfaz en `src/ui/`.
- Nombres de archivos en minúsculas con guiones.
- Espacio de nombres global único por módulo (`window.Tiempo.<Modulo>`).
- Zona horaria de las consultas: `America/Santiago`.

## Estructura
```
tiempo/
├── AGENTS.md
├── README.md
├── logs/
│   └── prompts.md
└── src/
    ├── index.html
    ├── app.js            (orquestación y estado)
    ├── config/
    │   └── comunas.js    (localidades de Santiago con coordenadas)
    ├── api/
    │   └── openmeteo.js  (cliente de pronóstico Open-Meteo)
    ├── i18n/
    │   ├── es.js
    │   └── en.js
    ├── ui/
    │   ├── iconos.js     (códigos WMO → icono y clave de texto)
    │   └── render.js     (renderizado de secciones)
    └── styles/
        └── main.css
```
