/* Trikaal 7: customer consultation. Pick the customer and the problem; the app answers through KP and Vedic, both worked out
   by rule (src/consult.js), with date windows, confidence and remedies; Gemini or Claude then writes it in simple words. */
var CONSULT = makeConsult(J, C, N);
V4I.users = '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><path d="M16 11.5a3.5 3.5 0 0 0 0-7M18 14.8c1.9.7 3.1 2.4 3.5 5.2"/>';
IC.q = IC.q || '<path d="M4 5h16v11H9l-5 4z"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.4M12 14.6v.1"/>';
function cases() { DB.cases = DB.cases || []; return DB.cases; }
function caseById(id) { return cases().filter(function (x) { return x.id === id; })[0]; }
var CQ_CACHE = {};
function caseAnswer(cs) {
  var p = person(cs.pid); if (!p) return null; var key = cs.id + '|' + p.date + '|' + p.time + '|' + p.lat + '|' + (cs.n || '');
  if (!CQ_CACHE[key]) { var c = calcP(p), T = CONSULT.topic(cs.topic), al = [];
    if (T && T.med) try { al = ALERT.forPerson(c, maOf(p), chartTop(p, 2).filter(function (t) { return /Strong/.test(t.r.tend); }).map(function (t) { return t.id; }).concat(['general']), new Date(cs.at - 3 * 864e5), 60, []); } catch (e) { }
    CQ_CACHE[key] = CONSULT.answer(c, p, cs.topic, new Date(cs.at), { alerts: al, horary: cs.n ? { n: cs.n } : null, lat: cs.qlat, lon: cs.qlon, tz: cs.qtz }, N.dmy); }
  return CQ_CACHE[key];
}
var CQ_PN = CONSULT.PN;
function cqWin(w) { return N.dmy(w.start) + ' – ' + N.dmy(w.end); }
function cqIcon(k) { return k === 'g' ? '<i class="cg">✓</i>' : k === 'b' ? '<i class="cb">✗</i>' : '<i>·</i>'; }
function cqTone(t) { return t === 'good' ? 'g' : t === 'bad' ? 'b' : 'w'; }

/* ---------- screen 1: the customer's problem ---------- */
function CustomerScreen() {
  var p = curP();
  var h = '<div class="v4sky slim">' + v4stars(40, 7) + '<div class="v4top"><div class="dt"><b class="nm">Ask for a customer</b><small>Pick the customer, then their problem</small></div><span class="sp"></span><button class="v4gear" data-go="more" aria-label="Settings">' + icon('gear', 18) + '</button></div>';
  h += '<div class="cqwho"><button class="on" data-act="pickPerson">' + (p ? esc(p.name) + ' ▾' : 'Pick a customer ▾') + '</button><button data-act="cqNew">+ New customer</button></div></div>';
  if (!p) return h + '<div class="pad"><div class="card"><p>Add the customer\'s birth date, time and place first.</p><button class="v4btn" data-act="cqNew">Add a customer</button></div></div>';
  var ag = ltAge(p), ts = CONSULT.topicsFor(ag == null ? 30 : ag), sel = U.cqT && ts.some(function (t) { return t.id === U.cqT; }) ? U.cqT : null;
  h += '<div class="pad"><div class="card"><div class="lbl2">' + esc(p.name.split(' ')[0]) + ' · ' + ag + ' years · born ' + esc(N.dmy(calcP(p).birth)) + ', ' + esc(p.time) + (p.place ? ', ' + esc(p.place) : '') + '</div><div class="lbl2" style="margin-top:12px">What is the problem?</div><div class="cqtop">' +
    ts.map(function (t) { return '<button data-act="cqT" data-v="' + t.id + '" class="' + (t.id === sel ? 'on' : '') + '">' + esc(t.l) + '</button>'; }).join('') + '</div>' +
    (sel ? '<p class="cqq">' + esc(CONSULT.topic(sel).q) + '</p>' : '') + '</div>';
  h += '<div class="card"><div class="lbl2">In the customer\'s words (optional)</div><textarea class="inp" id="cqWords" rows="3" placeholder="e.g. Doctor says knee surgery. Should I do it now or wait?">' + esc(U.cqW || '') + '</textarea></div>';
  if (sel) {
    var L = DB.settings.loc || {};
    h += '<div class="v4sec" style="padding-left:0"><h2>Read it with</h2></div>';
    h += '<button class="card cqmode" data-act="cqGoV"><b>Vedic, step by step</b><small>Birth chart: lagna, houses, lord, karaka, divisional chart, dasha, transits, then the remedy</small><span>›</span></button>';
    h += '<div class="card cqmode k"><b>KP Prashna, step by step</b><small>Ask ' + esc(p.name.split(' ')[0]) + ' to think of the question and say any number from 1 to 249. The Prashna kundli is cast for this moment' + (L.name ? ' at ' + esc(L.name) : '') + '.</small><div class="cqnum"><input class="inp" id="cqNum" type="number" inputmode="numeric" min="1" max="249" placeholder="1 – 249" value="' + esc(U.cqN || '') + '"><button class="v4btn" data-act="cqGoK">Cast Prashna ›</button></div><button class="v4link" data-act="cqGoKB" style="margin-top:6px">No number? Read KP from the birth chart ›</button></div>';
    h += '<button class="v4link" data-act="cqGo" style="display:block;margin:4px auto 0">Quick answer: Vedic and KP together ›</button>';
  } else h += '<p class="v4note" style="text-align:center;margin:6px 0 0">Pick the problem above to continue.</p>';
  var rec = cases().slice(-12).reverse().filter(function (x) { return person(x.pid); });
  if (rec.length) h += '<div class="v4sec" style="padding-left:0"><h2>Recent answers</h2></div><div class="card" style="padding:4px 14px">' + rec.map(function (x) { var T = CONSULT.topic(x.topic), q = person(x.pid); return '<button class="cqrow" data-go="q/' + x.id + '"><b>' + esc(q.name) + '</b><span>' + esc(T ? T.l : x.topic) + ' · ' + N.dmy(new Date(x.at)) + '</span></button>'; }).join('') + '</div>';
  return h + '</div><div style="height:80px"></div>';
}
ACT.cqT = function (el) { var t = $('#cqWords'); if (t) U.cqW = t.value; U.cqT = el.dataset.v; rerender(true); };
ACT.cqNew = function () { U.fromQ = true; go('edit'); };
function cqNew(extra) {
  var p = curP(); if (!p || !U.cqT) return null; var t = $('#cqWords'), w = t ? t.value.trim() : '', L = DB.settings.loc || {};
  var cs = { id: 'q' + Date.now().toString(36), pid: p.id, topic: U.cqT, words: w, at: Date.now() };
  if (extra && extra.n) { cs.n = extra.n; cs.qlat = L.lat; cs.qlon = L.lon; cs.qtz = locOff(); cs.qplace = L.name || ''; }
  cases().push(cs); while (DB.cases.length > 300) DB.cases.shift(); U.cqW = ''; U.cqN = ''; save(); return cs;
}
ACT.cqGoV = function () { var cs = cqNew(); if (cs) go('q/' + cs.id + '/v/0'); };
ACT.cqGoKB = function () { var cs = cqNew(); if (cs) go('q/' + cs.id + '/k/0'); };
ACT.cqGoK = function () { var el = $('#cqNum'), n = parseInt(el && el.value, 10); if (!(n >= 1 && n <= 249)) { toast('Enter a number from 1 to 249'); return; } var cs = cqNew({ n: n }); if (cs) go('q/' + cs.id + '/k/0'); };
ACT.cqGo = function () {
  var cs = cqNew(); if (!cs) return; go('q/' + cs.id);
  if (ltProv()) setTimeout(function () { cqAI(cs.id); }, 80);
};

/* ---------- screen 2: the answer ---------- */
function AnswerScreen(id) {
  var cs = caseById(id), p = cs && person(cs.pid); if (!cs || !p) { return '<div class="empty"><h2>Answer not found</h2><button class="btn" data-go="q">Back</button></div>'; }
  var a = caseAnswer(cs), T = a.T, at = new Date(cs.at), n1 = p.name.split(' ')[0];
  var h = '<div class="v4sky slim">' + v4stars(40, 7) + '<div class="v4top"><div class="dt"><button class="cqback" data-go="q">‹ Back</button><b class="nm">' + esc(T.l) + '</b><small>' + esc(p.name) + ' · asked ' + N.dmy(at) + ', ' + N.hm(at) + '</small></div></div></div><div class="pad">';
  if (cs.words) h += '<div class="card cqwords">“' + esc(cs.words) + '”</div>';
  /* tell the customer */
  var tl = a.tell;
  h += '<div class="card cqtell ' + (tl.conf === 'High' ? 'hi' : tl.conf === 'Low' ? 'lo' : '') + '"><div class="lbl2">Tell the customer</div><div class="cqbig">' + esc(tl.text) + '</div><span class="chip ' + (tl.agree ? 'g' : 'w') + '">' + (tl.agree ? 'Vedic and KP agree' : 'Vedic and KP differ') + ' · confidence ' + tl.conf.toLowerCase() + '</span>';
  if (U.cqBusy === cs.id) h += '<div class="cqai"><div class="ltthink" id="cqLive">Writing it in simple words…</div></div>';
  else if (cs.ai) h += '<div class="cqai"><div class="lbl2">In simple words' + (cs.via ? ' · ' + esc(cs.via) : '') + '</div>' + mdToHtml(cs.ai) + '</div>';
  else if (cs.aiErr) h += '<div class="cqai err">' + esc(cs.aiErr) + ' <button class="v4link" data-act="cqAI" data-id="' + cs.id + '">Try again</button></div>';
  else if (ltProv()) h += '<button class="v4link" data-act="cqAI" data-id="' + cs.id + '">Write it in simple words with AI ›</button>';
  h += '</div>';
  /* KP */
  h += '<div class="card"><div class="lbl2">' + (a.kp.horary ? 'KP Prashna says (number ' + a.kp.horary.n + ', cast ' + N.dmy(a.kp.horary.at) + ' ' + N.hm(a.kp.horary.at) + (cs.qplace ? ', ' + esc(cs.qplace) : '') + ')' : 'KP says (birth chart)') + '</div>' + a.kp.checks.map(function (ch, i) {
    return (i ? '<hr class="cqhr">' : '') + '<div class="cqck"><b>' + esc(ch.label) + '</b><span class="chip ' + cqTone(ch.tone) + '">' + esc(ch.verdict) + '</span></div><ul class="cqwhy">' + ch.why.map(function (w) { return '<li>' + cqIcon(w.k) + '<span>' + esc(w.t) + '</span></li>'; }).join('') + '</ul>' +
      (ch.windows.length ? '<div class="lbl3">When (Dasha · Bhukti · Antara)</div>' + ch.windows.map(function (w) { return '<div class="cqwin"><b>' + cqWin(w) + '</b><span>' + CQ_PN[w.md] + ' › ' + CQ_PN[w.ad] + ' › ' + CQ_PN[w.pd] + (w.rp && w.rp.length ? ' · ruling planet ★' : '') + '</span><em class="chip ' + (w.rank === 2 ? 'g' : w.rank === 1 ? 'w' : '') + '">' + (w.rank === 2 ? 'Strongest' : w.rank === 1 ? 'Good' : 'Possible') + '</em></div>'; }).join('') : '<p class="sm">No period in the next 6 years where all the period lords support this.</p>');
  }).join('') + (a.kp.rp ? '<p class="cqnote">' + esc(a.kp.rp.t) + '</p>' : '') + '<p class="cqnote">KP depends on an exact birth time: a 4-minute error can change a sub lord.</p></div>';
  /* Vedic */
  var ve = a.ve, fs = ve.f.slice().sort(function (x, y) { return Math.abs(y.s) - Math.abs(x.s); });
  if (ve.surg) h += '<div class="card"><div class="lbl2">Vedic says</div>' + '<div class="cqck"><b>Is surgery shown?</b><span class="chip ' + (ve.surg.iscore >= 1 ? 'w' : 'g') + '">' + ve.surg.iword + '</span></div><ul class="cqwhy">' + ve.surg.ind.map(function (x) { return '<li>' + cqIcon('i') + '<span>' + esc(x.t) + '</span></li>'; }).join('') + (ve.surg.ind.length ? '' : '<li>' + cqIcon('i') + '<span>No strong surgical combination in the birth chart.</span></li>') + '</ul>' +
    '<hr class="cqhr"><div class="cqck"><b>Recovery</b><span class="chip ' + (ve.surg.rscore >= 1.5 ? 'g' : ve.surg.rscore >= 0 ? 'w' : 'b') + '">' + ve.surg.rword + '</span></div><ul class="cqwhy">' + ve.surg.rec.map(function (x) { return '<li>' + cqIcon(x.s > 0 ? 'g' : x.s < 0 ? 'b' : 'i') + '<span>' + esc(x.t) + '</span></li>'; }).join('') + '</ul>' +
    '<details class="cqmore"><summary>8th house details</summary><ul class="cqwhy">' + fs.map(function (x) { return '<li>' + cqIcon('i') + '<span><em class="src">' + x.src + '</em> ' + esc(x.t) + '</span></li>'; }).join('') + '</ul></details>';
  else h += '<div class="card"><div class="lbl2">Vedic says</div><div class="cqck"><b>' + esc(T.q) + '</b><span class="chip ' + cqTone(ve.tone) + '">' + esc(ve.verdict) + '</span></div><ul class="cqwhy">' + fs.slice(0, 6).map(function (x) { return '<li>' + cqIcon(x.s > 0 ? 'g' : x.s < 0 ? 'b' : 'i') + '<span><em class="src">' + x.src + '</em> ' + esc(x.t) + '</span></li>'; }).join('') + '</ul>' +
    (fs.length > 6 ? '<details class="cqmore"><summary>All ' + fs.length + ' factors</summary><ul class="cqwhy">' + fs.slice(6).map(function (x) { return '<li>' + cqIcon(x.s > 0 ? 'g' : x.s < 0 ? 'b' : 'i') + '<span><em class="src">' + x.src + '</em> ' + esc(x.t) + '</span></li>'; }).join('') + '</ul></details>' : '');
  h += ve.windows.length ? '<div class="lbl3">' + (ve.surg ? 'Periods that activate surgery (Vimshottari)' : 'When (Vimshottari)') + '</div>' + ve.windows.map(function (w) { return '<div class="cqwin"><b>' + cqWin(w) + '</b><span>' + CQ_PN[w.md] + ' › ' + CQ_PN[w.ad] + ': ' + esc(w.why) + (w.dt ? '. Jupiter and Saturn both touch the ' + N.nth(ve.H) + ' house (' + V4MON[w.dt.from.getMonth()] + ' ' + w.dt.from.getFullYear() + (w.dt.to - w.dt.from > 40 * 864e5 ? ' – ' + V4MON[w.dt.to.getMonth()] + ' ' + w.dt.to.getFullYear() : '') + ')' : '') + '</span></div>'; }).join('') : '<p class="sm">No dasha period in the next 6 years is strongly linked to this house.</p>';
  if (ve.transit.length) h += '<div class="lbl3">Transits now</div><ul class="cqwhy">' + ve.transit.map(function (x) { return '<li>' + cqIcon(x.s > 0 ? 'g' : 'b') + '<span>' + esc(x.t) + '</span></li>'; }).join('') + '</ul>';
  h += '</div>';
  if (a.dates && a.dates.length) h += '<div class="card"><div class="lbl2">Good dates for a planned operation (next 45 days)</div>' + a.dates.map(function (d) { return '<div class="cqwin"><b>' + N.dmy(d.d) + '</b><span>' + esc(d.t) + '</span></div>'; }).join('') + '<p class="cqnote">Chosen for a waxing Moon, no Rikta tithi, the Moon not 8th or 12th from the natal Moon, and no Vipat, Pratyak or Naidhana tara. In an emergency, never wait for a date.</p></div>';
  /* remedies */
  h += '<div class="card"><div class="lbl2">Remedies, with the reason</div>' + a.rem.planets.map(function (r) {
    return '<div class="cqrem"><div class="cqck"><b>' + CQ_PN[r.planet] + '</b><span class="chip ' + (r.mode === 'pacify' ? 'w' : 'g') + '">' + (r.mode === 'pacify' ? 'Ease its block' : 'Strengthen it') + '</span></div><p class="why">' + r.why.map(esc).join('<br>') + '</p><ul class="cqwhy"><li><i>☀</i><span><b>' + r.day + ':</b> chant ' + esc(r.mantra) + (/Chalisa|prayer/.test(r.mantra) ? '' : ' 108 times') + '.</span></li><li><i>❁</i><span>Give ' + esc(r.give) + ' on ' + r.day + '.</span></li><li><i>✓</i><span>' + esc(r.act) + '.</span></li></ul></div>'; }).join('') +
    '<div class="lbl3">Practical steps</div><ul class="cqwhy">' + a.rem.steps.map(function (s, i) { return '<li><i>' + (i + 1) + '</i><span>' + esc(s) + '</span></li>'; }).join('') + '</ul></div>';
  h += '<div class="cqbtns"><button class="wa" data-act="cqShare" data-id="' + cs.id + '">Send on WhatsApp</button><button data-act="cqFollow" data-id="' + cs.id + '">Ask a follow-up</button></div><button class="v4link" data-act="cqDel" data-id="' + cs.id + '" style="display:block;margin:14px auto">Delete this answer</button>';
  return h + '</div><div style="height:80px"></div>';
}
function cqPlain(cs, a, full) {
  var p = person(cs.pid), T = a.T, L = [];
  L.push(T.q + ' — ' + p.name);
  L.push('', cs.ai || a.tell.text, 'Confidence: ' + a.tell.conf.toLowerCase() + (a.tell.agree ? ' (Vedic and KP agree)' : ' (Vedic and KP differ)'));
  if (full) {
    L.push('', 'KP: ' + a.kp.checks.map(function (ch) { return ch.label + ' ' + ch.verdict + '. ' + ch.why.map(function (w) { return w.t; }).join(' ') + (ch.windows.length ? ' Windows: ' + ch.windows.map(function (w) { return cqWin(w) + ' (' + CQ_PN[w.md] + '–' + CQ_PN[w.ad] + '–' + CQ_PN[w.pd] + ')'; }).join('; ') + '.' : ''); }).join(' '));
    if (a.kp.rp) L.push(a.kp.rp.t);
    L.push('', 'Vedic: ' + a.ve.verdict + '. ' + a.ve.f.map(function (x) { return x.src + ': ' + x.t; }).join(' ') + (a.ve.windows.length ? ' Dasha windows: ' + a.ve.windows.map(function (w) { return cqWin(w) + ' (' + CQ_PN[w.md] + '–' + CQ_PN[w.ad] + ')'; }).join('; ') + '.' : '') + ' ' + a.ve.transit.map(function (x) { return x.t; }).join(' '));
    if (a.ve.surg) L.push('Surgery check: ' + a.ve.surg.iword + '; ' + a.ve.surg.rword + '. ' + a.ve.surg.ind.concat(a.ve.surg.rec).map(function (x) { return x.t; }).join(' '));
    if (a.dates) L.push('Good dates (next 45 days): ' + a.dates.map(function (d) { return N.dmy(d.d); }).join(', ') + '.');
  }
  L.push('', 'Remedies:'); a.rem.planets.forEach(function (r) { L.push('• ' + CQ_PN[r.planet] + ' (' + r.why.join(' ') + '): ' + r.day + ', chant ' + r.mantra + '; give ' + r.give + '; ' + r.act + '.'); });
  a.rem.steps.forEach(function (s) { L.push('• ' + s); });
  return L.join('\n');
}
function cqAI(id) {
  var cs = caseById(id), p = cs && person(cs.pid); if (!cs || !p || !ltProv() || U.cqBusy) return;
  var a = caseAnswer(cs), ag = ltAge(p);
  var sys = 'You are a senior Vedic and KP astrologer helping a practising astrologer answer a customer. The analysis below was worked out by exact rules from the chart; do not change any verdict, date, window or confidence, and do not add predictions that are not in it.\n' +
    'Write what the astrologer should tell the customer: 4 to 7 short sentences, plain simple words, warm and honest, no fear. Start with the direct answer, then when (the best window), then one line on why (one KP reason and one Vedic reason), then what to do, mentioning the remedies briefly. ' + (a.T.med ? 'This is a health matter: say clearly that the doctor\'s advice comes first and astrology only helps with timing and care. ' : '') + (ag != null && ag < 18 ? 'The person is a ' + ag + '-year-old child: speak to the parent. ' : '') + 'If the customer\'s own words are given, answer that exact concern. Reply in the language of the customer\'s words if they are not in English.';
  var user = 'CUSTOMER: ' + p.name + ', ' + ag + ' years, ' + (p.gender === 'F' ? 'female' : 'male') + '.\nPROBLEM: ' + a.T.q + (cs.words ? '\nCUSTOMER\'S WORDS: ' + cs.words : '') + '\n\nANALYSIS:\n' + cqPlain(cs, a, true) + '\n\nCHART PACK (for reference only):\n' + packOf(p);
  U.cqBusy = cs.id; delete cs.aiErr; if (parts()[0] === 'q') rerender(true);
  var on = function (k, t) { var el = document.getElementById('cqLive'); if (!el) return; if (k === 'text') { el.className = ''; el.innerHTML = mdToHtml(t); } };
  aiOnce(sys, user, on).then(function (r) { cs.ai = r.t; cs.via = r.via; }, function (e) { cs.aiErr = e.message || String(e); })
    .then(function () { U.cqBusy = null; save(); if (parts()[0] === 'q' && parts()[1] === cs.id) rerender(true); });
}
/* one-shot AI call (no chat history), Gemini or Claude */
function aiOnce(sys, user, on) {
  if (ltProv() === 'claude') { G_ON = function (k, t) { if (k === 'text') on('text', t); }; return claudeCall(JSON.stringify({ system_instruction: { parts: [{ text: sys }] }, contents: [{ role: 'user', parts: [{ text: user }] }] })).then(function (d) { G_ON = null; return { t: d.candidates[0].content.parts[0].text, via: 'Claude' }; }, function (e) { G_ON = null; throw e; }); }
  var model = DB.settings.lmodel || LT_MODELS[0][0], acc = '', fin = '';
  var body = { systemInstruction: { parts: [{ text: sys }] }, contents: [{ role: 'user', parts: [{ text: user }] }], generationConfig: { thinkingConfig: { thinkingLevel: DB.settings.lthink || 'high', includeThoughts: true } } };
  return httpStream(GBASE + 'models/' + encodeURIComponent(model) + ':streamGenerateContent?alt=sse', { 'content-type': 'application/json', 'x-goog-api-key': DB.settings.gkey }, JSON.stringify(body), function (data) {
    var j; try { j = JSON.parse(data); } catch (e) { return; } if (Array.isArray(j)) j = j[0] || {}; if (j.error) { fin = j.error.message; return; }
    (j.candidates || []).forEach(function (cd) { ((cd.content && cd.content.parts) || []).forEach(function (pt) { if (pt.text && !pt.thought) { acc += pt.text; on('text', acc); } }); });
  }).then(function (r) {
    if (r.status !== 200) { var d; try { d = JSON.parse(r.text); if (Array.isArray(d)) d = d[0]; } catch (e) { d = {}; } var m = (d.error && d.error.message) || ('HTTP ' + r.status); throw new Error(/API key not valid/i.test(m) ? 'The Gemini key is not valid. Check it in Settings.' : r.status === 429 ? 'Gemini limit reached. Try again in a minute.' : 'Gemini: ' + m); }
    if (!acc) throw new Error('Gemini sent an empty answer' + (fin ? ' (' + fin + ')' : '') + '. Try again.');
    return { t: acc, via: 'Gemini' };
  });
}
ACT.cqAI = function (el) { cqAI(el.dataset.id); };
ACT.cqShare = function (el) { var cs = caseById(el.dataset.id); shareText('Trikaal answer', cqPlain(cs, caseAnswer(cs), false)); };
ACT.cqFollow = function (el) { var cs = caseById(el.dataset.id), a = caseAnswer(cs); U.cur = cs.pid; U.ltPend = 'Follow-up on the ' + a.T.l.toLowerCase() + ' question. Earlier answer: ' + (cs.ai || a.tell.text) + '\nMy follow-up: '; go('ai'); };
ACT.cqDel = function (el) { DB.cases = cases().filter(function (x) { return x.id !== el.dataset.id; }); save(); go('q'); };

/* ---------- routing ---------- */
NAVS = [['q', 'Customer'], ['astro', 'Kundli'], ['dasha', 'Dasha'], ['sky', 'Sky'], ['people', 'People']];
(function () {
  var r0 = render;
  render = function () {
    var pr = parts();
    if (pr[0] === 'p' && U.fromQ && person(pr[1])) { U.fromQ = false; U.cur = pr[1]; location.hash = '#/q'; return; }
    if (!pr.length) { location.hash = me() || (DB.people || []).length ? '#/astro' : '#/people'; return; }
    if (pr[0] !== 'q') {
      if (pr[0] === 'ai' && U.ltPend && /\nMy follow-up: $/.test(U.ltPend)) { var q = U.ltPend; U.ltPend = null; r0(); var t = $('#ltIn'); if (t) { t.value = q; t.focus(); } return; }
      return r0();
    }
    applySettings(); var html; try { html = pr[1] ? AnswerScreen(pr[1]) : CustomerScreen(); } catch (e) { html = '<div class="empty"><h2>Something went wrong</h2>' + esc(e.message) + '<br><br><button class="btn" data-go="q">Back</button></div>'; if (window.console) console.error(e); }
    $('#app').innerHTML = html; $('#nav').innerHTML = NAVS.map(function (x) { return '<button data-go="' + x[0] + '" class="' + (x[0] === 'q' ? 'on' : '') + '">' + icon(x[0]) + x[1] + '</button>'; }).join('');
    document.body.setAttribute('data-scr', 'q'); var fb = document.getElementById('askfab'); if (fb) fb.remove(); window.scrollTo(0, U.keepY || 0);
  };
  var tb = window.trikaalBack; window.trikaalBack = function () { var p = parts(); if (p[0] === 'q' && p.length < 2) return $('#scrim') ? tb() : 'false'; return tb(); };
})();
render();
/* the chat also gets the computed "right now" health picture, so it cannot call a hospital period steady */
(function () {
  var pk = packOf; packOf = function (p) {
    var s = pk(p);
    try { var cs = { id: 'pack' + p.id + new Date().toISOString().slice(0, 13), pid: p.id, topic: 'health', at: Date.now() }, had = caseById(cs.id); if (!had) { cases().push(cs); }
      var a = caseAnswer(cs); DB.cases = cases().filter(function (x) { return x.id !== cs.id; });
      s += '\n\n=== RIGHT NOW: HEALTH TRIGGERS (computed by rule) ===\n' + 'KP running lords: ' + a.now.kp.rows.map(function (r) { return r.lvl + ' ' + CQ_PN[r.lord] + ' signifies ' + r.sig.join(',') + (r.neg.length ? ' (illness houses ' + r.neg.join(',') + ')' : ''); }).join('; ') + '. Status: ' + (a.now.kp.status === 'off' ? 'ILLNESS ACTIVE NOW' : a.now.kp.status === 'on' ? 'recovery supported' : 'mixed') + '.\n' +
        'Vedic running lords: ' + a.now.ve.rows.map(function (r) { return r.lvl + ' ' + CQ_PN[r.lord] + ': ' + (r.notes.join('; ') || 'no link'); }).join(' | ') + '. ' + a.now.ve.tr.map(function (x) { return x.t; }).join(' ') + '\n' +
        'Health alert windows (next 60 days): ' + (a.now.alerts.length ? a.now.alerts.map(function (w) { return w.level + ' ' + ltD(w.start) + ' to ' + ltD(w.end); }).join(', ') : 'none') + '.\n' +
        'Rule: when the status is ILLNESS ACTIVE NOW or an alert window is running, say clearly that health needs care now; never call it steady.';
    } catch (e) { }
    return s;
  };
})();
