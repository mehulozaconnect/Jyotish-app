/* Trikaal rulebook: judgement rules for reading a chart in a fixed order, honest dasha and Sade Sati verdicts,
   planet self-checks, house reading (house, lord, karaka), timing tables and a remedy plan in the right order.
   Classical Parashari rules, written in our own plain words. */
function makeBook(J, KB, C) {
  var PN = J.PNAME, KEN = [1, 4, 7, 10], TRI = [1, 5, 9], DUS = [6, 8, 12], DAY = 864e5, YEAR = 365.25 * DAY;
  var DSC = { 'Exalted': 5, 'Moolatrikona': 4.5, 'Own sign': 4, 'Friendly sign': 3, 'Neutral sign': 2, 'Enemy sign': 1, 'Debilitated': 0 };
  function nth(n) { return n + (n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'); }
  function hf(a, b) { return J.houseFrom(a, b); }

  /* ---------- planet strength in one word ---------- */
  function strength(c, code, sbFn) {
    var P = c.k.P, p = P[code], why = [], s;
    if (code === 'Ra' || code === 'Ke') { var dl = J.RULER[p.sign]; s = (DSC[P[dl].dignity] == null ? 2 : DSC[P[dl].dignity]) * 0.8; why.push('its sign lord ' + PN[dl] + ' is ' + P[dl].dignity.toLowerCase()); if (p.sign === J.EXALT[code]) { s += 1; why.push('in its exaltation sign'); } }
    else { s = DSC[p.dignity] == null ? 2 : DSC[p.dignity]; why.push(p.dignity.toLowerCase() + ' in ' + J.SIGNS[p.sign]); }
    if (KEN.concat(TRI).indexOf(p.house) >= 0) { s += 1; why.push('in the ' + nth(p.house) + ', a strong house'); } else if (DUS.indexOf(p.house) >= 0) { s -= 1; why.push('in the ' + nth(p.house) + ', a difficult house'); } else if (p.house === 11) s += 0.5;
    if (p.combust) { s -= 1.5; why.push('combust (too close to the Sun)'); }
    if (code === 'Mo') { var el = (P.Mo.lon - P.Su.lon + 360) % 360; if (el < 72 || el > 288) { s -= 1; why.push('a dark Moon, near Amavasya'); } else if (el > 144 && el < 216) { s += 0.5; why.push('a bright Moon, near Purnima'); } }
    var sb = null; if (sbFn && J.P7.indexOf(code) >= 0) try { sb = sbFn(c).P[code]; } catch (e) { }
    if (sb) { if (sb.ratio >= 1.1) { s += 1; why.push('Shadbala above the required strength'); } else if (sb.ratio < 0.9) { s -= 1; why.push('Shadbala below the required strength'); } }
    var w = s >= 4 ? 'Strong' : s <= 1.5 ? 'Weak' : 'Average';
    return { code: code, score: Math.round(s * 10) / 10, word: w, k: w === 'Strong' ? 'g' : w === 'Weak' ? 'b' : 'm', why: why };
  }

  /* everyday signs to check against your own life (own wording) */
  var SIGNS_OF = {
    Su: { s: ['You speak up confidently, even in a group', 'Your relationship with your father is warm and supportive', 'Government and official work gets done without much trouble', 'People respect you and come to you for decisions', 'You keep a regular morning routine'],
      w: ['You hesitate to speak your mind', 'There is friction with your father, or worry about him', 'Official or government work keeps getting stuck', 'You work hard but do not get the credit', 'You delay decisions and feel low on energy by afternoon'] },
    Mo: { s: ['Your mind stays calm when small things go wrong', 'You sleep deeply and wake fresh', 'You are close to your mother', 'People share their worries with you', 'You handle both joy and sorrow with balance'],
      w: ['You worry without a clear reason', 'Sleep is light or broken', 'There is distance from your mother, or worry about her', 'Your mood swings quickly', 'You keep changing decisions you made yesterday'] },
    Ma: { s: ['You face hard tasks instead of avoiding them', 'You have good stamina for physical work', 'You stand by your brothers and sisters', 'Property and land matters get settled', 'You get angry but cool down quickly'],
      w: ['You feel nervous even about small tasks', 'You avoid physical effort', 'There are quarrels with siblings', 'Property matters are stuck or disputed', 'Anger flares at small things, or you bottle it up'] },
    Me: { s: ['You pick up new things quickly', 'People like listening to you', 'You handle money and accounts well', 'Deals and business talks go your way', 'You have a good memory and a sense of humour'],
      w: ['You struggle to put your point across', 'Mistakes creep into accounts and estimates', 'You get cheated in deals or partnerships', 'You forget promises', 'You get stuck weighing every option'] },
    Ju: { s: ['You keep learning, whatever your age', 'Elders and teachers bless and guide you', 'Your children give you joy', 'Savings grow slowly but surely', 'In tough times some help always turns up'],
      w: ['You take advice from the wrong people', 'There is friction with teachers or elders', 'You worry about your children', 'Money comes but does not stay', 'You feel "only I am right" or lean on superstition'] },
    Ve: { s: ['People like you at the first meeting', 'You enjoy art, music or making things beautiful', 'Married life is warm and harmonious', 'You have comforts: a good home, a vehicle', 'You keep your home neat and pleasant'],
      w: ['There is tension or distance in marriage', 'You feel you lack the comforts others have', 'Money goes on show and impulse buys', 'Something keeps jarring in close relationships', 'Life feels flat, without colour or enjoyment'] },
    Sa: { s: ['You work steadily without making noise', 'You stay patient when things get hard', 'You keep promises and follow rules', 'You treat workers and the elderly with respect', 'You come out of hard times stronger'],
      w: ['You put things off to "tomorrow"', 'Results come late despite effort', 'There are disputes with staff, workers or elders', 'You often think "nothing will work for me"', 'Your routine is irregular'] },
    Ra: { s: ['You think big and want to step outside a small circle', 'Foreign contacts, travel or work bring gains', 'You pick up new technology fast', 'Sudden good opportunities come your way', 'You can plan strategy well'],
      w: ['You often cannot tell what is true and what is not', 'You trust the wrong people and get misled', 'You are pulled towards bad habits or intoxicants', 'You take risks without thinking and lose suddenly', 'You always want more and feel unsatisfied'] },
    Ke: { s: ['Prayer, meditation or spiritual reading calms you', 'Your intuition is often right', 'You like simplicity and are not attached to show', 'You enjoy going deep into a subject', 'You stay steady inside during trouble'],
      w: ['You often feel "I do not know what to do"', 'Work that was moving suddenly falls apart', 'You cut yourself off from people', 'You cannot let go of the past', 'You feel restless without a clear cause'] } };

  /* ---------- reading a house: the house, its lord, its karaka ---------- */
  var KARAKAS = { 1: ['Su'], 2: ['Ju'], 3: ['Ma'], 4: ['Mo', 'Me'], 5: ['Ju'], 6: ['Sa', 'Ma'], 7: ['Ve'], 8: ['Sa'], 9: ['Ju', 'Su'], 10: ['Su', 'Me', 'Ju', 'Sa'], 11: ['Ju'], 12: ['Sa'] };
  var BHAVAT = { 1: 'your own effort', 2: 'self-earned money: what you earn by your own skill (2nd from the 2nd is the 3rd)', 3: 'short travel, writing and media (3rd from the 3rd is the 5th)', 4: 'happiness through your spouse (4th from the 4th is the 7th)', 5: 'gains from children and past good deeds (5th from the 5th is the 9th)', 6: 'how you recover from illness and debt (6th from the 6th is the 11th)', 7: 'your spouse\'s own fortune (7th from the 7th is the lagna: the bond reflects you)', 8: 'hidden support and inheritance flow (8th from the 8th is the 3rd)', 9: 'fortune rooted in past good deeds (9th from the 9th is the 5th)', 10: 'career through partners and clients (10th from the 10th is the 7th)', 11: 'gains that come from friends of friends (11th from the 11th is the 9th)', 12: 'spending on good causes and travel (12th from the 12th is the 11th)' };
  var HNAME = ['', 'Self and body', 'Money and family', 'Courage and siblings', 'Home and mother', 'Children and learning', 'Health, debts and rivals', 'Marriage and partners', 'Sudden events and longevity', 'Luck, father and dharma', 'Career and status', 'Income and friends', 'Expenses, foreign and sleep'];
  function house(c, h, sbFn) {
    var k = c.k, P = k.P, L = J.lordOfHouse(k.ascSign, h), lp = P[L], ls = strength(c, L, sbFn), occ = k.planets.filter(function (p) { return p.house === h; }), pts = 0, why = [];
    var lfrom = hf((k.ascSign + h - 1) % 12, lp.sign);
    if (ls.k === 'g') pts++; else if (ls.k === 'b') pts--;
    why.push('Lord ' + PN[L] + ' sits in the ' + nth(lp.house) + ' and is ' + ls.word.toLowerCase() + (lfrom === 1 ? ' (in its own house)' : KEN.concat(TRI).indexOf(lfrom) >= 0 ? ' (well placed from this house)' : DUS.indexOf(lfrom) >= 0 ? ' (6/8/12 from this house: some strain)' : ''));
    if (KEN.concat(TRI).indexOf(lfrom) >= 0) pts += 0.5; else if (DUS.indexOf(lfrom) >= 0) pts -= 0.5;
    var ben = occ.filter(function (p) { return ['Ju', 'Ve', 'Me', 'Mo'].indexOf(p.code) >= 0; }), mal = occ.filter(function (p) { return ['Sa', 'Ma', 'Ra', 'Ke', 'Su'].indexOf(p.code) >= 0; });
    if (!occ.length) why.push('No planet sits here: that is normal, the lord decides'); else why.push(occ.map(function (p) { return p.name; }).join(', ') + ' sit' + (occ.length === 1 ? 's' : '') + ' here');
    pts += ben.length * 0.5 - (h === 3 || h === 6 || h === 10 || h === 11 ? 0 : mal.length * 0.4);
    var kar = KARAKAS[h].map(function (x) { return strength(c, x, sbFn); }), kg = kar.filter(function (x) { return x.k === 'g'; }).length, kb = kar.filter(function (x) { return x.k === 'b'; }).length;
    why.push('Karaka ' + KARAKAS[h].map(function (x, i) { return PN[x] + ' (' + kar[i].word.toLowerCase() + ')'; }).join(', '));
    pts += (kg - kb) * 0.5;
    var asp = J.aspectsOnHouse(k, h); if (asp.indexOf('Ju') >= 0 && occ.every(function (p) { return p.code !== 'Ju'; })) { pts += 0.5; why.push('Jupiter\'s aspect blesses it'); }
    var v = pts >= 1 ? 'g' : pts <= -1 ? 'b' : 'm';
    return { h: h, name: HNAME[h], topic: KB.HOUSE[h].topic, lord: L, v: v, word: v === 'g' ? 'Supported' : v === 'b' ? 'Needs effort' : 'Mixed', why: why, bb: BHAVAT[h] };
  }

  /* ---------- dasha: antardasha against the mahadasha lord ---------- */
  function rel(a, b) { return J.FRIEND[a].indexOf(b) >= 0 ? 1 : J.ENEMY[a].indexOf(b) >= 0 ? -1 : 0; }
  function adRead(c, md, ad, sbFn) {
    var P = c.k.P;
    if (md === ad) { var s0 = strength(c, md, sbFn); return { v: s0.k, word: s0.k === 'g' ? 'Very good' : s0.k === 'b' ? 'Careful' : 'Mixed', why: PN[md] + '\'s own sub-period: its results come in pure form, and ' + PN[md] + ' is ' + s0.word.toLowerCase() + ' in your chart.' }; }
    var f = rel(md, ad) + rel(ad, md), pos = hf(P[md].sign, P[ad].sign), good = [1, 4, 5, 7, 9, 10].indexOf(pos) >= 0, bad = DUS.indexOf(pos) >= 0;
    var fw = f > 0 ? 'friends' : f < 0 ? 'not friendly' : 'neutral to each other', pw = good ? 'sit well from each other (' + nth(pos) + ')' : bad ? 'sit ' + pos + ' apart, a 6/8/12 link' : 'sit ' + nth(pos) + ' from each other';
    var v = good ? (f >= 0 ? 'g' : 'm') : bad ? (f > 0 ? 'm' : 'b') : (f > 0 ? 'g' : 'm');
    var as = strength(c, ad, sbFn), ls = ad === 'Ra' || ad === 'Ke' ? [] : J.lordsOf(c.k.ascSign, ad);
    if (as.k === 'b' && ls.length && ls.every(function (h) { return DUS.indexOf(h) >= 0; })) v = v === 'g' ? 'm' : 'b';
    var tip = v === 'g' ? 'The two periods cooperate: a good time to act on plans.' : v === 'b' ? 'Friction between the two periods: postpone big decisions, watch health and avoid disputes.' : 'Some support, some strain: move ahead, but with patience.';
    return { v: v, word: v === 'g' ? 'Very good' : v === 'b' ? 'Careful' : 'Mixed', why: PN[md] + ' and ' + PN[ad] + ' are ' + fw + ' and ' + pw + '. ' + tip };
  }
  /* time around a Mahadasha change */
  function sandhi(c, now) {
    var ms = c.maha, i = -1; ms.forEach(function (m, j) { if (m.start <= now && now < m.end) i = j; }); if (i < 0) return null;
    var cur = ms[i], nx = ms[i + 1], pv = ms[i - 1], W = 9 * 30.44 * DAY;
    if (nx && cur.end - now < W) return { kind: 'ending', from: cur.lord, to: nx.lord, at: cur.end, text: PN[cur.lord] + ' Mahadasha ends and ' + PN[nx.lord] + ' begins. These months close one chapter and open another: changes in job, place, people or thinking are normal. Finish old work and avoid big, hasty decisions until the new period settles (about 6 months after it starts).' };
    if (pv && now - cur.start < W) return { kind: 'starting', from: pv.lord, to: cur.lord, at: cur.start, text: PN[cur.lord] + ' Mahadasha began recently. The new chapter is still settling: build its foundation and wait a few months before very big commitments.' };
    return null;
  }

  /* ---------- Sade Sati: how heavy, not just yes or no ---------- */
  var PHASE = { 12: 'rising phase (12th from the Moon): expenses, sleep and a restless mind; often a change of place or job', 1: 'peak phase (over your Moon): more responsibility and effort, results come late; look after mental peace', 2: 'setting phase (2nd from the Moon): money and family duties, watch your words; life starts to settle', 4: 'Kantak Shani (4th from the Moon): small pricks at home, with property or peace of mind', 8: 'Ashtam Shani (8th from the Moon): sudden expenses, health care and a test of patience; often a turn towards spirituality' };
  function saturn(c, now, sbFn) {
    var k = c.k, P = k.P, tsa = J.signOf(C.sidereal('Sa', now)), h = hf(P.Mo.sign, tsa), out = { house: h, phase: PHASE[h] || null };
    var ag = (now - c.birth) / YEAR, retAge = (ag > 26 && ag < 32) || (ag > 55 && ag < 61);
    if (tsa === P.Sa.sign && retAge) out.ret = 'Saturn return (age ' + Math.round(ag) + '): Saturn is back where it was at birth. A turning point for career, duties and direction: organise your life and take responsibility, do not panic.';
    if ([3, 6, 11].indexOf(h) >= 0) out.good = 'Saturn is in the ' + nth(h) + ' from your Moon: a supportive phase. ' + (h === 3 ? 'Courage and effort pay off.' : h === 6 ? 'You get the better of rivals, debts and illness.' : 'Gains come and long-held wishes can be fulfilled.');
    if (!out.phase) return out;
    var sc = 0, why = [], mo = strength(c, 'Mo', sbFn), sa = strength(c, 'Sa', sbFn);
    if (mo.k === 'g') { sc++; why.push('your Moon is strong'); } else if (mo.k === 'b') { sc--; why.push('your Moon is weak'); }
    var yk = k.ascSign === 1 || k.ascSign === 6;
    if (yk) { sc += 1.5; why.push('Saturn is your yogakaraka (Taurus or Libra lagna)'); } else if (sa.k === 'g') { sc++; why.push('Saturn is strong in your chart'); } else if (sa.k === 'b') { sc--; why.push('Saturn is weak in your chart'); }
    if (J.aspectedHouses('Ju', P.Ju.house).indexOf(P.Mo.house) >= 0 || P.Ju.sign === P.Mo.sign) { sc += 0.5; why.push('Jupiter protects your Moon'); }
    var md = J.find(c.maha, now); if (md) { var ms = strength(c, md.lord, sbFn); if (['Ju', 'Ve', 'Me', 'Mo'].indexOf(md.lord) >= 0 && ms.k !== 'b') { sc++; why.push('a helpful ' + PN[md.lord] + ' Mahadasha is running'); } else if (ms.k === 'b') { sc--; why.push('the running ' + PN[md.lord] + ' Mahadasha is weak'); } }
    if (h === 1) sc -= 0.5; if (h === 4) sc += 0.5;
    out.level = sc >= 1.5 ? 'Light' : sc <= -1 ? 'Heavy' : 'Medium'; out.lk = out.level === 'Light' ? 'g' : out.level === 'Heavy' ? 'b' : 'm'; out.why = why;
    out.tip = out.level === 'Light' ? 'Likely to pass with little trouble, and it can even bring progress. Keep working honestly.' : out.level === 'Heavy' ? 'Expect more effort and slower results. Keep a steady routine, look after sleep and health, serve elders and workers, and avoid big risky moves. It passes, and leaves you stronger.' : 'Some pressure and delays, manageable with discipline, patience and service.';
    return out;
  }

  /* ---------- nakshatra nature for timing, Dishashool, Gandamoola, name letters ---------- */
  var NATURE = { Dhruva: [3, 11, 20, 25], Chara: [14, 6, 21, 22, 23], Ugra: [1, 9, 10, 19, 24], Mishra: [2, 15], Kshipra: [0, 7, 12], Mridu: [4, 13, 16, 26], Tikshna: [5, 8, 17, 18] };
  var NATURE_USE = { Dhruva: ['Fixed', 'g', 'Good for lasting work: laying a foundation, griha pravesh, long-term plans.'], Chara: ['Movable', 'g', 'Good for travel, buying a vehicle, moving or starting something that must keep moving.'],
    Ugra: ['Fierce', 'b', 'For bold or difficult work only (tough decisions, legal action). Avoid weddings and gentle beginnings.'], Mishra: ['Mixed', 'm', 'Fine for routine and mixed work; not first choice for big beginnings.'],
    Kshipra: ['Swift', 'g', 'Good for quick starts: medicine, a small business, starting study, short trips.'], Mridu: ['Gentle', 'g', 'Good for marriage, music, clothes and jewellery, friendship and pleasant work.'],
    Tikshna: ['Sharp', 'b', 'Avoid auspicious beginnings like marriage or griha pravesh; suits ending bad habits or cutting ties.'] };
  function nakNature(i) { for (var n in NATURE) if (NATURE[n].indexOf(i) >= 0) return { n: n, w: NATURE_USE[n][0], k: NATURE_USE[n][1], use: NATURE_USE[n][2] }; return null; }
  var DISHA = ['West', 'East', 'North', 'North', 'South', 'West', 'East'];
  function dishashool(wd) { return { dir: DISHA[wd], t: 'Avoid starting a journey towards the ' + DISHA[wd].toLowerCase() + ' today. If you must, leave a little earlier the day before, or eat something light before leaving, as tradition suggests.' }; }
  var GANDA = [0, 8, 9, 17, 18, 26];
  var LETTERS = [['Chu', 'Che', 'Cho', 'La'], ['Li', 'Lu', 'Le', 'Lo'], ['A', 'I', 'U', 'E'], ['O', 'Va', 'Vi', 'Vu'], ['Ve', 'Vo', 'Ka', 'Ki'], ['Ku', 'Gha', 'Nga', 'Chha'], ['Ke', 'Ko', 'Ha', 'Hi'], ['Hu', 'He', 'Ho', 'Da'], ['Di', 'Du', 'De', 'Do'],
    ['Ma', 'Mi', 'Mu', 'Me'], ['Mo', 'Ta', 'Ti', 'Tu'], ['Te', 'To', 'Pa', 'Pi'], ['Pu', 'Sha', 'Na', 'Tha'], ['Pe', 'Po', 'Ra', 'Ri'], ['Ru', 'Re', 'Ro', 'Ta'], ['Ti', 'Tu', 'Te', 'To'], ['Na', 'Ni', 'Nu', 'Ne'], ['No', 'Ya', 'Yi', 'Yu'],
    ['Ye', 'Yo', 'Bha', 'Bhi'], ['Bhu', 'Dha', 'Pha', 'Dha'], ['Bhe', 'Bho', 'Ja', 'Ji'], ['Khi', 'Khu', 'Khe', 'Kho'], ['Ga', 'Gi', 'Gu', 'Ge'], ['Go', 'Sa', 'Si', 'Su'], ['Se', 'So', 'Da', 'Di'], ['Du', 'Tha', 'Jha', 'Na'], ['De', 'Do', 'Cha', 'Chi']];

  /* ---------- remedy plan in the right order ---------- */
  var SHORT_MANTRA = { Su: 'Om Ghrinih Suryaya Namah', Mo: 'Om Som Somaya Namah', Ma: 'Om Ang Angarakaya Namah', Me: 'Om Bum Budhaya Namah', Ju: 'Om Brim Brihaspataye Namah', Ve: 'Om Shum Shukraya Namah', Sa: 'Om Sham Shanaishcharaya Namah', Ra: 'Om Ram Rahave Namah', Ke: 'Om Kem Ketave Namah' };
  var CONDUCT = { Su: 'Wake before sunrise, offer water to the Sun, and touch your father\'s feet or call him daily. Keep your word.',
    Mo: 'Sleep on time, call or sit with your mother daily, and keep 10 quiet minutes for yourself. Avoid late nights.',
    Ma: 'Exercise or do physical work daily, help your siblings, and pause for a few breaths before reacting in anger.',
    Me: 'Speak truthfully and sweetly, keep accounts clean, and help a student with books or guidance.',
    Ju: 'Respect teachers and elders and take their advice, read something meaningful daily, and avoid meat and alcohol on Thursdays.',
    Ve: 'Keep your home clean and pleasant, treat your spouse and women with respect, and avoid spending for show.',
    Sa: 'Be on time, finish work without excuses, and treat workers, drivers and the elderly with respect; pay dues on time.',
    Ra: 'Avoid intoxicants and shortcuts, check facts before trusting people, and keep every deal transparent.',
    Ke: 'Spend 10 minutes daily in silence or prayer, remember your ancestors, and finish what you start.' };
  var SEVA = { Su: 'Serve your father or an elderly man.', Mo: 'Serve your mother or an elderly woman; give water to the thirsty.', Ma: 'Help siblings; respect soldiers and sportspeople.', Me: 'Give books or fees to a student; water a tulsi plant.', Ju: 'Serve teachers and elders; feed a cow on Thursday.', Ve: 'Respect girls and women; feed a cow.', Sa: 'Feed and help labourers and the elderly; light a lamp at a peepal tree on Saturday.', Ra: 'Help sanitation workers and the poor.', Ke: 'Feed stray dogs; help at a temple or for a sadhu.' };
  function remedyPlan(c, now, sbFn) {
    var ch = J.dashaChain(c.maha, now, 2), pick = [], why = {};
    function add(code, w) { if (pick.indexOf(code) < 0 && pick.length < 2) { pick.push(code); why[code] = w; } }
    ch.forEach(function (d, i) { var s = strength(c, d.lord, sbFn), f = c.func && c.func[d.lord]; if (s.k === 'b' || (f && f.kind === 'malefic') || d.lord === 'Ra' || d.lord === 'Ke' || d.lord === 'Sa') add(d.lord, PN[d.lord] + ' runs your ' + (i ? 'Antardasha' : 'Mahadasha') + ' now and ' + (s.k === 'b' ? 'is weak in your chart' : 'needs calming') + '.'); });
    var ss = saturn(c, now, sbFn); if (ss.phase && ss.lk !== 'g') add('Sa', 'Saturn is in its ' + (ss.house === 4 || ss.house === 8 ? 'Dhaiya' : 'Sade Sati') + ' phase from your Moon.');
    if (!pick.length) { var w = J.P7.map(function (x) { return strength(c, x, sbFn); }).sort(function (a, b) { return a.score - b.score; })[0]; add(w.code, PN[w.code] + ' is the weakest planet in your chart.'); }
    return pick.map(function (code) { var d = KB.DAAN[code]; return { code: code, why: why[code], conduct: CONDUCT[code], daan: d[0], day: d[1], seva: SEVA[code], mantra: SHORT_MANTRA[code] }; });
  }
  var HABITS = [['sun', 'Water to the Sun at sunrise'], ['elders', 'Blessings of parents or elders'], ['food', 'Feed someone: a bird, cow, dog or a needy person'], ['tulsi', 'Water a tulsi or a tree'], ['chalisa', 'Hanuman Chalisa or your prayer'], ['lamp', 'Evening lamp at home'], ['routine', 'Early to bed, kind words through the day']];

  /* ---------- AI reading order ---------- */
  var RULES = 'READING METHOD (follow this order for any chart question; do not skip steps, but only write what matters for the question):\n' +
    '1) Lagna and its lord: strength and house. 2) Moon: sign, nakshatra, state of mind. 3) Strength of the planets involved (dignity, house, combustion, Shadbala). ' +
    '4) For the topic asked: the house, its lord and its karaka together; an empty house is judged by its lord, never called weak for being empty; if two of the three are strong the topic is supported. ' +
    '5) Aspects on that house and planet (Jupiter\'s aspect protects). 6) Yogas, only those listed as formed; never invent or "almost" form a yoga; a weak or cancelled yoga is described as such. ' +
    '7) Timing: the chart shows the promise, the dasha shows when; read the Antardasha against the Mahadasha lord; transits only support or delay what the dasha gives.\n' +
    'LANGUAGE RULES: speak in likelihood ("likely", "indicates", "tends to"), never guarantees and never fear. A dosha is an area needing attention, not a curse; always mention its cancellations. Sade Sati is a period of effort, not destruction; use its stated level. ' +
    'Every answer gives: the promise (what is likely), the timing (when), and the action (what to do). Remedies in this order: conduct and habits first, then daan and seva, then a short mantra; at most 1 or 2 remedies, kept for 40 days. Gemstones only as a last option and only after a full chart check by an expert; never sell fear or costly pujas.\n';

  return { strength: strength, SIGNS_OF: SIGNS_OF, house: house, HNAME: HNAME, KARAKAS: KARAKAS, adRead: adRead, sandhi: sandhi, saturn: saturn, nakNature: nakNature, NATURE_USE: NATURE_USE, dishashool: dishashool, GANDA: GANDA, LETTERS: LETTERS,
    remedyPlan: remedyPlan, CONDUCT: CONDUCT, HABITS: HABITS, SHORT_MANTRA: SHORT_MANTRA, RULES: RULES };
}
if (typeof module !== 'undefined') module.exports = makeBook;
