/* Trikaal app: Today (My day, Panchang, Muhurat, KP Prashna) */
var TSEG = [['day', 'My day'], ['panchang', 'Panchang'], ['muhurat', 'Muhurat'], ['prashna', 'Prashna']];
function TodayScreen(seg) {
  if (!TSEG.some(function (x) { return x[0] === seg; })) seg = 'day';
  U.tseg = seg;
  var L = DB.settings.loc;
  var h = '<div class="top">' + LOGO + '<span class="ttl">Today</span><span class="sp"></span><button class="pill" data-act="pickLoc" style="padding:7px 11px">' + esc(L.name) + ' ▾</button></div>';
  h += '<div class="tabs">' + TSEG.map(function (x) { return '<button data-go="today/' + x[0] + '" class="' + (x[0] === seg ? 'on' : '') + '">' + x[1] + '</button>'; }).join('') + '</div>';
  return h + ({ day: MyDayView, panchang: PanchangView, muhurat: MuhuratView, prashna: PrashnaView }[seg])();
}
function dayNav() {
  var d = todayStart(U.dayOff), wd = new Date(d.getTime() + locOff() * 3600e3 + 6 * 3600e3).getUTCDay();
  return '<div class="segw"><button class="ib" data-act="dayOff" data-v="-1">' + icon('chevL') + '</button><div style="text-align:center"><b>' + J.VARAS[wd] + ' ' + N.dmy(new Date(d.getTime() + 6 * 3600e3)) + '</b>' + (U.dayOff ? '<div><button class="mut" style="font-size:12px;text-decoration:underline" data-act="dayOff" data-v="0">Back to today</button></div>' : '<div class="mut" style="font-size:12px">Today</div>') + '</div><button class="ib" data-act="dayOff" data-v="1">' + icon('chevR') + '</button></div>';
}
ACT.dayOff = function (el) { var v = +el.dataset.v; U.dayOff = v === 0 ? 0 : U.dayOff + v; rerender(true); };

/* ---------- My day ---------- */
function MyDayView() {
  var p = me(); if (!p) return emptyState('Add your kundli first', 'My day combines today’s Moon, your dasha and your transits.', '<br><button class="btn acc" data-go="edit/new">Add my kundli</button>');
  var c = calcP(p), L = DB.settings.loc, now = new Date(), d0 = todayStart(U.dayOff), D = N.myDay(c, d0, L.lat, L.lon, U.dayOff ? new Date(d0.getTime() + 10 * 3600e3) : now), pc = D.pc;
  var lm = J.lunarMonth(pc.rise);
  var h = dayNav() + '<div class="pad">';
  h += '<div class="mut" style="font-size:13px">' + esc(p.name) + ' · ' + lm.name + (lm.adhik ? ' (Adhik)' : '') + ' ' + pc.tithi.paksha + ' ' + pc.tithi.name + '</div><div style="font:500 34px/1.1 var(--serif);margin:4px 0 6px">' + D.word + '</div>';
  /* next strong day if not strong */
  var nextGood = null;
  if (D.score.v !== 'push') for (var i = 1; i <= 10; i++) { var dd = todayStart(U.dayOff + i), pl = J.panchangLite(dd, L.lat, L.lon), wd = new Date(pl.rise.getTime() + locOff() * 3600e3).getUTCDay(); if (N.dayScore(c, pl, wd).v === 'push') { nextGood = { d: pl.rise, wd: wd }; break; } }
  h += '<p style="font-size:14.5px;line-height:1.5;margin-bottom:12px">' + esc(D.guide) + (nextGood ? ' Next strong day: <b>' + J.VARAS[nextGood.wd] + ' ' + N.dmY(nextGood.d) + '</b>.' : '') + '</p>';
  h += '<div class="card"><div class="lbl" style="margin-bottom:6px">Why</div>' + D.why.map(function (w) { return '<div class="pc-row">' + itemIcon(w.val > 0 ? 'pro' : w.val < 0 ? 'con' : 'info') + '<span><b>' + esc(w.label) + ':</b> ' + esc(w.why) + '</span></div>'; }).join('') + D.focus.map(function (f) { return '<div class="pc-row">' + itemIcon('info') + '<span>' + esc(f) + '</span></div>'; }).join('') + D.slow.map(function (s) { return '<div class="pc-row">' + itemIcon(/\(bad\)/.test(s) ? 'con' : /\(good\)/.test(s) ? 'pro' : 'info') + '<span>Background: ' + esc(s) + '</span></div>'; }).join('') + '</div>';
  /* best windows */
  var best = D.best.slice(0, 4), parts = D.parts;
  h += '<div class="card"><div class="grid2"><div><div class="lbl" style="color:var(--good)">Best for calls and deals</div>' + (best.length ? best.map(function (b) { return '<div class="mono" style="font-size:17px;font-weight:600;margin-top:4px">' + N.hm(b.start) + '–' + N.hm(b.end) + '</div><div class="mut" style="font-size:11.5px">' + PN[b.lord] + ' hora: ' + KB.HORA_USE[b.lord] + '</div>'; }).join('') : '<div class="mut" style="margin-top:4px">No clean benefic hora between 8:00 and 20:00.</div>') + '</div>' +
    '<div><div class="lbl" style="color:var(--bad)">Avoid starting</div><div class="mono" style="font-size:17px;font-weight:600;margin-top:4px">' + N.hm(parts.rahu.start) + '–' + N.hm(parts.rahu.end) + '</div><div class="mut" style="font-size:11.5px">Rahu Kaal</div><div class="mono" style="font-size:15px;font-weight:600;margin-top:6px">' + N.hm(parts.yama.start) + '–' + N.hm(parts.yama.end) + '</div><div class="mut" style="font-size:11.5px">Yamaganda</div></div></div></div>';
  /* tips */
  var tips = [], ma = D.tr.filter(function (x) { return x.code === 'Ma'; })[0], k = c.k;
  if (best[0]) tips.push(['pro', 'Work', 'Proposals and follow-ups in the ' + N.hm(best[0].start) + ' window.']);
  if (ma && [1, 6, 8, 12].indexOf(ma.h) >= 0) tips.push(['con', 'Health', 'Mars in your ' + nth(ma.h) + ': light, early dinner; no fried food; drive carefully.']);
  var chW = J.signWindows('Mo', (k.P.Mo.sign + 7) % 12, pc.rise, new Date(pc.rise.getTime() + 6 * 864e5), 3)[0];
  if (chW) tips.push(['con', 'Heads-up', 'Chandrashtama ' + (chW.start ? 'from ' + N.dmY(chW.start) + ' ' + N.hm(chW.start) : 'now') + (chW.end ? ' to ' + N.dmY(chW.end) + ' ' + N.hm(chW.end) : '') + '.']);
  var vs = J.vishtiWindows(pc.rise, pc.set); if (vs.length) tips.push(['con', 'Bhadra', vs.map(function (w) { return N.hm(w.start) + '–' + N.hm(w.end); }).join(', ') + ': avoid new starts.']);
  if (D.sade.q === 'bad') tips.push(['info', D.sade.label, 'Keep commitments realistic; Saturday Hanuman Chalisa or Shani mantra helps.']);
  tips.push(['info', 'Direction', 'Disha shool to the ' + KB.DISHA_SHOOL[D.wd] + ' today; avoid starting travel that way.']);
  h += '<div class="card">' + tips.map(function (t) { return '<div class="pc-row">' + itemIcon(t[0]) + '<span><b>' + esc(t[1]) + ':</b> ' + esc(t[2]) + '</span></div>'; }).join('') + '</div>';
  /* horas */
  var nowT = new Date();
  h += '<div class="card"><h3>Horas today</h3><div class="chog">' + D.horas.filter(function (x) { return x.day; }).map(function (x) { var q = ['Ju', 'Ve', 'Me', 'Mo'].indexOf(x.lord) >= 0 ? 'g' : x.lord === 'Sa' || x.lord === 'Ma' ? 'b' : 'm'; return '<div class="cg ' + q + (nowT >= x.start && nowT < x.end ? ' nowc' : '') + '">' + PN[x.lord] + '<span>' + N.hm(x.start) + '</span></div>'; }).join('') + '</div></div>';
  U.shareFn = null;
  return h + '</div>';
}

/* ---------- Panchang ---------- */
function PanchangView() {
  var L = DB.settings.loc, d0 = todayStart(U.dayOff), pc = J.panchang(d0, L.lat, L.lon), wd = new Date(pc.rise.getTime() + locOff() * 3600e3).getUTCDay(), now = new Date();
  var lm = J.lunarMonth(pc.rise), sv = J.samvat(pc.rise, lm.name), parts = J.dayParts(pc.rise, pc.set, wd), cg = J.choghadiya(pc.rise, pc.set, pc.nextRise, wd), vs = J.vishtiWindows(pc.rise, pc.nextRise);
  var h = dayNav() + '<div class="pad">';
  h += '<div class="card dark"><div class="lbl">' + esc(L.name) + '</div><div style="font:500 22px/1.2 var(--serif);margin:4px 0">' + lm.name + (lm.adhik ? ' (Adhik)' : '') + ' ' + pc.tithi.paksha + ' ' + pc.tithi.name + '</div><p>' + J.VARAS[wd] + ' (' + J.VARAS_HI[wd] + ') · Vikram Samvat ' + sv.vikram + ' · Shaka ' + sv.shaka + '</p></div>';
  h += '<div class="card"><h3>Panchang</h3><dl class="kv">' +
    '<dt>Tithi</dt><dd>' + pc.tithi.paksha + ' ' + pc.tithi.name + '<small>until ' + N.dmyt(pc.tithiEnd) + '</small></dd>' +
    '<dt>Nakshatra</dt><dd>' + pc.nak.name + ' (pada ' + pc.nak.pada + ', lord ' + PN[pc.nak.lord] + ')<small>until ' + N.dmyt(pc.nakEnd) + '</small></dd>' +
    '<dt>Yoga</dt><dd>' + pc.yoga.name + '<small>until ' + N.dmyt(pc.yogaEnd) + '</small></dd>' +
    '<dt>Karana</dt><dd>' + pc.karana.name + '<small>until ' + N.dmyt(pc.karanaEnd) + '</small></dd>' +
    '<dt>Vara</dt><dd>' + J.VARAS[wd] + '<small>lord ' + PN[J.VARA_LORD[wd]] + '</small></dd>' +
    '<dt>Moon sign</dt><dd>' + SG[pc.moonSign] + '<small>until ' + N.dmyt(pc.moonSignEnd) + '</small></dd>' +
    '<dt>Sun sign</dt><dd>' + SG[J.signOf(pc.sunLon)] + ' ' + J.dm(pc.sunLon) + '</dd>' +
    '<dt>Sunrise</dt><dd>' + N.hm(pc.rise) + '<small>Sunset ' + N.hm(pc.set) + '</small></dd>' +
    '<dt>Moonrise</dt><dd>' + (pc.moonrise ? N.hm(pc.moonrise) : '–') + '<small>Moonset ' + (pc.moonset ? N.hm(pc.moonset) : '–') + '</small></dd></dl></div>';
  function win(lbl, w, q, note) { return '<div class="row" style="padding:8px 0;border-top:1px solid var(--line)"><span><b>' + lbl + '</b>' + (note ? '<br><small class="mut">' + note + '</small>' : '') + '</span><span class="mono" style="font-weight:600;color:' + (q === 'g' ? 'var(--good)' : q === 'b' ? 'var(--bad)' : 'inherit') + '">' + N.hm(w.start) + '–' + N.hm(w.end) + '</span></div>'; }
  h += '<div class="card"><h3>Good and bad times</h3><div style="margin-top:-8px">' + win('Brahma muhurta', parts.brahma, 'g', 'meditation, study') + (parts.abhijit.wednesday ? '' : win('Abhijit muhurta', parts.abhijit, 'g', 'good for any start')) + win('Rahu Kaal', parts.rahu, 'b') + win('Yamaganda', parts.yama, 'b') + win('Gulika', parts.gulika, 'b') + vs.map(function (w) { return win('Bhadra (Vishti)', w, 'b', N.dmY(w.start) + (w.end.getDate && N.dmY(w.end) !== N.dmY(w.start) ? ' → ' + N.dmY(w.end) : '')); }).join('') + '</div><div class="note">Disha shool: ' + KB.DISHA_SHOOL[wd] + '.' + (parts.abhijit.wednesday ? ' Abhijit is not used on Wednesday.' : '') + '</div></div>';
  h += '<div class="card"><h3>Choghadiya · day</h3><div class="chog">' + cg.day.map(function (x) { return '<div class="cg ' + (x.q === 'good' ? 'g' : x.q === 'bad' ? 'b' : 'm') + (now >= x.start && now < x.end ? ' nowc' : '') + '">' + x.name + '<span>' + N.hm(x.start) + '</span></div>'; }).join('') + '</div><h3 style="margin-top:12px">Choghadiya · night</h3><div class="chog">' + cg.night.map(function (x) { return '<div class="cg ' + (x.q === 'good' ? 'g' : x.q === 'bad' ? 'b' : 'm') + (now >= x.start && now < x.end ? ' nowc' : '') + '">' + x.name + '<span>' + N.hm(x.start) + '</span></div>'; }).join('') + '</div><div class="note">Green: Amrit, Shubh, Labh. Grey: Char (good for travel). Red: Udveg, Kaal, Rog.</div></div>';
  var hs = J.horas(pc.rise, pc.set, pc.nextRise, wd);
  h += '<div class="card"><h3>Hora</h3><div class="chog">' + hs.map(function (x) { return '<div class="cg ' + (['Ju', 'Ve', 'Me', 'Mo'].indexOf(x.lord) >= 0 ? 'g' : x.lord === 'Sa' || x.lord === 'Ma' ? 'b' : 'm') + (now >= x.start && now < x.end ? ' nowc' : '') + '">' + PN[x.lord] + '<span>' + N.hm(x.start) + '</span></div>'; }).join('') + '</div></div>';
  /* special yogas */
  var sp = []; if (KB.AMRIT[wd] === pc.nak.index) sp.push('Amrit Siddhi yoga'); if (KB.SARVARTHA[wd].indexOf(pc.nak.index) >= 0) sp.push('Sarvartha Siddhi yoga'); if (pc.nak.index === 7 && wd === 4) sp.push('Guru Pushya yoga'); if (pc.nak.index === 7 && wd === 0) sp.push('Ravi Pushya yoga');
  if (sp.length) h += '<div class="card hlg"><b>Special today:</b> ' + sp.join(', ') + ' (while ' + pc.nak.name + ' lasts, until ' + N.hm(pc.nakEnd) + ').</div>';
  return h + '<div class="note" style="margin:0 2px 14px">Amanta month. Times for ' + esc(L.name) + ' (' + fmtOff(locOff()) + '). Sunrise uses the upper limb with refraction.</div></div>';
}

/* ---------- Muhurat ---------- */
function MuhuratView() {
  var L = DB.settings.loc, p = me(), opts = Object.keys(KB.MUHURAT).map(function (x) { return [x, KB.MUHURAT[x].l]; });
  var forWho = U.mfor === undefined ? (p ? p.id : '') : U.mfor;
  var h = '<div class="pad"><div class="card"><div class="field"><span>PURPOSE</span>' + sel('mpurpose', opts, U.mpurpose) + '</div><div class="grid2"><div class="field" style="margin-bottom:0"><span>LOOK AHEAD</span>' + sel('mdays', [[30, '30 days'], [60, '60 days'], [90, '90 days'], [180, '6 months']], U.mdays) + '</div><div class="field" style="margin-bottom:0"><span>CHECK TARA FOR</span>' + sel('mfor', [['', 'Nobody']].concat(DB.people.map(function (x) { return [x.id, x.name]; })), forWho) + '</div></div></div>';
  var c = forWho ? calcP(person(forWho)) : null, list = N.muhurat(U.mpurpose, todayStart(0), U.mdays, L.lat, L.lon, locOff(), c);
  if (!list.length) h += emptyState('No clean muhurat', 'Nothing in this window passes all the checks. Try a longer window or check without a personal tara.');
  list.slice(0, 25).forEach(function (m) {
    h += '<div class="card"><div class="row"><b style="font-size:15px">' + J.VARAS[m.wd] + ' ' + N.dmy(new Date(m.rise.getTime())) + '</b>' + (m.special.length ? '<span class="vc g">' + esc(m.special[0]) + '</span>' : '') + '</div><div class="mut" style="font-size:12.5px;margin:3px 0 8px">' + esc(m.why.join(' · ')) + '</div><div class="dots">' + m.windows.map(function (w) { return '<span class="tag g">' + w.name + ' ' + N.hm(w.start) + '–' + N.hm(w.end) + '</span>'; }).join('') + '</div><div class="note">Avoid Rahu Kaal ' + N.hm(m.rahu.start) + '–' + N.hm(m.rahu.end) + '. Disha shool ' + m.shool + '.</div></div>';
  });
  return h + '<div class="note" style="margin:0 2px 14px">Checks: suitable nakshatra and weekday; no Rikta tithi, Amavasya or bad yoga; no Kharmas where it applies; Jupiter and Venus not combust for marriage; windows exclude Rahu Kaal, Yamaganda, Gulika and Bhadra; personal tara and Chandrashtama if a person is chosen.</div></div>';
}
CHG.mpurpose = function (el) { U.mpurpose = el.value; rerender(true); };
CHG.mdays = function (el) { U.mdays = +el.value; rerender(true); };
CHG.mfor = function (el) { U.mfor = el.value; rerender(true); };

/* ---------- KP Prashna ---------- */
function PrashnaView() {
  var L = DB.settings.loc, n = U.pnum || '', mk = U.pm || 'job';
  var h = '<div class="pad"><div class="card"><h3>KP horary (1 to 249)</h3><div class="mut" style="font-size:12.5px;margin:-4px 0 10px">Hold the question in mind, then pick a number from 1 to 249 without thinking. The chart is cast for now at ' + esc(L.name) + '.</div>' +
    '<div class="grid2"><label class="field"><span>NUMBER</span><input class="inp mono" type="number" min="1" max="249" inputmode="numeric" data-in="pnum" value="' + esc(n) + '"></label><div class="field"><span>QUESTION</span>' + sel('pm', Object.keys(N.KP_MATTERS).map(function (x) { return [x, N.KP_MATTERS[x].l]; }), mk) + '</div></div><button class="btn acc wide" data-act="prashna">Judge</button></div>';
  if (U.pres) {
    var r = U.pres, hk = r.hk, sk = r.sk;
    h += answerCard({ verdict: sk.verdict, label: 'Answer · number ' + r.n + ' · ' + N.dmyt(r.at), headline: sk.q + ' ' + sk.headline, meaning: sk.meaning, rows: [['When', sk.when, 'when'], ['Do', sk.do, 'do'], ['Avoid', sk.avoid, 'avoid']] });
    var rows = [{ h: 1, code: 'Asc', deg: hk.ascDeg, cls: 'asc' }].concat(hk.planets.map(function (x) { return { h: x.bhava, code: x.code, deg: J.dm(x.lon), r: x.retro && x.code !== 'Ra' && x.code !== 'Ke', cls: x.code === 'Mo' ? 'mo' : '' }; }));
    h += techBlock('Show the KP working', '<div class="card"><p>Ascendant ' + SG[hk.ascSign] + ' ' + hk.ascDegs + ' · sign lord ' + PN[hk.ascKP.sign] + ', star ' + PN[hk.ascKP.star] + ', sub ' + PN[hk.ascKP.sub] + '</p></div><div class="card" style="padding:10px"><div class="ctitle">Horary chart (bhava)</div>' + Charts.north(rows, hk.cusps.map(function (x) { return x.sign; })) + '</div>' + kpJudgeHtml(r.jm, r.rp, r.at) + '<div class="card"><h3>Ruling planets at judgement</h3><p>' + r.rp.list.map(function (x) { return x.role + ': <b>' + PN[x.lord] + '</b>'; }).join(' · ') + '</p></div>');
  }
  return h + '</div>';
}
INP.pnum = function (el) { U.pnum = el.value; };
CHG.pm = function (el) { U.pm = el.value; };
ACT.prashna = function () {
  var n = parseInt(U.pnum, 10); if (!(n >= 1 && n <= 249)) return toast('Pick a number from 1 to 249');
  var L = DB.settings.loc, at = new Date(), hr = J.horary(n), mk = U.pm || 'job';
  var hk = J.kundli(at, L.lat, L.lon, { ayan: 'kp', ascLon: hr.start + 1 / 3600 }), sig = J.kpSignificators(hk), maha = J.dashas(at, hk.P.Mo.lon), rp = J.rulingPlanets(at, L.lat, L.lon, locOff(), 'kp');
  var jm = N.judgeMatter(sig, mk, maha, at, 2, rp.set), short = mk === 'health' || mk === 'legal' || mk === 'money';
  var wins = S.kpWindows(sig, jm.m, maha, at, short ? 6 : 24, short ? 4 : 3, rp.set);
  U.pres = { n: n, mk: mk, at: at, hr: hr, hk: hk, jm: jm, rp: rp, sk: S.kp(jm, mk, wins, at) };
  rerender(true);
};

/* ---------- location picker ---------- */
ACT.pickLoc = function () {
  sheet('<div class="pad"><h3 style="font:600 17px var(--sans);margin:4px 0 10px">Location for Today</h3><input class="inp" id="locIn" data-in="locq" placeholder="Search city" autocomplete="off"><div id="locList" style="margin-top:8px"></div><button class="btn sec wide" style="margin-top:10px" data-act="locOnline">' + icon('search', 16) + 'Search online</button><div class="note">Used for Panchang, Choghadiya, muhurat, ruling planets and Prashna.</div></div>');
  INP.locq($('#locIn'));
};
INP.locq = function (el) {
  var q = (el.value || '').trim().toLowerCase(), hits = (q ? CITIES.filter(function (c) { return c.name.toLowerCase().indexOf(q) >= 0; }) : CITIES).slice(0, 8);
  U.locHits = hits; $('#locList').innerHTML = '<div class="sugg" style="box-shadow:0 0 0 1px var(--line)">' + hits.map(function (c, i) { return '<button data-act="setLoc" data-i="' + i + '"><span>' + esc(c.name) + '</span><small>' + esc(c.region) + '</small></button>'; }).join('') + '</div>';
};
ACT.locOnline = function () {
  var q = ($('#locIn').value || '').trim(); if (!q) return toast('Type a city');
  $('#locList').innerHTML = '<div class="spin"></div>';
  http('GET', 'https://geocoding-api.open-meteo.com/v1/search?count=8&language=en&format=json&name=' + encodeURIComponent(q), {}).then(function (r) {
    var d = JSON.parse(r.text); U.locHits = (d.results || []).map(function (x) { return { name: x.name, region: [x.admin1, x.country].filter(Boolean).join(', '), lat: +x.latitude.toFixed(4), lon: +x.longitude.toFixed(4), tz: x.timezone }; });
    $('#locList').innerHTML = '<div class="sugg" style="box-shadow:0 0 0 1px var(--line)">' + U.locHits.map(function (c, i) { return '<button data-act="setLoc" data-i="' + i + '"><span>' + esc(c.name) + '</span><small>' + esc(c.region) + '</small></button>'; }).join('') + '</div>';
  }).catch(function () { $('#locList').innerHTML = '<div class="note">No internet connection.</div>'; });
};
ACT.setLoc = function (el) { var c = U.locHits[+el.dataset.i]; DB.settings.loc = { name: c.name, region: c.region, lat: c.lat, lon: c.lon, tz: c.tz }; save(); closeSheet(); setTimeout(function () { rerender(true); }, 30); };
