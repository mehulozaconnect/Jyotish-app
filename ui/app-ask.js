/* Trikaal app: Ask (offline reasoning engine, optional Claude for free-form questions) */
var PWORDS = { Su: ['sun', 'surya', 'ravi'], Mo: ['moon', 'chandra', 'chandrama'], Ma: ['mars', 'mangal', 'kuja'], Me: ['mercury', 'budh', 'budha'], Ju: ['jupiter', 'guru', 'brihaspati'], Ve: ['venus', 'shukra'], Sa: ['saturn', 'shani', 'sani'], Ra: ['rahu'], Ke: ['ketu'] };
var EWORDS = [['accident', /accident|injur|fractur|hurt|fell|fall\b|crash|bike|road/], ['illness', /ill\b|illness|sick|surgery|operation|hospital|disease|fever|infection|admitted|diagnos/], ['jobloss', /lost (my |his |her |the )?job|fired|terminated|laid off|layoff|job loss|resign/], ['jobgain', /new job|got (a |the )?job|promot|hired|joined/],
  ['moneyloss', /lost money|money loss|fraud|cheat|scam|loss in|financial loss|theft|stolen/], ['moneygain', /profit|windfall|money gain|got money|bonus|lottery/], ['separation', /divorce|separat|break ?up/], ['marriage', /married|wedding|engag/], ['child', /baby|child ?birth|born|pregnan|delivery/],
  ['property', /bought (a )?(house|flat|home|property|land)|property purchase|registr/], ['travel', /abroad|visa|relocat|moved to|went to|foreign/], ['legal', /court|case|legal|police|lawsuit|notice/]];
var KPWORDS = [['job', /job|career|promot|work|employ|salary hike|appraisal/], ['business', /business|deal|contract|client|startup|shop/], ['money', /money|wealth|income|finance|financ|rich|profit|loan/], ['marriage', /marr|spouse|wife|husband|partner|relationship|love|wedding/], ['child', /child|kid|baby|son|daughter|pregnan/],
  ['property', /property|house|flat|home|land|plot/], ['vehicle', /vehicle|car|bike/], ['foreign', /foreign|abroad|visa|settle|overseas|us\b|usa|uk\b|canada|australia/], ['study', /exam|study|education|degree|college|admission|course/], ['health', /recover|cure|heal|health|disease|illness/], ['legal', /court|case|legal|dispute/]];
var MON3 = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
function parseDateQ(q) {
  var m, y, mo, d, tm = q.match(/(\d{1,2})[:.](\d{2})\s*(am|pm)?/i), hh = 12, mm = 0;
  if (tm && !/\d{1,2}[:.]\d{2}[:.]\d{2,4}/.test(q)) { hh = +tm[1]; mm = +tm[2]; if (tm[3] && tm[3].toLowerCase() === 'pm' && hh < 12) hh += 12; if (tm[3] && tm[3].toLowerCase() === 'am' && hh === 12) hh = 0; }
  if ((m = q.match(/(\d{4})-(\d{1,2})-(\d{1,2})/))) { y = +m[1]; mo = +m[2]; d = +m[3]; }
  else if ((m = q.match(/\b(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})\b/))) { d = +m[1]; mo = +m[2]; y = +m[3]; if (y < 100) y += y > 40 ? 1900 : 2000; }
  else if ((m = q.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]{3,9})\.?,?\s*(\d{4})?/i)) && MON3.indexOf(m[2].slice(0, 3).toLowerCase()) >= 0) { d = +m[1]; mo = MON3.indexOf(m[2].slice(0, 3).toLowerCase()) + 1; y = m[3] ? +m[3] : null; }
  else if ((m = q.match(/\b([a-z]{3,9})\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s*(\d{4})?/i)) && MON3.indexOf(m[1].slice(0, 3).toLowerCase()) >= 0) { mo = MON3.indexOf(m[1].slice(0, 3).toLowerCase()) + 1; d = +m[2]; y = m[3] ? +m[3] : null; }
  else if (/yesterday/i.test(q)) { var t = new Date(Date.now() + locOff() * 3600e3 - 864e5); y = t.getUTCFullYear(); mo = t.getUTCMonth() + 1; d = t.getUTCDate(); }
  else if (/\btoday\b/i.test(q) && /happen|met|had|got|accident|lost/i.test(q)) { var t2 = new Date(Date.now() + locOff() * 3600e3); y = t2.getUTCFullYear(); mo = t2.getUTCMonth() + 1; d = t2.getUTCDate(); }
  else return null;
  if (!y) { var n = new Date(Date.now() + locOff() * 3600e3); y = n.getUTCFullYear(); if (Date.UTC(y, mo - 1, d) > Date.now()) y--; }
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  return { date: y + '-' + (mo < 10 ? '0' : '') + mo + '-' + (d < 10 ? '0' : '') + d, time: (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm };
}
function findWord(q, list) { for (var i = 0; i < list.length; i++) if (list[i][1].test(q)) return list[i][0]; return null; }
function findPlanet(q) { var out = null; Object.keys(PWORDS).forEach(function (k) { PWORDS[k].forEach(function (w) { if (new RegExp('\\b' + w + '\\b', 'i').test(q)) out = out || k; }); }); return out; }
function li(items) { return '<ul>' + items.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>'; }
function src(t) { return '<div class="src">' + esc(t) + '</div>'; }

function plainAns(o) {
  var vcol = { good: 'var(--good)', bad: 'var(--bad)', mixed: 'var(--warn)' }[o.verdict] || 'var(--indigo)';
  var h = '<div class="pa" style="border-left:4px solid ' + vcol + '"><p class="pah">' + esc(o.headline) + '</p>' + (o.meaning ? '<p>' + esc(o.meaning) + '</p>' : '') + '</div>';
  (o.rows || []).forEach(function (r) { var ls = (r[1] || []).filter(Boolean); if (!ls.length) return; h += '<h4 class="' + (r[2] || '') + '">' + esc(r[0]) + '</h4>' + li(ls.map(function (l) { return esc(cap(l)); })); });
  if (o.tech) h += '<details><summary>Astrology behind this</summary>' + o.tech + '</details>';
  return h;
}
function answerLocal(p, c, q) {
  var ql = q.toLowerCase(), now = new Date(), k = c.k, pr = p.gender === 'F' ? 'her' : 'his', he = p.gender === 'F' ? 'she' : 'he';
  var dt = parseDateQ(q), ev = findWord(ql, EWORDS), pl = findPlanet(ql), kpm = findWord(ql, KPWORDS);
  /* 1. why did an event happen */
  if (ev && (dt || /why|reason|cause/.test(ql))) {
    if (!dt) return { html: '<p>Tell me the date (and time if known) of the ' + esc(KB.EVENTS[ev].l.toLowerCase()) + ', for example “why did this accident happen on 15 Jul 2026 at 11:30”. I will tell you the cause, the planet behind it and when things get better.</p>' };
    var at = evDate(p, dt.date, dt.time), E = N.eventAnalysis(c, ev, at), se = S.event(c, E, now);
    U.lastEvent = { p: p.id, E: E, ev: { type: ev, date: dt.date, time: dt.time } };
    p.events = p.events || []; if (!p.events.some(function (x) { return x.type === ev && x.date === dt.date; })) { p.events.push({ type: ev, date: dt.date, time: dt.time }); save(); }
    var tech = li(E.ranked.slice(0, 3).map(function (r) { return '<b>' + PN[r.code] + '</b>: ' + esc(r.why.join(' ')); })) + li(E.kp.map(function (x) { return nth(x.house) + ' cusp sub lord ' + PN[x.csl] + ' signifies ' + x.sig.join(', '); }));
    return { html: plainAns({ verdict: E.E.good ? 'good' : 'bad', headline: se.headline, rows: [['Why', se.reasons], ['Also', se.support.map(function (s) { return PN[s.code] + ': ' + s.text.replace(/^It /, ''); })], [E.E.heal ? 'When it gets better' : 'What follows', se.when, 'when'], ['What to do', se.do, 'do'], ['Avoid', se.avoid, 'avoid']], tech: tech }), text: se.headline + ' ' + se.when.join(' ') };
  }
  /* 2. when will it get better */
  if (/when|by when|kab/.test(ql) && /cure|recover|heal|better|normal|improve|end|over|relief|theek/.test(ql)) {
    var le = U.lastEvent && U.lastEvent.p === p.id ? U.lastEvent : null;
    if (!le && p.events && p.events.length) { var x = p.events[p.events.length - 1]; le = { E: N.eventAnalysis(c, x.type, evDate(p, x.date, x.time)), ev: x }; }
    if (le) {
      var se2 = S.event(c, le.E, now), rec = le.E.recovery || [];
      var head = rec.length ? 'Clear improvement from ' + N.dmy(rec[0].start) + (rec[0].start < now ? ' (that period has already begun).' : '.') : 'No clear recovery period shows in the next 18 months; keep treatment and remedies going.';
      return { html: plainAns({ verdict: rec.length ? 'good' : 'bad', headline: head, meaning: 'For the ' + KB.EVENTS[le.ev.type].l.toLowerCase() + ' of ' + N.dmy(evDate(p, le.ev.date, le.ev.time)) + '.', rows: [['Timeline', se2.when, 'when'], ['What to do', se2.do, 'do']], tech: li(le.E.outlook.map(function (o) { return N.dmy(o.t) + ': ' + esc(o.text); })) }), text: head };
    }
    var sh0 = S.health(c, now);
    return { html: plainAns({ verdict: sh0.verdict, headline: 'No event is saved yet. Here is when ' + pr + ' health pressure eases:', rows: [['Better', sh0.better, 'when'], ['Now', sh0.now, 'when']] }) + '<p>To get exact recovery dates, ask “why did ' + he + ' fall ill on 31 Dec 2025” (use the real date).</p>' };
  }
  /* 3. which planet */
  if (/which planet|kaun sa graha|what planet|which graha/.test(ql)) {
    var le2 = U.lastEvent && U.lastEvent.p === p.id ? U.lastEvent : null;
    if (le2 && le2.E.main) { var se3 = S.event(c, le2.E, now); return { html: plainAns({ verdict: 'bad', headline: PN[le2.E.main.code] + ' is the main planet behind the ' + KB.EVENTS[le2.ev.type].l.toLowerCase() + '.', rows: [['Why', se3.reasons], ['Also involved', se3.support.map(function (s) { return PN[s.code] + ': ' + s.text.replace(/^It /, ''); })], ['What to do', se3.do, 'do']] }) }; }
    var ch = J.dashaChain(c.maha, now, 2);
    return { html: plainAns({ verdict: 'neutral', headline: 'Right now ' + PN[ch[0].lord] + ' and ' + PN[ch[1].lord] + ' run ' + pr + ' life.', rows: [['Main period', [PN[ch[0].lord] + ' until ' + N.dmy(ch[0].end) + ': ' + S.planet(c, ch[0].lord, now).headline]], ['Sub-period', [PN[ch[1].lord] + ' until ' + N.dmy(ch[1].end) + ': ' + S.planet(c, ch[1].lord, now).headline]]] }) };
  }
  /* 4. muhurat */
  if (/muhurat|muhurt|auspicious|shubh|good (date|day|time) (to|for)/.test(ql)) {
    var pur = /car|vehicle|bike/.test(ql) ? 'vehicle' : /house|flat|property|griha|pravesh/.test(ql) ? 'property' : /marr|wedding|vivah/.test(ql) ? 'marriage' : /gold|jewel/.test(ql) ? 'gold' : /travel|journey|trip/.test(ql) ? 'travel' : /treat|surgery|operation/.test(ql) ? 'treatment' : /agree|sign|contract/.test(ql) ? 'agreement' : 'business';
    var L = DB.settings.loc, list = N.muhurat(pur, todayStart(0), 60, L.lat, L.lon, locOff(), c).slice(0, 6);
    if (!list.length) return { html: plainAns({ verdict: 'bad', headline: 'No clean date for ' + KB.MUHURAT[pur].l.toLowerCase() + ' in the next 60 days.', rows: [['What to do', ['Check Today › Muhurat with a longer window.'], 'do']] }) };
    var b = list[0];
    return { html: plainAns({ verdict: 'good', headline: 'Best date: ' + J.VARAS[b.wd] + ' ' + N.dmy(b.rise) + ', ' + b.windows[0].name + ' ' + N.hm(b.windows[0].start) + '–' + N.hm(b.windows[0].end) + '.', meaning: KB.MUHURAT[pur].l + ', checked against ' + p.name + '’s stars.', rows: [['Other good dates', list.slice(1).map(function (m) { return J.VARAS[m.wd] + ' ' + N.dmy(m.rise) + ': ' + m.windows.slice(0, 2).map(function (w) { return N.hm(w.start) + '–' + N.hm(w.end); }).join(', ') + (m.special.length ? ' (' + m.special[0] + ')' : ''); }), 'when'], ['Avoid', ['Rahu Kaal on the day (' + N.hm(b.rahu.start) + '–' + N.hm(b.rahu.end) + ')'], 'avoid']] }) };
  }
  /* 5. remedies */
  if (/remed|upay|gem|stone|ratna|rudraksh|mantra|lal kitab|crystal|daan|donat|fast/.test(ql)) {
    var R = N.remedies(c, now), yes = R.gems.filter(function (g) { return g.kind === 'yes'; }), no = R.gems.filter(function (g) { return g.kind === 'no'; });
    var main = R.plan[0];
    return { html: plainAns({ verdict: 'good', headline: (yes.length ? 'Wear ' + yes[0].gem + '. ' : 'No gemstone is strongly needed. ') + (no.length ? 'Never wear ' + P_list(no.map(function (g) { return g.gem.split(' (')[0]; })) + '.' : ''), meaning: 'Chosen for ' + pr + ' ' + SG[k.ascSign] + ' lagna: helpful planets are strengthened, difficult ones are calmed.',
      rows: [['Daily', R.plan.map(function (x) { return x.mantra[0] + ' (108 times) for ' + PN[x.code]; })], ['Weekly', R.plan.map(function (x) { return 'Donate ' + x.daan[0] + ' on ' + x.daan[1]; }), 'do'], ['Rudraksha', R.rudraksha.map(function (x) { return x.bead + ' (for ' + PN[x.code] + ')'; })], ['Lal Kitab', R.plan.slice(0, 2).map(function (x) { return x.lalkitab; })], ['Crystals', R.crystals.slice(0, 2).map(function (x) { return x.stone; })]],
      tech: li(R.gems.map(function (g) { return (g.kind === 'yes' ? '✓ ' : g.kind === 'no' ? '✕ ' : '! ') + esc(g.gem + ': ' + g.why); })) }) + '<p class="mut" style="font-size:12.5px">No remedy can be guaranteed; these follow classical rules for this lagna.</p>' };
  }
  /* 6. a specific planet */
  if (pl && !kpm && !/today|transit|gochar/.test(ql)) {
    var sp = S.planet(c, pl, now);
    return { html: plainAns({ verdict: sp.verdict, headline: sp.headline, meaning: sp.meaning, rows: sp.lines.map(function (l) { return [l[0], [l[1]]]; }).concat([['What to do', sp.do, 'do'], ['Avoid', sp.avoid, 'avoid']]), tech: li(N.planet(c, pl, now).map(function (i) { return '<b>' + esc(i.t) + '</b>: ' + esc(i.why.join(' ')); })) }), text: sp.headline };
  }
  /* 7. today */
  if (/today|my day|aaj|tomorrow|kal\b/.test(ql)) {
    var L2 = DB.settings.loc, off = /tomorrow|kal\b/.test(ql) ? 1 : 0, D = N.myDay(c, todayStart(off), L2.lat, L2.lon, now);
    return { html: plainAns({ verdict: D.score.v === 'push' ? 'good' : D.score.v === 'backend' ? 'bad' : 'mixed', headline: D.word + (off ? ' tomorrow.' : ' today.'), meaning: D.guide, rows: [['Best time', D.best.slice(0, 3).map(function (b) { return N.hm(b.start) + '–' + N.hm(b.end) + ' (' + KB.HORA_USE[b.lord] + ')'; }), 'when'], ['Avoid', ['Starting anything in Rahu Kaal ' + N.hm(D.parts.rahu.start) + '–' + N.hm(D.parts.rahu.end)], 'avoid']], tech: li(D.why.map(function (w) { return esc(w.label + ': ' + w.why); })) }) };
  }
  /* 8. transit */
  if (/transit|gochar|this month|next month|month/.test(ql)) {
    var offm = /next month/.test(ql) ? 1 : 0, ms = monthStart(offm), tm = N.transitMonth(c, ms.y, ms.m, now), sm = S.month(c, tm);
    return { html: plainAns({ verdict: sm.verdict, headline: MONS[ms.m] + ' ' + ms.y + ': ' + sm.word.toLowerCase() + ' for ' + (p.id === DB.settings.meId ? 'you' : p.name) + '.', meaning: sm.meaning, rows: [['Do', sm.do, 'do'], ['Avoid', sm.avoid, 'avoid'], ['Each planet', sm.rows.map(function (r) { return r.title + ': ' + r.text; })], ['Key dates', sm.dates.map(function (d) { return N.dmY(d.t) + ': ' + d.text; }), 'when']] }), text: sm.word + '. ' + sm.meaning };
  }
  /* 9. sade sati */
  if (/sade ?sati|sadesati|dhaiya|panoti|shani/.test(ql)) {
    var ss = N.sadeSati(c, now);
    return { html: plainAns({ verdict: ss.q === 'bad' ? 'bad' : 'good', headline: ss.q === 'bad' ? 'Yes, ' + he + ' is under Saturn’s pressure (' + ss.label + ') until ' + N.dmy(ss.until) + '.' : 'No Sade Sati or Dhaiya now.', rows: ss.q === 'bad' ? [['What it means', ['Tiredness, delays and extra responsibility; results come only with patience.']], ['What to do', ['Saturdays: Hanuman Chalisa or ' + KB.MANTRA.Sa[0] + '; donate black sesame or mustard oil; help elderly people or workers.'], 'do']] : [] }) };
  }
  /* 10. KP style "will / when" questions */
  if (kpm && /will|when|kab|chance|possible|get|promot|marr|buy|go /.test(ql) && !/about|tell me|reading/.test(ql)) {
    var L3 = DB.settings.loc, rp = J.rulingPlanets(now, L3.lat, L3.lon, locOff(), 'kp'), jm = N.judgeMatter(c.sig, kpm, kpDasha(c), now, 5, rp.set), wins = S.kpWindows(c.sig, jm.m, kpDasha(c), now, kpm === 'health' ? 12 : 36, kpm === 'health' ? 4 : 3, rp.set), sk = S.kp(jm, kpm, wins, now);
    return { html: plainAns({ verdict: sk.verdict, headline: sk.headline, meaning: sk.meaning, rows: [['When', sk.when, 'when'], ['What to do', sk.do, 'do']], tech: li([nth(jm.main.cusp) + ' cusp sub lord ' + PN[jm.main.csl] + ': ' + N.uniq(jm.main.st.planet.houses.concat(jm.main.st.star.houses)).join(', ') + ' (favourable ' + jm.m.fav.join(', ') + '; against ' + jm.m.neg.join(', ') + ')']) }), text: sk.headline + ' ' + sk.when.join(' ') };
  }
  /* 11. section questions */
  var secId = /health|body|disease|swasthya/.test(ql) ? 'health' : /career|job|work|business|profession/.test(ql) ? 'career' : /money|wealth|finance|income|dhan/.test(ql) ? 'money' : /marr|spouse|wife|husband|relationship|partner/.test(ql) ? 'marriage' : /child|kid|education|study/.test(ql) ? 'children' : /nature|personality|character|swabhav/.test(ql) ? 'personality' : /current|period|dasha|now/.test(ql) ? 'now' : /future|next|coming|years/.test(ql) ? 'future' : null;
  if (secId === 'health') {
    var sh = S.health(c, now);
    return { html: plainAns({ verdict: sh.verdict, headline: sh.headline, meaning: sh.meaning, rows: [['Right now', sh.now, 'when'], ['Gets better', sh.better, 'when'], ['What to do', sh.do, 'do'], ['Avoid', sh.avoid, 'avoid']], tech: li(sh.H.zones.filter(function (z) { return z.level !== 'good'; }).map(function (z) { return 'House ' + z.house + ': ' + esc(z.why.join(' ')); })) }), text: sh.headline + ' ' + sh.meaning };
  }
  var sum = S.report(c, now);
  if (secId) {
    var map = { career: 'Career', money: 'Money', marriage: 'Marriage', personality: 'Nature', now: 'Right now', future: 'Next change', children: null }, row = sum.filter(function (r) { return r.k === map[secId]; })[0];
    var s = N.report(c, now).filter(function (x) { return x.id === secId; })[0];
    var techS = s.items ? li(s.items.map(function (i) { return (i.k === 'pro' ? '+ ' : i.k === 'con' ? '− ' : '') + '<b>' + esc(i.t) + '</b>: ' + esc(i.why.join(' ')); })) : li((s.timeline || []).map(function (t) { return N.dmy(t.t) + ': ' + esc(t.text); }));
    var good = (s.items || []).filter(function (i) { return i.k === 'pro'; }).map(function (i) { return i.t; }), bad = (s.items || []).filter(function (i) { return i.k === 'con'; }).map(function (i) { return i.t; });
    return { html: plainAns({ verdict: row ? row.v : 'mixed', headline: row ? row.t : s.title, rows: [['Plus points', good.slice(0, 3), 'do'], ['Watch', bad.slice(0, 3), 'avoid'], ['Coming up', secId === 'future' ? (s.timeline || []).slice(0, 5).map(function (t) { return N.dmy(t.t) + ': ' + t.text; }) : [], 'when']], tech: techS }) };
  }
  if (/yoga|dosha|manglik|mangal dosh|kaal ?sarp|kemadruma/.test(ql)) return { html: li(c.yogas.map(function (y) { return '<b>' + esc(y.name) + '</b>: ' + esc(y.why); })) };
  if (/lagna|ascendant|rashi|moon sign|nakshatra|basic|details/.test(ql)) return { html: li(['Lagna <b>' + SG[k.ascSign] + ' ' + k.ascDegs + '</b> (' + k.ascNak.name + ' ' + k.ascNak.pada + ')', 'Moon <b>' + SG[k.P.Mo.sign] + ' ' + k.P.Mo.degs + '</b>, ' + k.P.Mo.nak.name + ' pada ' + k.P.Mo.nak.pada, 'Sun ' + SG[k.P.Su.sign] + ' ' + k.P.Su.degs, 'Ayanamsa ' + esc(ayanShort()) + ' ' + J.dms(k.ayanamsa, true)]) };
  /* 12. whole reading */
  if (/about|tell me|reading|overall|pros|cons|who is|life|everything|kundli|horoscope|summar/.test(ql) || q.length < 4) {
    return { html: '<p class="pah">' + esc(p.name) + ' in simple words</p>' + li(sum.map(function (r) { return '<b>' + esc(r.k) + ':</b> ' + esc(r.t); })) + '<p class="mut" style="font-size:12.5px">Open the Report tab for every point with its reason.</p>', text: sum.map(function (r) { return r.k + ': ' + r.t; }).join(' ') };
  }
  return null;
}
function P_list(a) { return PLAIN.list(a); }
var HELP = '<p>I answer from ' + 'the chart with the logic shown. Try:</p><ul><li>Tell me about this person</li><li>How is ' + 'the health? When will it improve?</li><li>Why did he have an accident on 15 Jul 2026 at 11:30?</li><li>By when will he recover? Which planet did this?</li><li>When will I get a promotion?</li><li>How is this month’s transit for me?</li><li>Saturn in my chart</li><li>Which gemstone and rudraksha suit me?</li><li>Good muhurat to buy a car</li></ul>';

/* ---------- Claude ---------- */
function dossier(p, c) {
  var k = c.k, now = new Date(), L = [], P = k.P;
  L.push('PERSON: ' + p.name + ' (' + (p.gender === 'F' ? 'female' : 'male') + '), born ' + p.date + ' ' + p.time + ' local (' + fmtOff(+p.tz) + ') at ' + (p.place || '') + ' lat ' + p.lat + ' lon ' + p.lon + '.' + (p.notes ? ' Notes: ' + p.notes : ''));
  L.push('TODAY: ' + N.dmyt(now) + ' (' + fmtOff(locOff()) + '). Ayanamsa ' + C.AYAN_INFO[k.ayan].name + ' ' + J.dms(k.ayanamsa, true) + '. Nodes: ' + C.getNode() + '. Whole-sign houses for Parashari, Placidus for KP/bhava.');
  L.push('LAGNA: ' + SG[k.ascSign] + ' ' + k.ascDegs + ', ' + k.ascNak.name + ' pada ' + k.ascNak.pada + ', KP sign/star/sub ' + k.ascKP.sign + '/' + k.ascKP.star + '/' + k.ascKP.sub);
  L.push('PLANETS (sign deg | house | bhava | nakshatra-pada | star lord | sub lord | dignity | D9 | D10):');
  k.planets.forEach(function (x) { L.push('  ' + x.name + ': ' + SG[x.sign] + ' ' + x.degs + (x.retro && x.code !== 'Ra' && x.code !== 'Ke' ? ' R' : '') + (x.combust ? ' combust' : '') + ' | H' + x.house + ' | B' + x.bhava + ' | ' + x.nak.name + '-' + x.nak.pada + ' | ' + x.nak.lord + ' | ' + x.kp.sub + ' | ' + x.dignity + ' | ' + SG3[J.varga(x.lon, 9).sign] + ' | ' + SG3[J.varga(x.lon, 10).sign]); });
  L.push('D9 lagna ' + SG[J.varga(k.asc, 9).sign] + ', D10 lagna ' + SG[J.varga(k.asc, 10).sign] + '.');
  L.push('FUNCTIONAL NATURE for ' + SG[k.ascSign] + ' lagna: ' + J.P7.map(function (x) { return PN[x] + ' ' + c.func[x].kind + ' (rules ' + c.func[x].houses.join('&') + ')'; }).join('; ') + '. Badhaka ' + c.func.badhaka.house + 'th lord ' + PN[c.func.badhaka.lord] + '.');
  L.push('YOGAS: ' + c.yogas.map(function (y) { return y.name + ' [' + y.why + ']'; }).join(' '));
  L.push('SAV by house 1-12: ' + [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(function (h) { return N.savOf(c, h); }).join(', ') + '. BAV in own sign: ' + J.P7.map(function (x) { return x + ' ' + c.av.bav[x][P[x].sign]; }).join(', '));
  var ch = J.dashaChain(c.maha, now, 5); L.push('VIMSHOTTARI NOW: ' + ch.map(function (x, i) { return LVL[i] + ' ' + PN[x.lord] + ' ' + N.dmy(x.start) + '–' + N.dmy(x.end); }).join(' > '));
  L.push('MAHADASHAS: ' + c.maha.slice(0, 10).map(function (x) { return PN[x.lord] + ' ' + N.dmy(x.start) + '–' + N.dmy(x.end); }).join('; '));
  if (ch[0]) L.push('ANTARDASHAS IN CURRENT MD: ' + J.subPeriods(ch[0]).map(function (x) { return PN[x.lord] + ' ' + N.dmy(x.start) + '–' + N.dmy(x.end); }).join('; '));
  if (ch[1]) L.push('PRATYANTARS IN CURRENT AD: ' + J.subPeriods(ch[1]).map(function (x) { return PN[x.lord] + ' ' + N.dmy(x.start) + '–' + N.dmy(x.end); }).join('; '));
  var tr = N.transitAt(c, now); L.push('TRANSITS NOW: ' + tr.map(function (x) { return PN[x.code] + ' ' + SG[x.sign] + ' ' + J.dm(x.lon) + (x.retro && x.code !== 'Ra' && x.code !== 'Ke' ? 'R' : '') + ' H' + x.h + ' from lagna, ' + x.m + ' from Moon, ' + x.verdict + (x.bav != null ? ', BAV ' + x.bav : '') + (x.vedha ? ', vedha' : ''); }).join('; '));
  L.push('SADE SATI: ' + N.sadeSati(c, now).label + '.');
  L.push('UPCOMING INGRESSES (2y): ' + J.events(now, new Date(now.getTime() + 730 * 864e5), ['Ju', 'Sa', 'Ra']).filter(function (e) { return e.type === 'ingress'; }).map(function (e) { return PN[e.code] + '→' + SG[e.sign] + ' ' + N.dmy(e.t); }).join(', '));
  L.push('KP CUSPS (sign deg, CSL): ' + c.kp.cusps.map(function (x) { return x.house + ' ' + SG3[x.sign] + ' ' + x.deg + ' ' + x.kp.sub; }).join('; '));
  L.push('KP SIGNIFICATORS (planet: houses): ' + J.PC.map(function (x) { return x + ': ' + c.sig.sig[x].join(','); }).join('; '));
  var H = N.healthAnalysis(c, now); L.push('HEALTH: ' + H.overall + '. Sensitive: ' + H.zones.filter(function (z) { return z.level !== 'good'; }).slice(0, 4).map(function (z) { return 'H' + z.house + ' ' + z.body.split(';')[0] + ' (' + z.why.join(' ') + ')'; }).join(' | '));
  if (p.events && p.events.length) L.push('KNOWN EVENTS: ' + p.events.map(function (e) { return KB.EVENTS[e.type].l + ' ' + e.date + ' ' + e.time; }).join('; '));
  return L.join('\n');
}
var SYS = 'You are Trikaal, a careful Vedic astrologer (Parashari and Krishnamurti Paddhati). The user is the app owner, an astrology practitioner asking about a chart. Rules: use ONLY the computed chart data given below; never invent positions, dates or dashas. Always show the logic: name the planets, houses, lordships, dignity, dasha and transit facts behind every claim. Judge results through functional benefics and malefics for the lagna. For timing, use the Vimshottari periods and transit dates provided, and KP cusp sub lords for yes/no questions. Write for a reader who knows no astrology: start with the plain answer in one or two sentences (yes or no, how good or bad, when, and what to do), then give the reasons in everyday words, with technical terms only in brackets. Be direct and specific. Be honest about uncertainty and never promise 100% outcomes. Health: give astrological indications and timing only, and advise seeing a doctor. Reply in the language the user writes in. Keep answers well structured with short headings and bullet points.';
function mdToHtml(t) {
  var lines = esc(t).split('\n'), out = '', inList = false;
  lines.forEach(function (l) {
    var m;
    l = l.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/(^|[^*])\*([^*]+)\*/g, '$1<i>$2</i>');
    if ((m = l.match(/^\s*[-*•]\s+(.*)/)) || (m = l.match(/^\s*\d+[.)]\s+(.*)/))) { if (!inList) { out += '<ul>'; inList = true; } out += '<li>' + m[1] + '</li>'; return; }
    if (inList) { out += '</ul>'; inList = false; }
    if ((m = l.match(/^#{1,4}\s+(.*)/))) out += '<h4>' + m[1] + '</h4>';
    else if (l.trim()) out += '<p>' + l + '</p>';
  });
  return out + (inList ? '</ul>' : '');
}
function askClaude(p, c, q, local) {
  var hist = (DB.chats[p.id] || []).filter(function (m) { return m.text; }).slice(-8).map(function (m) { return { role: m.role === 'me' ? 'user' : 'assistant', content: m.text }; });
  var userMsg = q + (local ? '\n\n[Offline engine findings for this question, already computed from the chart: ' + local + ']' : '');
  if (hist.length && hist[hist.length - 1].role === 'user') hist.pop();
  hist.push({ role: 'user', content: userMsg });
  while (hist.length && hist[0].role !== 'user') hist.shift();
  var body = JSON.stringify({ model: DB.settings.model || 'claude-sonnet-5-5', max_tokens: 2000, system: SYS + '\n\nCHART DATA\n' + dossier(p, c), messages: hist });
  return http('POST', 'https://api.anthropic.com/v1/messages', { 'content-type': 'application/json', 'x-api-key': DB.settings.key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' }, body).then(function (r) {
    var d; try { d = JSON.parse(r.text); } catch (e) { throw new Error('Unexpected reply (' + r.status + ')'); }
    if (r.status !== 200) throw new Error((d.error && d.error.message) || ('HTTP ' + r.status));
    return (d.content || []).filter(function (b) { return b.type === 'text'; }).map(function (b) { return b.text; }).join('\n');
  });
}

/* ---------- Ask screen ---------- */
function AskScreen() {
  var p = person(U.askFor) || person(U.cur) || me();
  var h = '<div class="top">' + LOGO + '<span class="ttl">Ask</span><span class="sp"></span>' + (p ? '<div style="max-width:55%">' + sel('askFor', DB.people.map(function (x) { return [x.id, x.name]; }), p.id) + '</div>' : '') + '</div>';
  if (!p) return h + emptyState('Add a kundli first', 'Ask questions about any saved person.', '<br><button class="btn acc" data-go="edit/new">Add kundli</button>');
  U.askFor = p.id;
  var msgs = DB.chats[p.id] || [], deep = DB.settings.key && DB.settings.deep;
  h += '<div class="sub" style="padding-top:0">' + (deep ? 'Offline engine + Claude (' + esc(DB.settings.model) + ') with the full chart.' : 'Offline engine: answers with the chart logic. Add a Claude API key in More for free-form questions.') + (msgs.length ? ' · <button style="text-decoration:underline;color:var(--mut)" data-act="clearChat">Clear chat</button>' : '') + '</div>';
  var Q = [['Tell me about this person', 1], ['How is the health?', 1], ['When will the career rise?', 1], ['How is this month’s transit?', 1], ['Which gemstone suits?', 1], ['Why did this accident happen on DD Mon YYYY at HH:MM?', 0], ['By when will it get better?', 1], ['Which planet is doing this?', 1], ['Saturn in this chart', 1], ['Good muhurat to buy a car', 1]];
  h += '<div class="qchips">' + Q.map(function (q) { return '<button data-act="askQ" data-send="' + q[1] + '">' + esc(q[0]) + '</button>'; }).join('') + '</div><div class="chat" id="chat">';
  if (!msgs.length) h += '<div class="msg bot">' + HELP + '</div>';
  msgs.forEach(function (m) { h += m.role === 'me' ? '<div class="msg me">' + esc(m.text) + '</div>' : '<div class="msg bot">' + m.html + '</div>'; });
  h += '</div><div style="height:90px"></div>';
  U.after = (U.after || []).concat([function () { window.scrollTo(0, document.body.scrollHeight); }]);
  return h;
}
CHG.askFor = function (el) { U.askFor = el.value; rerender(); };
ACT.askQ = function (el) { var t = $('#askIn'); t.value = el.textContent; if (el.dataset.send === '1') ACT.askSend(); else { t.focus(); var i = t.value.indexOf('DD'); if (i >= 0 && t.setSelectionRange) t.setSelectionRange(i, t.value.length - 1); } };
ACT.clearChat = function () { var p = person(U.askFor); if (p) { DB.chats[p.id] = []; save(); rerender(); } };
ACT.askSend = function () {
  var t = $('#askIn'), q = (t.value || '').trim(), p = person(U.askFor) || me(); if (!q || !p) return;
  t.value = ''; t.style.height = '';
  var c = calcP(p), list = DB.chats[p.id] = DB.chats[p.id] || [];
  list.push({ role: 'me', text: q });
  var res = null; try { res = answerLocal(p, c, q); } catch (e) { res = { html: '<p>Could not work that out: ' + esc(e.message) + '</p>' }; }
  var deep = DB.settings.key && DB.settings.deep;
  if (!deep) {
    list.push({ role: 'bot', html: res ? res.html : HELP + '<p class="mut">For free-form questions, add your Claude API key in More › Claude.</p>', text: res ? (res.text || htmlText(res.html)).slice(0, 3000) : '' });
    trimChat(list); save(); rerender(); return;
  }
  save(); rerender();
  var chat = $('#chat'), pend = document.createElement('div'); pend.className = 'msg bot'; pend.innerHTML = '<span class="typing"><i></i><i></i><i></i></span> <span class="mut" style="font-size:12.5px">Reading the chart…</span>'; chat.appendChild(pend); window.scrollTo(0, document.body.scrollHeight);
  var localTxt = res ? htmlText(res.html).slice(0, 2500) : '';
  askClaude(p, c, q, localTxt).then(function (txt) {
    list.push({ role: 'bot', html: mdToHtml(txt) + (res ? '<details><summary>Offline calculation</summary>' + res.html + '</details>' : '') + '<div class="src">Claude · ' + esc(DB.settings.model) + ' · from the computed chart</div>', text: txt });
    trimChat(list); save(); if (location.hash.indexOf('ask') >= 0) rerender();
  }).catch(function (e) {
    list.push({ role: 'bot', html: (res ? res.html : HELP) + '<p class="mut" style="font-size:12.5px">Claude could not answer (' + esc(e.message) + '). ' + (res ? 'This is the offline answer.' : '') + '</p>', text: localTxt });
    trimChat(list); save(); if (location.hash.indexOf('ask') >= 0) rerender();
  });
};
function htmlText(h) { var d = document.createElement('div'); d.innerHTML = h; return (d.innerText || d.textContent || '').replace(/\s+\n/g, '\n'); }
function trimChat(list) { while (list.length > 60) list.shift(); }
