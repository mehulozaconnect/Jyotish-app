/* Health alert windows on screen: Today, Health, the problem page, a list across all people, WhatsApp and notifications. */
var ALERT = makeAlerts(A, C, J, MC), AL_CACHE = {};
function alertsOf(p, days) {
  var lim = days || 60; days = 120;
  var key = p.id + '|' + p.date + '|' + p.time + '|' + DB.settings.ayan + '|' + new Date().toDateString() + '|' + days;
  if (AL_CACHE[key]) return alCut(AL_CACHE[key], lim);
  var out = [];
  try { var c = calcP(p), R = maOf(p), all = mcAll(p), from = todayStart(0), list = Object.keys(all).filter(function (id) { return /Strong|Moderate/.test(all[id].tend); }); if (list.length) out = ALERT.forPerson(c, R, list, from, days); } catch (e) { if (window.console) console.error(e); }
  AL_CACHE[key] = out; return alCut(out, lim);
}
function alAlert(t) { return String(t).replace(/:?\s*(or )?(go to )?(an )?emergency\.?\s*$/i, '').replace(/[\s.:,]+$/, '').replace(/\s+or$/, ''); }
function alCut(ws, lim) { var t = todayStart(lim).getTime(); return ws.filter(function (w) { return w.start.getTime() <= t; }); }
function alAlerts(w) { return N.uniq(w.probs.slice(0, 2).map(function (x) { var pr = MC.P.filter(function (q) { return q.id === x.id; })[0]; return pr && pr.alert ? alAlert(pr.alert) : ''; }).filter(Boolean)).join('; or ').replace(/^./, function (m) { return m; }); }
function alShort(d) { var x = new Date(d.getTime() + locOff() * 3600e3); return x.getUTCDate() + ' ' + V4MON[x.getUTCMonth()].slice(0, 3); }
function alRange(w) { return alShort(w.start) + ' to ' + alShort(w.end); }
function alNow(w) { var t = todayStart(0).getTime() + 12 * 36e5; return w.start.getTime() <= t && t <= w.end.getTime() + 864e5; }
function alProbs(w) { return w.probs.map(function (x) { return x.n.split(' / ')[0]; }).join(', '); }
function alTips(w) {
  var t = []; w.probs.slice(0, 2).forEach(function (x) { var pr = MC.P.filter(function (q) { return q.id === x.id; })[0]; if (pr) { if (pr.dos[0]) t.push(pr.dos[0].split(';')[0]); if (pr.avoid[0]) t.push('Avoid ' + pr.avoid[0].charAt(0).toLowerCase() + pr.avoid[0].slice(1)); } });
  t.push('Take regular medicines on time and do not skip doctor follow-ups'); return N.uniq(t).slice(0, 5);
}
function alCard(p, w, full) {
  var hi = w.level === 'high', now = alNow(w), n1 = p.name.split(' ')[0];
  var h = '<div class="v4card alc ' + (hi ? 'hi' : 'wa') + '"><div class="alh"><span class="ald"></span><div><b>' + (hi ? 'High-care window' : 'Watch window') + (now ? ', now' : '') + '</b><small>' + alRange(w) + (now ? '' : ', starts in ' + Math.max(1, Math.round((w.start - todayStart(0)) / 864e5)) + ' days') + '. Most sensitive around ' + alShort(w.at) + '.</small></div></div>' +
    '<p class="alp"><b>' + esc(alProbs(w)) + '</b></p>';
  if (full) {
    h += '<div class="lbl">Why the chart flags these days</div><ul class="v4why">' + w.why.map(function (t) { var g = /^Jupiter protects/.test(t); return '<li class="' + (g ? 'p' : 'n') + '"><i>' + (g ? '+' : '−') + '</i><span>' + esc(cap1(t)) + '.</span></li>'; }).join('') + '</ul>' +
      '<div class="lbl">What to do</div><ul class="v4why">' + alTips(w).map(function (t) { return '<li class="p"><i>+</i><span>' + esc(cap1(t)) + '.</span></li>'; }).join('') + '</ul>' +
      (alAlerts(w) ? '<p class="alx"><b>Go to a doctor at once if:</b> ' + esc(alAlerts(w)) + '.</p>' : '') +
      '<p class="v4note">A window means extra care in these days, not that illness will come. The chart cannot replace check-ups.</p>' +
      (relOf(p) !== 'me' ? '<button class="v4btn" data-act="alShare" data-p="' + p.id + '" data-s="' + w.start.getTime() + '">Send care note on WhatsApp</button>' : '');
  }
  return h + '</div>';
}
function alText(p, w) {
  var n1 = p.name.split(' ')[0];
  return 'Namaste ' + n1 + ',\n\nAs per your chart, *' + alRange(w) + '* is a period to take extra care of *' + alProbs(w).toLowerCase() + '*' + (w.level === 'high' ? ', especially around ' + alShort(w.at) : '') + '.\n\nPlease:\n' + alTips(w).map(function (t) { return '• ' + cap1(t); }).join('\n') + '\n' + (alAlerts(w) ? '\n*See a doctor at once if:* ' + alAlerts(w) + '.\n' : '') + '\nThis is a time for care, not worry. It is not a medical diagnosis.\n\n_Trikaal_';
}
ACT.alShare = function (el) { var p = person(el.dataset.p), w = alertsOf(p).filter(function (x) { return String(x.start.getTime()) === el.dataset.s; })[0]; if (p && w) waSend(alText(p, w), p.phone || ''); };

/* list across all people */
function AlertsScreen() {
  var now = todayStart(0), rows = [];
  DB.people.forEach(function (p) { try { if (age(p, new Date()) < 2) return; } catch (e) { } alertsOf(p).forEach(function (w) { if (w.start - now <= 30 * 864e5) rows.push({ p: p, w: w }); }); });
  rows.sort(function (a, b) { var an = alNow(a.w), bn = alNow(b.w); return (bn - an) || (b.w.level === 'high') - (a.w.level === 'high') || a.w.start - b.w.start; });
  var hi = rows.filter(function (r) { return r.w.level === 'high'; });
  var h = '<div class="v4plain"><div><h1 class="v4h1">Health alerts</h1><p>Everyone in your list, the next 30 days</p></div></div>';
  if (!rows.length) h += '<div class="v4card"><p class="v4note" style="margin:0">No health window in the next 30 days for anyone in your list.</p></div>';
  else h += '<div class="v4card"><p style="font:400 14.5px/1.45 var(--sans);color:var(--ink)">' + (hi.length ? '<b>' + hi.length + ' high-care window' + (hi.length > 1 ? 's' : '') + '</b> for ' + N.uniq(hi.map(function (r) { return r.p.name.split(' ')[0]; })).join(', ') + '. Call them first.' : 'Only watch windows: nobody needs an urgent call.') + '</p></div>' +
    rows.map(function (r) { var w = r.w, nw = alNow(w); return '<button class="v4card alrow ' + (w.level === 'high' ? 'hi' : 'wa') + '" data-act="alOpen" data-p="' + r.p.id + '" data-s="' + w.start.getTime() + '"><span class="av" style="background:' + avColor(r.p.id) + '">' + esc(initials(r.p.name)) + '</span><div><b>' + esc(r.p.name) + '</b><small>' + esc(alProbs(w)) + '</small><small class="d">' + alRange(w) + (nw ? ', now' : '') + '</small></div>' + v4chip(w.level === 'high' ? 'b' : 'w', w.level === 'high' ? 'High care' : 'Watch') + '</button>'; }).join('');
  h += '<p class="v4note" style="margin:6px 20px">How it works: each day the app checks Mars, Saturn, Rahu, Ketu, the Sun and eclipses against each person\'s Moon, lagna, Sun and the planets of their sensitive problems, by exact degree, and adds the short dasha periods running. On average a person gets about 3 high-care windows a year.</p>';
  return h + '<div style="height:70px"></div>';
}
ACT.alOpen = function (el) { var p = person(el.dataset.p), w = alertsOf(p).filter(function (x) { return String(x.start.getTime()) === el.dataset.s; })[0]; if (!p || !w) return; sheet('<div class="pad"><h3 style="font:600 19px var(--serif);margin:4px 0 12px">' + esc(p.name) + '</h3>' + alCard(p, w, true) + '</div>'); };

/* Health home, Today and the problem page */
(function () {
  var mh = MedHome; MedHome = function () {
    var h = mh(), p = curP(); if (!p) return h;
    var ws = alertsOf(p).filter(function (w) { return w.start - todayStart(0) <= 45 * 864e5; }), first = ws[0];
    var x = first ? alCard(p, first, true) + (ws.length > 1 ? '<div class="v4card"><div class="lbl">Later</div>' + ws.slice(1, 4).map(function (w) { return '<div class="alline"><span class="ald ' + (w.level === 'high' ? 'hi' : 'wa') + '"></span><b>' + alRange(w) + '</b><span>' + esc(alProbs(w)) + '</span></div>'; }).join('') + '</div>' : '') : '<div class="v4card alc ok"><div class="alh"><span class="ald"></span><div><b>No health window in the next 45 days</b><small>Keep the routine and the yearly check-ups.</small></div></div></div>';
    x += '<button class="v4link alall" data-go="alerts">Health alerts for everyone in my list ›</button>';
    var i = h.indexOf('<div class="v4card v4body">'); return i < 0 ? h : h.slice(0, i) + x + h.slice(i);
  };
  var tv = TodayV4; TodayV4 = function () {
    var h = tv(), p = curP(); if (!p || U.dayOff) return h;
    var w = alertsOf(p).filter(function (w) { return alNow(w) || w.start - todayStart(0) <= 3 * 864e5; })[0], x = '';
    if (w) x += '<button class="v4card albanner ' + (w.level === 'high' ? 'hi' : 'wa') + '" data-go="medical"><span class="ald"></span><div><b>Health: ' + (w.level === 'high' ? 'high-care window' : 'watch window') + ' ' + (alNow(w) ? 'till ' + alShort(w.end) : 'from ' + alShort(w.start)) + '</b><small>' + esc(alProbs(w)) + '. Tap for why and what to do.</small></div><span class="ar">›</span></button>';
    var others = 0, names = []; DB.people.forEach(function (q) { if (q.id === p.id) return; try { if (age(q, new Date()) < 2) return; } catch (e) { } if (alertsOf(q).some(function (w) { return w.level === 'high' && w.start - todayStart(0) <= 7 * 864e5; })) { others++; names.push(q.name.split(' ')[0]); } });
    if (others) x += '<button class="v4card albanner pp" data-go="alerts"><span class="ald"></span><div><b>' + others + ' ' + (others > 1 ? 'people need' : 'person needs') + ' a health check-in this week</b><small>' + esc(names.slice(0, 4).join(', ')) + '</small></div><span class="ar">›</span></button>';
    if (!x) return h; var i = h.indexOf('<div class="v4quick">'); return i < 0 ? h : h.slice(0, i) + '<div style="height:12px"></div>' + x + h.slice(i);
  };
  var mc = MedCaseScreen; MedCaseScreen = function (id) {
    var h = mc(id), p = curP(); if (!h || !p) return h;
    var ws = alertsOf(p, 120).filter(function (w) { return w.probs.some(function (x) { return x.id === id; }); });
    var x = '<div class="v4card"><b class="hd">Care windows in the next 4 months</b>' + (ws.length ? ws.slice(0, 4).map(function (w) { return '<div class="alline"><span class="ald ' + (w.level === 'high' ? 'hi' : 'wa') + '"></span><b>' + alRange(w) + '</b><span>' + (w.level === 'high' ? 'High care' : 'Watch') + (alNow(w) ? ', now' : '') + '</span></div>'; }).join('') + '<p class="v4note">Exact dates from Mars, Saturn, Rahu, Ketu and eclipses crossing the sensitive points of this chart. Open Health for the reasons.</p>' : '<p class="v4note">No sharp window for this problem in the next 4 months.</p>') + '</div>';
    var k0 = h.indexOf('class="v4scl"'); if (k0 < 0) return h; var i = h.indexOf('</div>', k0); var j = h.indexOf('</div>', i + 6); return h.slice(0, j + 6) + x + h.slice(j + 6);
  };
  var r0 = render; render = function () {
    var pr = parts(); if (pr[0] === 'alerts') { applySettings(); $('#app').innerHTML = AlertsScreen(); $('#nav').innerHTML = NAVS.map(function (x) { return '<button data-go="' + x[0] + '" class="' + (x[0] === 'medical' ? 'on' : '') + '">' + icon(x[0]) + x[1] + '</button>'; }).join(''); document.body.setAttribute('data-scr', 'alerts'); try { addAiButtons(); } catch (e) { } window.scrollTo(0, 0); return; }
    r0();
  };
  /* AI knows the windows */
  var ff = fixedFacts; fixedFacts = function (p, c) {
    var s = ff(p, c); try { var ws = alertsOf(p).slice(0, 4); s += 'HEALTH CARE WINDOWS (next 60 days, from exact-degree transits and short dasha periods): ' + (ws.length ? ws.map(function (w) { return w.level + ' ' + alRange(w) + ' for ' + alProbs(w) + ' (why: ' + w.why.join('; ') + ')'; }).join(' | ') : 'none') + '. Mention them for any health question, as care windows, never as certain illness.\n'; } catch (e) { }
    return s;
  };
  /* notifications: 3 days before a high window, and on its first day, for everyone (clients too) */
  var pa = planAll; planAll = function () {
    var plan = pa(), cfg = remCfg(); if (cfg.health === false) return plan;
    var nowT = Date.now(), t = hhmm(cfg.briefTime);
    DB.people.forEach(function (p) {
      try { if (age(p, new Date()) < 2) return; } catch (e) { }
      alertsOf(p, 30).filter(function (w) { return w.level === 'high'; }).forEach(function (w, i) {
        [[3, 'in 3 days'], [0, 'from today']].forEach(function (x) {
          var d0 = todayStart(Math.round((w.start - todayStart(0)) / 864e5) - x[0]), at = d0.getTime() + (t[0] + 1) * 3600e3 + t[1] * 60e3;
          if (at > nowT) plan.push({ id: 'h|' + p.id + '|' + w.start.getTime() + '|' + x[0], at: at, title: fn1(p) + ': health high-care window ' + x[1], body: alRange(w) + ': ' + alProbs(w) + '. ' + (relOf(p) === 'me' ? 'Keep check-ups and medicines on time.' : 'A good time to call and remind them.'), route: 'medical' });
        });
      });
    });
    return plan.sort(function (a, b) { return a.at - b.at; });
  };
  var sa = scheduleAll; scheduleAll = function () { try { if (AND && AND.clearOnce) AND.clearOnce('h|'); } catch (e) { } sa(); };
})();
(function () { var rv = RemindersV2; RemindersV2 = function () { var h = rv(), cfg = remCfg(); return h.replace('<label class="rrow"><div><b>Remedy reminders</b>', '<label class="rrow"><div><b>Health alerts</b><small>3 days before and on the first day of a high-care health window, for everyone in your list, clients included</small></div><input type="checkbox" data-ch="remOpt" data-v="health"' + (cfg.health !== false ? ' checked' : '') + '></label><label class="rrow"><div><b>Remedy reminders</b>'); }; })();
/* the day verdict knows about health windows */
var JUDGE_EXTRA = function (c, pc) {
  var p = c.person; if (!p) return [];
  var t = pc.rise.getTime() + 6 * 36e5, w = alertsOf(p, 120).filter(function (w) { return w.start.getTime() - 12 * 36e5 <= t && t <= w.end.getTime() + 12 * 36e5; })[0];
  if (!w) return [];
  return [{ id: 'health', daily: 1, title: 'Health ' + (w.level === 'high' ? 'high-care' : 'watch') + ' window (' + alRange(w) + ')', t: 'Take extra care of ' + alProbs(w).toLowerCase() + '. Keep the day light and medicines on time.', v: w.level === 'high' ? -1 : -0.5, w: w.level === 'high' ? 2.2 : 1.2 }];
};
