/* Consistency test: every screen must give the same verdict for the same thing.
   Runs 150 random charts through the built app and fails on any contradiction.  node test/consistency.js */
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file://' + path.join(__dirname, '..', 'dist', 'index.html')); await pg.waitForTimeout(600);
  const R = await pg.evaluate(() => {
    let s = 777; function rnd() { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; }
    const now = new Date(), R = { charts: 0, checks: 0, fails: [], dist: { planet: {}, period: {}, day: {}, conf: {} } };
    const code = n => Object.keys(PN).filter(k => PN[k] === n)[0], bump = (o, k) => { o[k] = (o[k] || 0) + 1; };
    const chk = (ok, msg) => { R.checks++; if (!ok && R.fails.length < 25) R.fails.push(msg); if (!ok) R.nfail = (R.nfail || 0) + 1; };
    for (let i = 0; i < 150; i++) {
      const y = 1950 + Math.floor(rnd() * 65), m = 1 + Math.floor(rnd() * 12), d = 1 + Math.floor(rnd() * 28), hh = Math.floor(rnd() * 24), mm = Math.floor(rnd() * 60);
      const p = { id: 'r' + i, name: 'T' + i, date: y + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0'), time: String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0'), tz: 5.5, lat: 19.07, lon: 72.87, gender: 'M' }, tag = p.date + ' ' + p.time + ': ';
      const c = N.calc(p); c.p = p; R.charts++;
      const a = KA.analyze(c, now), jw = x => JUDGE.planet(c, x).word;
      J.PC.forEach(x => { bump(R.dist.planet, jw(x)); chk(BOOK.strength(c, x, bkSb).word === jw(x), tag + 'My planets vs judge: ' + x); });
      J.P7.forEach(x => chk(S.strength(c, x).word === jw(x), tag + 'Planets in detail vs judge: ' + x));
      a.snapshot.best.forEach(n => { if (code(n)) chk(jw(code(n)) === 'Strong', tag + 'Analysis "strongest" ' + n + ' is ' + jw(code(n))); });
      a.snapshot.weak.forEach(n => { if (code(n)) chk(jw(code(n)) === 'Weak', tag + 'Analysis "needs support" ' + n + ' is ' + jw(code(n))); });
      a.pros.forEach(x => { const mt = /^(\w+) is (exalted|moolatrikona|own sign)/.exec(x.t); if (mt && code(mt[1])) chk(jw(code(mt[1])) !== 'Weak', tag + 'strength listed for weak planet: ' + x.t); });
      a.cons.forEach(x => { const mt = /^(\w+) is (debilitated|combust)/.exec(x.t); if (mt && code(mt[1])) chk(jw(code(mt[1])) !== 'Strong', tag + 'weakness listed for strong planet: ' + x.t); });
      a.golden.forEach(g => { const [md, ad] = g.label.split(' – ').map(code), v = BOOK.adRead(c, md, ad, bkSb); chk(v.v === 'g', tag + 'golden period ' + g.label + ' is ' + v.word + ' on Dasha screen'); chk((g.rate === 'Golden') === (v.word === 'Very good'), tag + 'golden label mismatch ' + g.label + ' ' + g.rate + '/' + v.word); });
      (a.tough || []).forEach(g => { const [md, ad] = g.label.split(' – ').map(code); if (!md || !ad) return; const v = BOOK.adRead(c, md, ad, bkSb); chk(v.v === 'b', tag + 'difficult period ' + g.label + ' is ' + v.word + ' on Dasha screen'); });
      a.life.forEach(l => { const w = JUDGE.period(c, l.code).word, want = { 'Very good': 'Golden', 'Good': 'Good', 'Mixed': 'Mixed', 'Careful': 'Testing' }[w]; chk(l.rate === want, tag + 'life map ' + l.code + ' ' + l.rate + ' vs ' + w); });
      J.PC.forEach(x => J.PC.forEach(z => bump(R.dist.period, JUDGE.period(c, x, z).word)));
      if (i < 60) for (let dd = 0; dd < 30; dd++) {
        const d0 = todayStart(dd), D = N.myDay(c, d0, 19.07, 72.87, new Date(d0.getTime() + 10 * 3600e3)), jd = D.score.j, ar = JUDGE.areas(c, jd, D.tr);
        bump(R.dist.day, jd.word); bump(R.dist.conf, jd.conf.level);
        chk(D.word === jd.word, tag + 'day word mismatch'); const g = ar.filter(x => x.k === 'g').length, bd = ar.filter(x => x.k === 'b').length;
        chk(!(jd.pct >= 68 && bd >= 3), tag + 'strong day with 3+ careful areas (day ' + dd + ')'); chk(!(jd.pct < 33 && g >= 3), tag + 'go-slow day with 3+ good areas (day ' + dd + ')');
        chk(jd.factors.length >= 8, tag + 'day judged on fewer than 8 factors');
      }
    }
    return R;
  });
  console.log(JSON.stringify(R.dist)); console.log('charts ' + R.charts + ', checks ' + R.checks + ', contradictions ' + (R.nfail || 0)); if (R.fails.length) console.log(R.fails.join('\n')); if (errs.length) console.log(errs.slice(0, 3));
  await b.close(); process.exit(R.nfail || errs.length ? 1 : 0);
})();
