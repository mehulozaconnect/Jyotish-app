/* Trikaal 5.0: fewer, tested claims.
   Health no longer guesses which illness a person has. The user records what a doctor has confirmed (known conditions);
   the app times those and watches general health with dated alert windows. Palm, face and the 360° reading are removed. */
var DISEASE = makeDisease(J);
(function () {
  if (DB.palm) delete DB.palm; if (DB.face) delete DB.face;
  DB.cond = DB.cond || {};
})();
function condOf(p) { var o = mcOpt(p); return ((DB.cond || {})[p.id] || []).filter(function (id) { return MC.P.some(function (x) { return x.id === id && !x.hidden && !(x.fem && o.gender !== 'F'); }); }); }
function chartTop(p, n) {
  var c = calcP(p), r = DISEASE.analyze(c), ok = mcList(p).map(function (x) { return x.id; }), known = condOf(p);
  return DISEASE.rank(r).filter(function (id) { return ok.indexOf(id) >= 0 && known.indexOf(id) < 0 && /Strong|Moderate/.test(r[id].tend); }).slice(0, n || 3).map(function (id) { return { id: id, r: r[id] }; });
}
function v5pname(id) { var pr = MC.P.filter(function (x) { return x.id === id; })[0]; return pr ? pr.n : id; }

MedHome = function () {
  var p = curP(); if (!p) return topBar('Health', { noPerson: true }) + noPerson();
  var R = maOf(p), c = calcP(p), n1 = p.name.split(' ')[0], you = relOf(p) === 'me' ? 'you' : n1, known = condOf(p), now = new Date();
  var h = '<div class="v4plain"><div><h1 class="v4h1">Health</h1><p>' + esc(R.dosha.type) + ' body. Recovery power ' + R.lagna.score + ' of 5</p></div><div><button class="v4pill l" data-act="pickPerson">' + esc(n1) + ' ▾</button></div></div>';
  /* 1. dated alert windows: the one part tested against real events */
  var ws = alertsOf(p).filter(function (w) { return w.start - todayStart(0) <= 45 * 864e5; }), first = ws[0];
  h += '<div class="v4sec"><h2>Health alerts</h2><span>next 45 days</span></div>';
  h += first ? alCard(p, first, true) + (ws.length > 1 ? '<div class="v4card"><div class="lbl">Later</div>' + ws.slice(1, 4).map(function (w) { return '<div class="alline"><span class="ald ' + (w.level === 'high' ? 'hi' : 'wa') + '"></span><b>' + alRange(w) + '</b><span>' + esc(alProbs(w)) + '</span></div>'; }).join('') + '</div>' : '')
    : '<div class="v4card alc ok"><div class="alh"><span class="ald"></span><div><b>No health window in the next 45 days</b><small>Keep the routine and the yearly check-ups.</small></div></div></div>';
  h += '<button class="v4link alall" data-go="alerts">Health alerts for everyone in my list ›</button>';
  /* 2. what the chart itself shows: the classical 6th/8th-house reading */
  var top = chartTop(p, 3);
  h += '<div class="v4sec"><h2>What the chart shows</h2></div><div class="v4card">' + (top.length ? top.map(function (t) {
      return '<button class="v4row tap" data-go="medical/case/' + t.id + '"><div style="flex:1"><b>' + esc(v5pname(t.id)) + '</b><p>' + esc(t.r.why.slice(0, 2).map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join('. ')) + '.</p></div>' + v4chip(/Strong/.test(t.r.tend) ? 'b' : 'w', /Strong/.test(t.r.tend) ? 'Strong' : 'Moderate') + '</button>'; }).join('') +
      '<p class="v4note" style="margin:8px 0 2px">Read from the 6th and 8th houses, their lords and malefic groupings, compared with 1,500 other charts. A tendency, not a diagnosis: confirm with a check-up.</p>'
    : '<p class="v4note" style="margin:4px 0">No body area stands out in this chart compared with other charts.</p>') + '</div>';
  /* 3. known conditions, timed */
  h += '<div class="v4sec"><h2>Known conditions</h2></div><div class="v4card">';
  if (known.length) {
    var all = mcAll(p);
    h += known.map(function (id) { var a = all[id] || MC.analyze(c, R, id, now), nw = a.knownWord || a.nowWord, s0 = (a.sens || []).filter(function (x) { return x.end > now; })[0];
      var line = nw === 'Active now' ? 'The running period and a transit both touch it now: be regular with medicine and tests.' : nw === 'Watch now' ? 'The running period touches it lightly: keep the routine.' : 'Nothing in the chart stirs it right now.';
      return '<button class="v4row tap" data-go="medical/case/' + id + '"><div style="flex:1"><b>' + esc(v5pname(id)) + '</b><p>' + esc(line) + (s0 ? ' More sensitive: ' + PN[s0.md] + '–' + PN[s0.ad] + ', ' + N.dmy(s0.start) + ' to ' + N.dmy(s0.end) + '.' : '') + '</p></div>' + v4chip(nw === 'Active now' ? 'b' : nw === 'Watch now' ? 'w' : 'g', nw.replace(' now', '')) + '</button>'; }).join('');
  } else h += '<p class="v4note" style="margin:4px 0 8px">None added. Add only what a doctor has confirmed for ' + esc(you) + '. The app does not guess illnesses from the chart; it times the ones you add and watches them in the alerts.</p>';
  h += '<button class="v4btn" data-act="v5cond">' + (known.length ? 'Add or change conditions' : 'Add a known condition') + '</button></div>';
  /* 3. look up a problem (for astrologers; shows the chart tendency with an honest label) */
  var q0 = (U.mcQ || '').toLowerCase().trim(), list = mcList(p), shown = q0 ? list.filter(function (x) { return (x.n + ' ' + x.alt).toLowerCase().indexOf(q0) >= 0 || x.re.test(q0); }) : [];
  h += '<details class="v4card v4det2"' + (q0 ? ' open' : '') + '><summary>Look up a problem in the chart</summary><p class="v4note">Chart tendencies are not proven against real cases, so treat them as a talking point, never a diagnosis.</p><input class="inp" id="mcSearch" data-in="mcQ" placeholder="Search BP, thyroid, knee, sleep…" value="' + esc(U.mcQ || '') + '"><div class="v4areas" style="padding:8px 0 0">' +
    (q0 ? (shown.length ? shown.map(function (x) { return '<button data-go="medical/case/' + x.id + '">' + esc(x.n.split(' / ')[0]) + '</button>'; }).join('') : '<p class="v4note">Nothing matches. Try another word.</p>') : '') + '</div></details>';
  h += '<details class="v4card v4det2"><summary>Full health chart (for astrologers)</summary>' + [['overview', 'Recovery power and body type'], ['planets', 'Planets and health'], ['timing', 'Dasha, transits and 12-month calendar'], ['remedies', 'Remedy plan'], ['muhurta', 'Pick a treatment date']].map(function (t) { return '<button class="v4link" data-go="medical/' + t[0] + '">' + t[1] + ' ›</button>'; }).join('') + '</details>';
  return h + maSafety() + '<div style="height:70px"></div>';
};
ACT.v5cond = function () {
  var p = curP(), on = condOf(p);
  sheet('<div class="pad"><h3 style="font:600 18px var(--sans);margin:4px 0 4px">Known conditions</h3><p class="v4note" style="margin:0 0 10px">Tick what a doctor has confirmed for ' + esc(p.name.split(' ')[0]) + '.</p>' + mcList(p).map(function (x) { return '<button class="mcrow v5c' + (on.indexOf(x.id) >= 0 ? ' on' : '') + '" data-act="v5condT" data-id="' + x.id + '"><div><b>' + esc(x.n) + '</b></div><span class="v5tick"></span></button>'; }).join('') + '<button class="v4btn" data-act="v5done">Done</button></div>');
};
ACT.v5condT = function (el) { var p = curP(), id = el.dataset.id, a = (DB.cond[p.id] = DB.cond[p.id] || []), i = a.indexOf(id); if (i >= 0) a.splice(i, 1); else a.push(id); if (!a.length) delete DB.cond[p.id]; el.classList.toggle('on', i < 0); save(); AL_CACHE = {}; rerender(true); };
ACT.v5done = function () { closeSheet(); rerender(true); };

/* problem page: a confirmed condition is about timing, not likelihood */
(function () {
  var mc = MedCaseScreen; MedCaseScreen = function (id) {
    var h = mc(id), p = curP(); if (!h || !p || condOf(p).indexOf(id) < 0) return h;
    var i = h.indexOf('<div class="v4card"><b class="hd">How likely'), j = i >= 0 ? h.indexOf('<div class="v4card', i + 20) : -1;
    var note = '<div class="v4card v5known"><b>Confirmed condition</b><p>A doctor has confirmed this, so the chart is used only for timing: when it is more sensitive, and when treatment and new routines go better.</p></div>';
    if (i >= 0 && j > i) h = h.slice(0, i) + note + h.slice(j);
    var a = MC.analyze(calcP(p), maOf(p), id, new Date()), nw = a.knownWord, b0 = h.indexOf('<div class="v4case">'), b1 = b0 >= 0 ? h.indexOf('</p></div>', b0) : -1;
    if (b0 >= 0 && b1 > b0) h = h.slice(0, b0) + '<div class="v4case"><div class="big">' + (nw === 'Active now' ? 'Active now: take extra care' : nw === 'Watch now' ? 'Keep a watch now' : 'Quiet now') + '</div><p>' + (nw === 'Active now' ? 'The running sub-period lord is linked to this problem and is also over it in transit.' : nw === 'Watch now' ? 'The running period is linked to this problem, but the transits do not fully agree.' : 'Neither the running period nor the transits stir it now; keep the basics going.') + '</p></div>' + h.slice(b1 + 10);
    return h;
  };
  var ff = fixedFacts; fixedFacts = function (p, c) {
    var s = ff(p, c), k = condOf(p); return s + 'KNOWN HEALTH CONDITIONS (confirmed by a doctor): ' + (k.length ? k.map(v5pname).join(', ') : 'none recorded') + '. Do not guess other illnesses from the chart; only time these and the general health alerts.\n';
  };
})();
