# Conectar las páginas con Google Sheets (5 minutos)

Esto permite que **cada quien llene el ejercicio desde su compu o celular** y todo
caiga en la **misma hoja de Google**, casi en tiempo real. Lo hace **una sola persona**
del equipo y comparte la URL.

## Paso a paso

1. **Crea un Google Sheet nuevo** (hoja en blanco). Puedes nombrarlo `ORBITAL · Datos`.
2. En el menú: **Extensiones → Apps Script**.
3. Borra lo que haya y **pega todo el contenido de `Code.gs`** (está en esta carpeta). Guarda (💾).
4. Arriba a la derecha: **Implementar → Nueva implementación**.
   - Tipo (⚙️): **Aplicación web**.
   - **Ejecutar como:** Yo (tu cuenta).
   - **Quién tiene acceso:** **Cualquier persona**.
   - Clic en **Implementar**. Autoriza los permisos cuando lo pida
     (es tu propio script sobre tu propia hoja).
5. Copia la **URL de la aplicación web** (termina en **`/exec`**).

## Pegar la URL en las páginas

En `aterrizar.html` o `empatia.html`, abre el botón **⚙️ Conectar** (barra superior):
- Pega la URL `/exec`.
- Pon **tu nombre** y el **equipo** (déjalo en `tacos-de-asada` para todos).
- Clic en **Probar y guardar**. Si marca **Conectado ✓**, listo.

> Para que **todo el equipo quede conectado sin pegar nada**, pásale esa URL `/exec`
> a tu asistente y la dejamos fija en el código (constante `HARDCODED_ENDPOINT` en `sync.js`).
> Mientras tanto, cada quien puede pegarla una vez en el ⚙️.

## Cómo queda la hoja

Se crea sola una pestaña **`Datos`** con estas columnas:

`ts · room · tool · id · zone · author · key · value · votes`

- **tool** = `aterrizar` o `empatia`.
- **room** = el equipo (para separar datos si hubiera varios grupos).
- Campos del taller (canvas, preguntas, etc.) → una fila por campo (`key`/`value`),
  se **actualiza** cuando alguien lo cambia (gana el último en escribir).
- Notas del mapa de empatía → una fila por nota (con `zone`, `author`, `votes`).

Puedes leer y editar esa hoja directamente en Google en cualquier momento; es el
insumo para empezar a prototipar.

## Si algo no conecta

- Revisa que la implementación sea **Aplicación web** con acceso **Cualquier persona**.
- Si editas `Code.gs`, vuelve a **Implementar → Gestionar implementaciones → ✎ →
  Nueva versión** para que los cambios tomen efecto.
- La URL correcta termina en **`/exec`** (no `/dev`).
- Primer guardado: Google pide autorización una vez; acéptala.

## Privacidad

Cualquiera con la URL `/exec` puede escribir en la hoja, pero **la URL no está
publicada en ningún lado**: solo la tiene el equipo. No pongas datos personales
sensibles ahí.
