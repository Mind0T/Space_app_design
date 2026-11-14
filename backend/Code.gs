/**
 * ORBITAL · Backend para "Aterrizar el reto" y "Mapa de empatía"
 * NASA Space Apps CDMX 2026 · Equipo Tacos de Asada
 *
 * Qué hace: guarda y entrega, desde un Google Sheet, lo que el equipo
 * escribe en las páginas (aterrizar.html y empatia.html). Cada quien llena
 * desde su compu o celular y todo cae en la misma hoja, casi en tiempo real.
 *
 * Cómo se instala (resumen; pasos completos en backend-setup.md):
 *   1. Crea un Google Sheet nuevo.
 *   2. Extensiones -> Apps Script. Pega TODO este archivo.
 *   3. Implementar -> Nueva implementación -> Aplicación web.
 *        Ejecutar como: Yo.   Quién tiene acceso: Cualquier persona.
 *   4. Copia la URL que termina en /exec y pégala en la página
 *      (botón ⚙️ "Conectar") o pásasela a tu asistente para dejarla fija.
 */

var SHEET_NAME = 'Datos';
var HEADERS = ['ts', 'room', 'tool', 'id', 'zone', 'author', 'key', 'value', 'votes'];

function doGet(e)  { return handle_(e); }
function doPost(e) { return handle_(e); }

function handle_(e) {
  var lock = LockService.getScriptLock();
  try { lock.waitLock(25000); } catch (err) { return out_({ ok: false, error: 'busy' }); }
  try {
    var sh = sheet_();
    var p = (e && e.parameter) ? e.parameter : {};
    var body = {};
    if (e && e.postData && e.postData.contents) {
      try { body = JSON.parse(e.postData.contents); } catch (_) {}
    }
    var op   = String(body.op   || p.op   || 'read');
    var room = String(body.room || p.room || 'default');

    if (op === 'ping') return out_({ ok: true, pong: true });

    if (op === 'read') {
      var tool = body.tool || p.tool || '';
      return out_({ ok: true, rows: read_(sh, room, tool) });
    }
    if (op === 'set') {
      upsert_(sh, room, body.tool || 'aterrizar', String(body.key || ''),
              body.value == null ? '' : String(body.value), String(body.author || ''));
      return out_({ ok: true });
    }
    if (op === 'bulkset') {
      var items = body.items || [];
      for (var i = 0; i < items.length; i++) {
        upsert_(sh, room, body.tool || 'aterrizar', String(items[i].key || ''),
                items[i].value == null ? '' : String(items[i].value), String(body.author || ''));
      }
      return out_({ ok: true, n: items.length });
    }
    if (op === 'add') { // sticky del mapa de empatía
      var id = body.id || Utilities.getUuid();
      sh.appendRow([new Date(), room, body.tool || 'empatia', id, String(body.zone || ''),
                    String(body.author || ''), '', String(body.value || ''), 0]);
      return out_({ ok: true, id: id });
    }
    if (op === 'vote') {
      voteDelta_(sh, room, String(body.id || ''), (Number(body.delta) === -1 ? -1 : 1));
      return out_({ ok: true });
    }
    if (op === 'del') {
      delById_(sh, room, String(body.id || ''));
      return out_({ ok: true });
    }
    return out_({ ok: false, error: 'op desconocida: ' + op });
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) { sh = ss.insertSheet(SHEET_NAME); sh.appendRow(HEADERS); }
  if (sh.getLastRow() === 0) sh.appendRow(HEADERS);
  return sh;
}

function data_(sh) {
  var lr = sh.getLastRow();
  if (lr < 2) return [];
  return sh.getRange(2, 1, lr - 1, HEADERS.length).getValues();
}

function read_(sh, room, tool) {
  var rows = data_(sh), out = [];
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    if (String(r[1]) !== room) continue;
    if (tool && String(r[2]) !== tool) continue;
    out.push({ ts: r[0], tool: r[2], id: r[3], zone: r[4], author: r[5], key: r[6], value: r[7], votes: r[8] });
  }
  return out;
}

function upsert_(sh, room, tool, key, value, author) {
  if (!key) return;
  var rows = data_(sh);
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    if (String(r[1]) === room && String(r[2]) === tool && String(r[6]) === key) {
      var ri = i + 2;
      sh.getRange(ri, 1).setValue(new Date());
      sh.getRange(ri, 6).setValue(author);
      sh.getRange(ri, 8).setValue(value);
      return;
    }
  }
  sh.appendRow([new Date(), room, tool, '', '', author, key, value, '']);
}

function voteDelta_(sh, room, id, delta) {
  if (!id) return;
  var rows = data_(sh);
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    if (String(r[1]) === room && String(r[3]) === id) {
      var ri = i + 2, v = Number(r[8]) || 0;
      sh.getRange(ri, 9).setValue(Math.max(0, v + delta));
      sh.getRange(ri, 1).setValue(new Date());
      return;
    }
  }
}

function delById_(sh, room, id) {
  if (!id) return;
  var rows = data_(sh);
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    if (String(r[1]) === room && String(r[3]) === id) { sh.deleteRow(i + 2); return; }
  }
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
