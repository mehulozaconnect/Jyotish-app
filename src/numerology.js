/* Trikaal numerology: Mulank, Bhagyank, Chaldean name number, Kua, Lo Shu grid, personal year,
   lucky numbers and days, colours to wear, mobile number check. Number friendships follow the same
   Parashari planet friendships the rest of the app uses (1 Sun, 2 Moon, 3 Jupiter, 4 Rahu, 5 Mercury, 6 Venus, 7 Ketu, 8 Saturn, 9 Mars). */
function makeNumerology(J) {
  var PL = [null, 'Su', 'Mo', 'Ju', 'Ra', 'Me', 'Ve', 'Ke', 'Sa', 'Ma'], PN = J.PNAME;
  var CH = { A: 1, I: 1, J: 1, Q: 1, Y: 1, B: 2, K: 2, R: 2, C: 3, G: 3, L: 3, S: 3, D: 4, M: 4, T: 4, E: 5, H: 5, N: 5, X: 5, U: 6, V: 6, W: 6, O: 7, Z: 7, F: 8, P: 8 };
  var COL = { Su: ['Orange', 'Gold', 'Saffron', '#E8892B'], Mo: ['White', 'Cream', 'Silver', '#E9E6DA'], Ju: ['Yellow', 'Turmeric', 'Light gold', '#E5B91E'], Ra: ['Grey', 'Smoky blue', 'Khaki', '#7E8794'], Me: ['Green', 'Parrot green', 'Mint', '#3E9B5A'],
    Ve: ['White', 'Pink', 'Light blue', '#E8A3B8'], Ke: ['Brown', 'Ash', 'Multicolour', '#8B6F5A'], Sa: ['Navy blue', 'Black', 'Dark purple', '#2B3A67'], Ma: ['Red', 'Maroon', 'Coral', '#C8382E'] };
  var WD = { Su: 0, Mo: 1, Ma: 2, Me: 3, Ju: 4, Ve: 5, Sa: 6, Ra: 6, Ke: 2 };
  var DAYN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  function red(n) { n = Math.abs(n); while (n > 9) n = String(n).split('').reduce(function (s, d) { return s + +d; }, 0); return n; }
  function digits(s) { return String(s).replace(/\D/g, '').split('').map(Number); }
  function rel(a, b) { if (a === b) return 1; var A = PL[a], B = PL[b]; var f = J.FRIEND[A].indexOf(B) >= 0, e = J.ENEMY[A].indexOf(B) >= 0, f2 = J.FRIEND[B].indexOf(A) >= 0, e2 = J.ENEMY[B].indexOf(A) >= 0; return (f ? 1 : e ? -1 : 0) + (f2 ? 1 : e2 ? -1 : 0) > 0 ? 1 : (e || e2) && !(f || f2) ? -1 : 0; }
  function nameNum(name) { var t = 0; String(name || '').toUpperCase().replace(/[^A-Z]/g, '').split('').forEach(function (ch) { t += CH[ch] || 0; }); return { compound: t, single: red(t) }; }
  function kua(year, male) { var y = red(String(year).split('').reduce(function (s, d) { return s + +d; }, 0)), k;
    if (year >= 2000) k = male ? red(9 - y) || 9 : red(y + 6); else k = male ? red(11 - y) || 9 : red(y + 4);
    if (k === 5) k = male ? 2 : 8; return k; }
  var KUA_DIR = { 1: 'North (Water)', 2: 'South-west (Earth)', 3: 'East (Wood)', 4: 'South-east (Wood)', 6: 'North-west (Metal)', 7: 'West (Metal)', 8: 'North-east (Earth)', 9: 'South (Fire)' };
  var GRID = [4, 9, 2, 3, 5, 7, 8, 1, 6];
  var PLANES = [[[4, 9, 2], 'Mental plane', 'sharp memory and ideas'], [[3, 5, 7], 'Emotional plane', 'emotional balance and calm'], [[8, 1, 6], 'Practical plane', 'getting things done and money sense'],
    [[4, 3, 8], 'Thought plane', 'planning and foresight'], [[9, 5, 1], 'Will plane', 'determination and drive'], [[2, 7, 6], 'Action plane', 'turning plans into action'], [[4, 5, 6], 'Golden yoga', 'prosperity and success'], [[2, 5, 8], 'Silver yoga', 'property and stability']];
  var MISS = { 1: ['Self-expression', 'Finds it hard to speak up and show confidence. Example: practise saying your point first in meetings.'], 2: ['Sensitivity', 'Can miss others\' feelings or be hurt easily. Example: pause and ask "how are you feeling?" before deciding.'],
    3: ['Imagination and planning', 'Ideas need structure. Example: write a weekly plan every Sunday.'], 4: ['Discipline and order', 'Routines slip easily. Example: fixed wake-up time and a tidy desk.'], 5: ['Balance', 'Hard to stay centred under stress. Example: 10 minutes of breathing or a walk every day.'],
    6: ['Home and family', 'Work can crowd out family. Example: a fixed family dinner twice a week.'], 7: ['Patience and learning from loss', 'Lessons come through setbacks. Example: keep a notebook of what each setback taught.'],
    8: ['Money system', 'Saving and long-term planning do not come naturally. Example: an automatic SIP on salary day works better than willpower.'], 9: ['Drive and idealism', 'Energy and ambition need a push. Example: one clear yearly goal, reviewed monthly.'] };
  var MANY = { 1: 'Strong voice; can be stubborn or talk too much', 2: 'Very sensitive and intuitive; moods can swing', 3: 'Very imaginative; can worry or overthink', 4: 'Very hard-working; can get rigid', 5: 'Restless and energetic; needs freedom, can be impulsive',
    6: 'Very caring; can worry about family too much', 7: 'Deep thinker; faces repeated tests and losses before success', 8: 'Strong with money and detail; can be over-cautious', 9: 'Big ideals and drive; can be quick-tempered' };
  var CORE = { 1: 'Leader, independent, confident', 2: 'Gentle, intuitive, cooperative', 3: 'Wise, disciplined, a guide for others', 4: 'Unconventional, hard-working, sudden turns in life', 5: 'Quick, communicative, business-minded',
    6: 'Loving, artistic, family-oriented, enjoys comfort', 7: 'Spiritual, research-minded, intuitive', 8: 'Patient, serious, success comes late but lasts', 9: 'Energetic, brave, protective, quick to act' };
  function analyze(p, now) {
    now = now || new Date();
    var d = p.date.split('-').map(Number), Y = d[0], M = d[1], D = d[2], male = p.gender !== 'F';
    var mul = red(D), bha = red(digits(p.date).reduce(function (s, x) { return s + x; }, 0)), nm = nameNum(p.name), kk = kua(Y, male);
    var dd = digits(String(D).padStart(2, '0') + String(M).padStart(2, '0') + Y).filter(function (x) { return x; });
    var all = dd.slice(); if (D >= 10) all.push(mul); all.push(bha); all.push(kk);
    var cnt = {}; for (var i = 1; i <= 9; i++) cnt[i] = 0; all.forEach(function (x) { cnt[x]++; });
    var missing = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(function (x) { return !cnt[x]; }), repeat = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(function (x) { return cnt[x] >= 2; });
    var planes = PLANES.map(function (pl) { return { nums: pl[0], name: pl[1], gives: pl[2], full: pl[0].every(function (x) { return cnt[x]; }), empty: pl[0].every(function (x) { return !cnt[x]; }) }; });
    var py = red(D + M + digits(now.getFullYear()).reduce(function (s, x) { return s + x; }, 0));
    /* lucky: friendly to both Mulank and Bhagyank */
    /* lucky: friendly to one core number and hostile to neither; avoid: hostile to one and not friendly to the other */
    var lucky = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(function (n) { return n === mul || n === bha || (rel(n, mul) >= 0 && rel(n, bha) >= 0 && (rel(n, mul) > 0 || rel(n, bha) > 0)); });
    var avoid = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(function (n) { return n !== mul && n !== bha && ((rel(n, mul) < 0 && rel(n, bha) <= 0) || (rel(n, bha) < 0 && rel(n, mul) <= 0)); });
    lucky = lucky.filter(function (n) { return avoid.indexOf(n) < 0; });
    var days = []; lucky.forEach(function (n) { var w = WD[PL[n]]; if (days.indexOf(w) < 0) days.push(w); });
    var nameOk = rel(nm.single, mul) >= 0 && rel(nm.single, bha) >= 0;
    return { mul: mul, bha: bha, name: nm, nameOk: nameOk, kua: kk, kuaDir: KUA_DIR[kk], cnt: cnt, missing: missing, repeat: repeat, planes: planes, py: py, lucky: lucky, avoid: avoid,
      days: days.sort().map(function (w) { return DAYN[w]; }), colours: N_colours(lucky, avoid), core: CORE, PL: PL };
  }
  function N_colours(lucky, avoid) {
    var good = [], bad = [];
    lucky.forEach(function (n) { var c = COL[PL[n]]; good.push({ n: n, planet: PL[n], names: c.slice(0, 3), hex: c[3] }); });
    avoid.forEach(function (n) { var c = COL[PL[n]]; bad.push({ n: n, planet: PL[n], names: c.slice(0, 2), hex: c[3] }); });
    return { good: good, bad: bad };
  }
  /* what to wear on a given weekday: the day's planet colour if it is friendly, otherwise the best lucky colour */
  function wear(A, wd, helpPlanet) {
    var dayPl = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa'][wd], dayN = PL.indexOf(dayPl), ok = A.avoid.indexOf(dayN) < 0;
    var pick = ok ? dayPl : (helpPlanet && A.avoid.indexOf(PL.indexOf(helpPlanet)) < 0 ? helpPlanet : PL[A.lucky[0]]), c = COL[pick];
    return { planet: pick, names: c.slice(0, 2), hex: c[3], why: ok ? DAYN[wd] + ' is ' + PN[dayPl] + '\'s day, and ' + PN[dayPl] + ' is friendly to your numbers' : DAYN[wd] + '\'s planet ' + PN[dayPl] + ' does not suit your numbers, so wear ' + PN[pick] + '\'s colour instead', avoid: A.colours.bad.map(function (x) { return x.names[0]; }).filter(function (x, i, a) { return a.indexOf(x) === i && c.slice(0, 3).indexOf(x) < 0; }) };
  }
  /* mobile number check */
  function mobile(A, num) {
    var ds = digits(num); if (ds.length > 10) ds = ds.slice(-10); if (ds.length < 10) return null;
    var tot = red(ds.reduce(function (s, x) { return s + x; }, 0)), last = ds[9], r1 = rel(tot, A.mul), r2 = rel(tot, A.bha), zeros = ds.filter(function (x) { return !x; }).length;
    var bad = A.avoid.filter(function (n) { return ds.filter(function (x) { return x === n; }).length >= 3; });
    var score = (r1 + r2) + (A.lucky.indexOf(last) >= 0 ? 0.5 : A.avoid.indexOf(last) >= 0 ? -0.5 : 0) - (zeros >= 3 ? 0.5 : 0) - bad.length * 0.5;
    var v = score >= 1.5 ? 'g' : score >= 0 ? 'm' : 'b', why = ['Total ' + tot + ' (' + PN[PL[tot]] + ') is ' + (r1 < 0 || r2 < 0 ? 'not friendly to your ' + (r1 < 0 ? 'Mulank ' + A.mul : 'Bhagyank ' + A.bha) : r1 > 0 && r2 > 0 ? 'friendly to both your Mulank and Bhagyank' : r1 > 0 ? 'friendly to your Mulank ' + A.mul : r2 > 0 ? 'friendly to your Bhagyank ' + A.bha : 'neutral to your numbers')];
    if (A.avoid.indexOf(last) >= 0) why.push('it ends in ' + last + ', a number that does not suit you'); else if (A.lucky.indexOf(last) >= 0) why.push('it ends in ' + last + ', one of your lucky numbers');
    if (zeros >= 3) why.push(zeros + ' zeros weaken it'); if (bad.length) why.push(bad.join(' and ') + ' repeat too often');
    return { tot: tot, v: v, word: v === 'g' ? 'Suits you' : v === 'b' ? 'Not ideal' : 'Neutral', why: why, best: A.lucky.filter(function (n) { return rel(n, A.mul) >= 0 && rel(n, A.bha) >= 0; }) };
  }
  /* switch words: short words said or written repeatedly for a goal (the person can add their own) */
  var SWITCH = [['Money and sales', ['Count', 'Fetch', 'Bring', 'Prosper']], ['Health and healing', ['Be', 'Divine', 'Off', 'Elevate']], ['Peace of mind', ['Together', 'Off', 'Crisscross', 'Bless']],
    ['Career and success', ['Crown', 'Reach', 'Done', 'Up']], ['Relationships', ['Together', 'Love', 'Bless', 'On']], ['Finding something lost', ['Reach', 'Find', 'Fetch']], ['Protection', ['Guard', 'Cover', 'Divine']], ['Study and memory', ['Reach', 'Find', 'Learn', 'Focus']]];
  return { analyze: analyze, wear: wear, mobile: mobile, nameNum: nameNum, red: red, rel: rel, SWITCH: SWITCH, MISS: MISS, MANY: MANY, CORE: CORE, COL: COL, PL: PL, GRID: GRID, KUA_DIR: KUA_DIR };
}
if (typeof module !== 'undefined') module.exports = makeNumerology;
