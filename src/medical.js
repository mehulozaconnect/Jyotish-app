/* Trikaal: health tendencies (medical astrology). Scores classical indicators for common conditions and gives
   prevention: what to avoid strictly, what to do, which tests to get, and when the risk is higher (dasha periods).
   These are astrological tendencies, never a diagnosis. */
var MED = (function () {
  var COND = [
    { id: 'bp', name: 'Blood pressure and heart', pl: { Su: 1, Ma: 1 }, houses: [4, 5], signs: [4],
      avoid: ['Excess salt, pickles, papad and packaged snacks', 'Fried and fast food; red meat in excess', 'Smoking and alcohol', 'Anger, overwork and skipping sleep'],
      dos: ['30 minutes of brisk walking daily', 'Anulom-vilom pranayama for 10 minutes', '7 hours of sleep', 'Keep weight in check'],
      tests: 'BP check every 3 months after age 30; lipid profile and ECG every year after 35.' },
    { id: 'sugar', name: 'Diabetes (blood sugar)', pl: { Ju: 1, Ve: 1 }, houses: [5, 6], signs: [6, 8],
      avoid: ['Sweets, sugary drinks and packaged juices', 'Large portions of white rice, maida and bakery items', 'Late-night heavy meals', 'Sitting for long hours without breaks'],
      dos: ['A 10–15 minute walk after each meal', 'Millets (jowar, bajra, ragi), dals and vegetables', 'Fixed meal times', 'Keep weight in check'],
      tests: 'Fasting sugar and HbA1c every year after age 30 (every 6 months if a parent has diabetes).' },
    { id: 'thyroid', name: 'Thyroid', pl: { Me: 1, Mo: 0.7 }, houses: [2], signs: [1],
      avoid: ['Long-term stress and irregular sleep', 'Skipping or changing thyroid medicine on your own (if prescribed)', 'Crash diets'],
      dos: ['Use iodised salt (unless your doctor says otherwise)', 'Regular sleep and yoga', 'Watch for tiredness, weight change, hair fall or feeling cold'],
      tests: 'TSH test every year, especially for women and after pregnancy; earlier if symptoms appear.' },
    { id: 'acid', name: 'Acidity and digestion', pl: { Ma: 1, Su: 0.7 }, houses: [6], signs: [5],
      avoid: ['Very spicy and oily food', 'Tea or coffee on an empty stomach', 'Eating late at night or skipping meals', 'Lying down right after eating'],
      dos: ['Regular meal times', 'Buttermilk and fennel (saunf) after meals', 'Smaller, lighter dinners'],
      tests: 'See a doctor if acidity or stomach pain lasts more than two weeks.' },
    { id: 'joints', name: 'Joints, bones and back', pl: { Sa: 1 }, houses: [10, 11], signs: [9],
      avoid: ['Sitting for long hours with poor posture', 'Lifting heavy weights the wrong way', 'Cold and damp exposure', 'Ignoring knee or back pain'],
      dos: ['Daily stretching or yoga', 'Calcium and vitamin D (sunlight, milk, sesame)', 'Warm sesame-oil massage on joints'],
      tests: 'Vitamin D and B12 every year after 35; bone density test after 50.' },
    { id: 'mind', name: 'Stress, anxiety and sleep', pl: { Mo: 1, Ra: 0.7 }, houses: [4, 12], signs: [3],
      avoid: ['Screens late at night', 'Caffeine after 4 pm and alcohol', 'Keeping worries to yourself', 'Irregular sleep times'],
      dos: ['Fixed sleep and wake times', '10 minutes of meditation or prayer daily', 'Time outdoors and talking to people you trust'],
      tests: 'See a doctor or counsellor if low mood, anxiety or poor sleep lasts more than two weeks.' },
    { id: 'kidney', name: 'Kidneys and urinary tract', pl: { Ve: 1 }, houses: [7], signs: [6],
      avoid: ['Drinking too little water', 'Excess salt and packaged food', 'Painkillers without a doctor\'s advice', 'Holding urine for long'],
      dos: ['2.5–3 litres of water a day', 'Coconut water and fresh fruit'],
      tests: 'Kidney function and urine routine test every year after 40 (earlier if BP or sugar is high).' },
    { id: 'eyes', name: 'Eyes', pl: { Su: 0.7, Mo: 0.5 }, houses: [2, 12], signs: [],
      avoid: ['Long screen time without breaks', 'Reading in dim light', 'Rubbing the eyes'],
      dos: ['The 20-20-20 rule: every 20 minutes, look 20 feet away for 20 seconds', 'Green leafy vegetables and carrots'],
      tests: 'Eye check-up every 2 years (every year after 40).' },
    { id: 'lungs', name: 'Breathing and allergies', pl: { Me: 1, Ra: 0.5 }, houses: [3], signs: [2],
      avoid: ['Smoking and second-hand smoke', 'Dust and polluted air without a mask', 'Very cold drinks if you are prone to cough'],
      dos: ['Steam inhalation when congested', 'Pranayama and deep breathing daily'],
      tests: 'See a doctor if cough or wheezing lasts more than three weeks.' },
    { id: 'liver', name: 'Liver, cholesterol and weight', pl: { Ju: 1, Ve: 0.5 }, houses: [5], signs: [8],
      avoid: ['Fried food and excess ghee or butter', 'Alcohol', 'Overeating and late dinners'],
      dos: ['Daily exercise', 'Fibre-rich food and seasonal fruit'],
      tests: 'Lipid profile and liver function test every year after 35.' }];
  var MAL = ['Sa', 'Ma', 'Ra', 'Ke'];
  function planetAff(k, code, why) {
    var p = k.P[code], s = 0;
    if (p.dignity === 'Debilitated') { s += 1.5; why.push(J.PNAME[code] + ' is debilitated'); }
    else if (p.dignity === 'Enemy sign') s += 0.6;
    else if (['Exalted', 'Own sign', 'Moolatrikona'].indexOf(p.dignity) >= 0) s -= 1;
    if (p.combust && code !== 'Su') { s += 1; why.push(J.PNAME[code] + ' is combust'); }
    if ([6, 8, 12].indexOf(p.house) >= 0) { s += 1; why.push(J.PNAME[code] + ' sits in the ' + p.house + 'th house'); }
    var with_ = k.planets.filter(function (x) { return x.code !== code && x.sign === p.sign && MAL.indexOf(x.code) >= 0; }).map(function (x) { return x.code; });
    if (with_.length) { s += with_.length; why.push(J.PNAME[code] + ' is joined by ' + with_.map(function (x) { return J.PNAME[x]; }).join(', ')); }
    var asp = k.planets.filter(function (x) { return MAL.indexOf(x.code) >= 0 && x.code !== code && x.sign !== p.sign && J.aspectedHouses(x.code, x.house).indexOf(p.house) >= 0; }).map(function (x) { return x.code; });
    if (asp.length) { s += 0.5 * asp.length; why.push(J.PNAME[code] + ' is aspected by ' + asp.map(function (x) { return J.PNAME[x]; }).join(', ')); }
    var ju = k.P.Ju; if (code !== 'Ju' && (ju.sign === p.sign || J.aspectedHouses('Ju', ju.house).indexOf(p.house) >= 0)) s -= 0.8;
    return s;
  }
  function houseAff(c, h, why) {
    var k = c.k, sign = (k.ascSign + h - 1) % 12, s = 0, occ = k.planets.filter(function (x) { return x.house === h && MAL.indexOf(x.code) >= 0; });
    if (occ.length) { s += occ.length; why.push(occ.map(function (x) { return J.PNAME[x.code]; }).join(', ') + ' in the ' + h + 'th house'); }
    var lord = J.lordOfHouse(k.ascSign, h); if ([6, 8, 12].indexOf(k.P[lord].house) >= 0 && h !== 6 && h !== 8 && h !== 12) { s += 0.7; why.push(h + 'th lord ' + J.PNAME[lord] + ' in the ' + k.P[lord].house + 'th'); }
    var sav = c.av.sav[sign]; if (sav < 25) { s += 0.7; why.push(h + 'th house has only ' + sav + ' Ashtakavarga points'); }
    if (J.aspectedHouses('Ju', k.P.Ju.house).indexOf(h) >= 0 || k.P.Ju.house === h) s -= 0.7;
    return s;
  }
  function analyze(c, now) {
    var k = c.k, YEAR = 365.25 * 864e5;
    var res = COND.map(function (cd) {
      var why = [], s = 0;
      Object.keys(cd.pl).forEach(function (code) { s += cd.pl[code] * planetAff(k, code, why); });
      cd.houses.forEach(function (h) { s += 0.7 * houseAff(c, h, why); });
      cd.signs.forEach(function (sg) { var m = k.planets.filter(function (x) { return x.sign === sg && MAL.indexOf(x.code) >= 0; }); if (m.length) { s += 0.6 * m.length; why.push(m.map(function (x) { return J.PNAME[x.code]; }).join(', ') + ' in ' + J.SIGNS[sg]); } });
      if (k.ascSign === cd.signs[0]) s += 0.3;
      var level = s >= 3.5 ? 'Higher' : s >= 2 ? 'Moderate' : 'Low';
      /* when: dasha periods of the planets involved, or of the 6th/8th lord if they connect */
      var lords = Object.keys(cd.pl), end = new Date(now.getTime() + 30 * YEAR), per = [];
      c.maha.forEach(function (m) { if (m.end < now || m.start > end) return; J.subPeriods(m).forEach(function (a) { if (a.end < now || a.start > end) return; var hit = lords.indexOf(a.lord) >= 0 && (lords.indexOf(m.lord) >= 0 || [6, 8, 12].indexOf(k.P[m.lord].house) >= 0 || MAL.indexOf(m.lord) >= 0); if (hit) per.push({ t: J.PNAME[m.lord] + '–' + J.PNAME[a.lord], s: a.start, e: a.end, age: Math.floor((a.start - c.birth) / YEAR) }); }); });
      return { id: cd.id, name: cd.name, score: Math.round(s * 10) / 10, level: level, why: uniq(why).slice(0, 5), avoid: cd.avoid, dos: cd.dos, tests: cd.tests, when: per.slice(0, 3) };
    });
    return res.sort(function (a, b) { return b.score - a.score; });
  }
  function uniq(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }
  return { analyze: analyze, COND: COND };
})();
if (typeof module !== 'undefined') module.exports = MED;
