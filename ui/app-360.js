/* Trikaal 4.2: palm reading, face reading, numerology with Lo Shu grid, and the 360° reading that checks them against the kundli.
   Palm and face photos are read by Claude only when the user taps "Read with Claude"; photos stay on this phone as small copies.
   Every cross-check (agrees, partly, differs) is computed by the app from the kundli judge, never by the AI. */
var NUM = makeNumerology(J);
V4I.hand = '<path d="M7 21c-1.500-2-3-5-3-8 0-1.500 1.500-1.500 2 0l1 2V6a1.200 1.200 0 0 1 2.400 0v5V4a1.200 1.200 0 0 1 2.400 0v7V5a1.200 1.200 0 0 1 2.400 0v7V8a1.200 1.200 0 0 1 2.400 0v7c0 3-1 5-2.500 6"/>';
V4I.face = '<circle cx="12" cy="12" r="8.500"/><path d="M9 10h.01M15 10h.01M9 15.500c1.700 1.300 4.300 1.300 6 0"/>';
V4I.hash = '<path d="M5 9h14M4 15h14M10 4L8 20M16 4l-2 16"/>';
V4I.r360 = '<circle cx="12" cy="12" r="8.500"/><path d="M3.500 12h17M12 3.500c2.500 2.300 3.800 5.200 3.800 8.500s-1.300 6.200-3.800 8.500c-2.500-2.300-3.800-5.200-3.800-8.500S9.500 5.800 12 3.500z"/>';
function x3Kid(p) { try { return age(p, new Date()) < 14; } catch (e) { return false; } }
function x3Head(title, sub, p, extra) { return '<div class="v4sky slim">' + v4stars(50, 5) + '<div class="v4top"><button class="v4nav" data-go="astro">‹</button><div class="dt"><b class="nm">' + title + '</b><small>' + sub + '</small></div><span class="sp"></span><button class="v4pill" data-act="pickPerson">' + esc(p.name.split(' ')[0]) + ' ▾</button></div>' + (extra || '') + '</div>'; }
function x3v(k) { return k === 'g' ? 1 : k === 'b' ? -1 : 0; }
function x3cmp(a, b) { var d = Math.abs(a - b); return d === 0 ? ['g', 'Kundli agrees'] : d === 1 ? ['w', 'Partly agrees'] : ['b', 'Kundli differs']; }
function x3word(k) { return k === 'g' ? 'strong' : k === 'b' ? 'weak' : 'average'; }

/* ---------- photos and Claude vision ---------- */
function x3img(file) {
  return new Promise(function (res, rej) {
    var fr = new FileReader(); fr.onerror = function () { rej(new Error('Could not read the photo')); };
    fr.onload = function () { var im = new Image(); im.onerror = function () { rej(new Error('This file is not a photo')); }; im.onload = function () {
      function shrink(max, q) { var s = Math.min(1, max / Math.max(im.width, im.height)), cv = document.createElement('canvas'); cv.width = Math.round(im.width * s); cv.height = Math.round(im.height * s); cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height); return cv.toDataURL('image/jpeg', q); }
      res({ big: shrink(1400, 0.85).split(',')[1], thumb: shrink(420, 0.72) }); }; im.src = fr.result; };
    fr.readAsDataURL(file);
  });
}
function x3vision(b64, prompt) {
  var H = { 'content-type': 'application/json', 'x-api-key': DB.settings.ckey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' };
  var body = { model: DB.settings.cmodel || CMODELS[0][0], max_tokens: 3500, system: 'You are an expert in Indian palmistry (Hasta Rekha) and face reading (Samudrika Shastra). Describe only what is clearly visible in the photo. Use plain, simple English. Never diagnose illness and never predict death. Return ONLY valid JSON.',
    messages: [{ role: 'user', content: [{ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: b64 } }, { type: 'text', text: prompt }] }] };
  return http('POST', 'https://api.anthropic.com/v1/messages', H, JSON.stringify(body)).then(function (r) {
    if (r.status !== 200) { var m = ''; try { m = JSON.parse(r.text).error.message; } catch (e) { } throw new Error(r.status === 401 ? 'Claude key is not valid' : /credit/i.test(m) ? 'Claude account has no credit left' : 'Claude could not read the photo (' + (m || 'HTTP ' + r.status) + ')'); }
    var d = JSON.parse(r.text), t = (d.content || []).map(function (x) { return x.text || ''; }).join(''), i = t.indexOf('{'), j = t.lastIndexOf('}');
    return JSON.parse(t.slice(i, j + 1));
  });
}
var PALM_Q = 'Read this palm photo. Return JSON exactly in this shape: {"ok":true,"problem":"","hand":"right or left or unclear","hand_shape":"earth|air|fire|water","lines":[{"id":"life","present":true,"length":"short|medium|long","depth":"faint|medium|deep","marks":"breaks, islands, chains, forks, or none","detail":"one plain sentence on what is seen","meaning":"one plain sentence on what this traditionally indicates","strength":"strong|average|weak","ages":"age range if a mark suggests timing, else empty"}],"mounts":[{"planet":"Jupiter|Saturn|Sun|Mercury|Venus|Moon|Mars","state":"raised|normal|flat"}],"summary":"two plain sentences"}. Include lines with id life, head, heart, fate, sun, mercury, marriage (present false if not visible). Include all 7 mounts. If the photo is not a clear open palm, return {"ok":false,"problem":"what is wrong and how to retake"}.';
var FACE_Q = 'Read this face photo using Samudrika Shastra. Return JSON exactly in this shape: {"ok":true,"problem":"","shape":"square|round|oval|long|heart|diamond|triangle","type":"short phrase such as Earth-Fire type","type_meaning":"one plain sentence on nature","features":[{"id":"forehead","detail":"one plain sentence on what is seen","meaning":"one plain sentence on what this traditionally indicates","strength":"strong|average|weak"}],"zones":[{"ages":"15-30","area":"forehead","verdict":"good|mixed|weak","note":"short phrase"},{"ages":"31-50","area":"eyes and nose","verdict":"good|mixed|weak","note":""},{"ages":"51+","area":"mouth and chin","verdict":"good|mixed|weak","note":""}],"summary":"two plain sentences"}. Include features with id forehead, eyebrows, eyes, nose, cheeks, lips, chin, ears (skip ears if hidden). Judge only shapes and proportions, never skin colour, beauty, caste, religion or ethnicity. If it is not a clear front face photo, return {"ok":false,"problem":"what is wrong and how to retake"}.';
CHG.x3photo = function (el) {
  var f = el.files && el.files[0], kind = el.dataset.k; if (!f) return;
  x3img(f).then(function (o) { U.x3 = { kind: kind, big: o.big, thumb: o.thumb, err: '' }; rerender(true); }, function (e) { toast(e.message); });
};
ACT.x3read = function () {
  var p = curP(), x = U.x3; if (!p || !x) return; if (!hasAI()) { toast('Add your Claude key in Settings first'); return; }
  x.busy = true; x.err = ''; rerender(true);
  x3vision(x.big, x.kind === 'face' ? FACE_Q : PALM_Q).then(function (r) {
    x.busy = false; if (!r || r.ok === false) { x.err = (r && r.problem) || 'The photo was not clear enough. Please retake it.'; rerender(true); return; }
    var store = x.kind === 'face' ? 'face' : 'palm'; DB[store] = DB[store] || {}; DB[store][p.id] = { at: Date.now(), thumb: x.thumb, r: r };
    U.x3 = null; save(); toast(store === 'face' ? 'Face reading saved' : 'Palm reading saved'); rerender(true);
  }, function (e) { x.busy = false; x.err = e.message; rerender(true); });
};
ACT.x3cancel = function () { U.x3 = null; rerender(true); };
ACT.x3redo = function (el) { var p = curP(), k = el.dataset.k; if (DB[k] && DB[k][p.id]) { delete DB[k][p.id]; save(); } rerender(true); };
function x3capture(kind, p) {
  var x = U.x3 && (U.x3.kind === kind || (kind === 'palm' && U.x3.kind !== 'face')) ? U.x3 : null;
  var h = '<div class="v4card x3cap">';
  if (x) {
    h += '<img class="x3prev" src="' + x.thumb + '" alt="">';
    if (x.busy) h += '<p class="x3busy">Claude is reading the ' + (kind === 'face' ? 'face' : 'palm') + '. This takes about 20 seconds…</p>';
    else h += (x.err ? '<p class="x3err">' + esc(x.err) + '</p>' : '') + '<button class="v4btn" data-act="x3read">Read with Claude</button><button class="v4link" data-act="x3cancel">Choose another photo</button>';
    return h + '<p class="v4note">The photo goes to Claude only to be read. A small copy is kept on this phone, never online.</p></div>';
  }
  var tips = kind === 'face' ? ['Face the camera straight, eyes level', 'Plain daylight, no shadows', 'No glasses or cap; hair off the forehead'] : ['Right hand for men, both hands if you can (main hand first)', 'Open palm flat, fingers slightly apart', 'Daylight from the front; fill the frame with the palm'];
  h += '<div class="x3guide">' + v4i(kind === 'face' ? 'face' : 'hand') + '</div><ul class="v4why">' + tips.map(function (t) { return '<li class="z"><i>•</i><span>' + t + '</span></li>'; }).join('') + '</ul>' +
    '<label class="v4btn x3pick">Take or choose a photo<input type="file" accept="image/*" capture="' + (kind === 'face' ? 'user' : 'environment') + '" data-ch="x3photo" data-k="' + kind + '" hidden></label>' +
    (hasAI() ? '' : '<p class="v4note">Reading photos needs your Claude key (Settings › AI engine).</p>');
  return h + '</div>';
}

/* ---------- palm ---------- */
var PALM_LINES = { life: ['Life line', '#E5B33A'], head: ['Head line', '#3E9B6A'], heart: ['Heart line', '#D9534A'], fate: ['Fate line', '#4F72C9'], sun: ['Sun line', '#B05CC9'], mercury: ['Mercury line', '#3E8E9B'], marriage: ['Marriage line', '#C97A9B'] };
var MOUNT_PL = { Jupiter: 'Ju', Saturn: 'Sa', Sun: 'Su', Mercury: 'Me', Venus: 'Ve', Moon: 'Mo', Mars: 'Ma' };
function palmCheck(c, id) {
  var k = c.k, L1 = J.lordOfHouse(k.ascSign, 1), P = function (x) { return JUDGE.planet(c, x); }, H = function (h) { return BOOK.house(c, h, bkSb); };
  var m = { life: [[P(L1).k, H(1).v], 'Lagna lord ' + PN[L1] + ' is ' + P(L1).word.toLowerCase() + ' and the 1st house is ' + H(1).word.toLowerCase()],
    head: [[P('Me').k, P('Mo').k], 'Mercury is ' + P('Me').word.toLowerCase() + ', Moon is ' + P('Mo').word.toLowerCase()],
    heart: [[P('Ve').k, H(4).v], 'Venus is ' + P('Ve').word.toLowerCase() + ', 4th house (feelings) is ' + H(4).word.toLowerCase()],
    fate: [[P('Sa').k, H(10).v], 'Saturn is ' + P('Sa').word.toLowerCase() + ', 10th house (career) is ' + H(10).word.toLowerCase()],
    sun: [[P('Su').k, H(11).v], 'Sun is ' + P('Su').word.toLowerCase() + ', 11th house (gains) is ' + H(11).word.toLowerCase()],
    mercury: [[P('Me').k], 'Mercury is ' + P('Me').word.toLowerCase()], marriage: [[H(7).v, P('Ve').k], '7th house is ' + H(7).word.toLowerCase() + ', Venus is ' + P('Ve').word.toLowerCase()] }[id];
  var s = m[0].reduce(function (a, b) { return a + x3v(b); }, 0) / m[0].length; return { v: s > 0.3 ? 1 : s < -0.3 ? -1 : 0, t: m[1] };
}
function palmLines(r) { return (r.lines || []).filter(function (l) { return l.present && PALM_LINES[l.id]; }); }
function PalmScreen() {
  var p = curP(); if (!p) return topBar('Palm reading', { noPerson: true }) + noPerson();
  var d = (DB.palm || {})[p.id], c = calcP(p), h = x3Head('Palm reading', 'Hasta Rekha · ' + esc(p.name), p);
  if (!d || U.x3) return h + '<div class="v4sec"><h2>' + (d ? 'New photo' : 'Take a palm photo') + '</h2></div>' + x3capture('palm', p) + '<div style="height:70px"></div>';
  var r = d.r, ls = palmLines(r);
  h += '<div class="v4card x3photo"><img src="' + d.thumb + '" alt=""><div><b>' + esc(cap1(r.hand_shape || '')) + ' hand' + (r.hand && r.hand !== 'unclear' ? ', ' + esc(r.hand) : '') + '</b><p>' + esc(r.summary || '') + '</p><small>Read on ' + N.dmy(new Date(d.at)) + '</small></div></div>';
  h += '<div class="v4sec"><h2>What the lines say</h2><span>checked against the kundli</span></div><div class="v4card">' + ls.map(function (l) {
    var lk = l.strength === 'strong' ? 1 : l.strength === 'weak' ? -1 : 0, ck = palmCheck(c, l.id), cm = x3cmp(lk, ck.v);
    return '<div class="v4row"><span class="x3dot" style="background:' + PALM_LINES[l.id][1] + '"></span><div style="flex:1"><b>' + PALM_LINES[l.id][0] + ': ' + esc([l.length, l.depth].filter(Boolean).join(', ')) + '</b><p>' + esc(l.meaning || '') + (l.marks && !/^none/i.test(l.marks) ? ' Marks: ' + esc(l.marks) + (l.ages ? ' (around age ' + esc(l.ages) + ')' : '') + '.' : '') + '</p><div class="x3ag">' + v4chip(cm[0], cm[1]) + '<span>' + esc(ck.t) + '</span></div></div></div>';
  }).join('') + '</div>';
  var ms = (r.mounts || []).filter(function (m) { return MOUNT_PL[m.planet]; });
  h += '<div class="v4sec"><h2>Mounts</h2><span>raised parts of the palm, by planet</span></div><div class="v4card x3mounts">' + ms.map(function (m) {
    var code = MOUNT_PL[m.planet], jp = JUDGE.planet(c, code), mk = m.state === 'raised' ? 1 : m.state === 'flat' ? -1 : 0, cm = x3cmp(mk, x3v(jp.k));
    return '<div><b>' + m.planet + '</b>' + v4chip(mk > 0 ? 'g' : mk < 0 ? 'b' : 'w', cap1(m.state)) + '<small class="' + cm[0] + '">' + (cm[0] === 'g' ? '✓ ' : cm[0] === 'b' ? '✗ ' : '~ ') + 'chart: ' + jp.word.toLowerCase() + '</small></div>'; }).join('') + '</div>';
  h += '<button class="v4btn out" data-act="x3redo" data-k="palm">Retake palm photo</button>';
  return h + '<p class="v4note" style="margin:0 20px">Palmistry is a traditional method. The app shows where it agrees with the kundli; where they differ, trust the points on which several methods agree (see the 360° reading).</p><div style="height:70px"></div>';
}

/* ---------- face ---------- */
var FACE_MAP = { forehead: ['Ju', 9, 'Jupiter and the 9th house (wisdom, luck)'], eyebrows: ['Ma', 3, 'Mars and the 3rd house (courage)'], eyes: ['Su', 1, 'the Sun and the 1st house (vitality)'], nose: ['Ve', 2, 'Venus and the 2nd house (wealth)'],
  cheeks: ['Mo', 4, 'the Moon and the 4th house (comfort)'], lips: ['Me', 2, 'Mercury and the 2nd house (speech)'], chin: ['Sa', 8, 'Saturn and the 8th house (later life)'], ears: ['Ju', 8, 'Jupiter and the 8th house (longevity)'] };
var FACE_N = { forehead: 'Forehead', eyebrows: 'Eyebrows', eyes: 'Eyes', nose: 'Nose', cheeks: 'Cheeks', lips: 'Lips, mouth', chin: 'Chin, jaw', ears: 'Ears' };
function faceCheck(c, id) { var m = FACE_MAP[id]; if (!m) return null; var jp = JUDGE.planet(c, m[0]), hs = BOOK.house(c, m[1], bkSb), s = (x3v(jp.k) + x3v(hs.v)) / 2; return { v: s > 0.3 ? 1 : s < -0.3 ? -1 : 0, t: PN[m[0]] + ' is ' + jp.word.toLowerCase() + ', ' + N.nth(m[1]) + ' house ' + hs.word.toLowerCase() }; }
function FaceScreen() {
  var p = curP(); if (!p) return topBar('Face reading', { noPerson: true }) + noPerson();
  var d = (DB.face || {})[p.id], c = calcP(p), h = x3Head('Face reading', 'Samudrika Shastra · ' + esc(p.name), p);
  if (!d || U.x3) return h + '<div class="v4sec"><h2>' + (d ? 'New photo' : 'Take a face photo') + '</h2></div>' + x3capture('face', p) + '<div style="height:70px"></div>';
  var r = d.r;
  h += '<div class="v4card x3photo"><img src="' + d.thumb + '" alt=""><div><b>' + esc(cap1(r.shape || '')) + ' face' + (r.type ? ', ' + esc(r.type) : '') + '</b><p>' + esc(r.type_meaning || r.summary || '') + '</p><small>Read on ' + N.dmy(new Date(d.at)) + '</small></div></div>';
  h += '<div class="v4sec"><h2>Feature by feature</h2><span>each linked to a planet</span></div><div class="v4card">' + (r.features || []).filter(function (f) { return FACE_MAP[f.id]; }).map(function (f) {
    var fk = f.strength === 'strong' ? 1 : f.strength === 'weak' ? -1 : 0, ck = faceCheck(c, f.id), cm = x3cmp(fk, ck.v);
    return '<div class="v4row"><b class="x3fl">' + FACE_N[f.id] + '</b><div style="flex:1"><p style="color:var(--ink)">' + esc(f.meaning || f.detail || '') + '</p><div class="x3ag">' + v4chip(cm[0], cm[1]) + '<span>' + esc(ck.t) + '</span></div></div></div>'; }).join('') + '</div>';
  if (r.zones && r.zones.length) h += '<div class="v4sec"><h2>Face zones by age</h2><span>Samudrika timeline</span></div><div class="v4card">' + r.zones.map(function (z) { return '<div class="v4row"><div style="flex:1"><b>Ages ' + esc(z.ages) + ', ' + esc(z.area) + '</b><p>' + esc(z.note || '') + '</p></div>' + v4chip(z.verdict === 'good' ? 'g' : z.verdict === 'weak' ? 'b' : 'w', cap1(z.verdict || 'mixed')) + '</div>'; }).join('') + '</div>';
  h += '<button class="v4btn out" data-act="x3redo" data-k="face">Retake face photo</button>';
  return h + '<div style="height:70px"></div>';
}

/* ---------- numerology ---------- */
var PY_NATURE = { 1: ['g', 'new beginnings'], 2: ['m', 'patience and partnerships'], 3: ['g', 'growth and learning'], 4: ['m', 'hard work and foundations'], 5: ['m', 'change and travel'], 6: ['g', 'family and responsibility'], 7: ['b', 'review and inner work'], 8: ['m', 'money, karma and effort'], 9: ['m', 'completion and letting go'] };
var MISS_FIX = { 1: 'Wake at sunrise and offer water to the Sun', 2: 'Keep a silver glass for drinking water; respect your mother', 3: 'Read 10 pages a day; respect teachers', 4: 'Keep your desk and accounts in order', 5: 'Keep a green plant near your work desk', 6: 'Spend Friday evenings with family', 7: 'Meditate or pray 10 minutes daily', 8: 'Keep weekly accounts and save on salary day', 9: 'Exercise daily; set one clear goal for the year' };
function numOf(p) { return NUM.analyze(p, new Date()); }
function NumScreen() {
  var p = curP(); if (!p) return topBar('Numerology', { noPerson: true }) + noPerson();
  var a = numOf(p), c = calcP(p), PLc = NUM.PL, kid = x3Kid(p), dob = N.dmy(new Date(p.date + 'T12:00:00Z'));
  var cores = [[a.mul, 'Mulank', 'Birth day · ' + PN[PLc[a.mul]]], [a.bha, 'Bhagyank', 'Destiny · ' + PN[PLc[a.bha]]], [a.name.single, 'Name', a.name.compound + ' · ' + PN[PLc[a.name.single]]], [a.kua, 'Kua', a.kuaDir.split(' (')[0]]];
  var h = x3Head('Numerology', 'Lo Shu grid · ' + esc(p.name) + ' · ' + dob, p, '<div class="x3cores">' + cores.map(function (x) { return '<div><span>' + x[0] + '</span><b>' + x[1] + '</b><small>' + esc(x[2]) + '</small></div>'; }).join('') + '</div>');
  /* grid */
  h += '<div class="v4sec"><h2>Lo Shu grid</h2><span>from the date of birth</span></div><div class="v4card"><div class="x3grid">' + NUM.GRID.map(function (n) { var k = a.cnt[n], cl = !k ? 'm' : k > 1 ? 'r' : 'p'; return '<div class="' + cl + '">' + (k ? String(n).repeat(Math.min(k, 4)) : n) + '<small>' + PN[PLc[n]] + '</small></div>'; }).join('') + '</div>' +
    '<div class="v4leg" style="justify-content:center"><span><i style="background:#BFDFCF"></i>present</span><span><i style="background:#F2C9C4"></i>missing</span><span><i style="background:#F0CF86"></i>repeated</span></div>' +
    (a.planes.filter(function (x) { return x.full; }).length ? '<p class="v4note"><b style="color:var(--good)">Complete: </b>' + a.planes.filter(function (x) { return x.full; }).map(function (x) { return x.name + ' (' + x.nums.join('-') + '): ' + x.gives; }).join('; ') + '.</p>' : '<p class="v4note">No complete line (plane) in the grid.</p>') + '</div>';
  /* meaning */
  h += '<div class="v4sec"><h2>What the grid says</h2></div><div class="v4card">' + a.missing.map(function (n) { var m = NUM.MISS[n]; return '<div class="v4row">' + v4chip('b', 'Missing ' + n) + '<div><b>' + m[0] + '</b><p>' + esc(m[1]) + '</p></div></div>'; }).join('') +
    a.repeat.map(function (n) { return '<div class="v4row">' + v4chip('w', n + ' × ' + a.cnt[n]) + '<div><b>' + esc(NUM.MANY[n].split(';')[0]) + '</b><p>' + esc(NUM.MANY[n]) + '.</p></div></div>'; }).join('') + '</div>';
  /* against the kundli */
  var now = new Date(), md = J.find(c.maha, now), ad = md ? J.find(J.subPeriods(md), now) : null, pv = ad ? JUDGE.period(c, md.lord, ad.lord) : null, pyn = PY_NATURE[a.py];
  var chk = [[a.mul, 'Mulank ' + a.mul, NUM.CORE[a.mul]], [a.bha, 'Bhagyank ' + a.bha, NUM.CORE[a.bha]]].map(function (x) { var jp = JUDGE.planet(c, PLc[x[0]]); return '<div class="v4row"><div style="flex:1"><b>' + x[1] + ' (' + PN[PLc[x[0]]] + ')</b><p>' + esc(x[2]) + '. In the kundli ' + PN[PLc[x[0]]] + ' is ' + jp.word.toLowerCase() + '.</p></div>' + v4chip(jp.k === 'b' ? 'w' : 'g', jp.k === 'b' ? 'Needs support' : 'Agrees') + '</div>'; }).join('');
  if (pv) { var agree = pyn[0] === pv.v || (pyn[0] === 'm' && pv.v !== 'b' && pv.v !== 'g'); chk += '<div class="v4row"><div style="flex:1"><b>Personal year ' + now.getFullYear() + ': ' + a.py + '</b><p>A year of ' + pyn[1] + '. The kundli period ' + PN[md.lord] + '–' + PN[ad.lord] + ' is ' + pv.word.toLowerCase() + '.</p></div>' + v4chip(agree ? 'g' : 'w', agree ? 'Agrees' : 'Partly') + '</div>'; }
  h += '<div class="v4sec"><h2>Numbers and the kundli</h2></div><div class="v4card">' + chk + '</div>';
  /* lucky, colours */
  var wd = new Date(Date.now() + locOff() * 3600e3).getUTCDay(), wr = NUM.wear(a, wd);
  h += '<div class="v4sec"><h2>Lucky numbers and colours</h2></div><div class="v4card"><div class="v4row"><div style="flex:1"><b>Lucky numbers</b><div class="x3nums">' + a.lucky.map(function (n) { return '<span class="g">' + n + '</span>'; }).join('') + '</div>' + (a.avoid.length ? '<b style="margin-top:8px">Numbers to avoid</b><div class="x3nums">' + a.avoid.map(function (n) { return '<span class="b">' + n + '</span>'; }).join('') + '</div>' : '') + '<p style="margin-top:6px">Lucky days: ' + a.days.join(', ') + '.</p></div></div>' +
    '<div class="v4row"><span class="x3sw" style="background:' + wr.hex + '"></span><div style="flex:1"><b>Wear today: ' + wr.names.join(' or ') + '</b><p>' + esc(wr.why) + '.</p></div></div>' +
    '<div class="v4row"><div style="flex:1"><b>Your colours</b><div class="x3cols">' + a.colours.good.map(function (x) { return '<span><i style="background:' + x.hex + '"></i>' + x.names[0] + '</span>'; }).join('') + '</div>' + (a.colours.bad.length ? '<b style="margin-top:8px">Avoid wearing often</b><div class="x3cols">' + a.colours.bad.map(function (x) { return '<span><i style="background:' + x.hex + '"></i>' + x.names[0] + '</span>'; }).join('') + '</div>' : '') + '</div></div>' +
    '<div class="v4row"><div style="flex:1"><b>Week plan</b><div class="x3week">' + [1, 2, 3, 4, 5, 6, 0].map(function (w) { var x = NUM.wear(a, w); return '<span><i style="background:' + x.hex + '"></i>' + ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][w] + '<small>' + x.names[0] + '</small></span>'; }).join('') + '</div></div></div></div>';
  /* name and mobile */
  var mob = (U.x3mob != null ? U.x3mob : p.phone) || '', mr = NUM.mobile(a, mob);
  h += '<div class="v4sec"><h2>Name and mobile number</h2></div><div class="v4card"><div class="v4row"><div style="flex:1"><b>Name number ' + a.name.compound + ' → ' + a.name.single + ' (' + PN[PLc[a.name.single]] + ')</b><p>' + (a.nameOk ? 'It suits the Mulank and Bhagyank. No name change is needed.' : 'It does not fully suit the Mulank and Bhagyank. A spelling change is optional; first try the simple remedies below. Never pay for a name change out of fear.') + '</p></div>' + v4chip(a.nameOk ? 'g' : 'w', a.nameOk ? 'Suits' : 'Not ideal') + '</div>' +
    '<div class="v4row"><div style="flex:1"><b>Mobile number check</b><input class="inp mono" inputmode="tel" data-in="x3mob" placeholder="10-digit mobile number" value="' + esc(mob) + '" style="margin:6px 0">' + (mr ? '<p><b style="display:inline;color:' + (mr.v === 'g' ? 'var(--good)' : mr.v === 'b' ? 'var(--bad)' : '#9A6C12') + '">' + mr.word + '.</b> ' + esc(cap1(mr.why.join('; '))) + '.</p>' : '') + '<p style="margin-top:4px">Best totals for a new number (add all 10 digits until one digit is left): <b style="display:inline">' + mr_best(a).join(', ') + '</b>. Prefer a number ending in ' + a.lucky.slice(0, 3).join(', ') + ' and with few zeros. The same check works for a car or house number.</p></div></div></div>';
  /* switch words */
  var mine = (DB.switchw || {})[p.id] || [];
  h += '<div class="v4sec"><h2>Switch words</h2><span>short words said or written for a goal</span></div><div class="v4card">' + NUM.SWITCH.map(function (s) { return '<div class="x3swrow"><b>' + s[0] + '</b><span>' + s[1].map(function (w) { return '<em>' + w.toUpperCase() + '</em>'; }).join('') + '</span></div>'; }).join('') +
    (mine.length ? '<div class="lbl" style="margin-top:12px">Your own words</div>' + mine.map(function (m, i) { return '<div class="x3swrow"><b>' + esc(m.g) + '</b><span><em>' + esc(m.w.toUpperCase()) + '</em><button data-act="x3swDel" data-i="' + i + '">✕</button></span></div>'; }).join('') : '') +
    '<div class="x3swadd"><input class="inp" data-in="x3swg" placeholder="Goal, e.g. health" value="' + esc(U.x3swg || '') + '"><input class="inp" data-in="x3sww" placeholder="Word, e.g. ASHWINA" value="' + esc(U.x3sww || '') + '"><button class="v4btn" data-act="x3swAdd" style="margin:0;width:auto">Add</button></div>' +
    '<p class="v4note">How to use: pick one goal, say the word slowly 27 times (or write it 9 times) morning and night, with your attention on the goal. Use one or two words at a time.</p></div>';
  /* remedies */
  h += '<div class="v4sec"><h2>Simple numerology remedies</h2></div><div class="v4card">' + a.missing.slice(0, 4).map(function (n) { return '<div class="v4row">' + v4chip('n', 'For ' + n) + '<p style="color:var(--ink)">' + esc(MISS_FIX[n]) + '.</p></div>'; }).join('') + (kid ? '<p class="v4note">For a child, keep it playful: colours and small habits, no fasting or name changes.</p>' : '') + '</div>';
  return h + '<div style="height:70px"></div>';
}
function mr_best(a) { return a.lucky.filter(function (n) { return NUM.rel(n, a.mul) >= 0 && NUM.rel(n, a.bha) >= 0; }); }
ACT.x3swAdd = function () { var p = curP(), g = (U.x3swg || '').trim(), w = (U.x3sww || '').trim(); if (!w) { toast('Type the word first'); return; } DB.switchw = DB.switchw || {}; (DB.switchw[p.id] = DB.switchw[p.id] || []).push({ g: g || 'My goal', w: w }); U.x3swg = U.x3sww = ''; save(); rerender(true); };
ACT.x3swDel = function (el) { var p = curP(); (DB.switchw[p.id] || []).splice(+el.dataset.i, 1); save(); rerender(true); };

/* ---------- 360° reading ---------- */
var AREAS360 = [['health', 'Health', [1, 6], 'life', ['cheeks', 'chin'], function (a) { return a.cnt[5] ? (a.planes[1].full ? 1 : 0) : -1; }, 'number 5 (balance)'],
  ['wealth', 'Wealth', [2, 11], 'sun', ['nose'], function (a) { return a.planes[2].full || a.planes[6].full ? 1 : a.cnt[8] ? 0 : -1; }, 'number 8 and the practical plane'],
  ['career', 'Career', [10], 'fate', ['forehead'], function (a) { return a.cnt[1] && a.planes[4].full ? 1 : a.cnt[1] ? 0 : -1; }, 'number 1 and the will plane'],
  ['marriage', 'Marriage', [7], 'heart', ['eyes', 'lips'], function (a) { return a.cnt[2] && a.cnt[6] ? 1 : a.cnt[2] || a.cnt[6] ? 0 : -1; }, 'numbers 2 and 6'],
  ['children', 'Children', [5], null, ['cheeks'], function (a) { return a.cnt[3] ? (a.cnt[3] > 1 ? 1 : 0) : -1; }, 'number 3'],
  ['longevity', 'Long life', [8, 1], 'life', ['ears', 'chin'], null, '']];
function x360(p) {
  var c = calcP(p), a = numOf(p), pd = (DB.palm || {})[p.id], fd = (DB.face || {})[p.id], kid = x3Kid(p), out = { areas: [], agree: 0, total: 0, diff: [], planets: [] };
  AREAS360.forEach(function (A) {
    if (kid && A[0] === 'marriage') return; if (kid && A[0] === 'children') return;
    var hs = A[2].map(function (h) { return BOOK.house(c, h, bkSb); }), kv = hs.reduce(function (s, x) { return s + x3v(x.v); }, 0) / hs.length, K = kv > 0.3 ? 1 : kv < -0.3 ? -1 : 0, votes = [{ s: 'K', v: K, t: 'Kundli: ' + hs.map(function (x) { return x.name.toLowerCase() + ' ' + x.word.toLowerCase(); }).join(', ') }];
    if (pd && A[3]) { var ln = palmLines(pd.r).filter(function (l) { return l.id === A[3]; })[0]; if (ln) votes.push({ s: 'P', v: ln.strength === 'strong' ? 1 : ln.strength === 'weak' ? -1 : 0, t: 'Palm: ' + PALM_LINES[A[3]][0].toLowerCase() + ' ' + (ln.strength || 'average') }); else if (A[3] === 'sun' || A[3] === 'fate') votes.push({ s: 'P', v: 0, t: 'Palm: no clear ' + PALM_LINES[A[3]][0].toLowerCase() }); }
    if (fd) { var fs = (fd.r.features || []).filter(function (f) { return A[4].indexOf(f.id) >= 0; }); if (fs.length) { var fv = fs.reduce(function (s, f) { return s + (f.strength === 'strong' ? 1 : f.strength === 'weak' ? -1 : 0); }, 0) / fs.length; votes.push({ s: 'F', v: fv > 0.3 ? 1 : fv < -0.3 ? -1 : 0, t: 'Face: ' + fs.map(function (f) { return FACE_N[f.id].toLowerCase() + ' ' + (f.strength || 'average'); }).join(', ') }); } }
    if (A[5]) { var nv = A[5](a); votes.push({ s: 'N', v: nv, t: 'Numbers: ' + A[6] + (nv > 0 ? ' strong' : nv < 0 ? ' missing' : ' present') }); }
    var sum = votes.reduce(function (s, v, i) { return s + v.v * (i === 0 ? 2 : 1); }, 0), w = votes.length + 1, score = Math.round(50 + sum / w * 38);
    var dir = score >= 58 ? 1 : score <= 42 ? -1 : 0, ag = votes.filter(function (v) { return v.v === dir || (dir === 0 && v.v === 0); }).length;
    out.agree += ag; out.total += votes.length;
    votes.forEach(function (v) { if (v.s !== 'K' && v.v === -K && K !== 0) out.diff.push({ area: A[1], t: votes[0].t + ', but ' + v.t.charAt(0).toLowerCase() + v.t.slice(1) }); });
    out.areas.push({ id: A[0], n: A[1], score: score, k: score >= 62 ? 'g' : score >= 45 ? 'm' : 'b', votes: votes, conf: ag / votes.length >= 0.75 && votes.length >= 3 ? 'high' : ag / votes.length >= 0.5 ? 'medium' : 'low' });
  });
  J.PC.forEach(function (x) {
    var jp = JUDGE.planet(c, x), s = jp.pct * 0.7, w = 0.7, src = ['K'];
    if (pd) { var mt = (pd.r.mounts || []).filter(function (m) { return MOUNT_PL[m.planet] === x; })[0]; if (mt) { s += (mt.state === 'raised' ? 82 : mt.state === 'flat' ? 25 : 55) * 0.2; w += 0.2; src.push('P'); } }
    var n = NUM.PL.indexOf(x), k = a.cnt[n]; s += (k > 1 ? 75 : k ? 60 : 35) * 0.1; w += 0.1; src.push('N');
    out.planets.push({ code: x, pct: Math.round(s / w), src: src });
  });
  out.pct = out.total ? Math.round(out.agree / out.total * 100) : 0;
  return out;
}
function x360events(p) {
  var c = calcP(p), a = numOf(p), now = new Date(), by = +p.date.slice(0, 4), out = [], pd = (DB.palm || {})[p.id];
  var marks = pd ? palmLines(pd.r).filter(function (l) { return l.ages && /\d/.test(l.ages); }).map(function (l) { var m = String(l.ages).match(/\d+/g).map(Number); return { line: PALM_LINES[l.id][0], from: by + m[0], to: by + (m[1] || m[0]), marks: l.marks }; }) : [];
  function py(y) { var d = p.date.split('-').map(Number); return NUM.red(d[1] + d[2] + String(y).split('').reduce(function (s, x) { return s + +x; }, 0)); }
  c.maha.forEach(function (md) { J.subPeriods(md).forEach(function (ad) {
    if (ad.end < now || ad.start > new Date(now.getTime() + 12 * 365.25 * 864e5)) return;
    var v = JUDGE.period(c, md.lord, ad.lord); if (v.word !== 'Very good' && v.word !== 'Careful') return;
    var y = ad.start.getFullYear(), pyn = py(y), PYn = PY_NATURE[pyn], src = ['Kundli: ' + PN[md.lord] + '–' + PN[ad.lord] + ' (' + v.word.toLowerCase() + ')'];
    var pyAgree = (v.v === 'g' && PYn[0] === 'g') || (v.v === 'b' && PYn[0] === 'b'); if (pyAgree) src.push('personal year ' + pyn + ' (' + PYn[1] + ')');
    if (v.v === 'b') marks.forEach(function (m) { if (m.from <= ad.end.getFullYear() && m.to >= y) src.push('palm: ' + m.line.toLowerCase() + ' shows ' + (m.marks || 'a mark') + ' around this age'); });
    out.push({ start: ad.start, end: ad.end, v: v.v, t: v.v === 'g' ? 'Rise and support' : 'Pressure and care', why: v.tip, src: src });
  }); });
  return out.slice(0, 8);
}
function R360Screen() {
  var p = curP(); if (!p) return topBar('360° reading', { noPerson: true }) + noPerson();
  var pd = (DB.palm || {})[p.id], fd = (DB.face || {})[p.id], X = x360(p), ev = x360events(p), n1 = p.name.split(' ')[0];
  var src = '<div class="x3src"><div><b>Kundli</b><small>Dasha, transits</small><span class="ok">✓</span></div>' + (pd ? '<div><b>Palm</b><small>' + N.dmy(new Date(pd.at)).slice(0, 6) + '</small><span class="ok">✓</span></div>' : '<button data-go="palm"><b>Palm</b><small>not added</small><span class="add">+ Add</span></button>') + (fd ? '<div><b>Face</b><small>' + N.dmy(new Date(fd.at)).slice(0, 6) + '</small><span class="ok">✓</span></div>' : '<button data-go="face"><b>Face</b><small>not added</small><span class="add">+ Add</span></button>') + '<div><b>Numbers</b><small>Lo Shu, name</small><span class="ok">✓</span></div></div>';
  var h = x3Head('360° reading', 'Kundli, palm, face and numbers, checked against each other', p, src + '<div class="x3big"><div><b>' + X.pct + '</b><small>% agreement</small></div><p>On ' + X.agree + ' of ' + X.total + ' points the methods say the same thing.' + (!pd || !fd ? ' Add ' + (!pd && !fd ? 'palm and face photos' : !pd ? 'a palm photo' : 'a face photo') + ' for a stronger check.' : '') + '</p></div>');
  h += '<div class="v4sec"><h2>Life areas</h2><span>K kundli · P palm · F face · N numbers</span></div><div class="v4card">' + X.areas.map(function (A) {
    var col = A.k === 'g' ? 'var(--good)' : A.k === 'b' ? 'var(--bad)' : 'var(--brass)';
    return '<details class="x3area"><summary><div><b>' + A.n + '</b><span class="x3vs">' + ['K', 'P', 'F', 'N'].map(function (s) { var v = A.votes.filter(function (x) { return x.s === s; })[0]; return '<i class="' + (!v ? 'na' : v.v > 0 ? 'g' : v.v < 0 ? 'b' : 'w') + '">' + s + '</i>'; }).join('') + '</span></div><span class="track"><i style="width:' + A.score + '%;background:' + col + '"></i></span><em style="color:' + col + '">' + A.score + '</em></summary>' +
      '<ul class="v4why">' + A.votes.map(function (v) { return '<li class="' + (v.v > 0 ? 'p' : v.v < 0 ? 'n' : 'z') + '"><i>' + (v.v > 0 ? '+' : v.v < 0 ? '−' : '•') + '</i><span>' + esc(v.t) + '</span></li>'; }).join('') + '</ul><p class="v4note">' + cap1(A.conf) + ' confidence: ' + A.votes.filter(function (v) { return (A.score >= 58 ? 1 : A.score <= 42 ? -1 : 0) === v.v; }).length + ' of ' + A.votes.length + ' methods agree.</p></details>'; }).join('') + '</div>';
  h += '<div class="v4sec"><h2>Planet strength</h2><span>chart' + (pd ? ', palm mounts' : '') + ', numbers</span></div><div class="v4card"><div class="x3pg">' + X.planets.map(function (x) { var col = x.pct >= 60 ? 'var(--good)' : x.pct >= 45 ? 'var(--brass)' : '#E79B92'; return '<div><i><b style="height:' + x.pct + '%;background:' + col + '"></b></i>' + x.code + '<small>' + x.pct + '</small></div>'; }).join('') + '</div></div>';
  if (X.diff.length) h += '<div class="v4sec"><h2>Where they disagree</h2></div><div class="v4card">' + X.diff.slice(0, 4).map(function (d) { return '<div class="v4row">' + v4chip('w', 'Check') + '<div><b>' + d.area + '</b><p>' + esc(d.t) + '. Treat this area as "possible with effort", not a firm verdict.</p></div></div>'; }).join('') + '</div>';
  if (ev.length) h += '<div class="v4sec"><h2>Life events ahead</h2><span>where the methods meet</span></div><div class="v4card"><div class="x3tl">' + ev.map(function (e) { return '<div class="' + (e.v === 'g' ? 'tg' : 'tb') + '"><small>' + N.dmy(e.start).slice(3) + ' – ' + N.dmy(e.end).slice(3) + '</small><b>' + e.t + (e.src.length > 1 ? ' <span class="x3m">' + e.src.length + ' methods</span>' : '') + '</b><p>' + esc(e.src.join(' · ')) + '</p></div>'; }).join('') + '</div></div>';
  h += '<button class="v4btn" data-act="x3save">Save full report</button><button class="v4btn out" data-act="x3wa">Share summary on WhatsApp</button>';
  return h + '<p class="v4note" style="margin:0 20px">The agreement score shows how far traditional methods agree with each other. It is a confidence guide, not a guarantee of events.</p><div style="height:70px"></div>';
}
function x360text(p) {
  var X = x360(p), a = numOf(p), ev = x360events(p);
  return '*360° reading · ' + p.name + '*\nAgreement: ' + X.pct + '% (' + X.agree + ' of ' + X.total + ' points)\n\n' + X.areas.map(function (A) { return '• ' + A.n + ': ' + A.score + '/100 (' + A.conf + ' confidence)'; }).join('\n') +
    '\n\n*Numbers:* Mulank ' + a.mul + ', Bhagyank ' + a.bha + ', lucky ' + a.lucky.join(', ') + '\n' + (ev.length ? '\n*Ahead:*\n' + ev.slice(0, 4).map(function (e) { return '• ' + N.dmy(e.start).slice(3) + ' – ' + N.dmy(e.end).slice(3) + ': ' + e.t; }).join('\n') + '\n' : '') + '\n_A confidence guide, not a guarantee. Trikaal_';
}
ACT.x3wa = function () { var p = curP(); waSend(x360text(p), relOf(p) !== 'me' ? p.phone || '' : ''); };
ACT.x3save = function () {
  var p = curP(), html = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>360 reading ' + esc(p.name) + '</title><style>body{font-family:sans-serif;max-width:720px;margin:24px auto;padding:0 16px;color:#1E1D2B}h1{font-size:24px}pre{white-space:pre-wrap;font:15px/1.5 sans-serif}</style></head><body><h1>360° reading: ' + esc(p.name) + '</h1><pre>' + esc(x360text(p).replace(/\*/g, '').replace(/_/g, '')) + '</pre><p>Open in Chrome and use Share › Print to save as PDF.</p></body></html>';
  var nm = '360-' + p.name.replace(/\W+/g, '-') + '.html';
  try { if (AND && AND.saveToDownloads) { var r = AND.saveToDownloads(nm, html); toast(/^ok/.test(r) ? 'Saved to Download/Trikaal/' + nm : 'Could not save: ' + r, 3500); return; } } catch (e) { }
  var b = new Blob([html], { type: 'text/html' }), u = URL.createObjectURL(b), l = document.createElement('a'); l.href = u; l.download = nm; l.click();
};

/* ---------- hooks: routes, Kundli tiles, Today, AI ---------- */
(function () {
  var r0 = render; render = function () {
    var pr = parts(), S = { palm: PalmScreen, face: FaceScreen, num: NumScreen, r360: R360Screen }[pr[0]];
    if (!S) return r0();
    applySettings(); var html; try { html = S(); } catch (e) { html = '<div class="empty"><h2>Something went wrong</h2>' + esc(e.message) + '<br><br><button class="btn" data-go="astro">Open Kundli</button></div>'; if (window.console) console.error(e); }
    $('#app').innerHTML = html; $('#nav').innerHTML = NAVS.map(function (x) { return '<button data-go="' + x[0] + '" class="' + (x[0] === 'astro' ? 'on' : '') + '">' + icon(x[0]) + x[1] + '</button>'; }).join('');
    document.body.setAttribute('data-scr', pr[0]); try { addAiButtons(); } catch (e) { } window.scrollTo(0, U.keepY || 0);
  };
  var a0 = AstroV2; AstroV2 = function (id) {
    var h = a0(id), i = h.indexOf('<div class="v4tiles">'); if (i < 0) return h;
    return h.slice(0, i) + '<button class="v4card x3promo" data-go="r360"><span class="gl">' + v4i('r360') + '</span><div><b>360° reading</b><small>Kundli, palm, face and numbers checked against each other</small></div><span class="ar">›</span></button><div class="v4tiles">' + [['palm', 'hand', 'Palm'], ['face', 'face', 'Face'], ['num', 'hash', 'Numerology']].map(function (t) { return '<button data-go="' + t[0] + '">' + v4i(t[1]) + t[2] + '</button>'; }).join('') + '</div>' + h.slice(i);
  };
  var tv = TodayV4; TodayV4 = function () {
    var h = tv(), p = curP(); if (!p) return h;
    try { var a = numOf(p), L = DB.settings.loc, pl = J.panchangLite(todayStart(U.dayOff || 0), L.lat, L.lon), wd = new Date(pl.rise.getTime() + locOff() * 3600e3).getUTCDay(), w = NUM.wear(a, wd);
      var x = '<button class="v4card x3wear" data-go="num"><span class="x3sw" style="background:' + w.hex + '"></span><div><b>Wear ' + w.names.join(' or ') + '</b><small>Lucky numbers ' + a.lucky.slice(0, 4).join(', ') + (w.avoid.length ? ' · avoid ' + w.avoid.slice(0, 2).join(', ').toLowerCase() : '') + '</small></div><span class="ar">›</span></button>';
      var i = h.indexOf('<div class="v4two">'); return i < 0 ? h : h.slice(0, i) + x + h.slice(i);
    } catch (e) { return h; }
  };
  var ff = fixedFacts; fixedFacts = function (p, c) {
    var s = ff(p, c); try { var a = numOf(p); s += 'NUMEROLOGY (Chaldean name, Lo Shu grid): Mulank ' + a.mul + ', Bhagyank ' + a.bha + ', name ' + a.name.compound + '/' + a.name.single + (a.nameOk ? ' (suits)' : ' (does not fully suit)') + ', Kua ' + a.kua + ', personal year ' + a.py + '; missing ' + (a.missing.join(', ') || 'none') + '; repeated ' + (a.repeat.join(', ') || 'none') + '; lucky ' + a.lucky.join(', ') + '; avoid ' + (a.avoid.join(', ') || 'none') + '.\n';
      var pd = (DB.palm || {})[p.id], fd = (DB.face || {})[p.id];
      if (pd) s += 'PALM (read from photo): ' + (pd.r.summary || '') + ' Lines: ' + palmLines(pd.r).map(function (l) { return l.id + ' ' + l.strength + (l.marks && !/^none/i.test(l.marks) ? ' (' + l.marks + (l.ages ? ', age ' + l.ages : '') + ')' : ''); }).join('; ') + '.\n';
      if (fd) s += 'FACE (read from photo): ' + (fd.r.type || '') + '. ' + (fd.r.features || []).map(function (f) { return f.id + ' ' + f.strength; }).join(', ') + '.\n';
      var X = x360(p); s += '360 AGREEMENT: ' + X.pct + '% across methods; ' + X.areas.map(function (A) { return A.n + ' ' + A.score + ' (' + A.conf + ')'; }).join(', ') + '. When the methods disagree, say so and treat it as low confidence.\n';
    } catch (e) { }
    return s;
  };
})();
INP.x3mob = function (el) { U.x3mob = el.value; var d = el.value.replace(/\D/g, ''); if (d.length >= 10 || d.length === 0) { var st = el.selectionStart; rerender(true); var n = document.querySelector('[data-in="x3mob"]'); if (n) { n.focus(); try { n.setSelectionRange(st, st); } catch (e) { } } } };
INP.x3swg = function (el) { U.x3swg = el.value; };
INP.x3sww = function (el) { U.x3sww = el.value; };
