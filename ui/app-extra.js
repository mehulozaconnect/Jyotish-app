/* Trikaal 3.0: Shadbala, birth time correction, Hindi, WhatsApp */
var SB = makeShadbala(J, C);
function sbOf(c) { if (!c._sb) c._sb = SB.compute(c.k, c.birth, +c.p.lat, +c.p.lon); return c._sb; }

/* ---------- Shadbala ---------- */
TABS.splice(4, 0, ['shadbala', 'Shadbala']);
SECTIONS.splice(1, 0, ['shadbala', 'Planet strength (Shadbala)', 'Which planets deliver, which struggle']);
function sbWord(x) { return x.ratio >= 1.25 ? ['g', 'Very strong'] : x.ratio >= 1 ? ['g', 'Strong'] : x.ratio >= 0.85 ? ['m', 'Just short'] : ['b', 'Weak']; }
function sbMeaning(c, x, kid) {
  var k = c.k, ls = J.lordsOf(k.ascSign, x.code), tops = ls.map(function (h) { return KB.HOUSE[h].topic.split(',')[0]; }), area = tops.length ? tops.join(' and ') : KB.HOUSE[k.P[x.code].house].topic.split(',')[0];
  var good = x.ishta >= x.kashta, w = sbWord(x)[0], d = KB.DAAN_SHORT[x.code];
  if (w === 'g' && good) return 'Delivers well. ' + area.charAt(0).toUpperCase() + area.slice(1) + ' come' + (tops.length > 1 ? '' : 's') + ' through with less effort, and its dasha periods give clear, mostly good results.';
  if (w === 'g') return 'Powerful but harsh. ' + area.charAt(0).toUpperCase() + area.slice(1) + ' get' + (tops.length > 1 ? '' : 's') + ' results, but with stress or a cost. Be careful in its dasha: avoid rash moves' + (kid ? ' and watch health' : ' and big risks') + '.';
  if (w === 'm') return 'Nearly enough strength. Results in ' + area + ' come, but later than hoped and only with steady effort.';
  return 'Struggles to deliver. ' + area.charAt(0).toUpperCase() + area.slice(1) + ' need' + (tops.length > 1 ? '' : 's') + ' extra effort; its dasha can bring delays. Strengthen it: donate ' + d[0] + ' on ' + d[1] + 's and chant its mantra.';
}
TABF.shadbala = function (p, c) {
  var sb = sbOf(c), kid = /child|teen/.test(NARR.stage(age(p, new Date()))), st = sb.P[sb.strongest], wk = sb.P[sb.weakest];
  var h = '<div class="pad"><div class="ocard"><div class="olbl">Planet strength · Shadbala</div><div class="overd g">Strongest: ' + PN[st.code] + ' · Weakest: ' + PN[wk.code] + '</div><p class="op">' + esc(PN[st.code] + ' (' + st.ratio.toFixed(2) + '× the required strength): ' + sbMeaning(c, st, kid) + ' ' + PN[wk.code] + ' (' + wk.ratio.toFixed(2) + '×): ' + sbMeaning(c, wk, kid)) + '</p></div>';
  h += '<div class="card"><div class="kgh"><h3>All seven planets</h3><span class="sm">vs required</span></div>' + sb.rank.map(function (code) {
    var x = sb.P[code], w = sbWord(x), pc = Math.min(100, x.ratio / 1.8 * 100), rq = 1 / 1.8 * 100;
    return '<div class="mk ' + w[0] + '"><div class="mkh"><b>' + x.rank + '. ' + PN[code] + '</b><span class="mkd">' + x.rupa.toFixed(2) + ' of ' + x.req + ' rupas</span><span class="tag ' + (w[0] === 'g' ? 'g' : w[0] === 'b' ? 'b' : 'tn') + '">' + w[1] + '</span></div><div class="mbar sbar"><i style="width:' + pc + '%"></i><em style="left:' + rq + '%"></em></div><small class="mkm">' + (x.ishta >= x.kashta ? 'Mostly good results (Ishta ' + x.ishta.toFixed(0) + ' > Kashta ' + x.kashta.toFixed(0) + ')' : 'Results come with strain (Kashta ' + x.kashta.toFixed(0) + ' > Ishta ' + x.ishta.toFixed(0) + ')') + '</small><p>' + esc(sbMeaning(c, x, kid)) + '</p></div>';
  }).join('') + '<p class="note">The line on each bar is the minimum strength the classics require for that planet.</p></div>';
  var tbl = '<div class="tw"><table><tr><th>Planet</th><th>Sthana</th><th>Dig</th><th>Kala</th><th>Chesta</th><th>Nais.</th><th>Drik</th><th>Total</th></tr>' + SB.P7.map(function (code) { var b = sb.P[code].b; return '<tr><td><b>' + PN[code] + '</b></td>' + [b.sthana, b.dig, b.kala, b.chesta, b.nais, b.drik, sb.P[code].virupa].map(function (v) { return '<td class="mono">' + v.toFixed(0) + '</td>'; }).join('') + '</tr>'; }).join('') + '</table></div><div class="note">Values in virupas (60 = 1 rupa). Sthana: position and dignity in 7 vargas. Dig: direction. Kala: time of birth, paksha, day/hora lords, declination. Chesta: motion (retrograde is strong). Drik: aspects received. Abda and Masa bala (year and month lords, at most 45 virupas) are not included.</div>';
  h += techBlock('Show the six strengths', tbl);
  U.shareFn = function () { return 'Planet strength (Shadbala) for ' + p.name + '\n' + sb.rank.map(function (code) { var x = sb.P[code]; return x.rank + '. ' + PN[code] + ': ' + x.rupa.toFixed(2) + '/' + x.req + ' rupas (' + sbWord(x)[1] + ')'; }).join('\n'); };
  return h + '</div>';
};
/* feed the AI */
(function () {
  var ff = fixedFacts;
  fixedFacts = function (p, c) {
    var s = ff(p, c), sb; try { sb = sbOf(c); } catch (e) { return s; }
    return s + 'SHADBALA (planet strength, ratio to required; >1 strong): ' + sb.rank.map(function (code) { var x = sb.P[code]; return PN[code] + ' ' + x.ratio.toFixed(2) + (x.ishta >= x.kashta ? ' mostly good' : ' with strain'); }).join(', ') + '. Use this when judging how well a planet or its dasha delivers.\n';
  };
})();

/* ---------- Birth time correction ---------- */
function rectify(p, evs, win, step) {
  var c0 = calcP(p), b0 = c0.birth, lat = +p.lat, lon = +p.lon, out = [];
  var TR = evs.map(function (e) { var at = evDate(p, e.date, e.time || '12:00'), T = J.kundli(at, lat, lon); return { e: e, E: KB.EVENTS[e.type], at: at, Ju: T.P.Ju.sign, Sa: T.P.Sa.sign }; });
  for (var m = -win; m <= win; m += step) {
    var b = new Date(b0.getTime() + m * 6e4), k = J.kundli(b, lat, lon), maha = J.dashas(b, k.P.Mo.lon), sc = 0, hit = 0, det = [];
    TR.forEach(function (t) {
      var ev = t.E.houses, ch = J.dashaChain(maha, t.at, 3), s = 0, lv = [];
      ch.forEach(function (d, i) {
        var L = d.lord, pl = k.P[L], hs = J.lordsOf(k.ascSign, L).concat([pl.house]), sl = pl.nak.lord;
        if (L === 'Ra' || L === 'Ke') hs = hs.concat(J.lordsOf(k.ascSign, J.RULER[pl.sign]));
        if (sl !== 'Ra' && sl !== 'Ke') hs = hs.concat(J.lordsOf(k.ascSign, sl));
        if (hs.some(function (h) { return ev.indexOf(h) >= 0; })) { s += [1, 1.5, 2][i] + (t.E.karakas.indexOf(L) >= 0 ? 0.25 : 0); lv.push(['MD', 'AD', 'PD'][i] + ' ' + PN[L]); }
      });
      function touch(sign, code) { var hh = J.houseFrom(k.ascSign, sign); return [hh].concat(J.aspectedHouses(code, hh)).some(function (h) { return ev.indexOf(h) >= 0; }); }
      var dj = touch(t.Ju, 'Ju'), ds = touch(t.Sa, 'Sa'); s += dj && ds ? 1 : dj || ds ? 0.4 : 0;
      if (lv.indexOf('PD') >= 0 || lv.some(function (x) { return /^(AD|PD)/.test(x); })) hit++;
      sc += s; det.push({ e: t.e, l: t.E.l, lv: lv, dt: dj && ds });
    });
    out.push({ m: m, sc: Math.round(sc * 100) / 100, hit: hit, asc: k.ascSign, ascDeg: k.ascDeg, det: det });
  }
  var groups = [];
  out.forEach(function (x) { var g = groups[groups.length - 1]; if (g && g.sc === x.sc && g.asc === x.asc) { g.to = x.m; g.items.push(x); } else groups.push({ from: x.m, to: x.m, sc: x.sc, asc: x.asc, hit: x.hit, items: [x] }); });
  var ranked = groups.slice().sort(function (a, b) { return b.sc - a.sc || Math.abs(a.from + a.to) - Math.abs(b.from + b.to); });
  var cur = out.filter(function (x) { return x.m === 0; })[0];
  return { all: out, groups: groups, top: ranked.slice(0, 3), cur: cur, max: TR.length * 5.75, n: TR.length };
}
function addMin(time, m) { var t = String(time).split(':').map(Number), s = (t[0] * 3600 + (t[1] || 0) * 60 + (t[2] || 0) + m * 60 + 86400) % 86400; return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map(function (x) { return (x < 10 ? '0' : '') + x; }).join(':'); }
function btOff(m) { return m === 0 ? 'as recorded' : (m > 0 ? '+' : '−') + Math.abs(m) + ' min'; }
var btOld = TABF.btime;
TABF.btime = function (p, c, now) {
  var evs = (p.events || []).filter(function (e) { return KB.EVENTS[e.type]; }), f = U.btForm || (U.btForm = { type: 'marriage', date: '' }), win = U.btWin || 60;
  var h = '<div class="pad"><div class="card"><h3>Correct the birth time</h3><p class="mut" style="font-size:13px;margin:-2px 0 10px">Add 3 or more big life events with dates. Trikaal tries every minute around the recorded time and finds where the dashas and transits fit those events best.</p>';
  h += evs.length ? evs.map(function (e, i) { return '<div class="btev"><span>' + esc(KB.EVENTS[e.type].l) + '</span><b class="mono">' + N.dmy(evDate(p, e.date, '12:00')) + '</b><button class="ib" data-act="btDel" data-i="' + (p.events.indexOf(e)) + '">×</button></div>'; }).join('') : '<p class="note">No events yet.</p>';
  h += '<div class="grid2" style="margin-top:8px"><label class="field"><span>EVENT</span>' + sel('btType', EVT.map(function (x) { return [x, KB.EVENTS[x].l]; }), f.type) + '</label><label class="field"><span>DATE</span><input class="inp" type="date" data-in="btf" data-f="date" value="' + esc(f.date) + '"></label></div><button class="btn sec wide" data-act="btAdd">+ Add event</button>';
  h += '<div class="field" style="margin-top:12px"><span>SEARCH WINDOW</span><div class="seg">' + [[15, '±15 min'], [60, '±1 hour'], [120, '±2 hours']].map(function (w) { return '<button class="' + (w[0] === win ? 'on' : '') + '" data-act="btWin" data-v="' + w[0] + '">' + w[1] + '</button>'; }).join('') + '</div></div>';
  h += '<button class="btn acc wide" data-act="btRun"' + (evs.length < 2 ? ' disabled' : '') + '>Find the best birth time</button>' + (evs.length < 3 ? '<p class="note">' + (evs.length < 2 ? 'Add at least 2 events (3 or more gives a reliable answer).' : 'With only 2 events the answer is rough; add one more if you can.') + '</p>' : '') + '</div>';
  if (p.timeOrig && p.timeOrig !== p.time) h += '<div class="card"><p style="margin:0 0 8px">Birth time was changed from <b>' + esc(p.timeOrig.slice(0, 5)) + '</b> to <b>' + esc(String(p.time).slice(0, 5)) + '</b>.</p><button class="btn sec wide" data-act="btRestore">Restore the original time</button></div>';
  var R = U.bt && U.bt.pid === p.id ? U.bt.r : null;
  if (R) {
    var best = R.top[0], mid = Math.round((best.from + best.to) / 2), curOk = R.cur && R.cur.sc >= best.sc - 0.01, spread = R.top[1] ? best.sc - R.top[1].sc : best.sc;
    var conf = R.n >= 4 && spread >= 1 ? ['g', 'Clear answer'] : R.n >= 3 && spread >= 0.5 ? ['m', 'Fair answer'] : ['b', 'Weak answer: add more events'];
    h += '<div class="ocard" id="btres"><div class="olbl">Best fit · ' + conf[1] + '</div><div class="overd ' + (curOk ? 'g' : conf[0]) + '">' + (curOk ? 'Your recorded time fits' : 'Try ' + addMin(p.time, mid).slice(0, 5)) + '</div><p class="op">' + esc(curOk ? 'The recorded time ' + String(p.time).slice(0, 5) + ' is inside the best-fitting window (' + addMin(p.time, best.from).slice(0, 5) + '–' + addMin(p.time, best.to).slice(0, 5) + ', ' + SG[best.asc] + ' lagna). Keep it.' : 'Between ' + addMin(p.time, best.from).slice(0, 5) + ' and ' + addMin(p.time, best.to).slice(0, 5) + ' (' + btOff(best.from) + ' to ' + btOff(best.to) + '), the dashas match ' + best.hit + ' of ' + R.n + ' events. Lagna there: ' + SG[best.asc] + (best.asc !== calcP(p).k.ascSign ? ', which changes the lagna. Confirm with the person\'s looks and nature before changing.' : ', same lagna as now.')) + '</p>' + (curOk ? '' : '<button class="btn acc wide" data-act="btApply" data-v="' + addMin(p.time, mid) + '">Use ' + addMin(p.time, mid).slice(0, 5) + ' as the birth time</button>') + '</div>';
    h += '<div class="card"><h3>Top windows</h3>' + R.top.map(function (g, i) { return '<div class="btw' + (i === 0 ? ' on' : '') + '"><b class="mono">' + addMin(p.time, g.from).slice(0, 5) + '–' + addMin(p.time, g.to).slice(0, 5) + '</b><span>' + SG[g.asc] + ' lagna · ' + g.hit + '/' + R.n + ' events</span><i style="width:' + Math.round(g.sc / R.max * 100) + '%"></i></div>'; }).join('') + '<p class="note">Recorded time scores ' + (R.cur ? R.cur.sc : 0) + ' against the best ' + best.sc + '.</p></div>';
    h += '<div class="card"><h3>How each event fits the best window</h3>' + best.items[0].det.map(function (d) { return '<div class="rs ' + (d.lv.length >= 2 ? 'g' : d.lv.length ? 'i' : 'b') + '"><h4>' + esc(d.l) + ' · ' + N.dmy(evDate(p, d.e.date, '12:00')) + '</h4><p>' + esc(d.lv.length ? 'Running ' + d.lv.join(', ') + ' connect to this kind of event' + (d.dt ? '; Jupiter and Saturn both touched the event house' : '') + '.' : 'No dasha connection in this window; this event does not support it.') + '</p></div>'; }).join('') + '</div>';
  }
  h += techBlock('How sensitive is this chart to the birth time?', btOld(p, c, now).replace(/^<div class="pad">/, '').replace(/<\/div>$/, ''));
  return h + '</div>';
};
CHG.btType = function (el) { U.btForm.type = el.value; };
INP.btf = function (el) { U.btForm[el.dataset.f] = el.value; };
ACT.btWin = function (el) { U.btWin = +el.dataset.v; U.bt = null; rerender(true); };
ACT.btAdd = function () { var p = person(U.cur), f = U.btForm; if (!/^\d{4}-\d{2}-\d{2}$/.test(f.date)) return toast('Enter the date'); p.events = p.events || []; p.events.push({ type: f.type, date: f.date, time: '12:00' }); f.date = ''; U.bt = null; save(); rerender(true); };
ACT.btDel = function (el) { var p = person(U.cur); p.events.splice(+el.dataset.i, 1); U.bt = null; save(); rerender(true); };
ACT.btRun = function () {
  var p = person(U.cur), evs = (p.events || []).filter(function (e) { return KB.EVENTS[e.type]; }), win = U.btWin || 60;
  toast('Checking ' + (win * 2 + 1) + ' possible times…');
  setTimeout(function () { U.bt = { pid: p.id, r: rectify(p, evs, win, win > 60 ? 2 : 1) }; rerender(true); setTimeout(function () { var r = $('#btres'); if (r) r.scrollIntoView({ behavior: 'smooth' }); }, 60); }, 30);
};
ACT.btApply = function (el) {
  var t = el.dataset.v, p = person(U.cur);
  sheet('<div class="pad"><h3 style="font:600 18px var(--sans);margin:4px 0 8px">Change birth time?</h3><p>' + esc(p.name) + ': ' + esc(String(p.time).slice(0, 5)) + ' → <b>' + esc(t.slice(0, 5)) + '</b>. All readings will use the new time. You can restore the original from this screen.</p><div class="grid2"><button class="btn sec" data-act="close">Cancel</button><button class="btn acc" data-act="btYes" data-v="' + t + '">Change</button></div></div>');
};
ACT.btYes = function (el) { var p = person(U.cur); if (!p.timeOrig) p.timeOrig = p.time; p.time = el.dataset.v; U.bt = null; save(); closeSheet(); if (typeof scheduleAll === 'function') try { scheduleAll(); } catch (e) { } toast('Birth time updated'); rerender(true); };
ACT.btRestore = function () { var p = person(U.cur); p.time = p.timeOrig; delete p.timeOrig; U.bt = null; save(); toast('Original time restored'); rerender(true); };

/* ---------- Hindi ---------- */
var HI = {
  'AI': 'AI', 'Astrology': 'ज्योतिष', 'Panchang': 'पंचांग', 'Dasha': 'दशा', 'Remedies': 'उपाय', 'More': 'अधिक', 'Report': 'रिपोर्ट', 'Reports': 'रिपोर्ट', 'Charts': 'कुंडली चार्ट', 'Planets': 'ग्रह', 'Transit': 'गोचर', 'Health': 'स्वास्थ्य', 'Event': 'घटना', 'Ashtakavarga': 'अष्टकवर्ग', 'Varshphal': 'वर्षफल', 'Yogas': 'योग', 'Birth time': 'जन्म समय', 'Shadbala': 'षड्बल',
  'Kundli analysis': 'कुंडली विश्लेषण', 'Kundli Milan': 'कुंडली मिलान', 'Health risks': 'स्वास्थ्य जोखिम', 'Choghadiya': 'चौघड़िया', 'Day': 'दिन', 'Night': 'रात', 'Good': 'शुभ', 'Avoid': 'टालें', 'Neutral': 'सामान्य', 'now': 'अभी', 'Today': 'आज', 'Back to today': 'आज पर लौटें',
  'Tithi': 'तिथि', 'Nakshatra': 'नक्षत्र', 'Yoga': 'योग', 'Karana': 'करण', 'Vara': 'वार', 'Moon': 'चंद्र', 'Sun': 'सूर्य', 'Mars': 'मंगल', 'Mercury': 'बुध', 'Jupiter': 'गुरु', 'Venus': 'शुक्र', 'Saturn': 'शनि', 'Rahu': 'राहु', 'Ketu': 'केतु',
  'Boy': 'वर', 'Girl': 'कन्या', '8 kootas': '8 कूट', 'Mangal dosha': 'मंगल दोष', 'Marriage in each chart': 'दोनों कुंडली में विवाह', 'What to tell the families': 'परिवार को क्या बताएं', 'Key takeaways': 'मुख्य बातें', 'Be careful': 'सावधान रहें',
  'Correct the birth time': 'जन्म समय सुधारें', 'Find the best birth time': 'सबसे सही जन्म समय खोजें', '+ Add event': '+ घटना जोड़ें', 'Top windows': 'सबसे अच्छे समय', 'All seven planets': 'सातों ग्रह',
  'Strong': 'बलवान', 'Very strong': 'अति बलवान', 'Weak': 'कमज़ोर', 'Just short': 'थोड़ा कम', 'Language': 'भाषा', 'Choose person': 'व्यक्ति चुनें', 'Manage': 'प्रबंधन', '+ New kundli': '+ नई कुंडली'
};
function isHi() { return DB.settings.lang === 'hi'; }
function isTr() { return ['hi', 'hing', 'easy'].indexOf(DB.settings.lang) >= 0; }
function hiCache() { DB.tr = DB.tr || {}; if (DB.hi && !DB.tr.hi) { DB.tr.hi = DB.hi; delete DB.hi; } var m = DB.settings.lang; return DB.tr[m] || (DB.tr[m] = {}); }
var TR_PROMPT = {
  hi: 'You translate the text of a Vedic astrology app into simple, natural Hindi (Devanagari) that an ordinary Indian family understands. Use common Hindi astrology words: lagna=लग्न, dasha=दशा, Mahadasha=महादशा, Antardasha=अंतर्दशा, house=भाव, transit=गोचर, remedy=उपाय, yoga=योग, dosha=दोष; planets: Sun सूर्य, Moon चंद्र, Mars मंगल, Mercury बुध, Jupiter गुरु, Venus शुक्र, Saturn शनि, Rahu राहु, Ketu केतु; signs in Hindi (Aries मेष …).',
  hing: 'You rewrite the text of a Vedic astrology app into easy Hinglish: Hindi written in English (Roman) letters mixed with simple English words, the way people talk in Mumbai. Example: "Is mahine career mein growth hogi, lekin bade decisions jaldi mat lena." Use common words: Shani, Guru, Mangal, Budh, Shukra, Surya, Chandra, Rahu, Ketu; ghar/bhaav for house, dasha, gochar for transit, upay for remedy. Short sentences.',
  easy: 'You rewrite the text of a Vedic astrology app into very easy English for someone who reads English as a second language. Use short sentences (under 15 words), everyday words, no difficult vocabulary. Explain astrology words in a few words in brackets the first time, e.g. "Saturn period (Shani dasha)". Keep the meaning exactly; do not add or remove advice.'
};
var TR_NAME = { hi: 'Hindi', hing: 'Hinglish', easy: 'easy English' };
var HI_PEND = {}, HI_BUSY = false;
function hiNodes(root) {
  var out = [], w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: function (n) {
    var el = n.parentElement; if (!el || el.closest('script,style,textarea,input,.mono,.chat,[data-notr],svg')) return NodeFilter.FILTER_REJECT;
    var t = n.nodeValue.trim(); if (t.length < 2 || !/[A-Za-z]{2}/.test(t) || /[ऀ-ॿ]/.test(t)) return NodeFilter.FILTER_REJECT; return NodeFilter.FILTER_ACCEPT; } });
  while (w.nextNode()) out.push(w.currentNode); return out;
}
function hiApply(fetch) {
  if (!isTr()) return; var names = DB.people.map(function (p) { return p.name; }), cache = hiCache(), want = [], done = {}; Object.keys(cache).forEach(function (k) { done[cache[k]] = 1; });
  [$('#app'), $('#nav')].forEach(function (root) { if (!root) return; hiNodes(root).forEach(function (n) {
    var raw = n.nodeValue, t = raw.trim(), lead = raw.match(/^\s*/)[0], tail = raw.match(/\s*$/)[0];
    if (names.indexOf(t) >= 0 || /^[A-Z][a-z]+ [A-Z][a-z]+$/.test(t) && names.some(function (x) { return x.indexOf(t) === 0; })) return;
    if (done[t]) return; var v = (isHi() ? HI[t] : null) || cache[t]; if (v) { n.nodeValue = lead + v + tail; return; }
    if (t.length <= 600) want.push(t);
  }); });
  if (fetch && want.length && DB.settings.gkey) { want.forEach(function (t) { HI_PEND[t] = 1; }); hiFetch(); }
}
function hiFetch() {
  if (HI_BUSY) return; var keys = Object.keys(HI_PEND), batch = [], len = 0;
  keys.forEach(function (k) { if (len < 7000 && batch.length < 120) { batch.push(k); len += k.length; } });
  if (!batch.length) return; HI_BUSY = true; batch.forEach(function (k) { delete HI_PEND[k]; });
  var mode = DB.settings.lang, body = JSON.stringify({ system_instruction: { parts: [{ text: TR_PROMPT[mode] + ' Keep numbers, dates, times, degrees and people\'s names as they are. Keep it short like the original. Return ONLY a JSON array of strings, same length and order as the input.' }] },
    contents: [{ role: 'user', parts: [{ text: JSON.stringify(batch) }] }], generationConfig: { temperature: 0.2, responseMimeType: 'application/json' } });
  if (!U.hiToast) { U.hiToast = 1; toast('Rewriting in ' + TR_NAME[mode] + '…', 1800); }
  gGenerate(body).then(function (d) {
    var cand = d.candidates && d.candidates[0], txt = cand && cand.content && cand.content.parts ? cand.content.parts.filter(function (x) { return x.text && !x.thought; }).map(function (x) { return x.text; }).join('') : '[]';
    if (DB.settings.lang !== mode) { HI_BUSY = false; return; }
    var arr = JSON.parse(txt.replace(/^```(json)?|```$/g, '').trim()), cache = hiCache();
    if (Array.isArray(arr)) batch.forEach(function (k, i) { if (typeof arr[i] === 'string' && arr[i].trim()) cache[k] = arr[i].trim(); });
    var ks = Object.keys(cache); if (ks.length > 4000) ks.slice(0, ks.length - 4000).forEach(function (k) { delete cache[k]; });
    save(); HI_BUSY = false; hiApply(false); if (Object.keys(HI_PEND).length) hiFetch(); else U.hiToast = 0;
  }).catch(function (e) { HI_BUSY = false; U.hiToast = 0; HI_PEND = {}; toast(TR_NAME[mode] + ' rewrite failed: ' + e.message, 3500); });
}
(function () {
  var r0 = render; render = function () { r0(); if (isTr()) hiApply(true); document.documentElement.lang = isHi() ? 'hi' : 'en'; };
  var g0 = geminiFormat; geminiFormat = function (name, intent, rel, me) { var m = DB.settings.lang; return g0(name, intent, rel, me) + (m === 'hi' ? '\nLANGUAGE: Write the whole answer in simple Hindi (Devanagari script), using common Hindi astrology words (लग्न, दशा, गोचर, उपाय, भाव). Keep dates and numbers as digits.' : m === 'hing' ? '\nLANGUAGE: Write the whole answer in easy Hinglish (Hindi in English letters mixed with simple English words, the way people talk in Mumbai), e.g. "Is saal career mein growth hogi, lekin March tak jaldi decisions mat lena." Use Shani, Guru, Mangal, Budh, Shukra, Surya, Chandra, Rahu, Ketu, dasha, gochar, upay. Keep section headings in English. Short sentences.' : '\nLANGUAGE: Use very easy, everyday English. Short sentences (under 15 words). No difficult words. Avoid astrology jargon; if you must use a term, explain it in a few words in brackets, e.g. "Saturn period (Shani dasha)".'); };
})();
function langCard() {
  var m = DB.settings.lang || 'en';
  return '<div class="card"><h3>Language</h3><div class="seg seg4">' + [['en', 'English'], ['easy', 'Easy English'], ['hing', 'Hinglish'], ['hi', 'हिंदी']].map(function (l) { return '<button data-notr class="' + (m === l[0] ? 'on' : '') + '" data-act="setLang" data-v="' + l[0] + '">' + l[1] + '</button>'; }).join('') + '</div><p class="note">' + ({ en: 'Normal app English. AI answers use simple everyday English.', easy: 'Every reading is rewritten in short, easy sentences.', hing: 'Every reading is rewritten in Hinglish, e.g. "Is mahine career mein growth hogi, lekin jaldi decisions mat lena."', hi: 'Menus switch to Hindi at once; readings are translated into Hindi.' }[m]) + (m !== 'en' ? (DB.settings.gkey ? ' Gemini rewrites each screen the first time you open it; after that it works offline. AI answers come in the same language.' : ' Add your Gemini key below to rewrite the readings; until then only the AI style changes.') : '') + '</p></div>';
}
ACT.setLang = function (el) { DB.settings.lang = el.dataset.v; save(); rerender(true); };

/* ---------- WhatsApp ---------- */
function waCard(title, name, head, pts) {
  var W = 1080, cv = document.createElement('canvas'), x = cv.getContext('2d'), F = getComputedStyle(document.body).fontFamily || 'sans-serif';
  function wrap(t, font, maxW) { x.font = font; var words = String(t).split(' '), lines = [], cur = ''; words.forEach(function (w) { var tt = cur ? cur + ' ' + w : w; if (x.measureText(tt).width > maxW && cur) { lines.push(cur); cur = w; } else cur = tt; }); if (cur) lines.push(cur); return lines; }
  var hl = wrap(head, '600 54px ' + F, W - 140), pl = pts.slice(0, 6).map(function (p) { return wrap(p, '400 36px ' + F, W - 190).slice(0, 4); });
  var H = 330 + hl.length * 68 + pl.reduce(function (a, l) { return a + l.length * 50 + 26; }, 0) + 130; cv.width = W; cv.height = H; x = cv.getContext('2d');
  x.fillStyle = '#FBF7EF'; x.fillRect(0, 0, W, H);
  var g = x.createLinearGradient(0, 0, W, 0); g.addColorStop(0, '#2B2A5E'); g.addColorStop(1, '#4A3B7A'); x.fillStyle = g; x.fillRect(0, 0, W, 210);
  x.fillStyle = '#F2C46D'; x.font = '700 30px ' + F; x.fillText('TRIKAAL · ' + String(title).toUpperCase().slice(0, 40), 70, 82);
  x.fillStyle = '#fff'; x.font = '600 56px ' + F; x.fillText(String(name).slice(0, 30), 70, 160);
  var y = 300; x.fillStyle = '#1F1B2D'; hl.forEach(function (l) { x.font = '600 54px ' + F; x.fillText(l, 70, y); y += 68; }); y += 20;
  pl.forEach(function (ls) { x.fillStyle = '#C46A1C'; x.beginPath(); x.arc(86, y - 12, 9, 0, 7); x.fill(); x.fillStyle = '#3A3546'; ls.forEach(function (l) { x.font = '400 36px ' + F; x.fillText(l, 116, y); y += 50; }); y += 26; });
  x.fillStyle = '#E8DFCF'; x.fillRect(70, H - 100, W - 140, 2); x.fillStyle = '#8A8295'; x.font = '400 28px ' + F; x.fillText('Parashari · N.C. Lahiri · ' + N.dmy(new Date()), 70, H - 50);
  return cv.toDataURL('image/png').split(',')[1];
}
function screenDigest() {
  var app = $('#app'), q = function (s) { var e = app.querySelector(s); return e ? e.innerText.trim() : ''; };
  var title = q('.top .ttl') || q('.v2top h1') || 'Reading', head = q('.overd') || q('.ocard h3') || q('.card h3') || '', intro = q('.op');
  var ots = app.querySelectorAll('.otell'), lis = ots.length ? Array.prototype.slice.call(ots[ots.length - 1].querySelectorAll('li')).map(function (e) { return e.innerText.trim(); }) : [], sc = app.querySelector('.mring b'); if (sc && head) head += ' · ' + sc.innerText + '/36';
  if (!lis.length) lis = Array.prototype.slice.call(app.querySelectorAll('.rs h4, .kout, .mk p')).slice(0, 6).map(function (e) { return e.innerText.trim(); });
  return { title: title, head: head, intro: intro, pts: lis.slice(0, 8) };
}
function waText(title, name, d, extra) {
  return '*' + title + ' · ' + name + '*\n' + (d.head ? '*' + d.head + '*\n' : '') + (d.intro ? d.intro + '\n' : '') + (d.pts.length ? '\n' + d.pts.map(function (p, i) { return (i + 1) + '. ' + p; }).join('\n') + '\n' : '') + (extra ? '\n' + extra + '\n' : '') + '\n_Trikaal · Parashari, N.C. Lahiri_';
}
function waSend(text, phone, img) {
  phone = String(phone || '').replace(/[^0-9]/g, ''); if (phone.length === 10) phone = '91' + phone;
  try { if (AND && AND.shareWhatsApp) { AND.shareWhatsApp(text, phone, img || ''); return; } } catch (e) { }
  window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(text), '_blank');
}
function shareSheet(kind) {
  var p = person(U.cur), ph = p && relOf(p) !== 'me' && p.phone ? p.phone : '';
  sheet('<div class="pad"><h3 style="font:600 18px var(--sans);margin:4px 0 10px">Share</h3>' +
    '<button class="wabtn" data-act="waGo" data-k="' + kind + '" data-ph="' + esc(ph) + '"><span>✆</span><div><b>WhatsApp' + (ph ? ' to ' + esc(nm(p)) : '') + '</b><small>Summary card image + key points' + (ph ? ' · ' + esc(ph) : '') + '</small></div></button>' +
    (ph ? '<button class="wabtn alt" data-act="waGo" data-k="' + kind + '" data-ph=""><span>✆</span><div><b>WhatsApp: choose chat</b><small>Pick any contact or group</small></div></button>' : '') +
    '<button class="btn sec wide" data-act="shareOther" data-k="' + kind + '" style="margin-top:8px">Other apps (text)</button></div>');
}
var shareTab0 = ACT.shareTab, shareMilan0 = ACT.shareMilan;
ACT.shareTab = function () { shareSheet('tab'); };
ACT.shareMilan = function () { shareSheet('milan'); };
ACT.shareOther = function (el) { closeSheet(); (el.dataset.k === 'milan' ? shareMilan0 : shareTab0)(); };
ACT.waGo = function (el) {
  closeSheet(); var kind = el.dataset.k, ph = el.dataset.ph, p = curP(), d = screenDigest(), title = d.title, name = p ? p.name : '', extra = '';
  if (kind === 'milan') { var bs = $('#app').querySelectorAll('.msel'); name = bs.length ? bs[0].selectedOptions[0].text + ' & ' + bs[1].selectedOptions[0].text : ''; title = isHi() ? 'कुंडली मिलान' : 'Kundli Milan'; extra = Array.prototype.slice.call($('#app').querySelectorAll('.mk')).map(function (e) { return '• ' + e.querySelector('.mkh b').innerText + ': ' + e.querySelector('.mks').innerText; }).join('\n'); }
  else if (!isTr() && U.shareFn && !d.pts.length) { extra = U.shareFn(); }
  var img = ''; try { img = waCard(title, name, d.head || title, d.pts.length ? d.pts : (extra ? extra.split('\n').slice(1, 6) : [d.intro])); } catch (e) { }
  waSend(waText(title, name, d, extra), ph, img);
};
/* quick entries on the Astrology home */
(function () {
  var a0 = AstroV2; AstroV2 = function (id) {
    var h = a0(id), p = curP(), mk = 'Mangal dosha, remedies</small></div><span>›</span></button>';
    if (!p || h.indexOf(mk) < 0) return h;
    return h.replace(mk, mk + '<div class="kpair" style="margin-top:10px"><button class="kentry k5" data-go="p/' + p.id + '/shadbala"><span class="kei">⚖</span><div><b>Shadbala</b><small>Planet strength: who delivers, who struggles</small></div></button><button class="kentry k6" data-go="p/' + p.id + '/btime"><span class="kei">⏱</span><div><b>Birth time</b><small>Correct it from life events</small></div></button></div>');
  };
})();

/* ---------- AI: sturdier Gemini, follow-ups, business vs job ---------- */
var DSC = { 'Exalted': 5, 'Moolatrikona': 4.5, 'Own sign': 4, 'Friendly sign': 3, 'Neutral sign': 2, 'Enemy sign': 1, 'Debilitated': 0 };
function bizJob(p, c, now) {
  var k = c.k, P = k.P, A = k.ascSign, L = function (h) { return J.lordOfHouse(A, h); }, sb = null; try { sb = sbOf(c); } catch (e) { }
  var nm1 = p.name.split(' ')[0], self = relOf(p) === 'me', you = self ? 'you' : nm1, your = self ? 'your' : nm1 + '\'s';
  var biz = 0, job = 0, bw = [], jw = [], care = [];
  function str(code) { var d = DSC[P[code].dignity] == null ? 2 : DSC[P[code].dignity], r = sb && sb.P[code] ? sb.P[code].ratio : 1; return d + (r >= 1.1 ? 1 : r < 0.9 ? -1 : 0); }
  var l7 = L(7), l6 = L(6), l10 = L(10), l3 = L(3), l11 = L(11), good = [1, 4, 5, 7, 9, 10, 11];
  var s7 = str(l7); biz += s7 - 2; if (good.indexOf(P[l7].house) >= 0) { biz += 1.5; bw.push('7th lord ' + PN[l7] + ' (business and partners) is well placed in the ' + N.nth(P[l7].house)); } else if ([6, 8, 12].indexOf(P[l7].house) >= 0) { biz -= 1.5; care.push('7th lord ' + PN[l7] + ' sits in the ' + N.nth(P[l7].house) + ': partnerships can bring disputes or losses, so keep everything in writing'); }
  var s3 = str(l3); if (s3 >= 3) { biz += 1; bw.push('3rd lord ' + PN[l3] + ' (courage, own effort) is strong'); }
  var sMe = str('Me'); if (sMe >= 4) { biz += 1; bw.push('Mercury (trade, deals) is strong'); } else if (sMe <= 1) { biz -= 1; care.push('Mercury is weak: be careful with contracts, accounts and quick deals'); }
  if ([7, 10, 11, 3].indexOf(P.Ra.house) >= 0) { biz += 1; bw.push('Rahu in the ' + N.nth(P.Ra.house) + ' gives appetite for risk and new ventures'); }
  if (P[l10].house === 7) { biz += 2; bw.push('10th lord in the 7th: career through trade and clients'); }
  if (P[l10].house === 6) { job += 2; jw.push('10th lord in the 6th: career through service and employment'); }
  var s6 = str(l6); if (s6 >= 3 && good.concat([6]).indexOf(P[l6].house) >= 0) { job += 1.5; jw.push('6th lord ' + PN[l6] + ' (service, daily work) is strong'); }
  var sSa = str('Sa'); if (sSa >= 3) { job += 1; jw.push('Saturn (steady service, discipline) is strong'); }
  if (P.Su.house === 10 || str('Su') >= 4) { job += 1; jw.push('a strong Sun favours a position with authority, even in a large organisation or government'); }
  var s10 = str(l10); if (s10 >= 3) { job += 0.5; biz += 0.5; } else care.push('10th lord ' + PN[l10] + ' is not strong: career gains need patience whichever path is chosen');
  if (k.planets.some(function (x) { return x.house === 10 && ['Sa', 'Su', 'Ma'].indexOf(x.code) >= 0; })) { job += 0.5; }
  if (k.planets.some(function (x) { return x.house === 7 && ['Sa', 'Ra', 'Ke', 'Ma'].indexOf(x.code) >= 0; })) care.push(k.planets.filter(function (x) { return x.house === 7 && ['Sa', 'Ra', 'Ke', 'Ma'].indexOf(x.code) >= 0; }).map(function (x) { return PN[x.code]; }).join(' and ') + ' in the 7th: choose partners very carefully');
  /* periods */
  function links(lord) { var pl = P[lord], hs = J.lordsOf(A, lord).concat([pl.house]); return hs; }
  var ch = J.dashaChain(c.maha, now, 2), md = ch[0], ad = ch[1] || ch[0], hnow = links(md.lord).concat(links(ad.lord));
  var nowBiz = hnow.indexOf(7) >= 0 || hnow.indexOf(3) >= 0, nowJob = hnow.indexOf(6) >= 0 || hnow.indexOf(10) >= 0;
  var win = []; J.dashas(c.birth, P.Mo.lon).forEach(function (m) { if (m.end < now) return; J.subPeriods(m).forEach(function (a) { if (a.end < now || a.start > new Date(now.getTime() + 12 * 365.25 * 864e5)) return; var hs = links(m.lord).concat(links(a.lord)); if (hs.indexOf(7) >= 0 && hs.indexOf(11) >= 0 && str(a.lord) >= 2 && win.length < 2) win.push({ s: a.start, e: a.end, l: PN[m.lord] + '–' + PN[a.lord] }); }); });
  var diff = biz - job, verdict;
  if (diff >= 1.5) verdict = 'Own business suits ' + you + ' better than a job.';
  else if (diff <= -1.5) verdict = 'A job suits ' + you + ' better than own business.';
  else verdict = 'Both can work: the best route is a job with a side business, or a business with a partner who handles operations.';
  var timing = 'Right now ' + PN[md.lord] + '–' + PN[ad.lord] + ' (till ' + N.dmy(ad.end) + ') ' + (nowBiz && !nowJob ? 'supports starting or growing a business.' : nowJob && !nowBiz ? 'supports a job: change of role, promotion or a better offer, more than a new business.' : nowBiz && nowJob ? 'supports both; a business can start alongside the current work.' : 'is not strongly linked to either; avoid big jumps and prepare.');
  var whenB = win.length ? 'Best windows to start a business: ' + win.map(function (w) { return w.l + ' (' + N.dmy(w.s) + ' – ' + N.dmy(w.e) + ')'; }).join('; ') + '.' : 'No strong business-start window in the next 12 years; business is better as a side activity.';
  var todo = diff <= -1.5 ? ['Stay in employment and aim for a senior or specialist role.', 'If ' + you + ' want' + (self ? '' : 's') + ' extra income, keep a small side business with limited money at risk.'] : diff >= 1.5 ? ['Plan the business now; launch in the window shown above.', 'Keep 6 months of expenses aside before leaving a job.'] : ['Keep the job; start the business on the side and switch only when it earns steadily for 6 months.'];
  todo.push('Strengthen ' + PN[l7] + ' (7th lord) and Mercury: donate ' + KB.DAAN_SHORT[l7][0] + ' on ' + KB.DAAN_SHORT[l7][1] + 's.');
  return { quick: verdict, paras: [timing + ' ' + whenB, (bw.length ? 'For business: ' + bw.join('; ') + '. ' : 'Business factors are average. ') + (jw.length ? 'For a job: ' + jw.join('; ') + '.' : 'Job factors are average.'), care.length ? 'Be careful: ' + care.join('; ') + '.' : 'Be careful: do not invest borrowed money in a new venture during Rahu or Saturn sub-periods.'], short: 'Score: business ' + biz.toFixed(1) + ' vs job ' + job.toFixed(1) + ' (from 7th, 3rd, 6th, 10th lords, Mercury, Saturn, Sun and Shadbala).', todo: todo, question: null };
}
function lastQs(p) { var l = DB.chats[p.id] || []; return l.filter(function (m) { return m.role === 'me'; }).map(function (m) { return m.text; }); }
function isStatement(q) {
  var t = q.trim().toLowerCase();
  if (/\?/.test(t)) return false;
  if (/^(what|when|will|how|why|which|who|where|is|are|am|can|could|should|shall|does|do|did|has|have|kab|kya|kaise|kaisa|kaun|kitna|tell|explain|give|show|predict|list|check|analy[sz]e|compare|suggest|find|what's|whats|any|key points|remedies)\b/.test(t)) return false;
  if (/\b(when will|will (she|he|i|they)|should (she|he|i)|tell me|what about|chances|possible|predict)\b/.test(t)) return false;
  if (/\b(wants? to know|know about|asking|query|regarding|about (her|his|my|their)|\bor\b)\b/.test(t)) return false;
  return t.split(/\s+/).length >= 3 && /\b(is|was|were|left|lives?|living|stay(s|ing|ed)?|works?|working|worked|married|has|had|got|lost|moved|born|studying|studied|started|passed|divorced|separated|joined|quit|resigned|running|owns|bought|sold|already|since|ago|back)\b/.test(t);
}
function prevQuestion(p) { var qs = lastQs(p).slice(0, -1); for (var i = qs.length - 1; i >= 0; i--) if (!isStatement(qs[i])) return qs[i]; return ''; }
function withContext(p, q) {
  var prev = prevQuestion(p), words = q.trim().split(/\s+/).length;
  if (isStatement(q)) {
    var facts = lastQs(p).slice(0, -1).filter(isStatement).slice(-3).concat([q]);
    return (prev ? prev : 'Give a reading of the present situation') + '\n\nFACTS SHARED BY THE ASTROLOGER (real-life information, NOT new questions): ' + facts.join(' | ') + '\nDo not invent a new topic from these facts. Answer the question above again in the light of them: say briefly how the chart shows these facts (this also confirms the birth time), then update the answer to the question.';
  }
  if (prev && words <= 7 && !/\b(19|20)\d\d\b/.test(q) && !/\b(health|marriage|child|money|property|travel|education|study|exam)\b/i.test(q)) return prev + ' — follow-up: ' + q;
  return q;
}
(function () {
  var aa = answerAny;
  answerAny = function (p, c, q) {
    var qq = withContext(p, q), res;
    if (/\bbusiness|own (work|venture|firm|company|setup)|start ?up|self.?employ|vyapar|vyavsay|dhandha|naukri|job or|or job|service or/i.test(qq)) res = storyRes(bizJob(p, c, new Date()));
    else res = aa(p, c, qq);
    var l = DB.chats[p.id] || [], prevBot = l.filter(function (m) { return m.role === 'bot'; }).slice(-1)[0];
    if (res && res.story && res.story.question && prevBot) res = storyRes(Object.assign({}, res.story, { question: null }));
    if (res && prevBot && prevBot.text && res.text && prevBot.text.indexOf(res.text.slice(0, 120)) >= 0) res.html = '<div class="msg bot"><p class="mut" style="font-size:12.5px">The offline engine has nothing new for this follow-up. Ask Gemini again for a specific answer, or ask in a fuller sentence.</p></div>';
    return res;
  };
  var ag = askGemini;
  askGemini = function (p, c, q, onLive) {
    var qq = withContext(p, q);
    var biz = /\bbusiness|own (work|venture|firm|company|setup)|start ?up|self.?employ|vyapar|dhandha|naukri|job or|or job/i.test(qq);
    var q2 = qq + (biz ? '\n\nAPP SCORING FOR BUSINESS VS JOB: ' + (function () { var b = bizJob(p, c, new Date()); return b.quick + ' ' + b.paras.join(' ') + ' ' + b.short; })() : '');
    return ag(p, c, q2, onLive).catch(function (e) {
      if (/limit reached|API key|PERMISSION|invalid/i.test(e.message)) throw e;
      if (aiOrder().length > 1) throw e; /* the other provider was already tried */
      /* second try: non-streaming, light reasoning, same model */
      if (onLive) onLive('thought', 'Retrying with a quicker answer…');
      var keep = DB.settings.gfast; DB.settings.gfast = true;
      return ag(p, c, q2, null).then(function (r) { DB.settings.gfast = keep; return r; }, function (e2) {
        DB.settings.gfast = keep;
        /* third try: a different Flash model */
        var cur = DB.settings.gmodel || GDEFAULT;
        return (DB.settings.gmodels && DB.settings.gmodels.length ? Promise.resolve(DB.settings.gmodels) : gListModels()).then(function (list) {
          var alt = list.filter(function (m) { return m !== cur && /flash/.test(m) && (DB.settings.gbad || []).indexOf(m) < 0 && gRank(m, 'flash') >= 0; }).sort(function (a, b) { return gRank(b, 'flash') - gRank(a, 'flash'); })[0];
          if (!alt) throw e2;
          if (onLive) onLive('thought', 'Trying ' + alt + '…');
          DB.settings.gmodel = alt; DB.settings.gfast = true;
          return ag(p, c, q2, null).then(function (r) { DB.settings.gmodel = cur; DB.settings.gfast = keep; return r; }, function (e3) { DB.settings.gmodel = cur; DB.settings.gfast = keep; throw e3; });
        });
      });
    });
  };
})();

/* ================= AI: two providers, failover, rate limits, health log ================= */
var CMODELS = [['claude-sonnet-5-5', 'Claude Sonnet 5.5 (recommended)'], ['claude-opus-5-5', 'Claude Opus 5.5 (best, costlier)'], ['claude-haiku-4-5-20251001', 'Claude Haiku 4.5 (fastest, cheapest)']];
function hasAI() { return !!(DB.settings.gkey || DB.settings.ckey); }
function aiLog(x) { x.t = Date.now(); DB.ailog = (DB.ailog || []).concat([x]).slice(-30); try { save(); } catch (e) { } }
function claudeBody(body) {
  var b = JSON.parse(body), sys = b.system_instruction ? b.system_instruction.parts.map(function (p) { return p.text; }).join('\n') : '', msgs = [];
  (b.contents || []).forEach(function (c) { var role = c.role === 'model' ? 'assistant' : 'user', t = c.parts.map(function (p) { return p.text || ''; }).join('\n'); if (msgs.length && msgs[msgs.length - 1].role === role) msgs[msgs.length - 1].content += '\n\n' + t; else msgs.push({ role: role, content: t }); });
  if (msgs.length && msgs[0].role !== 'user') msgs.unshift({ role: 'user', content: '(conversation start)' });
  var gc = b.generationConfig || {}, json = gc.responseMimeType === 'application/json';
  return { model: DB.settings.cmodel || CMODELS[0][0], max_tokens: json ? 8000 : 6000, system: sys + (json ? '\nReturn ONLY valid JSON, no other text.' : ''), messages: msgs };
}
function claudeCall(body) {
  var cb = claudeBody(body), on = G_ON, H = { 'content-type': 'application/json', 'x-api-key': DB.settings.ckey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' };
  function shape(txt, stop) { return { candidates: [{ content: { parts: [{ text: txt }] }, finishReason: stop || 'STOP' }] }; }
  function err(st, t) { var d; try { d = JSON.parse(t); } catch (e) { d = {}; } var m = (d.error && d.error.message) || ('HTTP ' + st); var e = new Error(st === 401 ? 'Claude key is not valid' : /credit balance/i.test(m) ? 'Claude account has no credit left. Add credit at console.anthropic.com' : st === 429 ? 'Claude rate limit reached, try again in a minute' : st === 529 || st === 503 ? 'Claude is busy right now' : 'Claude: ' + m.slice(0, 160)); e.status = st; return e; }
  if (!on) return http('POST', 'https://api.anthropic.com/v1/messages', H, JSON.stringify(cb)).then(function (r) {
    if (r.status !== 200) throw err(r.status, r.text);
    var d = JSON.parse(r.text); return shape((d.content || []).filter(function (x) { return x.type === 'text'; }).map(function (x) { return x.text; }).join(''), d.stop_reason);
  });
  cb.stream = true; var acc = '', stop = '', last = Date.now(), dead = false, wd;
  var slow = new Promise(function (res, rej) { wd = setInterval(function () { if (Date.now() - last > 90000) { dead = true; clearInterval(wd); var e = new Error('Claude is taking too long'); e.slow = true; rej(e); } }, 1000); });
  var main = httpStream('https://api.anthropic.com/v1/messages', H, JSON.stringify(cb), function (data) {
    if (dead) return; var j; try { j = JSON.parse(data); } catch (e) { return; } last = Date.now();
    if (j.type === 'content_block_delta' && j.delta && j.delta.type === 'text_delta') { acc += j.delta.text; on('text', acc); }
    else if (j.type === 'message_delta' && j.delta) stop = j.delta.stop_reason || stop;
    else if (j.type === 'error') stop = 'error: ' + (j.error && j.error.message);
  }).then(function (r) { clearInterval(wd); if (r.status !== 200) throw err(r.status, r.text); if (!acc) throw new Error(/^error/.test(stop) ? 'Claude ' + stop : 'Claude sent an empty answer'); return shape(acc, stop); }, function (e) { clearInterval(wd); throw e; });
  return Promise.race([main, slow]);
}
/* limiter: questions first; background jobs (translations, briefs) never crowd out a question */
var AIQ = { fg: 0, cool: 0, lastG: 0 };
function aiWaitTurn(bg) {
  return new Promise(function (res, rej) {
    var t0 = Date.now();
    (function tick() {
      if (bg && Date.now() < AIQ.cool) return rej(new Error('AI is cooling down after a rate limit; using saved text for now'));
      if (bg && AIQ.fg > 0) { if (Date.now() - t0 > 120000) return rej(new Error('busy')); return setTimeout(tick, 1500); }
      var gap = Date.now() - AIQ.lastG; if (gap < (bg ? 4000 : 1200)) return setTimeout(tick, (bg ? 4000 : 1200) - gap);
      AIQ.lastG = Date.now(); res();
    })();
  });
}
var gGen0 = gGenerate;
function aiOrder() { var pr = DB.settings.aiProv || (DB.settings.gkey ? 'gemini' : 'claude'), o = [pr, pr === 'gemini' ? 'claude' : 'gemini']; return o.filter(function (x) { return x === 'gemini' ? DB.settings.gkey : DB.settings.ckey; }); }
gGenerate = function (body, depth) {
  if (arguments.length > 1) return gGen0(body, depth);
  var bg = !G_ON && /You (translate|rewrite) the text|DAILY BRIEF/.test(body), order = aiOrder();
  if (!order.length) return Promise.reject(new Error('Add a Gemini or Claude key in Settings'));
  if (!bg) AIQ.fg++;
  function done(x) { if (!bg) AIQ.fg = Math.max(0, AIQ.fg - 1); return x; }
  function tryP(i, firstErr) {
    if (i >= order.length) return Promise.reject(firstErr);
    var pv = order[i], t0 = Date.now(), model = pv === 'gemini' ? (DB.settings.gmodel || GDEFAULT) : (DB.settings.cmodel || CMODELS[0][0]);
    if (i > 0 && G_ON) G_ON('thought', (order[0] === 'gemini' ? 'Gemini' : 'Claude') + ' failed, asking ' + (pv === 'gemini' ? 'Gemini' : 'Claude') + '…');
    return aiWaitTurn(bg).then(function () { return pv === 'gemini' ? gGen0(body) : claudeCall(body); }).then(function (d) {
      aiLog({ p: pv, m: pv === 'gemini' ? (DB.settings.gmodel || GDEFAULT) : model, ok: 1, ms: Date.now() - t0, k: bg ? 'bg' : 'ask', n: body.length });
      if (pv === 'gemini') DB.gfail = 0;
      if (i > 0 && !bg) toast('Answered by ' + (pv === 'gemini' ? 'Gemini' : 'Claude'), 2500);
      return d;
    }, function (e) {
      aiLog({ p: pv, m: model, ok: 0, ms: Date.now() - t0, k: bg ? 'bg' : 'ask', n: body.length, e: String(e.message).slice(0, 160) });
      if (/rate limit|limit reached|429|quota/i.test(e.message)) AIQ.cool = Date.now() + 60000;
      if (pv === 'gemini' && !bg) gReliable(model, e);
      if (bg && /cooling down|busy/.test(e.message)) throw e;
      return tryP(i + 1, firstErr || e);
    });
  }
  return tryP(0).then(done, function (e) { done(); throw e; });
};
/* a Gemini model that keeps failing (slow, busy, empty) is swapped for the best stable Flash */
function gReliable(model, e) {
  if (/key|PERMISSION|invalid/i.test(e.message)) return;
  DB.gfail = (DB.gfail || 0) + 1; if (DB.gfail < 2) return;
  var listP = DB.settings.gmodels && DB.settings.gmodels.length ? Promise.resolve(DB.settings.gmodels) : gListModels();
  listP.then(function (list) {
    var ok = list.filter(function (m) { return /flash/.test(m) && !/lite|image|tts|live|audio/.test(m) && (DB.settings.gbad || []).indexOf(m) < 0 && gRank(m, 'flash') >= 0; });
    var stable = ok.filter(function (m) { return !/preview|exp/.test(m); }), pick = (stable.length ? stable : ok).sort(function (a, b) { return gRank(b, 'flash') - gRank(a, 'flash'); })[0];
    if (pick && pick !== model) { DB.settings.gmodel = pick; DB.settings.gfast = true; DB.gfail = 0; save(); toast(model + ' kept failing. Switched to ' + pick + ' for reliable answers.', 4000); }
  }).catch(function () { });
}
/* the 3-step Gemini retry is not needed when Claude is the backup */

/* ---------- Settings: AI card ---------- */
function aiCard() {
  var s = DB.settings, log = (DB.ailog || []).slice(-8).reverse(), pr = s.aiProv || (s.gkey ? 'gemini' : 'claude');
  var h = '<div class="card"><h3>AI engine</h3><div class="field"><span>ANSWER WITH</span><div class="seg">' + [['gemini', 'Gemini (free)'], ['claude', 'Claude (paid)']].map(function (x) { return '<button class="' + (pr === x[0] ? 'on' : '') + '" data-act="setProv" data-v="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div></div>';
  h += '<label class="field"><span>CLAUDE API KEY (console.anthropic.com)</span><input class="inp mono" type="password" data-in="setCkey" value="' + esc(s.ckey || '') + '" placeholder="sk-ant-..." autocomplete="off"></label>';
  h += '<div class="field"><span>CLAUDE MODEL</span>' + sel('setCmodel', CMODELS, s.cmodel || CMODELS[0][0]) + '</div>';
  h += '<p class="note">' + (s.gkey && s.ckey ? 'Both keys are set: if one fails, the other answers automatically.' : 'Add both keys for automatic backup: when one fails or is busy, the other answers.') + ' Claude is paid: Anthropic bills each question to your account (Haiku is cheapest, Opus costliest).</p>';
  h += '<button class="btn sec wide" data-act="aiTest">Test AI now</button>';
  if (log.length) h += '<div class="lbl" style="margin:12px 0 4px">Last AI calls</div>' + log.map(function (x) { var d = new Date(x.t); return '<div class="ailog ' + (x.ok ? 'ok' : 'bad') + '"><b>' + (x.ok ? '✓' : '✗') + '</b><span>' + (x.p === 'gemini' ? 'Gemini' : 'Claude') + ' · ' + esc(x.m) + ' · ' + (x.k === 'bg' ? 'background' : 'question') + ' · ' + (x.ms / 1000).toFixed(1) + 's<small>' + N.dmy(d) + ' ' + N.hm(d) + (x.e ? ' · ' + esc(x.e) : '') + '</small></span></div>'; }).join('');
  return h + '</div>';
}
INP.setCkey = function (el) { DB.settings.ckey = el.value.trim(); save(); };
CHG.setCmodel = function (el) { DB.settings.cmodel = el.value; save(); };
ACT.setProv = function (el) { DB.settings.aiProv = el.dataset.v; save(); rerender(true); };
ACT.aiTest = function () {
  var order = aiOrder(); if (!order.length) return toast('Add a key first');
  toast('Testing…', 1500);
  var body = JSON.stringify({ contents: [{ role: 'user', parts: [{ text: 'Reply with the single word OK.' }] }], generationConfig: { temperature: 0 } });
  var res = [];
  order.reduce(function (pr, pv) { return pr.then(function () { var t0 = Date.now(); return (pv === 'gemini' ? gGen0(body) : claudeCall(body)).then(function () { res.push((pv === 'gemini' ? 'Gemini' : 'Claude') + ' OK ' + ((Date.now() - t0) / 1000).toFixed(1) + 's'); aiLog({ p: pv, m: pv === 'gemini' ? (DB.settings.gmodel || GDEFAULT) : (DB.settings.cmodel || CMODELS[0][0]), ok: 1, ms: Date.now() - t0, k: 'test', n: 0 }); }, function (e) { res.push((pv === 'gemini' ? 'Gemini' : 'Claude') + ' failed: ' + e.message); aiLog({ p: pv, m: pv === 'gemini' ? (DB.settings.gmodel || GDEFAULT) : (DB.settings.cmodel || CMODELS[0][0]), ok: 0, ms: Date.now() - t0, k: 'test', n: 0, e: String(e.message).slice(0, 160) }); }); }); }, Promise.resolve())
    .then(function () { toast(res.join(' · '), 6000); if (parts()[0] === 'more') rerender(true); });
};

/* ================= AI across the app ================= */
/* 1. "Ask AI" on every reading card */
var AI_ROUTES = /^(report|analysis|milan|p|panchang|dasha|remedies|today)$/;
function addAiButtons() {
  if (!hasAI() || !AI_ROUTES.test(parts()[0] || 'astro') || (parts()[0] === 'medical' && (parts()[1] === 'case' || parts()[1] === 'story'))) return;
  var cards = document.querySelectorAll('#app .card, #app .ocard');
  Array.prototype.forEach.call(cards, function (cd) {
    if (cd.classList.contains('mcread') || cd.classList.contains('ocard') && location.hash.indexOf('medical/case') >= 0 || cd.querySelector('.aiask') || cd.closest('.chat') || cd.querySelector('input,select,textarea') || (cd.innerText || '').length < 80) return;
    var b = document.createElement('button'); b.className = 'aiask'; b.setAttribute('data-act', 'aiCardAsk'); b.setAttribute('data-notr', ''); b.textContent = '✦ Ask AI about this'; cd.appendChild(b);
  });
}
ACT.aiCardAsk = function (el) {
  var cd = el.closest('.card, .ocard'), t = (cd.innerText || '').replace('✦ Ask AI about this', '').replace(/\n{2,}/g, '\n').trim().slice(0, 1800), p = curP(), scr = (($('.top .ttl') || $('.v2top h1') || {}).innerText || '').trim();
  var q = 'Explain this part of the app' + (scr ? ' (' + scr + ')' : '') + ' for ' + (p ? p.name.split(' ')[0] : 'me') + ' in simple words: what it means in real life, what will happen, what to be careful about, and what to do.\n---\n' + t;
  go('ai'); setTimeout(function () { var x = $('#askIn'); if (x) { x.value = q; ACT.askSend(); } }, 150);
};
/* 2. AI daily brief on the Astrology home (one call per person per day, cached) */
function briefKey(p) { var d = new Date(); return p.id + '|' + d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + '|' + (DB.settings.lang || 'en'); }
function briefPrompt(p, c) {
  var now = new Date(), L = { lat: +p.lat, lon: +p.lon }, loc = DB.settings.loc || L, d0 = todayStart(0), pc = J.panchang(d0, loc.lat, loc.lon), off = locOff(), wd = new Date(pc.rise.getTime() + off * 3600e3).getUTCDay(), parts2 = J.dayParts(pc.rise, pc.set, wd), cg = J.choghadiya(pc.rise, pc.set, pc.nextRise, wd);
  var T = J.kundli(now, +p.lat, +p.lon), tr = T.planets.map(function (x) { return PN[x.code] + ' in ' + J.SIGNS[x.sign] + ' (house ' + J.houseFrom(c.k.ascSign, x.sign) + ' from lagna, ' + J.houseFrom(c.k.P.Mo.sign, x.sign) + ' from Moon)'; }).join('; ');
  var good = cg.day.filter(function (x) { return x.q === 'good'; }).map(function (x) { return x.name + ' ' + N.hm(x.start) + '–' + N.hm(x.end); }).join(', ');
  return 'DAILY BRIEF for ' + N.dmy(now) + '\n' + fixedFacts(p, c) + 'TODAY: ' + J.VARAS[wd] + ', tithi ' + pc.tithi.paksha + ' ' + pc.tithi.name + ', nakshatra ' + pc.nak.name + ', Moon in ' + J.SIGNS[pc.moonSign] + '. Rahu Kaal ' + N.hm(parts2.rahu.start) + '–' + N.hm(parts2.rahu.end) + '. Good choghadiya: ' + good + '.\nTRANSITS NOW: ' + tr + '\n\nWrite today\'s brief for ' + p.name.split(' ')[0] + ' (age ' + age(p, now) + '). Exactly these 5 lines, each starting with the label, each one short sentence, plain words, no jargon:\nMood: …\nWork: …\nMoney & family: …\nBe careful: …\nBest time & upay: … (one good time window today and one simple remedy for today)';
}
function briefCard(p) {
  var B = DB.aiBrief || {}, key = briefKey(p), txt = B[key];
  var h = '<div class="card aibrief"><div class="kgh"><h3>✦ Today for ' + esc(p.name.split(' ')[0]) + '</h3><span class="sm">AI</span></div>';
  if (txt) h += txt.split('\n').filter(function (l) { return l.trim(); }).slice(0, 6).map(function (l) { var m = l.match(/^\**\s*([^:*]{2,24})\**\s*:\s*(.*)$/); return m ? '<div class="abl"><b>' + esc(m[1]) + '</b><span>' + esc(m[2].replace(/\*\*/g, '')) + '</span></div>' : '<p>' + esc(l.replace(/\*\*/g, '')) + '</p>'; }).join('');
  else h += '<p class="mut" style="font-size:13px" id="briefWait">' + (U.briefErr ? esc(U.briefErr) + ' <button class="btn sec sm" data-act="briefGo">Try again</button>' : 'Writing today\'s brief…') + '</p>';
  return h + '</div>';
}
ACT.briefGo = function () { U.briefErr = null; U.briefBusy = null; rerender(true); };
function briefLoad(p) {
  var key = briefKey(p); if ((DB.aiBrief || {})[key] || U.briefBusy === key || U.briefErr) return; U.briefBusy = key;
  var c = calcP(p), body = JSON.stringify({ system_instruction: { parts: [{ text: geminiFormat(p.name.split(' ')[0], 'predict', relOf(p), 'the astrologer').split('\n').filter(function (l) { return /LANGUAGE/.test(l); }).join('\n') + '\nYou are a Vedic astrologer (Parashari, Lahiri). Use only the facts given.' }] }, contents: [{ role: 'user', parts: [{ text: briefPrompt(p, c) }] }], generationConfig: { temperature: 0.4, thinkingConfig: { thinkingBudget: 512 } } });
  gGenerate(body).then(function (d) {
    var t = gText(d).trim(); DB.aiBrief = DB.aiBrief || {}; var ks = Object.keys(DB.aiBrief); if (ks.length > 20) ks.slice(0, ks.length - 20).forEach(function (k) { delete DB.aiBrief[k]; });
    DB.aiBrief[key] = t; save(); U.briefBusy = null; if ((parts()[0] || 'astro') === 'astro') rerender(true);
  }).catch(function (e) {
    var b = JSON.parse(body); delete b.generationConfig.thinkingConfig;
    return gGenerate(JSON.stringify(b)).then(function (d) { DB.aiBrief = DB.aiBrief || {}; DB.aiBrief[key] = gText(d).trim(); save(); U.briefBusy = null; if ((parts()[0] || 'astro') === 'astro') rerender(true); });
  }).catch(function (e) { U.briefBusy = null; U.briefErr = 'Could not write the brief: ' + e.message; if ((parts()[0] || 'astro') === 'astro') rerender(true); });
}
(function () {
  var a1 = AstroV2; AstroV2 = function (id) {
    var h = a1(id), p = curP(); if (!p || !hasAI() || id === 'ALL') return h;
    var i = h.indexOf('<div class="kpair">'); if (i < 0) return h;
    U.after = (U.after || []).concat([function () { briefLoad(p); }]);
    return h.slice(0, i) + briefCard(p) + h.slice(i);
  };
  var r1 = render; render = function () { r1(); try { addAiButtons(); } catch (e) { } };
})();
