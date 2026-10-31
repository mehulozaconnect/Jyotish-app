/* Trikaal app: More (settings, Claude, backup, about) and boot */
function MoreScreen() {
  var s = DB.settings, h = '<div class="top">' + LOGO + '<span class="ttl">More</span></div><div class="pad">';
  if (typeof langCard === 'function') h += langCard();
  if (typeof aiCard === 'function') h += aiCard();
  h += '<div class="card"><h3>Calculation</h3>' +
    '<div class="field"><span>AYANAMSA</span>' + sel('setAyan', Object.keys(C.AYAN_INFO).map(function (k) { return [k, C.AYAN_INFO[k].name]; }), s.ayan) + '</div>' +
    '<div class="grid2"><div class="field"><span>RAHU / KETU</span>' + sel('setNode', [['mean', 'Mean node'], ['true', 'True node']], s.node) + '</div><div class="field"><span>DASHA YEAR</span>' + sel('setDyear', [[365.25, '365.25 days'], [365.2422, '365.2422 (tropical)'], [360, '360 days (savana)']], s.dyear) + '</div></div>' +
    '<div class="field" style="margin-bottom:0"><span>CHART STYLE</span>' + sel('setStyle', [['north', 'North Indian'], ['south', 'South Indian']], s.style) + '</div>' +
    '<div class="note">KP screens always use the KP (Krishnamurti) ayanamsa. Houses: whole sign for Parashari, Placidus for KP and Chalit.</div></div>';
  h += '<div class="card"><h3>Location for Today</h3><div class="row"><div><b>' + esc(s.loc.name) + '</b><div class="mut" style="font-size:12px">' + (+s.loc.lat).toFixed(4) + ', ' + (+s.loc.lon).toFixed(4) + ' · ' + esc(s.loc.tz) + ' · ' + fmtOff(locOff()) + '</div></div><button class="btn sec sm" data-act="pickLoc">Change</button></div></div>';
  h += '<div class="card"><h3>AI: Gemini</h3><p style="font-size:12.8px;margin-bottom:10px">Answers in the AI tab use your Gemini key with a full evidence sheet from the chart (D1, divisional chart, D9, all 5 dasha levels, aspects, transits, Ashtakavarga). The key stays on this phone.</p>' +
    '<label class="field"><span>GEMINI API KEY</span><input class="inp mono" type="password" data-in="setGkey" value="' + esc(s.gkey || '') + '" placeholder="AIza..." autocomplete="off"></label>' +
    '<div class="field"><span>MODEL</span>' + sel('setGmodel', gModelOpts(), s.gmodel || GDEFAULT) + '</div>' +
    '<label class="field"><span>OR TYPE A MODEL NAME</span><input class="inp mono" data-in="setGmodelTxt" value="' + esc(s.gmodel || '') + '" placeholder="' + GDEFAULT + '"></label>' +
    '<div class="field"><span>ANSWER STYLE</span>' + sel('setGfast', [['0', 'Deep: most careful reasoning (slower)'], ['1', 'Fast: quicker answers, lighter reasoning']], s.gfast ? '1' : '0') + '</div>' +
    '<button class="btn sec wide" data-act="testGkey">Test the key and find the best model</button>' +
    '<div class="note">The test checks which Gemini models your key can use and picks the newest Pro model. On a free key Google gives no Pro quota, so the app uses the newest Flash model instead. If Google retires a model, the app switches by itself.</div></div>';
  h += '<div class="card"><h3>Reminders</h3><button class="btn sec wide" data-go="reminders">Reminders and alerts</button></div>';
  h += '<div class="card"><h3>People</h3><button class="btn sec wide" data-go="people">Manage people and kundlis</button></div>';
  h += '<div class="card"><h3>Your data</h3><p style="font-size:12.8px;margin-bottom:10px">' + DB.people.length + ' kundlis are stored only on this phone. Make a backup file before changing phones.</p><div class="grid2"><button class="btn" data-act="backup">Backup</button><button class="btn sec" data-act="restore">Restore</button></div></div>';
  h += '<div class="card"><h3>Accuracy</h3><p style="font-size:12.8px">Planet and lagna positions are checked against Swiss Ephemeris (the engine used by Jagannatha Hora and most professional software): planets within a few arc-seconds, lagna within arc-seconds for a correct birth time. Panchang ends, dashas and transits come from the same engine. Readings and remedies follow classical rules and show their logic; like any astrology, they are interpretations, not certainties.</p></div>';
  h += '<div class="card"><h3>About</h3><p style="font-size:12.8px">Trikaal ' + APP_VERSION + '. Parashari, KP, Tajik and Muhurat in one place, offline. Built for Mehul.</p><div class="grid2" style="margin-top:10px"><button class="btn sec" data-act="printNow">' + icon('print', 16) + 'Print / PDF</button><button class="btn sec" data-act="sampleData">Add sample</button></div></div>';
  return h + '</div>';
}
var APP_VERSION = '3.3.0';
INP.setGkey = function (el) { DB.settings.gkey = el.value.trim(); DB.settings.gnoPro = false; DB.settings.gbad = []; save(); };
CHG.setGfast = function (el) { DB.settings.gfast = el.value === '1'; save(); toast(DB.settings.gfast ? 'Fast answers on' : 'Deep answers on'); };
CHG.setGmodel = function (el) { DB.settings.gmodel = el.value; if (/-pro/.test(el.value)) DB.settings.gnoPro = false; save(); };
INP.setGmodelTxt = function (el) { if (el.value.trim()) { DB.settings.gmodel = el.value.trim(); save(); } };
function gModelOpts() {
  var list = (DB.settings.gmodels && DB.settings.gmodels.length ? DB.settings.gmodels : [GDEFAULT, 'gemini-3-flash-preview']).filter(function (n) { return gRank(n, 'flash') > 0; }).slice(0, 12), cur = DB.settings.gmodel || GDEFAULT;
  if (list.indexOf(cur) < 0) list = [cur].concat(list);
  var best = gBest(list, DB.settings.gnoPro ? 'flash' : 'pro');
  return list.map(function (n) { return [n, n + (n === best ? '  (best)' : '') + ((DB.settings.gbad || []).indexOf(n) >= 0 ? '  (no free quota)' : '')]; });
}
/* Test: list the key's models, then try them best-first until one actually answers; save that one */
ACT.testGkey = function () {
  if (!DB.settings.gkey) return toast('Paste your Gemini key first');
  toast('Checking which models your key can use…', 2500);
  var ping = JSON.stringify({ contents: [{ role: 'user', parts: [{ text: 'Reply with the single word OK.' }] }] }), busy = [];
  gListModels().then(function (list) {
    var want = DB.settings.gnoPro ? 'flash' : 'pro';
    var cands = list.filter(function (n) { return gRank(n, want) > 0; }).sort(function (a, b) { return gRank(b, want) - gRank(a, want); }).slice(0, 7);
    if (!cands.length) throw new Error('No Gemini text models are available for this key');
    var i = 0;
    function next() {
      if (i >= cands.length) { if (busy.length) { DB.settings.gmodel = busy[0]; save(); return busy[0] + ' (busy now, try again shortly)'; } throw new Error('None of your models have free quota. Check the key in Google AI Studio.'); }
      var m = cands[i++];
      return gCall(m, ping).then(function (x) {
        if (x.status === 200) { DB.settings.gmodel = m; save(); return m; }
        if (x.status === 429 && /limit: 0/i.test(x.msg)) { DB.settings.gbad = uniqA((DB.settings.gbad || []).concat([m])); if (/-pro/.test(m)) DB.settings.gnoPro = true; save(); }
        else if (gBusy(x)) busy.push(m);
        return next();
      });
    }
    return next();
  }).then(function (m) { toast('Gemini works ✓ using ' + m, 4000); if (parts()[0] === 'more') rerender(); })
    .catch(function (e) { toast('Test failed: ' + e.message, 5000); if (parts()[0] === 'more') rerender(); });
};
function resetCache() { CACHE = {}; }
CHG.setAyan = function (el) { DB.settings.ayan = el.value; save(); resetCache(); toast('Ayanamsa: ' + C.AYAN_INFO[el.value].name); };
CHG.setNode = function (el) { DB.settings.node = el.value; save(); resetCache(); };
CHG.setDyear = function (el) { DB.settings.dyear = +el.value; save(); resetCache(); };
CHG.setStyle = function (el) { DB.settings.style = el.value; U.style = null; save(); };
INP.setKey = function (el) { DB.settings.key = el.value.trim(); save(); };
CHG.setModel = function (el) { DB.settings.model = el.value; save(); };
ACT.toggleDeep = function (el) { DB.settings.deep = !DB.settings.deep; save(); el.classList.toggle('on', DB.settings.deep); };
ACT.testKey = function () {
  if (!DB.settings.key) return toast('Paste your API key first');
  toast('Testing…', 1200);
  http('POST', 'https://api.anthropic.com/v1/messages', { 'content-type': 'application/json', 'x-api-key': DB.settings.key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' }, JSON.stringify({ model: DB.settings.model, max_tokens: 20, messages: [{ role: 'user', content: 'Reply with the single word OK.' }] }))
    .then(function (r) { if (r.status === 200) toast('Key works ✓'); else { var m = ''; try { m = JSON.parse(r.text).error.message; } catch (e) { } toast('Error ' + r.status + (m ? ': ' + m : ''), 4000); } })
    .catch(function (e) { toast('No connection: ' + e.message, 3500); });
};
ACT.backup = function () {
  var d = new Date(), name = 'trikaal-backup-' + d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + '.json';
  var data = JSON.parse(JSON.stringify(DB)); data.settings.key = ''; data.settings.gkey = ''; data.settings.ckey = ''; delete data.ailog; data.exported = d.toISOString();
  saveFile(name, 'application/json', JSON.stringify(data, null, 1));
};
ACT.restore = function () {
  openFile(function (text) {
    try {
      var d = JSON.parse(text); if (!d.people) throw new Error('Not a Trikaal backup');
      var ids = DB.people.map(function (p) { return p.id; }), added = 0;
      d.people.forEach(function (p) { var i = ids.indexOf(p.id); if (i >= 0) DB.people[i] = p; else { DB.people.push(p); added++; } });
      (d.remedies || []).forEach(function (r) { DB.remedies = DB.remedies || []; if (!DB.remedies.some(function (x) { return x.id === r.id; })) DB.remedies.push(r); });
      Object.keys(d.chats || {}).forEach(function (k) { if (!DB.chats[k]) DB.chats[k] = d.chats[k]; });
      if (!DB.settings.meId && d.settings && d.settings.meId) DB.settings.meId = d.settings.meId;
      save(); resetCache(); toast('Restored ' + d.people.length + ' kundlis (' + added + ' new)'); rerender();
    } catch (e) { toast('Could not restore: ' + e.message, 3500); }
  });
};
ACT.printNow = function () { printPage(); };
ACT.sampleData = function () {
  if (DB.people.some(function (p) { return p.id === 'sample1'; })) return toast('Sample already added');
  DB.people.push({ id: 'sample1', name: 'Rahul Shah (sample)', gender: 'M', date: '1990-07-04', time: '14:15:00', place: 'Delhi', lat: 28.6139, lon: 77.209, zone: 'Asia/Kolkata', tz: 5.5, notes: 'Sample chart for trying the app', events: [{ type: 'accident', date: '2026-07-15', time: '11:30' }], created: Date.now() });
  save(); toast('Sample kundli added'); go('people');
};

/* ---------- boot ---------- */
(function boot() {
  load(); applySettings();
  var t = $('#askIn');
  t.addEventListener('input', function () { t.style.height = ''; t.style.height = Math.min(120, t.scrollHeight) + 'px'; });
  t.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); ACT.askSend(); } });
  window.trikaalBack = function () { if ($('#scrim')) { closeSheet(); return 'true'; } var p = parts(); if (!p.length || ['astro', 'panchang', 'dasha', 'remedies', 'ai'].indexOf(p[0]) >= 0 && p.length < 2) return 'false'; history.back(); return 'true'; };
  try { scheduleAll(); } catch (e) { }
  render();
})();
