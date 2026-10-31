/* Trikaal: Notebook — every AI reading saved per person, with key points pulled out; plus automatic backup to Downloads */
var NB_TOPIC = { health: ['🩺', 'Health'], career: ['💼', 'Career'], money: ['💰', 'Money'], marriage: ['💍', 'Marriage & partner'], family: ['🏠', 'Family'], children: ['👶', 'Children'], education: ['📚', 'Education'], property: ['🏡', 'Property'], travel: ['✈️', 'Travel'], spiritual: ['🕉️', 'Spiritual'], remedy: ['📿', 'Remedies'], personal: ['📝', 'About the person'], general: ['✦', 'General'] };
function nbNotes(pid) { DB.notes = DB.notes || {}; return DB.notes[pid] || (DB.notes[pid] = []); }
function nbIns(pid) { DB.insights = DB.insights || {}; return DB.insights[pid] || (DB.insights[pid] = []); }
function nbId() { return 'n' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36); }
function nbAdd(p, src, q, a) {
  if (!p || !a) return; var L = nbNotes(p.id), n = { id: nbId(), t: Date.now(), src: src, q: String(q).slice(0, 600), a: String(a), star: false };
  L.push(n); while (L.length > 400) L.shift(); save(); nbExtract(p, n); return n;
}
function nbExtract(p, n) {
  if (!hasAI()) return;
  var body = JSON.stringify({ system_instruction: { parts: [{ text: 'NOTEBOOK EXTRACT. You pull out what is worth remembering from an astrology consultation for ' + p.name + ': predictions with dates, cautions, remedies advised (with day and quantity), and real-life facts the person shared. Plain short sentences, keep dates. Return ONLY a JSON array, 1 to 4 items: [{"topic":"health|career|money|marriage|family|children|education|property|travel|spiritual|remedy|personal|general","text":"one sentence"}]. Return [] if nothing is worth keeping.' }] }, contents: [{ role: 'user', parts: [{ text: 'QUESTION: ' + n.q.slice(0, 500) + '\n\nANSWER:\n' + n.a.slice(0, 6000) }] }], generationConfig: { temperature: 0.1, maxOutputTokens: 1200, responseMimeType: 'application/json' } });
  gGenerate(body).then(function (d) {
    var t = gText(d), i = t.indexOf('['), j = t.lastIndexOf(']'), arr = JSON.parse(t.slice(i, j + 1)), I = nbIns(p.id);
    (arr || []).forEach(function (x) { if (x && x.text) I.push({ id: nbId(), t: n.t, topic: NB_TOPIC[x.topic] ? x.topic : 'general', text: String(x.text).slice(0, 400), note: n.id }); });
    while (I.length > 600) I.shift(); save(); if (parts()[0] === 'notebook') rerender(true);
  }).catch(function () { });
}
/* every Claude answer goes into the notebook */
(function () {
  var ag = askGemini;
  askGemini = function (p, c, q, onLive) { return ag(p, c, q, onLive).then(function (r) { try { nbAdd(p, 'chat', q, r.txt); } catch (e) { } return r; }); };
  var ff = fixedFacts;
  fixedFacts = function (p, c) {
    var s = ff(p, c), I = (DB.insights || {})[p.id] || [];
    if (!I.length) return s;
    return s + 'NOTEBOOK: KEY POINTS ALREADY TOLD TO THIS PERSON (stay consistent with them; if the chart now says otherwise, say what changed and why):\n' + I.slice(-15).map(function (x) { return '- [' + N.dmy(new Date(x.t)) + ', ' + x.topic + '] ' + x.text; }).join('\n') + '\n';
  };
})();

/* ---------- Notebook screen ---------- */
function NotebookScreen() {
  var p = curP(); if (!p) return topBar('Notebook', { noPerson: true }) + noPerson();
  var L = nbNotes(p.id), I = nbIns(p.id), tab = U.nbTab || 'points', q = (U.nbQ || '').toLowerCase().trim(), n1 = p.name.split(' ')[0];
  function hit(s) { return !q || String(s).toLowerCase().indexOf(q) >= 0; }
  var h = topBar('Notebook') + '<div class="pad">';
  h += '<div class="card nbhead"><div class="nbstats"><div><b>' + L.length + '</b><small>readings saved</small></div><div><b>' + I.length + '</b><small>key points</small></div><div><b>' + L.filter(function (x) { return x.star; }).length + '</b><small>starred</small></div></div><p class="mut" style="font-size:12.5px;margin:8px 0 0">Every answer Claude gives about ' + esc(n1) + ' is saved here automatically, even if the chat is cleared. Key points are pulled out and reminded to the AI, so later answers stay consistent.</p></div>';
  h += '<input class="inp" id="nbSearch" data-in="nbQ" placeholder="Search the notebook…" value="' + esc(U.nbQ || '') + '" style="margin-bottom:10px">';
  h += '<div class="seg nbseg">' + [['points', 'Key points'], ['all', 'All readings'], ['star', '⭐ Starred']].map(function (x) { return '<button class="' + (tab === x[0] ? 'on' : '') + '" data-act="nbTab" data-v="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>';
  if (tab === 'points') {
    var items = I.filter(function (x) { return hit(x.text); }).slice().reverse(), groups = {};
    items.forEach(function (x) { (groups[x.topic] = groups[x.topic] || []).push(x); });
    var keys = Object.keys(NB_TOPIC).filter(function (k) { return groups[k]; });
    h += keys.length ? keys.map(function (k) { return '<div class="card nbgrp"><div class="kgh"><h3>' + NB_TOPIC[k][0] + ' ' + NB_TOPIC[k][1] + '</h3><span class="sm">' + groups[k].length + '</span></div>' + groups[k].map(function (x) { return '<div class="nbpt"><div><p>' + esc(x.text) + '</p><small>' + N.dmy(new Date(x.t)) + (x.note ? ' · <a data-act="nbOpen" data-id="' + x.note + '">open reading ›</a>' : '') + '</small></div><button class="nbx" data-act="nbDelPt" data-id="' + x.id + '">×</button></div>'; }).join('') + '</div>'; }).join('') : '<div class="card"><p class="mut">' + (L.length ? 'Key points are being pulled out from your readings…' : 'Ask anything in the AI tab. Every answer is saved here, and the important points are listed by topic.') + '</p><button class="btn acc wide" data-go="ai">Ask the AI</button></div>';
  } else {
    var list = L.filter(function (x) { return (tab !== 'star' || x.star) && (hit(x.q) || hit(x.a)); }).slice().reverse();
    h += list.length ? list.map(function (x) {
      var open = U.nbOpen === x.id;
      return '<div class="card nbnote' + (open ? ' open' : '') + '" id="nb_' + x.id + '"><div class="nbtop" data-act="nbOpen" data-id="' + x.id + '"><span class="nbsrc ' + x.src + '">' + (x.src === 'health' ? '🩺 Health' : x.src === 'letter' ? '📖 Letter' : '✦ Chat') + '</span><small>' + N.dmy(new Date(x.t)) + ' ' + N.hm(new Date(x.t)) + '</small><button class="nbstar" data-act="nbStar" data-id="' + x.id + '">' + (x.star ? '⭐' : '☆') + '</button><button class="nbdel" data-act="nbDel" data-id="' + x.id + '" aria-label="Delete">🗑</button></div><b class="nbq">' + esc(x.q.split('\n')[0].slice(0, 160)) + '</b>' +
        (open ? '<div class="nbans">' + (typeof aiBubbles === 'function' && x.src === 'chat' ? aiBubbles(x.a) : mdToHtml(x.a)) + '</div><div class="nbact"><button class="btn sec sm" data-act="nbShare" data-id="' + x.id + '">Share</button><button class="btn sec sm" data-act="nbAsk" data-id="' + x.id + '">Ask a follow-up</button><button class="btn sec sm" style="color:var(--bad)" data-act="nbDel" data-id="' + x.id + '">Delete</button></div>' : '<p class="nbprev">' + esc(x.a.replace(/[*#_>`]/g, '').replace(/\s+/g, ' ').slice(0, 170)) + '…</p>') + '</div>';
    }).join('') : '<div class="card"><p class="mut">' + (tab === 'star' ? 'Tap ☆ on a reading to keep it here.' : 'Nothing saved yet.') + '</p></div>';
  }
  if (L.length) h += '<button class="btn sec wide" data-act="nbExport">Share the whole notebook</button>';
  if (L.length || I.length) h += '<button class="btn sec wide" style="color:var(--bad);margin-top:8px" data-act="nbClearAll">Clear this notebook</button>';
  return h + '</div>';
}
INP.nbQ = function (el) { U.nbQ = el.value; var pos = el.selectionStart; rerender(true); var n = $('#nbSearch'); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (e) { } } };
ACT.nbTab = function (el) { U.nbTab = el.dataset.v; rerender(); };
ACT.nbOpen = function (el) { var id = el.dataset.id; if (U.nbTab === 'points' || !U.nbTab) U.nbTab = 'all'; U.nbOpen = U.nbOpen === id ? null : id; rerender(true); setTimeout(function () { var n = document.getElementById('nb_' + id); if (n && U.nbOpen) n.scrollIntoView({ block: 'start' }); }, 30); };
ACT.nbStar = function (el) { var x = nbNotes(curP().id).filter(function (n) { return n.id === el.dataset.id; })[0]; if (x) { x.star = !x.star; save(); rerender(true); } };
ACT.nbDel = function (el) {
  var p = curP(), id = el.dataset.id, x = nbNotes(p.id).filter(function (n) { return n.id === id; })[0]; if (!x) return;
  sheet('<div class="pad"><h3 style="font:600 18px var(--sans);margin:4px 0 6px">Delete this reading?</h3><p class="sm" style="margin-bottom:6px">' + esc(x.q.split('\n')[0].slice(0, 120)) + '</p><p class="sm mut" style="margin-bottom:14px">Its key points are removed too.</p><button class="btn wide" style="background:var(--bad);color:#fff;margin-bottom:8px" data-act="nbDelYes" data-id="' + id + '">Delete</button><button class="btn sec wide" data-act="closeSheetBtn">Cancel</button></div>');
};
ACT.nbDelYes = function (el) {
  var p = curP(), id = el.dataset.id;
  DB.notes = DB.notes || {}; DB.insights = DB.insights || {};
  DB.notes[p.id] = nbNotes(p.id).filter(function (n) { return n.id !== id; });
  DB.insights[p.id] = nbIns(p.id).filter(function (x) { return x.note !== id; });
  if (U.nbOpen === id) U.nbOpen = null;
  save(); closeSheet(); setTimeout(function () { rerender(true); toast('Reading deleted'); }, 30);
};
ACT.nbClearAll = function () {
  var p = curP();
  sheet('<div class="pad"><h3 style="font:600 18px var(--sans);margin:4px 0 6px">Clear ' + esc(p.name.split(' ')[0]) + '\'s notebook?</h3><p class="sm" style="margin-bottom:14px">Deletes all ' + nbNotes(p.id).length + ' readings and ' + nbIns(p.id).length + ' key points for this person. This cannot be undone.</p><button class="btn wide" style="background:var(--bad);color:#fff;margin-bottom:8px" data-act="nbClearYes">Clear notebook</button><button class="btn sec wide" data-act="closeSheetBtn">Cancel</button></div>');
};
ACT.nbClearYes = function () { var p = curP(); DB.notes = DB.notes || {}; DB.insights = DB.insights || {}; DB.notes[p.id] = []; DB.insights[p.id] = []; U.nbOpen = null; save(); closeSheet(); setTimeout(function () { rerender(true); toast('Notebook cleared'); }, 30); };
ACT.nbDelPt = function (el) { var p = curP(), id = el.dataset.id; DB.insights = DB.insights || {}; DB.insights[p.id] = nbIns(p.id).filter(function (x) { return x.id !== id; }); save(); rerender(true); toast('Key point removed'); };
ACT.nbShare = function (el) { var p = curP(), x = nbNotes(p.id).filter(function (n) { return n.id === el.dataset.id; })[0]; if (x) shareText('Trikaal · ' + p.name, x.q + '\n\n' + x.a.replace(/\*\*/g, '*')); };
ACT.nbAsk = function (el) { var p = curP(), x = nbNotes(p.id).filter(function (n) { return n.id === el.dataset.id; })[0]; if (!x) return; go('ai'); setTimeout(function () { var t = $('#askIn'); if (t) { t.value = 'Follow-up on "' + x.q.split('\n')[0].slice(0, 80) + '": '; t.focus(); } }, 150); };
ACT.nbExport = function () { var p = curP(), I = nbIns(p.id); shareText('Trikaal notebook · ' + p.name, 'Key points for ' + p.name + '\n' + Object.keys(NB_TOPIC).map(function (k) { var g = I.filter(function (x) { return x.topic === k; }); return g.length ? '\n' + NB_TOPIC[k][1] + ':\n' + g.map(function (x) { return '• ' + x.text + ' (' + N.dmy(new Date(x.t)) + ')'; }).join('\n') : ''; }).join('') + '\n\nCalculated with Trikaal.'); };

/* routes and entry points */
(function () {
  var r0 = render;
  render = function () {
    if (parts()[0] === 'notebook') {
      applySettings(); var html; try { html = NotebookScreen(); } catch (e) { html = '<div class="empty"><h2>Something went wrong</h2>' + esc(e.message) + '</div>'; }
      $('#app').innerHTML = html; $('#nav').innerHTML = NAVS.map(function (x) { return '<button data-go="' + x[0] + '" class="' + (x[0] === 'ai' ? 'on' : '') + '">' + icon(x[0]) + x[1] + '</button>'; }).join('');
      document.body.classList.remove('asking'); var ap = $('#askbar'); if (ap) ap.classList.add('hide'); try { if (isTr()) hiApply(true); } catch (e) { }
      return;
    }
    r0();
  };
  var a0 = AiV2;
  AiV2 = function () { return a0().replace('<span class="gem">', '<button class="v2ib nbbtn" data-go="notebook" aria-label="Notebook">📒</button><span class="gem">'); };
  var s0 = AstroV2;
  AstroV2 = function (id) {
    var h = s0(id), p = curP(), mk = '<div class="kpair" style="margin-top:10px"><button class="kentry k5"'; if (!p || h.indexOf(mk) < 0) return h;
    var n = nbNotes(p.id).length, k = nbIns(p.id).length;
    var i = h.indexOf(mk), j = h.indexOf('</div>', h.indexOf('</button>', h.indexOf('kentry k6', i))) + 6;
    return h.slice(0, j) + '<button class="kentry k7" data-go="notebook"><span class="kei">📒</span><div><b>Notebook</b><small>' + (n ? n + ' readings and ' + k + ' key points saved' : 'Every AI reading is saved here automatically') + '</small></div><span>›</span></button>' + h.slice(j);
  };
})();
/* ---------- automatic backup to Download/Trikaal ---------- */
function backupData() { var d = new Date(), data = JSON.parse(JSON.stringify(DB)); data.settings.key = ''; data.settings.gkey = ''; data.settings.ckey = ''; delete data.ailog; data.exported = d.toISOString(); return JSON.stringify(data); }
function autoBackup(force) {
  if (!(AND && AND.saveToDownloads)) return;
  if (DB.settings.autoBackup === false && !force) return;
  if (!force && DB.settings.lastAuto && Date.now() - DB.settings.lastAuto < 20 * 3600e3) return;
  try {
    var r = AND.saveToDownloads('Trikaal-backup.json', backupData());
    if (/^ok:/.test(r)) { DB.settings.lastAuto = Date.now(); DB.settings.lastAutoWhere = r.slice(3); save(); if (force) toast('Backup saved to ' + r.slice(3), 3500); }
    else if (force) toast('Backup failed: ' + r.replace(/^err:/, ''), 4000);
  } catch (e) { if (force) toast('Backup failed: ' + e.message, 4000); }
}
function autoBackupLine() {
  if (!(AND && AND.saveToDownloads)) return '<p class="note">Automatic backup works in the Android app (update to the latest version).</p>';
  var on = DB.settings.autoBackup !== false, t = DB.settings.lastAuto;
  return '<div class="abk"><div><b>Automatic daily backup</b><small>' + (t ? 'Last: ' + N.dmy(new Date(t)) + ' ' + N.hm(new Date(t)) + ' → ' + esc(DB.settings.lastAutoWhere || '') : 'Saves Trikaal-backup.json in Download/Trikaal once a day. It stays even if the app is uninstalled; restore it with "Restore from file".') + '</small></div><button class="btn sec sm" data-act="abkToggle">' + (on ? 'On' : 'Off') + '</button></div><button class="btn sec wide" data-act="abkNow">Back up now</button>';
}
ACT.abkToggle = function () { DB.settings.autoBackup = DB.settings.autoBackup === false; save(); rerender(true); };
ACT.abkNow = function () { autoBackup(true); rerender(true); };
setTimeout(function () { autoBackup(false); }, 5000);
