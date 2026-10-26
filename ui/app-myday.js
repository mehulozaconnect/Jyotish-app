/* Trikaal: My day, rebuilt as a practical plan.
   Verdict → focus areas (work, money, relationships, health, mind) → time plan → do / avoid → today's remedy → why (plain). */
var AREAS = [
  { id: 'work', t: 'Work and career', ic: '💼', houses: [10, 6, 11, 3], good: 'Push important work: presentations, approvals and follow-ups land well.', ok: 'Routine work goes fine; keep big asks for a stronger window.', bad: 'Expect friction or delays at work; stay factual, double-check, avoid confrontation.' },
  { id: 'money', t: 'Money and deals', ic: '₹', houses: [2, 11, 5, 9], good: 'Good for closing deals, collecting payments and planned purchases.', ok: 'Fine for small transactions; compare before committing.', bad: 'Hold big payments, loans and investments; money can leak through impulse spends.' },
  { id: 'rel', t: 'Family and relationships', ic: '❤', houses: [7, 4, 2, 5], good: 'Warm day with family and partner; good for reconnecting and plans together.', ok: 'Normal; listen more than you speak.', bad: 'Short tempers likely; avoid sensitive topics and do not react to small things.' },
  { id: 'health', t: 'Health and energy', ic: '✚', houses: [1, 6, 8, 12], inverse: true, good: 'Good energy; a fine day for exercise and getting things done.', ok: 'Normal energy; keep meals on time and sleep early.', bad: 'Low energy or minor niggles; eat light, hydrate, avoid strain and rash driving.' },
  { id: 'mind', t: 'Mind and mood', ic: '☾', houses: [], good: 'Clear, positive mind; good for decisions.', ok: 'Mixed mood; take decisions after a pause.', bad: 'Mind can feel heavy or anxious; avoid big decisions, spend quiet time.' }];
var DAY_REMEDY = { 0: ['Sun', 'Offer water to the rising Sun and chant Om Suryaya Namah 11 times.', 'orange or white'], 1: ['Moon', 'Offer water or milk on a Shivling; chant Om Namah Shivaya 11 times.', 'white'], 2: ['Mars', 'Read Hanuman Chalisa once; offer jaggery.', 'red'], 3: ['Mercury', 'Offer durva to Ganesha; feed green fodder to a cow.', 'green'], 4: ['Jupiter', 'Apply a turmeric tilak; offer chana dal at a temple.', 'yellow'], 5: ['Venus', 'Light a ghee lamp for Goddess Lakshmi; wear something fresh and fragrant.', 'white or pastel'], 6: ['Saturn', 'Light a mustard-oil lamp under a peepal tree; help a worker or elder.', 'navy blue or black'] };

function areaRatings(c, D) {
  var k = c.k, mo = D.tr.filter(function (x) { return x.code === 'Mo'; })[0], ma = D.tr.filter(function (x) { return x.code === 'Ma'; })[0];
  var sk = D.chain[3] || D.chain[2], fx = sk && c.func[sk.lord], skGood = sk && (sk.lord === J.lordOfHouse(k.ascSign, 1) || (fx && (fx.kind === 'benefic' || fx.kind === 'yogakaraka')));
  var skBad = sk && (sk.lord === 'Ra' || sk.lord === 'Ke' || (fx && fx.kind === 'malefic'));
  var skHouses = sk ? N.uniq(J.lordsOf(k.ascSign, sk.lord).concat([k.P[sk.lord].house])) : [];
  var base = D.score.score, out = {};
  AREAS.forEach(function (a) {
    var s = base * 0.5, why = [];
    if (a.id === 'mind') {
      var cb = D.score.cb; s += cb === 8 ? -3 : [1, 3, 6, 7, 10, 11].indexOf(cb) >= 0 ? 1 : (cb === 4 || cb === 12) ? -1.5 : 0;
      why.push('Moon is ' + N.nth(cb) + ' from your Moon sign' + (cb === 8 ? ' (Chandrashtama)' : ''));
    } else {
      if (mo && a.houses.indexOf(mo.h) >= 0) { s += a.inverse ? ([6, 8, 12].indexOf(mo.h) >= 0 ? -1.5 : 0.5) : ([6, 8, 12].indexOf(mo.h) >= 0 ? -0.5 : 1.5); why.push('Moon passes your ' + N.nth(mo.h) + ' house (' + N.houseTopic(mo.h).split(',')[0] + ')'); }
      if (sk && skHouses.some(function (h) { return a.houses.indexOf(h) >= 0; })) { var d = skGood ? 1 : skBad ? -1 : 0; if (a.inverse) d = skBad ? -1 : skGood ? 0.5 : 0; s += d; why.push('today\'s sub-period lord ' + PN[sk.lord] + ' touches this area' + (d > 0 ? ' and helps' : d < 0 ? ' and strains it' : '')); }
      if (ma && a.id === 'work' && [3, 6, 10, 11].indexOf(ma.h) >= 0) { s += 0.5; why.push('Mars in your ' + N.nth(ma.h) + ': drive to beat competition'); }
      if (ma && a.houses.indexOf(ma.h) >= 0 && [1, 4, 7, 8, 12].indexOf(ma.h) >= 0 && (a.id === 'health' || a.id === 'rel' || a.id === 'work')) { s -= 1; why.push('Mars in your ' + N.nth(ma.h) + ': heat and haste'); }
      if (a.id === 'health' && D.sade.q === 'bad') { s -= 0.5; why.push(D.sade.label); }
      if (a.id === 'money' && D.score.taraN && [2, 4, 6, 8, 9].indexOf(D.score.taraN) >= 0) { s += 0.5; why.push('favourable star for you today'); }
    }
    var r = s >= 1.2 ? 'good' : s <= -0.8 ? 'bad' : 'ok';
    out[a.id] = { r: r, s: s, line: a[r], why: why };
  });
  return out;
}

function MyDayView() {
  var p = me(); if (!p) return emptyState('Add your kundli first', 'My day combines today’s Moon, your dasha and your transits.', '<br><button class="btn acc" data-go="edit/new">Add my kundli</button>');
  var c = calcP(p), L = DB.settings.loc, now = new Date(), d0 = todayStart(U.dayOff), D = N.myDay(c, d0, L.lat, L.lon, U.dayOff ? new Date(d0.getTime() + 10 * 3600e3) : now), pc = D.pc;
  var lm = J.lunarMonth(pc.rise), parts = D.parts, R = areaRatings(c, D), isToday = !U.dayOff;
  var h = dayNav() + '<div class="pad">';
  /* verdict */
  var nextGood = null;
  if (D.score.v !== 'push') for (var i = 1; i <= 10; i++) { var dd = todayStart(U.dayOff + i), pl = J.panchangLite(dd, L.lat, L.lon), wd2 = new Date(pl.rise.getTime() + locOff() * 3600e3).getUTCDay(); if (N.dayScore(c, pl, wd2).v === 'push') { nextGood = { d: pl.rise, wd: wd2 }; break; } }
  var goodA = AREAS.filter(function (a) { return R[a.id].r === 'good'; }).map(function (a) { return a.t.split(' and ')[0].toLowerCase(); }), badA = AREAS.filter(function (a) { return R[a.id].r === 'bad'; }).map(function (a) { return a.t.split(' and ')[0].toLowerCase(); });
  var tone = D.score.v === 'push' ? 'dg' : D.score.v === 'backend' ? 'db' : 'dm';
  h += '<div class="dhero ' + tone + '"><div class="lbl">' + esc(p.name.split(' ')[0]) + ' · ' + lm.name + ' ' + pc.tithi.paksha + ' ' + pc.tithi.name + '</div><h2>' + D.word + '</h2><p>' + esc(D.guide) + '</p>' +
    ((goodA.length || badA.length) ? '<p class="dsum">' + (goodA.length ? 'Best for <b>' + goodA.join(', ') + '</b>. ' : '') + (badA.length ? 'Be careful with <b>' + badA.join(', ') + '</b>.' : '') + '</p>' : '') +
    (nextGood ? '<p class="dsum">Next strong day: <b>' + J.VARAS[nextGood.wd] + ' ' + N.dmY(nextGood.d) + '</b></p>' : '') + '</div>';
  /* focus areas */
  var RW = { good: ['Good', 'tg'], ok: ['Okay', 'tn'], bad: ['Careful', 'tr'] };
  h += '<div class="card"><h3>Your day, area by area</h3>' + AREAS.map(function (a) { var x = R[a.id]; return '<div class="darea"><span class="dic ' + x.r + '">' + a.ic + '</span><div><div class="kgh"><b>' + a.t + '</b><span class="tag ' + RW[x.r][1] + '">' + RW[x.r][0] + '</span></div><p>' + esc(x.line) + '</p>' + (x.why.length ? '<small>' + esc(x.why.join(' · ')) + '</small>' : '') + '</div></div>'; }).join('') + '</div>';
  /* time plan */
  var avoid = [['Rahu Kaal', parts.rahu], ['Yamaganda', parts.yama], ['Gulika', parts.gulika]].concat(J.vishtiWindows(pc.rise, pc.set).map(function (w) { return ['Bhadra', w]; }));
  function clash(a, b) { return a.start < b.end && b.start < a.end; }
  var slots = D.horas.filter(function (x) { return x.day; }).map(function (x) {
    var bad = avoid.filter(function (w) { return clash(x, w[1]); }).map(function (w) { return w[0]; }), q = ['Ju', 'Ve', 'Me', 'Mo'].indexOf(x.lord) >= 0 ? 'g' : x.lord === 'Sa' || x.lord === 'Ma' ? 'b' : 'm';
    var use = KB.HORA_USE[x.lord] || ''; if (bad.length && q === 'g') q = 'm';
    var abh = clash(x, parts.abhijit) && !parts.abhijit.wednesday;
    return '<div class="dslot ' + q + (now >= x.start && now < x.end && isToday ? ' now' : '') + '"><span class="mono">' + N.hm(x.start) + '</span><div><b>' + PN[x.lord] + ' hora' + (abh ? ' · Abhijit' : '') + '</b><p>' + esc(cap1(use)) + (bad.length ? ' <em>· ' + bad.join(', ') + ': no new starts</em>' : '') + '</p></div></div>';
  }).join('');
  h += '<div class="card"><h3>Time plan</h3><p class="sm" style="margin:-4px 0 8px">Green = best for calls, deals and new starts · red = routine work only</p>' + slots + '</div>';
  /* do / avoid */
  var dos = [], donts = [], best = D.best[0];
  if (best) dos.push('Make the important call or proposal at ' + N.hm(best.start) + '–' + N.hm(best.end) + '.');
  AREAS.forEach(function (a) { if (R[a.id].r === 'good' && dos.length < 4) dos.push(a.good); if (R[a.id].r === 'bad' && donts.length < 4) donts.push(a.bad); });
  donts.push('No new starts in Rahu Kaal ' + N.hm(parts.rahu.start) + '–' + N.hm(parts.rahu.end) + '.');
  var chW = J.signWindows('Mo', (c.k.P.Mo.sign + 7) % 12, pc.rise, new Date(pc.rise.getTime() + 864e5), 3)[0];
  if (chW) donts.push('Chandrashtama ' + (chW.start ? 'from ' + N.hm(chW.start) : 'now') + ': keep the mind calm, avoid arguments and big decisions.');
  donts.push('Avoid starting a journey towards the ' + KB.DISHA_SHOOL[D.wd] + ' (Disha shool).');
  if (dos.length < 2) dos.push('Use the green hours above for anything that needs a "yes" from others.');
  h += '<div class="card"><div class="grid2 dda"><div><div class="lbl" style="color:var(--good)">Do</div><ul>' + dos.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div><div><div class="lbl" style="color:var(--bad)">Avoid</div><ul>' + donts.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div></div></div>';
  /* remedy */
  var dr = DAY_REMEDY[D.wd], sk = D.chain[2];
  h += '<div class="card"><h3>Today’s small remedy</h3><p style="font-size:14px">' + esc(dr[1]) + '</p><p class="sm" style="margin-top:6px">Wear: <b>' + dr[2] + '</b>' + (sk ? ' · For your running ' + PN[sk.lord] + ' period: ' + esc(KB.MANTRA[sk.lord][0]) + ', 11 times' : '') + '</p>' + (D.sade.q === 'bad' ? '<p class="sm" style="margin-top:6px">' + esc(D.sade.label) + ' is running: Saturday Hanuman Chalisa keeps things steady.</p>' : '') + '</div>';
  /* why, plain */
  h += '<details class="card dwhy"><summary>Why the app says this</summary>' + D.why.map(function (w) { return '<div class="pc-row">' + itemIcon(w.val > 0 ? 'pro' : w.val < 0 ? 'con' : 'info') + '<span><b>' + esc(w.label) + ':</b> ' + esc(w.why) + '</span></div>'; }).join('') +
    '<div class="pc-row">' + itemIcon('info') + '<span>Dasha today: ' + D.chain.map(function (x) { return PN[x.lord]; }).join(' › ') + '.</span></div>' +
    D.slow.map(function (s) { return '<div class="pc-row">' + itemIcon(/\(bad\)/.test(s) ? 'con' : /\(good\)/.test(s) ? 'pro' : 'info') + '<span>Longer-term: ' + esc(s) + '</span></div>'; }).join('') + '</details>';
  U.shareFn = null;
  return h + '</div>';
}
function cap1(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
