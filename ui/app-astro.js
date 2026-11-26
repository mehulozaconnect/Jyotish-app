/* Trikaal 8: chart workspace and predictions library.
   Kundli: tabs for every chart (Basic, Lagna, Navamsha, Moon, Chalit, Transit, Shodashvarga, KP, Prashna, Dasha, Shadbala,
   Ashtakavarga, Varshphal), each with an "ask about this" box, a marked chart, legend, degree list and quick buttons.
   Predictions: a menu of reports. Facts in every report are calculated by rule; longer narrative reports are written by the
   AI from those facts and saved on the phone. Remedies are given for the planet concerned with the reason. */
var AS_PN = CONSULT.PN, AS_SG = J.SIGNS;
var AS_TABS = [['basic', 'Basic'], ['lagna', 'Lagna'], ['navamsha', 'Navamsha'], ['moon', 'Moon'], ['chalit', 'Chalit'], ['transit', 'Transit'], ['varga', 'Shodashvarga'], ['kp', 'KP'], ['prashna', 'Prashna'], ['dasha', 'Dasha'], ['shadbala', 'Shadbala'], ['av', 'Ashtakavarga'], ['varsh', 'Varshphal']];
var AS_GOOD_MOON = { Su: [3, 6, 10, 11], Mo: [1, 3, 6, 7, 10, 11], Ma: [3, 6, 11], Me: [2, 4, 6, 8, 10, 11], Ju: [2, 5, 7, 9, 11], Ve: [1, 2, 3, 4, 5, 8, 9, 11, 12], Sa: [3, 6, 11], Ra: [3, 6, 11], Ke: [3, 6, 11] };
var AS_HT = ['', 'self, body and confidence', 'family, money and speech', 'courage, effort and short trips', 'home, mother, vehicles and peace of mind', 'children, studies and creativity', 'work routine, health and competition', 'marriage, partners and deals', 'sudden events, research and hidden matters', 'luck, father, teachers and long travel', 'career, status and authority', 'income, gains and friends', 'expenses, sleep, foreign links and spiritual life'];
var AS_FX = {
  Su: ['brings recognition, support from seniors and confidence', 'brings ego clashes, fatigue and friction with seniors'],
  Mo: ['brings a calm mind, comfort and support from women', 'brings mood swings, worry and disturbed sleep'],
  Ma: ['brings energy, courage and success over rivals', 'brings anger, haste, accidents and arguments'],
  Me: ['brings good deals, clear communication and learning', 'brings confusion, paperwork errors and nervous stress'],
  Ju: ['brings growth, wise advice, blessings and good news', 'brings slow growth, wrong advice and extra expense'],
  Ve: ['brings comfort, harmony, pleasures and good relations', 'brings overspending, indulgence and relationship strain'],
  Sa: ['brings steady gains through hard work and discipline', 'brings delays, heavy responsibility, fatigue and loneliness'],
  Ra: ['brings bold gains, foreign links and quick moves', 'brings confusion, false promises and sudden shocks'],
  Ke: ['brings insight, detachment and spiritual help', 'brings sudden losses, isolation and hidden worries']
};
var AS_GEM = { Su: ['Ruby (Manik)', 'gold', 'ring finger', 'Sunday', '3 to 5 carats'], Mo: ['Pearl (Moti)', 'silver', 'little finger', 'Monday', '5 to 7 carats'], Ma: ['Red coral (Moonga)', 'gold or copper', 'ring finger', 'Tuesday', '6 to 9 carats'], Me: ['Emerald (Panna)', 'gold', 'little finger', 'Wednesday', '3 to 6 carats'], Ju: ['Yellow sapphire (Pukhraj)', 'gold', 'index finger', 'Thursday', '3 to 5 carats'], Ve: ['Diamond (Heera) or white sapphire', 'platinum or silver', 'middle or ring finger', 'Friday', '0.5 carat diamond or 3 carats sapphire'], Sa: ['Blue sapphire (Neelam)', 'silver or panchdhatu', 'middle finger', 'Saturday', '3 to 5 carats, only after a trial'], Ra: ['Hessonite (Gomed)', 'silver', 'middle finger', 'Saturday', '5 to 8 carats'], Ke: ['Cat\'s eye (Lehsunia)', 'silver', 'middle or little finger', 'Tuesday or Thursday', '3 to 5 carats'] };
var AS_RUD = { Su: '1 mukhi or 12 mukhi', Mo: '2 mukhi', Ma: '3 mukhi', Me: '4 mukhi', Ju: '5 mukhi', Ve: '6 mukhi', Sa: '7 mukhi', Ra: '8 mukhi', Ke: '9 mukhi' };
var AS_BEEJ = { Su: 'Om Hraam Hreem Hraum Sah Suryaya Namah', Mo: 'Om Shraam Shreem Shraum Sah Chandraya Namah', Ma: 'Om Kraam Kreem Kraum Sah Bhaumaya Namah', Me: 'Om Braam Breem Braum Sah Budhaya Namah', Ju: 'Om Graam Greem Graum Sah Gurave Namah', Ve: 'Om Draam Dreem Draum Sah Shukraya Namah', Sa: 'Om Praam Preem Praum Sah Shanaye Namah', Ra: 'Om Bhraam Bhreem Bhraum Sah Rahave Namah', Ke: 'Om Sraam Sreem Sraum Sah Ketave Namah' };

/* ---------- marked chart models ---------- */
function asMarks(code, sign, deg, d1sign, isD1orD9, retro, combust) {
  var m = '';
  if (retro && code !== 'Ra' && code !== 'Ke') m += '*';
  if (combust) m += '^';
  if (code !== 'Ra' && code !== 'Ke') { var dg = J.dignity(code, sign * 30 + deg); if (/Exalted/.test(dg)) m += '↑'; else if (/Debilitated/.test(dg)) m += '↓'; }
  if (isD1orD9 && d1sign === sign && isD1orD9 === 9) m += '□';
  return m;
}
function asModel(c, tab, sub) {
  var k = c.k, rows = [], signs = [], title = '', base, now = new Date();
  var push = function (h, code, deg, mark, cls) { rows.push({ h: h, code: code, deg: deg, mark: mark, cls: 'pc-' + code + (cls ? ' ' + cls : '') }); };
  if (tab === 'transit') {
    base = sub === 'moon' ? k.P.Mo.sign : k.ascSign; for (var i = 0; i < 12; i++) signs.push((base + i) % 12);
    rows.push({ h: J.houseFrom(base, k.ascSign), code: 'La', deg: String(Math.floor(k.asc % 30)), cls: 'pc-La' });
    C.BODIES.forEach(function (x) { var lon = ((C.sidereal(x, now) % 360) + 360) % 360, s = Math.floor(lon / 30), sp = x === 'Ra' || x === 'Ke' ? -1 : C.speed(x, now); push(J.houseFrom(base, s), x, String(Math.floor(lon % 30)), asMarks(x, s, lon % 30, -1, 0, sp < 0, false)); });
    return { rows: rows, signs: signs, title: 'Transit today · from the ' + (sub === 'moon' ? 'Moon' : 'lagna'), deg: C.BODIES.map(function (x) { var lon = ((C.sidereal(x, now) % 360) + 360) % 360; return [x, J.dms(lon % 30, true)]; }) };
  }
  var vn = tab === 'navamsha' ? 9 : tab === 'varga' ? (sub || 2) : 1, la;
  if (tab === 'chalit') { base = k.ascSign; for (var j = 0; j < 12; j++) signs.push(k.cusps ? k.cusps[j].sign : (base + j) % 12); rows.push({ h: 1, code: 'La', deg: String(Math.floor(k.asc % 30)), cls: 'pc-La' }); k.planets.forEach(function (q) { push(q.bhava, q.code, String(Math.floor(q.lon % 30)), asMarks(q.code, q.sign, q.lon % 30, q.sign, 1, q.retro, q.combust)); }); return { rows: rows, signs: signs, title: 'Bhava Chalit (Placidus cusps)', deg: null }; }
  la = vn === 1 ? { sign: k.ascSign, deg: k.asc % 30 } : J.varga(k.asc, vn);
  base = tab === 'moon' ? k.P.Mo.sign : la.sign; for (var q2 = 0; q2 < 12; q2++) signs.push((base + q2) % 12);
  rows.push({ h: J.houseFrom(base, la.sign), code: 'La', deg: String(Math.floor(la.deg)), cls: 'pc-La' });
  k.planets.forEach(function (q) { var x = vn === 1 ? { sign: q.sign, deg: q.lon % 30 } : J.varga(q.lon, vn); push(J.houseFrom(base, x.sign), q.code, String(Math.floor(x.deg)), asMarks(q.code, x.sign, x.deg, q.sign, vn === 9 ? 9 : 0, q.retro, vn === 1 && q.combust)); });
  var vv = J.VARGAS.filter(function (v) { return v[0] === vn; })[0];
  title = tab === 'moon' ? 'Chandra kundli (from the Moon)' : vn === 1 ? 'Lagna kundli (D1)' : 'D' + vn + ' ' + vv[1] + ' · ' + vv[2].toLowerCase();
  return { rows: rows, signs: signs, title: title, deg: vn === 1 ? [['La', J.dms(k.asc % 30, true)]].concat(k.planets.map(function (q) { return [q.code, J.dms(q.lon % 30, true)]; })) : [['La', J.dms(la.deg, true)]].concat(k.planets.map(function (q) { return [q.code, J.dms(J.varga(q.lon, vn).deg, true)]; })) };
}
function asChart(m) {
  return '<div class="ascard"><div class="aschart">' + Charts.north(m.rows, m.signs, {}) + '</div><div class="aslegend"><span>* Retrograde</span><span>^ Combust</span><span>□ Vargottama</span><span>↑ Exalted</span><span>↓ Debilitated</span></div>' +
    (m.deg ? '<div class="asdeg">' + m.deg.map(function (d) { return '<span class="pc-' + d[0] + '"><b>' + d[0] + '</b> ' + esc(d[1]) + '</span>'; }).join('') + '</div>' : '') + '</div>';
}
function asAskBox(ctx, ph) { return '<div class="asask"><input class="inp" id="asQ" data-ctx="' + esc(ctx) + '" placeholder="' + esc(ph || 'Ask about this chart') + '" autocomplete="off"><button data-act="asAsk" aria-label="Ask">' + icon('ai', 18) + '</button></div>'; }
ACT.asAsk = function () { var el = $('#asQ'); if (!el || !el.value.trim()) { toast('Type a question'); return; } U.ltPend = 'About the ' + el.dataset.ctx + ': ' + el.value.trim(); go('ai'); };
function asButtons(p) {
  return '<div class="asbtns">' + [['pred/planets', 'Planet'], ['astro/dasha', 'Dasha'], ['pred', 'Predictions'], ['astro/kp', 'KP System'], ['astro/varga', 'Shodashvarga'], ['pred/remedies', 'Remedies'], ['astro/varsh', 'Varshphal'], ['pred/yogas', 'Raj Yoga'], ['pred/transit', 'Transit']].map(function (b) { return '<button data-go="' + b[0] + '">' + b[1] + '</button>'; }).join('') + '</div>';
}

/* ---------- the Kundli workspace ---------- */
function AstroScreen(tab) {
  var p = curP(); if (!p) return noPerson();
  tab = AS_TABS.some(function (t) { return t[0] === tab; }) ? tab : (U.atab || 'lagna'); U.atab = tab;
  var c = calcP(p), k = c.k, now = new Date();
  var h = '<div class="ashead"><div class="ast"><div><b>' + esc(p.name) + '</b><small>' + AS_SG[k.ascSign] + ' lagna · ' + AS_SG[k.P.Mo.sign] + ' Moon · ' + esc(k.P.Mo.nak.name) + '</small></div><button class="v4pill l" data-act="pickPerson">' + esc(p.name.split(' ')[0]) + ' ▾</button><button class="asgear" data-go="more" aria-label="Settings">' + icon('gear', 18) + '</button></div>';
  h += '<div class="astabs" id="asTabs">' + AS_TABS.map(function (t) { return '<button data-go="astro/' + t[0] + '" class="' + (t[0] === tab ? 'on' : '') + '">' + t[1] + '</button>'; }).join('') + '</div></div>';
  var label = (AS_TABS.filter(function (t) { return t[0] === tab; })[0] || [0, 'chart'])[1];
  h += asAskBox(label + ' chart of ' + p.name, 'Chat with the ' + label + ' chart');
  if (['lagna', 'navamsha', 'moon', 'chalit'].indexOf(tab) >= 0) h += asChart(asModel(c, tab)) + asButtons(p);
  else if (tab === 'transit') { var tb = U.trb || 'lagna'; h += '<div class="asseg"><button data-act="asTrb" data-v="moon" class="' + (tb === 'moon' ? 'on' : '') + '">Moon</button><button data-act="asTrb" data-v="lagna" class="' + (tb !== 'moon' ? 'on' : '') + '">Lagna</button></div>' + asChart(asModel(c, 'transit', tb)) + '<button class="v4link" data-go="pred/transit" style="display:block;margin:6px auto 12px">Read: what today\'s transits mean ›</button>' + asButtons(p); }
  else if (tab === 'varga') { var vn = U.vn || 2; h += '<div class="asvch">' + J.VARGAS.filter(function (v) { return v[0] > 1; }).map(function (v) { return '<button data-act="asVn" data-v="' + v[0] + '" class="' + (v[0] === vn ? 'on' : '') + '">D' + v[0] + ' ' + v[1] + '</button>'; }).join('') + '</div>' + asChart(asModel(c, 'varga', vn)) + asButtons(p); }
  else if (tab === 'basic') h += asBasic(p, c);
  else if (tab === 'prashna') h += asPrashna(p, c);
  else if (tab === 'dasha') h += '<div class="pad" style="padding-top:4px">' + LiteDasha().split('</div><div class="pad">')[1].replace(/<div style="height:70px"><\/div>$/, '') + '<button class="v4btn sec" data-go="pred/mahadasha" style="width:100%;margin-top:8px">Mahadasha phala: what each period brings ›</button>';
  else { var f = { kp: 'kp', shadbala: 'shadbala', av: 'av', varsh: 'varsh' }[tab]; h += '<div class="astabf">' + TABF[f](p, c, now) + '</div>'; }
  return h + '<div style="height:80px"></div>';
}
ACT.asTrb = function (el) { U.trb = el.dataset.v; rerender(true); };
ACT.asVn = function (el) { U.vn = +el.dataset.v; rerender(true); };
function asBasic(p, c) {
  var k = c.k, b = c.birth, rows = [];
  rows.push(['Name', p.name], ['Date of birth', N.dmy(b)], ['Time of birth', p.time], ['Place', p.place || (+p.lat).toFixed(2) + ', ' + (+p.lon).toFixed(2)], ['Latitude, longitude', (+p.lat).toFixed(3) + ', ' + (+p.lon).toFixed(3)], ['Time zone', 'UTC' + (p.tz >= 0 ? '+' : '') + p.tz], ['Ayanamsa', 'Lahiri ' + J.dms(k.ayanamsa)]);
  try { var pc = J.panchangLite(new Date(b.getTime()), +p.lat, +p.lon); rows.push(['Weekday', J.VARAS[new Date(b.getTime() + p.tz * 3600e3).getUTCDay()]], ['Tithi', pc.tithi.paksha + ' ' + pc.tithi.name], ['Yoga', pc.yoga.name || pc.yoga], ['Karana', (pc.karana && (pc.karana.name || pc.karana)) || '-']); } catch (e) { }
  rows.push(['Lagna', AS_SG[k.ascSign] + ' ' + k.ascDegs + ' (lord ' + AS_PN[J.RULER[k.ascSign]] + ')'], ['Rashi (Moon sign)', AS_SG[k.P.Mo.sign] + ' (lord ' + AS_PN[J.RULER[k.P.Mo.sign]] + ')'], ['Nakshatra', k.P.Mo.nak.name + ', pada ' + k.P.Mo.nak.pada + ' (lord ' + AS_PN[k.P.Mo.nak.lord] + ')'], ['Sun sign (sidereal)', AS_SG[k.P.Su.sign]]);
  var md = J.find(c.maha, new Date()), ad = md ? J.find(J.subPeriods(md), new Date()) : null; if (md) rows.push(['Dasha now', AS_PN[md.lord] + (ad ? ' › ' + AS_PN[ad.lord] + ' till ' + N.dmy(ad.end) : '')]);
  return '<div class="pad" style="padding-top:4px"><div class="card astable">' + rows.map(function (r) { return '<div><span>' + r[0] + '</span><b>' + esc(String(r[1])) + '</b></div>'; }).join('') + '</div><div class="card"><div class="lbl2">Planets</div><div class="tw"><table class="lttab"><tr><th></th><th>Sign</th><th>Degree</th><th>Nakshatra</th><th>House</th><th>Dignity</th></tr>' +
    k.planets.map(function (q) { return '<tr><td><b class="pc-' + q.code + '">' + q.code + '</b>' + (q.retro && q.code !== 'Ra' && q.code !== 'Ke' ? '*' : '') + (q.combust ? '^' : '') + '</td><td>' + J.SG3[q.sign] + '</td><td class="mono">' + q.degs + '</td><td>' + q.nak.name + ' ' + q.nak.pada + '</td><td>' + q.house + '</td><td class="sm">' + (q.code === 'Ra' || q.code === 'Ke' ? '' : (q.dignity || '').replace(' sign', '')) + '</td></tr>'; }).join('') + '</table></div></div></div>';
}
function asPrashna(p, c) {
  var n = U.prN, h = '<div class="pad" style="padding-top:4px"><div class="card"><div class="lbl2">KP Prashna (horary)</div><p class="sm" style="margin:0 0 10px">Ask the customer to hold the question in mind and say a number from 1 to 249. The chart is cast for this moment at ' + esc((DB.settings.loc || {}).name || 'your location') + '.</p><div class="cqnum"><input class="inp" id="prN" type="number" inputmode="numeric" min="1" max="249" placeholder="1 – 249" value="' + (n || '') + '"><button class="v4btn" data-act="asPr">Cast ›</button></div></div>';
  if (n && U.prAt) {
    var L = DB.settings.loc || { lat: +p.lat, lon: +p.lon }, at = new Date(U.prAt), hr = J.horary(n), hk = J.kundli(at, L.lat, L.lon, { ayan: 'kp', ascLon: hr.start + 1 / 3600 }), sig = J.kpSignificators(hk), rp = null; try { rp = J.rulingPlanets(at, L.lat, L.lon, locOff(), 'kp'); } catch (e) { }
    var rows = [{ h: 1, code: 'La', deg: String(Math.floor(hk.asc % 30)), cls: 'pc-La' }].concat(hk.planets.map(function (q) { return { h: q.bhava, code: q.code, deg: String(Math.floor(q.lon % 30)), mark: asMarks(q.code, q.sign, q.lon % 30, -1, 0, q.retro, q.combust), cls: 'pc-' + q.code }; }));
    h += '<div class="ascard"><div class="aschart">' + Charts.north(rows, hk.cusps.map(function (x) { return x.sign; }), {}) + '</div><div class="gcap" style="padding:0 12px 10px">Number ' + n + ': ' + AS_SG[hr.sign] + ', star ' + AS_PN[hr.star] + ', sub ' + AS_PN[hr.sub] + ' · cast ' + N.dmy(at) + ' ' + N.hm(at) + '</div></div>';
    h += '<div class="card"><div class="lbl2">Cusps</div><div class="tw"><table class="lttab"><tr><th>Cusp</th><th>Sign</th><th>Degree</th><th>Star L</th><th>Sub L</th></tr>' + hk.cusps.map(function (x) { return '<tr><td>' + x.house + '</td><td>' + J.SG3[x.sign] + '</td><td class="mono">' + x.deg + '</td><td>' + x.kp.star + '</td><td><b>' + x.kp.sub + '</b></td></tr>'; }).join('') + '</table></div></div>';
    h += '<div class="card"><div class="lbl2">Planets: houses they signify</div>' + hk.planets.map(function (q) { return '<div class="cqwin"><b>' + AS_PN[q.code] + '</b><span>star ' + AS_PN[q.kp.star] + ', sub ' + AS_PN[q.kp.sub] + ' · signifies ' + ((sig.sig[q.code] || []).join(', ') || '-') + '</span></div>'; }).join('') + '</div>';
    if (rp) h += '<div class="card"><div class="lbl2">Ruling planets now</div><p style="margin:0">' + rp.set.map(function (x) { return AS_PN[x]; }).join(', ') + '</p></div>';
    h += '<div class="card"><div class="lbl2">Read the answer step by step</div><p class="sm" style="margin:0 0 8px">Pick the question; the app judges the right cusp with this Prashna and explains each step.</p><div class="cqtop">' + CONSULT.topicsFor(ltAge(p) || 30).map(function (t) { return '<button data-act="asPrQ" data-v="' + t.id + '">' + esc(t.l) + '</button>'; }).join('') + '</div></div>';
  }
  return h + '</div>';
}
ACT.asPr = function () { var el = $('#prN'), n = parseInt(el && el.value, 10); if (!(n >= 1 && n <= 249)) { toast('Enter a number from 1 to 249'); return; } U.prN = n; U.prAt = Date.now(); rerender(true); };
ACT.asPrQ = function (el) { var p = curP(), L = DB.settings.loc || {}; U.cqT = el.dataset.v; var cs = { id: 'q' + Date.now().toString(36), pid: p.id, topic: el.dataset.v, words: '', at: U.prAt || Date.now(), n: U.prN, qlat: L.lat, qlon: L.lon, qtz: locOff(), qplace: L.name || '' }; cases().push(cs); save(); go('q/' + cs.id + '/k/0'); };

/* ---------- predictions library ---------- */
var AS_REP = [
  ['life', 'Life predictions', 'ai'], ['daily', 'Daily prediction'], ['monthly', 'Monthly prediction'], ['ascendant', 'Ascendant prediction', 'ai'], ['planets', 'Planet consideration', 'ai'], ['nakshatra', 'Nakshatra report', 'ai'],
  ['mahadasha', 'Mahadasha phala', 'ai'], ['transit', 'Transit today'], ['sadesati', 'Sade Sati life report'], ['mangal', 'Mangal dosh'], ['kaalsarp', 'Kaal Sarp dosha'], ['yogas', 'Raj yogas and doshas'],
  ['gems', 'Gemstones report'], ['rudraksha', 'Rudraksha'], ['remedies', 'Remedies'], ['ask', 'Ask a question']];
function PredScreen(rid) {
  var p = curP(); if (!p) return noPerson();
  if (rid) return ReportScreen(p, rid);
  var h = '<div class="ashead"><div class="ast"><div><b>Predictions</b><small>' + esc(p.name) + '</small></div><button class="v4pill l" data-act="pickPerson">' + esc(p.name.split(' ')[0]) + ' ▾</button><button class="asgear" data-go="more" aria-label="Settings">' + icon('gear', 18) + '</button></div></div>';
  h += asAskBox('whole chart of ' + p.name, 'Ask anything about ' + p.name.split(' ')[0]);
  h += '<div class="asgrid">' + [['astro/basic', 'Basic', 'doc'], ['astro/dasha', 'Dasha', 'bars'], ['astro/kp', 'KP System', 'star'], ['astro/varga', 'Shodashvarga', 'orbit'], ['pred/remedies', 'Remedies', 'heart'], ['astro/varsh', 'Varshphal', 'time']].map(function (g) { return '<button data-go="' + g[0] + '">' + v4i(g[2]) + '<span>' + g[1] + '</span></button>'; }).join('') + '</div>';
  h += '<div class="aslist">' + AS_REP.map(function (r) { return '<button data-go="' + (r[0] === 'ask' ? 'q' : 'pred/' + r[0]) + '">' + r[1] + '</button>'; }).join('') + '</div>';
  return h + '<div style="height:80px"></div>';
}
function repHead(p, title) { return '<div class="ashead"><div class="ast"><div><button class="cqback" data-go="pred">‹ Predictions</button><b>' + esc(title) + '</b><small>' + esc(p.name) + '</small></div><button class="v4pill l" data-act="pickPerson">' + esc(p.name.split(' ')[0]) + ' ▾</button></div></div>'; }
function asSec(title, body) { return '<div class="card assec"><h3>' + title + '</h3>' + body + '</div>'; }
function asP(t) { return '<p>' + esc(t) + '</p>'; }
function ReportScreen(p, rid) {
  var r = AS_REP.filter(function (x) { return x[0] === rid; })[0]; if (!r) return '<div class="empty"><h2>Not found</h2></div>';
  var c = calcP(p), h = repHead(p, r[1]) + asAskBox(r[1].toLowerCase() + ' of ' + p.name, 'Chat with ' + r[1].toLowerCase()) + '<div class="pad" style="padding-top:4px">';
  try { h += (REPF[rid] || function () { return ''; })(p, c); } catch (e) { h += '<div class="card">Could not build this report: ' + esc(e.message) + '</div>'; if (window.console) console.error(e); }
  return h + '</div><div style="height:80px"></div>';
}
var REPF = {};
/* facts about a planet, calculated */
function asPlanetFacts(c, x) {
  var k = c.k, q = k.P[x], A = k.ascSign, rules = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].filter(function (h) { return J.RULER[(A + h - 1) % 12] === x; });
  var asp = J.aspectedHouses(x, q.house), by = k.planets.filter(function (o) { return o.code !== x && J.aspectedHouses(o.code, o.house).indexOf(q.house) >= 0; }).map(function (o) { return AS_PN[o.code]; });
  var withP = k.planets.filter(function (o) { return o.code !== x && o.sign === q.sign; }).map(function (o) { return AS_PN[o.code]; }), d9 = J.varga(q.lon, 9);
  var s = 'Your ' + AS_PN[x] + ' is in ' + AS_SG[q.sign] + ' ' + q.degs + (x === 'Ra' || x === 'Ke' ? '' : ', ' + (q.dignity || 'neutral sign').toLowerCase()) + ', in ' + q.nak.name + ' nakshatra pada ' + q.nak.pada + '. ';
  s += (rules.length ? 'It rules the ' + rules.map(gNth).join(' and ') + ' house' + (rules.length > 1 ? 's' : '') + ' and sits in the ' : 'It sits in the ') + gNth(q.house) + ' house (' + AS_HT[q.house] + '). ';
  s += 'It aspects the ' + asp.map(gNth).join(', ') + ' house' + (asp.length > 1 ? 's' : '') + '. ' + (by.length ? 'It is aspected by ' + by.join(', ') + '. ' : '') + (withP.length ? 'It sits with ' + withP.join(', ') + '. ' : '');
  s += (q.retro && x !== 'Ra' && x !== 'Ke' ? 'It is retrograde. ' : '') + (q.combust ? 'It is combust. ' : '') + 'In the Navamsha it is in ' + AS_SG[d9.sign] + (d9.sign === q.sign ? ' (vargottama: strong and steady)' : '') + '.';
  return s;
}
/* AI narrative, saved on the phone */
function repAI(p, rid, prompt) {
  DB.rep = DB.rep || {}; var mine = (DB.rep[p.id] = DB.rep[p.id] || {}), cur = mine[rid], key = rid + '|' + p.id;
  if (U.repBusy === key) return '<div class="card"><div class="ltthink" id="repLive">Reading the chart and writing the report…</div></div>';
  if (cur && cur.t) return '<div class="card asai">' + mdToHtml(cur.t) + '<small>' + esc(cur.via || 'AI') + ' · ' + N.dmy(new Date(cur.at)) + ' · written from the exact chart data</small><button class="v4link" data-act="repGen" data-r="' + rid + '">Write it again</button></div>';
  if (!ltProv()) return '<div class="card"><p class="sm" style="margin:0">Add a Gemini or Claude key in Settings to get the written reading. The calculated facts above are always shown.</p></div>';
  if (cur && cur.err) return '<div class="card"><p class="sm" style="color:#B2382B;margin:0 0 6px">' + esc(cur.err) + '</p><button class="v4btn" data-act="repGen" data-r="' + rid + '">Try again</button></div>';
  setTimeout(function () { repRun(p, rid, prompt); }, 60);
  return '<div class="card"><div class="ltthink" id="repLive">Reading the chart and writing the report…</div></div>';
}
var REP_PROMPT = {};
function repRun(p, rid, prompt) {
  var key = rid + '|' + p.id; if (U.repBusy) return; U.repBusy = key;
  var ag = ltAge(p), sys = 'You are a senior Vedic astrologer (Parashari, Lahiri ayanamsa). Write a report for the app, from ONLY the chart pack given; never recalculate positions or invent dates. Plain simple English, short paragraphs, practical, honest, no fear. Use "you". Name the chart factors behind each statement in brackets, e.g. (Sun in the 6th, lord of the 7th). ' + (ag != null && ag < 18 ? 'The person is a ' + ag + '-year-old child: speak to the parent, about nature, studies, health care and talents only. ' : '') + 'Use markdown headings (##) for sections.';
  var on = function (k, t) { var el = document.getElementById('repLive'); if (el && k === 'text') { el.className = ''; el.innerHTML = mdToHtml(t); } };
  aiOnce(sys, prompt + '\n\nCHART PACK:\n' + packOf(p), on).then(function (r) { DB.rep[p.id][rid] = { t: r.t, via: r.via, at: Date.now() }; }, function (e) { DB.rep[p.id][rid] = { err: e.message || String(e) }; })
    .then(function () { U.repBusy = null; save(); if (parts()[0] === 'pred') rerender(true); });
}
ACT.repGen = function (el) { var p = curP(); if (DB.rep && DB.rep[p.id]) delete DB.rep[p.id][el.dataset.r]; rerender(true); };

REPF.life = function (p) { return asSec('About this report', asP('A full life reading from the birth chart: personality, career, money, marriage, health, children and the big periods ahead, with the reason behind each point.')) + repAI(p, 'life', 'Write a life prediction report with sections: Personality, Career and work, Money and wealth, Marriage and relationships, Health, Children and family, Key periods ahead (with dasha dates from the pack), and Simple remedies. 500 to 700 words.'); };
REPF.ascendant = function (p, c) { var k = c.k, L = J.RULER[k.ascSign], q = k.P[L]; return asSec(AS_SG[k.ascSign] + ' lagna', asP('Lagna ' + AS_SG[k.ascSign] + ' ' + k.ascDegs + ', ' + k.ascNak.name + ' nakshatra. Lagna lord ' + AS_PN[L] + ' is in ' + AS_SG[q.sign] + ' in the ' + gNth(q.house) + ' house, ' + (q.dignity || '').toLowerCase() + '. Planets in the lagna: ' + (k.planets.filter(function (x) { return x.house === 1; }).map(function (x) { return AS_PN[x.code]; }).join(', ') || 'none') + '.')) + repAI(p, 'ascendant', 'Write an ascendant (lagna) prediction: nature and temperament, body and health type, strengths, weak points, how the lagna lord\'s placement shapes life, and lucky days and colours from the lagna lord. 300 to 400 words.'); };
REPF.nakshatra = function (p, c) { var m = c.k.P.Mo; return asSec(m.nak.name + ' nakshatra, pada ' + m.nak.pada, asP('Moon in ' + AS_SG[m.sign] + ' ' + m.degs + ', ' + m.nak.name + ' pada ' + m.nak.pada + ', nakshatra lord ' + AS_PN[m.nak.lord] + '. The first Mahadasha of life was of ' + AS_PN[c.maha[0].lord] + '.')) + repAI(p, 'nakshatra', 'Write a nakshatra report for the Moon nakshatra and pada in the pack: nature, mind and emotions, work that suits, relationships, health points, and the role of the nakshatra lord. 300 to 400 words.'); };
REPF.planets = function (p, c) {
  var cur = DB.rep && DB.rep[p.id] && DB.rep[p.id].planets, secs = {};
  if (cur && cur.t) cur.t.split(/\n(?=##\s)/).forEach(function (s) { var m = s.match(/^##\s*([A-Za-z]+)/); if (m) secs[m[1].toLowerCase()] = s.replace(/^##[^\n]*\n/, ''); });
  var h = J.PC.map(function (x, i) { var t = secs[AS_PN[x].toLowerCase()]; return '<details class="card asdet"' + (i === 0 ? ' open' : '') + '><summary>' + AS_PN[x] + ' consideration</summary>' + asP(asPlanetFacts(c, x)) + (t ? '<div class="asai">' + mdToHtml(t) + '</div>' : '') + '</details>'; }).join('');
  return h + (cur && cur.t ? '<button class="v4link" data-act="repGen" data-r="planets" style="display:block;margin:4px auto">Write the readings again</button>' : repAI(p, 'planets', 'For each of the nine planets write a section with the heading "## <Planet name>" (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu), 80 to 120 words each: what this placement (sign, house, lordship, aspects, conjunctions, dignity) gives in life, one caution, and one simple remedy if the planet is troubled.'));
};
REPF.mahadasha = function (p, c) {
  var now = new Date(), A = c.k.ascSign;
  var h = c.maha.map(function (m) { var q = c.k.P[m.lord], rules = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].filter(function (x) { return J.RULER[(A + x - 1) % 12] === m.lord; }), run = m.start <= now && now < m.end;
    return '<div class="card' + (run ? ' asrun' : '') + '"><div class="cqck"><b>' + AS_PN[m.lord] + ' Mahadasha</b><span class="chip' + (run ? ' g' : '') + '">' + N.dmy(m.start) + ' – ' + N.dmy(m.end) + (run ? ' · now' : '') + '</span></div><p class="sm" style="margin:0">' + AS_PN[m.lord] + (rules.length ? ' rules the ' + rules.map(gNth).join(' and ') + ',' : '') + ' sits in the ' + gNth(q.house) + ' house in ' + AS_SG[q.sign] + (m.lord === 'Ra' || m.lord === 'Ke' ? '' : ', ' + (q.dignity || '').toLowerCase()) + '. Themes: ' + AS_HT[q.house] + (rules.length ? '; ' + rules.map(function (x) { return AS_HT[x].split(',')[0]; }).join(', ') : '') + '.</p></div>'; }).join('');
  return h + repAI(p, 'mahadasha', 'Write Mahadasha phala: for each Mahadasha in the pack that is running now or still ahead, a section "## <Planet> Mahadasha (<start year>–<end year>)" with what it brings for career, money, family and health, the best and the difficult sub-periods (antardashas, with years), and one remedy. 80 to 130 words each.');
};
REPF.transit = function (p, c) {
  var k = c.k, now = new Date();
  return asP('Classical gochara: each planet is judged from your Moon sign (' + AS_SG[k.P.Mo.sign] + '), and its house from the lagna shows the area of life it touches.') + C.BODIES.map(function (x) {
    var lon = ((C.sidereal(x, now) % 360) + 360) % 360, sg = Math.floor(lon / 30), hL = J.houseFrom(k.ascSign, sg), hM = J.houseFrom(k.P.Mo.sign, sg), good = AS_GOOD_MOON[x].indexOf(hM) >= 0, ret = x !== 'Ra' && x !== 'Ke' && C.speed(x, now) < 0;
    var t = AS_PN[x] + ' is ' + (ret ? 'retrograde ' : '') + 'in ' + AS_SG[sg] + ', the ' + gNth(hM) + ' from your Moon: ' + (good ? 'a favourable position' : 'an unfavourable position') + '. In your ' + gNth(hL) + ' house it touches ' + AS_HT[hL] + ', and ' + AS_FX[x][good ? 0 : 1] + ' there.' + (x === 'Sa' && (hM === 12 || hM === 1 || hM === 2) ? ' Sade Sati is running.' : x === 'Sa' && (hM === 4 || hM === 8) ? ' This is Saturn\'s dhaiya (small panoti).' : '') + (!good && (x === 'Sa' || x === 'Ra' || x === 'Ke' || x === 'Ma') ? ' Remedy: ' + CONSULT.REM[x].day + ', ' + CONSULT.REM[x].mantra + '; ' + CONSULT.REM[x].act.toLowerCase() + '.' : '');
    return asSec('<span class="pc-' + x + '">' + AS_PN[x] + '</span> in ' + AS_SG[sg] + ' · your ' + gNth(hL) + ' house <span class="chip ' + (good ? 'g' : 'w') + '">' + (good ? 'Favourable' : 'Careful') + '</span>', asP(t));
  }).join('');
};
function asTara(birthNak, nakIdx) { var t = ((nakIdx - birthNak + 27) % 27) % 9 + 1; return { n: t, name: ['Janma', 'Sampat', 'Vipat', 'Kshema', 'Pratyak', 'Sadhaka', 'Naidhana', 'Mitra', 'Ati-mitra'][t - 1], good: [2, 4, 6, 8, 9].indexOf(t) >= 0 }; }
function asNakIdx(lon) { return Math.floor((((lon % 360) + 360) % 360) / (360 / 27)); }
function asDay(c, d) {
  var k = c.k, mo = ((C.sidereal('Mo', d) % 360) + 360) % 360, ms = Math.floor(mo / 30), hM = J.houseFrom(k.P.Mo.sign, ms), cb = [1, 3, 6, 7, 10, 11].indexOf(hM) >= 0, ta = asTara(asNakIdx(k.P.Mo.lon), asNakIdx(mo));
  return { hM: hM, cb: cb, ta: ta, ms: ms, nak: J.nakInfo(mo).name, score: (cb ? 1 : 0) + (ta.good ? 1 : 0) - (hM === 8 ? 2 : 0) };
}
REPF.daily = function (p, c) {
  var now = new Date(), d = asDay(c, now), k = c.k, md = J.find(c.maha, now), ad = md ? J.find(J.subPeriods(md), now) : null, pd = ad ? J.find(J.subPeriods(ad), now) : null, hP = pd ? k.P[pd.lord].house : 0;
  var word = d.hM === 8 ? 'Go slow' : d.score >= 2 ? 'Good day' : d.score === 1 ? 'Mixed day' : 'Careful day';
  var h = asSec(N.dmy(now) + ' <span class="chip ' + (d.score >= 2 ? 'g' : d.hM === 8 || d.score <= 0 ? 'w' : '') + '">' + word + '</span>',
    asP('The Moon is in ' + AS_SG[d.ms] + ' (' + d.nak + '), the ' + gNth(d.hM) + ' from your Moon sign: ' + (d.hM === 8 ? 'Chandrashtama, a sensitive day for the mind and for new starts.' : d.cb ? 'good Chandra bala, the mind is supported.' : 'weak Chandra bala, keep plans simple.')) +
    asP('Tara bala: ' + d.ta.name + ' tara, ' + (d.ta.good ? 'favourable for starting things.' : 'not favourable; avoid starting important work today.')) +
    (pd ? asP('Running sub-sub period: ' + AS_PN[md.lord] + ' › ' + AS_PN[ad.lord] + ' › ' + AS_PN[pd.lord] + '. ' + AS_PN[pd.lord] + ' sits in your ' + gNth(hP) + ' house, so ' + AS_HT[hP] + ' are in focus these days.') : ''));
  h += asSec('Do and avoid', '<ul class="cqwhy">' + (d.score >= 2 ? '<li><i class="cg">✓</i><span>Good for meetings, requests, starting a task and travel.</span></li>' : '<li><i class="cg">✓</i><span>Finish pending work; keep new starts for a better day.</span></li>') + (d.hM === 8 ? '<li><i class="cb">✗</i><span>Avoid big decisions, arguments and risky travel today.</span></li>' : '') + '<li><i class="cg">✓</i><span>Remedy for today: ' + CONSULT.REM[['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa'][now.getDay()]].mantra + ' 108 times (lord of the weekday).</span></li></ul>');
  var nx = []; for (var i = 1; i <= 7; i++) { var dd = new Date(now.getTime() + i * 864e5), x = asDay(c, dd); nx.push('<div class="cqwin"><b>' + N.dmy(dd) + '</b><span>' + (x.hM === 8 ? 'Chandrashtama: go slow' : x.score >= 2 ? 'Good day' : x.score === 1 ? 'Mixed' : 'Careful') + ' · Moon ' + gNth(x.hM) + ' from Moon, ' + x.ta.name + ' tara</span></div>'); }
  return h + asSec('Next 7 days', nx.join(''));
};
REPF.monthly = function (p, c) {
  var k = c.k, now = new Date(), m0 = new Date(now.getFullYear(), now.getMonth(), 1), m1 = new Date(now.getFullYear(), now.getMonth() + 1, 1), su = Math.floor(((C.sidereal('Su', now) % 360) + 360) % 360 / 30), hS = J.houseFrom(k.P.Mo.sign, su), good = [], bad = [];
  for (var d = new Date(m0); d < m1; d = new Date(d.getTime() + 864e5)) { var x = asDay(c, new Date(d.getTime() + 12 * 3600e3)); if (x.hM === 8) bad.push(d.getDate()); else if (x.score >= 2) good.push(d.getDate()); }
  var evs = []; try { evs = J.events(m0, m1, ['Su', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra']); } catch (e) { }
  var mon = V4MON[now.getMonth()] + ' ' + now.getFullYear();
  return asSec(mon, asP('The Sun is in ' + AS_SG[su] + ', the ' + gNth(hS) + ' from your Moon: ' + (AS_GOOD_MOON.Su.indexOf(hS) >= 0 ? 'a favourable month for work and recognition.' : 'an average month; push less, plan more.') + ' The Sun lights up your ' + gNth(J.houseFrom(k.ascSign, su)) + ' house: ' + AS_HT[J.houseFrom(k.ascSign, su)] + '.')) +
    asSec('Good days', asP(good.length ? good.join(', ') + ' ' + V4MON[now.getMonth()] + ': Moon favourable from your Moon and a good tara.' : 'No clearly strong days this month.')) +
    asSec('Go-slow days (Chandrashtama)', asP(bad.length ? bad.join(', ') + ' ' + V4MON[now.getMonth()] + ': avoid big decisions and arguments.' : 'None this month.')) +
    asSec('Planet changes this month', evs.length ? evs.map(function (e) { return '<div class="cqwin"><b>' + N.dmy(e.t) + '</b><span>' + AS_PN[e.code] + (e.type === 'ingress' ? ' enters ' + AS_SG[e.sign] + ' (your ' + gNth(J.houseFrom(k.ascSign, e.sign)) + ' house)' : ' turns ' + e.type) + '</span></div>'; }).join('') : asP('No major sign changes this month.'));
};
REPF.sadesati = function (p, c) {
  var k = c.k, ms = k.P.Mo.sign, birth = c.birth, end = new Date(birth.getTime() + 100 * 365.25 * 864e5), now = new Date(), runs = [], cur = null;
  for (var t = birth.getTime(); t <= end.getTime(); t += 10 * 864e5) { var d = new Date(t), h = J.houseFrom(ms, Math.floor(((C.sidereal('Sa', d) % 360) + 360) % 360 / 30)), ph = h === 12 ? 'Rising (12th)' : h === 1 ? 'Peak (over the Moon)' : h === 2 ? 'Setting (2nd)' : h === 4 ? 'Dhaiya (4th)' : h === 8 ? 'Dhaiya (8th)' : null;
    if (ph !== (cur && cur.ph)) { if (cur) { cur.end = d; runs.push(cur); } cur = ph ? { ph: ph, start: d } : null; } }
  if (cur) { cur.end = end; runs.push(cur); }
  var merged = []; runs.forEach(function (r) { var l = merged[merged.length - 1]; if (l && l.ph === r.ph && r.start - l.end < 400 * 864e5) l.end = r.end; else merged.push(r); });
  var groups = []; merged.forEach(function (r) { var ss = /Rising|Peak|Setting/.test(r.ph), l = groups[groups.length - 1]; if (ss && l && l.ss && r.start - l.end < 400 * 864e5) { l.parts.push(r); l.end = r.end; } else groups.push({ ss: ss, parts: [r], start: r.start, end: r.end }); });
  var nowRun = groups.filter(function (g) { return g.start <= now && now < g.end; })[0];
  var h = asSec('Your Moon sign: ' + AS_SG[ms], asP('Sade Sati is the seven and a half years when Saturn passes the 12th, 1st and 2nd signs from your Moon. Dhaiya (small panoti) is when Saturn is 4th or 8th from the Moon. ' + (nowRun ? (nowRun.ss ? 'Sade Sati is running now, till ' + N.dmy(nowRun.end) + '.' : 'Dhaiya is running now, till ' + N.dmy(nowRun.end) + '.') : 'Neither is running now.')));
  h += asSec('All periods in life', groups.filter(function (g) { return g.end > birth; }).map(function (g) { var run = g.start <= now && now < g.end; return '<div class="cqwin' + (run ? ' asnow' : '') + '"><b>' + (g.ss ? 'Sade Sati' : g.parts[0].ph) + ': ' + N.dmy(g.start) + ' – ' + N.dmy(g.end) + (run ? ' · now' : '') + '</b><span>Age ' + Math.floor((g.start - birth) / (365.25 * 864e5)) + ' to ' + Math.floor((g.end - birth) / (365.25 * 864e5)) + (g.ss ? ' · ' + g.parts.map(function (x) { return x.ph.split(' ')[0] + ' ' + V4MON[x.start.getMonth()] + ' ' + x.start.getFullYear(); }).join(', ') : '') + '</span></div>'; }).join(''));
  var sq = k.P.Sa, sGood = /Exalted|Own|Moola/.test(sq.dignity || '') || J.functional && false;
  h += asSec('What it means for you', asP('Saturn in your chart is in ' + AS_SG[sq.sign] + ' (' + (sq.dignity || '').toLowerCase() + ') in the ' + gNth(sq.house) + ' house. ' + (/Exalted|Own|Moola/.test(sq.dignity || '') ? 'A strong natal Saturn makes Sade Sati a period of hard work that pays off, not of loss.' : /Debil|Enemy/.test(sq.dignity || '') ? 'A weak natal Saturn makes Sade Sati heavier: keep expenses and health in check and avoid shortcuts.' : 'Results depend on effort and honesty; the peak phase over the Moon is the most demanding.')));
  return h + asSec('Remedies during Sade Sati', '<ul class="cqwhy"><li><i>☀</i><span>Saturday: light a mustard-oil lamp under a peepal tree; recite Hanuman Chalisa.</span></li><li><i>❁</i><span>Give black sesame, mustard oil or a blanket to the needy on Saturdays.</span></li><li><i>✓</i><span>Chant ' + AS_BEEJ.Sa + ' 108 times on Saturdays. Respect workers and the elderly; be patient and honest.</span></li></ul>');
};
function asYogaRep(c, re) { return (c.yogas || []).filter(function (y) { return re.test(y.name); }); }
REPF.mangal = function (p, c) {
  var k = c.k, M = k.P.Ma, fr = [['lagna', k.ascSign], ['Moon', k.P.Mo.sign], ['Venus', k.P.Ve.sign]].map(function (x) { var h = J.houseFrom(x[1], M.sign); return [x[0], h, [1, 2, 4, 7, 8, 12].indexOf(h) >= 0]; });
  var ys = asYogaRep(c, /Mangal/i);
  return asSec('Mars in your chart', asP('Mars is in ' + AS_SG[M.sign] + ' (' + (M.dignity || '').toLowerCase() + '). ' + fr.map(function (x) { return 'From the ' + x[0] + ' it is in the ' + gNth(x[1]) + (x[2] ? ' (a Mangal dosha house)' : ''); }).join('; ') + '.')) +
    asSec('Result', ys.length ? ys.map(function (y) { return '<p><b>' + esc(y.name) + '</b>: ' + esc(y.why) + '</p>'; }).join('') : asP('No Mangal dosha: Mars is not in the 1st, 2nd, 4th, 7th, 8th or 12th from the lagna in a way that forms the dosha.')) +
    asSec('What to do', '<ul class="cqwhy"><li><i>✓</i><span>Match with a partner who also has Mars in these houses, or whose chart cancels it; check the kundli match.</span></li><li><i>☀</i><span>Tuesday: Hanuman Chalisa; give red masoor dal. Keep anger in check in the home.</span></li></ul>');
};
REPF.kaalsarp = function (p, c) { var ys = asYogaRep(c, /Kaal Sarp/i), k = c.k; return asSec('Rahu–Ketu axis', asP('Rahu is in ' + AS_SG[k.P.Ra.sign] + ' (your ' + gNth(k.P.Ra.house) + ' house) and Ketu in ' + AS_SG[k.P.Ke.sign] + ' (your ' + gNth(k.P.Ke.house) + ' house).')) + asSec('Result', ys.length ? ys.map(function (y) { return '<p><b>' + esc(y.name) + '</b>: ' + esc(y.why) + '</p>'; }).join('') : asP('No Kaal Sarp dosha: the planets are spread on both sides of the Rahu–Ketu axis.')) + (ys.some(function (y) { return y.kind === 'dosha'; }) ? asSec('What to do', '<ul class="cqwhy"><li><i>☀</i><span>Mahamrityunjaya mantra 108 times on Mondays; offer water and milk on a Shivling.</span></li><li><i>❁</i><span>Feed birds and street dogs; avoid shortcuts in money matters.</span></li></ul>') : ''); };
REPF.yogas = function (p, c) { return '<div class="astabf">' + TABF.yogas(p, c) + '</div>'; };
REPF.remedies = function (p, c) { return '<div class="astabf">' + TABF.remedies(p, c, new Date()) + '</div>'; };
REPF.gems = function (p, c) {
  var k = c.k, A = k.ascSign, picks = [['Life stone', 1], ['Punya stone (luck through good deeds)', 5], ['Bhagya stone (fortune)', 9]];
  return asP('Gemstones are chosen from the lords of the lagna, 5th and 9th houses. A stone strengthens its planet, good or bad, so it is worn only when that planet is well placed. Remedies by mantra and charity come first.') + picks.map(function (x) {
    var L = J.RULER[(A + x[1] - 1) % 12], q = k.P[L], g = AS_GEM[L], weak = [6, 8, 12].indexOf(q.house) >= 0 || /Debil/.test(q.dignity || ''), dus = [6, 8, 12].some(function (h) { return J.RULER[(A + h - 1) % 12] === L; }) && x[1] !== 1;
    return asSec(x[0] + ': ' + g[0], asP(AS_PN[L] + ' rules your ' + gNth(x[1]) + ' house and sits in the ' + gNth(q.house) + ' in ' + AS_SG[q.sign] + ' (' + (q.dignity || '').toLowerCase() + ').') + '<ul class="cqwhy"><li><i>' + (weak || dus ? '!' : '✓') + '</i><span>' + (weak ? 'Caution: ' + AS_PN[L] + ' is in a difficult house or sign; test the stone for a few days first, or use the mantra instead.' : dus ? 'Caution: ' + AS_PN[L] + ' also rules a difficult house; wear only after an expert checks.' : 'Suitable, as ' + AS_PN[L] + ' is reasonably placed.') + '</span></li><li><i>❁</i><span>' + g[4] + ', in ' + g[1] + ', on the ' + g[2] + ', on a ' + g[3] + ' morning after chanting ' + AS_BEEJ[L] + ' 108 times.</span></li></ul>');
  }).join('') + asSec('Do not wear together', asP('Avoid wearing stones of enemy planets together: Ruby with Blue sapphire or Diamond; Pearl with Hessonite or Cat\'s eye; Red coral with Emerald.'));
};
REPF.rudraksha = function (p, c) {
  var k = c.k, L = J.RULER[k.ascSign], md = J.find(c.maha, new Date());
  return asP('Rudraksha are safe for everyone and can be worn alongside mantras. Choose by the lagna lord and by the planet running your Mahadasha.') + asSec('For your lagna lord ' + AS_PN[L], asP(AS_RUD[L] + ' rudraksha. Wear on a ' + AS_GEM[L][3] + ' after chanting ' + AS_BEEJ[L] + '.')) + (md && md.lord !== L ? asSec('For the running ' + AS_PN[md.lord] + ' Mahadasha', asP(AS_RUD[md.lord] + ' rudraksha, till ' + N.dmy(md.end) + '. Chant ' + AS_BEEJ[md.lord] + ' 108 times on ' + AS_GEM[md.lord][3] + 's.')) : '') + asSec('How to wear', asP('Wear in a red or black thread or in silver, after washing in raw milk and Ganga jal and chanting Om Namah Shivaya 108 times. Remove before sleeping and at funerals.'));
};

/* ---------- routing and nav ---------- */
NAVS = [['astro', 'Kundli'], ['pred', 'Predictions'], ['q', 'Customer'], ['ai', 'Ask AI'], ['people', 'People']];
IC.pred = IC.pred || '<path d="M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 8.7l5.4-.8z"/>';
(function () {
  var r0 = render;
  render = function () {
    var pr = parts(), scr = pr[0];
    if (!pr.length) { location.hash = me() || (DB.people || []).length ? '#/astro' : '#/people'; return; }
    if (scr !== 'astro' && scr !== 'pred') return r0();
    applySettings(); var html; try { html = scr === 'astro' ? AstroScreen(pr[1]) : PredScreen(pr[1]); } catch (e) { html = '<div class="empty"><h2>Something went wrong</h2>' + esc(e.message) + '<br><br><button class="btn" data-go="astro">Back</button></div>'; if (window.console) console.error(e); }
    $('#app').innerHTML = html; $('#nav').innerHTML = NAVS.map(function (x) { return '<button data-go="' + x[0] + '" class="' + (x[0] === scr ? 'on' : '') + '">' + icon(x[0]) + x[1] + '</button>'; }).join('');
    document.body.setAttribute('data-scr', scr); var fb = document.getElementById('askfab'); if (fb) fb.remove();
    var t = document.querySelector('.astabs .on'); if (t && t.scrollIntoView) t.scrollIntoView({ block: 'nearest', inline: 'center' });
    window.scrollTo(0, U.keepY || 0);
  };
  var tb = window.trikaalBack; window.trikaalBack = function () { var p = parts(); if ((p[0] === 'astro' || p[0] === 'pred') && p.length < 2 && !$('#scrim')) return 'false'; return tb(); };
  /* the AI chat: a back link to where the question came from */
  var la = LiteAsk; LiteAsk = function () { return la().replace('<div class="pad ltchat"', '<button class="v4link" onclick="history.back()" style="margin:10px 16px 0">‹ Back</button><div class="pad ltchat"'); };
})();
render();
