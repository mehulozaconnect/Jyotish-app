/* North and South Indian chart renderers (SVG strings) */
var Charts = (function () {
  /* house: [textX, textY, kind, signX, signY]; kind d = kendra rhombus, t = top/bottom triangle, s = side triangle */
  var KH = { 1: [200, 88, 'd', 200, 182], 2: [100, 34, 't', 100, 88], 3: [36, 100, 's', 84, 104], 4: [100, 196, 'd', 182, 204], 5: [36, 300, 's', 84, 304], 6: [100, 366, 't', 100, 318],
    7: [200, 304, 'd', 200, 226], 8: [300, 366, 't', 300, 318], 9: [364, 300, 's', 316, 304], 10: [300, 196, 'd', 220, 204], 11: [364, 100, 's', 316, 104], 12: [300, 34, 't', 300, 88] };
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function itemText(r, fs) {
    var s = '<tspan class="pc">' + esc(r.code) + '</tspan>';
    if (r.deg) s += ' <tspan class="pd" style="font-size:' + (fs - 1.5) + 'px">' + esc(r.deg) + '</tspan>';
    if (r.mark) s += '<tspan class="pd" style="font-size:' + (fs - 2) + 'px">' + r.mark + '</tspan>';
    if (r.r) s += '<tspan class="rr" style="font-size:' + (fs - 3.5) + 'px" dy="-4">R</tspan>';
    return s;
  }
  /* rows: [{h, code, deg, cls, r, mark}], signs: array[12] of sign index (0-11) for houses 1..12 */
  function north(rows, signs, opts) {
    opts = opts || {};
    var byH = {}; rows.forEach(function (r) { (byH[r.h] = byH[r.h] || []).push(r); });
    var s = '<svg class="kchart" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"><rect class="frame" x="1" y="1" width="398" height="398" rx="6"/><path class="ln" d="M1 1L399 399M399 1L1 399M200 1L399 200L200 399L1 200Z"/>';
    for (var h = 1; h <= 12; h++) {
      var g = KH[h];
      s += '<text class="sn" x="' + g[3] + '" y="' + g[4] + '" text-anchor="middle">' + (signs[h - 1] + 1) + '</text>';
      if (opts.nums) { var v = opts.nums[h - 1]; s += '<text class="num ' + (opts.numCls ? opts.numCls(v) : '') + '" x="' + g[0] + '" y="' + (g[1] + (g[2] === 't' ? (h === 2 || h === 12 ? 14 : -6) : 7)) + '" text-anchor="middle">' + v + '</text>'; continue; }
      var list = byH[h] || [], n = list.length; if (!n) continue;
      var kind = g[2], cols = 1, fs = 12.5, lh = kind === 'd' ? 16 : 14.5;
      if (n >= 5) { fs = 11; lh = 13; }
      if (n >= 7) { fs = 10; lh = 11.5; }
      if (kind === 'd' && n >= 5) { cols = 2; fs = 11.5; lh = 15; }
      var rowsN = Math.ceil(n / cols), x0 = g[0], y0;
      if (kind === 't') { var dir = (h === 2 || h === 12) ? 1 : -1; var base = (h === 2 || h === 12) ? 17 : 389; y0 = dir > 0 ? base : base - (rowsN - 1) * lh; if (n === 1) y0 = (h === 2 || h === 12) ? 34 : 372; if (n === 2 && dir > 0) y0 = 24; if (n === 2 && dir < 0) y0 = 362; }
      else y0 = g[1] - (rowsN - 1) * lh / 2 + fs * 0.36;
      if (kind === 's' && n >= 5) { x0 = h === 3 || h === 5 ? 30 : 370; }
      list.forEach(function (r, i) {
        var col = cols === 2 ? i % 2 : 0, row = cols === 2 ? Math.floor(i / 2) : i;
        var x = cols === 2 ? x0 + (col === 0 ? -34 : 34) : x0;
        s += '<text x="' + x + '" y="' + (y0 + row * lh).toFixed(1) + '" text-anchor="middle" class="kp ' + (r.cls || '') + '" style="font-size:' + fs + 'px">' + itemText(r, fs) + '</text>';
      });
    }
    if (opts.center) s += '<text x="200" y="206" text-anchor="middle" style="font:600 10px var(--sans);fill:#B4B0BB;letter-spacing:.1em">' + esc(opts.center) + '</text>';
    return s + '</svg>';
  }
  var SPOS = [[1, 0], [2, 0], [3, 0], [3, 1], [3, 2], [3, 3], [2, 3], [1, 3], [0, 3], [0, 2], [0, 1], [0, 0]];
  var SG3 = ['Ari', 'Tau', 'Gem', 'Can', 'Leo', 'Vir', 'Lib', 'Sco', 'Sag', 'Cap', 'Aqu', 'Pis'];
  /* items: [{s: sign, code, deg, cls, r}] */
  function south(items, ascSign, title, opts) {
    opts = opts || {};
    var C = 100, s = '<svg class="kchart sc" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="398" height="398" rx="6" fill="#fff" stroke="#8E8A96" stroke-width="1.5"/>';
    for (var sg = 0; sg < 12; sg++) {
      var p = SPOS[sg], x = p[0] * C, y = p[1] * C;
      s += '<rect class="cell" x="' + x + '" y="' + y + '" width="' + C + '" height="' + C + '"/><text class="sgn" x="' + (x + 6) + '" y="' + (y + 14) + '">' + SG3[sg] + '</text>';
      if (sg === ascSign) s += '<path d="M' + (x + C - 24) + ' ' + y + 'L' + (x + C) + ' ' + (y + 24) + '" stroke="#B94E1A" stroke-width="2"/>';
      if (opts.nums) { s += '<text class="num ' + (opts.numCls ? opts.numCls(opts.nums[sg]) : '') + '" x="' + (x + 50) + '" y="' + (y + 62) + '" text-anchor="middle">' + opts.nums[sg] + '</text>'; continue; }
      var list = items.filter(function (it) { return it.s === sg; }), n = list.length, fs = n > 5 ? 10 : n > 4 ? 11 : 12, lh = n > 5 ? 12 : n > 4 ? 13.5 : 15.5;
      list.forEach(function (it, i) { s += '<text class="t ' + (it.cls || '') + '" x="' + (x + 50) + '" y="' + (y + 32 + i * lh) + '" text-anchor="middle" style="font-size:' + fs + 'px">' + esc(it.code) + ' ' + esc(it.deg || '') + (it.mark || '') + (it.r ? '<tspan class="rr" style="fill:#AE3A2F;font-size:8px" dy="-4">R</tspan>' : '') + '</text>'; });
    }
    s += '<text x="200" y="196" text-anchor="middle" style="font:500 21px Fraunces,Georgia,serif;fill:#1B1A22">' + esc(title || '') + '</text><text x="200" y="218" text-anchor="middle" style="font:500 11.5px Inter,sans-serif;fill:#8E8A96">' + esc(opts.subtitle || 'South Indian') + '</text>';
    return s + '</svg>';
  }
  return { north: north, south: south };
})();
