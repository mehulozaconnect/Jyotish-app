/* Smoke test with a sample chart: every engine function must run and return sane values. */
const A = require('../vendor/astronomy.browser.min.js');
const C = require('../src/core.js')(A), J = require('../src/jyotish.js')(A, C), KB = require('../src/knowledge.js'), N = require('../src/analysis.js')(A, C, J, KB);
const assert = (c, m) => { if (!c) { console.error('FAIL', m); process.exit(1); } };
const p = { name: 'Rahul Shah', date: '1990-07-04', time: '14:15', tz: 5.5, lat: 28.6139, lon: 77.209, gender: 'M' };
const c = N.calc(p), now = new Date(Date.UTC(2026, 9, 22, 6));
assert(J.SIGNS[c.k.ascSign] === 'Libra', 'lagna Libra'); assert(c.k.planets.length === 9, 'nine bodies');
assert(c.av.sav.reduce((a, b) => a + b, 0) === 337, 'SAV total 337');
assert(N.report(c, now).length >= 8, 'report'); assert(N.healthAnalysis(c, now).zones.length === 12, 'health');
assert(N.transitMonth(c, 2026, 9, now).tr.length === 8, 'transit'); assert(N.eventAnalysis(c, 'accident', new Date(Date.UTC(2026, 6, 15, 6))).main, 'event');
assert(N.remedies(c, now).gems.length === 7, 'remedies'); assert(N.myDay(c, new Date(Date.UTC(2026, 9, 21, 18, 30)), 19.076, 72.8777, now).word, 'my day');
assert(Array.isArray(N.muhurat('vehicle', now, 30, 19.076, 72.8777, 5.5, c)), 'muhurat'); assert(J.horaryTable().length === 249, 'KP 249');
assert(J.varshphal(c.k, c.birth, 36, p.lat, p.lon).mudda.length === 9, 'varshphal');
for (const n of [2, 3, 4, 7, 9, 10, 12, 16, 20, 24, 27, 30, 40, 45, 60]) { const v = J.varga(c.k.asc, n); assert(v.sign >= 0 && v.sign < 12, 'varga D' + n); }
console.log('smoke OK ·', J.SIGNS[c.k.ascSign], c.k.ascDegs, '· Moon', J.SIGNS[c.k.P.Mo.sign], c.k.P.Mo.degs);
