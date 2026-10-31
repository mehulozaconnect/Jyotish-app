/* Trikaal: "Your health story" — a step-by-step visual walkthrough for someone with no astrology knowledge */
var DL = {
  Vata: { emo: '🌬️', elem: 'air and space', like: 'like the wind: light, quick and always moving', good: 'quick thinking, creative, active, light body', bad: 'dry skin, gas and bloating, cracking joints, worry, light or broken sleep, constipation', doo: ['Warm, cooked, slightly oily food', 'Fixed times for meals and sleep', 'Warm oil massage before bath', 'Gentle exercise, yoga, walking'], avoid: ['Skipping meals', 'Cold, dry, raw food in excess', 'Late nights and rushing', 'Too much screen and travel without rest'], col: '#6C8CC7' },
  Pitta: { emo: '🔥', elem: 'fire and a little water', like: 'like fire: sharp, warm and driven', good: 'strong digestion, sharp mind, leadership, warm body', bad: 'acidity, rashes, anger, inflammation, high BP, burning eyes, burnout', doo: ['Cooling food: buttermilk, coconut water, cucumber, fruit', 'Calm down before eating', 'Exercise in the cool morning or evening', 'Time in nature and near water'], avoid: ['Very spicy, oily and fried food', 'Midday sun and overheating', 'Skipping meals when hungry', 'Arguments and overwork'], col: '#D9763A' },
  Kapha: { emo: '🌊', elem: 'earth and water', like: 'like earth and water: steady, strong and calm', good: 'good stamina, strong immunity, calm and loyal nature', bad: 'weight gain, cough and cold, congestion, sluggishness, water retention, high sugar', doo: ['Light, warm, freshly cooked food', 'Brisk exercise every day (sweat a little)', 'Early, light dinner', 'Wake up early'], avoid: ['Day sleep', 'Sweets, fried food, heavy dairy', 'Overeating and late dinners', 'Long sitting'], col: '#4FA37A' }
};
var PLAIN_P = { Su: 'energy, heart and bones', Mo: 'mind, sleep and body fluids', Ma: 'blood, muscles and heat', Me: 'nerves, skin and breathing', Ju: 'liver, weight and sugar', Ve: 'kidneys, hormones and glow', Sa: 'bones, joints and long-term wear', Ra: 'allergies, anxiety and odd symptoms', Ke: 'infections and sudden problems' };
var STEPS = ['Your body type', 'Your built-in strength', 'Parts to look after', 'Your life chapter now', 'Today\'s sky', 'Focus on this', 'Your daily routine'];
function storyStep(p, i) {
  var R = maOf(p), all = mcAll(p), c = calcP(p), n1 = p.name.split(' ')[0], now = new Date(), dm = function (d) { return N.dmy(d); };
  var you = relOf(p) === 'me' ? 'you' : n1, your = relOf(p) === 'me' ? 'your' : n1 + '\'s', Your = your.charAt(0).toUpperCase() + your.slice(1);
  function term(t) { return '<details class="term"><summary>Astrology behind this</summary><p>' + esc(t) + '</p></details>'; }
  function means(t) { return '<div class="means"><b>What this means for ' + (you === 'you' ? 'you' : esc(n1)) + '</b><p>' + esc(t) + '</p></div>'; }
  var h = '';
  if (i === 0) {
    var d = R.dosha, m = DL[d.main], s2 = DL[d.second], pc = d.pc, acc = 0;
    var donut = '<svg viewBox="0 0 42 42" class="donut">' + ['Vata', 'Pitta', 'Kapha'].map(function (k) { var v = pc[k], seg = '<circle cx="21" cy="21" r="15.9" fill="none" stroke="' + DL[k].col + '" stroke-width="6" stroke-dasharray="' + v + ' ' + (100 - v) + '" stroke-dashoffset="' + (25 - acc) + '"/>'; acc += v; return seg; }).join('') + '<text x="21" y="20" text-anchor="middle" font-size="7">' + m.emo + '</text><text x="21" y="28" text-anchor="middle" font-size="4.6" font-weight="700">' + d.main + '</text></svg>';
    h += '<div class="sthero">' + donut + '<div>' + ['Vata', 'Pitta', 'Kapha'].map(function (k) { return '<p class="dl"><i style="background:' + DL[k].col + '"></i>' + DL[k].emo + ' <b>' + k + '</b> ' + pc[k] + '%</p>'; }).join('') + '</div></div>';
    h += '<p class="stp">Ayurveda describes three body energies. ' + Your + ' body is mainly <b>' + d.main + '</b> (' + m.elem + '), ' + m.like + '.' + (pc[d.second] >= 25 ? ' There is also a good share of <b>' + d.second + '</b>.' : '') + '</p>';
    h += '<div class="twocol"><div class="g"><b>👍 Natural strengths</b><p>' + esc(m.good) + '</p></div><div class="b"><b>⚠️ When out of balance</b><p>' + esc(m.bad) + '</p></div></div>';
    h += '<div class="twocol"><div class="g"><b>✓ Suits ' + esc(you) + '</b><ul>' + m.doo.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div><div class="b"><b>✕ Avoid</b><ul>' + m.avoid.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div></div>';
    h += term('Body type is read from the rising sign (Lagna ' + J.SIGNS[c.k.ascSign] + '), its ruler, the Moon sign (' + J.SIGNS[c.k.P.Mo.sign] + ') and where most planets sit. Fire signs give Pitta, water signs Kapha, air signs Vata.');
  }
  if (i === 1) {
    var L = R.lagna, sun = R.st.Su.state, moon = R.st.Mo.state, w = { strong: 0.9, average: 0.6, weak: 0.35, afflicted: 0.15 };
    function bar(lbl, emo, v, txt) { var col = v >= 0.75 ? '#3E9A6A' : v >= 0.45 ? '#D79A2B' : '#C0453A'; return '<div class="sbar2"><span>' + emo + '</span><div><b>' + lbl + '</b><i><em style="width:' + Math.round(v * 100) + '%;background:' + col + '"></em></i><small>' + esc(txt) + '</small></div></div>'; }
    h += '<p class="stp">Think of three batteries that keep ' + esc(you) + ' healthy.</p>';
    h += bar('Body shield', '🛡️', L.score / 5, L.score >= 4 ? 'Strong: recovers quickly when ill.' : L.score >= 2 ? 'Average: recovers, but needs proper rest.' : 'Low: needs regular prevention and rest.');
    h += bar('Energy', '☀️', w[sun], sun === 'strong' ? 'Good energy and drive.' : sun === 'average' ? 'Normal energy; avoid overwork.' : 'Energy dips easily; sleep and sunlight help.');
    h += bar('Mind', '🌙', w[moon], moon === 'strong' ? 'Calm mind, good sleep.' : moon === 'average' ? 'Mostly steady; stress can disturb sleep.' : 'Sensitive mind; stress shows up in the body.');
    h += means(L.score >= 4 ? 'Even when a problem comes, ' + you + ' bounce' + (you === 'you' ? '' : 's') + ' back well. Act early and recovery is fast.' : L.score >= 2 ? 'The body copes, but it needs help: fixed routine, rest after illness and yearly check-ups.' : 'Prevention matters more than usual: regular sleep, gentle routine, check-ups on time, and do not ignore small symptoms.');
    h += term('Body shield = strength of the Lagna (rising sign) and its ruler ' + MA.PN[L.lord] + ' (' + L.score + '/5 tests passed). Energy = the Sun (' + sun + '). Mind = the Moon (' + moon + ').');
  }
  if (i === 2) {
    var arr = Object.keys(all).map(function (k) { return all[k]; }).filter(function (a) { return a.pr.id !== 'surgery'; }).sort(function (a, b) { return MC_TV[b.tend] - MC_TV[a.tend]; }).slice(0, 3);
    h += '<div class="bmwrap">' + bodyMap(p, all) + '<div class="bmside">' + arr.map(function (a) { return '<button data-go="medical/case/' + a.pr.id + '"><i style="background:' + mcCol(MC_TV[a.tend]) + '"></i>' + (MC_ICON[a.pr.id] || '') + ' ' + esc(a.pr.n.split(' / ')[0]) + '</button>'; }).join('') + '</div></div>';
    h += '<p class="stp">Every body has a few parts that need more care. These are ' + your + ':</p>';
    var usedW = []; h += arr.map(function (a, j) { var why = a.story.filter(function (x) { return usedW.indexOf(x) < 0; })[0] || (a.story.length ? 'The same pressure shown above also touches this area.' : 'Mild pointers only.'); usedW.push(why); return '<div class="numc"><em>' + (j + 1) + '</em><div><b>' + (MC_ICON[a.pr.id] || '') + ' ' + esc(a.pr.n) + ' <span class="pill" style="background:' + mcCol(MC_TV[a.tend]) + '">' + esc(a.tend.replace(' tendency', '')) + '</span></b><p>' + esc(why) + '</p><small>Protect it: ' + esc(a.pr.dos[0]) + '; ' + esc(a.pr.tests[0]) + '.</small></div></div>'; }).join('');
    h += means('These are tendencies, not illnesses. Looking after these parts early is the whole point.');
    h += term('Each body part is checked three ways: its zodiac sign, the house that rules it in the birth chart, and its planet. The more of these are under pressure, the stronger the tendency.');
  }
  if (i === 3) {
    var md = R.dasha[0], ad = R.dasha[1] || md, t0 = md.start.getTime(), t1 = md.end.getTime(), sp = t1 - t0, pos = Math.max(0, Math.min(100, (now - t0) / sp * 100));
    var adBand = J.subPeriods({ lord: md.code, start: md.start, end: md.end, level: 1 }).map(function (x) { var on = now >= x.start && now < x.end; return '<i class="' + (on ? 'on' : '') + '" style="left:' + ((x.start - t0) / sp * 100).toFixed(1) + '%;width:' + ((x.end - x.start) / sp * 100).toFixed(1) + '%">' + (((x.end - x.start) / sp) > 0.07 ? MA.PN[x.lord].slice(0, 3) : '') + '</i>'; }).join('');
    h += '<p class="stp">Life moves in chapters. Each chapter is ruled by one planet, and that planet decides which parts of the body get more attention during that time.</p>';
    h += '<div class="chap"><div class="chap1"><b>' + MA.PN[md.code] + ' chapter</b><span>' + dm(md.start) + ' → ' + dm(md.end) + '</span></div><div class="chapbar">' + adBand + '<em style="left:' + pos.toFixed(1) + '%"></em></div><small>Small sections = sub-chapters. Highlighted = now (' + MA.PN[ad.code] + ' till ' + dm(ad.end) + ').</small></div>';
    h += [md, ad].map(function (x, j) { return '<div class="numc ' + (x.bad ? 'bad' : 'good') + '"><em>' + (j ? '◐' : '●') + '</em><div><b>' + (j ? 'Sub-chapter: ' : 'Main chapter: ') + MA.PN[x.code] + ' <span class="pill" style="background:' + (x.bad ? '#C0453A' : '#3E9A6A') + '">' + (x.bad ? 'needs care' : 'supportive') + '</span></b><p>' + esc(MA.PN[x.code] + ' looks after ' + PLAIN_P[x.code] + '. ' + (x.bad ? 'In ' + your + ' chart it brings pressure, so watch for ' + MA.MD_HEALTH[x.code][0] + '.' : 'In ' + your + ' chart it helps: ' + MA.MD_HEALTH[x.code][1] + '.') + (x.areas.length ? ' Parts it wakes up: ' + x.areas.join(', ') + '.' : '')) + '</p></div></div>'; }).join('');
    if (R.upcoming[0]) h += means('Next change to prepare for: ' + R.upcoming[0].text.replace(/ touches the [^:.]+house\./, ' begins.').replace('Book a routine check-up just before it starts;', 'Book a check-up just before it starts;'));
    h += term('Chapters = Vimshottari Mahadasha; sub-chapters = Antardasha. Running now: ' + R.dasha.map(function (x) { return MA.PN[x.code]; }).join(' › ') + '.');
  }
  if (i === 4) {
    var T = J.kundli(now, +p.lat, +p.lon), A = c.k.ascSign, list = ['Sa', 'Ju', 'Ra', 'Ke', 'Ma'].map(function (x) {
      var hL = J.houseFrom(A, T.P[x].sign), next = J.nextIngress(x === 'Ke' ? 'Ra' : x, now, 1200), good = x === 'Ju' ? [2, 5, 7, 9, 11, 1].indexOf(hL) >= 0 : [3, 6, 11].indexOf(hL) >= 0;
      return { x: x, h: hL, next: next, good: good };
    });
    var EMO = { Sa: '🪐', Ju: '🟡', Ra: '🌑', Ke: '☄️', Ma: '🔴' }, WHAT = { Sa: 'slows things down and tests patience', Ju: 'protects and heals', Ra: 'magnifies and unsettles', Ke: 'brings sudden or hidden things', Ma: 'adds heat and speed' };
    h += '<p class="stp">If the life chapter is the season, the moving planets are the weather. Slow planets stay over one part of ' + your + ' chart for months or years.</p>';
    h += list.map(function (t) { return '<div class="sky ' + (t.good ? 'g' : 'b') + '"><span>' + EMO[t.x] + '</span><div><b>' + MA.PN[t.x] + ' over ' + esc(MA.HOUSE_BODY[t.h - 1].split(',').slice(0, 2).join(' & ')) + '</b><p>' + esc(MA.PN[t.x] + ' ' + WHAT[t.x] + '. ' + (t.good ? 'Here it helps.' : 'Here, take care of this area.')) + '</p><small>' + (t.next ? 'Until ' + dm(t.next) : '') + '</small></div></div>'; }).join('');
    var sat = R.transits.filter(function (t) { return /Sade Sati|Ashtama|Kantaka/.test(t.t); })[0]; if (sat) h += means(sat.t.split(':')[0] + ' is running: a phase when tiredness and pressure build. Keep a strict routine and rest well.');
    if (R.agree.length) h += '<div class="means warn"><b>Season and weather agree</b><p>' + esc(R.agree.join(' ')) + '</p></div>';
    h += term('Transits counted from the rising sign; the Moon-sign view is in the Timing tab. ' + R.transits.map(function (t) { return t.t; }).join(' '));
  }
  if (i === 5) {
    var focus = Object.keys(all).map(function (k) { return all[k]; }).filter(function (a) { return a.pr.id !== 'surgery'; }).sort(function (a, b) { return (MC_TV[b.tend] + MC_NV[b.nowWord]) - (MC_TV[a.tend] + MC_NV[a.nowWord]); }).slice(0, 3);
    var mon = R.calendar[0], chk = R.calendar.filter(function (m) { return [3, 6, 11].indexOf(m.hm) >= 0; })[0];
    h += '<p class="stp">Putting body type, chapter and sky together, these are the three things to focus on now:</p>';
    h += focus.map(function (a, j) { return '<a class="focus" data-go="medical/case/' + a.pr.id + '"><em>' + (j + 1) + '</em><div><b>' + (MC_ICON[a.pr.id] || '') + ' ' + esc(a.pr.n) + '</b><small>' + esc(a.nowWord + ' · ' + a.tend) + '</small><ul><li>🩺 ' + esc(a.pr.tests[0]) + '</li><li>✕ ' + esc(a.pr.avoid[0]) + '</li><li>✓ ' + esc(a.pr.dos[0]) + '</li></ul></div><span>›</span></a>'; }).join('');
    h += '<div class="twocol"><div class="' + ([1, 8, 12].indexOf(mon.hm) >= 0 ? 'b' : 'g') + '"><b>📅 This month</b><p>' + esc(mon.theme ? mon.theme.charAt(0).toUpperCase() + mon.theme.slice(1) + '. ' + mon.note.charAt(0).toUpperCase() + mon.note.slice(1) + '.' : 'A normal month: keep routines.') + '</p></div><div class="g"><b>🩺 Best month for check-ups</b><p>' + esc(chk ? ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][chk.from.getMonth()] + ' ' + chk.from.getFullYear() : 'Any month') + '</p></div></div>';
  }
  if (i === 6) {
    var d2 = DL[R.dosha.main], foc = Object.keys(all).map(function (k) { return all[k]; }).filter(function (a) { return a.pr.id !== 'surgery'; }).sort(function (a, b) { return (MC_TV[b.tend] + MC_NV[b.nowWord]) - (MC_TV[a.tend] + MC_NV[a.nowWord]); }).slice(0, 2), r0 = R.remedies[0], pl = r0 ? MA.PL[r0.code] : null;
    var rows = [['🌅', 'Morning', [d2.doo[3] || d2.doo[0], foc[0] ? foc[0].pr.dos[0] : '', pl ? MA.PN[r0.code] + ' mantra, 108 times (' + (r0.mode === 'pacify' ? 'on ' + pl.day + 's' : 'daily') + ')' : '']], ['🍽️', 'Meals', [d2.doo[0], foc[0] ? 'Avoid ' + foc[0].pr.avoid[0].toLowerCase() : '', foc[1] ? 'Avoid ' + foc[1].pr.avoid[0].toLowerCase() : '']], ['🌆', 'Evening', [foc[1] ? foc[1].pr.dos[0] : '', d2.doo[2] || '', 'Screens off an hour before bed']], ['🌙', 'Night', [d2.avoid[0] ? 'Avoid ' + d2.avoid[0].toLowerCase() : '', 'Sleep at the same time every night']], ['📆', 'Weekly', [pl && r0.mode === 'pacify' ? 'Every ' + pl.day + ': donate ' + pl.daan.split(',').slice(0, 2).join(',') : pl ? 'Every ' + pl.day + ': wear ' + pl.colour + ' and eat ' + pl.foods.split(',')[0] : '', '2 days of strength or yoga practice']], ['🩺', 'Yearly', foc.map(function (a) { return a.pr.tests[0]; })]];
    h += '<p class="stp">Here is everything turned into a simple day. Small, steady habits matter more than big efforts.</p>';
    h += '<div class="day">' + rows.map(function (r) { var it = r[2].filter(Boolean); if (!it.length) return ''; return '<div><span>' + r[0] + '</span><div><b>' + r[1] + '</b><ul>' + it.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div></div>'; }).join('') + '</div>';
    h += means('Follow this for 40 days, then review with your doctor\'s reports. Remedies support medicine; they never replace it.');
  }
  return h;
}
function HealthStory(i) {
  var p = curP(); if (!p) return noPerson(); i = Math.max(0, Math.min(STEPS.length - 1, +i || 0));
  var h = '<div class="top"><button class="ib" data-go="medical">' + icon('back') + '</button><span class="ttl">' + esc(p.name.split(' ')[0]) + '\'s health story</span></div><div class="pad">';
  h += '<div class="stdots">' + STEPS.map(function (s, j) { return '<button data-go="medical/story/' + j + '" class="' + (j === i ? 'on' : j < i ? 'done' : '') + '"></button>'; }).join('') + '</div>';
  h += '<div class="card story"><div class="stnum">Step ' + (i + 1) + ' of ' + STEPS.length + '</div><h2>' + esc(STEPS[i]) + '</h2>' + storyStep(p, i) + '</div>';
  h += '<div class="stnav">' + (i > 0 ? '<button class="btn sec" data-go="medical/story/' + (i - 1) + '">‹ Back</button>' : '<span></span>') + (i < STEPS.length - 1 ? '<button class="btn acc" data-go="medical/story/' + (i + 1) + '">Next: ' + esc(STEPS[i + 1]) + ' ›</button>' : '<button class="btn acc" data-go="medical">Done</button>') + '</div>';
  return h + maSafety() + '</div>';
}
(function () {
  var r0 = render;
  render = function () {
    var pr = parts();
    if (pr[0] === 'medical' && pr[1] === 'story') {
      applySettings(); var html; try { html = HealthStory(pr[2]); } catch (e) { html = '<div class="empty"><h2>Something went wrong</h2>' + esc(e.message) + '</div>'; if (window.console) console.error(e); }
      $('#app').innerHTML = html; $('#nav').innerHTML = NAVS.map(function (x) { return '<button data-go="' + x[0] + '" class="' + (x[0] === 'astro' ? 'on' : '') + '">' + icon(x[0]) + x[1] + '</button>'; }).join('');
      document.body.classList.remove('asking'); var ap = $('#askbar'); if (ap) ap.classList.add('hide'); window.scrollTo(0, 0);
      try { if (isTr()) hiApply(true); } catch (e) { }
      return;
    }
    r0();
  };
  var mh = MedHome;
  MedHome = function () {
    var h = mh(), p = curP(); if (!p) return h;
    var i = h.indexOf('<div class="card mhero">'); if (i < 0) return h;
    return h.slice(0, i) + '<button class="storycta" data-go="medical/story/0"><span>📖</span><div><b>Your health story in 7 steps</b><small>Body type → strength → sensitive parts → life chapter → today\'s sky → focus → daily routine. No astrology knowledge needed.</small></div><em>›</em></button>' + h.slice(i);
  };
})();
