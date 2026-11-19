/* Trikaal 6: the app calculates, the AI interprets.
   The app keeps only exact calculations (birth chart, all divisional charts, dashas, transits, Ashtakavarga, Shadbala).
   Every question to the AI carries the full chart pack, so the AI reads real data and never works out positions itself.
   AI: Gemini (default model gemini-3.1-pro-preview, thinking high) or Claude, with the user's own key kept on the phone. */

/* ---------- 1. the chart pack: data only, no interpretation ---------- */
var LT_PN = { Su: 'Sun', Mo: 'Moon', Ma: 'Mars', Me: 'Mercury', Ju: 'Jupiter', Ve: 'Venus', Sa: 'Saturn', Ra: 'Rahu', Ke: 'Ketu' };
function ltNth(n) { var s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }
function ltD(d) { return d.toISOString().slice(0, 10); }
function ltAge(p) { try { var b = calcP(p).birth, now = new Date(); return Math.floor((now - b) / (365.2425 * 864e5)); } catch (e) { return null; } }
function packOf(p) {
  var c = calcP(p), k = c.k, P = k.P, A = k.ascSign, SG = J.SIGNS, now = new Date(), L = [], ag = ltAge(p);
  var stage = ag == null ? '' : ag < 13 ? 'child' : ag < 18 ? 'teenager' : ag < 60 ? 'adult' : 'senior';
  L.push('=== PERSON ===');
  L.push('Name: ' + p.name + '. Gender: ' + (p.gender === 'F' ? 'female' : p.gender === 'M' ? 'male' : 'not given') + '. Age: ' + ag + ' years (' + stage + ').');
  L.push('Born: ' + p.date + ' at ' + p.time + ' (UTC' + (p.tz >= 0 ? '+' : '') + p.tz + '), ' + (p.place || '') + ' lat ' + (+p.lat).toFixed(3) + ', lon ' + (+p.lon).toFixed(3) + '. Ayanamsa: ' + (DB.settings.ayan === 'kp' ? 'KP' : 'Lahiri') + '. Today: ' + ltD(now) + '.');
  try { var pb = J.panchangLite(new Date(c.birth.getTime() - 6 * 3600e3), +p.lat, +p.lon); L.push('Birth panchang (at sunrise of birth day): tithi ' + (pb.tithi.name || pb.tithi) + ', nakshatra ' + pb.nak.name + ', yoga ' + (pb.yoga.name || pb.yoga) + ', weekday ' + J.VARAS[new Date(c.birth.getTime() + p.tz * 3600e3).getUTCDay()] + '.'); } catch (e) { }
  L.push('', '=== D1 RASHI (whole-sign houses from lagna) ===');
  L.push('Lagna: ' + SG[A] + ' ' + k.ascDegs + ', nakshatra ' + k.ascNak.name + ' pada ' + k.ascNak.pada + (k.ascKP ? ', star lord ' + k.ascKP.star + ', sub lord ' + k.ascKP.sub : '') + '.');
  k.planets.forEach(function (q) {
    L.push(LT_PN[q.code] + ': ' + SG[q.sign] + ' ' + q.degs + ', house ' + q.house + ' (bhava chalit ' + q.bhava + '), nakshatra ' + q.nak.name + ' pada ' + q.nak.pada + ' (star lord ' + LT_PN[q.nak.lord] + ')' + (q.kp && q.kp.sub ? ', KP sub lord ' + q.kp.sub : '') + ', dignity ' + (q.dignity || '-') + (q.retro && q.code !== 'Ra' && q.code !== 'Ke' ? ', retrograde' : '') + (q.combust ? ', combust' : '') + ', aspects houses ' + J.aspectedHouses(q.code, q.house).join(', ') + '.');
  });
  L.push('', 'Houses:');
  for (var h = 1; h <= 12; h++) { var sg = (A + h - 1) % 12, lord = J.RULER[sg], occ = k.planets.filter(function (q) { return q.house === h; }).map(function (q) { return LT_PN[q.code]; }), asp = k.planets.filter(function (q) { return J.aspectedHouses(q.code, q.house).indexOf(h) >= 0; }).map(function (q) { return LT_PN[q.code]; });
    L.push(ltNth(h) + ' house ' + SG[sg] + ': lord ' + LT_PN[lord] + ' in ' + ltNth(P[lord].house) + ' (' + SG[P[lord].sign] + '); occupants ' + (occ.join(', ') || 'none') + '; aspected by ' + (asp.join(', ') || 'none') + (c.av ? '; Ashtakavarga ' + c.av.sav[sg] + ' bindus' : '') + '.'); }
  try { var fn = c.func; L.push('', 'Functional nature for ' + SG[A] + ' lagna (classical): ' + J.P7.map(function (x) { return LT_PN[x] + ' ' + fn[x].kind + ' (rules ' + fn[x].houses.join(', ') + ')' + (fn[x].maraka ? ' maraka' : ''); }).join('; ') + '.'); } catch (e) { }
  L.push('', '=== DIVISIONAL CHARTS (sign of lagna and each planet; dignity in that chart) ===');
  J.VARGAS.forEach(function (v) { if (v[0] === 1) return; var n = v[0], la = J.varga(k.asc, n);
    L.push('D' + n + ' ' + v[1] + ' (' + v[2] + '): Lagna ' + SG[la.sign] + '; ' + k.planets.map(function (q) { var x = J.varga(q.lon, n), dg = q.code === 'Ra' || q.code === 'Ke' ? '' : J.dignity(q.code, x.sign * 30 + x.deg); return LT_PN[q.code] + ' ' + SG[x.sign] + ' (h' + J.houseFrom(la.sign, x.sign) + (dg && !/Neutral|Friendly|Enemy/.test(dg) ? ', ' + dg.toLowerCase().replace('moolatrikona', 'own sign') : '') + ')'; }).join(', ') + '.'); });
  try { L.push('D60 deities: ' + k.planets.map(function (q) { var d = J.d60Deity(q.lon); return LT_PN[q.code] + ' ' + d.name + (d.benefic ? ' (benefic)' : ' (malefic)'); }).join(', ') + '.'); } catch (e) { }
  L.push('Chandra lagna (houses from Moon): ' + k.planets.map(function (q) { return LT_PN[q.code] + ' ' + J.houseFrom(P.Mo.sign, q.sign); }).join(', ') + '. Surya lagna (from Sun): ' + k.planets.map(function (q) { return LT_PN[q.code] + ' ' + J.houseFrom(P.Su.sign, q.sign); }).join(', ') + '.');
  if (c.av) { L.push('', '=== ASHTAKAVARGA (bindus by house 1 to 12) ===', 'SAV: ' + [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(function (hh) { return c.av.sav[(A + hh - 1) % 12]; }).join(' ') + ' (total 337).');
    J.P7.forEach(function (x) { if (c.av.bav && c.av.bav[x]) L.push('BAV ' + LT_PN[x] + ': ' + [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(function (hh) { return c.av.bav[x][(A + hh - 1) % 12]; }).join(' ')); }); }
  try { var sb = sbOf(c); L.push('', '=== SHADBALA (rupas, required, ratio, rank) ===', J.P7.map(function (x) { var s = sb.P[x]; return LT_PN[x] + ' ' + s.rupa.toFixed(2) + '/' + s.req + ' = ' + s.ratio.toFixed(2) + ' (#' + s.rank + ')'; }).join('; ') + '.'); } catch (e) { }
  try { var ys = (c.yogas || []).map(function (y) { return y.name + (y.why ? ' [' + y.why + ']' : ''); }); if (ys.length) L.push('', '=== YOGAS DETECTED BY RULE (verify before using) ===', ys.join('; ') + '.'); } catch (e) { }
  /* dashas */
  L.push('', '=== VIMSHOTTARI DASHA (Moon nakshatra ' + P.Mo.nak.name + ') ===');
  c.maha.forEach(function (m) { L.push(LT_PN[m.lord] + ' Mahadasha ' + ltD(m.start) + ' to ' + ltD(m.end) + (m.start <= now && now < m.end ? '  <= RUNNING' : '')); });
  var md = J.find(c.maha, now);
  if (md) { var subs = J.subPeriods(md), ad = J.find(subs, now);
    L.push('Antardashas in the running ' + LT_PN[md.lord] + ' Mahadasha: ' + subs.map(function (a) { return LT_PN[a.lord] + ' ' + ltD(a.start) + '–' + ltD(a.end) + (a === ad ? ' (RUNNING)' : ''); }).join('; ') + '.');
    var nmd = c.maha[c.maha.indexOf(md) + 1]; if (nmd) L.push('Antardashas in the next Mahadasha (' + LT_PN[nmd.lord] + '): ' + J.subPeriods(nmd).map(function (a) { return LT_PN[a.lord] + ' ' + ltD(a.start) + '–' + ltD(a.end); }).join('; ') + '.');
    if (ad) { var pds = J.subPeriods(ad), pd = J.find(pds, now); L.push('Pratyantar dashas in the running ' + LT_PN[md.lord] + '–' + LT_PN[ad.lord] + ': ' + pds.map(function (x) { return LT_PN[x.lord] + ' ' + ltD(x.start) + '–' + ltD(x.end) + (x === pd ? ' (RUNNING)' : ''); }).join('; ') + '.'); } }
  try { var yg = J.find(c.yog, now); if (yg) L.push('Yogini dasha running: ' + yg.name + ' (' + LT_PN[yg.lord] + ') ' + ltD(yg.start) + ' to ' + ltD(yg.end) + '.'); } catch (e) { }
  /* transits */
  L.push('', '=== TRANSITS ON ' + ltD(now) + ' (Lahiri sidereal) ===');
  C.BODIES.forEach(function (x) { var lon = C.sidereal(x, now), sg = Math.floor(((lon % 360) + 360) % 360 / 30), sp = x === 'Ra' || x === 'Ke' ? -1 : C.speed(x, now);
    L.push(LT_PN[x] + ' ' + SG[sg] + ' ' + J.dms(lon, true) + (sp < 0 && x !== 'Ra' && x !== 'Ke' ? ' retrograde' : '') + ', nakshatra ' + J.nakInfo(lon).name + ': ' + ltNth(J.houseFrom(A, sg)) + ' from lagna, ' + ltNth(J.houseFrom(P.Mo.sign, sg)) + ' from Moon' + (c.av ? ', SAV ' + c.av.sav[sg] : '') + (c.av && c.av.bav && c.av.bav[x] ? ', own BAV ' + c.av.bav[x][sg] : '') + '.'); });
  var saM = J.houseFrom(P.Mo.sign, Math.floor(((C.sidereal('Sa', now) % 360) + 360) % 360 / 30)); L.push('Saturn from natal Moon: ' + ltNth(saM) + (saM === 12 || saM === 1 || saM === 2 ? ' (Sade Sati running)' : saM === 8 ? ' (Ashtama Shani)' : saM === 4 ? ' (Kantaka Shani)' : '') + '.');
  try { var evs = J.events(now, new Date(now.getTime() + 365 * 864e5), ['Su', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra']).slice(0, 60); L.push('Next 12 months: ' + evs.map(function (e) { return ltD(e.t) + ' ' + LT_PN[e.code] + (e.type === 'ingress' ? ' enters ' + SG[e.sign] + ' (' + ltNth(J.houseFrom(A, e.sign)) + ' from lagna, ' + ltNth(J.houseFrom(P.Mo.sign, e.sign)) + ' from Moon)' : ' turns ' + e.type); }).join('; ') + '.'); } catch (e) { }
  if (p.note) L.push('', 'NOTES FROM THE ASTROLOGER: ' + p.note);
  return L.join('\n');
}

/* ---------- 2. the AI ---------- */
var LT_MODELS = [['gemini-3.1-pro-preview', 'Gemini 3.1 Pro (best)'], ['gemini-3-flash-preview', 'Gemini 3 Flash (faster, cheaper)']];
function ltSys(p) {
  var ag = ltAge(p);
  return ['You are an expert Vedic astrologer (Parashari, Lahiri ayanamsa; use KP only when the user asks for KP). The user is a practising astrologer who reads charts for family and clients.',
    'The CHART PACK below is calculated exactly by the app. Use only these positions, divisional charts, dashas and transit dates. Never recalculate or invent a position, date or dasha.',
    'Read like a careful senior astrologer: judge every matter from D1 first, confirm with the right divisional chart (D9 marriage and inner strength, D10 career, D2 wealth, D4 property, D7 children, D12 parents, D24 education, D6 and D30 health and troubles, D60 overall karma), then time it with the running Mahadasha, Antardasha and Pratyantar, and confirm with transits (Saturn and Jupiter double transit, Ashtakavarga bindus of the transited sign).',
    'Only call something likely when D1, the relevant divisional chart and the dasha agree; when they disagree, say so and lower the confidence. Higher vargas (D30, D40, D45, D60) need an exact birth time; mention this when your answer leans on them.',
    'Answer format: start with the bottom line in one or two sentences. Then the reasoning in plain, simple language with the chart factors named (house, sign, planet, varga, dasha). Give timing as date windows from the pack. Give a clear confidence (high, medium or low). End with practical guidance and simple remedies (mantra, charity, routine) only where they fit; never push costly gemstones or rituals.',
    'Be honest: give the real picture with its cautions, but never use fear. No guaranteed outcomes. On health, never diagnose; describe body areas and periods that need care, and say a doctor decides.',
    ag != null && ag < 18 ? 'This person is a ' + ag + '-year-old child. Speak to the parent. Talk about nature, talents, studies, care and safety. Do not name adult diseases, mental-health conditions or adult life events (marriage, career) unless the parent asks directly.' : '',
    'Reply in the language the user writes in. Keep it readable on a phone: short paragraphs, a few bullet points where they help.'].filter(Boolean).join('\n');
}
function ltHist(p) { DB.ai2 = DB.ai2 || {}; return (DB.ai2[p.id] = DB.ai2[p.id] || []); }
function ltBody(p, q, snake) {
  var hist = ltHist(p).filter(function (m) { return m.t && !m.err; }).slice(-16), contents = hist.map(function (m) { return { role: m.r, parts: m.r === 'model' && m.sig ? [{ text: m.t, thoughtSignature: m.sig }] : [{ text: m.t }] }; });
  contents.push({ role: 'user', parts: [{ text: q }] });
  var sys = { parts: [{ text: ltSys(p) + '\n\n=== CHART PACK ===\n' + packOf(p) }] }, b = { contents: contents };
  b[snake ? 'system_instruction' : 'systemInstruction'] = sys;
  if (!snake) b.generationConfig = { thinkingConfig: { thinkingLevel: DB.settings.lthink || 'high', includeThoughts: true } };
  return b;
}
function ltGemini(p, q, on) {
  var key = DB.settings.gkey, model = DB.settings.lmodel || LT_MODELS[0][0], acc = '', sig = '', last = Date.now(), dead = false, wd, fin = '';
  var H = { 'content-type': 'application/json', 'x-goog-api-key': key };
  var slow = new Promise(function (res, rej) { wd = setInterval(function () { if (Date.now() - last > 170000) { dead = true; clearInterval(wd); rej(new Error('Gemini took too long. Try again, or switch to Gemini 3 Flash in Settings.')); } }, 1000); });
  var main = httpStream(GBASE + 'models/' + encodeURIComponent(model) + ':streamGenerateContent?alt=sse', H, JSON.stringify(ltBody(p, q)), function (data) {
    if (dead) return; var j; try { j = JSON.parse(data); } catch (e) { return; } last = Date.now();
    if (Array.isArray(j)) j = j[0] || {};
    if (j.error) { fin = 'error: ' + j.error.message; return; }
    (j.candidates || []).forEach(function (cd) { if (cd.finishReason) fin = cd.finishReason; ((cd.content && cd.content.parts) || []).forEach(function (pt) {
      if (pt.thoughtSignature) sig = pt.thoughtSignature;
      if (!pt.text) return; if (pt.thought) on('thought', pt.text); else { acc += pt.text; on('text', acc); } }); });
  }).then(function (r) {
    clearInterval(wd); if (dead) return new Promise(function () { });
    if (r.status !== 200) { var d; try { d = JSON.parse(r.text); if (Array.isArray(d)) d = d[0]; } catch (e) { d = {}; } var m = (d.error && d.error.message) || ('HTTP ' + r.status);
      throw new Error(/API key not valid|API_KEY_INVALID/i.test(m) ? 'The Gemini key is not valid. Check it in Settings.' : r.status === 429 ? 'Gemini quota or rate limit reached. Wait a minute, or check billing in Google AI Studio.' : r.status === 404 ? 'Model ' + model + ' was not found. Pick another model in Settings.' : 'Gemini: ' + m); }
    if (!acc) throw new Error(/SAFETY|error/.test(fin) ? 'Gemini did not answer (' + fin + ').' : 'Gemini sent an empty answer. Try again.');
    return { t: acc, sig: sig, via: 'Gemini · ' + model };
  }, function (e) { clearInterval(wd); throw e; });
  return Promise.race([main, slow]);
}
function ltClaude(p, q, on) {
  G_ON = function (k, t) { if (k === 'text') on('text', t); };
  return claudeCall(JSON.stringify(ltBody(p, q, true))).then(function (d) { G_ON = null; var t = d.candidates[0].content.parts[0].text; if (!t) throw new Error('Claude sent an empty answer.'); return { t: t, via: 'Claude · ' + (DB.settings.cmodel || CMODELS[0][0]) }; }, function (e) { G_ON = null; throw e; });
}
function ltProv() { var s = DB.settings; return s.lprov === 'claude' && s.ckey ? 'claude' : s.gkey ? 'gemini' : s.ckey ? 'claude' : ''; }

/* ---------- 3. screens ---------- */
function ltHead(p, sub, right) {
  return '<div class="v4sky slim">' + v4stars(40, 7) + '<div class="v4top"><div class="dt"><b class="nm">' + esc(p.name) + '</b><small>' + sub + '</small></div><span class="sp"></span>' + (right || '') + '<button class="v4pill" data-act="pickPerson">' + esc(p.name.split(' ')[0]) + ' ▾</button><button class="v4gear" data-go="more" aria-label="Settings">' + icon('gear', 18) + '</button></div>';
}
var LT_CH = [['D1', 'D1 Rashi'], ['CH', 'Chalit'], ['MO', 'Moon'], ['SU', 'Sun']].concat(J.VARGAS.filter(function (v) { return v[0] > 1; }).map(function (v) { return ['D' + v[0], 'D' + v[0] + ' ' + v[1]]; }));
function LiteKundli() {
  var p = curP(); if (!p) return noPerson();
  var c = calcP(p), k = c.k, now = new Date(), id = U.lch || 'D1', style = U.style || DB.settings.style, m = chartModel(c, id);
  var h = ltHead(p, SG[k.ascSign] + ' lagna · ' + SG[k.P.Mo.sign] + ' Moon · ' + esc(k.P.Mo.nak.name));
  h += '<div class="v4skych">' + drawChart(m, style) + '</div><div class="v4cap"><span>' + esc(m.title) + (m.sub ? ' · ' + esc(m.sub) : '') + '</span><button data-act="cstyle" data-v="' + (style === 'south' ? 'north' : 'south') + '">' + (style === 'south' ? 'North style' : 'South style') + '</button></div>';
  h += '<div class="v4cchips lt">' + LT_CH.map(function (x) { return '<button data-act="ltCh" data-v="' + x[0] + '" class="' + (x[0] === id ? 'on' : '') + '">' + x[1] + '</button>'; }).join('') + '</div></div>';
  /* running dasha, dates only */
  var md = J.find(c.maha, now), ad = md ? J.find(J.subPeriods(md), now) : null, pd = ad ? J.find(J.subPeriods(ad), now) : null;
  if (md) h += '<div class="v4card" style="margin-top:14px"><button class="v4row tap" data-go="dasha"><div style="flex:1"><p>Dasha running now</p><b class="big">' + LT_PN[md.lord] + (ad ? ' › ' + LT_PN[ad.lord] : '') + (pd ? ' › ' + LT_PN[pd.lord] : '') + '</b><p>' + LT_PN[md.lord] + ' till ' + N.dmy(md.end) + (ad ? ' · ' + LT_PN[ad.lord] + ' till ' + N.dmy(ad.end) : '') + (pd ? ' · ' + LT_PN[pd.lord] + ' till ' + N.dmy(pd.end) : '') + '</p></div><span class="ar">›</span></button></div>';
  h += '<button class="v4card ltask" data-go="ai"><span class="gl">' + icon('ai', 22) + '</span><div><b>Ask about ' + esc(p.name.split(' ')[0]) + '\'s chart</b><small>' + (ltProv() === 'claude' ? 'Claude' : 'Gemini') + ' reads all ' + (J.VARGAS.length + 3) + ' charts, dashas and transits</small></div><span class="ar">›</span></button>';
  /* planet table for the selected chart */
  var vn = /^D\d+$/.test(id) ? +id.slice(1) : 1, la = J.varga(k.asc, vn);
  h += '<div class="v4sec"><h2>Planets' + (vn > 1 ? ' in D' + vn : '') + '</h2></div><div class="pad" style="padding-top:0"><div class="card" style="padding:6px 10px"><div class="tw"><table class="lttab"><tr><th></th><th>Sign</th><th>Deg</th><th>Nakshatra</th><th>H</th><th></th></tr>' +
    '<tr><td><b>Asc</b></td><td>' + J.SG3[vn > 1 ? la.sign : k.ascSign] + '</td><td class="mono">' + (vn > 1 ? J.dm(la.deg) : k.ascDegs) + '</td><td>' + (vn > 1 ? '' : k.ascNak.name + ' ' + k.ascNak.pada) + '</td><td>1</td><td></td></tr>' +
    k.planets.map(function (q) { var x = vn > 1 ? J.varga(q.lon, vn) : { sign: q.sign, deg: q.lon % 30 }, dg = q.code === 'Ra' || q.code === 'Ke' ? '' : J.dignity(q.code, x.sign * 30 + x.deg), hh = id === 'CH' ? q.bhava : J.houseFrom(vn > 1 ? la.sign : k.ascSign, x.sign);
      return '<tr><td><b>' + q.code + '</b>' + (q.retro && q.code !== 'Ra' && q.code !== 'Ke' ? '<span class="r">R</span>' : '') + (q.combust ? '<span class="r" style="color:var(--warn)">C</span>' : '') + '</td><td>' + J.SG3[x.sign] + '</td><td class="mono">' + (vn > 1 ? J.dm(x.deg) : q.degs) + '</td><td>' + (vn > 1 ? '' : q.nak.name + ' ' + q.nak.pada) + '</td><td>' + hh + '</td><td class="sm">' + (/Exalted|Debilitated|Own|Moola/.test(dg || '') ? dg.replace('Moolatrikona', 'Moola').replace(' sign', '') : '') + '</td></tr>'; }).join('') + '</table></div></div></div>';
  h += '<div class="v4tiles v5t4"><button data-go="dasha">' + v4i('bars') + 'Dasha dates</button><button data-go="sky">' + v4i('sun') + 'Sky now</button></div>';
  return h + '<div style="height:70px"></div>';
}
function LiteDasha() {
  var p = curP(); if (!p) return noPerson();
  var c = calcP(p), now = new Date(), open = U.ltMd != null ? U.ltMd : c.maha.indexOf(J.find(c.maha, now));
  var h = ltHead(p, 'Vimshottari dasha · dates only') + '</div><div class="pad">';
  c.maha.forEach(function (m, i) { var run = m.start <= now && now < m.end;
    h += '<div class="card ltmd' + (run ? ' run' : '') + '"><button class="ltmdh" data-act="ltMd" data-v="' + i + '"><b>' + LT_PN[m.lord] + ' Mahadasha</b><span>' + N.dmy(m.start) + ' – ' + N.dmy(m.end) + (run ? ' · now' : '') + '</span></button>';
    if (i === open) h += '<div class="ltad">' + J.subPeriods(m).map(function (a) { var r2 = a.start <= now && now < a.end; return '<div class="' + (r2 ? 'run' : '') + '"><span>' + LT_PN[m.lord] + ' › ' + LT_PN[a.lord] + '</span><span>' + N.dmy(a.start) + ' – ' + N.dmy(a.end) + '</span></div>'; }).join('') + '</div>';
    h += '</div>'; });
  return h + '<button class="v4btn" data-act="ltAskQ" data-q="Read my dasha periods: which ones are strongest and which need care, with dates and reasons.">Ask AI about these periods</button></div><div style="height:70px"></div>';
}
function LiteSky() {
  var p = curP(); if (!p) return noPerson();
  var c = calcP(p), k = c.k, now = new Date(), SG = J.SIGNS;
  var h = ltHead(p, 'Planets today, from ' + esc(p.name.split(' ')[0]) + '\'s lagna and Moon') + '</div><div class="pad"><div class="card" style="padding:6px 10px"><div class="tw"><table class="lttab"><tr><th></th><th>Sign</th><th>Deg</th><th>Nakshatra</th><th>From lagna</th><th>From Moon</th></tr>' +
    C.BODIES.map(function (x) { var lon = C.sidereal(x, now), sg = Math.floor(((lon % 360) + 360) % 360 / 30), sp = x === 'Ra' || x === 'Ke' ? -1 : C.speed(x, now); return '<tr><td><b>' + x + '</b>' + (sp < 0 && x !== 'Ra' && x !== 'Ke' ? '<span class="r">R</span>' : '') + '</td><td>' + J.SG3[sg] + '</td><td class="mono">' + J.dm(lon % 30) + '</td><td>' + J.nakInfo(lon).name + '</td><td>' + J.houseFrom(k.ascSign, sg) + '</td><td>' + J.houseFrom(k.P.Mo.sign, sg) + '</td></tr>'; }).join('') + '</table></div></div>';
  var evs = []; try { evs = J.events(now, new Date(now.getTime() + 183 * 864e5), ['Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra']); } catch (e) { }
  if (evs.length) h += '<div class="card"><h3 style="margin:2px 0 8px;font:600 16px var(--sans)">Next 6 months</h3>' + evs.slice(0, 24).map(function (e) { return '<div class="alline"><b>' + N.dmy(e.t) + '</b><span>' + LT_PN[e.code] + (e.type === 'ingress' ? ' enters ' + SG[e.sign] + ' (' + ltNth(J.houseFrom(k.ascSign, e.sign)) + ' house)' : ' turns ' + e.type) + '</span></div>'; }).join('') + '</div>';
  return h + '<button class="v4btn" data-act="ltAskQ" data-q="How do the current transits affect me now and over the next 6 months? Give dates.">Ask AI about the transits</button></div><div style="height:70px"></div>';
}
function ltSugg(p) {
  var ag = ltAge(p);
  return ag != null && ag < 18 ? ['Read this child\'s chart: nature and talents', 'Studies: strengths, and when to push', 'Health and care to keep in mind', 'The next 2 years for this child', 'Simple remedies for this child']
    : ['Read the whole chart, briefly', 'Career and money: next 2 years', 'Health: areas and periods to take care', 'Marriage and relationships', 'This month: what to do and avoid', 'Simple remedies for this chart'];
}
function LiteAsk() {
  var p = curP(); if (!p) return noPerson();
  var pv = ltProv(), hist = ltHist(p);
  var h = ltHead(p, pv ? (pv === 'claude' ? 'Claude' : 'Gemini · ' + esc((DB.settings.lmodel || LT_MODELS[0][0]))) + ' · reads the full chart pack' : 'Connect an AI to ask', '') + '</div>';
  if (!pv) {
    h += '<div class="pad"><div class="card"><h3 style="margin:0 0 6px">Connect Gemini</h3><p class="sm">Get a free key at <b>aistudio.google.com/apikey</b> (Google account → Create API key) and paste it here. The key stays on this phone.</p><input class="inp mono" type="password" data-in="ltGkey" placeholder="AIza..." autocomplete="off"><button class="v4btn" data-act="ltSaveKey" style="margin-top:10px">Save key</button><p class="sm" style="margin-top:10px">Or use Claude: add a Claude key in Settings.</p></div>' +
      '<div class="card"><b>No key? Share the chart to the Gemini app</b><p class="sm">Sends the full chart pack (all charts, dashas, transits) to any app, such as Gemini, where you can ask your question.</p><button class="v4btn sec" data-act="ltShare">Share full chart pack</button></div></div>';
    return h + '<div style="height:70px"></div>';
  }
  h += '<div class="pad ltchat" id="ltChat">';
  if (!hist.length) h += '<div class="ltempty"><p>Ask anything about ' + esc(p.name.split(' ')[0]) + '. Every question sends the full chart: D1, ' + (J.VARGAS.length - 1) + ' divisional charts, Chalit, Moon chart, Ashtakavarga, Shadbala, dashas to pratyantar, and today\'s transits.</p></div>';
  hist.forEach(function (m) { h += m.r === 'user' ? '<div class="ltq">' + esc(m.t) + '</div>' : '<div class="lta' + (m.err ? ' err' : '') + '">' + (m.err ? esc(m.t) : mdToHtml(m.t)) + (m.via ? '<small>' + esc(m.via) + '</small>' : '') + '</div>'; });
  if (U.ltBusy && U.ltBusy === p.id) h += '<div class="lta live" id="ltLive"><div class="ltthink">Reading all charts…</div></div>';
  h += '</div><div class="ltsug">' + (U.ltBusy ? '' : ltSugg(p).map(function (s) { return '<button data-act="ltAskQ" data-q="' + esc(s) + '">' + esc(s) + '</button>'; }).join('')) + '</div>';
  h += '<div class="ltbar"><textarea id="ltIn" rows="1" placeholder="Ask about ' + esc(p.name.split(' ')[0]) + '…"></textarea><button data-act="ltSend" aria-label="Send"' + (U.ltBusy ? ' disabled' : '') + '>' + icon('ai', 20) + '</button></div>';
  h += '<div class="ltfoot"><button data-act="ltShare">Share chart pack</button>' + (hist.length ? '<button data-act="ltClear">Clear chat</button>' : '') + '</div>';
  return h + '<div style="height:150px"></div>';
}
ACT.ltCh = function (el) { U.lch = el.dataset.v; rerender(true); };
ACT.ltMd = function (el) { U.ltMd = +el.dataset.v === U.ltMd ? -1 : +el.dataset.v; rerender(true); };
ACT.ltShare = function () { var p = curP(); shareText(p.name + ' — chart', ltSys(p) + '\n\n=== CHART PACK ===\n' + packOf(p) + '\n\nMy question: '); };
ACT.ltClear = function () { var p = curP(); DB.ai2[p.id] = []; save(); rerender(); };
INP.ltGkey = function (el) { U.ltGk = el.value.trim(); };
ACT.ltSaveKey = function () { if (!U.ltGk || U.ltGk.length < 20) { toast('Paste the full key'); return; } DB.settings.gkey = U.ltGk; DB.settings.lprov = 'gemini'; save(); toast('Gemini connected'); rerender(); };
ACT.ltAskQ = function (el) { if (parts()[0] !== 'ai') { U.ltPend = el.dataset.q; go('ai'); return; } ltAsk(el.dataset.q); };
ACT.ltSend = function () { var t = $('#ltIn'); if (t && t.value.trim()) ltAsk(t.value.trim()); };
function ltAsk(q) {
  var p = curP(); if (!p || U.ltBusy) return; var pv = ltProv(); if (!pv) { rerender(); return; }
  var hist = ltHist(p); hist.push({ r: 'user', t: q, at: Date.now() }); U.ltBusy = p.id; save(); rerender(); window.scrollTo(0, document.body.scrollHeight);
  var on = function (k, t) { var el = document.getElementById('ltLive'); if (!el) return; if (k === 'thought') { var s = String(t).split('\n').filter(function (l) { return l.trim(); })[0] || ''; el.innerHTML = '<div class="ltthink">' + esc(s.replace(/\*\*/g, '').slice(0, 90)) + '…</div>'; } else el.innerHTML = mdToHtml(t); };
  var t0 = Date.now();
  (pv === 'claude' ? ltClaude(p, q, on) : ltGemini(p, q, on)).then(function (r) { hist.push({ r: 'model', t: r.t, sig: r.sig || '', via: r.via + ' · ' + Math.round((Date.now() - t0) / 1000) + ' s', at: Date.now() }); },
    function (e) { hist.push({ r: 'model', t: e.message || String(e), err: true, at: Date.now() }); })
    .then(function () { while (hist.length > 80) hist.shift(); U.ltBusy = null; save(); if (parts()[0] === 'ai') { rerender(true); var l = document.querySelectorAll('.lta'); if (l.length) l[l.length - 1].scrollIntoView({ block: 'start' }); } });
}

/* ---------- 4. settings: AI ---------- */
aiCard = function () {
  var s = DB.settings, pv = ltProv() || 'gemini';
  var h = '<div class="card"><h3>AI for questions</h3><div class="field"><span>ENGINE</span>' + sel('ltProv', [['gemini', 'Gemini'], ['claude', 'Claude']], s.lprov || (s.gkey ? 'gemini' : s.ckey ? 'claude' : 'gemini')) + '</div>';
  h += '<label class="field"><span>GEMINI API KEY (aistudio.google.com/apikey)</span><input class="inp mono" type="password" data-in="setGkey2" value="' + esc(s.gkey || '') + '" placeholder="AIza..." autocomplete="off"></label>';
  h += '<div class="field"><span>GEMINI MODEL</span>' + sel('ltModel', LT_MODELS.concat(s.lmodel && !LT_MODELS.some(function (m) { return m[0] === s.lmodel; }) ? [[s.lmodel, s.lmodel]] : []), s.lmodel || LT_MODELS[0][0]) + '</div>';
  h += '<label class="field"><span>OR TYPE ANOTHER GEMINI MODEL ID</span><input class="inp mono" data-in="ltModelT" placeholder="e.g. gemini-3.1-pro-preview" value=""></label>';
  h += '<div class="field"><span>GEMINI THINKING</span>' + sel('ltThink', [['high', 'High (most careful, slower)'], ['medium', 'Medium'], ['low', 'Low (fastest)']], s.lthink || 'high') + '</div>';
  h += '<label class="field"><span>CLAUDE API KEY (optional, console.anthropic.com)</span><input class="inp mono" type="password" data-in="setCkey" value="' + esc(s.ckey || '') + '" placeholder="sk-ant-..." autocomplete="off"></label>';
  h += '<div class="field"><span>CLAUDE MODEL</span>' + sel('setCmodel', CMODELS, s.cmodel || CMODELS[0][0]) + '</div>';
  h += '<p class="note">Keys stay on this phone and are never put in backups. Each question is billed by Google or Anthropic to your own account.</p>';
  return h + '</div>';
};
CHG.ltProv = function (el) { DB.settings.lprov = el.value; save(); };
CHG.ltModel = function (el) { DB.settings.lmodel = el.value; save(); };
CHG.ltThink = function (el) { DB.settings.lthink = el.value; save(); };
INP.setGkey2 = function (el) { DB.settings.gkey = el.value.trim(); save(); };
INP.ltModelT = function (el) { var v = el.value.trim(); if (/^gemini-[\w.\-]+$/.test(v)) { DB.settings.lmodel = v; save(); } };

/* ---------- 5. routing and navigation ---------- */
IC.sky = IC.today; IC.people = IC.people || '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.400-5.500 6.500-5.500s5.700 1.900 6.500 5.500M16 4.500a3.500 3.500 0 0 1 0 7M18 14.800c1.900.7 3.100 2.400 3.500 5.200"/>';
NAVS = [['astro', 'Kundli'], ['dasha', 'Dasha'], ['sky', 'Sky'], ['ai', 'Ask'], ['people', 'People']];
(function () {
  var r0 = render, LITE = { astro: LiteKundli, dasha: LiteDasha, sky: LiteSky, ai: LiteAsk }, KEEP = ['people', 'edit', 'more'];
  render = function () {
    var pr = parts(), scr = pr[0] || (me() ? 'astro' : 'people');
    if (scr === 'p' && person(pr[1])) { U.cur = pr[1]; location.hash = '#/astro'; return; }
    if (!LITE[scr] && KEEP.indexOf(scr) < 0) { location.hash = me() ? '#/astro' : '#/people'; return; }
    if (KEEP.indexOf(scr) >= 0) { r0(); $('#nav').innerHTML = NAVS.map(function (x) { return '<button data-go="' + x[0] + '" class="' + (x[0] === (scr === 'edit' ? 'people' : scr) ? 'on' : '') + '">' + icon(x[0]) + x[1] + '</button>'; }).join(''); var f = document.getElementById('askfab'); if (f) f.remove(); if (scr === 'more') [].forEach.call(document.querySelectorAll('#app .card'), function (cd) { var t = cd.querySelector('h3'); if (t && /^(Reminders|Accuracy|Location for Today|Language)/.test(t.textContent.trim())) cd.remove(); }); return; }
    applySettings(); var html; try { html = LITE[scr](); } catch (e) { html = '<div class="empty"><h2>Something went wrong</h2>' + esc(e.message) + '<br><br><button class="btn" data-go="people">People</button></div>'; if (window.console) console.error(e); }
    $('#app').innerHTML = html; $('#nav').innerHTML = NAVS.map(function (x) { return '<button data-go="' + x[0] + '" class="' + (x[0] === scr ? 'on' : '') + '">' + icon(x[0]) + x[1] + '</button>'; }).join('');
    document.body.setAttribute('data-scr', scr); document.body.classList.remove('asking'); var ab = $('#askbar'); if (ab) ab.classList.add('hide'); var fb = document.getElementById('askfab'); if (fb) fb.remove();
    if (scr === 'ai' && U.ltPend) { var q = U.ltPend; U.ltPend = null; setTimeout(function () { ltAsk(q); }, 50); }
  };
  addAiButtons = function () { var o = document.getElementById('askfab'); if (o) o.remove(); };
})();
/* no predictions means no prediction notifications: clear what older versions scheduled */
scheduleAll = function () { try { if (AND && AND.clearOnce) AND.clearOnce(''); (DB.remedies || []).forEach(function (r) { try { AND.cancelReminder(r.id); } catch (e) { } }); } catch (e) { } };
window.trikaalBack = function () { if ($('#scrim')) { closeSheet(); return 'true'; } var p = parts(); if (!p.length || ['astro', 'dasha', 'sky', 'ai', 'people'].indexOf(p[0]) >= 0) return 'false'; history.back(); return 'true'; };
try { scheduleAll(); } catch (e) { }
render();
