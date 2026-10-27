/* Trikaal: reminders and alerts.
   Who: each kundli can be switched on or off (clients are off by default).
   What: a morning briefing for each day, alerts for transit and dasha changes (with what to do), and remedy reminders.
   How: notifications are planned 14 days ahead (transit alerts 30 days) and re-planned every time the app opens. */
function remCfg() { var r = DB.settings.rem = DB.settings.rem || {}; if (r.brief == null) r.brief = true; if (!r.briefTime) r.briefTime = '07:00'; if (r.transits == null) r.transits = true; if (r.remedies == null) r.remedies = true; return r; }
function notifyOn(p) { return p && (p.notify != null ? p.notify : relOf(p) !== 'client'); }
function hhmm(t) { var a = (t || '07:00').split(':'); return [+a[0] || 0, +a[1] || 0]; }
function fn1(p) { return p.name.split(' ')[0]; }
function wdOf(d) { return new Date(d.getTime() + locOff() * 3600e3).getUTCDay(); }
function dshort(d) { return WD[wdOf(d)] + ' ' + N.dmy(d).replace(/ \d{4}$/, ''); }

/* morning briefing for one person on one day */
function briefFor(p, c, d0) {
  var L = DB.settings.loc, D = N.myDay(c, d0, L.lat, L.lon, new Date(d0.getTime() + 10 * 3600e3)), R = areaRatings(c, D), wd = D.wd, ag = age(p, d0), kid = ag < 19;
  var lines = [kid ? { push: 'A bright day: good for tests, new activities and outings.', steady: 'A normal day: keep the routine.', backend: 'A quiet day: keep the child rested and avoid long outings.' }[D.score.v] : D.guide];
  var b = D.best[0]; if (b && !kid) lines.push('Best time: ' + N.hm(b.start) + '–' + N.hm(b.end) + ' (' + PN[b.lord] + ' hora: ' + KB.HORA_USE[b.lord] + ').');
  lines.push('Avoid new starts: Rahu Kaal ' + N.hm(D.parts.rahu.start) + '–' + N.hm(D.parts.rahu.end) + '.');
  if (!kid) {
    var g = AREAS.filter(function (a) { return R[a.id].r === 'good'; })[0], bd = AREAS.filter(function (a) { return R[a.id].r === 'bad'; })[0];
    if (g) lines.push('Go for it: ' + g.good);
    if (bd) lines.push('Be careful: ' + bd.bad);
  } else lines.push(R.health.r === 'bad' ? 'Health: keep the child\'s food light and sleep regular today.' : 'A good day for studies and play.');
  if (D.score.cb === 8) lines.push('Chandrashtama today: keep calm, avoid arguments and big decisions.');
  var rem = remsFor(p.id).filter(function (r) { return activeOn(r, new Date(d0.getTime() + 12 * 3600e3)); });
  if (rem.length) lines.push('Remedies today: ' + rem.map(function (r) { return r.name + (r.count > 1 ? ' ×' + r.count : ''); }).join('; ') + '.');
  else lines.push('Small remedy: ' + DAY_REMEDY[wd][1]);
  return { title: fn1(p) + ' · ' + dshort(d0) + ': ' + D.word, body: lines.join('\n'), route: relOf(p) === 'me' ? 'today/day' : 'p/' + p.id + '/transit' };
}

/* alerts for planet changes and dasha changes over the next 30 days */
var EV_CACHE = { k: '', ev: [] };
function upcomingEvents(now, days) {
  var key = Math.floor(now.getTime() / 864e5) + '|' + days;
  if (EV_CACHE.k !== key) { EV_CACHE = { k: key, ev: J.events(now, new Date(now.getTime() + days * 864e5), ['Su', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra']) }; }
  return EV_CACHE.ev;
}
function alertsFor(p, c, now) {
  var k = c.k, out = [], ag = age(p, now), st = NARR.stage(ag), KM = st === 'child' ? NARR.CH : st === 'teen' ? NARR.TN : null;
  function says(h, good) { if (KM) return KM[h][good ? 0 : 1]; var H = NARR.H[h]; return good ? H.g[0] + ' ' + H.g[1] : H.b[0] + ' ' + H.b[1]; }
  upcomingEvents(now, 30).forEach(function (e) {
    var h = J.houseFrom(k.ascSign, e.sign), m = J.houseFrom(k.P.Mo.sign, e.sign), title, body;
    if (e.type === 'ingress') {
      var t = tScore(c, e.code, e.sign), good = t.tone === 'g', bad = t.tone === 'b';
      title = fn1(p) + ': ' + PN[e.code] + ' enters ' + J.SIGNS[e.sign] + ' (' + N.nth(h) + ' house) · ' + dshort(new Date(e.t));
      body = (good ? 'Good change. ' : bad ? 'Be cautious. ' : 'Mixed change. ') + says(h, !bad) + (t.td === 'Debilitated' ? ' ' + PN[e.code] + ' is debilitated there, so its results are weak.' : t.td === 'Exalted' ? ' ' + PN[e.code] + ' is exalted there, so results are strong.' : '');
      if (e.code === 'Sa' && [12, 1, 2].indexOf(m) >= 0) body += ' Sade Sati phase from this date: keep a steady routine; Saturday Hanuman Chalisa helps.';
      if (e.code === 'Sa' && (m === 8 || m === 4)) body += ' Saturn Dhaiya begins: avoid shortcuts and look after health.';
      body += bad || t.tone === 'm' ? '\nWhat to do: ' + (KM ? 'keep routine and give extra care in this area.' : NARR.H[h].b[2]) + ' Remedy: ' + NARR.P[e.code][2] : '\nWhat to do: make use of it: ' + (KM ? 'encourage the child in this area.' : NARR.H[h].g[2]);
    } else {
      title = fn1(p) + ': ' + PN[e.code] + ' turns ' + (e.type === 'retro' ? 'retrograde' : 'direct') + ' (' + N.nth(h) + ' house) · ' + dshort(new Date(e.t));
      body = e.type === 'retro' ? 'Matters of ' + NARR.areaWord(h, ag, AREA_OF[h]) + ' slow down or come back for a second look.\nWhat to do: avoid fresh commitments here, re-check papers, payments and travel plans.' : 'Delayed matters of ' + NARR.areaWord(h, ag, AREA_OF[h]) + ' start moving again.\nWhat to do: restart pending work in this area.';
    }
    var at = new Date(e.t); var day0 = new Date(Date.UTC(new Date(at.getTime() + locOff() * 3600e3).getUTCFullYear(), new Date(at.getTime() + locOff() * 3600e3).getUTCMonth(), new Date(at.getTime() + locOff() * 3600e3).getUTCDate()) - locOff() * 3600e3);
    out.push({ id: 't|' + p.id + '|' + e.code + e.type + day0.getTime(), at: day0.getTime() + 7.5 * 3600e3, title: title, body: body, route: 'p/' + p.id + '/transit' });
    if (['Ju', 'Sa', 'Ra'].indexOf(e.code) >= 0 && e.type === 'ingress') out.push({ id: 't|' + p.id + '|pre' + e.code + day0.getTime(), at: day0.getTime() - 4 * 3600e3, title: 'Tomorrow · ' + title, body: body, route: 'p/' + p.id + '/transit' });
  });
  /* dasha changes (Antardasha and Pratyantar) */
  var end = new Date(now.getTime() + 30 * 864e5), ch = J.dashaChain(c.maha, now, 3);
  ch.forEach(function (x, j) {
    if (j === 0 || x.end > end) return;
    var nx = J.dashaChain(c.maha, new Date(x.end.getTime() + 3600e3), 3)[j]; if (!nx) return;
    var f = c.func[nx.lord], good = f && (f.kind === 'benefic' || f.kind === 'yogakaraka'), bad = !f || f.kind === 'malefic', hs = N.uniq(J.lordsOf(k.ascSign, nx.lord).concat([k.P[nx.lord].house]));
    var day0 = todayStart(Math.round((x.end - todayStart(0)) / 864e5));
    out.push({ id: 't|' + p.id + '|d' + j + nx.lord + day0.getTime(), at: day0.getTime() + 7.5 * 3600e3, title: fn1(p) + ': new ' + ['', 'Antardasha', 'Pratyantar'][j] + ' of ' + PN[nx.lord] + ' from ' + dshort(x.end),
      body: 'Focus shifts to ' + hs.map(function (h) { return NARR.areaWord(h, ag, AREA_OF[h]); }).join('; ') + ' until ' + N.dmy(nx.end) + '. ' + (good ? 'A supportive period: push important plans.' : bad ? 'Go steady in this period. Remedy: ' + NARR.P[nx.lord][2] : 'Mixed period: steady effort works.'), route: 'p/' + p.id + '/dasha' });
  });
  return out.filter(function (x) { return x.at > Date.now(); });
}

/* everything planned, for all people who have reminders on */
function planAll() {
  var cfg = remCfg(), now = new Date(), plan = [];
  DB.people.forEach(function (p) {
    if (!notifyOn(p)) return;
    var c; try { c = calcP(p); } catch (e) { return; }
    if (cfg.brief) { var t = hhmm(cfg.briefTime); for (var i = 0; i < 14; i++) { var d0 = todayStart(i), at = d0.getTime() + t[0] * 3600e3 + t[1] * 60e3; if (at <= Date.now()) continue; try { var b = briefFor(p, c, d0); plan.push({ id: 'd|' + p.id + '|' + d0.getTime(), at: at, title: b.title, body: b.body, route: b.route }); } catch (e) { } } }
    if (cfg.transits) { try { plan = plan.concat(alertsFor(p, c, now)); } catch (e) { } }
  });
  return plan.sort(function (a, b) { return a.at - b.at; });
}
function scheduleAll() {
  if (!AND || !AND.scheduleReminder) return;
  var cfg = remCfg();
  (DB.remedies || []).forEach(function (r) {
    try {
      var pn = person(r.pid);
      if (!cfg.remedies || !notifyOn(pn) || r.remind === false || !r.time || (r.until && r.until < dkey(new Date()))) { AND.cancelReminder(r.id); return; }
      var t = r.time.split(':');
      AND.scheduleReminder(r.id, (pn ? fn1(pn) + ': ' : '') + r.name + (r.count > 1 ? ' ×' + r.count : ''), (r.note || r.type) + '', +t[0], +t[1], (r.days || []).join(','));
    } catch (e) { }
  });
  if (!AND.scheduleOnce) return;
  setTimeout(function () {
    try {
      AND.clearOnce('d|'); AND.clearOnce('t|');
      var plan = planAll(); plan.forEach(function (x) { AND.scheduleOnce(x.id, x.title, x.body, x.at, x.route); });
      DB.settings.remInfo = { n: plan.length, at: Date.now() }; save();
    } catch (e) { }
  }, 1200);
}

/* ---------- screen ---------- */
function RemindersV2() {
  var cfg = remCfg(), h = '<div class="top"><button class="ib" data-act="remBack">' + icon('back') + '</button><span class="ttl">Reminders and alerts</span></div><div class="pad">';
  h += '<div class="card"><h3>Who gets reminders</h3><p class="sm" style="margin:-4px 0 8px">Switch on the people whose reminders should come to this phone. Clients are off unless you switch them on.</p>' +
    DB.people.map(function (p) { var on = notifyOn(p); return '<label class="rrow"><span class="av" style="background:' + avColor(p.id) + '">' + esc(initials(p.name)) + '</span><div><b>' + esc(p.name) + '</b><small>' + ({ me: 'Me', family: 'Family / friend', client: 'Client' })[relOf(p)] + '</small></div><input type="checkbox" data-ch="remWho" data-v="' + p.id + '"' + (on ? ' checked' : '') + '></label>'; }).join('') + '</div>';
  h += '<div class="card"><h3>What to send</h3>' +
    '<label class="rrow"><div><b>Morning briefing</b><small>Each day: verdict, best time, Rahu Kaal, what to push, where to be careful, and that day\'s remedies</small></div><input type="checkbox" data-ch="remOpt" data-v="brief"' + (cfg.brief ? ' checked' : '') + '></label>' +
    (cfg.brief ? '<div class="field" style="margin:0 0 6px 2px"><span>BRIEFING TIME</span><input class="inp mono" type="time" data-ch="remTime" value="' + esc(cfg.briefTime) + '" style="max-width:150px"></div>' : '') +
    '<label class="rrow"><div><b>Transit and dasha alerts</b><small>When a planet changes sign, turns retrograde or direct, or a new sub-period starts: what it means and what to do. Jupiter, Saturn and Rahu also get a reminder the evening before.</small></div><input type="checkbox" data-ch="remOpt" data-v="transits"' + (cfg.transits ? ' checked' : '') + '></label>' +
    '<label class="rrow"><div><b>Remedy reminders</b><small>At the time set on each remedy, with full instructions</small></div><input type="checkbox" data-ch="remOpt" data-v="remedies"' + (cfg.remedies ? ' checked' : '') + '></label></div>';
  var plan = []; try { plan = planAll(); } catch (e) { }
  var inf = DB.settings.remInfo;
  h += '<div class="card"><div class="kgh"><h3>Coming up</h3><span class="sm">' + plan.length + ' planned</span></div>' + (inf ? '<p class="sm" style="margin:-4px 0 6px">Last set on this phone: ' + N.dmyt(new Date(inf.at)) + '</p>' : '') +
    (plan.length ? plan.slice(0, 15).map(function (x) { return '<div class="rnote' + (x.id.charAt(0) === 't' ? ' ra' : '') + '"><span class="mono">' + dshort(new Date(x.at)) + ' · ' + N.hm(new Date(x.at)) + '</span><b>' + esc(x.title.replace(/ · [A-Z][a-z]{2} \d+ [A-Z][a-z]{2}(: |$)/, '$1')) + '</b><p>' + esc(x.body).replace(/\n/g, '<br>') + '</p></div>'; }).join('') : '<p class="sm">Nothing planned. Switch on a person and at least one type above.</p>') +
    '<button class="btn acc wide" style="margin-top:10px" data-act="remNow">Set reminders on this phone now</button><button class="btn sec wide" style="margin-top:8px" data-act="remTest">Send a test notification in 15 seconds</button><p class="note">Planned 14 days ahead (alerts 30 days) and refreshed every time you open Trikaal. Open the app at least once a week to keep them coming. Allow notifications when Android asks.</p></div>';
  return h + '</div>';
}
CHG.remWho = function (el) { var p = person(el.dataset.v); if (p) { p.notify = el.checked; save(); scheduleAll(); rerender(); } };
CHG.remOpt = function (el) { remCfg()[el.dataset.v] = el.checked; save(); scheduleAll(); rerender(); };
CHG.remTime = function (el) { remCfg().briefTime = el.value || '07:00'; save(); scheduleAll(); rerender(); };
ACT.remNow = function () { if (!AND || !AND.scheduleOnce) { toast('Reminders work in the installed app'); return; } scheduleAll(); toast('Reminders set ✓', 2500); setTimeout(rerender, 1600); };
ACT.remTest = function () {
  if (!AND || !AND.scheduleOnce) { toast('Test works in the installed app'); return; }
  var plan = []; try { plan = planAll(); } catch (e) { }
  var x = plan[0] || { title: 'Trikaal test', body: 'Reminders are working on this phone.' };
  AND.scheduleOnce('d|test' + Date.now(), 'Test · ' + x.title, x.body, Date.now() + 15000, 'reminders');
  if (AND.scheduleReminder) { /* also prove the daily-repeating remedy path */ }
  toast('Test set. Lock the phone or leave the app; it arrives in about 15 seconds.', 4000);
};
ACT.remBack = function () { if (history.length > 1) history.back(); else go('remedies'); };
