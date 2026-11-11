/* Trikaal 4.0: the accuracy core wired into every screen. One judge for planets, periods and days. */
var JUDGE = makeJudge(J, KB, N, BOOK);
JUDGE.setSb(function (c) { return sbOf(c); });
var JUDGE_HOOK = JUDGE;
BOOK.ext.strength = function (c, code) { var p = JUDGE.planet(c, code); return { code: code, score: p.pct, word: p.word, k: p.k, why: p.why.map(function (w) { return w.charAt(0).toLowerCase() + w.slice(1); }), conf: p.conf, factors: p.factors }; };
BOOK.ext.adRead = function (c, md, ad) { var r = JUDGE.period(c, md, ad); return { v: r.v, word: r.word, why: r.why, pct: r.pct, conf: r.conf, factors: r.factors }; };
