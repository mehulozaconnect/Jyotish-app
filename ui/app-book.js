/* Trikaal 3.11: the reading rulebook in the app — honest Sade Sati, period-by-period dasha verdicts,
   "My planets" self-check, house reading, nakshatra timing, remedy plan in the right order with a 40-day tracker and daily habits. */
var BOOK = makeBook(J, KB, C);
function bkMY(d) { var x = N.dmy(d).split(' '); return x.slice(-2).join(' '); }
function bkSb(c) { try { return sbOf(c); } catch (e) { return null; } }
function bkKid(p) { try { return age(p, new Date()) < 16; } catch (e) { return false; } }
var KIDC = { Ve: 'Keep their room and things neat, encourage music, drawing or dance, and teach kind words with friends.', Ju: 'Encourage reading and respect for teachers; let them ask "why" freely.', Sa: 'Give small daily duties and fixed routines; teach respect for helpers and the elderly.', Ra: 'Limit screen time, keep them away from bad company and teach honesty.', Ma: 'Daily outdoor play or sport; teach them to pause before reacting in anger.', Mo: 'Fixed sleep time, calm evenings and time with mother.', Su: 'Morning sunlight, a fixed wake-up time and small responsibilities that build confidence.', Me: 'Puzzles, reading aloud and games with numbers; praise clear speech.', Ke: 'Quiet time, simple prayers and stories about grandparents.' };

/* ---------- Sade Sati: add how heavy it is ---------- */
var BOOK_SS = function (c, date, out) {
  var s = BOOK.saturn(c, date, bkSb);
  if (s.level) { out.label += ' (' + s.level.toLowerCase() + ')'; out.level = s.level; out.lk = s.lk; out.levelWhy = s.why; out.tip = s.tip; out.phase = s.phase; }
  else if (s.good) { out.label = 'Saturn supportive (' + N.nth(s.house) + ' from Moon)'; out.good = s.good; }
  if (s.ret) out.ret = s.ret;
};
(function () {
  var r0 = REP.sadesati; REP.sadesati = function (p, c, now) {
    var r = r0(p, c, now), ss = N.sadeSati(c, now), items = [];
    if (ss.level) { items.push(itm('Level for you: ' + ss.level, ss.tip, ss.lk === 'g' ? 'g' : ss.lk === 'b' ? 'b' : 'i')); items.push(itm('What this phase brings', ss.phase.charAt(0).toUpperCase() + ss.phase.slice(1) + '.')); if (ss.levelWhy.length) items.push(itm('Why', ss.levelWhy.join('; ') + '.')); }
    if (ss.good) items.push(itm('Good phase', ss.good, 'g'));
    if (ss.ret) items.push(itm('Saturn return', ss.ret, 'i'));
    items.push(itm('Keep in mind', 'Sade Sati is not a curse. It brings effort, delays and self-review, and rewards honest hard work. Auspicious work like marriage need not stop; just avoid hasty big decisions. Never buy a costly stone or puja out of fear.'));
    r.sec.unshift({ h: 'How it works for you', items: items });
    if (ss.level) r.tell.unshift('Level: ' + ss.level + '. ' + ss.tip);
    return r;
  };
})();

/* ---------- My planets: strength in one word + everyday self-check; houses read three ways ---------- */
TABS.splice(3, 0, ['know', 'My planets']);
SECTIONS.splice(0, 0, ['know', 'My planets and houses', 'Strong or weak, signs to check, each life area']);
TABF.know = function (p, c) {
  var kid = bkKid(p), nm1 = p.name.split(' ')[0], self = relOf(p) === 'me', P = c.k.P, mo = P.Mo.nak, nn = BOOK.nakNature(mo.index);
  var h = '<div class="pad">';
  h += '<div class="ocard"><div class="olbl">Birth star</div><div class="overd g">' + esc(mo.name) + ' · pada ' + mo.pada + '</div><p class="op">Lord ' + PN[mo.lord] + '. Name letter by tradition: <b>' + BOOK.LETTERS[mo.index][mo.pada - 1] + '</b> (pada ' + mo.pada + '). ' +
    (BOOK.GANDA.indexOf(mo.index) >= 0 ? 'This is a Gandamoola nakshatra: tradition suggests a simple shanti puja on the same nakshatra about 27 days after birth. It is a ritual of care, not a bad sign.' : '') + '</p></div>';
  var all = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke'].map(function (x) { return BOOK.strength(c, x, bkSb); });
  var g = all.filter(function (x) { return x.k === 'g'; }), b = all.filter(function (x) { return x.k === 'b'; });
  h += '<div class="card"><div class="kgh"><h3>Your planets at a glance</h3></div><p class="sm" style="margin:0 0 10px">' + (g.length ? '<b>Strong:</b> ' + g.map(function (x) { return PN[x.code]; }).join(', ') + '. ' : '') + (b.length ? '<b>Need support:</b> ' + b.map(function (x) { return PN[x.code]; }).join(', ') + '.' : 'No planet is badly placed.') + '</p>' +
    all.map(function (x) {
      var S = BOOK.SIGNS_OF[x.code], list = x.k === 'g' ? S.s : x.k === 'b' ? S.w : [S.s[0], S.s[1], S.w[0], S.w[1]];
      var q = kid ? 'As ' + esc(nm1) + ' grows, watch for:' : self ? 'Check against your life — does this sound like you?' : 'Does this match ' + esc(nm1) + '?';
      return '<details class="bkp"><summary><span class="pt" style="background:' + PCOL[x.code] + '">' + x.code + '</span><b>' + PN[x.code] + '</b><span class="tag ' + (x.k === 'g' ? 'g' : x.k === 'b' ? 'b' : 'tn') + '">' + x.word + '</span></summary>' +
        '<p class="sm">Why: ' + esc(x.why.join(', ')) + '.</p><div class="lbl" style="margin:8px 0 4px">' + q + '</div><ul class="bkl">' + list.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +
        (x.k !== 'g' ? '<p class="sm"><b>To support it:</b> ' + esc(kid ? KIDC[x.code] : BOOK.CONDUCT[x.code]) + '</p>' : '') + '</details>';
    }).join('') + '<p class="note">Strength here combines sign, house, combustion and Shadbala. A weak planet means more effort in its areas, not failure.</p></div>';
  h += '<div class="card"><div class="kgh"><h3>Twelve life areas</h3><span class="sm">house · lord · karaka</span></div>' + [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(function (hh) {
    var r = BOOK.house(c, hh, bkSb);
    if (kid && [7, 8].indexOf(hh) >= 0) return '';
    return '<details class="bkp"><summary><span class="hn">' + hh + '</span><b>' + r.name + '</b><span class="tag ' + (r.v === 'g' ? 'g' : r.v === 'b' ? 'b' : 'tn') + '">' + r.word + '</span></summary><ul class="bkl">' + r.why.map(function (w) { return '<li>' + esc(w) + '.</li>'; }).join('') + '</ul><p class="sm"><b>Deeper view:</b> this house also shows ' + esc(r.bb) + '.</p></details>';
  }).join('') + '<p class="note">An empty house is not weak; its lord decides. If two of the three (house, lord, karaka) are good, that area is supported.</p></div>';
  U.shareFn = function () { return 'Planets of ' + p.name + '\n' + all.map(function (x) { return PN[x.code] + ': ' + x.word; }).join('\n'); };
  return h + '</div>';
};

/* ---------- Dasha: verdict for each sub-period, change-over warning, diary ---------- */
(function () {
  var d0 = DashaV2; DashaV2 = function () {
    var h = d0(), p = curP(); if (!p) return h;
    var c = calcP(p), now = new Date(), md = J.find(c.maha, now); if (!md) return h;
    var subs = J.subPeriods(md), ad = J.find(subs, now), r = ad ? BOOK.adRead(c, md.lord, ad.lord, bkSb) : null, sd = BOOK.sandhi(c, now);
    var x = '<div class="card"><div class="kgh"><h3>How this period works</h3><span class="tag ' + (r.v === 'g' ? 'g' : r.v === 'b' ? 'b' : 'tn') + '">' + r.word + '</span></div><p class="sm" style="margin:0 0 6px"><b>' + PN[md.lord] + ' – ' + PN[ad.lord] + '</b> until ' + N.dmy(ad.end) + '. ' + esc(r.why) + '</p>';
    if (sd) x += '<div class="bksd"><b>⚑ Big transition ' + (sd.kind === 'ending' ? 'on ' + N.dmy(sd.at) : 'just happened') + '</b><p class="sm">' + esc(sd.text) + '</p></div>';
    x += '<div class="lbl" style="margin:10px 0 4px">All sub-periods of ' + PN[md.lord] + ' Mahadasha</div>' + subs.map(function (a) {
      var v = BOOK.adRead(c, md.lord, a.lord, bkSb), cur = a === ad, past = a.end < now;
      return '<details class="bkp' + (cur ? ' cur' : '') + (past ? ' past' : '') + '"><summary><span class="pt" style="background:' + PCOL[a.lord] + '">' + a.lord + '</span><b>' + PN[a.lord] + (cur ? ' <span class="now">NOW</span>' : '') + '</b><small class="mut">' + bkMY(a.start) + ' → ' + bkMY(a.end) + '</small><span class="tag ' + (v.v === 'g' ? 'g' : v.v === 'b' ? 'b' : 'tn') + '">' + v.word + '</span></summary><p class="sm">' + esc(v.why) + '</p></details>';
    }).join('') + '</div>';
    var past = c.maha.filter(function (m) { return m.start < now && m.end > c.birth; });
    p.dnote = p.dnote || {};
    x += '<details class="card bkdiary"><summary><b>Dasha diary</b><small class="mut"> · note what happened in each period</small></summary><p class="sm">Write 2–3 big events of each period (studies, job, family, health). Over time you will see each planet’s pattern in your own life. Notes stay on this phone.</p>' + past.map(function (m) {
      var key = m.lord + m.start.getTime(), sb = BOOK.strength(c, m.lord, bkSb);
      return '<div class="bkdn"><b>' + PN[m.lord] + '</b> <small class="mut">' + (m.start < c.birth ? 'birth' : N.dmy(m.start).slice(-4)) + ' – ' + (m.end > now ? 'now' : N.dmy(m.end).slice(-4)) + ' · ' + sb.word.toLowerCase() + ' in your chart</small><textarea data-ch="dnote" data-k="' + key + '" placeholder="What happened in this period?">' + esc(p.dnote[key] || '') + '</textarea></div>';
    }).join('') + '</details>';
    var i = h.indexOf('<div class="crumbs">'); return i < 0 ? h : h.slice(0, i) + x + h.slice(i);
  };
})();
CHG.dnote = function (el) { var p = curP(); if (!p) return; p.dnote = p.dnote || {}; if (el.value.trim()) p.dnote[el.dataset.k] = el.value.trim(); else delete p.dnote[el.dataset.k]; save(); toast('Saved'); };

/* ---------- Panchang: what today's nakshatra is good for, Dishashool, Gandamoola ---------- */
(function () {
  var p0 = PanchangV2; PanchangV2 = function () {
    var h = p0(); try {
      var L = DB.settings.loc, d0 = todayStart(U.dayOff), pc = J.panchangLite ? J.panchangLite(d0, L.lat, L.lon) : J.panchang(d0, L.lat, L.lon), wd = new Date(pc.rise.getTime() + locOff() * 3600e3).getUTCDay();
      var nn = BOOK.nakNature(pc.nak.index), ds = BOOK.dishashool(wd), ti = pc.tithi && pc.tithi.num ? ((pc.tithi.num - 1) % 15) + 1 : 0, rikta = [4, 9, 14].indexOf(ti) >= 0;
      var x = '<div class="card"><div class="kgh"><h3>Good for today</h3><span class="tag ' + (nn.k === 'g' ? 'g' : nn.k === 'b' ? 'b' : 'tn') + '">' + nn.w + ' star</span></div>' +
        '<div class="pc-row">' + itemIcon(nn.k === 'b' ? 'con' : 'pro') + '<span><b>' + esc(pc.nak.name) + ':</b> ' + esc(nn.use) + '</span></div>' +
        (rikta ? '<div class="pc-row">' + itemIcon('con') + '<span><b>Rikta tithi:</b> traditionally avoided for new beginnings.</span></div>' : '') +
        '<div class="pc-row">' + itemIcon('info') + '<span><b>Dishashool · ' + ds.dir + ':</b> ' + esc(ds.t) + '</span></div>' +
        (BOOK.GANDA.indexOf(pc.nak.index) >= 0 ? '<div class="pc-row">' + itemIcon('info') + '<span><b>Gandamoola star:</b> for a baby born in it, a simple shanti puja about 27 days later is the tradition. Nothing to fear.</span></div>' : '') +
        '<p class="note">For a good start, combine a helpful star with a good tithi, a Shubh, Labh or Amrit Choghadiya, and keep clear of Rahu Kaal.</p></div>';
      var i = h.indexOf('<div class="card"><div class="lbl">The day,'); return i < 0 ? h : h.slice(0, i) + x + h.slice(i);
    } catch (e) { return h; }
  };
})();

/* ---------- Remedies: the right order, a 40-day plan and seven daily habits ---------- */
function bkPlanCard(p, c, now, withBtn) {
  var kid = bkKid(p), plan = BOOK.remedyPlan(c, now, bkSb), act = (DB.remedies || []).filter(function (r) { return r.pid === p.id && r.plan40 && r.until >= dkey(now); });
  var h = '<div class="card bkplan"><div class="kgh"><h3>Your remedy plan</h3><span class="sm">in the right order</span></div><p class="sm" style="margin:0 0 8px">Only ' + plan.length + ' planet' + (plan.length > 1 ? 's' : '') + ' to work on now. Keep it for 40 days; doing a little daily works better than many remedies at once.</p>';
  plan.forEach(function (x) {
    h += '<div class="bkpl"><div class="bkph"><span class="pt" style="background:' + PCOL[x.code] + '">' + x.code + '</span><b>' + PN[x.code] + '</b></div><p class="sm mut">' + esc(x.why) + '</p><ol class="bkst">' +
      '<li><b>Conduct first:</b> ' + esc(kid ? KIDC[x.code] : x.conduct) + '</li>' +
      '<li><b>Daan and seva:</b> ' + esc(kid ? 'With your child, give ' + x.daan + ' on ' + x.day + '.' : 'Give ' + x.daan + ' on ' + x.day + '. ' + x.seva) + '</li>' +
      '<li><b>Short mantra:</b> “' + esc(x.mantra) + '” 108 times' + (kid ? ' (or 11 times, said together)' : '') + ', calmly, morning or evening.</li></ol></div>';
  });
  h += '<p class="note"><b>Gemstones are the last step,</b> only after an expert checks the whole chart. A stone strengthens a planet both ways, so never buy one, or a costly puja, out of fear.</p>';
  if (withBtn) {
    if (act.length) { var st = act[0], d = Math.floor((new Date(dkey(now)) - new Date(st.from)) / 864e5) + 1; h += '<div class="bk40"><b>40-day plan: day ' + Math.min(40, d) + ' of 40</b><div class="mbar"><i style="width:' + Math.min(100, d / 40 * 100) + '%"></i></div><small class="mut">Tick the items in today’s list below.</small></div>'; }
    else h += '<button class="btn acc wide" data-act="start40">Start the 40-day plan</button>';
  }
  return h + '</div>';
}
ACT.start40 = function () {
  var p = curP(), c = calcP(p), now = new Date(), plan = BOOK.remedyPlan(c, now, bkSb), from = dkey(now), until = dkey(new Date(now.getTime() + 39 * 864e5)), kid = bkKid(p); DB.remedies = DB.remedies || [];
  plan.forEach(function (x) {
    var di = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(x.day.split(' ')[0]);
    [{ name: PN[x.code] + ': ' + (kid ? KIDC[x.code] : x.conduct).split('.')[0], type: 'Conduct', count: 1, days: [], note: kid ? KIDC[x.code] : x.conduct },
     { name: 'Donate for ' + PN[x.code], type: 'Daan', count: 1, days: di >= 0 ? [di] : [], note: 'Give ' + x.daan + '. ' + x.seva },
     { name: x.mantra, type: 'Mantra', count: kid ? 11 : 108, days: [], note: 'Short mantra for ' + PN[x.code] + '. Say it calmly, with attention.' }].forEach(function (r) {
      DB.remedies.push({ id: 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), pid: p.id, name: r.name, type: r.type, planet: x.code, days: r.days, count: r.count, time: '07:00', from: from, until: until, note: r.note, done: {}, created: Date.now(), plan40: 1 });
    });
  });
  save(); try { scheduleAll(); } catch (e) { } toast('40-day plan started'); rerender(true);
};
function bkHabits(p, compact) {
  var k = dkey(new Date()); DB.habits = DB.habits || {}; var H = (DB.habits[p.id] = DB.habits[p.id] || {}), t = H[k] || {}, n = BOOK.HABITS.filter(function (x) { return t[x[0]]; }).length;
  var run = 0, d = new Date(); for (var i = 0; i < 400; i++) { var dd = H[dkey(new Date(d.getTime() - i * 864e5))]; var c2 = dd ? Object.keys(dd).length : 0; if (c2 >= 4) run++; else if (i > 0) break; }
  if (compact) return '<button class="kentry k2 bkhome" data-go="remedies"><span class="kei">🪔</span><div><b>Daily habits · ' + n + ' of 7 today</b><small>' + (run ? run + '-day streak · ' : '') + 'Small habits are the strongest remedy</small></div><span>›</span></button>';
  return '<div class="card"><div class="kgh"><h3>Seven daily habits</h3><span class="sm">' + n + '/7' + (run ? ' · ' + run + ' days' : '') + '</span></div><p class="sm" style="margin:0 0 6px">No cost, about 30 minutes a day. Four or more keeps your streak.</p>' + BOOK.HABITS.map(function (x) {
    var on = !!t[x[0]]; return '<div class="chk2"><button class="box2' + (on ? ' on' : '') + '" data-act="habit" data-v="' + x[0] + '">' + (on ? '✓' : '') + '</button><span>' + esc(x[1]) + '</span></div>';
  }).join('') + '</div>';
}
ACT.habit = function (el) { var p = curP(), k = dkey(new Date()); DB.habits = DB.habits || {}; var H = (DB.habits[p.id] = DB.habits[p.id] || {}); H[k] = H[k] || {}; if (H[k][el.dataset.v]) delete H[k][el.dataset.v]; else H[k][el.dataset.v] = 1; var ks = Object.keys(H).sort(); if (ks.length > 400) ks.slice(0, ks.length - 400).forEach(function (x) { delete H[x]; }); save(); rerender(true); };
(function () {
  var r0 = RemediesV2; RemediesV2 = function () {
    var h = r0(), p = curP(); if (!p) return h;
    var x = bkPlanCard(p, calcP(p), new Date(), true) + bkHabits(p);
    var mk = '</div><span>›</span></button>', i = h.indexOf(mk); return i < 0 ? h : h.slice(0, i + mk.length) + x + h.slice(i + mk.length);
  };
  var t0 = TABF.remedies; TABF.remedies = function (p, c, now) {
    var h = t0(p, c, now); h = h.replace('<div class="card"><h3>Gemstones</h3>', '<div class="card"><h3>Gemstones</h3><p class="note" style="margin:-4px 0 8px">Last option only: try conduct, daan and mantra first, and wear a stone only after an expert checks the whole chart.</p>');
    return h.replace('<div class="pad">', '<div class="pad">' + bkPlanCard(p, c, now, false));
  };
  var a0 = AstroV2; AstroV2 = function (id) {
    var h = a0(id), p = curP(); if (!p || id === 'ALL') return h;
    var i = h.indexOf('<div class="kpair">'); return i < 0 ? h : h.slice(0, i) + bkHabits(p, true) + h.slice(i);
  };
})();

/* ---------- AI: reading order and these verdicts ---------- */
(function () {
  var ff = fixedFacts;
  fixedFacts = function (p, c) {
    var s = ff(p, c); try {
      var now = new Date(), md = J.find(c.maha, now), ad = md ? J.find(J.subPeriods(md), now) : null, ss = N.sadeSati(c, now), sd = BOOK.sandhi(c, now);
      var st = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke'].map(function (x) { return PN[x] + ' ' + BOOK.strength(c, x, bkSb).word.toLowerCase(); }).join(', ');
      var hs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(function (h) { var r = BOOK.house(c, h, bkSb); return h + ' ' + r.word.toLowerCase(); }).join(', ');
      s += 'PLANET STRENGTH (sign, house, combustion, Shadbala): ' + st + '.\nHOUSES (house + lord + karaka): ' + hs + '.\n';
      if (ad) { var r = BOOK.adRead(c, md.lord, ad.lord, bkSb); s += 'CURRENT PERIOD VERDICT: ' + PN[md.lord] + '–' + PN[ad.lord] + ' = ' + r.word + '. ' + r.why + '\n'; }
      if (sd) s += 'DASHA CHANGE: ' + sd.text + '\n';
      if (ss.level) s += 'SADE SATI LEVEL: ' + ss.level + ' (' + ss.levelWhy.join('; ') + '). ' + ss.tip + '\n'; else if (ss.good) s += 'SATURN: ' + ss.good + '\n';
      if (ss.ret) s += 'SATURN RETURN: ' + ss.ret + '\n';
      s += BOOK.RULES;
    } catch (e) { }
    return s;
  };
})();
