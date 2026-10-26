/* Trikaal storyteller: answers as a consultant would speak.
   Every answer = Quick Answer (verdict for the time asked), A Quick Question (to sharpen the reading),
   Astrological Explanation (flowing paragraphs: natal promise -> running dasha -> transits in the window), "In short ...". */
function makeStory(A, C, J, KB, N, P, S) {
  var PN = J.PNAME, SG = J.SIGNS, nth = N.nth, DAY = C.DAY, dmy = N.dmy;
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var NUMW = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
  function uniq(a) { var o = []; a.forEach(function (x) { if (x != null && o.indexOf(x) < 0) o.push(x); }); return o; }
  function cap(s) { s = String(s || ''); return s.charAt(0).toUpperCase() + s.slice(1); }
  function list(a) { return P.list(a.filter(Boolean)); }
  function first(name) { return String(name || '').split(/[\s(]/)[0]; }
  function loc(d) { return new Date(d.getTime() + 5.5 * 3600e3); }
  function when(d, now) {
    var days = (d - now) / DAY, x = loc(d), m = MONTHS[x.getUTCMonth()], dd = x.getUTCDate();
    if (days < 0) return 'since ' + dmy(d);
    if (days < 10) return 'in a few days';
    if (loc(now).getUTCMonth() === x.getUTCMonth() && days < 31) return 'later this month';
    return (dd <= 10 ? 'by early ' : dd <= 20 ? 'by mid-' : 'by late ') + m + (x.getUTCFullYear() !== loc(now).getUTCFullYear() ? ' ' + x.getUTCFullYear() : '');
  }
  function horizonWords(m) { return m === 12 ? 'the next year' : m === 1 ? 'the next month' : m % 12 === 0 ? 'the next ' + NUMW[m / 12] + ' years' : 'the next ' + (NUMW[m] || m) + ' months'; }
  var HOUSE_NAME = [null, 'Lagna', '2nd house of wealth', '3rd house of effort', '4th house of home and peace', '5th house of children and intellect', '6th house of health', '7th house of partnership', '8th house of longevity', '9th house of fortune', '10th house of career', '11th house of gains', '12th house of expenses'];
  var DIG = { 'Exalted': 'exalted', 'Moolatrikona': 'in its moolatrikona', 'Own sign': 'in its own sign', 'Friendly sign': 'in a friendly sign', 'Neutral sign': 'in a neutral sign', 'Enemy sign': 'in an enemy sign', 'Debilitated': 'debilitated' };
  var GOODDIG = ['Exalted', 'Moolatrikona', 'Own sign', 'Friendly sign'];

  var TOPIC = {
    health: { key: 6, houses: [1, 6, 8, 12], noun: 'health', base: 'This gives your body', strong: 'good resilience', ok: 'decent resilience', weak: 'limited reserves, so prevention matters',
      ask: function (c, now) { var sy = uniq(['Sa', 'Ma', 'Ra'].filter(function (x) { return [1, 6, 8, 12].indexOf(J.houseFrom(c.k.ascSign, J.signOf(C.sidereal(x, now)))) >= 0 || x === 'Sa'; }).map(function (x) { return { Sa: 'fatigue or joint pain', Ma: 'acidity or inflammation', Ra: 'anxiety or poor sleep' }[x]; })); return 'Before I go deeper, could you tell me if you are currently experiencing any specific symptoms, like ' + list(sy.concat(['stress related to work'])) + '? This will help me sharpen the reading for you.'; },
      shortBad: 'build discipline, not panic', shortMix: 'stay regular with routine and check-ups', shortGood: 'enjoy good energy while keeping the basics right' },
    career: { key: 10, houses: [10, 6, 2, 11], noun: 'career', base: 'This gives your career', strong: 'a strong foundation', ok: 'a steady foundation', weak: 'a foundation that needs effort and patience',
      ask: function () { return 'Before I go deeper, are you looking at a promotion or raise in your current role, a job change, or starting something of your own? This will help me sharpen the reading for you.'; },
      shortBad: 'consolidate and avoid hasty moves', shortMix: 'keep building quietly and pick your moment', shortGood: 'push forward and ask for what you want' },
    money: { key: 11, houses: [2, 11, 5, 12], noun: 'money', base: 'This gives your finances', strong: 'a strong earning capacity', ok: 'a reasonable earning capacity', weak: 'a pattern where money comes with effort and leaks easily',
      ask: function () { return 'Before I go deeper, is your concern more about income growth, a pending payment, investments, or controlling expenses? This will help me sharpen the reading for you.'; },
      shortBad: 'protect cash and avoid risk', shortMix: 'save steadily and avoid speculation', shortGood: 'grow income and invest with a plan' },
    marriage: { key: 7, houses: [7, 2, 11], noun: 'relationship', base: 'This gives your partnerships', strong: 'warmth and support', ok: 'a workable balance', weak: 'some friction that needs patience',
      ask: function () { return 'Before I go deeper, are you asking about harmony in your current marriage, finding a partner, or a business partnership? This will help me sharpen the reading for you.'; },
      shortBad: 'listen more and avoid ego clashes', shortMix: 'keep communication open and patient', shortGood: 'strengthen the bond and plan together' },
    children: { key: 5, houses: [5, 2, 11, 9], noun: 'children and studies', base: 'This gives this area', strong: 'strong blessings', ok: 'steady support', weak: 'delays that ease with care',
      ask: function () { return 'Before I go deeper, is this about your children’s studies and health, or about planning a child? This will help me sharpen the reading for you.'; },
      shortBad: 'be patient and supportive', shortMix: 'guide gently and stay involved', shortGood: 'encourage and invest in their growth' },
    general: { key: 1, houses: [1, 10, 7, 11], noun: 'life', base: 'This gives you', strong: 'a strong base to build on', ok: 'a steady base', weak: 'a base that needs effort',
      ask: function () { return 'Before I go deeper, which area matters most to you right now: health, career, money or family? This will help me sharpen the reading for you.'; },
      shortBad: 'stay patient and steady', shortMix: 'move step by step', shortGood: 'make the most of the support' }
  };

  /* how strong is a house: occupants, lord, aspects, SAV */
  function houseState(c, h) {
    var k = c.k, sign = (k.ascSign + h - 1) % 12, occ = k.planets.filter(function (p) { return p.house === h; }), lord = J.lordOfHouse(k.ascSign, h), lp = k.P[lord];
    var asp = J.aspectsOnHouse(k, h).filter(function (x) { return occ.map(function (p) { return p.code; }).indexOf(x) < 0; });
    var score = 0, sav = N.savOf(c, h);
    if (GOODDIG.indexOf(lp.dignity) >= 0) score += 1; if (lp.dignity === 'Debilitated' || lp.dignity === 'Enemy sign') score -= 1;
    if ([6, 8, 12].indexOf(lp.house) >= 0 && h !== 6 && h !== 8 && h !== 12) score -= 1; if ([1, 4, 5, 7, 9, 10].indexOf(lp.house) >= 0) score += 0.5;
    if (asp.indexOf('Ju') >= 0) score += 1; occ.forEach(function (p) { if (['Ju', 'Ve', 'Me'].indexOf(p.code) >= 0) score += 0.5; if (['Sa', 'Ra', 'Ke', 'Ma'].indexOf(p.code) >= 0) score -= 0.5; });
    score += sav >= 30 ? 1 : sav < 25 ? -1 : 0;
    return { h: h, sign: sign, occ: occ, lord: lord, lp: lp, asp: asp, sav: sav, score: score };
  }
  function natalPara(c, T) {
    var st = houseState(c, T.key), occTxt = st.occ.length ? ', with ' + list(st.occ.map(function (p) { return PN[p.code]; })) + ' seated there' : '';
    var lordTxt = st.lord === J.lordOfHouse(c.k.ascSign, 1) && T.key !== 1 ? '' : '';
    var supp = st.asp.indexOf('Ju') >= 0 ? ', supported by Jupiter’s benefic aspect' : st.asp.filter(function (x) { return ['Sa', 'Ma', 'Ra', 'Ke'].indexOf(x) >= 0; }).length ? ', though ' + list(st.asp.filter(function (x) { return ['Sa', 'Ma', 'Ra', 'Ke'].indexOf(x) >= 0; }).map(function (x) { return PN[x]; })) + ' aspect' + (st.asp.filter(function (x) { return ['Sa', 'Ma', 'Ra', 'Ke'].indexOf(x) >= 0; }).length > 1 ? '' : 's') + ' it' : '';
    var placed = [1, 4, 5, 7, 9, 10, 11].indexOf(st.lp.house) >= 0 ? 'well placed' : [6, 8, 12].indexOf(st.lp.house) >= 0 ? 'in a hidden house' : 'fairly placed';
    var res = st.score >= 2 ? T.strong : st.score >= 0 ? T.ok : T.weak;
    var name = T.key === 1 ? 'Your Lagna' : 'Your ' + HOUSE_NAME[T.key];
    var s = name + ' is ' + SG[st.sign] + occTxt + ', and its lord ' + PN[st.lord] + ' sits in the ' + nth(st.lp.house) + ' ' + DIG[st.lp.dignity] + ', ' + placed + supp + '. ' + T.base + ' ' + res + '.';
    if (T.key === 6) { var ll = c.k.P[J.lordOfHouse(c.k.ascSign, 1)]; s += ' Your lagna lord ' + PN[ll.code] + ' is ' + DIG[ll.dignity] + ' in the ' + nth(ll.house) + ', ' + (GOODDIG.indexOf(ll.dignity) >= 0 ? 'which helps you recover well' : 'so keep your routine strong') + '.'; }
    return { text: s, score: st.score };
  }
  /* what the running dasha means for this topic */
  function dashaPara(c, T, now) {
    var k = c.k, ch = J.dashaChain(c.maha, now, 3), ad = ch[1] || ch[0], pl = k.P[ad.lord], owns = J.lordsOf(k.ascSign, ad.lord), f = S.verdictOf(c, ad.lord);
    var rel = uniq(owns.concat([pl.house])).filter(function (h) { return T.houses.indexOf(h) >= 0; });
    var name = ch.map(function (x) { return PN[x.lord]; }).join('-');
    var s = 'The current ' + name + ' period is significant. ' + PN[ad.lord] + (pl.dignity === 'Exalted' || pl.dignity === 'Debilitated' ? ', ' + DIG[pl.dignity] + ' in the ' + nth(pl.house) + ' house, ' : ' in the ' + nth(pl.house) + ' house ') + (owns.length ? 'owns your ' + list(owns.map(function (h) { return nth(h); })) + ' house' + (owns.length > 1 ? 's' : '') + ', tied to ' + P.areas(owns, true) : 'acts for its sign lord ' + PN[J.RULER[pl.sign]]) + '. ';
    var score = 0;
    if (T.key === 6) {
      var bad = rel.filter(function (h) { return [6, 8, 12].indexOf(h) >= 0; }), body = KB.PLANET[ad.lord].body.split(',').slice(0, 3).map(function (x) { return x.trim(); });
      if (bad.length) { s += 'Because it touches your ' + list(bad.map(nth)) + ' house, it puts some load on vitality. '; score -= 1; }
      if (rel.indexOf(1) >= 0) { s += 'As it also rules your Lagna, it protects the body even while testing it. '; score += 0.5; }
      s += 'The net effect is ' + (score < 0 ? 'manageable stress rather than acute illness, but you may feel reduced stamina or recurring minor issues, often ' + list(body) + ' related, ' + PN[ad.lord] + '’s classic domain.' : 'steady health, with small issues linked to ' + list(body) + ' if you overdo things.');
    } else {
      var good = rel.filter(function (h) { return [6, 8, 12].indexOf(h) < 0 || T.key === 6; });
      if (good.length && f !== 'bad') { s += 'Since it connects to your ' + list(good.map(nth)) + ' house, it actively supports ' + T.noun + ' matters now.'; score += 1; }
      else if (good.length) { s += 'It connects to your ' + list(good.map(nth)) + ' house, so ' + T.noun + ' is active, but as a difficult planet for your lagna it brings results with strings attached.'; }
      else if (f === 'bad') { s += 'It is not directly linked to your ' + T.noun + ' houses, and as a difficult planet for your lagna it can create indirect pressure.'; score -= 0.5; }
      else s += 'It is not directly linked to your ' + T.noun + ' houses, so this area moves on its natal promise rather than any special push.';
    }
    var nx = ch[2] && ch[2].end, nxt = ch[1] ? J.subPeriods(ch[1]).filter(function (x) { return x.start >= ch[2].end; })[0] : null;
    return { text: s, score: score, chain: ch, next: nxt };
  }
  /* transits and period changes in the window */
  function windowPara(c, T, now, months) {
    var k = c.k, end = new Date(now.getTime() + months * 30.44 * DAY), out = [], score = 0, key = null;
    var evs = J.events(now, end, ['Ju', 'Sa', 'Ra']).filter(function (e) { return e.type === 'ingress'; });
    evs.forEach(function (e) {
      var h = J.houseFrom(k.ascSign, e.sign), w = when(e.t, now), back = e.code !== 'Ra' && C.speed(e.code, e.t) < 0;
      if (e.code === 'Ra') {
        var hk = J.houseFrom(k.ascSign, (e.sign + 6) % 12), axis = [h, hk], hit = axis.filter(function (x) { return T.houses.indexOf(x) >= 0; });
        var tx = 'Rahu moves into your ' + nth(h) + ' house and Ketu into your ' + nth(hk) + ' house ' + w + '. ';
        if (T.key === 6 && hit.some(function (x) { return [6, 8, 12].indexOf(x) >= 0; })) { tx += 'This shift onto your ' + (axis.indexOf(6) >= 0 && axis.indexOf(12) >= 0 ? 'health-hospitalisation axis' : axis.indexOf(8) >= 0 ? 'sudden-events axis' : 'health axis') + ' calls for genuine caution, particularly around hidden or sudden issues, and possible medical expenses.'; score -= 1.5; key = key || 'after the Rahu-Ketu shift into your health axis ' + w.replace('by ', 'in ').replace('in early ', 'in ').replace('in mid-', 'in ').replace('in late ', 'in '); }
        else if (hit.length) { tx += 'This puts restless energy on your ' + P.areas(hit, true) + ' matters; avoid shortcuts there.'; score -= 0.5; }
        else return;
        out.push(tx);
      } else if (e.code === 'Ju') {
        var asp = [h].concat(J.aspectedHouses('Ju', h)), helps = asp.filter(function (x) { return T.houses.indexOf(x) >= 0 || x === T.key; });
        if (!helps.length) return;
        var tx2 = back ? 'Jupiter then slips back into your ' + nth(h) + ' house ' + w + ', still ' + (asp.indexOf(1) >= 0 ? 'protecting your Lagna' : 'blessing your ' + list(helps.map(nth)) + ' house') + '.' : 'Jupiter’s move into your ' + nth(h) + ' house ' + w + ' does offer relief, ' + (asp.indexOf(1) >= 0 ? 'aspecting your Lagna and supporting ' + (T.key === 6 ? 'overall vitality' : 'you personally') : 'blessing your ' + list(helps.map(nth)) + ' house') + '.';
        score += back ? 0.3 : 1;
        out.push(tx2);
      } else if (e.code === 'Sa') {
        var m = J.houseFrom(k.P.Mo.sign, e.sign), hard = [12, 1, 2, 4, 8].indexOf(m) >= 0;
        if (T.houses.indexOf(h) < 0 && J.aspectedHouses('Sa', h).filter(function (x) { return T.houses.indexOf(x) >= 0; }).length === 0 && T.key !== 1 && !hard && T.key !== 6) return;
        var tx3 = 'Saturn ' + (back ? 'slips back' : 'moves') + ' into your ' + nth(h) + ' house ' + w + (hard ? ', ' + nth(m) + ' from your Moon, which brings heavier responsibility and slower progress.' : ', easing pressure and rewarding steady effort.');
        score += hard ? -1 : 1; out.push(tx3);
      }
    });
    out = out.slice(0, 4);
    var ss = N.sadeSati(c, now), bg = ss.q === 'bad' && (!ss.until || ss.until > now) ? 'In the background, Saturn sits ' + nth(ss.house) + ' from your Moon (' + ss.label.replace(/\s*\(.*\)/, '') + ')' + (ss.until ? ' until ' + dmy(ss.until) : '') + ', which adds tiredness and slows results.' : '';
    var txt = out.length ? 'Adding to this, ' + out[0] + (out.length > 1 ? ' ' + out.slice(1).join(' ') : '') : 'No major planet changes sign in a way that touches this area in ' + horizonWords(months) + ', so the current pattern continues.';
    return { text: txt + (bg ? ' ' + bg : ''), score: score + (ss.q === 'bad' ? -0.5 : 0), key: key };
  }
  function topicOf(q) {
    return /health|body|disease|swasthya|ill|sick|tabiyat|sehat/.test(q) ? 'health' : /career|job|work|promot|business|profession|office/.test(q) ? 'career' : /money|wealth|finance|income|dhan|paisa|salary|invest/.test(q) ? 'money' : /marr|spouse|wife|husband|relationship|partner|love/.test(q) ? 'marriage' : /child|kid|son|daughter|study|education|exam/.test(q) ? 'children' : null;
  }
  function horizonOf(q, topic) {
    var m = q.match(/(\d+|one|two|three|four|five|six|nine|twelve)\s*(month|year)/), n;
    if (m) { n = isNaN(+m[1]) ? NUMW.indexOf(m[1]) : +m[1]; return m[2] === 'year' ? n * 12 : n; }
    if (/this year|next year|coming year|12 months/.test(q)) return 12;
    if (/this month|next month/.test(q)) return 1;
    return topic === 'health' ? 3 : 6;
  }
  /* main: a topic reading */
  function topic(p, c, q, now) {
    var ql = q.toLowerCase(), tk = topicOf(ql) || 'general', T = TOPIC[tk], months = horizonOf(ql, tk), name = first(p.name);
    var np = natalPara(c, T), dp = dashaPara(c, T, now), wp = windowPara(c, T, now, months);
    var total = np.score * 0.6 + dp.score + wp.score, v = total >= 1.5 ? 'good' : total <= -1.5 ? 'bad' : 'mixed';
    var hz = horizonWords(months);
    var lead = { bad: { health: 'health needs steady attention', career: 'career needs patience', money: 'money needs careful handling', marriage: 'relationships need patience and care', children: 'this area needs patience', general: 'life asks for patience and steady effort' }, mixed: { health: 'health stays manageable with some ups and downs', career: 'career moves, but in steps', money: 'money is steady but not easy', marriage: 'relationships are workable with some friction', children: 'this area is steady with small concerns', general: 'life moves at a mixed pace' }, good: { health: 'health looks supportive', career: 'career looks supportive', money: 'money looks supportive', marriage: 'relationships look warm and supportive', children: 'this area looks blessed', general: 'life looks supportive' } }[v][tk];
    var concerns = uniq(['Sa', 'Ra', 'Ma'].filter(function (x) { var h = J.houseFrom(c.k.ascSign, J.signOf(C.sidereal(x, now))); return [1, 6, 8, 12].indexOf(h) >= 0 || dp.chain.some(function (d) { return d.lord === x; }) || (x === 'Sa' && N.sadeSati(c, now).q === 'bad'); }).map(function (x) { return { Sa: 'stamina, joints', Ra: 'sleep', Ma: 'acidity or inflammation' }[x]; }));
    var expect = tk === 'health' ? 'Expect ' + (v === 'good' ? 'good energy, with only minor niggles' : 'manageable but real concerns') + (concerns.length ? ' around ' + concerns.slice(0, 2).join(', ') + ' or stress-related issues' : '') : 'Expect ' + (v === 'good' ? 'progress, especially if you act on the openings' : v === 'bad' ? 'delays and the need for extra effort' : 'progress in steps rather than leaps');
    var quick = name + ', ' + lead + ' over ' + hz + '. ' + expect + (wp.key ? ', especially ' + wp.key : '') + '.';
    var short = 'In short, this is a phase to ' + (v === 'bad' ? T.shortBad : v === 'good' ? T.shortGood : T.shortMix) + ', ' + name + '.';
    var paras = [np.text, (np.score >= 0 && dp.score < 0 ? 'However, t' : 'T') + dp.text.slice(1), wp.text];
    return { verdict: v, quick: quick, question: T.ask(c, now), paras: paras, short: short, topic: tk, months: months };
  }

  /* follow-up: the user describes symptoms */
  var SYM = [[/tired|fatigue|weak|low energy|thakan|kamzori/, ['Sa', 'Su'], 'fatigue'], [/joint|knee|back|bone|spine|neck|shoulder|ghutna|kamar/, ['Sa'], 'joint or back pain'], [/stress|anxiety|tension|worry|panic|sleep|insomnia|neend/, ['Ra', 'Mo'], 'stress and sleep'],
    [/acid|stomach|digest|gas|ulcer|pet|constipation|loose/, ['Ma', 'Su'], 'digestion and acidity'], [/bp|blood pressure|heart|chest|palpitation/, ['Su', 'Ma'], 'BP and heart'], [/sugar|diabet|weight|liver|fat/, ['Ju', 'Ve'], 'sugar and liver'],
    [/skin|rash|allerg|itch/, ['Me', 'Ra'], 'skin and allergy'], [/head|migraine|fever|cold|cough/, ['Ma', 'Ke'], 'head, fever or infection'], [/eye|vision/, ['Su', 'Ve'], 'eyes'], [/kidney|urine|stone/, ['Ve'], 'kidneys']];
  function symptoms(p, c, q, now) {
    var ql = q.toLowerCase(), hits = SYM.filter(function (s) { return s[0].test(ql); }); if (!hits.length) return null;
    var name = first(p.name), tr = N.transitAt(c, now), ch = J.dashaChain(c.maha, now, 3), paras = [], eases = [];
    hits.forEach(function (s) {
      var pls = s[1], why = [], mine = [];
      pls.forEach(function (code) {
        var t = tr.filter(function (x) { return x.code === code; })[0], inD = ch.some(function (x) { return x.lord === code; });
        if (inD) why.push(PN[code] + ' is running your dasha now');
        if (t && (t.verdict === 'bad' || [1, 6, 8, 12].indexOf(t.h) >= 0)) { var e = J.nextIngress(code === 'Ke' ? 'Ra' : code, now, 1500); why.push(PN[code] + ' is transiting your ' + nth(t.h) + ' house, ' + nth(t.m) + ' from your Moon' + (e ? ' until ' + dmy(e) : '')); if (e) { eases.push(e); mine.push(e); } }
      });
      s.ease = mine.filter(function (d) { return d > now; }).sort(function (a, b) { return b - a; })[0];
      paras.push(cap(s[2]) + ' is ruled by ' + list(pls.map(function (x) { return PN[x]; })) + '. ' + (why.length ? 'That fits your chart right now: ' + list(why) + '.' : 'Your chart does not show strong pressure on it now, so look at routine and lifestyle first.'));
    });
    var easeTxt = hits.filter(function (s) { return s.ease; }).map(function (s) { return s[2] + ' after ' + dmy(s.ease); });
    var tips = uniq(hits.map(function (s) { return { fatigue: 'fixed sleep and wake times, morning sunlight, and a vitamin D and B12 check', 'joint or back pain': 'daily stretching, calcium and vitamin D, and posture breaks at work', 'stress and sleep': 'pranayama for ten minutes, no screens an hour before bed, and Om Namah Shivaya at night', 'digestion and acidity': 'light, early dinners, no fried or very spicy food, and more water', 'BP and heart': 'a BP check this week, less salt, and a brisk 30-minute walk', 'sugar and liver': 'a sugar and liver test, less sugar and oil, and regular meals', 'skin and allergy': 'avoid triggers, more water, and green vegetables', 'head, fever or infection': 'rest, fluids, and a doctor if fever lasts beyond two days', eyes: 'an eye check and less screen time', kidneys: 'more water and a urine and kidney test' }[s[2]]; }));
    return { verdict: 'mixed', quick: name + ', thank you. ' + cap(list(hits.map(function (s) { return s[2]; }))) + (hits.length > 1 ? ' match' : ' matches') + ' what your chart shows for this period.' + (easeTxt.length ? ' The pressure should ease in stages: ' + list(easeTxt) + '.' : ''), question: null, paras: paras.concat(['What helps most now: ' + tips.join('; ') + '. Please see a doctor if it persists; the chart shows timing, not a diagnosis.']), short: 'In short, this is a passing phase, ' + name + ', so treat it early and keep your routine steady.' };
  }

  /* planet question in story form */
  function planet(p, c, code, now) {
    var sp = S.planet(c, code, now), name = first(p.name), x = c.k.P[code];
    var quick = name + ', ' + sp.headline.replace(/^In your birth chart, /, 'in your birth chart ') + ' ' + (sp.transit ? 'Right now it is ' + ({ good: 'helping', mixed: 'giving mixed results', bad: 'testing you' })[sp.transit.verdict] + ' through your ' + nth(sp.transit.h) + ' house.' : '');
    var paras = [PN[code] + ' sits in ' + SG[x.sign] + ' at ' + x.deg + ' in your ' + nth(x.house) + ' house, ' + DIG[x.dignity] + '. ' + sp.lines.filter(function (l) { return l[0] === 'Its role' || l[0] === 'How strong'; }).map(function (l) { return l[1]; }).join(' '),
      sp.lines.filter(function (l) { return l[0] === 'Where it sits' || l[0] === 'Right now' || l[0] === 'Its time'; }).map(function (l) { return l[1]; }).join(' ')];
    return { verdict: sp.verdict, quick: quick, question: 'Is there a specific area where you feel ' + PN[code] + '’s effect, like ' + P.areas(J.lordsOf(c.k.ascSign, code).length ? J.lordsOf(c.k.ascSign, code) : [x.house], true) + '? I can then give you exact timing.', paras: paras, short: 'In short, ' + sp.do[0].replace(/^No remedy needed\. Use its strength: /, '').replace(/^./, function (x) { return x.toLowerCase(); }).replace(/\.$/, '') + ', ' + name + '.' };
  }

  /* event question in story form */
  function event(p, c, E, now) {
    var se = S.event(c, E, now), name = first(p.name), rec = E.recovery && E.recovery[0];
    var quick = name + ', ' + se.headline.replace(/^Main cause: /, 'the main cause was ').replace(/^This came mainly through /, 'this came mainly through ') + (rec ? ' ' + (E.E.heal ? 'Recovery support ' : 'Relief ') + (rec.start < now ? 'began on ' : 'begins on ') + dmy(rec.start) + '.' : '');
    var paras = [se.reasons.join(' ')];
    if (se.support.length) paras.push(se.support.map(function (s) { return PN[s.code] + ' added to it: ' + s.text; }).join(' '));
    paras.push(se.when.join(' '));
    return { verdict: E.E.good ? 'good' : 'bad', quick: quick, question: E.E.heal ? 'How is the recovery going now? Tell me if anything is still bothering you, and I will check the next few weeks for you.' : null, paras: paras, short: 'In short, ' + (se.do[0] ? se.do[0].charAt(0).toLowerCase() + se.do[0].slice(1).replace(/\.$/, '') : 'stay patient') + ', ' + name + '.', todo: se.do };
  }

  /* KP yes/no in story form */
  function kp(p, c, sk, jm, mk) {
    var name = first(p.name), j = jm.main;
    return { verdict: sk.verdict, quick: name + ', ' + sk.headline.charAt(0).toLowerCase() + sk.headline.slice(1) + ' ' + (sk.when[0] || ''), question: (P.MATTER[mk] && mk === 'job') ? 'Is this about a promotion where you are, or a new job? Tell me and I will narrow the dates.' : null,
      paras: [sk.meaning + ' In KP, the sub lord of the ' + nth(j.cusp) + ' cusp decides whether ' + (jm.m.l || '').toLowerCase() + ' is promised, and the dasha periods of planets that signify the same houses decide when.', 'The best windows: ' + sk.when.join(' ')], short: 'In short, ' + sk.do[0].charAt(0).toLowerCase() + sk.do[0].slice(1).replace(/\.$/, '') + ', ' + name + '.', todo: sk.do };
  }


  /* one day, for a topic (health today, career tomorrow ...) */
  var DAYTIP = {
    health: { good: 'a good day for exercise, a health check-up or starting a diet', mixed: 'keep meals light and on time, and avoid over-exertion', bad: 'rest more, eat light, avoid fried food, and drive carefully' },
    career: { good: 'a good day to push important work, meet seniors or ask for what you want', mixed: 'fine for follow-ups and routine work; hold big decisions', bad: 'avoid confrontations at work and big commitments; prepare instead' },
    money: { good: 'fine for collections, investments and purchases', mixed: 'fine for routine payments; avoid speculation', bad: 'avoid lending, big purchases and risky trades' },
    marriage: { good: 'a warm day for time together and important talks', mixed: 'keep talks light; avoid old arguments', bad: 'avoid sensitive topics and ego clashes; listen more' },
    children: { good: 'good for studies, exams and time with children', mixed: 'steady day; keep routines', bad: 'be patient; avoid pressure on them today' },
    general: { good: 'a good day to act', mixed: 'a steady day for routine work', bad: 'a day to go slow' } };
  var MOONBODY = [null, 'head and energy', 'face, eyes and throat', 'shoulders and breathing', 'chest and heart', 'stomach and digestion', 'digestion and immunity', 'kidneys and lower back', 'chronic and hidden issues', 'hips and thighs', 'knees and joints', 'calves and circulation', 'feet, sleep and eyes'];
  function day(p, c, q, now, D, off) {
    var ql = q.toLowerCase(), tk = topicOf(ql) || 'general', T = TOPIC[tk], name = first(p.name), k = c.k, sc = D.score, dw = off ? 'tomorrow' : 'today';
    var mo = D.tr.filter(function (x) { return x.code === 'Mo'; })[0], mh = mo ? mo.h : null, cb = sc.cb, tara = sc.tara;
    var score = sc.score;
    if (mh && T.houses.indexOf(mh) >= 0) score += (tk === 'health' && [6, 8, 12].indexOf(mh) >= 0) ? -1 : (tk === 'health' ? 0 : 1);
    var slowBad = D.tr.filter(function (x) { return ['Ma', 'Sa', 'Ra', 'Ke'].indexOf(x.code) >= 0 && T.houses.indexOf(x.h) >= 0 && x.verdict === 'bad'; });
    score -= slowBad.length * 0.5;
    var v = cb === 8 ? 'bad' : score >= 2 ? 'good' : score <= -1 ? 'bad' : 'mixed';
    var lead = { good: { health: 'your health energy is good ' + dw, general: dw + ' is a strong day for you' }, mixed: { health: 'health is steady ' + dw + ', with small ups and downs', general: dw + ' is a steady day' }, bad: { health: 'go easy on your body ' + dw, general: dw + ' is a day to go slow' } }[v];
    var head = lead[tk] || ('your ' + T.noun + ' looks ' + { good: 'supportive', mixed: 'steady', bad: 'like it needs care' }[v] + ' ' + dw);
    var quick = name + ', ' + head + '. ' + cap(DAYTIP[tk][v]) + '.' + (cb === 8 ? ' The Moon is 8th from your birth Moon (Chandrashtama), so energy and mood run low.' : '');
    var paras = [];
    paras.push('The Moon is in ' + SG[D.pc.moonSign] + ' ' + dw + ', ' + (mh ? 'passing through your ' + nth(mh) + ' house (' + P.AREA_SHORT[mh] + ')' : '') + ' and ' + nth(cb) + ' from your birth Moon. ' + (tk === 'health' && mh ? 'In the body this points to ' + MOONBODY[mh] + ', so give that area a little care. ' : '') + 'The day’s star ' + D.pc.nak.name + ' is ' + tara[0] + ' tara for you: ' + tara[2].charAt(0).toLowerCase() + tara[2].slice(1) + '.');
    var bg = D.chain.slice(0, 2).map(function (x) { return PN[x.lord]; }).join('-'), ss = D.sade;
    var bgs = 'In the background you are in the ' + bg + ' period' + (ss.q === 'bad' ? ', and Saturn’s hard position from your Moon (until ' + dmy(ss.until) + ') keeps tiredness in the background' : '') + '.';
    if (slowBad.length) bgs += ' ' + list(slowBad.map(function (x) { return PN[x.code] + ' in your ' + nth(x.h) + ' house (' + P.EFFECT[x.code].bad + ')'; })) + ' also ' + (slowBad.length > 1 ? 'need' : 'needs') + ' watching.';
    paras.push(bgs);
    var best = D.best.slice(0, 2).map(function (b) { return N.hm(b.start) + '–' + N.hm(b.end); });
    paras.push((tk === 'health' ? 'For a walk, exercise or a doctor visit, the better windows are ' : 'The better windows ' + dw + ' are ') + (best.length ? list(best) : 'the morning hours') + '; avoid starting anything in Rahu Kaal ' + N.hm(D.parts.rahu.start) + '–' + N.hm(D.parts.rahu.end) + '.');
    var ask = tk === 'health' ? 'How are you feeling ' + dw + '? If anything is bothering you, like tiredness, acidity or a headache, tell me and I will check it against your chart.' : 'What is the main thing you want to do ' + dw + '? I can find the best time for it.';
    return { verdict: v, quick: quick, question: ask, paras: paras, short: 'In short, ' + DAYTIP[tk][v] + ', ' + name + '.' };
  }
  return { day: day, topic: topic, topicOf: topicOf, horizonOf: horizonOf, symptoms: symptoms, planet: planet, event: event, kp: kp };
}
if (typeof module !== 'undefined') module.exports = makeStory;
