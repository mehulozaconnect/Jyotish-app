/* Trikaal 5.2: Outcome log. Record what really happened to a person; the app checks what it would have said at that time
   and keeps an honest score per life area, shown next to the score a coin-toss style guess would get (chance level). */
var LOG_AREAS = [['health', 'Health'], ['career', 'Career'], ['money', 'Money'], ['marriage', 'Marriage'], ['family', 'Family'], ['education', 'Education'], ['travel', 'Travel / move']];
V4I.log = '<path d="M6 3h9l3 3v15H6z"/><path d="M9 11l2 2 4-4M9 17h6"/>';
function logOf(p) { return ((DB.events || {})[p.id] || []).slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; }); }
function logDate(e) { var d = e.date.split('-'); return new Date(Date.UTC(+d[0], +d[1] - 1, +(d[2] || 15), 6, 30)); }
function logArea(a) { return (LOG_AREAS.filter(function (x) { return x[0] === a; })[0] || [a, a])[1]; }

/* check one event against what the app says for that date */
function logCheck(p, e) {
  var c = calcP(p), at = logDate(e), key = 'lg|' + p.id + '|' + e.id + '|' + e.date + '|' + e.kind + '|' + (e.prob || '');
  if (MA_CACHE[key]) return MA_CACHE[key];
  var r = { score: null, lines: [] };
  if (at < c.birth) { r.lines.push('This date is before birth.'); return (MA_CACHE[key] = r); }
  if (e.area === 'health' && e.kind === 'bad') {
    if (!e.day) { r.lines.push('Add the exact day: health alerts are checked to the day.'); }
    else {
      var R = maOf(p), list = condOf(p).concat(chartTop(p, 2).filter(function (t) { return /Strong/.test(t.r.tend); }).map(function (t) { return t.id; })).concat(['general']);
      var from = new Date(at.getTime() - 45 * 864e5), ws = ALERT.forPerson(c, R, list, from, 60, condOf(p)), cov = 0;
      for (var d = 0; d < 60; d++) { var t = from.getTime() + d * 864e5; if (ws.some(function (w) { return t >= w.start.getTime() - 2 * 864e5 && t <= w.end.getTime() + 2 * 864e5; })) cov++; }
      var hit = ws.filter(function (w) { return at.getTime() >= w.start.getTime() - 2 * 864e5 && at.getTime() <= w.end.getTime() + 2 * 864e5; })[0];
      r.score = hit ? 1 : 0; r.chance = cov / 60;
      r.lines.push(hit ? 'Alert said: ' + (hit.level === 'high' ? 'high-care' : 'watch') + ' window ' + alRange(hit) + ' (' + alProbs(hit).toLowerCase() + ').' : 'No alert window covered this day.');
      r.lines.push('By chance, about ' + Math.round(r.chance * 100) + '% of days around it were inside a window.');
    }
    if (e.prob) { var rk = DISEASE.rank(DISEASE.analyze(c)).filter(function (id) { return mcList(p).some(function (x) { return x.id === id; }); }), pos = rk.indexOf(e.prob) + 1;
      if (pos) { r.prob = pos <= 3 ? 1 : pos <= 5 ? 0.5 : 0; r.lines.push(v5pname(e.prob) + ' is #' + pos + ' of ' + rk.length + ' in the chart reading' + (pos <= 3 ? ' (shown on the Health screen).' : '.')); } }
    return (MA_CACHE[key] = r);
  }
  /* every other event: the dasha verdict running at that time */
  var md = J.find(c.maha, at), ad = md ? J.find(J.subPeriods(md), at) : null;
  if (md && ad) {
    var v = JUDGE.period(c, md.lord, ad.lord), want = e.kind === 'good' ? 'g' : 'b';
    r.score = v.v === want ? 1 : v.v === 'm' || !v.v ? 0.5 : 0;
    /* chance: how often each verdict comes up across this person's adult life */
    var n = 0, same = 0, mix = 0; c.maha.forEach(function (m) { J.subPeriods(m).forEach(function (a) { var y = (a.start - c.birth) / (365.25 * 864e5); if (y < 18 || y > 75) return; var w = JUDGE.period(c, m.lord, a.lord).v; n++; if (w === want) same++; else if (w === 'm' || !w) mix++; }); });
    r.chance = n ? (same + 0.5 * mix) / n : 0.5;
    r.lines.push('Running then: ' + PN[md.lord] + ' Mahadasha, ' + PN[ad.lord] + ' sub-period. The app calls it ' + v.word.toLowerCase() + '.');
    r.lines.push(r.score === 1 ? 'Matches what happened.' : r.score === 0.5 ? 'Half credit: the app said mixed.' : 'Does not match what happened.');
  }
  return (MA_CACHE[key] = r);
}
function logStats(ps) {
  var A = {}; ps.forEach(function (p) { logOf(p).forEach(function (e) { var r = logCheck(p, e); if (r.score === null) return; var a = A[e.area] = A[e.area] || { n: 0, s: 0, ch: 0 }; a.n++; a.s += r.score; a.ch += r.chance; }); });
  return A;
}
function logBar(a) { var pc = Math.round(100 * a.s / a.n), ch = Math.round(100 * a.ch / a.n); return '<div class="lgbar"><i style="width:' + pc + '%"></i><em style="left:' + ch + '%"></em></div><small>' + pc + '% right on ' + a.n + ' event' + (a.n > 1 ? 's' : '') + ' · chance level ' + ch + '%' + (a.n < 10 ? ' · too few to judge yet' : pc - ch >= 15 ? ' · clearly better than chance' : pc > ch ? ' · a little better than chance' : ' · not better than chance') + '</small>'; }

function LogScreen() {
  var p = curP(); if (!p) return noPerson();
  var evs = logOf(p), all = U.lgAll, S = logStats(all ? DB.people : [p]), n1 = p.name.split(' ')[0];
  var h = x3Head('Outcome log', 'Real events, checked against the app', p, '<div class="v4cchips">' + [['0', n1], ['1', 'Everyone']].map(function (x) { return '<button data-act="lgAll" data-v="' + x[0] + '" class="' + ((all ? '1' : '0') === x[0] ? 'on' : '') + '">' + esc(x[1]) + '</button>'; }).join('') + '</div>');
  h += '<div class="v4sec"><h2>How right the app is' + (all ? ' for everyone' : ' for ' + esc(n1)) + '</h2></div><div class="v4card">';
  var ks = LOG_AREAS.filter(function (a) { return S[a[0]]; });
  h += ks.length ? ks.map(function (a) { return '<div class="lgrow"><b>' + a[1] + '</b>' + logBar(S[a[0]]) + '</div>'; }).join('') + '<p class="v4note">The dark mark is chance level: the score a guess would get. The app earns trust only where its bar clearly passes that mark, over 10 or more events.</p>'
    : '<p class="v4note" style="margin:4px 0">No events yet. Add what really happened, with the month and year: illness or hospital visits (with the day), job changes, money gains or losses, marriage, a move.</p>';
  h += '</div>';
  if (!all) {
    h += '<button class="v4btn" data-act="lgAdd" style="margin:4px 14px 10px;width:calc(100% - 28px)">Add a real event</button>';
    if (evs.length) h += '<div class="v4sec"><h2>Events</h2></div>' + evs.map(function (e) { var r = logCheck(p, e), k = r.score === null ? 'w' : r.score === 1 ? 'g' : r.score === 0.5 ? 'w' : 'b';
      return '<div class="v4card lgev"><div class="lgh"><div><b>' + esc(logArea(e.area)) + ': ' + (e.kind === 'good' ? 'good event' : 'difficult event') + '</b><small>' + (e.day ? N.dmy(logDate(e)) : V4MON[+e.date.split('-')[1] - 1] + ' ' + e.date.split('-')[0]) + (e.note ? ' · ' + esc(e.note) : '') + '</small></div>' + v4chip(k, r.score === null ? 'Not checked' : r.score === 1 ? 'App was right' : r.score === 0.5 ? 'Partly' : 'App missed') + '</div><ul class="v4why">' + r.lines.map(function (t) { return '<li class="z"><i>·</i><span>' + esc(t) + '</span></li>'; }).join('') + '</ul><button class="v4link" data-act="lgDel" data-id="' + e.id + '">Remove</button></div>'; }).join('');
  } else {
    h += '<div class="v4card">' + DB.people.map(function (q) { var n = logOf(q).length; return n ? '<div class="alline"><b>' + esc(q.name) + '</b><span>' + n + ' event' + (n > 1 ? 's' : '') + '</span></div>' : ''; }).join('') + '</div>';
  }
  return h + '<div style="height:80px"></div>';
}
ACT.lgAll = function (el) { U.lgAll = el.dataset.v === '1'; rerender(); };
ACT.lgAdd = function () {
  var p = curP(), today = new Date().toISOString().slice(0, 10);
  sheet('<div class="pad lgform"><h3>Add a real event for ' + esc(p.name.split(' ')[0]) + '</h3>' +
    '<label>Area</label><div class="v4areas lgpick" id="lgArea">' + LOG_AREAS.map(function (a, i) { return '<button data-act="lgPick" data-g="lgArea" data-v="' + a[0] + '" class="' + (i === 0 ? 'on' : '') + '">' + a[1] + '</button>'; }).join('') + '</div>' +
    '<label>What kind</label><div class="v4areas lgpick" id="lgKind"><button data-act="lgPick" data-g="lgKind" data-v="bad" class="on">Difficult</button><button data-act="lgPick" data-g="lgKind" data-v="good">Good</button></div>' +
    '<label>When</label><input class="inp" type="date" id="lgDate" max="' + today + '"><p class="v4note">For health, the exact day matters. For other areas, any day in the right month is fine.</p>' +
    '<div id="lgProbW"><label>Which health problem (optional)</label><select class="inp" id="lgProb"><option value="">Not sure / other</option>' + mcList(p).map(function (x) { return '<option value="' + x.id + '">' + esc(x.n) + '</option>'; }).join('') + '</select></div>' +
    '<label>Note (optional)</label><input class="inp" id="lgNote" maxlength="80" placeholder="e.g. hospital, BP 170/110">' +
    '<button class="v4btn" data-act="lgSave">Save and check</button></div>');
};
ACT.lgPick = function (el) { var g = document.getElementById(el.dataset.g); [].forEach.call(g.querySelectorAll('button'), function (b) { b.classList.toggle('on', b === el); }); if (el.dataset.g === 'lgArea') document.getElementById('lgProbW').style.display = el.dataset.v === 'health' ? '' : 'none'; };
ACT.lgSave = function () {
  var p = curP(), v = function (id) { var on = document.querySelector('#' + id + ' button.on'); return on ? on.dataset.v : ''; }, d = (document.getElementById('lgDate') || {}).value;
  if (!d) { toast('Pick the date first'); return; }
  var area = v('lgArea'), e = { id: 'e' + Date.now().toString(36), area: area, kind: v('lgKind'), date: d, day: true, note: (document.getElementById('lgNote').value || '').trim() };
  if (area === 'health') { var pr = document.getElementById('lgProb').value; if (pr) e.prob = pr; }
  DB.events = DB.events || {}; (DB.events[p.id] = DB.events[p.id] || []).push(e); save(); closeSheet(); rerender();
};
ACT.lgDel = function (el) { var p = curP(), a = (DB.events || {})[p.id] || []; DB.events[p.id] = a.filter(function (e) { return e.id !== el.dataset.id; }); if (!DB.events[p.id].length) delete DB.events[p.id]; save(); rerender(true); };

(function () {
  var r0 = render; render = function () {
    var pr = parts(); if (pr[0] !== 'outcomes') return r0();
    applySettings(); var html; try { html = LogScreen(); } catch (e) { html = '<div class="empty"><h2>Something went wrong</h2>' + esc(e.message) + '</div>'; if (window.console) console.error(e); }
    $('#app').innerHTML = html; $('#nav').innerHTML = NAVS.map(function (x) { return '<button data-go="' + x[0] + '" class="' + (x[0] === 'astro' ? 'on' : '') + '">' + icon(x[0]) + x[1] + '</button>'; }).join('');
    document.body.setAttribute('data-scr', 'outcomes'); window.scrollTo(0, U.keepY || 0);
  };
  var a0 = AstroV2; AstroV2 = function (id) {
    var h = a0(id), i = h.indexOf('<div class="v4tiles v5t4">'); if (i < 0) return h; var p = curP(), n = p ? logOf(p).length : 0;
    return h.slice(0, i) + '<button class="v4card x3promo" data-go="outcomes"><span class="gl">' + v4i('log') + '</span><div><b>Outcome log</b><small>' + (n ? n + ' real event' + (n > 1 ? 's' : '') + ' checked against the app' : 'Add real events and see how often the app is right') + '</small></div><span class="ar">›</span></button>' + h.slice(i);
  };
  var mh = MedHome; MedHome = function () { var h = mh(), i = h.indexOf('<details class="v4card v4det2"'); return i < 0 ? h : h.slice(0, i) + '<button class="v4link alall" data-go="outcomes">Log a real illness or hospital visit, and see if the app caught it ›</button>' + h.slice(i); };
  var ff = fixedFacts; fixedFacts = function (p, c) { var s = ff(p, c), ev = logOf(p); return ev.length ? s + 'REAL EVENTS LOGGED: ' + ev.slice(0, 12).map(function (e) { return e.date + ' ' + e.area + ' ' + (e.kind === 'good' ? 'good' : 'difficult') + (e.prob ? ' (' + v5pname(e.prob) + ')' : '') + (e.note ? ' — ' + e.note : ''); }).join('; ') + '. Use these to judge which periods have actually worked for this person.\n' : s; };
})();
