/* Trikaal: Kundli Milan (Ashtakoota guna matching + Mangal dosha + marriage outlook), Parashari / N.C. Lahiri */
var MIL = (function () {
  var VARNA = ['Shudra', 'Vaishya', 'Kshatriya', 'Brahmin'];
  function varna(sign) { return [2, 1, 0, 3][sign % 4]; }
  var VASHYA = ['Chatushpad (four-legged)', 'Manav (human)', 'Jalchar (water)', 'Vanchar (wild)', 'Keet (insect)'];
  function vashya(lon) { var s = Math.floor(lon / 30), d = lon % 30; if (s === 8) return d < 15 ? 1 : 0; if (s === 9) return d < 15 ? 0 : 2; return [0, 0, 1, 2, 3, 1, 1, 4, 0, 0, 1, 2][s]; }
  var VT = [[2, 1, 1, 0.5, 1], [1, 2, 0.5, 0, 1], [1, 0.5, 2, 1, 1], [0.5, 0, 1, 2, 0], [1, 1, 1, 0, 2]];
  var YONI = ['Horse', 'Elephant', 'Sheep', 'Serpent', 'Dog', 'Cat', 'Rat', 'Cow', 'Buffalo', 'Tiger', 'Deer', 'Monkey', 'Mongoose', 'Lion'];
  var NY = [0, 1, 2, 3, 3, 4, 5, 2, 5, 6, 6, 7, 8, 9, 8, 9, 10, 10, 4, 11, 12, 11, 13, 0, 13, 7, 1];
  var YT = [[4, 2, 2, 3, 2, 2, 2, 1, 0, 1, 3, 3, 2, 1], [2, 4, 3, 3, 2, 2, 2, 2, 3, 1, 2, 3, 2, 0], [2, 3, 4, 2, 1, 2, 1, 3, 3, 1, 2, 0, 3, 1], [3, 3, 2, 4, 2, 1, 1, 1, 1, 2, 2, 2, 0, 2], [2, 2, 1, 2, 4, 2, 1, 2, 2, 1, 0, 2, 1, 1], [2, 2, 2, 1, 2, 4, 0, 2, 2, 1, 3, 3, 2, 1], [2, 2, 1, 1, 1, 0, 4, 2, 2, 2, 2, 2, 1, 2], [1, 2, 3, 1, 2, 2, 2, 4, 3, 0, 3, 2, 2, 1], [0, 3, 3, 1, 2, 2, 2, 3, 4, 1, 2, 2, 2, 1], [1, 1, 1, 2, 1, 1, 2, 0, 1, 4, 1, 1, 2, 1], [3, 2, 2, 2, 0, 3, 2, 3, 2, 1, 4, 2, 2, 1], [3, 3, 0, 2, 2, 3, 2, 2, 2, 1, 2, 4, 3, 2], [2, 2, 3, 0, 1, 2, 1, 2, 2, 2, 2, 3, 4, 2], [1, 0, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 2, 4]];
  var GANA = ['Deva', 'Manushya', 'Rakshasa'];
  var NG = [0, 1, 2, 1, 0, 1, 0, 0, 2, 2, 1, 1, 0, 2, 0, 2, 0, 2, 2, 1, 1, 0, 2, 2, 1, 1, 0];
  var GT = [[6, 6, 1], [5, 6, 0], [1, 0, 6]];
  var NADI = ['Adi (Vata)', 'Madhya (Pitta)', 'Antya (Kapha)'];
  function nadi(i) { return [0, 1, 2, 2, 1, 0][i % 6]; }
  function rel(a, b) { if (a === b) return 'f'; return J.FRIEND[a].indexOf(b) >= 0 ? 'f' : J.ENEMY[a].indexOf(b) >= 0 ? 'e' : 'n'; }
  function maitri(a, b) { var r = [rel(a, b), rel(b, a)].sort().join(''); return { ff: 5, fn: 4, nn: 3, ef: 1, en: 0.5, ee: 0 }[r]; }
  function tara(from, to) { var n = ((to - from + 27) % 27) % 9; return [3, 5, 7].indexOf(n + 1) < 0; }

  function mangal(c) {
    var P = c.k.P, md = [1, 2, 4, 7, 8, 12], fl = P.Ma.house, fm = (P.Ma.sign - P.Mo.sign + 12) % 12 + 1, hit = [];
    if (md.indexOf(fl) >= 0) hit.push(N.nth(fl) + ' from lagna'); if (md.indexOf(fm) >= 0) hit.push(N.nth(fm) + ' from Moon');
    if (!hit.length) return { lvl: 0, t: 'No Mangal dosha' };
    var red = [];
    if (['Own sign', 'Exalted', 'Moolatrikona'].indexOf(P.Ma.dignity) >= 0) red.push('Mars is strong in its own or exalted sign');
    if ([0, 7, 9].indexOf(P.Ma.sign) >= 0 && red.length === 0) red.push('Mars in Aries, Scorpio or Capricorn');
    if (P.Ju.sign === P.Ma.sign || J.aspectedHouses('Ju', P.Ju.house).indexOf(P.Ma.house) >= 0) red.push('Jupiter sees or joins Mars');
    var a = age(c.p, new Date()); if (a >= 28) red.push('person is past 28, when the dosha is traditionally weaker');
    var lvl = red.length ? 1 : hit.length === 2 ? 3 : 2;
    return { lvl: lvl, t: lvl === 1 ? 'Mild Mangal dosha (reduced)' : lvl === 3 ? 'Strong Mangal dosha' : 'Mangal dosha', why: 'Mars in the ' + hit.join(' and ') + '.' + (red.length ? ' Reduced because ' + red.join('; ') + '.' : '') };
  }

  function outlook(c, who) {
    var k = c.k, P = k.P, l7 = J.RULER[(k.ascSign + 6) % 12], kar = who === 'F' ? 'Ju' : 'Ve', good = [], bad = [];
    var h7 = P[l7].house;
    if ([6, 8, 12].indexOf(h7) >= 0) bad.push('7th lord ' + PN[l7] + ' sits in the ' + N.nth(h7) + ': marriage needs patience and effort'); else good.push('7th lord ' + PN[l7] + ' is well placed in the ' + N.nth(h7));
    var dg = P[kar].dignity; if (dg === 'Debilitated' || dg === 'Enemy sign') bad.push(PN[kar] + (who === 'F' ? ' (husband karaka)' : ' (wife karaka)') + ' is weak (' + dg.toLowerCase() + ')'); else if (/Exalted|Own|Moolatrikona|Friendly/.test(dg)) good.push(PN[kar] + ' (' + (who === 'F' ? 'husband' : 'wife') + ' karaka) is strong');
    var in7 = k.planets.filter(function (p) { return p.house === 7 && ['Sa', 'Ra', 'Ke', 'Ma', 'Su'].indexOf(p.code) >= 0; }).map(function (p) { return PN[p.code]; });
    if (in7.length) bad.push(in7.join(' and ') + ' in the 7th: ego or distance can creep in, so keep talking');
    var ch = J.dashaChain(c.maha, new Date(), 2), ad = ch[1] || ch[0], ls = J.lordsOf(k.ascSign, ad.lord);
    var tim = ls.indexOf(7) >= 0 || ad.lord === 'Ve' || ad.lord === kar || P[ad.lord].house === 7 ? 'Running ' + PN[ch[0].lord] + '–' + PN[ad.lord] + ' (till ' + N.dmy(ad.end) + ') supports marriage now.' : ad.lord === 'Sa' || ad.lord === 'Ra' || ad.lord === 'Ke' ? 'Running ' + PN[ch[0].lord] + '–' + PN[ad.lord] + ' (till ' + N.dmy(ad.end) + '): delays or second thoughts are possible; fix dates carefully.' : 'Running ' + PN[ch[0].lord] + '–' + PN[ad.lord] + ' (till ' + N.dmy(ad.end) + '): neutral for marriage timing.';
    return { good: good, bad: bad, tim: tim };
  }

  function match(boy, girl) {
    var cb = calcP(boy), cg = calcP(girl), B = cb.k.P.Mo, G = cg.k.P.Mo, bn = B.nak.index, gn = G.nak.index, bs = B.sign, gs = G.sign, R = [];
    var v = varna(bs) >= varna(gs) ? 1 : 0;
    R.push({ n: 'Varna', max: 1, s: v, d: VARNA[varna(bs)] + ' / ' + VARNA[varna(gs)], m: 'Work outlook and ego', g: 'Similar outlook on duty and work; the girl will respect the boy\'s way of working.', b: 'Different temperaments about work and status; small ego clashes. Minor factor.' });
    var vb = vashya(B.lon), vg = vashya(G.lon), vs = VT[vb][vg];
    R.push({ n: 'Vashya', max: 2, s: vs, d: VASHYA[vb].split(' ')[0] + ' / ' + VASHYA[vg].split(' ')[0], m: 'Mutual attraction and give-and-take', g: 'Natural pull towards each other; each listens to the other.', b: 'One may try to dominate; decisions need conscious sharing.' });
    var t1 = tara(gn, bn), t2 = tara(bn, gn), ts = (t1 ? 1.5 : 0) + (t2 ? 1.5 : 0);
    R.push({ n: 'Tara', max: 3, s: ts, d: (t1 ? 'good' : 'bad') + ' / ' + (t2 ? 'good' : 'bad'), m: 'Luck and health for each other', g: 'Each brings good luck and wellbeing to the other.', b: 'Fortune and health of one can dip after marriage; keep health checks and remedies regular.' });
    var yb = NY[bn], yg = NY[gn], ys = YT[yb][yg];
    R.push({ n: 'Yoni', max: 4, s: ys, d: YONI[yb] + ' / ' + YONI[yg], m: 'Physical and intimate compatibility', g: 'Comfortable physical bond and similar instincts.', b: ys === 0 ? 'Natural enemy yonis: intimacy and daily habits can clash; needs understanding.' : 'Different instincts and habits; adjustment needed in private life.' });
    var lb = J.RULER[bs], lg = J.RULER[gs], ms = maitri(lb, lg);
    R.push({ n: 'Graha Maitri', max: 5, s: ms, d: PN[lb] + ' / ' + PN[lg], m: 'Mental wavelength and friendship', g: 'They think alike and become good friends; easy conversations.', b: 'Different thinking styles; arguments over small things unless both stay patient.' });
    var gb = NG[bn], gg = NG[gn], gs2 = GT[gb][gg];
    R.push({ n: 'Gana', max: 6, s: gs2, d: GANA[gb] + ' / ' + GANA[gg], m: 'Nature and temperament', g: 'Matching nature; daily life runs smoothly.', b: 'Very different natures (one soft, one sharp); quarrels and stubbornness possible.' });
    var dist = (bs - gs + 12) % 12 + 1, bkBad = [2, 12, 5, 9, 6, 8].indexOf(dist) >= 0, bkCanc = bkBad && (lb === lg || (rel(lb, lg) === 'f' && rel(lg, lb) === 'f')), bk = bkBad ? 0 : 7;
    R.push({ n: 'Bhakoot', max: 7, s: bk, d: J.SIGNS[bs] + ' / ' + J.SIGNS[gs] + ' (' + { 1: '1/1', 7: '7/7', 2: '2/12', 12: '2/12', 3: '3/11', 11: '3/11', 4: '4/10', 10: '4/10', 5: '5/9', 9: '5/9', 6: '6/8', 8: '6/8' }[dist] + ')', m: 'Family welfare, money and children', g: 'Good for family growth, finances and children.', b: { 2: 'Money and family disputes', 12: 'Money and family disputes', 5: 'Delay or worry about children', 9: 'Delay or worry about children', 6: 'Health strain and quarrels', 8: 'Health strain and quarrels' }[dist] + (bkCanc ? '. Cancelled: the Moon sign lords are the same or friends, so the effect is mild.' : '.'), dosha: bkBad ? (bkCanc ? 'cancelled' : 'active') : '' });
    var nb = nadi(bn), ng = nadi(gn), ndBad = nb === ng, ndCanc = ndBad && ((bn === gn && B.nak.pada !== G.nak.pada) || (bs === gs && bn !== gn) || (bn === gn && bs !== gs)), nd = ndBad ? 0 : 8;
    R.push({ n: 'Nadi', max: 8, s: nd, d: NADI[nb].split(' ')[0] + ' / ' + NADI[ng].split(' ')[0], m: 'Health and children (most important)', g: 'Different nadis: good for health and healthy children.', b: 'Same nadi: traditionally the biggest dosha, linked to health problems and difficulty with children.' + (ndCanc ? ' Cancelled here: same nakshatra or same sign with a different pada or star, so the effect is much reduced.' : ''), dosha: ndBad ? (ndCanc ? 'cancelled' : 'active') : '' });
    var tot = R.reduce(function (a, r) { return a + r.s; }, 0), mb = mangal(cb), mg = mangal(cg);
    return { boy: boy, girl: girl, cb: cb, cg: cg, R: R, tot: tot, mb: mb, mg: mg, ob: outlook(cb, 'M'), og: outlook(cg, 'F'), nadi: R[7], bhakoot: R[6], B: B, G: G };
  }

  function verdict(M) {
    var t = M.tot, nd = M.nadi.dosha === 'active', bk = M.bhakoot.dosha === 'active', mgOk = (M.mb.lvl >= 2) === (M.mg.lvl >= 2), cls, txt, intro;
    if (t < 18) { cls = 'b'; txt = 'Not recommended (' + t + '/36)'; intro = 'Below 18 gunas: traditionally marriage is not advised without a deeper look at both full charts.'; }
    else if (t < 25) { cls = 'm'; txt = 'Average match (' + t + '/36)'; intro = 'Acceptable. The marriage can work with effort; check the weak points below.'; }
    else if (t < 33) { cls = 'g'; txt = 'Good match (' + t + '/36)'; intro = 'A good match on most counts.'; }
    else { cls = 'g'; txt = 'Excellent match (' + t + '/36)'; intro = 'Very high guna score.'; }
    var warn = [];
    if (nd) warn.push('Nadi dosha is active (0/8)'); if (bk) warn.push('Bhakoot dosha is active (0/7)'); if (!mgOk) warn.push('Mangal dosha on only one side');
    if (warn.length && cls === 'g') { cls = 'm'; txt = txt.replace(/^(Good|Excellent) match/, 'Good score, with cautions'); }
    if (warn.length) intro += ' Watch: ' + warn.join('; ') + '.';
    return { c: cls, t: txt, intro: intro, warn: warn };
  }

  function remedies(M) {
    var o = [];
    if (M.nadi.dosha === 'active') o.push('Nadi dosha: Mahamrityunjaya mantra, 1.25 lakh jaap (can be split between family members or done by a priest) before the wedding; donate grains, a cow or gold as per capacity to a Brahmin on a Monday.');
    if (M.bhakoot.dosha === 'active') o.push('Bhakoot dosha: both worship the lords of their Moon signs (' + PN[J.RULER[M.B.sign]] + ' and ' + PN[J.RULER[M.G.sign]] + '); do a joint Shiva-Parvati puja (Uma-Maheshwar puja) before marriage.');
    var hiM = Math.max(M.mb.lvl, M.mg.lvl), loM = Math.min(M.mb.lvl, M.mg.lvl);
    if (hiM >= 2 && loM < 2) o.push('Mangal dosha on one side: the Manglik person does Kumbh vivah (girl) or Ark vivah (boy) before the wedding; both recite Hanuman Chalisa on Tuesdays and donate red masoor dal (250 g) on Tuesdays.');
    if (M.R[5].s <= 1) o.push('Gana mismatch: keep Monday fasts or do Gauri-Shankar puja together; agree on how decisions are made.');
    if (M.R[2].s === 0) o.push('Tara: chant your nakshatra lord\'s mantra (108 times on its weekday) for the first year after marriage.');
    if (!o.length) o.push('No special remedies needed. A Satyanarayan puja or Gauri-Shankar puja after the wedding is enough.');
    return o;
  }

  return { match: match, verdict: verdict, remedies: remedies, NADI: NADI, GANA: GANA, YONI: YONI };
})();

function MilanScreen() {
  var ppl = DB.people; if (ppl.length < 2) return topBar('Kundli Milan', { noPerson: true }) + emptyState('Add both kundlis', 'Matching needs the birth details of the boy and the girl.', '<br><button class="btn acc" data-go="edit/new">Add kundli</button>');
  if (!person(U.mBoy)) U.mBoy = (ppl.filter(function (p) { return p.gender === 'M'; })[0] || ppl[0]).id;
  if (!person(U.mGirl) || U.mGirl === U.mBoy) U.mGirl = (ppl.filter(function (p) { return p.gender === 'F' && p.id !== U.mBoy; })[0] || ppl.filter(function (p) { return p.id !== U.mBoy; })[0]).id;
  function sel(key, v) { return '<select class="msel" data-ch="milan" data-k="' + key + '">' + ppl.map(function (p) { return '<option value="' + p.id + '"' + (p.id === v ? ' selected' : '') + '>' + esc(p.name) + '</option>'; }).join('') + '</select>'; }
  var h = '<div class="top"><button class="ib" data-go="astro">' + icon('back') + '</button><span class="ttl">Kundli Milan</span><span class="sp"></span><button class="ib" data-act="shareMilan">' + icon('share') + '</button></div><div class="pad">';
  h += '<div class="card mpick"><div><label>Boy</label>' + sel('mBoy', U.mBoy) + '</div><span class="mx">♥</span><div><label>Girl</label>' + sel('mGirl', U.mGirl) + '</div></div>';
  if (U.mBoy === U.mGirl) return h + '<p class="note">Choose two different people.</p></div>';
  var M = MIL.match(person(U.mBoy), person(U.mGirl)), V = MIL.verdict(M), pct = Math.round(M.tot / 36 * 100), bn = nm(M.boy), gn = nm(M.girl);
  h += '<div class="ocard"><div class="olbl">' + esc(bn) + ' & ' + esc(gn) + '</div><div class="mscore"><div class="mring ' + V.c + '" style="--p:' + pct + '"><b>' + M.tot + '</b><small>of 36</small></div><div><div class="overd ' + V.c + '">' + esc(V.t.replace(/ \(.*\)$/, '')) + '</div><p class="op">' + esc(V.intro) + '</p></div></div></div>';
  h += '<div class="card"><div class="kgh"><h3>8 kootas</h3><span class="sm">' + esc(bn) + ' / ' + esc(gn) + '</span></div>' + M.R.map(function (r) {
    var q = r.s >= r.max * 0.75 ? 'g' : r.s === 0 ? 'b' : 'm', canc = r.dosha === 'cancelled';
    return '<div class="mk ' + (canc ? 'm' : q) + '"><div class="mkh"><b>' + r.n + '</b><span class="mkd">' + esc(r.d) + '</span><span class="mks">' + r.s + '<small>/' + r.max + '</small></span></div><div class="mbar"><i style="width:' + (r.s / r.max * 100) + '%"></i></div><small class="mkm">' + r.m + '</small><p>' + esc(q === 'g' ? r.g : r.b) + '</p></div>';
  }).join('') + '</div>';
  function md(x, name) { return '<div class="rs ' + (x.lvl >= 2 ? 'b' : x.lvl === 1 ? 'i' : 'g') + '"><h4>' + esc(name) + ': ' + esc(x.t) + '</h4>' + (x.why ? '<p>' + esc(x.why) + '</p>' : '') + '</div>'; }
  var hiB = M.mb.lvl >= 2, hiG = M.mg.lvl >= 2;
  h += '<div class="card rstory"><h3>Mangal dosha</h3>' + md(M.mb, bn) + md(M.mg, gn) + '<p class="note" style="margin-top:6px">' + (hiB === hiG ? (hiB ? 'Both are Manglik, so the dosha cancels out between them.' : 'No Mangal dosha problem in this match.') : 'Only one side is Manglik. Traditionally this needs remedies before marriage (see below), or a match with another Manglik.') + '</p></div>';
  function ol(o, name) { return '<div class="rs i"><h4>' + esc(name) + '</h4><p>' + esc((o.good.length ? 'Strengths: ' + o.good.join('; ') + '. ' : '') + (o.bad.length ? 'Be careful: ' + o.bad.join('; ') + '. ' : '') + o.tim) + '</p></div>'; }
  h += '<div class="card rstory"><h3>Marriage in each chart</h3>' + ol(M.ob, bn) + ol(M.og, gn) + '</div>';
  var tell = [];
  tell.push(M.tot + ' of 36 gunas match: ' + V.t.replace(/ \(.*\)$/, '').toLowerCase() + '.');
  M.R.filter(function (r) { return r.s >= r.max * 0.75; }).slice(0, 2).forEach(function (r) { tell.push('Strong point: ' + r.g); });
  M.R.filter(function (r) { return r.s < r.max * 0.5; }).sort(function (a, b) { return b.max - a.max; }).slice(0, 3).forEach(function (r) { tell.push('Be careful (' + r.n + '): ' + r.b); });
  if (hiB !== hiG) tell.push('Mangal dosha is on one side only: do the remedy before the wedding.');
  var rem = MIL.remedies(M);
  h += '<div class="card"><div class="olbl">Remedies</div><ol class="otell">' + rem.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol></div>';
  h += '<div class="card"><div class="olbl">What to tell the families</div><ol class="otell">' + tell.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol></div>';
  h += '<p class="note">Guna matching uses the Moon nakshatra and sign of both (Lahiri). It is one part of matching; the full charts, dashas and the people themselves matter more than the score.</p>';
  h += '<button class="btn sec wide" data-act="outAsk" data-q="' + esc('Kundli Milan of ' + M.boy.name + ' (boy) and ' + M.girl.name + ' (girl): ' + M.tot + '/36. ' + M.R.map(function (r) { return r.n + ' ' + r.s + '/' + r.max; }).join(', ') + '. Mangal: ' + bn + ' ' + M.mb.t + ', ' + gn + ' ' + M.mg.t + '. Explain this match in detail: strengths, problems to expect, and remedies.') + '">✦ Explain this match with AI</button></div>';
  U.milanTxt = 'Kundli Milan: ' + M.boy.name + ' & ' + M.girl.name + '\n' + V.t + '\n' + M.R.map(function (r) { return '• ' + r.n + ': ' + r.s + '/' + r.max; }).join('\n') + '\nMangal dosha: ' + bn + ' – ' + M.mb.t + '; ' + gn + ' – ' + M.mg.t + '\n\nKey points:\n' + tell.map(function (x, i) { return (i + 1) + '. ' + x; }).join('\n') + '\n\nRemedies:\n' + rem.map(function (x) { return '• ' + x; }).join('\n');
  return h;
}
CHG.milan = function (el) { U[el.dataset.k] = el.value; rerender(); };
ACT.shareMilan = function () { if (U.milanTxt) shareText('Kundli Milan', U.milanTxt + '\n\nCalculated with Trikaal (' + ayanShort() + ').'); };
