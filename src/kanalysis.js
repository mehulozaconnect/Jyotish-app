/* Trikaal: Kundli analysis. One complete reading of a birth chart, computed from the engine.
   Sections: snapshot, pros, cons, yogas, golden dasha periods, lifetime dasha map, remedies,
   health timeline, success timeline, nature, deity, food for the running dasha, lucky factors. */
function makeKundliAnalysis(A, C, J, KB, N, S) {
  var PN = J.PNAME, SG = J.SIGNS, nth = N.nth, dmy = N.dmy, DAY = 864e5, YEAR = 365.25 * DAY;
  var GOODD = ['Exalted', 'Own sign', 'Moolatrikona'];
  var KENDRA = [1, 4, 7, 10], TRIK = [1, 5, 9], DUS = [6, 8, 12];
  function uniq(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }
  function list(a) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function dY(d) { return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getUTCMonth()] + ' ' + d.getUTCFullYear(); }
  function age(c, d) { return Math.floor((d - c.birth) / YEAR); }

  /* ---------- reference data ---------- */
  var DEITY = {
    Su: ['Surya Dev and Shri Ram', 'Offer water (Arghya) to the rising Sun; recite Aditya Hridayam on Sundays.'],
    Mo: ['Lord Shiva and Mata Parvati', 'Offer water or milk on a Shivling on Mondays; chant Om Namah Shivaya.'],
    Ma: ['Lord Hanuman and Kartikeya', 'Read Hanuman Chalisa on Tuesdays; offer sindoor and jaggery.'],
    Me: ['Lord Vishnu and Ganesha', 'Chant Vishnu Sahasranama or Om Namo Narayanaya on Wednesdays; offer durva to Ganesha.'],
    Ju: ['Guru Dattatreya and Lord Vishnu', 'Visit a temple on Thursdays; offer chana dal and turmeric; respect your teachers.'],
    Ve: ['Goddess Lakshmi', 'Light a ghee lamp and recite Shri Suktam on Fridays; keep the home clean and fragrant.'],
    Sa: ['Lord Shiva (Mahakal) and Hanuman', 'Light a mustard-oil lamp under a peepal tree on Saturdays; read Hanuman Chalisa.'],
    Ra: ['Goddess Durga', 'Read Durga Saptashati or chant Om Dum Durgayei Namah; feed the needy.'],
    Ke: ['Lord Ganesha', 'Chant Om Gan Ganapataye Namah; offer modak or laddoo on Tuesdays.'] };
  var FOOD = {
    Su: ['wheat, jaggery, saffron, almonds, oranges, carrots', 'very spicy, oily and heating food'],
    Mo: ['rice, milk, curd, kheer, coconut water, cucumber, white foods', 'stale food and late-night heavy meals'],
    Ma: ['red lentils (masoor), pomegranate, beetroot, jaggery, dates', 'excess chilli, alcohol and fried snacks'],
    Me: ['green moong, leafy greens, green fruits, sprouts, amla', 'junk food and skipping meals'],
    Ju: ['chana dal, turmeric, bananas, besan, a little ghee, yellow fruits', 'excess sweets and fatty food'],
    Ve: ['rice, curd, fresh fruits, white sweets in moderation, cardamom', 'over-indulgence, too much sugar'],
    Sa: ['black sesame, urad dal, millets (bajra, jowar), mustard-oil cooking, simple home food', 'stale, fried and processed food; alcohol'],
    Ra: ['barley, coconut, simple sattvic home food, fresh fruit', 'alcohol, processed food, eating out late'],
    Ke: ['sesame, multigrain roti, sprouts, herbal teas, light meals', 'irregular meals and heavy non-veg'] };
  var COLOR = { Su: 'orange, copper', Mo: 'white, silver', Ma: 'red, coral', Me: 'green', Ju: 'yellow, gold', Ve: 'white, pastel pink', Sa: 'navy blue, black', Ra: 'smoky grey', Ke: 'grey, brown' };
  var NUM = { Su: 1, Mo: 2, Ju: 3, Ra: 4, Me: 5, Ve: 6, Ke: 7, Sa: 8, Ma: 9 };
  var DAYN = { Su: 'Sunday', Mo: 'Monday', Ma: 'Tuesday', Me: 'Wednesday', Ju: 'Thursday', Ve: 'Friday', Sa: 'Saturday' };
  var AK_LESSON = { Su: 'learning humility while leading; respect for father and authority', Mo: 'emotional balance and caring for others, especially mother', Ma: 'using courage and energy wisely; controlling anger', Me: 'truthful speech and right use of intellect', Ju: 'wisdom, teaching and keeping faith', Ve: 'balance in relationships and desires', Sa: 'patience, discipline and serving others without complaint' };
  var GANA = ['Deva', 'Manushya', 'Rakshasa', 'Manushya', 'Deva', 'Manushya', 'Deva', 'Deva', 'Rakshasa', 'Rakshasa', 'Manushya', 'Manushya', 'Deva', 'Rakshasa', 'Deva', 'Rakshasa', 'Deva', 'Rakshasa', 'Rakshasa', 'Manushya', 'Manushya', 'Deva', 'Rakshasa', 'Rakshasa', 'Manushya', 'Manushya', 'Deva'];
  var GANA_T = { Deva: 'gentle, giving and idealistic', Manushya: 'practical, balanced and people-oriented', Rakshasa: 'strong-willed, independent and fiercely protective' };
  var NADI = ['Adi', 'Madhya', 'Antya', 'Antya', 'Madhya', 'Adi', 'Adi', 'Madhya', 'Antya', 'Antya', 'Madhya', 'Adi', 'Adi', 'Madhya', 'Antya', 'Antya', 'Madhya', 'Adi', 'Adi', 'Madhya', 'Antya', 'Antya', 'Madhya', 'Adi', 'Adi', 'Madhya', 'Antya'];
  var NADI_D = { Adi: ['Vata', 'warm, cooked, slightly oily food; regular meal times; avoid cold and dry food'], Madhya: ['Pitta', 'cooling food like curd rice, coconut, sweet fruits; avoid excess chilli and sour food'], Antya: ['Kapha', 'light, warm, spiced food; ginger and pepper; avoid heavy, cold and very sweet food'] };
  var VARNA = ['Kshatriya', 'Vaishya', 'Shudra', 'Brahmin'];
  var ELEM_T = { fire: 'drive and confidence', earth: 'practicality and stability', air: 'ideas and communication', water: 'feeling and intuition' };
  var HOUSE_WORD = { 1: 'self and health', 2: 'wealth and family', 3: 'courage and effort', 4: 'home, property and peace', 5: 'children, intellect and creativity', 6: 'competition, service and loans', 7: 'marriage and partnerships', 8: 'sudden events and research', 9: 'luck, father and dharma', 10: 'career and status', 11: 'income and gains', 12: 'expenses, foreign and rest' };

  /* ---------- scoring ---------- */
  function natalScore(c, code) {
    var k = c.k, p = k.P[code], s = 0, why = [];
    var fx = code === 'Ra' || code === 'Ke' ? null : c.func[code];
    if (fx) {
      var fs = { yogakaraka: 3, benefic: 2, mixed: 0.5, neutral: 0, malefic: -1.5 }[fx.kind] || 0;
      s += fs; why.push('functional ' + fx.kind + (fx.houses.length ? ' (rules ' + fx.houses.map(nth).join(' & ') + ')' : ''));
      var st = S.strength(c, code); s += st.score * 0.6; why.push(st.word.toLowerCase() + ' (' + p.dignity.toLowerCase() + ')');
    } else {
      /* nodes give the results of their sign lord and house */
      var disp = J.RULER[p.sign], d = c.func[disp], ds = { yogakaraka: 2, benefic: 1.5, mixed: 0.3, neutral: 0, malefic: -1 }[d.kind] || 0;
      s += ds - 0.5; why.push('acts like ' + PN[disp] + ' (' + d.kind + ')');
    }
    if (KENDRA.concat(TRIK).indexOf(p.house) >= 0) { s += 1; why.push('in the ' + nth(p.house) + ' (strong house)'); }
    else if (p.house === 11) { s += 1; why.push('in the 11th (gains)'); }
    else if (DUS.indexOf(p.house) >= 0) { var own = J.lordsOf(k.ascSign, code).filter(function (h) { return DUS.indexOf(h) >= 0; }).length; s += own ? 0.3 : -1; why.push('in the ' + nth(p.house) + (own ? ' (own dusthana, vipreet effect)' : ' (difficult house)')); }
    var sav = c.av.sav[p.sign]; if (sav >= 30) { s += 0.5; why.push(sav + ' SAV points'); } else if (sav < 25) { s -= 0.5; why.push('only ' + sav + ' SAV points'); }
    return { s: s, why: why };
  }
  function hwAt(c, h, d) { var ag = age(c, d); return typeof NARR !== 'undefined' ? NARR.areaWord(h, ag, HOUSE_WORD[h]) : HOUSE_WORD[h]; }
  function rateWord(s) { return s >= 3 ? 'Golden' : s >= 1.5 ? 'Good' : s >= 0 ? 'Mixed' : 'Testing'; }
  function linkHouses(c, code) { var k = c.k; return uniq(J.lordsOf(k.ascSign, code).concat([k.P[code].house])); }

  /* ---------- extra yogas (on top of the engine list) ---------- */
  function moreYogas(c) {
    var k = c.k, P = k.P, out = [];
    function add(name, kind, why) { out.push({ name: name, kind: kind, why: why }); }
    function conj(a, b) { return P[a].sign === P[b].sign; }
    if (conj('Ju', 'Ra')) add('Guru Chandal yoga', 'dosha', 'Jupiter with Rahu in ' + SG[P.Ju.sign] + ': judgment and guidance can be clouded; respect teachers.');
    if (conj('Su', 'Ra') || conj('Su', 'Ke') || conj('Mo', 'Ra') || conj('Mo', 'Ke')) add('Grahan yoga', 'dosha', ['Su', 'Mo'].filter(function (x) { return conj(x, 'Ra') || conj(x, 'Ke'); }).map(function (x) { return PN[x] + ' with ' + (conj(x, 'Ra') ? 'Rahu' : 'Ketu'); }).join(', ') + ': eclipsed light, inner restlessness.');
    if (conj('Su', 'Sa') || conj('Su', 'Ra')) add('Pitru dosha (indication)', 'dosha', 'Sun with ' + (conj('Su', 'Sa') ? 'Saturn' : 'Rahu') + ': ancestral karma; Shraddha and service to elders help.');
    if (conj('Sa', 'Ra')) add('Shrapit yoga', 'dosha', 'Saturn with Rahu: delays that clear through patience and service.');
    var s2 = (P.Mo.sign + 1) % 12, s12 = (P.Mo.sign + 11) % 12, ok = ['Ma', 'Me', 'Ju', 'Ve', 'Sa'];
    var a2 = ok.filter(function (x) { return P[x].sign === s2; }), a12 = ok.filter(function (x) { return P[x].sign === s12; });
    if (a2.length && a12.length) add('Durudhara yoga', 'good', 'Planets on both sides of the Moon (' + list(a2.concat(a12).map(function (x) { return PN[x]; })) + '): comfort and support.');
    else if (a2.length) add('Sunapha yoga', 'good', list(a2.map(function (x) { return PN[x]; })) + ' in the 2nd from the Moon: self-earned wealth.');
    else if (a12.length) add('Anapha yoga', 'good', list(a12.map(function (x) { return PN[x]; })) + ' in the 12th from the Moon: good health and character.');
    var b2 = ok.concat(['Mo']).filter(function (x) { return x !== 'Mo' && P[x].sign === (P.Su.sign + 1) % 12; }), b12 = ok.filter(function (x) { return P[x].sign === (P.Su.sign + 11) % 12; });
    if (b2.length && b12.length) add('Ubhayachari yoga', 'good', 'Planets on both sides of the Sun: balanced, capable personality.');
    else if (b2.length) add('Vesi yoga', 'good', list(b2.map(function (x) { return PN[x]; })) + ' in the 2nd from the Sun: good reputation.');
    else if (b12.length) add('Vasi yoga', 'good', list(b12.map(function (x) { return PN[x]; })) + ' in the 12th from the Sun: generous and liked.');
    var l9 = J.lordOfHouse(k.ascSign, 9), ll = J.lordOfHouse(k.ascSign, 1);
    if (KENDRA.concat(TRIK).indexOf(P[l9].house) >= 0 && GOODD.indexOf(P[l9].dignity) >= 0 && DUS.indexOf(P[ll].house) < 0) add('Lakshmi yoga', 'dhana', '9th lord ' + PN[l9] + ' strong (' + P[l9].dignity.toLowerCase() + ') in the ' + nth(P[l9].house) + ': prosperity and grace.');
    var sar = ['Ju', 'Ve', 'Me'].filter(function (x) { return KENDRA.concat(TRIK).concat([2]).indexOf(P[x].house) >= 0; });
    if (sar.length === 3 && ['Debilitated', 'Enemy sign'].indexOf(P.Ju.dignity) < 0) add('Saraswati yoga', 'good', 'Jupiter, Venus and Mercury in strong houses: learning, arts and eloquence.');
    var vg = k.planets.filter(function (p) { return J.varga(p.lon, 9).sign === p.sign; }).map(function (p) { return PN[p.code]; });
    if (vg.length) add('Vargottama ' + list(vg), 'good', 'Same sign in D1 and D9: ' + list(vg) + ' give steady, reliable results.');
    return out;
  }

  /* ---------- sections ---------- */
  function analyze(c, now) {
    var k = c.k, P = k.P, L = k.ascSign, ll = J.lordOfHouse(L, 1), out = {};
    var allYogas = c.yogas.concat(moreYogas(c));
    var sc = {}; ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke'].forEach(function (x) { sc[x] = natalScore(c, x); });
    var savH = []; for (var h = 1; h <= 12; h++) savH.push({ h: h, v: N.savOf(c, h) });

    /* snapshot */
    var chain = J.dashaChain(c.maha, now, 3);
    var ak = J.P7.slice().sort(function (a, b) { return (P[b].lon % 30) - (P[a].lon % 30); })[0];
    var strongest = J.P7.slice().sort(function (a, b) { return sc[b].s - sc[a].s; });
    var total = J.P7.reduce(function (t, x) { return t + sc[x].s; }, 0) + allYogas.filter(function (y) { return /raja|dhana|mahapurusha|good/.test(y.kind); }).length * 0.6 - allYogas.filter(function (y) { return y.kind === 'dosha'; }).length * 0.6;
    var grade = total >= 12 ? ['Very strong chart', 'A well-supported chart: many planets work for you.'] : total >= 6 ? ['Strong chart', 'Good support overall, with a few areas that need effort.'] : total >= 1 ? ['Balanced chart', 'Mixed support: results come through steady effort and good timing.'] : ['Challenging chart', 'Results come later and through persistence; remedies and timing matter more.'];
    out.snapshot = { lagna: SG[L], lagnaLord: PN[ll], moon: SG[P.Mo.sign], nak: P.Mo.nak.name + ' pada ' + P.Mo.nak.pada, sun: SG[P.Su.sign], ak: PN[ak], grade: grade, score: Math.round(total * 10) / 10,
      dasha: chain.map(function (x) { return PN[x.lord]; }).join(' / '), best: strongest.slice(0, 3).map(function (x) { return PN[x]; }), weak: strongest.slice(-2).reverse().map(function (x) { return PN[x]; }) };

    /* pros and cons */
    var pros = [], cons = [];
    var lp = P[ll];
    if (KENDRA.concat(TRIK).concat([2, 11]).indexOf(lp.house) >= 0 && lp.dignity !== 'Debilitated') pros.push({ t: 'Strong lagna lord: ' + PN[ll] + ' in the ' + nth(lp.house), why: [PN[ll] + ' is ' + lp.dignity.toLowerCase() + ' in ' + SG[lp.sign] + '; good health, confidence and self-made progress.'] });
    if (DUS.indexOf(lp.house) >= 0 && lp.house !== 1) cons.push({ t: 'Lagna lord ' + PN[ll] + ' in the ' + nth(lp.house), why: ['Your own planet sits in a difficult house: progress needs extra effort and health needs regular care.'] });
    if (lp.dignity === 'Debilitated') cons.push({ t: 'Lagna lord ' + PN[ll] + ' is debilitated', why: ['Self-confidence and stamina can dip; strengthen ' + PN[ll] + ' with its mantra and routine.'] });
    J.P7.forEach(function (x) {
      var p = P[x], fx = c.func[x];
      if (GOODD.indexOf(p.dignity) >= 0) pros.push({ t: PN[x] + ' is ' + p.dignity.toLowerCase() + ' in ' + SG[p.sign], why: [PN[x] + ' gives full results for ' + list(linkHouses(c, x).map(function (h) { return HOUSE_WORD[h]; })) + '.'] });
      if (p.dignity === 'Debilitated' && !allYogas.some(function (y) { return /Neecha Bhanga/.test(y.name) && y.why.indexOf(PN[x]) === 0; })) cons.push({ t: PN[x] + ' is debilitated in ' + SG[p.sign], why: ['Weak results for ' + list(linkHouses(c, x).map(function (h) { return HOUSE_WORD[h]; })) + ' until strengthened.'] });
      if (p.combust && x !== 'Su') cons.push({ t: PN[x] + ' is combust (too close to the Sun)', why: [PN[x] + "'s significations (" + KB.PLANET[x].karaka.split(',').slice(0, 2).join(',') + ') lose some strength.'] });
      if (fx.kind === 'yogakaraka') pros.push({ t: PN[x] + ' is your yogakaraka', why: ['It rules both a kendra and a trikona (' + fx.houses.map(nth).join(' & ') + '): its periods lift status and fortune.'] });
    });
    if (KENDRA.indexOf(P.Ju.house) >= 0 || J.aspectedHouses('Ju', P.Ju.house).indexOf(1) >= 0) pros.push({ t: 'Jupiter protects the chart', why: ['Jupiter in the ' + nth(P.Ju.house) + (J.aspectedHouses('Ju', P.Ju.house).indexOf(1) >= 0 ? ' aspects your lagna' : ' sits in a kendra') + ': grace and recovery in tough times.'] });
    var sorted = savH.slice().sort(function (a, b) { return b.v - a.v; });
    pros.push({ t: 'Strongest life areas: ' + sorted.slice(0, 3).map(function (x) { return HOUSE_WORD[x.h]; }).join('; '), why: sorted.slice(0, 3).map(function (x) { return nth(x.h) + ' house: ' + x.v + ' Ashtakavarga points (average 28).'; }) });
    cons.push({ t: 'Weaker life areas: ' + sorted.slice(-3).reverse().map(function (x) { return HOUSE_WORD[x.h]; }).join('; '), why: sorted.slice(-3).reverse().map(function (x) { return nth(x.h) + ' house: only ' + x.v + ' Ashtakavarga points.'; }) });
    var s11 = N.savOf(c, 11), s12 = N.savOf(c, 12);
    (s11 > s12 ? pros : cons).push({ t: s11 > s12 ? 'Income tends to run ahead of expenses' : 'Expenses tend to keep pace with income', why: ['11th house ' + s11 + ' vs 12th house ' + s12 + ' points.'] });
    allYogas.filter(function (y) { return /raja|mahapurusha|dhana/.test(y.kind) && !/^Yogakaraka/.test(y.name); }).slice(0, 4).forEach(function (y) { pros.push({ t: y.name, why: [y.why] }); });
    allYogas.filter(function (y) { return y.kind === 'dosha' || y.kind === 'weak'; }).forEach(function (y) { cons.push({ t: y.name, why: [y.why] }); });
    allYogas.filter(function (y) { return y.kind === 'mild'; }).forEach(function (y) { cons.push({ t: y.name + ' (mild)', why: [y.why] }); });
    /* weakest planets: their areas need support */
    J.P7.slice().sort(function (a, b) { return sc[a].s - sc[b].s; }).slice(0, 2).forEach(function (x) {
      if (sc[x].s >= 1.5) return;
      cons.push({ t: PN[x] + ' needs support', why: [PN[x] + ': ' + sc[x].why.join(', ') + '.', 'Affects ' + list(linkHouses(c, x).map(function (h) { return HOUSE_WORD[h]; })) + '; also ' + KB.PLANET[x].karaka.split(',').slice(0, 3).join(',') + '.'] });
    });
    /* lords of 6, 8, 12 sitting in kendras bring their troubles into key areas */
    [6, 8, 12].forEach(function (hh) { var l = J.lordOfHouse(L, hh); if (l === ll || c.func[l].kind === 'yogakaraka') return; if (KENDRA.indexOf(P[l].house) >= 0) cons.push({ t: nth(hh) + ' lord ' + PN[l] + ' in the ' + nth(P[l].house), why: ['The lord of ' + HOUSE_WORD[hh] + ' sits in a key house (' + HOUSE_WORD[P[l].house] + '): expect some friction there.'] }); });
    var mal = k.planets.filter(function (p) { return ['Sa', 'Ma', 'Ra', 'Ke'].indexOf(p.code) >= 0 && [1, 7].indexOf(p.house) >= 0; });
    mal.forEach(function (p) { cons.push({ t: PN[p.code] + ' in the ' + nth(p.house), why: [KB.IN_HOUSE[p.code][p.house] + '.'] }); });
    out.pros = pros; out.cons = cons;

    /* yogas */
    var KW = { raja: 'Raja (status)', mahapurusha: 'Mahapurusha', dhana: 'Dhana (wealth)', good: 'Good', mild: 'Mild', weak: 'Weakness', dosha: 'Dosha' };
    out.yogas = allYogas.map(function (y) { return { name: y.name, kind: y.kind, label: KW[y.kind] || y.kind, why: y.why, good: y.kind !== 'dosha' && y.kind !== 'weak' }; })
      .sort(function (a, b) { return (b.good ? 1 : 0) - (a.good ? 1 : 0); });

    /* lifetime dasha map and golden periods */
    var lifeEnd = new Date(c.birth.getTime() + 90 * YEAR), mds = c.maha.filter(function (m) { return m.start < lifeEnd; });
    out.life = mds.map(function (m) { var s = sc[m.lord].s; return { lord: PN[m.lord], code: m.lord, start: m.start, end: m.end, from: Math.max(0, age(c, m.start)), to: age(c, m.end), rate: rateWord(s), s: s, now: m.start <= now && now < m.end, why: sc[m.lord].why }; });
    var ads = [];
    mds.forEach(function (m) { J.subPeriods(m).forEach(function (a) { if (a.end < now) return; var s = sc[m.lord].s * 0.55 + sc[a.lord].s * 0.45; if (m.lord === a.lord) s -= 0.2; ads.push({ md: m.lord, ad: a.lord, start: a.start, end: a.end, s: s }); }); });
    var perMd = {}, gold = ads.filter(function (a) { return a.start < new Date(now.getTime() + 30 * YEAR) && a.md !== a.ad || a.start <= now && now < a.end; }).sort(function (a, b) { return b.s - a.s; })
      .filter(function (a) { perMd[a.md] = (perMd[a.md] || 0) + 1; return perMd[a.md] <= 2 || (a.start <= now && now < a.end); }).slice(0, 6).sort(function (a, b) { return a.start - b.start; });
    out.golden = gold.map(function (g) { var hs = uniq(linkHouses(c, g.md).concat(linkHouses(c, g.ad))).filter(function (h) { return [1, 2, 4, 5, 7, 9, 10, 11].indexOf(h) >= 0; });
      return { label: PN[g.md] + ' – ' + PN[g.ad], start: g.start, end: g.end, ageFrom: age(c, g.start), now: g.start <= now && now < g.end, rate: rateWord(g.s), areas: hs.slice(0, 4).map(function (h) { return hwAt(c, h, g.start); }), why: [PN[g.md] + ': ' + sc[g.md].why.join(', ') + '.', PN[g.ad] + ': ' + sc[g.ad].why.join(', ') + '.'] }; });

    /* timelines (next 25 years, antardasha level) */
    var horizon = new Date(now.getTime() + 25 * YEAR), health = [], success = [];
    function satAt(d) { var m = J.houseFrom(P.Mo.sign, J.signOf(C.sidereal('Sa', d))); return { 12: 'Sade Sati', 1: 'Sade Sati', 2: 'Sade Sati', 4: 'Kantaka Shani', 8: 'Ashtama Shani' }[m] || null; }
    function jupGood(d) { var m = J.houseFrom(P.Mo.sign, J.signOf(C.sidereal('Ju', d))); return [2, 5, 7, 9, 11].indexOf(m) >= 0; }
    ads.filter(function (a) { return a.start < horizon; }).forEach(function (a) {
      var mid = new Date((Math.max(a.start.getTime(), now.getTime()) + a.end.getTime()) / 2), from = a.start < now ? now : a.start;
      var hsA = linkHouses(c, a.ad), hsM = linkHouses(c, a.md), dusA = hsA.filter(function (h) { return DUS.indexOf(h) >= 0 || h === 1; });
      var risk = 0, why = [], dA = hsA.filter(function (h) { return DUS.indexOf(h) >= 0; });
      if (dA.length) { risk += 1; why.push(PN[a.ad] + ' is linked to the ' + list(dA.map(nth)) + ' house'); }
      if (['Sa', 'Ma', 'Ra', 'Ke', 'Su'].indexOf(a.ad) >= 0) { risk += 1; why.push(PN[a.ad] + ' is a hard planet'); }
      if (sc[a.ad].s < 0.5) { risk += 1; why.push(PN[a.ad] + ' is weak or unhelpful for you'); }
      if (sc[a.md].s < 0.5 && hsM.some(function (h) { return DUS.indexOf(h) >= 0; })) { risk += 1; why.push('main period ' + PN[a.md] + ' also touches a health house'); }
      var ss = satAt(mid); if (ss) { risk += 1; why.push(ss + ' running'); }
      if (risk >= 3 && dA.length + (ss ? 1 : 0) > 0) {
        var areas = uniq([KB.PLANET[a.ad].body.split(',').slice(0, 3).join(',')].concat(dusA.slice(0, 2).map(function (h) { return KB.HOUSE[h].body; })));
        health.push({ start: from, end: a.end, label: PN[a.md] + ' – ' + PN[a.ad], level: risk >= 4 ? 'Watch' : 'Care', areas: areas, why: why });
      }
      var good = hsA.concat(hsM).filter(function (h) { return [2, 9, 10, 11, 5, 4, 7].indexOf(h) >= 0; });
      var gs = a.s + (jupGood(mid) ? 0.5 : 0);
      if (gs >= 1.8 && good.length) {
        var g2 = uniq(good).sort(function (x, y) { return [10, 11, 2, 9, 5, 4, 7].indexOf(x) - [10, 11, 2, 9, 5, 4, 7].indexOf(y); });
        success.push({ start: from, end: a.end, label: PN[a.md] + ' – ' + PN[a.ad], level: gs >= 3 ? 'Peak' : 'Good', areas: g2.slice(0, 3).map(function (h) { return hwAt(c, h, from); }), why: [PN[a.ad] + ' ' + sc[a.ad].why.slice(0, 2).join(', ')].concat(jupGood(mid) ? ['Jupiter transit supports (good house from your Moon)'] : []) });
      }
    });
    function merge(arr) { var o = []; arr.forEach(function (x) { var l = o[o.length - 1]; if (l && l.label.split(' – ')[0] === x.label.split(' – ')[0] && l.level === x.level && Math.abs(l.end - x.start) < 5 * DAY) { l.end = x.end; l.label += ', ' + x.label.split(' – ')[1]; l.areas = uniq(l.areas.concat(x.areas)).slice(0, 4); } else o.push(JSON.parse(JSON.stringify(x), function (k2, v) { return (k2 === 'start' || k2 === 'end') ? new Date(v) : v; })); }); return o; }
    out.health = merge(health).slice(0, 10);
    out.success = merge(success).slice(0, 10);
    /* Saturn cycles (Sade Sati and Dhaiya) over the next 25 years */
    var cyc = [], cur = null;
    for (var t = now.getTime(); t < horizon.getTime(); t += 10 * DAY) { var d = new Date(t), lab = satAt(d); if (lab) { if (cur && cur.label === lab) cur.end = d; else { cur = { label: lab, start: d, end: d }; cyc.push(cur); } } else cur = null; }
    cyc.forEach(function (x, i) { var n2 = cyc[i + 1]; if (n2 && n2.label === x.label && n2.start - x.end < 400 * DAY) { n2.start = x.start; x.drop = true; } }); cyc = cyc.filter(function (x) { return !x.drop; });
    out.saturn = cyc.filter(function (x) { return x.end - x.start > 30 * DAY; });

    /* remedies */
    out.rem = N.remedies(c, now);

    /* nature */
    var el = { fire: 0, earth: 0, air: 0, water: 0 }; el[KB.SIGN_ELEMENT[L]] += 2; J.P7.forEach(function (x) { el[KB.SIGN_ELEMENT[P[x].sign]] += x === 'Mo' || x === 'Su' ? 1.5 : 1; });
    var elS = Object.keys(el).sort(function (a, b) { return el[b] - el[a]; }), gana = GANA[P.Mo.nak.index];
    out.nature = [
      { t: 'Outer self (' + SG[L] + ' lagna)', d: cap(KB.SIGN_TRAIT[L]) + '.' },
      { t: 'Mind and emotions (Moon in ' + SG[P.Mo.sign] + ')', d: cap(KB.SIGN_TRAIT[P.Mo.sign]) + '.' },
      { t: 'Birth star (' + P.Mo.nak.name + ')', d: cap(KB.NAK_TRAIT[P.Mo.nak.index]) + '.' },
      { t: 'Soul and drive (Sun in ' + SG[P.Su.sign] + ')', d: cap(KB.SIGN_TRAIT[P.Su.sign].split(';')[0]) + '.' },
      { t: 'Temperament: ' + gana + ' gana', d: cap(GANA_T[gana]) + '.' },
      { t: 'Element balance: mostly ' + elS[0] + ' and ' + elS[1], d: 'Strong in ' + ELEM_T[elS[0]] + ' and ' + ELEM_T[elS[1]] + '; build more ' + ELEM_T[elS[3]] + '.' },
      { t: 'Soul lesson (Atmakaraka ' + PN[ak] + ')', d: cap(AK_LESSON[ak]) + '.' },
      { t: 'Strongest planet: ' + PN[strongest[0]], d: 'Your natural strengths come through ' + { Su: 'leadership, confidence and authority', Mo: 'empathy, care and connecting with people', Ma: 'courage, energy and getting things done', Me: 'intellect, speech and business sense', Ju: 'wisdom, guidance and good judgment', Ve: 'charm, taste and relationships', Sa: 'discipline, patience and hard work' }[strongest[0]] + '.' }];
    out.nature = out.nature.concat(k.planets.filter(function (p) { return p.house === 1; }).map(function (p) { return { t: PN[p.code] + ' in the lagna', d: cap(KB.IN_HOUSE[p.code][1]) + '.' }; }));

    /* deity */
    var kmsh = J.varga(P[ak].lon, 9).sign, s12k = (kmsh + 11) % 12;
    var in12 = k.planets.filter(function (p) { return J.varga(p.lon, 9).sign === s12k; }).map(function (p) { return p.code; });
    var ishta = in12.length ? in12[0] : J.RULER[s12k], l9 = J.lordOfHouse(L, 9);
    out.deity = [
      { role: 'Ishta Devata (personal deity)', code: ishta, name: DEITY[ishta][0], how: DEITY[ishta][1], why: 'Atmakaraka ' + PN[ak] + ' is in ' + SG[kmsh] + ' in the Navamsha (Karakamsha); the 12th from it is ' + SG[s12k] + (in12.length ? ', occupied by ' + list(in12.map(function (x) { return PN[x]; })) : ', ruled by ' + PN[ishta]) + '.' },
      { role: 'For your lagna lord', code: ll, name: DEITY[ll][0], how: DEITY[ll][1], why: PN[ll] + ' rules your ' + SG[L] + ' lagna: worship keeps health and confidence strong.' },
      { role: 'Dharma devata (luck and blessings)', code: l9, name: DEITY[l9][0], how: DEITY[l9][1], why: PN[l9] + ' rules your 9th house of fortune.' },
      { role: 'For the running dasha', code: chain[0].lord, name: DEITY[chain[0].lord][0], how: DEITY[chain[0].lord][1], why: PN[chain[0].lord] + ' Mahadasha until ' + dmy(chain[0].end) + '.' }];
    var seenD = {}; out.deity = out.deity.filter(function (d, i) { if (i > 0 && seenD[d.code]) { seenD[d.code].role += ' · ' + d.role; return false; } seenD[d.code] = d; return true; });

    /* food for the running dasha */
    var nadi = NADI[P.Mo.nak.index];
    out.food = { md: chain[0].lord, ad: chain[1] ? chain[1].lord : chain[0].lord, mdTo: chain[0].end, adTo: chain[1] ? chain[1].end : chain[0].end,
      items: uniq([chain[0].lord, chain[1] ? chain[1].lord : chain[0].lord]).map(function (x) { var fx = c.func[x], calm = x === 'Ra' || x === 'Ke' || (fx && fx.kind === 'malefic'); return { code: x, favour: FOOD[x][0], limit: FOOD[x][1], mode: calm ? 'balance' : 'strengthen' }; }),
      nadi: nadi, dosha: NADI_D[nadi][0], tip: NADI_D[nadi][1] };

    /* lucky factors */
    var luckyP = uniq([ll].concat(J.P7.filter(function (x) { return c.func[x].kind === 'yogakaraka'; })).concat(strongest.filter(function (x) { return c.func[x].kind === 'benefic'; }).slice(0, 1)));
    var gemYes = out.rem.gems.filter(function (g) { return g.kind === 'yes'; })[0];
    out.lucky = [
      { t: 'Lucky planets', d: list(luckyP.map(function (x) { return PN[x]; })) },
      { t: 'Lucky days', d: list(uniq(luckyP.map(function (x) { return DAYN[x]; }))) },
      { t: 'Lucky colours', d: list(luckyP.map(function (x) { return COLOR[x]; })) },
      { t: 'Lucky numbers', d: luckyP.map(function (x) { return NUM[x]; }).join(', ') },
      { t: 'Main gemstone', d: gemYes ? gemYes.gem + ' (' + PN[gemYes.code] + '); ' + gemYes.how : 'Consult before wearing any gemstone' },
      { t: 'Avoid wearing', d: list(out.rem.gems.filter(function (g) { return g.kind === 'no'; }).map(function (g) { return g.gem.split(' (')[0] + ' (' + PN[g.code] + ')'; })) || 'none flagged' },
      { t: 'Gana · Nadi · Varna', d: gana + ' · ' + nadi + ' (' + NADI_D[nadi][0] + ') · ' + VARNA[[0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3][P.Mo.sign]] },
      { t: 'Career suits', d: uniq([J.lordOfHouse(L, 10)].concat(k.planets.filter(function (p) { return p.house === 10; }).map(function (p) { return p.code; }))).slice(0, 2).map(function (x) { return KB.CAREER_HINT[x]; }).join('; ') }];
    return out;
  }
  return { analyze: analyze, DEITY: DEITY, FOOD: FOOD };
}
if (typeof module !== 'undefined') module.exports = makeKundliAnalysis;
