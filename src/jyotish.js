/* Trikaal Jyotish layer: kundli, vargas, dashas, panchang, KP, Ashtakavarga, Varshphal, yogas */
function makeJyotish(A, C) {
  var norm = C.norm, DAY = C.DAY, RAD = C.RAD;
  var SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  var SIGNS_HI = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];
  var SG3 = ['Ari', 'Tau', 'Gem', 'Can', 'Leo', 'Vir', 'Lib', 'Sco', 'Sag', 'Cap', 'Aqu', 'Pis'];
  var NAKS = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Moola', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];
  var PNAME = { Su: 'Sun', Mo: 'Moon', Ma: 'Mars', Me: 'Mercury', Ju: 'Jupiter', Ve: 'Venus', Sa: 'Saturn', Ra: 'Rahu', Ke: 'Ketu' };
  var PHI = { Su: 'Surya', Mo: 'Chandra', Ma: 'Mangal', Me: 'Budh', Ju: 'Guru', Ve: 'Shukra', Sa: 'Shani', Ra: 'Rahu', Ke: 'Ketu' };
  var PC = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke'], P7 = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa'];
  var RULER = ['Ma', 'Ve', 'Me', 'Mo', 'Su', 'Me', 'Ve', 'Ma', 'Ju', 'Sa', 'Sa', 'Ju'];
  var DORDER = ['Ke', 'Ve', 'Su', 'Mo', 'Ma', 'Ra', 'Ju', 'Sa', 'Me'];
  var DYEARS = { Ke: 7, Ve: 20, Su: 6, Mo: 10, Ma: 7, Ra: 18, Ju: 16, Sa: 19, Me: 17 };
  var NAK = 40 / 3;
  var EXALT = { Su: 0, Mo: 1, Ma: 9, Me: 5, Ju: 3, Ve: 11, Sa: 6, Ra: 1, Ke: 7 };
  var EXALT_DEG = { Su: 10, Mo: 33, Ma: 298, Me: 165, Ju: 95, Ve: 357, Sa: 200 };
  var OWN = { Su: [4], Mo: [3], Ma: [0, 7], Me: [2, 5], Ju: [8, 11], Ve: [1, 6], Sa: [9, 10], Ra: [10], Ke: [7] };
  var MOOLA = { Su: [4, 0, 20], Mo: [1, 3, 30], Ma: [0, 0, 12], Me: [5, 15, 20], Ju: [8, 0, 10], Ve: [6, 0, 15], Sa: [10, 0, 20] };
  /* natural friendships (BPHS) */
  var FRIEND = { Su: ['Mo', 'Ma', 'Ju'], Mo: ['Su', 'Me'], Ma: ['Su', 'Mo', 'Ju'], Me: ['Su', 'Ve'], Ju: ['Su', 'Mo', 'Ma'], Ve: ['Me', 'Sa'], Sa: ['Me', 'Ve'], Ra: ['Ve', 'Sa', 'Me'], Ke: ['Ma', 'Ve', 'Sa'] };
  var ENEMY = { Su: ['Ve', 'Sa'], Mo: [], Ma: ['Me'], Me: ['Mo'], Ju: ['Me', 'Ve'], Ve: ['Su', 'Mo'], Sa: ['Su', 'Mo', 'Ma'], Ra: ['Su', 'Mo', 'Ma'], Ke: ['Su', 'Mo'] };
  var ASPECTS = { Su: [7], Mo: [7], Me: [7], Ve: [7], Ma: [4, 7, 8], Ju: [5, 7, 9], Sa: [3, 7, 10], Ra: [5, 7, 9], Ke: [5, 7, 9] };
  var COMBUST = { Mo: 12, Ma: 17, Me: 14, Ju: 11, Ve: 10, Sa: 15 };

  function signOf(lon) { return Math.floor(norm(lon) / 30); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function dms(lon, sec) { var d = norm(lon) % 30, tot = Math.floor(d * 3600 + 1e-6), deg = Math.floor(tot / 3600), m = Math.floor((tot % 3600) / 60), s = tot % 60; return deg + '°' + pad(m) + '′' + (sec ? pad(s) + '″' : ''); }
  function dm(x) { var d = ((x % 30) + 30) % 30, tot = Math.floor(d * 60 + 1e-7), deg = Math.floor(tot / 60), m = tot % 60; return deg + '°' + pad(m) + '′'; }
  function houseFrom(fromSign, sign) { return ((sign - fromSign + 12) % 12) + 1; }

  /* ---------- nakshatra and KP lords ---------- */
  function split(lord, span, x) {
    var acc = 0, st = DORDER.indexOf(lord);
    for (var k = 0; k < 9; k++) { var p = DORDER[(st + k) % 9], w = span * DYEARS[p] / 120; if (x < acc + w || k === 8) return { lord: p, start: acc, span: w }; acc += w; }
  }
  function nakInfo(lon) {
    lon = norm(lon);
    var i = Math.floor(lon / NAK), within = lon - i * NAK, lord = DORDER[i % 9];
    var sb = split(lord, NAK, within), ss = split(sb.lord, sb.span, within - sb.start);
    return { index: i, num: i + 1, name: NAKS[i], pada: Math.floor(within / (NAK / 4)) + 1, lord: lord, sub: sb.lord, ss: ss.lord, frac: within / NAK };
  }
  function kpLords(lon) { var n = nakInfo(lon); return { sign: RULER[signOf(lon)], star: n.lord, sub: n.sub, ss: n.ss }; }

  /* ---------- dignity ---------- */
  function dignity(code, lon) {
    var s = signOf(lon), d = norm(lon) - s * 30;
    if (EXALT[code] === s) return 'Exalted';
    if ((EXALT[code] + 6) % 12 === s) return 'Debilitated';
    var mt = MOOLA[code]; if (mt && mt[0] === s && d >= mt[1] && d < mt[2]) return 'Moolatrikona';
    if (OWN[code] && OWN[code].indexOf(s) >= 0 && code !== 'Ra' && code !== 'Ke') return 'Own sign';
    var lord = RULER[s];
    if (lord === code) return 'Own sign';
    if (FRIEND[code].indexOf(lord) >= 0) return 'Friendly sign';
    if (ENEMY[code].indexOf(lord) >= 0) return 'Enemy sign';
    return 'Neutral sign';
  }
  function isCombust(code, lon, sunLon, retro) {
    if (!COMBUST[code]) return false;
    var orb = COMBUST[code]; if (retro && code === 'Me') orb = 12; if (retro && code === 'Ve') orb = 8;
    return Math.abs(norm(lon - sunLon + 180) - 180) < orb;
  }

  /* ---------- divisional charts ---------- */
  var VARGAS = [[1, 'Rashi', 'Body, overall life'], [2, 'Hora', 'Wealth'], [3, 'Drekkana', 'Siblings, courage'], [4, 'Chaturthamsha', 'Property, fortune'], [7, 'Saptamsha', 'Children'], [9, 'Navamsha', 'Spouse, dharma, inner strength'],
    [10, 'Dashamsha', 'Career, status'], [12, 'Dwadashamsha', 'Parents'], [16, 'Shodashamsha', 'Vehicles, comforts'], [20, 'Vimshamsha', 'Spiritual progress'], [24, 'Chaturvimshamsha', 'Education, learning'],
    [27, 'Bhamsha', 'Strength, stamina'], [30, 'Trimshamsha', 'Misfortune, illness'], [40, 'Khavedamsha', 'Maternal legacy'], [45, 'Akshavedamsha', 'Paternal legacy, character'], [60, 'Shashtiamsha', 'Past karma, overall']];
  var D30_ODD = [[5, 0], [10, 10], [18, 8], [25, 2], [30, 6]], D30_EVEN = [[5, 1], [12, 5], [20, 11], [25, 9], [30, 7]];
  function varga(lon, n) {
    lon = norm(lon);
    var s = Math.floor(lon / 30), d = lon - s * 30, odd = s % 2 === 0, mv = s % 3, part, sign, deg;
    if (n === 30) {
      var tbl = odd ? D30_ODD : D30_EVEN, prev = 0;
      for (var i = 0; i < 5; i++) { if (d < tbl[i][0] || i === 4) { sign = tbl[i][1]; deg = (d - prev) / (tbl[i][0] - prev) * 30; break; } prev = tbl[i][0]; }
      return { sign: sign, deg: deg, part: i };
    }
    part = Math.floor(d * n / 30); if (part >= n) part = n - 1;
    deg = (d * n) % 30;
    switch (n) {
      case 1: sign = s; break;
      case 2: sign = odd ? (part === 0 ? 4 : 3) : (part === 0 ? 3 : 4); break;
      case 3: sign = s + [0, 4, 8][part]; break;
      case 4: sign = s + 3 * part; break;
      case 7: sign = (odd ? s : s + 6) + part; break;
      case 9: sign = s * 9 + part; break;
      case 10: sign = (odd ? s : s + 8) + part; break;
      case 12: sign = s + part; break;
      case 16: sign = [0, 4, 8][mv] + part; break;
      case 20: sign = [0, 8, 4][mv] + part; break;
      case 24: sign = (odd ? 4 : 3) + part; break;
      case 27: sign = [0, 3, 6, 9][s % 4] + part; break;
      case 40: sign = (odd ? 0 : 6) + part; break;
      case 45: sign = [0, 4, 8][mv] + part; break;
      case 60: sign = s + part; break;
      default: sign = s + part;
    }
    return { sign: ((sign % 12) + 12) % 12, deg: deg, part: part };
  }
  var D60_NAMES = ['Ghora', 'Rakshasa', 'Deva', 'Kubera', 'Yaksha', 'Kinnara', 'Bhrashta', 'Kulaghna', 'Garala', 'Vahni', 'Maya', 'Purishaka', 'Apampati', 'Marutvan', 'Kaala', 'Sarpa', 'Amrita', 'Indu', 'Mridu', 'Komala', 'Heramba', 'Brahma', 'Vishnu', 'Maheshwara', 'Deva', 'Ardra', 'Kalinasha', 'Kshitisha', 'Kamalakara', 'Gulika', 'Mrityu', 'Kaala', 'Davagni', 'Ghora', 'Yama', 'Kantaka', 'Sudha', 'Amrita', 'Poornachandra', 'Vishadagdha', 'Kulanasha', 'Vamshakshaya', 'Utpata', 'Kaala', 'Saumya', 'Komala', 'Sheetala', 'Karaladamshtra', 'Chandramukhi', 'Praveena', 'Kalapavaka', 'Dandayudha', 'Nirmala', 'Saumya', 'Krura', 'Atisheetala', 'Amrita', 'Payodhi', 'Bhramana', 'Chandrarekha'];
  var D60_BAD = [1, 2, 7, 8, 9, 10, 11, 12, 15, 16, 30, 31, 32, 33, 34, 35, 36, 40, 41, 42, 43, 44, 48, 51, 52, 55, 59];
  function d60Deity(lon) { lon = norm(lon); var s = Math.floor(lon / 30), p = Math.min(59, Math.floor((lon - s * 30) * 2)), num = s % 2 === 0 ? p + 1 : 60 - p; return { num: num, name: D60_NAMES[num - 1], benefic: D60_BAD.indexOf(num) < 0 }; }

  /* ---------- kundli ---------- */
  function kundli(date, lat, lon, opts) {
    opts = opts || {};
    var m = opts.ayan || C.getAyanamsa(), ramc = null;
    if (opts.ascLon != null) ramc = C.ramcForAsc(opts.ascLon, date, lat, m);
    var cusps = C.placidus(date, lat, lon, m, ramc), asc = cusps[0], ascSign = signOf(asc);
    var sunLon = C.sidereal('Su', date, m);
    var planets = C.BODIES.map(function (c) {
      var L = c === 'Su' ? sunLon : C.sidereal(c, date, m), s = signOf(L), sp = C.speed(c, date), retro = c === 'Ra' || c === 'Ke' ? true : sp < 0;
      return { code: c, name: PNAME[c], lon: L, sign: s, deg: dms(L), degs: dms(L, true), nak: nakInfo(L), kp: kpLords(L), speed: sp, retro: retro,
        house: houseFrom(ascSign, s), bhava: C.bhavaOf(cusps, L), dignity: dignity(c, L), combust: c === 'Su' ? false : isCombust(c, L, sunLon, retro) };
    });
    var P = {}; planets.forEach(function (p) { P[p.code] = p; });
    return { date: date, lat: lat, lon: lon, ayan: m, ayanamsa: C.ayanamsa(date, m), asc: asc, ascSign: ascSign, ascDeg: dms(asc), ascDegs: dms(asc, true), ascNak: nakInfo(asc), ascKP: kpLords(asc),
      cusps: cusps.map(function (x, i) { return { house: i + 1, lon: x, sign: signOf(x), deg: dms(x), degs: dms(x, true), kp: kpLords(x) }; }), planets: planets, P: P };
  }
  function lordsOf(ascSign, code) { var o = []; for (var h = 1; h <= 12; h++) if (RULER[(ascSign + h - 1) % 12] === code) o.push(h); return o; }
  function lordOfHouse(ascSign, h) { return RULER[(ascSign + h - 1) % 12]; }
  function aspectedHouses(code, house) { return ASPECTS[code].map(function (a) { return ((house - 1 + a - 1) % 12) + 1; }); }
  /* which planets aspect a given house (whole-sign Parashari full aspects) */
  function aspectsOnHouse(k, h) { return k.planets.filter(function (p) { return aspectedHouses(p.code, p.house).indexOf(h) >= 0; }).map(function (p) { return p.code; }); }

  /* ---------- Vimshottari ---------- */
  var dashaYear = 365.25;
  function setDashaYear(y) { dashaYear = y; }
  function dashas(birth, moonLon) {
    var n = nakInfo(moonLon), startIdx = DORDER.indexOf(n.lord), YEAR = dashaYear * DAY;
    var t = birth.getTime() - n.frac * DYEARS[n.lord] * YEAR, list = [];
    for (var k = 0; k < 18; k++) { var lord = DORDER[(startIdx + k) % 9], len = DYEARS[lord] * YEAR; list.push({ lord: lord, start: new Date(t), end: new Date(t + len), level: 1 }); t += len; }
    return list;
  }
  function subPeriods(p) {
    var len = p.end - p.start, startIdx = DORDER.indexOf(p.lord), t = p.start.getTime(), out = [];
    for (var k = 0; k < 9; k++) { var lord = DORDER[(startIdx + k) % 9], l = len * DYEARS[lord] / 120; out.push({ lord: lord, start: new Date(t), end: new Date(t + l), level: (p.level || 1) + 1 }); t += l; }
    return out;
  }
  function find(list, date) { for (var i = 0; i < list.length; i++) if (date >= list[i].start && date < list[i].end) return list[i]; return null; }
  function dashaChain(maha, date, levels) { var out = [], list = maha; for (var l = 0; l < (levels || 5); l++) { var cur = find(list, date); if (!cur) break; out.push(cur); list = subPeriods(cur); } return out; }

  /* ---------- Yogini dasha ---------- */
  var YOGINI = [['Mangala', 'Mo', 1], ['Pingala', 'Su', 2], ['Dhanya', 'Ju', 3], ['Bhramari', 'Ma', 4], ['Bhadrika', 'Me', 5], ['Ulka', 'Sa', 6], ['Siddha', 'Ve', 7], ['Sankata', 'Ra', 8]];
  function yogini(birth, moonLon) {
    var n = nakInfo(moonLon), idx = (n.num + 3) % 8; if (idx === 0) idx = 8; idx -= 1;
    var YEAR = dashaYear * DAY, t = birth.getTime() - n.frac * YOGINI[idx][2] * YEAR, out = [];
    for (var k = 0; k < 16; k++) { var y = YOGINI[(idx + k) % 8], len = y[2] * YEAR; out.push({ name: y[0], lord: y[1], years: y[2], start: new Date(t), end: new Date(t + len), level: 1 }); t += len; }
    return out;
  }
  function yoginiSub(p) {
    var idx = 0; YOGINI.forEach(function (y, i) { if (y[0] === p.name) idx = i; });
    var len = p.end - p.start, t = p.start.getTime(), out = [];
    for (var k = 0; k < 8; k++) { var y = YOGINI[(idx + k) % 8], l = len * y[2] / 36; out.push({ name: y[0], lord: y[1], start: new Date(t), end: new Date(t + l), level: 2 }); t += l; }
    return out;
  }

  /* ---------- sunrise, panchang ---------- */
  function sunEvent(date, lat, lon, dir) { var r = A.SearchRiseSet('Sun', new A.Observer(lat, lon, 0), dir, date, 2); return r ? r.date : null; }
  function moonEvent(date, lat, lon, dir) { var r = A.SearchRiseSet('Moon', new A.Observer(lat, lon, 0), dir, date, 1.2); return r ? r.date : null; }
  var TITHIS = ['Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi'];
  var YOGAS = ['Vishkumbha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti', 'Shoola', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyan', 'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti'];
  var KARANA_MOVE = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Garaja', 'Vanija', 'Vishti'];
  var VARAS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var VARAS_HI = ['Ravivar', 'Somvar', 'Mangalvar', 'Budhvar', 'Guruvar', 'Shukravar', 'Shanivar'];
  var VARA_LORD = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa'];
  function elong(date) { return norm(C.tropical('Mo', date) - C.tropical('Su', date)); }
  function tithiAt(date) { var e = elong(date), n = Math.floor(e / 12), k = n % 15; return { n: n + 1, num: k + 1, paksha: n < 15 ? 'Shukla' : 'Krishna', name: k === 14 ? (n < 15 ? 'Purnima' : 'Amavasya') : TITHIS[k] }; }
  function karanaName(h) { if (h === 0) return 'Kimstughna'; if (h >= 57) return ['Shakuni', 'Chatushpada', 'Naga'][h - 57]; return KARANA_MOVE[(h - 1) % 7]; }
  function karanaAt(date) { var h = Math.floor(elong(date) / 6); return { n: h, name: karanaName(h) }; }
  function yogaAt(date) { var s = norm(C.sidereal('Su', date) + C.sidereal('Mo', date)), n = Math.floor(s / NAK); return { n: n, name: YOGAS[n] }; }
  /* first time after `start` that f(t) reaches `target` (f increasing mod 360), within `hours` */
  function nextCrossing(f, start, target, hours) {
    var t0 = start.getTime(), step = 1800e3, prev = norm(f(start) - target), pt = t0;
    for (var h = 1; h <= hours * 2; h++) {
      var tt = t0 + h * step, v = norm(f(new Date(tt)) - target);
      if (v < prev && prev > 180 && v < 180) { var lo = pt, hi = tt; for (var k = 0; k < 32; k++) { var mid = (lo + hi) / 2; if (norm(f(new Date(mid)) - target) < 180) hi = mid; else lo = mid; } return new Date(hi); }
      prev = v; pt = tt;
    }
    return null;
  }
  function panchang(dayStart, lat, lon) {
    var rise = sunEvent(dayStart, lat, lon, +1) || new Date(dayStart.getTime() + 6 * 3600e3);
    var set = sunEvent(rise, lat, lon, -1) || new Date(rise.getTime() + 12 * 3600e3);
    var nextRise = sunEvent(new Date(rise.getTime() + 3600e3), lat, lon, +1) || new Date(rise.getTime() + DAY);
    var moonL = C.sidereal('Mo', rise), nk = nakInfo(moonL), ti = tithiAt(rise), yo = yogaAt(rise), ka = karanaAt(rise);
    var nakEnd = nextCrossing(function (d) { return C.sidereal('Mo', d); }, rise, ((nk.index + 1) * NAK) % 360, 40);
    var tithiEnd = nextCrossing(elong, rise, (ti.n * 12) % 360, 40);
    var yogaEnd = nextCrossing(function (d) { return norm(C.sidereal('Su', d) + C.sidereal('Mo', d)); }, rise, ((yo.n + 1) * NAK) % 360, 40);
    var karanaEnd = nextCrossing(elong, rise, ((ka.n + 1) * 6) % 360, 20);
    var moonSignEnd = nextCrossing(function (d) { return C.sidereal('Mo', d); }, rise, ((signOf(moonL) + 1) * 30) % 360, 60);
    return { rise: rise, set: set, nextRise: nextRise, moonLon: moonL, moonSign: signOf(moonL), sunLon: C.sidereal('Su', rise), nak: nk, nakEnd: nakEnd,
      tithi: ti, tithiEnd: tithiEnd, yoga: yo, yogaEnd: yogaEnd, karana: ka, karanaEnd: karanaEnd, moonSignEnd: moonSignEnd,
      moonrise: moonEvent(dayStart, lat, lon, +1), moonset: moonEvent(dayStart, lat, lon, -1) };
  }
  function panchangLite(dayStart, lat, lon) {
    var rise = sunEvent(dayStart, lat, lon, +1) || new Date(dayStart.getTime() + 6 * 3600e3);
    var moonL = C.sidereal('Mo', rise);
    return { rise: rise, moonLon: moonL, moonSign: signOf(moonL), nak: nakInfo(moonL), tithi: tithiAt(rise), yoga: yogaAt(rise), karana: karanaAt(rise) };
  }
  /* Bhadra (Vishti karana) windows overlapping [a, b] */
  function vishtiWindows(a, b) {
    var out = [], t = a.getTime() - 14 * 3600e3;
    while (t < b.getTime()) {
      var h = Math.floor(elong(new Date(t)) / 6), name = karanaName(h);
      var end = nextCrossing(elong, new Date(t), ((h + 1) * 6) % 360, 24);
      if (!end) break;
      if (name === 'Vishti' && end > a) { var st0 = h === 0 ? null : nextCrossing(elong, new Date(t - 14 * 3600e3), (h * 6) % 360, 20); out.push({ start: st0 && st0 < end ? st0 : new Date(t), end: end }); }
      t = end.getTime() + 60e3;
    }
    return out;
  }
  var RAHU_PART = [8, 2, 7, 5, 6, 4, 3], YAMA_PART = [5, 4, 3, 2, 1, 7, 6], GULIKA_PART = [7, 6, 5, 4, 3, 2, 1];
  function dayParts(rise, set, wd) {
    var len = (set - rise) / 8;
    function part(p) { return { start: new Date(rise.getTime() + (p - 1) * len), end: new Date(rise.getTime() + p * len) }; }
    var noon = rise.getTime() + (set - rise) / 2, muh = (set - rise) / 15;
    return { rahu: part(RAHU_PART[wd]), yama: part(YAMA_PART[wd]), gulika: part(GULIKA_PART[wd]),
      abhijit: { start: new Date(noon - muh / 2), end: new Date(noon + muh / 2), wednesday: wd === 3 },
      brahma: { start: new Date(rise.getTime() - 96 * 60e3), end: new Date(rise.getTime() - 48 * 60e3) } };
  }
  var CHALDEAN = ['Sa', 'Ju', 'Ma', 'Su', 'Ve', 'Me', 'Mo'];
  function horas(rise, set, nextRise, wd) {
    var out = [], idx = CHALDEAN.indexOf(VARA_LORD[wd]), dl = (set - rise) / 12, nl = (nextRise - set) / 12;
    for (var i = 0; i < 24; i++) { var s = i < 12 ? rise.getTime() + i * dl : set.getTime() + (i - 12) * nl; out.push({ lord: CHALDEAN[(idx + i) % 7], start: new Date(s), end: new Date(s + (i < 12 ? dl : nl)), day: i < 12 }); }
    return out;
  }
  /* Choghadiya: cycle Udveg(Su) Char(Ve) Labh(Me) Amrit(Mo) Kaal(Sa) Shubh(Ju) Rog(Ma) */
  var CHOG = ['Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog'], CHOG_Q = { Udveg: 'bad', Char: 'neutral', Labh: 'good', Amrit: 'good', Kaal: 'bad', Shubh: 'good', Rog: 'bad' };
  var CHOG_START = { 0: 0, 1: 3, 2: 6, 3: 2, 4: 5, 5: 1, 6: 4 };
  function choghadiya(rise, set, nextRise, wd) {
    var dl = (set - rise) / 8, nl = (nextRise - set) / 8, day = [], night = [], i0 = CHOG_START[wd], n0 = CHOG_START[(wd + 4) % 7];
    for (var i = 0; i < 8; i++) {
      var dn = CHOG[(i0 + i) % 7]; day.push({ name: dn, q: CHOG_Q[dn], start: new Date(rise.getTime() + i * dl), end: new Date(rise.getTime() + (i + 1) * dl) });
      var nn = CHOG[(((n0 - 2 * i) % 7) + 7) % 7]; night.push({ name: nn, q: CHOG_Q[nn], start: new Date(set.getTime() + i * nl), end: new Date(set.getTime() + (i + 1) * nl) });
    }
    return { day: day, night: night };
  }
  /* lunar month (amanta) for a date */
  var MASA = ['Vaishakha', 'Jyeshtha', 'Ashadha', 'Shravana', 'Bhadrapada', 'Ashwin', 'Kartik', 'Margashirsha', 'Pausha', 'Magha', 'Phalguna', 'Chaitra'];
  function newMoonBefore(date) {
    var t = date.getTime(), e = elong(date); t -= (e / 12.19) * DAY;
    var lo = t - 2 * DAY, hi = t + 2 * DAY;
    for (var i = 0; i < 40; i++) { var mid = (lo + hi) / 2, v = norm(elong(new Date(mid)) + 180) - 180; if (v < 0) lo = mid; else hi = mid; }
    var nm = new Date(hi); if (nm > date) return newMoonBefore(new Date(nm.getTime() - 3 * DAY));
    return nm;
  }
  function lunarMonth(date) {
    var nm = newMoonBefore(date), nm2 = new Date(nm.getTime() + 29.6 * DAY);
    var e2 = norm(elong(nm2) + 180) - 180; nm2 = new Date(nm2.getTime() - e2 / 12.19 * DAY);
    var s1 = signOf(C.sidereal('Su', nm)), s2 = signOf(C.sidereal('Su', nm2));
    var adhik = s1 === s2;
    return { name: MASA[s1], adhik: adhik, start: nm };
  }
  function samvat(date, masa) {
    var y = new Date(date.getTime() + 5.5 * 3600e3).getUTCFullYear(), mo = new Date(date.getTime() + 5.5 * 3600e3).getUTCMonth();
    var afterChaitra = mo >= 3 || (mo === 2 && masa === 'Chaitra') || (mo >= 2 && ['Chaitra', 'Vaishakha'].indexOf(masa) >= 0);
    if (mo <= 2 && ['Magha', 'Phalguna', 'Pausha'].indexOf(masa) >= 0) afterChaitra = false;
    return { vikram: y + (afterChaitra ? 57 : 56), shaka: y - (afterChaitra ? 78 : 79) };
  }

  /* ---------- transits: ingresses, stations, windows ---------- */
  function bisect(f, lo, hi) { for (var j = 0; j < 40; j++) { var mid = (lo + hi) / 2; if (f(mid)) hi = mid; else lo = mid; } return new Date(hi); }
  function events(start, end, codes) {
    var out = [], STEP = { Su: 2, Mo: 0.25, Ma: 2, Me: 1, Ju: 4, Ve: 1, Sa: 5, Ra: 5, Ke: 5 };
    codes.forEach(function (code) {
      var step = (STEP[code] || 1) * DAY, t = start.getTime(), pS = signOf(C.sidereal(code, start)), pSp = (code === 'Ra' || code === 'Ke') ? -1 : C.speed(code, start);
      while (t < end.getTime()) {
        var t2 = Math.min(t + step, end.getTime()), s = signOf(C.sidereal(code, new Date(t2)));
        if (s !== pS) { var from = pS; var when = bisect(function (x) { return signOf(C.sidereal(code, new Date(x))) !== from; }, t, t2); out.push({ t: when, code: code, type: 'ingress', sign: signOf(C.sidereal(code, new Date(when.getTime() + 60e3))), from: from }); }
        if (code !== 'Ra' && code !== 'Ke' && code !== 'Mo' && code !== 'Su') {
          var sp = C.speed(code, new Date(t2));
          if ((sp < 0) !== (pSp < 0)) { var wasR = pSp < 0; var st = bisect(function (x) { return (C.speed(code, new Date(x)) < 0) !== wasR; }, t, t2); out.push({ t: st, code: code, type: wasR ? 'direct' : 'retro', sign: signOf(C.sidereal(code, st)), lon: C.sidereal(code, st) }); }
          pSp = sp;
        }
        pS = s; t = t2;
      }
    });
    return out.sort(function (a, b) { return a.t - b.t; });
  }
  function nextIngress(code, from, maxDays) {
    var s0 = signOf(C.sidereal(code, from)), t = from.getTime(), step = code === 'Mo' ? 3600e3 : DAY;
    for (var i = 0; i < (maxDays || 1500) * (code === 'Mo' ? 24 : 1); i++) {
      var t2 = t + step;
      if (signOf(C.sidereal(code, new Date(t2))) !== s0) return bisect(function (x) { return signOf(C.sidereal(code, new Date(x))) !== s0; }, t, t2);
      t = t2;
    }
    return null;
  }
  function signWindows(code, sign, start, end, stepHours) {
    var step = (stepHours || 24) * 3600e3, out = [], t = start.getTime(), inside = signOf(C.sidereal(code, start)) === sign, cur = inside ? new Date(t) : null;
    while (t < end.getTime()) {
      var t2 = Math.min(t + step, end.getTime()), now = signOf(C.sidereal(code, new Date(t2))) === sign;
      if (now !== inside) { var was = inside; var at = bisect(function (x) { return (signOf(C.sidereal(code, new Date(x))) === sign) !== was; }, t, t2); if (now) cur = at; else { out.push({ start: cur, end: at }); cur = null; } inside = now; }
      t = t2;
    }
    if (inside) out.push({ start: cur, end: null });
    return out;
  }

  /* ---------- Ashtakavarga (BPHS) ---------- */
  var AV_FROM = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'La'];
  var AV = {
    Su: [[1, 2, 4, 7, 8, 9, 10, 11], [3, 6, 10, 11], [1, 2, 4, 7, 8, 9, 10, 11], [3, 5, 6, 9, 10, 11, 12], [5, 6, 9, 11], [6, 7, 12], [1, 2, 4, 7, 8, 9, 10, 11], [3, 4, 6, 10, 11, 12]],
    Mo: [[3, 6, 7, 8, 10, 11], [1, 3, 6, 7, 10, 11], [2, 3, 5, 6, 9, 10, 11], [1, 3, 4, 5, 7, 8, 10, 11], [1, 4, 7, 8, 10, 11, 12], [3, 4, 5, 7, 9, 10, 11], [3, 5, 6, 11], [3, 6, 10, 11]],
    Ma: [[3, 5, 6, 10, 11], [3, 6, 11], [1, 2, 4, 7, 8, 10, 11], [3, 5, 6, 11], [6, 10, 11, 12], [6, 8, 11, 12], [1, 4, 7, 8, 9, 10, 11], [1, 3, 6, 10, 11]],
    Me: [[5, 6, 9, 11, 12], [2, 4, 6, 8, 10, 11], [1, 2, 4, 7, 8, 9, 10, 11], [1, 3, 5, 6, 9, 10, 11, 12], [6, 8, 11, 12], [1, 2, 3, 4, 5, 8, 9, 11], [1, 2, 4, 7, 8, 9, 10, 11], [1, 2, 4, 6, 8, 10, 11]],
    Ju: [[1, 2, 3, 4, 7, 8, 9, 10, 11], [2, 5, 7, 9, 11], [1, 2, 4, 7, 8, 10, 11], [1, 2, 4, 5, 6, 9, 10, 11], [1, 2, 3, 4, 7, 8, 10, 11], [2, 5, 6, 9, 10, 11], [3, 5, 6, 12], [1, 2, 4, 5, 6, 7, 9, 10, 11]],
    Ve: [[8, 11, 12], [1, 2, 3, 4, 5, 8, 9, 11, 12], [3, 5, 6, 9, 11, 12], [3, 5, 6, 9, 11], [5, 8, 9, 10, 11], [1, 2, 3, 4, 5, 8, 9, 10, 11], [3, 4, 5, 8, 9, 10, 11], [1, 2, 3, 4, 5, 8, 9, 11]],
    Sa: [[1, 2, 4, 7, 8, 10, 11], [3, 6, 11], [3, 5, 6, 10, 11, 12], [6, 8, 9, 10, 11, 12], [5, 6, 11, 12], [6, 11, 12], [3, 5, 6, 11], [1, 3, 4, 6, 10, 11]]
  };
  function ashtakavarga(k) {
    var signs = { La: k.ascSign }; k.planets.forEach(function (p) { signs[p.code] = p.sign; });
    var bav = {}, sav = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    Object.keys(AV).forEach(function (p) {
      var row = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      AV[p].forEach(function (houses, ci) { var from = signs[AV_FROM[ci]]; houses.forEach(function (h) { row[(from + h - 1) % 12]++; }); });
      bav[p] = row; row.forEach(function (v, i) { sav[i] += v; });
    });
    return { bav: bav, sav: sav };
  }

  /* ---------- KP ---------- */
  function kpSignificators(k) {
    var P = k.P, owns = {}; PC.forEach(function (c) { owns[c] = []; });
    k.cusps.forEach(function (c) { owns[RULER[c.sign]].push(c.house); });
    function uniq(a) { var o = []; a.forEach(function (x) { if (o.indexOf(x) < 0) o.push(x); }); return o.sort(function (x, y) { return x - y; }); }
    function base(c) { return { occ: P[c].bhava, own: owns[c].slice() }; }
    function nodeAgents(c) {
      var ag = [RULER[P[c].sign], P[c].kp.star];
      PC.forEach(function (o) { if (o !== c && o !== 'Ra' && o !== 'Ke' && P[o].sign === P[c].sign && Math.abs(P[o].lon - P[c].lon) < 12) ag.push(o); });
      var out = []; ag.forEach(function (x) { if (x !== 'Ra' && x !== 'Ke' && out.indexOf(x) < 0) out.push(x); }); return out;
    }
    function housesOf(c) { var b = base(c), hs = [b.occ].concat(b.own); if (c === 'Ra' || c === 'Ke') nodeAgents(c).forEach(function (a) { var sb = base(a); hs = hs.concat([sb.occ], sb.own); }); return uniq(hs); }
    var steps = {};
    PC.forEach(function (c) {
      var st = P[c].kp.star, sb = P[c].kp.sub, sbst = P[sb].kp.star;
      steps[c] = { planet: { lord: c, houses: housesOf(c), agentOf: (c === 'Ra' || c === 'Ke') ? nodeAgents(c) : null }, star: { lord: st, houses: housesOf(st) }, sub: { lord: sb, houses: housesOf(sb) }, subStar: { lord: sbst, houses: housesOf(sbst) } };
    });
    var houses = [];
    for (var h = 1; h <= 12; h++) {
      var occ = PC.filter(function (c) { return P[c].bhava === h; }), owner = RULER[k.cusps[h - 1].sign];
      var Aa = PC.filter(function (c) { return occ.indexOf(P[c].kp.star) >= 0; }), Cc = PC.filter(function (c) { return P[c].kp.star === owner; });
      var nodes = ['Ra', 'Ke'].filter(function (n) { var ag = nodeAgents(n); return ag.indexOf(owner) >= 0 || ag.some(function (a) { return occ.indexOf(a) >= 0; }); });
      houses.push({ house: h, A: Aa, B: occ, C: Cc, D: [owner], nodes: nodes, csl: k.cusps[h - 1].kp.sub });
    }
    var sig = {}; PC.forEach(function (c) { sig[c] = uniq(steps[c].star.houses.concat(steps[c].planet.houses)); });
    return { steps: steps, houses: houses, owns: owns, sig: sig };
  }
  function rulingPlanets(date, lat, lon, tz, m) {
    var k = kundli(date, lat, lon, { ayan: m || 'kp' }), mo = k.P.Mo;
    var obs = new A.Observer(lat, lon, 0), rise = A.SearchRiseSet('Sun', obs, +1, new Date(date.getTime() - DAY), 2), last = null;
    while (rise && rise.date <= date) { last = rise.date; rise = A.SearchRiseSet('Sun', obs, +1, new Date(rise.date.getTime() + 3600e3), 2); }
    var wd = new Date((last || date).getTime() + tz * 3600e3).getUTCDay();
    var list = [{ role: 'Day lord', lord: VARA_LORD[wd] }, { role: 'Lagna sign lord', lord: k.ascKP.sign }, { role: 'Lagna star lord', lord: k.ascKP.star }, { role: 'Lagna sub lord', lord: k.ascKP.sub },
      { role: 'Moon sign lord', lord: mo.kp.sign }, { role: 'Moon star lord', lord: mo.kp.star }, { role: 'Moon sub lord', lord: mo.kp.sub }];
    var set = []; list.forEach(function (x) { if (set.indexOf(x.lord) < 0) set.push(x.lord); });
    ['Ra', 'Ke'].forEach(function (n) { if (set.indexOf(RULER[k.P[n].sign]) >= 0 && set.indexOf(n) < 0) set.push(n); });
    return { list: list, set: set, chart: k };
  }
  var H249 = null;
  function horaryTable() {
    if (H249) return H249;
    var out = [], EPS = 1e-9;
    for (var i = 0; i < 27; i++) {
      var star = DORDER[i % 9], st = DORDER.indexOf(star), a = i * NAK;
      for (var k2 = 0; k2 < 9; k2++) {
        var sub = DORDER[(st + k2) % 9], b = a + NAK * DYEARS[sub] / 120, cut = (Math.floor(a / 30) + 1) * 30;
        if (cut < b - EPS && cut > a + EPS) { out.push({ start: a, end: cut, star: star, sub: sub }); out.push({ start: cut, end: b, star: star, sub: sub }); } else out.push({ start: a, end: b, star: star, sub: sub });
        a = b;
      }
    }
    out.forEach(function (x, j) { x.n = j + 1; x.sign = Math.floor((x.start + EPS) / 30); });
    H249 = out; return out;
  }
  function horary(n) { var t = horaryTable(); return t[Math.max(1, Math.min(t.length, n | 0)) - 1]; }

  /* ---------- functional nature by lagna (BPHS ch. 34) ---------- */
  var FUNC = [
    { b: ['Ju', 'Su'], m: ['Sa', 'Me', 'Ve'], yk: [] }, { b: ['Sa', 'Su'], m: ['Ju', 'Ve', 'Mo'], yk: ['Sa'] }, { b: ['Ve'], m: ['Ma', 'Ju', 'Su'], yk: [] },
    { b: ['Ma', 'Ju'], m: ['Ve', 'Me'], yk: ['Ma'] }, { b: ['Ma', 'Ju', 'Su'], m: ['Me', 'Ve', 'Sa'], yk: ['Ma'] }, { b: ['Ve'], m: ['Ma', 'Ju', 'Mo'], yk: [] },
    { b: ['Sa', 'Me'], m: ['Ju', 'Su', 'Ma'], yk: ['Sa'] }, { b: ['Ju', 'Mo'], m: ['Me', 'Ve'], yk: [] }, { b: ['Ma', 'Su'], m: ['Ve'], yk: [] },
    { b: ['Ve', 'Me'], m: ['Ma', 'Ju', 'Mo'], yk: ['Ve'] }, { b: ['Ve', 'Sa'], m: ['Ju', 'Mo', 'Ma'], yk: ['Ve'] }, { b: ['Ma', 'Mo'], m: ['Sa', 'Ve', 'Su', 'Me'], yk: [] }];
  function functional(ascSign) {
    var f = FUNC[ascSign], out = {};
    P7.forEach(function (c) {
      var hs = lordsOf(ascSign, c), kind = f.yk.indexOf(c) >= 0 ? 'yogakaraka' : f.b.indexOf(c) >= 0 ? 'benefic' : f.m.indexOf(c) >= 0 ? 'malefic' : (hs.indexOf(1) >= 0 ? 'benefic' : 'neutral');
      if (hs.indexOf(1) >= 0 && kind === 'malefic') kind = 'mixed';
      out[c] = { kind: kind, houses: hs, maraka: hs.indexOf(2) >= 0 || hs.indexOf(7) >= 0 };
    });
    var bad = [10, 8, 6][ascSign % 3];
    var badhakaHouse = [11, 9, 7][ascSign % 3];
    out.badhaka = { house: badhakaHouse, lord: lordOfHouse(ascSign, badhakaHouse) };
    return out;
  }

  /* ---------- Varshphal (Tajik) ---------- */
  var TRIRASHI = { day: ['Su', 'Ve', 'Sa', 'Ve', 'Ju', 'Mo', 'Me', 'Ma', 'Sa', 'Ma', 'Ju', 'Mo'], night: ['Ju', 'Mo', 'Me', 'Ma', 'Su', 'Ve', 'Sa', 'Ve', 'Sa', 'Mo', 'Me', 'Ma'] };
  function solarReturn(natalSunLon, year, m, approx) {
    var lo = approx - 6 * DAY, hi = approx + 6 * DAY;
    for (var k = 0; k < 60; k++) { var mid = (lo + hi) / 2, d = norm(C.sidereal('Su', new Date(mid), m) - natalSunLon); if (d > 180) lo = mid; else hi = mid; }
    return new Date(hi);
  }
  function tajikAspect(fromSign, toSign) { var h = houseFrom(fromSign, toSign); return [1, 3, 4, 5, 7, 9, 10, 11].indexOf(h) >= 0 ? (h === 3 || h === 11 || h === 5 || h === 9 ? 'friendly' : 'inimical') : null; }
  function dignityScore(code, lon) { var d = dignity(code, lon); return { 'Exalted': 5, 'Moolatrikona': 4.5, 'Own sign': 4, 'Friendly sign': 3, 'Neutral sign': 2, 'Enemy sign': 1, 'Debilitated': 0 }[d]; }
  function varshphal(natal, birth, age, lat, lon, m) {
    var approx = birth.getTime() + age * 365.2564 * DAY;
    var at = solarReturn(natal.P.Su.lon, null, m, approx);
    var V = kundli(at, lat, lon, { ayan: m });
    var muntha = (natal.ascSign + age) % 12;
    var obs = new A.Observer(lat, lon, 0), rise = A.SearchRiseSet('Sun', obs, +1, new Date(at.getTime() - DAY), 2), set = rise ? A.SearchRiseSet('Sun', obs, -1, rise.date, 2) : null;
    var isDay = rise && set ? (at >= rise.date && at < set.date) : true;
    var officers = [
      { role: 'Muntha lord', lord: RULER[muntha] }, { role: 'Janma lagna lord', lord: RULER[natal.ascSign] }, { role: 'Varsha lagna lord', lord: RULER[V.ascSign] },
      { role: 'Tri-rashi lord', lord: TRIRASHI[isDay ? 'day' : 'night'][V.ascSign] }, { role: (isDay ? 'Day' : 'Night') + ' lord', lord: RULER[isDay ? V.P.Su.sign : V.P.Mo.sign] }];
    officers.forEach(function (o) { var p = V.P[o.lord]; o.aspect = tajikAspect(p.sign, V.ascSign); o.score = dignityScore(o.lord, p.lon) + dignityScore(o.lord, varga(p.lon, 9).sign * 30 + 1) / 2; });
    var cands = officers.filter(function (o) { return o.aspect; }); if (!cands.length) cands = officers;
    var best = cands.slice().sort(function (a, b) { return b.score - a.score; })[0];
    /* Mudda dasha: Vimshottari compressed into the year, starting lord from (janma nakshatra + years - 2) mod 9 */
    var MUD = ['Su', 'Mo', 'Ma', 'Ra', 'Ju', 'Sa', 'Me', 'Ke', 'Ve'];
    var r = (natal.P.Mo.nak.num + age - 2) % 9; if (r === 0) r = 9;
    var yearLen = solarReturn(natal.P.Su.lon, null, m, at.getTime() + 365.2564 * DAY) - at, t = at.getTime(), mudda = [];
    for (var i = 0; i < 9; i++) { var lord = MUD[(r - 1 + i) % 9], len = yearLen * DYEARS[lord] / 120; mudda.push({ lord: lord, start: new Date(t), end: new Date(t + len) }); t += len; }
    return { at: at, end: new Date(at.getTime() + yearLen), chart: V, muntha: muntha, munthaHouse: houseFrom(V.ascSign, muntha), munthaNatalHouse: houseFrom(natal.ascSign, muntha), day: isDay, officers: officers, yearLord: best.lord, mudda: mudda };
  }

  /* ---------- yogas and doshas ---------- */
  function related(k, a, b) {
    var pa = k.P[a], pb = k.P[b];
    if (pa.sign === pb.sign) return 'conjunction';
    if (RULER[pa.sign] === b && RULER[pb.sign] === a) return 'exchange';
    if (aspectedHouses(a, pa.house).indexOf(pb.house) >= 0 && aspectedHouses(b, pb.house).indexOf(pa.house) >= 0) return 'mutual aspect';
    return null;
  }
  function yogas(k) {
    var out = [], L = k.ascSign, P = k.P, lord = function (h) { return lordOfHouse(L, h); };
    function add(name, kind, why) { out.push({ name: name, kind: kind, why: why }); }
    /* Raja yogas: kendra lord with trikona lord */
    var kendra = [1, 4, 7, 10], trikona = [1, 5, 9], seen = {};
    P7.forEach(function (c) { var hs = lordsOf(L, c); if (hs.some(function (h) { return kendra.indexOf(h) >= 0 && h !== 1; }) && hs.some(function (h) { return trikona.indexOf(h) >= 0 && h !== 1; })) add('Yogakaraka ' + PNAME[c], 'raja', PNAME[c] + ' rules both a kendra and a trikona (' + hs.join(' & ') + ').'); });
    kendra.forEach(function (kh) { trikona.forEach(function (th) {
      var a = lord(kh), b = lord(th); if (a === b || (kh === 1 && th === 1)) return;
      var key = [a, b].sort().join(); if (seen[key]) return;
      var r = related(k, a, b); if (r) { seen[key] = 1; add('Raja yoga', 'raja', PNAME[a] + ' (lord of ' + kh + ') and ' + PNAME[b] + ' (lord of ' + th + ') in ' + r + '.'); }
    }); });
    var l9 = lord(9), l10 = lord(10); if (l9 !== l10 && related(k, l9, l10)) add('Dharma-Karmadhipati yoga', 'raja', '9th lord ' + PNAME[l9] + ' and 10th lord ' + PNAME[l10] + ' in ' + related(k, l9, l10) + ': fortune joins career.');
    /* Dhana */
    var dh = [1, 2, 5, 9, 11], dseen = {};
    dh.forEach(function (h1) { dh.forEach(function (h2) { if (h1 >= h2) return; var a = lord(h1), b = lord(h2); if (a === b) return; var key = [a, b].sort().join(); if (dseen[key]) return; var r = related(k, a, b); if (r && (h1 === 2 || h1 === 11 || h2 === 2 || h2 === 11)) { dseen[key] = 1; add('Dhana yoga', 'dhana', 'Lords of ' + h1 + ' (' + PNAME[a] + ') and ' + h2 + ' (' + PNAME[b] + ') in ' + r + '.'); } }); });
    var l11 = lord(11); if (P[l11].house === 11 || P[l11].house === 2) add('Dhana yoga', 'dhana', '11th lord ' + PNAME[l11] + ' in the ' + P[l11].house + (P[l11].house === 11 ? 'th' : 'nd') + ': steady gains.');
    /* Panch Mahapurusha */
    [['Ma', 'Ruchaka'], ['Me', 'Bhadra'], ['Ju', 'Hamsa'], ['Ve', 'Malavya'], ['Sa', 'Sasa']].forEach(function (x) { var p = P[x[0]]; if ([1, 4, 7, 10].indexOf(p.house) >= 0 && (p.dignity === 'Exalted' || p.dignity === 'Own sign' || p.dignity === 'Moolatrikona')) add(x[1] + ' yoga', 'mahapurusha', PNAME[x[0]] + ' ' + p.dignity.toLowerCase() + ' in the ' + p.house + ' (a kendra).'); });
    var jm = houseFrom(P.Mo.sign, P.Ju.sign); if ([1, 4, 7, 10].indexOf(jm) >= 0) add('Gajakesari yoga', 'good', 'Jupiter in the ' + jm + ' from the Moon.');
    if (P.Su.sign === P.Me.sign) add('Budhaditya yoga', 'good', 'Sun and Mercury together in ' + SIGNS[P.Su.sign] + (P.Me.combust ? ' (Mercury combust, so milder)' : '') + '.');
    if (P.Mo.sign === P.Ma.sign) add('Chandra-Mangal yoga', 'dhana', 'Moon and Mars together: earning drive.');
    /* exchanges */
    P7.forEach(function (a) { P7.forEach(function (b) { if (a < b && RULER[P[a].sign] === b && RULER[P[b].sign] === a) {
      var hh = [P[a].house, P[b].house], dus = hh.some(function (x) { return [6, 8, 12].indexOf(x) >= 0; }), kh = hh.indexOf(3) >= 0;
      add((dus ? 'Dainya' : kh ? 'Khala' : 'Maha') + ' parivartana yoga', dus ? 'mild' : 'good', PNAME[a] + ' and ' + PNAME[b] + ' exchange signs (houses ' + hh.join(' ↔ ') + ')' + (dus ? ': mixed, as a dusthana is involved.' : kh ? ': results come through effort.' : ': the two houses support each other strongly.')); } }); });
    /* Vipreet Raja */
    [6, 8, 12].forEach(function (h) { var l = lord(h); if ([6, 8, 12].indexOf(P[l].house) >= 0 && lordsOf(L, l).indexOf(1) < 0) add(['', '', '', '', '', '', 'Harsha', '', 'Sarala', '', '', '', 'Vimala'][h] + ' (Vipreet Raja) yoga', 'raja', h + 'th lord ' + PNAME[l] + ' sits in the ' + P[l].house + 'th: gains through adversity.'); });
    /* Neecha bhanga */
    P7.forEach(function (c) { var p = P[c]; if (p.dignity !== 'Debilitated') return; var dl = RULER[p.sign], el = RULER[EXALT[c]], why = [];
      [dl, el].forEach(function (x) { if (x === c) return; var hL = P[x].house, hM = houseFrom(P.Mo.sign, P[x].sign); if ([1, 4, 7, 10].indexOf(hL) >= 0 || [1, 4, 7, 10].indexOf(hM) >= 0) why.push(PNAME[x] + ' in a kendra'); });
      if (why.length) add('Neecha Bhanga Raja yoga', 'raja', PNAME[c] + ' is debilitated but cancelled: ' + why.join(', ') + '.'); else add(PNAME[c] + ' debilitated', 'weak', PNAME[c] + ' in ' + SIGNS[p.sign] + ' without cancellation.'); });
    /* Amala, Adhi */
    var am = k.planets.filter(function (p) { return ['Ju', 'Ve', 'Me'].indexOf(p.code) >= 0 && p.house === 10; }); if (am.length) add('Amala yoga', 'good', am.map(function (p) { return p.name; }).join(', ') + ' in the 10th: good reputation.');
    var adhi = ['Ju', 'Ve', 'Me'].filter(function (c) { return [6, 7, 8].indexOf(houseFrom(P.Mo.sign, P[c].sign)) >= 0; }); if (adhi.length >= 2) add('Adhi yoga', 'good', adhi.map(function (c) { return PNAME[c]; }).join(', ') + ' in 6/7/8 from the Moon.');
    /* Doshas */
    var s2 = (P.Mo.sign + 1) % 12, s12 = (P.Mo.sign + 11) % 12, around = k.planets.filter(function (p) { return ['Su', 'Ra', 'Ke', 'Mo'].indexOf(p.code) < 0 && (p.sign === s2 || p.sign === s12 || p.sign === P.Mo.sign); });
    if (!around.length) add('Kemadruma yoga', 'dosha', 'No planet in the 2nd, 12th or with the Moon (Sun and nodes excluded).');
    var shk = houseFrom(P.Ju.sign, P.Mo.sign); if ([6, 8, 12].indexOf(shk) >= 0) add('Shakata yoga', 'dosha', 'Moon in the ' + shk + ' from Jupiter: ups and downs in fortune.');
    var ra = P.Ra.lon, inArc = function (x) { return norm(x - ra) < 180; }, sides = P7.map(function (c) { return inArc(P[c].lon); });
    if (sides.every(function (x) { return x; }) || sides.every(function (x) { return !x; })) add('Kaal Sarp dosha', 'dosha', 'All seven planets lie on one side of the Rahu–Ketu axis.');
    var md = [1, 2, 4, 7, 8, 12], mHouses = [['lagna', P.Ma.house], ['Moon', houseFrom(P.Mo.sign, P.Ma.sign)], ['Venus', houseFrom(P.Ve.sign, P.Ma.sign)]].filter(function (x) { return md.indexOf(x[1]) >= 0; });
    if (mHouses.length) add('Mangal dosha', mHouses[0][0] === 'lagna' || mHouses[0][0] === 'Moon' ? 'dosha' : 'mild', 'Mars in the ' + mHouses.map(function (x) { return x[1] + ' from ' + x[0]; }).join(', ') + '.' + (P.Ma.dignity === 'Own sign' || P.Ma.dignity === 'Exalted' ? ' Reduced: Mars is strong in its sign.' : ''));
    return out;
  }

  return { SIGNS: SIGNS, SIGNS_HI: SIGNS_HI, SG3: SG3, NAKS: NAKS, PNAME: PNAME, PHI: PHI, PC: PC, P7: P7, RULER: RULER, DORDER: DORDER, DYEARS: DYEARS, EXALT: EXALT, OWN: OWN, FRIEND: FRIEND, ENEMY: ENEMY, ASPECTS: ASPECTS,
    VARAS: VARAS, VARAS_HI: VARAS_HI, VARA_LORD: VARA_LORD, YOGAS: YOGAS, TITHIS: TITHIS, VARGAS: VARGAS, YOGINI: YOGINI, AV: AV,
    signOf: signOf, dms: dms, dm: dm, houseFrom: houseFrom, nakInfo: nakInfo, kpLords: kpLords, dignity: dignity, isCombust: isCombust, varga: varga, d60Deity: d60Deity,
    kundli: kundli, lordsOf: lordsOf, lordOfHouse: lordOfHouse, aspectedHouses: aspectedHouses, aspectsOnHouse: aspectsOnHouse,
    setDashaYear: setDashaYear, dashas: dashas, subPeriods: subPeriods, dashaChain: dashaChain, find: find, yogini: yogini, yoginiSub: yoginiSub,
    sunEvent: sunEvent, moonEvent: moonEvent, panchang: panchang, panchangLite: panchangLite, tithiAt: tithiAt, yogaAt: yogaAt, karanaAt: karanaAt, elong: elong, nextCrossing: nextCrossing, vishtiWindows: vishtiWindows,
    dayParts: dayParts, horas: horas, choghadiya: choghadiya, lunarMonth: lunarMonth, samvat: samvat, newMoonBefore: newMoonBefore,
    events: events, nextIngress: nextIngress, signWindows: signWindows, ashtakavarga: ashtakavarga, kpSignificators: kpSignificators, rulingPlanets: rulingPlanets, horaryTable: horaryTable, horary: horary,
    functional: functional, varshphal: varshphal, solarReturn: solarReturn, yogas: yogas, related: related };
}
if (typeof module !== 'undefined') module.exports = makeJyotish;
