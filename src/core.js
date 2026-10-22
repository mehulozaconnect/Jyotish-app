/* Trikaal core: sidereal astronomy for Jyotish.
   Planets from Astronomy Engine (apparent, true equinox of date). Sidereal longitude = tropical - (ayanamsa + nutation),
   which equals the mean-equinox longitude minus the mean ayanamsa: the same convention as Swiss Ephemeris / Jagannatha Hora.
   Depends on the global `Astronomy` (browser) or require('astronomy-engine') (node). */
function makeCore(A) {
  var RAD = Math.PI / 180, DEG = 180 / Math.PI, DAY = 864e5;
  function norm(x) { x = x % 360; return x < 0 ? x + 360 : x; }
  function T(date) { return A.MakeTime(date).tt / 36525; }

  /* ---------- nutation (cached per instant) ---------- */
  var tiltCache = { t: NaN, v: null };
  function tilt(date) {
    var ms = date.getTime();
    if (tiltCache.t !== ms) { tiltCache.t = ms; tiltCache.v = A.e_tilt(A.MakeTime(date)); }
    return tiltCache.v;
  }

  /* ---------- ayanamsa systems ---------- */
  /* Lahiri (Chitrapaksha) mean ayanamsa; matches Swiss Ephemeris SIDM_LAHIRI to 0.2" over 1930-2030.
     KP and Raman are fixed offsets from Lahiri in Swiss Ephemeris (-348.67" and -5206.68"). */
  function lahiriMean(date) { var t = T(date); return 23.85709 + 1.396971 * t + 0.000307 * t * t; }
  var AYAN_INFO = {
    lahiri: { name: 'N.C. Lahiri (Chitrapaksha)', short: 'Lahiri' },
    kp: { name: 'Krishnamurti (KP)', short: 'KP' },
    raman: { name: 'B.V. Raman', short: 'Raman' },
    truechitra: { name: 'True Chitrapaksha', short: 'True Chitra' }
  };
  /* Spica (Chitra), J2000, with proper motion (Hipparcos) */
  var SPICA = { ra: 201.29824736, dec: -11.16131949, pmra: -42.35, pmdec: -30.67 };
  function spicaApparentLon(date) {
    var yrs = (date.getTime() - Date.UTC(2000, 0, 1, 12)) / (365.25 * DAY);
    var dec = (SPICA.dec + SPICA.pmdec * yrs / 3600000) * RAD;
    var ra = (SPICA.ra + SPICA.pmra * yrs / 3600000 / Math.cos(dec)) * RAD;
    var v = new A.Vector(Math.cos(dec) * Math.cos(ra), Math.cos(dec) * Math.sin(ra), Math.sin(dec), A.MakeTime(date));
    var e = A.Ecliptic(v);
    var sun = A.SunPosition(date).elon;
    /* annual aberration in longitude */
    var ab = -20.49552 * Math.cos((sun - e.elon) * RAD) / Math.cos(e.elat * RAD) / 3600;
    return norm(e.elon + ab);
  }
  var mode = 'lahiri';
  function setAyanamsa(m) { if (AYAN_INFO[m]) mode = m; return mode; }
  function getAyanamsa() { return mode; }
  /* mean ayanamsa (what software reports) */
  function ayanamsa(date, m) {
    m = m || mode;
    if (m === 'kp') return lahiriMean(date) - 348.67 / 3600;
    if (m === 'raman') return lahiriMean(date) - 5206.68 / 3600;
    if (m === 'truechitra') return spicaApparentLon(date) - 180 - tilt(date).dpsi / 3600;
    return lahiriMean(date);
  }
  /* value subtracted from apparent (true-equinox) longitudes */
  function ayanTrue(date, m) { return ayanamsa(date, m) + tilt(date).dpsi / 3600; }

  /* ---------- planets ---------- */
  var BODIES = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke'];
  var ABODY = { Ma: 'Mars', Me: 'Mercury', Ju: 'Jupiter', Ve: 'Venus', Sa: 'Saturn' };
  var nodeMode = 'mean';
  function setNode(m) { nodeMode = m === 'true' ? 'true' : 'mean'; return nodeMode; }
  /* mean lunar node (Meeus 47.7), mean equinox of date */
  function meanNode(date) { var t = T(date); return norm(125.0445479 - 1934.1362891 * t + 0.0020754 * t * t + t * t * t / 467441 - t * t * t * t / 60616000); }
  /* true (osculating) node from the Moon's geocentric state vector, true ecliptic and equinox of date,
     returned as a mean-equinox longitude (nutation removed) like meanNode */
  function trueNode(date) {
    var st = A.GeoMoonState(date), rot = A.Rotation_EQJ_ECT(A.MakeTime(date));
    var s = A.RotateState(rot, st);
    var hx = s.y * s.vz - s.z * s.vy, hy = s.z * s.vx - s.x * s.vz;
    var node = Math.atan2(hx, -hy) * DEG;
    return norm(node - tilt(date).dpsi / 3600);
  }
  function tropical(code, date) {
    if (code === 'Su') return A.SunPosition(date).elon;
    if (code === 'Mo') return A.EclipticGeoMoon(date).lon;
    if (code === 'Ra' || code === 'Ke') {
      /* nodes are mean-equinox quantities: add nutation so the common subtraction below leaves them unaffected */
      var n = (nodeMode === 'true' ? trueNode(date) : meanNode(date)) + tilt(date).dpsi / 3600;
      return norm(code === 'Ra' ? n : n + 180);
    }
    return A.Ecliptic(A.GeoVector(ABODY[code], date, true)).elon;
  }
  function sidereal(code, date, m) { return norm(tropical(code, date) - ayanTrue(date, m)); }
  function speed(code, date) {
    if (code === 'Ra' || code === 'Ke') {
      if (nodeMode === 'mean') return -0.05295;
      var a0 = trueNode(new Date(date.getTime() - DAY / 2)), b0 = trueNode(new Date(date.getTime() + DAY / 2)), dd = b0 - a0; if (dd > 180) dd -= 360; if (dd < -180) dd += 360; return dd;
    }
    var a = tropical(code, new Date(date.getTime() - DAY / 2)), b = tropical(code, new Date(date.getTime() + DAY / 2));
    var d = b - a; if (d > 180) d -= 360; if (d < -180) d += 360; return d;
  }

  /* ---------- ascendant and houses ---------- */
  function ramcOf(date, lon) { return norm(A.SiderealTime(date) * 15 + lon); }
  function ascFromRAMC(ramcDeg, eps, phi) {
    var th = ramcDeg * RAD;
    return norm(Math.atan2(Math.cos(th), -(Math.sin(th) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps))) * DEG);
  }
  function lagna(date, lat, lon, m) {
    var eps = tilt(date).tobl * RAD;
    return norm(ascFromRAMC(ramcOf(date, lon), eps, lat * RAD) - ayanTrue(date, m));
  }
  /* Placidus cusps, sidereal; index 0 = house 1 */
  function placidus(date, lat, lon, m, ramcOverride) {
    var eps = tilt(date).tobl * RAD, phi = lat * RAD;
    var ramc = ramcOverride != null ? ramcOverride : ramcOf(date, lon);
    function lamFromRA(ra) { var r = ra * RAD; return norm(Math.atan2(Math.sin(r), Math.cos(r) * Math.cos(eps)) * DEG); }
    function ad(lam) { var d = Math.asin(Math.sin(eps) * Math.sin(lam * RAD)); var x = Math.tan(phi) * Math.tan(d); x = Math.max(-1, Math.min(1, x)); return Math.asin(x) * DEG; }
    function cusp(fn, guess) { var ra = guess; for (var i = 0; i < 60; i++) { var nra = norm(fn(ad(lamFromRA(ra)))); if (Math.abs(nra - ra) < 1e-9) break; ra = nra; } return lamFromRA(ra); }
    var mc = lamFromRA(ramc);
    var c11 = cusp(function (a) { return ramc + (90 + a) / 3; }, ramc + 30);
    var c12 = cusp(function (a) { return ramc + 2 * (90 + a) / 3; }, ramc + 60);
    var c2 = cusp(function (a) { return ramc + 180 - 2 * (90 - a) / 3; }, ramc + 120);
    var c3 = cusp(function (a) { return ramc + 180 - (90 - a) / 3; }, ramc + 150);
    var asc = ascFromRAMC(ramc, eps, phi);
    var trop = [asc, c2, c3, norm(mc + 180), norm(c11 + 180), norm(c12 + 180), norm(asc + 180), norm(c2 + 180), norm(c3 + 180), mc, c11, c12];
    var ay = ayanTrue(date, m);
    return trop.map(function (x) { return norm(x - ay); });
  }
  function ramcForAsc(ascSid, date, lat, m) {
    var eps = tilt(date).tobl * RAD, phi = lat * RAD, target = norm(ascSid + ayanTrue(date, m));
    function f(r) { var d = norm(ascFromRAMC(r, eps, phi) - target); return d > 180 ? d - 360 : d; }
    var prev = f(0), lo = 0, hi = 1;
    for (var r = 1; r <= 360; r++) { var v = f(r); if (prev < 0 && v >= 0 && v - prev < 180) { lo = r - 1; hi = r; break; } prev = v; }
    for (var k = 0; k < 60; k++) { var mid = (lo + hi) / 2; if (f(mid) < 0) lo = mid; else hi = mid; }
    return norm((lo + hi) / 2);
  }
  function bhavaOf(cusps, L) {
    for (var i = 0; i < 12; i++) { var a = cusps[i], b = cusps[(i + 1) % 12], span = norm(b - a); if (norm(L - a) < span) return i + 1; }
    return 1;
  }

  return { norm: norm, T: T, tilt: tilt, DAY: DAY, RAD: RAD, DEG: DEG, AYAN_INFO: AYAN_INFO, setAyanamsa: setAyanamsa, getAyanamsa: getAyanamsa, ayanamsa: ayanamsa, ayanTrue: ayanTrue,
    BODIES: BODIES, setNode: setNode, getNode: function () { return nodeMode; }, meanNode: meanNode, trueNode: trueNode, tropical: tropical, sidereal: sidereal, speed: speed,
    ramcOf: ramcOf, ascFromRAMC: ascFromRAMC, lagna: lagna, placidus: placidus, ramcForAsc: ramcForAsc, bhavaOf: bhavaOf, spicaApparentLon: spicaApparentLon };
}
if (typeof module !== 'undefined') module.exports = makeCore;
