/* Trikaal evidence sheet: for any question, collect every layer an astrologer checks
   (D1 house and lord, the topic's divisional chart and D9, all five dasha levels and their links,
   aspects and conjunctions, transits with Ashtakavarga, functional nature, KP) as plain text for the AI. */
function makeEvidence(A, C, J, KB, N) {
  var PN = J.PNAME, SG = J.SIGNS, nth = N.nth, dmy = N.dmy, DAY = C.DAY;
  var TOPICS = [
    ['health', /\bhealth|\bbody\b|disease|\bill\b|illness|sick|surgery|hospital|tabiyat|sehat|accident|injur|\bpain|fatigue|tired|stress|\bsleep/, [1, 6, 8, 12], 30, 'D30 (Trimshamsha: illness)', ['Su', 'Sa', 'Mo']],
    ['career', /career|job|work|promot|business|profession|office|boss|salary hike|appraisal/, [10, 6, 2, 11], 10, 'D10 (Dashamsha: career)', ['Su', 'Sa', 'Me']],
    ['money', /money|wealth|financ|income|\bdhan|paisa|salary|invest|profit|\bloan|\bdebt|\bgains?\b|savings/, [2, 11, 5, 9, 12], 2, 'D2 (Hora: wealth)', ['Ju', 'Ve']],
    ['marriage', /marr|spouse|\bwife|husband|relationship|partner|\blove\b|divorce|wedding/, [7, 2, 11, 8], 9, 'D9 (Navamsha: spouse)', ['Ve', 'Ju']],
    ['children', /child|\bkids?\b|\bsons?\b|daughter|pregnan|baby/, [5, 2, 11, 9], 7, 'D7 (Saptamsha: children)', ['Ju']],
    ['education', /study|education|exam|college|degree|learning|school/, [4, 5, 9], 24, 'D24 (Chaturvimshamsha: learning)', ['Me', 'Ju']],
    ['property', /property|\bhouse\b|\bflat\b|\bland\b|\bhome\b|vehicle|\bcar\b/, [4, 11, 12], 4, 'D4 (Chaturthamsha: property)', ['Ma', 'Ve']],
    ['foreign', /foreign|abroad|visa|settle|overseas|travel/, [12, 9, 3, 7], 9, 'D9 (Navamsha)', ['Ra']],
    ['parents', /father|mother|parent/, [9, 4, 10], 12, 'D12 (Dwadashamsha: parents)', ['Su', 'Mo']],
    ['siblings', /brother|sister|sibling/, [3, 11], 3, 'D3 (Drekkana: siblings)', ['Ma']],
    ['spiritual', /spiritual|moksha|meditation|guru|dharma/, [9, 12, 5], 20, 'D20 (Vimshamsha: spiritual)', ['Ke', 'Ju']]
  ];
  function uniq(a) { var o = []; a.forEach(function (x) { if (o.indexOf(x) < 0) o.push(x); }); return o; }
  /* divisional charts by number: [name, what it shows, topic] */
  var VN = { 2: ['Hora', 'wealth and resources', 'money'], 3: ['Drekkana', 'siblings, courage and effort', 'siblings'], 4: ['Chaturthamsha', 'property, home and fortune', 'property'], 7: ['Saptamsha', 'children and progeny', 'children'],
    9: ['Navamsha', 'spouse, dharma and inner strength of planets', 'marriage'], 10: ['Dashamsha', 'career and status', 'career'], 12: ['Dwadashamsha', 'parents and ancestry', 'parents'], 16: ['Shodashamsha', 'vehicles, comforts and happiness', 'property'],
    20: ['Vimshamsha', 'spiritual progress and worship', 'spiritual'], 24: ['Chaturvimshamsha', 'education and learning', 'education'], 27: ['Saptavimshamsha (Bhamsha)', 'strength, stamina and weaknesses', 'health'], 30: ['Trimshamsha', 'misfortunes, illness and character', 'health'],
    40: ['Khavedamsha', 'maternal legacy and auspicious effects', 'general'], 45: ['Akshavedamsha', 'character and conduct', 'general'], 60: ['Shashtiamsha', 'past-life karma; overall result of each planet', 'general'] };
  var VWORDS = { hora: 2, drekkana: 3, drekana: 3, chaturthamsha: 4, saptamsha: 7, navamsha: 9, navamsa: 9, navansh: 9, dashamsha: 10, dasamsa: 10, dashamsa: 10, dwadashamsha: 12, shodashamsha: 16, vimshamsha: 20, chaturvimshamsha: 24, siddhamsha: 24, bhamsha: 27, saptavimshamsha: 27, trimshamsha: 30, trimsamsa: 30, khavedamsha: 40, akshavedamsha: 45, shashtiamsha: 60, shashtyamsha: 60 };
  function vargaAsked(q) {
    var ql = q.toLowerCase(), m = ql.match(/\bd\s?-?\s?(\d{1,2})\b/);
    if (m && VN[+m[1]]) return +m[1];
    for (var w in VWORDS) if (ql.indexOf(w) >= 0) return VWORDS[w];
    return 0;
  }
  function topicOf(q) {
    var ql = q.toLowerCase(), va = vargaAsked(q);
    for (var i = 0; i < TOPICS.length; i++) if (TOPICS[i][1].test(ql) && !(va && TOPICS[i][0] === 'marriage' && va !== 9 && !/marr|spouse|wife|husband/.test(ql))) { var t = TOPICS[i]; return va && va !== t[3] ? [t[0], t[1], t[2], va, 'D' + va + ' (' + VN[va][0] + ': ' + VN[va][1] + ')', t[5]] : t; }
    if (va) { var tt = TOPICS.filter(function (x) { return x[0] === VN[va][2]; })[0]; var hs = tt ? tt[2] : [1, 10, 7, 4]; return [tt ? tt[0] : 'general', null, hs, va, 'D' + va + ' (' + VN[va][0] + ': ' + VN[va][1] + ')', tt ? tt[5] : ['Su', 'Mo']]; }
    return ['general', null, [1, 10, 7, 4], 9, 'D9 (Navamsha: overall strength)', ['Su', 'Mo']];
  }
  function horizon(q) {
    var m = q.toLowerCase().match(/(\d+|one|two|three|four|five|six|twelve)\s*(day|week|month|year)/), W = ['', 'one', 'two', 'three', 'four', 'five', 'six', '', '', '', '', '', 'twelve'];
    if (m) { var n = isNaN(+m[1]) ? W.indexOf(m[1]) : +m[1]; return { d: 30, w: 7, m: 30.44, y: 365.25 }[m[2].charAt(0)] * n; }
    if (/today|aaj/.test(q)) return 1; if (/tomorrow|kal\b/.test(q)) return 2; if (/this week|next week/.test(q)) return 14; if (/this month|next month/.test(q)) return 45;
    if (/this year|next year|coming year/.test(q)) return 365; if (/when|kab|by when/.test(q)) return 1095;
    return 180;
  }
  function pos(p) { return PN[p.code] + ' ' + SG[p.sign] + ' ' + p.degs + (p.retro && p.code !== 'Ra' && p.code !== 'Ke' ? ' retrograde' : '') + (p.combust ? ' combust' : '') + ', ' + p.dignity.toLowerCase() + ', nakshatra ' + p.nak.name + ' pada ' + p.nak.pada + ' (star lord ' + PN[p.nak.lord] + ', KP sub lord ' + PN[p.kp.sub] + ')'; }
  function aspectsOnSign(k, sign) { var h = J.houseFrom(k.ascSign, sign); return k.planets.filter(function (p) { return p.house !== h && J.aspectedHouses(p.code, p.house).indexOf(h) >= 0; }).map(function (p) { var d = J.houseFrom(p.sign, sign); return PN[p.code] + ' (' + nth(d) + ' aspect from ' + SG[p.sign] + ')'; }); }
  function conj(k, p) { return k.planets.filter(function (x) { return x.code !== p.code && x.sign === p.sign; }).map(function (x) { var d = Math.abs(x.lon - p.lon); return PN[x.code] + ' (' + d.toFixed(1) + '° apart)'; }); }
  function links(c, code, houses) {
    var k = c.k, p = k.P[code], own = J.lordsOf(k.ascSign, code), asp = J.aspectedHouses(code, p.house), kp = c.sig.sig[code], out = [];
    var o = own.filter(function (h) { return houses.indexOf(h) >= 0; }); if (o.length) out.push('owns ' + o.map(nth).join(', '));
    if (houses.indexOf(p.house) >= 0) out.push('sits in ' + nth(p.house));
    var a = asp.filter(function (h) { return houses.indexOf(h) >= 0; }); if (a.length) out.push('aspects ' + a.map(nth).join(', '));
    var lordsHere = houses.map(function (h) { return J.lordOfHouse(k.ascSign, h); }).filter(function (l) { return l !== code && k.P[l].sign === p.sign; }); lordsHere = uniq(lordsHere); if (lordsHere.length) out.push('conjunct ' + lordsHere.map(function (l) { return PN[l]; }).join(', ') + ' (topic house lord)');
    if (code === 'Ra' || code === 'Ke') { var d = J.RULER[p.sign]; out.push('acts for its sign lord ' + PN[d] + ' (rules ' + J.lordsOf(k.ascSign, d).map(nth).join(', ') + ')'); }
    var kh = kp.filter(function (h) { return houses.indexOf(h) >= 0; }); out.push('KP signifies ' + kp.join(',') + (kh.length ? ' (topic houses ' + kh.join(',') + ')' : ' (no topic house)'));
    return out.join('; ');
  }
  function build(p, c, q, now) {
    var k = c.k, T = topicOf(q), houses = T[2], vn = T[3], days = horizon(q), end = new Date(now.getTime() + days * DAY), L = [], func = c.func;
    function fn(code) { return code === 'Ra' || code === 'Ke' ? 'node' : func[code].kind + (func[code].maraka ? ', maraka' : ''); }
    L.push('QUESTION TOPIC: ' + T[0] + '. Topic houses: ' + houses.join(', ') + '. Divisional chart: ' + T[4] + ', plus D9. Natural significators: ' + T[5].map(function (x) { return PN[x]; }).join(', ') + '. Period asked: ' + dmy(now) + ' to ' + dmy(end) + '.');
    L.push('\n[1] D1 (RASHI) – TOPIC HOUSES');
    houses.forEach(function (h) {
      if (h > 12) return;
      var sign = (k.ascSign + h - 1) % 12, lord = J.lordOfHouse(k.ascSign, h), lp = k.P[lord], occ = k.planets.filter(function (x) { return x.house === h; });
      L.push('House ' + h + ' (' + SG[sign] + ', SAV ' + c.av.sav[sign] + ' bindus): occupants ' + (occ.length ? occ.map(pos).join('; ') : 'none') + '. Aspected by ' + (aspectsOnSign(k, sign).join(', ') || 'none') + '. Lord ' + PN[lord] + ' in house ' + lp.house + ': ' + pos(lp) + '; lord conjunct ' + (conj(k, lp).join(', ') || 'none') + '; lord aspected by ' + (aspectsOnSign(k, lp.sign).join(', ') || 'none') + '. KP cusp ' + h + ' sub lord ' + PN[c.kp.cusps[h - 1].kp.sub] + ' signifies ' + c.sig.sig[c.kp.cusps[h - 1].kp.sub].join(','));
    });
    /* Moon chart (Chandra lagna): the same topic houses counted from the natal Moon, with transits over them */
    var ms = k.P.Mo.sign, TR = N.transitAt(c, now);
    function hm(sign) { return J.houseFrom(ms, sign); }
    L.push('\n[1b] MOON CHART (Chandra lagna = ' + SG[ms] + ', Moon ' + k.P.Mo.degs + ', nakshatra ' + k.P.Mo.nak.name + ') – SAME TOPIC HOUSES COUNTED FROM THE MOON');
    houses.forEach(function (h) {
      if (h > 12) return;
      var sign = (ms + h - 1) % 12, lord = J.lordOfHouse(ms, h), lp = k.P[lord];
      var occ = k.planets.filter(function (x) { return x.sign === sign; }).map(function (x) { return PN[x.code] + ' ' + x.degs + ' ' + x.dignity.toLowerCase(); });
      var asp = k.planets.filter(function (x) { return x.sign !== sign && J.aspectedHouses(x.code, hm(x.sign)).indexOf(h) >= 0; }).map(function (x) { return PN[x.code] + ' (from ' + nth(hm(x.sign)) + ' from Moon)'; });
      var tin = TR.filter(function (x) { return x.sign === sign; }).map(function (x) { return PN[x.code]; });
      var tasp = TR.filter(function (x) { return x.sign !== sign && J.aspectedHouses(x.code, hm(x.sign)).indexOf(h) >= 0; }).map(function (x) { return PN[x.code]; });
      L.push(nth(h) + ' from Moon (' + SG[sign] + ', SAV ' + c.av.sav[sign] + '): natal occupants ' + (occ.join(', ') || 'none') + '; natal aspects ' + (asp.join(', ') || 'none') + '; lord ' + PN[lord] + ' in ' + nth(hm(lp.sign)) + ' from Moon (' + SG[lp.sign] + ', ' + lp.dignity.toLowerCase() + '). Transit NOW: in it ' + (tin.join(', ') || 'none') + '; aspecting it ' + (tasp.join(', ') || 'none') + '.');
    });
    L.push('%DASHAMOON%');
    T[5].forEach(function (code) { var x = k.P[code]; L.push('Karaka ' + PN[code] + ': house ' + x.house + ', ' + pos(x) + '; aspected by ' + (aspectsOnSign(k, x.sign).join(', ') || 'none') + '.'); });
    function vargaBlock(n, label) {
      var va = J.varga(k.asc, n), out = [label + ': lagna ' + SG[va.sign] + '.'];
      houses.forEach(function (h) { if (h > 12) return; var lord = J.lordOfHouse(k.ascSign, h), v = J.varga(k.P[lord].lon, n); out.push('D1 ' + nth(h) + ' lord ' + PN[lord] + ' in ' + SG[v.sign] + ' (house ' + J.houseFrom(va.sign, v.sign) + ' of this chart, ' + J.dignity(lord, v.sign * 30 + v.deg).toLowerCase() + (v.sign === k.P[lord].sign ? ', vargottama' : '') + ').'); });
      var hh = houses[0], occ = k.planets.filter(function (x) { return J.houseFrom(va.sign, J.varga(x.lon, n).sign) === hh; }).map(function (x) { return PN[x.code]; });
      out.push(nth(hh) + ' house of this chart: ' + SG[(va.sign + hh - 1) % 12] + ', lord ' + PN[J.RULER[(va.sign + hh - 1) % 12]] + ' placed in house ' + J.houseFrom(va.sign, J.varga(k.P[J.RULER[(va.sign + hh - 1) % 12]].lon, n).sign) + ', occupants ' + (occ.join(', ') || 'none') + '.');
      out.push('All planets: ' + k.planets.map(function (x) { var v = J.varga(x.lon, n); return PN[x.code] + ' ' + SG[v.sign] + ' h' + J.houseFrom(va.sign, v.sign) + (['Exalted', 'Debilitated', 'Own sign', 'Moolatrikona'].indexOf(J.dignity(x.code, v.sign * 30 + v.deg)) >= 0 ? ' ' + J.dignity(x.code, v.sign * 30 + v.deg).toLowerCase() : ''); }).join(', ') + '.');
      return out.join(' ');
    }
    L.push('\n[2] DIVISIONAL CHARTS'); if (vn !== 9) L.push(vargaBlock(vn, T[4])); L.push(vargaBlock(9, 'D9 Navamsha'));
    var asked = vargaAsked(q);
    if (asked) {
      /* the person asked about one divisional chart: give it house by house */
      var va2 = J.varga(k.asc, asked), hb = [];
      for (var hx = 1; hx <= 12; hx++) { var sg = (va2.sign + hx - 1) % 12, ld = J.RULER[sg], lv = J.varga(k.P[ld].lon, asked), oc = k.planets.filter(function (x) { return J.varga(x.lon, asked).sign === sg; });
        hb.push('h' + hx + ' ' + SG[sg] + ': ' + (oc.length ? oc.map(function (x) { var v = J.varga(x.lon, asked); return PN[x.code] + ' (' + J.dignity(x.code, v.sign * 30 + v.deg).toLowerCase() + (v.sign === x.sign ? ', vargottama' : '') + ')'; }).join(', ') : 'empty') + '; lord ' + PN[ld] + ' in h' + J.houseFrom(va2.sign, lv.sign)); }
      L.push('\nCHART ASKED ABOUT: D' + asked + ' ' + VN[asked][0] + ' (shows ' + VN[asked][1] + '). Lagna ' + SG[va2.sign] + '. House by house: ' + hb.join(' | ') + '.' + (asked === 2 ? ' Parashari Hora: planets in Leo are in the Sun hora (self-earned, active wealth), in Cancer the Moon hora (inherited, steady or family wealth).' : ''));
    }
    /* compact table of every divisional chart, so any chart question can be answered */
    L.push('\n[7] ALL DIVISIONAL CHARTS (sign and house of each planet)');
    [2, 3, 4, 7, 10, 12, 16, 20, 24, 27, 30, 40, 45, 60].forEach(function (n) { var vx = J.varga(k.asc, n); L.push('D' + n + ' ' + VN[n][0] + ' (' + VN[n][1] + '), lagna ' + SG[vx.sign] + ': ' + k.planets.map(function (x) { var v = J.varga(x.lon, n), d = J.dignity(x.code, v.sign * 30 + v.deg); return PN[x.code] + ' ' + SG[v.sign].slice(0, 3) + ' h' + J.houseFrom(vx.sign, v.sign) + ({ 'Exalted': ' exalted', 'Debilitated': ' debilitated', 'Own sign': ' own', 'Moolatrikona': ' MT' }[d] || ''); }).join(', ')); });
    L.push('\n[3] DASHA (Vimshottari, ' + C.AYAN_INFO[k.ayan].name + ')');
    var ch = J.dashaChain(c.maha, now, 5), LV = ['Mahadasha', 'Antardasha', 'Pratyantar', 'Sookshma', 'Prana'];
    L = L.map(function (t) { return t.indexOf('%DASHAMOON%') >= 0 ? 'Running dasha lords from the Moon: ' + ch.map(function (x, i) { var hh = hm(k.P[x.lord].sign); return LV[i] + ' ' + PN[x.lord] + ' in ' + nth(hh) + ' from Moon' + (houses.indexOf(hh) >= 0 ? ' (topic house from Moon)' : ''); }).join('; ') + '.' : t; });
    ch.forEach(function (x, i) { L.push(LV[i] + ' ' + PN[x.lord] + ' (' + dmy(x.start) + ' to ' + dmy(x.end) + '): functional ' + fn(x.lord) + '; in house ' + k.P[x.lord].house + ' ' + SG[k.P[x.lord].sign] + '; link to topic: ' + links(c, x.lord, houses) + '.'); });
    var lvl = days > 400 ? 1 : days > 60 ? 2 : 3, upcoming = [];
    (function walk(list, d) { list.forEach(function (x) { if (x.end <= now || x.start > end) return; if (d === lvl) { if (x.start > now) upcoming.push(x); } else walk(J.subPeriods(x), d + 1); }); })([ch[0]].concat(c.maha.filter(function (m) { return m.start > ch[0].start && m.start < end; })), 0);
    if (upcoming.length) L.push('Upcoming ' + LV[lvl] + ' periods in the period asked: ' + upcoming.slice(0, 14).map(function (x) { return PN[x.lord] + ' ' + dmy(x.start) + '–' + dmy(x.end) + ' [' + links(c, x.lord, houses) + ']'; }).join(' | '));
    L.push('\n[4] TRANSITS (sidereal) NOW, ' + dmy(now));
    N.transitAt(c, now).forEach(function (x) { var asp = J.aspectedHouses(x.code, x.h).filter(function (h) { return houses.indexOf(h) >= 0; }); L.push(PN[x.code] + ' in ' + SG[x.sign] + ' ' + J.dm(x.lon) + (x.retro && x.code !== 'Ra' && x.code !== 'Ke' ? ' R' : '') + ': house ' + x.h + ' from lagna, ' + x.m + ' from Moon, gochar ' + x.verdict + (x.bav != null ? ', own BAV ' + x.bav + '/8, SAV ' + x.sav : '') + (x.vedha ? ', vedha by ' + x.vedha.by.join(',') : '') + (asp.length ? '; aspects topic house ' + asp.join(',') : '') + (houses.indexOf(x.h) >= 0 ? '; IN topic house' : '') + (houses.indexOf(x.m) >= 0 ? '; IN topic house from Moon' : '') + (function () { var a2 = J.aspectedHouses(x.code, x.m).filter(function (h) { return houses.indexOf(h) >= 0; }); return a2.length ? '; aspects topic house from Moon ' + a2.join(',') : ''; })() + '.'); });
    var evs = J.events(now, new Date(Math.max(end.getTime(), now.getTime() + 120 * DAY)), ['Ju', 'Sa', 'Ra', 'Ma']).filter(function (e) { return e.type !== 'ingress' || e.code !== 'Ma' || e.t < end; });
    if (evs.length) L.push('Transit changes: ' + evs.slice(0, 16).map(function (e) { return dmy(e.t) + ' ' + PN[e.code] + (e.type === 'ingress' ? ' enters ' + SG[e.sign] + ' (house ' + J.houseFrom(k.ascSign, e.sign) + ', ' + J.houseFrom(k.P.Mo.sign, e.sign) + ' from Moon, BAV ' + (c.av.bav[e.code] ? c.av.bav[e.code][e.sign] : '-') + ')' + (e.code === 'Ra' ? ', Ketu enters ' + SG[(e.sign + 6) % 12] + ' (house ' + J.houseFrom(k.ascSign, (e.sign + 6) % 12) + ')' : '') : ' turns ' + (e.type === 'retro' ? 'retrograde' : 'direct')); }).join('; '));
    var dt = houses[0], jh = J.houseFrom(k.ascSign, J.signOf(C.sidereal('Ju', now))), sh = J.houseFrom(k.ascSign, J.signOf(C.sidereal('Sa', now)));
    var jm = hm(J.signOf(C.sidereal('Ju', now))), sm = hm(J.signOf(C.sidereal('Sa', now)));
    L.push('Double transit on house ' + dt + ' now: from lagna Jupiter ' + ([jh].concat(J.aspectedHouses('Ju', jh)).indexOf(dt) >= 0 ? 'touches' : 'does not touch') + ', Saturn ' + ([sh].concat(J.aspectedHouses('Sa', sh)).indexOf(dt) >= 0 ? 'touches' : 'does not touch') + '; from Moon Jupiter ' + ([jm].concat(J.aspectedHouses('Ju', jm)).indexOf(dt) >= 0 ? 'touches' : 'does not touch') + ', Saturn ' + ([sm].concat(J.aspectedHouses('Sa', sm)).indexOf(dt) >= 0 ? 'touches' : 'does not touch') + '. ' + N.sadeSati(c, now).label + '.');
    L.push('\n[5] ASHTAKAVARGA (signs Aries..Pisces)');
    L.push('SAV: ' + c.av.sav.join(' ') + ' (total ' + c.av.sav.reduce(function (a, b) { return a + b; }, 0) + '). By house 1-12: ' + [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(function (h) { return h + ':' + N.savOf(c, h); }).join(' '));
    J.P7.forEach(function (x) { L.push('BAV ' + PN[x] + ': ' + c.av.bav[x].join(' ') + ' (total ' + c.av.bav[x].reduce(function (a, b) { return a + b; }, 0) + ')'); });
    L.push('\n[6] FUNCTIONAL NATURE for ' + SG[k.ascSign] + ' lagna: ' + J.P7.map(function (x) { return PN[x] + ' ' + fn(x) + ' (rules ' + func[x].houses.join('&') + ')'; }).join('; ') + '. Badhaka: ' + func.badhaka.house + 'th lord ' + PN[func.badhaka.lord] + '.');
    L.push('Yogas: ' + c.yogas.map(function (y) { return y.name + ' [' + y.why + ']'; }).join(' '));
    return { topic: T[0], houses: houses, varga: vn, vlabel: T[4], asked: vargaAsked(q), days: days, chain: ch, text: L.join('\n') };
  }
  var RULES = 'ASTROLOGY RULES YOU MUST APPLY:\n' +
    '- Judge every matter from three places: the house, its lord, and its natural significator (karaka), in D1, then confirm in the divisional chart listed and in D9. A result promised in D1 but weak in the divisional chart is partial.\n' +
    '- Strength: exalted, moolatrikona, own sign, vargottama, kendra/trikona placement and benefic aspect strengthen; debilitation, combustion, 6/8/12 placement and malefic aspect weaken. Use the functional nature for this lagna, not natural benefic/malefic, when judging results.\n' +
    '- Aspects: all planets aspect the 7th; Mars also 4th and 8th; Jupiter 5th and 9th; Saturn 3rd and 10th; Rahu and Ketu 5th, 7th and 9th.\n' +
    '- Timing: an event happens in the dasha of planets linked to the topic houses (owner, occupant, aspect, conjunction with the house lord, or KP signification), when Mahadasha, Antardasha and Pratyantar agree, and when transits support it (Jupiter and Saturn both touching the house or its lord = double transit). Sookshma and Prana narrow the date.\n' +
    '- KP: a matter is promised when the cusp sub lord signifies the favourable houses; it fructifies in the joint periods of significators.\n' +
    '- Ashtakavarga: total SAV is 337, average 28 per house; 28+ strong, below 25 weak; 11th more than 12th means income exceeds expenses. A transiting planet gives good results in signs where its own BAV is 5+ and weak results at 3 or less.\n' +
    '- Gochar is judged from the natal Moon; Sade Sati is Saturn in the 12th, 1st and 2nd from the Moon.\n' +
    '- Moon chart (Chandra lagna): read the same topic houses counted from the Moon. A matter shown from both the lagna and the Moon is strong and reliable; shown from only one, it is partial or delayed. A dasha lord placed in a topic house from the Moon also activates the matter.\n' +
    '- Transit is the trigger: the dasha promises, the transit delivers. Before predicting a date, check that slow planets (Jupiter, Saturn, Rahu/Ketu) are in or aspecting the topic house or its lord from the lagna AND from the Moon, with good BAV. If the dasha supports but transit does not, give the later date when transit joins.\n';
  return { build: build, topicOf: topicOf, horizon: horizon, RULES: RULES, vargaAsked: vargaAsked, VN: VN };
}
if (typeof module !== 'undefined') module.exports = makeEvidence;
