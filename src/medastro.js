/* Trikaal Medical Astrology engine (Parashari, Lahiri).
   Method: three layers (sign = where, house = which area of the chart, planet = what kind of force); a finding needs agreement.
   Health starts from Lagna strength, then Sun and Moon; timing from Vimshottari dasha first, transits second; remedies by mode
   (strengthen / maintain / pacify) chosen from the planet's role for the Lagna, never from weakness alone.
   All wording is original to Trikaal. Supportive guidance only: a doctor diagnoses and treats. */
function makeMedAstro(J, C, KB) {
  var P9 = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke'], P7 = P9.slice(0, 7);
  var PN = { Su: 'Sun', Mo: 'Moon', Ma: 'Mars', Me: 'Mercury', Ju: 'Jupiter', Ve: 'Venus', Sa: 'Saturn', Ra: 'Rahu', Ke: 'Ketu' };
  var HN = { Su: 'Surya', Mo: 'Chandra', Ma: 'Mangal', Me: 'Budh', Ju: 'Guru', Ve: 'Shukra', Sa: 'Shani', Ra: 'Rahu', Ke: 'Ketu' };
  var SG = J.SIGNS, MAL = ['Sa', 'Ma', 'Ra', 'Ke'], DAY = 864e5;
  function nth(n) { var s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }
  function norm(x) { return ((x % 360) + 360) % 360; }
  function hf(a, b) { return J.houseFrom(a, b); }
  function dmy(d) { return d.getDate() + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()] + ' ' + d.getFullYear(); }
  function uniq(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }

  /* ---------------- knowledge (Trikaal's own wording) ---------------- */
  var SIGN_DOSHA = ['Pitta', 'Kapha', 'Vata', 'Kapha', 'Pitta', 'Vata', 'Vata', 'Kapha', 'Pitta', 'Vata', 'Vata', 'Kapha'];
  var PL_DOSHA = { Su: ['Pitta'], Mo: ['Vata', 'Kapha'], Ma: ['Pitta'], Me: ['Vata', 'Pitta', 'Kapha'], Ju: ['Kapha'], Ve: ['Vata', 'Kapha'], Sa: ['Vata'], Ra: ['Vata'], Ke: ['Pitta'] };
  var DOSHA = {
    Vata: { what: 'movement: breath, nerves, circulation, bowel', excess: 'dryness, gas, cracking joints, worry, light sleep, constipation', care: 'warm cooked food, oil massage, fixed sleep time, no skipped meals, gentle routine' },
    Pitta: { what: 'heat and digestion: metabolism, body heat, eyes, skin', excess: 'acidity, rashes, fevers, inflammation, anger, burning eyes', care: 'cooling food (buttermilk, coconut water, cucumber), avoid very spicy and fried food, no midday sun, calm down before eating' },
    Kapha: { what: 'structure and fluids: tissue, fat, immunity, lubrication', excess: 'weight gain, congestion, cough and cold, sluggishness, water retention', care: 'light warm food, less dairy, sugar and fried food, daily brisk exercise, early dinner, no day sleep' }
  };
  /* Kalapurusha: sign -> body region */
  var SIGN_BODY = ['head, brain, face', 'face, mouth, throat, neck, thyroid', 'shoulders, arms, hands, upper lungs, breath', 'chest, breasts, stomach, body fluids', 'heart, upper back, spine', 'intestines, digestion, nervous gut', 'kidneys, lower back, bladder region', 'genitals, bladder, rectum, pelvic floor', 'hips, thighs, sciatic nerve, liver region', 'knees, joints, bones, teeth, skin', 'calves, ankles, leg circulation', 'feet, lymph, sleep'];
  var HOUSE_BODY = ['head and the whole body (vitality)', 'face, mouth, teeth, right eye', 'throat, neck, shoulders, arms, right ear', 'chest, heart, lungs, breasts', 'stomach, upper abdomen, liver area', 'intestines, navel, acute illness', 'lower abdomen, kidneys, pelvis', 'genitals, excretory organs, chronic issues, surgery', 'hips and thighs', 'knees and joints', 'calves, ankles, left ear', 'feet, left eye, sleep, hospital'];
  /* Body areas: signs (0-11), houses, karakas */
  var AREAS = [
    { id: 'head', n: 'Head and brain', s: [0], h: [1], k: ['Su', 'Ma'], care: 'Eat on time, keep cool in summer, wear a helmet, sleep enough.', alert: 'Worst-ever headache, headache with fever and stiff neck, or head injury with vomiting: go to hospital.' },
    { id: 'eyes', n: 'Eyes', s: [0, 1], h: [2, 12], k: ['Su', 'Mo'], care: 'Screen breaks every hour, good light, yearly eye check.', alert: 'Sudden loss of vision or severe eye pain: emergency.' },
    { id: 'throat', n: 'Throat, neck and thyroid', s: [1], h: [2, 3], k: ['Ve', 'Me'], care: 'Warm water, rest the voice, good neck posture; thyroid test if tired and gaining weight.', alert: 'Neck lump, trouble swallowing, hoarse voice for over 3 weeks: see a doctor.' },
    { id: 'lungs', n: 'Lungs and breathing', s: [2, 3], h: [3, 4], k: ['Me', 'Mo'], care: 'Daily slow breathing (Nadi Shodhana), avoid smoke and dust, stretch shoulders.', alert: 'Wheezing that does not settle, coughing blood, chest pain on breathing: see a doctor today.' },
    { id: 'heart', n: 'Heart and blood pressure', s: [4, 3], h: [4, 5], k: ['Su'], care: 'Brisk walking 30 minutes, less salt, BP and lipid checks yearly after 35, real rest after big efforts.', alert: 'Chest pain or pressure spreading to arm, jaw or back, fainting, breathlessness at rest: emergency.' },
    { id: 'stomach', n: 'Stomach and acidity', s: [3, 4], h: [5], k: ['Mo', 'Su'], care: 'Eat calmly and on time, no meals while upset, less spice and tea on an empty stomach.', alert: 'Vomiting blood, black stools, severe upper abdominal pain: emergency.' },
    { id: 'liver', n: 'Liver, weight and blood sugar', s: [8], h: [5, 9], k: ['Ju', 'Ve'], care: 'Walk after meals, keep sweets and fried food occasional, early dinner; sugar and lipid tests yearly after 30.', alert: 'Yellow eyes or skin, extreme thirst with frequent urination, weight loss without trying: see a doctor.' },
    { id: 'gut', n: 'Intestines and digestion', s: [5], h: [6], k: ['Me', 'Ke'], care: 'Fixed meal times, chew slowly, fibre and curd if they suit, short relaxation before meals.', alert: 'Blood in stool, bowel change for more than 3 weeks, severe abdominal pain: see a doctor.' },
    { id: 'kidney', n: 'Kidneys and urinary tract', s: [6, 7], h: [7], k: ['Ve'], care: 'Drink water steadily through the day, moderate salt and sugar, do not hold urine.', alert: 'Blood in urine, severe side pain, fever with burning urine: see a doctor today.' },
    { id: 'repro', n: 'Hormones and reproductive health', s: [7, 6], h: [7, 8], k: ['Ve', 'Ma', 'Mo'], care: 'Regular sleep, healthy weight, limit refined sugar, regular check-ups.', alert: 'Periods absent for 3 months, abnormal bleeding, a lump, or no conception after 12 months of trying: see a specialist.' },
    { id: 'excretion', n: 'Piles, colon and constipation', s: [7], h: [8], k: ['Ma', 'Sa'], care: 'High fibre, enough water, daily movement, do not delay the bowel urge.', alert: 'Bleeding from the rectum or pelvic pain with fever: see a doctor.' },
    { id: 'hips', n: 'Hips, thighs and sciatica', s: [8], h: [9], k: ['Ju'], care: 'Stretch hips and hamstrings daily, warm up before sport.', alert: 'Pain down the leg with weakness or loss of bladder control: emergency.' },
    { id: 'joints', n: 'Knees, joints, bones and teeth', s: [9], h: [10], k: ['Sa'], care: 'Strengthen thigh muscles, keep weight in range, keep joints warm, dental check twice a year, vitamin D and calcium as the doctor advises.', alert: 'Hot, red, swollen joint, knee locking, bone pain at night: see a doctor.' },
    { id: 'legs', n: 'Calves, veins and circulation', s: [10], h: [11], k: ['Sa'], care: 'Move every hour at a desk, raise legs in the evening, supportive footwear.', alert: 'Painful, swollen, warm calf (possible clot): emergency.' },
    { id: 'feet', n: 'Feet and sleep', s: [11], h: [12], k: ['Mo', 'Ju'], care: 'Well-fitting footwear, keep feet dry, fixed bedtime and calm routine.', alert: 'A foot wound that does not heal (especially with diabetes) or insomnia affecting daily life: see a doctor.' },
    { id: 'mind', n: 'Mind, stress and sleep', s: [3], h: [4, 5, 12], k: ['Mo', 'Me'], care: 'Same sleep time daily, screens off an hour before bed, talk to trusted people, daily walk.', alert: 'Low mood or anxiety for over 2 weeks: see a doctor or counsellor. Thoughts of self-harm: Tele-MANAS 14416 (free, 24x7) or emergency.' },
    { id: 'blood', n: 'Blood, haemoglobin and fevers', s: [0, 7], h: [1, 8], k: ['Ma'], care: 'Iron-rich food (greens, beetroot, pomegranate), check haemoglobin yearly, cooling drinks in heat.', alert: 'Bleeding that will not stop, high fever with confusion or rash: emergency.' },
    { id: 'nerves', n: 'Nerves and skin', s: [2, 5], h: [3, 6], k: ['Me'], care: 'Screen-free time daily, slow breathing, moisturise, a dermatologist for rashes that stay.', alert: 'Sudden numbness or weakness on one side, slurred speech (stroke signs): emergency.' },
    { id: 'allergy', n: 'Allergies and sensitivities', s: [], h: [6, 8], k: ['Ra'], care: 'Keep a food and product diary, avoid self-medication, fresh home-cooked food, less alcohol and tobacco.', alert: 'Swelling of face, lips or tongue or trouble breathing after food or medicine: emergency.' },
    { id: 'infection', n: 'Infections and surgery', s: [], h: [6, 8], k: ['Ke', 'Ma'], care: 'Clean water and fresh food, hand-washing, vaccinations up to date, finish every course of medicine.', alert: 'Wound that is red, hot and swelling, or fever with severe headache and stiff neck: see a doctor today.' }
  ];
  /* planets: body rule, too much / too little, care, doctor alert, remedies */
  var PL = {
    Su: { rules: 'heart, bones, spine, right eye, digestive fire, vitality', more: 'fevers, acidity, high BP, headaches, burning eyes, irritability', less: 'fatigue, weak appetite, low BP, cold hands, slow recovery', care: 'Morning sunlight 10–15 minutes, fixed wake-up time, main meal at midday, daily walk; do not work through exhaustion.', alert: 'Chest pain, fainting, racing heartbeat, sudden loss of sight in one eye.',
      grain: 'wheat', foods: 'whole-wheat roti, a little jaggery, ginger, saffron, oranges', caution: 'With acidity or high BP, cut heating spices.', taste: 'pungent', mantra: 'om hrām hrīm hraum saḥ sūryāya namaḥ', count: 7000, daan: 'wheat, jaggery, a copper vessel, red or saffron cloth', day: 'Sunday', seva: 'help your father or elders; mentor a young person', colour: 'saffron, orange', dir: 'East', yoga: 'Surya Namaskar, slowly, 3–6 rounds', yogaAvoid: 'uncontrolled BP, hernia, back injury, pregnancy', mudra: 'Prana mudra', aff: 'I listen to my energy and rest when I need to.', gem: 'Ruby (Manik)', upa: 'Red garnet', finger: 'ring', metal: 'gold or copper', wear: 'Sunday morning' },
    Mo: { rules: 'mind, sleep, body fluids, chest, stomach, left eye, monthly cycle', more: 'congestion, water retention, weight gain, emotional eating', less: 'anxiety, poor sleep, dry skin, irregular appetite', care: 'Same bedtime daily, enough water, warm simple dinner, time near water or greenery, talk to people you trust.', alert: 'Low mood over 2 weeks, thoughts of self-harm (Tele-MANAS 14416), leg swelling with breathlessness, periods missing 3 months.',
      grain: 'rice', foods: 'rice, milk and curd if they suit, coconut water, cucumber, melons', caution: 'With congestion or weight gain, lighten dairy.', taste: 'salty', mantra: 'om śrām śrīm śraum saḥ candrāya namaḥ', count: 11000, daan: 'rice, milk, white cloth, water for the thirsty', day: 'Monday', seva: 'care for your mother; help at a women\'s shelter', colour: 'white, silver', dir: 'North-West', yoga: 'Balasana (child pose) and left-nostril breathing', yogaAvoid: 'low BP (for the breathing), knee injury (for the pose)', mudra: 'Varun mudra', aff: 'My mind can stay calm while life is busy.', gem: 'Pearl (Moti)', upa: 'Moonstone', finger: 'little', metal: 'silver', wear: 'Monday morning' },
    Ma: { rules: 'muscles, blood and marrow, inflammation, wounds, surgery, head injuries', more: 'fevers, boils, rashes, high BP, injuries, anger', less: 'low haemoglobin, weak muscles, poor resistance to infection', care: 'Regular exercise, cooling drinks in summer, patience in arguments, care with fire, tools and fast vehicles.', alert: 'High fever with stiff neck, bleeding that will not stop, deep cuts or burns, sudden severe abdominal pain.',
      grain: 'toor dal', foods: 'toor dal, pomegranate, beetroot, leafy greens, bitter gourd', caution: 'With inflammation, avoid very spicy and fried food.', taste: 'bitter', mantra: 'om krām krīm kraum saḥ bhaumāya namaḥ', count: 10000, daan: 'masoor dal, jaggery, red cloth', day: 'Tuesday', seva: 'blood donation if medically fit; disaster relief work', colour: 'red, coral', dir: 'South', yoga: 'Virabhadrasana II (Warrior II)', yogaAvoid: 'knee injury; keep arms low with high BP', mudra: 'Prana mudra', aff: 'I use my strength with patience.', gem: 'Red coral (Moonga)', upa: 'Carnelian', finger: 'ring', metal: 'gold or copper', wear: 'Tuesday morning' },
    Me: { rules: 'nerves, skin, speech, breathing passages, hands, intestines', more: 'anxiety, insomnia, tremor, itchy dry skin, gas and bloating', less: 'poor concentration, slow speech, dull skin, forgetfulness', care: 'Screen-free time daily, slow breathing 5 minutes twice a day, regular meals, write thoughts down before bed.', alert: 'Sudden numbness or weakness on one side or slurred speech, swelling of lips or tongue, a seizure.',
      grain: 'moong', foods: 'moong dal, green vegetables, sprouts, fennel, amla', caution: 'With a nervous stomach, keep meals regular and simple.', taste: 'mixed', mantra: 'om brām brīm braum saḥ budhāya namaḥ', count: 9000, daan: 'moong dal, green vegetables, books, stationery', day: 'Wednesday', seva: 'teach or tutor; support a student\'s fees', colour: 'green', dir: 'North', yoga: 'Nadi Shodhana and Vrikshasana (tree pose)', yogaAvoid: 'vertigo: use a wall for the tree pose', mudra: 'Gyan mudra', aff: 'I think clearly and speak kindly, also to myself.', gem: 'Emerald (Panna)', upa: 'Peridot', finger: 'little', metal: 'gold', wear: 'Wednesday morning' },
    Ju: { rules: 'liver, fat, blood sugar, hips and thighs, arteries, hearing', more: 'weight gain, fatty liver, high cholesterol, diabetes tendency, lethargy', less: 'poor nourishment, slow recovery, low immunity, loss of hope', care: 'Walk daily, sweets and fried food only occasionally, early dinner, keep learning; sugar and lipid tests yearly after 30.', alert: 'Yellow eyes or skin, extreme thirst and urination, any new lump, upper-right abdominal pain with fever.',
      grain: 'chana', foods: 'chana dal, turmeric, walnuts, a little ghee, a banana in moderation', caution: 'With diabetes or fatty liver, limit sweets and ghee.', taste: 'sweet', mantra: 'om grām grīm graum saḥ gurave namaḥ', count: 19000, daan: 'chana dal, turmeric, yellow cloth, books', day: 'Thursday', seva: 'serve teachers, a temple or a library', colour: 'yellow', dir: 'North-East', yoga: 'Ardha Matsyendrasana (seated twist)', yogaAvoid: 'pregnancy, spinal disc problems, recent abdominal surgery', mudra: 'Gyan mudra', aff: 'I choose what truly nourishes me.', gem: 'Yellow sapphire (Pukhraj)', upa: 'Yellow topaz', finger: 'index', metal: 'gold', wear: 'Thursday morning' },
    Ve: { rules: 'kidneys, urinary tract, hormones, reproduction, skin glow, throat', more: 'weight gain, high sugar, laziness, fluid retention', less: 'urinary infections, hormonal imbalance, dull skin, fertility concerns', care: 'Enough water, moderate sugar, good hygiene, a clean pleasant home, time for music, art or gardening.', alert: 'Blood in urine, fever with burning urine, periods missing 3 months, no conception after 12 months of trying.',
      grain: 'white beans (rajma, lobia)', foods: 'rajma or lobia, curd, seasonal fruit, rose, cardamom', caution: 'With kidney problems, follow the doctor on protein and salt.', taste: 'sour', mantra: 'om drām drīm draum saḥ śukrāya namaḥ', count: 16000, daan: 'rice, curd, white cloth, cosmetics for women in need', day: 'Friday', seva: 'support girls\' education; beautify a public space', colour: 'white, pastel pink', dir: 'South-East', yoga: 'Baddha Konasana (butterfly)', yogaAvoid: 'knee or groin injury', mudra: 'Varun mudra', aff: 'I care for my body with balance, not excess.', gem: 'Diamond (Heera)', upa: 'White sapphire', finger: 'middle or ring', metal: 'silver or platinum', wear: 'Friday morning' },
    Sa: { rules: 'bones, joints, knees, teeth, hair, colon, chronic nerve pain, ageing', more: 'dry joints, constipation, poor sleep, anxiety, chronic pain', less: 'irregular routine, weak bones and teeth over time', care: 'Fixed daily routine, morning stretching or yoga, warm joints in winter, warm water, time with elderly people.', alert: 'Swollen red joint with fever, bone pain that wakes you, sudden inability to pass stool with vomiting, loss of feeling in the legs.',
      grain: 'black sesame', foods: 'black sesame, whole grains, fibre-rich vegetables, warm soups', caution: 'With constipation, more water, fibre and movement.', taste: 'astringent', mantra: 'om prām prīm praum saḥ śanaiścarāya namaḥ', count: 23000, daan: 'black sesame, mustard oil, black blanket, footwear', day: 'Saturday', seva: 'serve the elderly, labourers or disabled people', colour: 'dark blue, black', dir: 'West', yoga: 'Tadasana and the Pawanmuktasana joint series', yogaAvoid: 'acutely swollen joints', mudra: 'Prithvi mudra', aff: 'Steady effort heals me day by day.', gem: 'Blue sapphire (Neelam)', upa: 'Amethyst', finger: 'middle', metal: 'silver or panchdhatu', wear: 'Saturday evening' },
    Ra: { rules: 'allergies, toxins, addictions, anxiety, symptoms that are hard to name', more: 'allergies, hives, cravings, anxiety, poisoning risk, unclear symptoms', less: '(used well: adapts, benefits from modern treatment)', care: 'Fresh home food, less alcohol, tobacco and late screens, a clean uncluttered home, daily walks outdoors, a symptom diary.', alert: 'Swelling of face or lips or breathing trouble after food or medicine, dependence on a substance, panic with chest pain (heart must be checked).',
      grain: 'urad', foods: 'urad dal, fresh home-cooked meals, no processed food', caution: 'With allergies, keep a food diary.', taste: '', mantra: 'om bhrām bhrīm bhraum saḥ rāhave namaḥ', count: 18000, daan: 'urad dal, blankets, food packets', day: 'Saturday', seva: 'support de-addiction or homeless programmes', colour: 'smoky grey', dir: 'South-West', yoga: 'Bhramari (humming-bee breath)', yogaAvoid: 'active ear infection', mudra: '', aff: 'I notice my cravings and fears without obeying them.', gem: 'Hessonite (Gomed)', upa: '', finger: 'middle', metal: 'silver', wear: 'Saturday evening' },
    Ke: { rules: 'infections, sudden pain, wounds and surgery, worms, numbness, hidden conditions', more: 'infections, sudden sharp pain, wounds, surgery, worms', less: '(used well: high pain tolerance, heals through rest)', care: 'Fresh food and clean water, hand-washing, warm feet, quiet meditation, finish every treatment once started.', alert: 'Fever with stiff neck or confusion, a wound that is hot and swelling, blood or worms in stool, new numbness that stays.',
      grain: 'kulthi (horse gram)', foods: 'horse gram soup, fresh food, clean water', caution: 'With kidney stones, ask the doctor before horse gram.', taste: '', mantra: 'om srām srīm sraum saḥ ketave namaḥ', count: 17000, daan: 'multi-coloured blanket, sesame, food for stray dogs', day: 'Tuesday', seva: 'help at an animal shelter or a hospice', colour: 'brown, multi-colour', dir: '', yoga: 'Yoga Nidra or Shavasana, 15 minutes', yogaAvoid: 'sit up if you feel dizzy lying flat', mudra: '', aff: 'I stay present in my body and listen to it.', gem: "Cat's eye (Lahsuniya)", upa: "Tiger's eye", finger: 'middle or little', metal: 'silver', wear: 'Tuesday or Thursday' }
  };
  var MD_HEALTH = {
    Ke: ['infections, sudden procedures, unclear symptoms', 'healing through rest and meditation, dropping bad habits'],
    Ve: ['hormonal, urinary or sugar problems from excess', 'balance, comfort and good recovery'],
    Su: ['low vitality, heart and eye strain, heat problems', 'strong energy, confidence and good recovery'],
    Mo: ['poor sleep, anxiety, fluid imbalance', 'calm mind, good appetite and sleep'],
    Ma: ['injuries, fevers, inflammation, surgery', 'stamina, fitness and quick healing'],
    Ra: ['allergies, anxiety, addictions, hard-to-diagnose symptoms', 'access to advanced treatment and adaptability'],
    Ju: ['weight gain, liver and sugar problems', 'protection, good doctors and faith in recovery'],
    Sa: ['joint pain, fatigue, chronic conditions', 'discipline, endurance and long steady health'],
    Me: ['nervous strain, skin and breathing issues', 'clear thinking and good self-care routines']
  };
  var COMBUST = { Mo: 12, Ma: 17, Me: 14, Ju: 11, Ve: 10, Sa: 15 };
  var GEM_LAGNA = [['Ma', 'Su', 'Ju'], ['Ve', 'Me', 'Sa'], ['Me', 'Ve'], ['Mo', 'Ma', 'Ju'], ['Su', 'Ma', 'Ju'], ['Me', 'Ve'], ['Ve', 'Sa', 'Me'], ['Ma', 'Ju', 'Mo'], ['Ju', 'Ma', 'Su'], ['Sa', 'Ve', 'Me'], ['Sa', 'Ve'], ['Ju', 'Mo', 'Ma']];
  var GEM_AVOID = [['Me'], ['Ju'], ['Ma'], ['Me', 'Sa'], ['Sa'], ['Ma', 'Mo'], ['Ju', 'Ma'], ['Me', 'Ve'], ['Ve', 'Mo'], ['Ju', 'Mo'], ['Mo', 'Ju'], ['Ve', 'Sa', 'Su']];
  var NAK_GROUP = { 0: 'light', 7: 'light', 12: 'light', 4: 'soft', 13: 'soft', 16: 'soft', 26: 'soft', 3: 'fixed', 11: 'fixed', 20: 'fixed', 25: 'fixed', 5: 'sharp', 8: 'sharp', 17: 'sharp', 18: 'sharp' };
  var NAK_USE = { light: 'good to start medicines, therapy and healing routines', soft: 'good for gentle treatment and rehabilitation', fixed: 'good for long-term regimes', sharp: 'used only for cutting or removal (surgery)' };
  var SUN_MONTH = { 1: ['vitality may dip, watch heat', 'rest well, do not overexert'], 3: ['good energy and courage', 'start a fitness habit'], 6: ['strong resistance to illness', 'good month for check-ups and starting treatment'], 8: ['lower energy, hidden issues may surface', 'avoid risks, keep routines gentle'], 10: ['active and productive', 'balance work with sleep'], 11: ['recovery and gains', 'good for rehabilitation goals'], 12: ['tiredness, poor sleep, expenses', 'prioritise sleep and quiet time'] };

  /* ---------------- helpers on a chart ---------------- */
  function aspectsOn(k, house) { return k.planets.filter(function (p) { var asp = J.aspectedHouses(p.code, p.house); return asp.indexOf(house) >= 0; }).map(function (p) { return p.code; }); }
  function inHouse(k, h) { return k.planets.filter(function (p) { return p.house === h; }).map(function (p) { return p.code; }); }
  function signHouse(k, s) { return hf(k.ascSign, s); }
  function neechaBhanga(k, code) {
    var p = k.P[code]; if (p.dignity !== 'Debilitated') return false;
    var lord = J.RULER[p.sign], ex = { 0: 'Su', 1: 'Mo', 3: 'Ju', 5: 'Me', 6: 'Sa', 9: 'Ma', 11: 'Ve' }[p.sign];
    function kend(c) { if (!c || !k.P[c]) return false; var a = hf(k.ascSign, k.P[c].sign), b = hf(k.P.Mo.sign, k.P[c].sign); return [1, 4, 7, 10].indexOf(a) >= 0 || [1, 4, 7, 10].indexOf(b) >= 0; }
    return kend(lord) || kend(ex);
  }
  function combust(k, code) { if (!COMBUST[code]) return false; var lim = COMBUST[code]; if (k.P[code].retro && code === 'Me') lim = 12; if (k.P[code].retro && code === 'Ve') lim = 8; return Math.abs(norm(k.P[code].lon - k.P.Su.lon + 180) - 180) < lim; }
  function moonPhase(k) { var e = norm(k.P.Mo.lon - k.P.Su.lon); return { e: e, strong: e >= 84 && e <= 276, waxing: e < 180 }; }
  function afflictors(k, code) {
    var p = k.P[code], out = [];
    k.planets.forEach(function (q) { if (q.code === code) return; if (MAL.indexOf(q.code) < 0 && q.code !== 'Su') return; if (q.code === 'Su' && code !== 'Mo') return; var conj = q.sign === p.sign, asp = J.aspectedHouses(q.code, q.house).indexOf(p.house) >= 0 && q.code !== 'Su'; if (conj || asp) out.push(q.code); });
    return uniq(out);
  }
  function jupProtects(k, code) { if (code === 'Ju') return false; var p = k.P[code], j = k.P.Ju; return j.sign === p.sign || J.aspectedHouses('Ju', j.house).indexOf(p.house) >= 0; }
  function jupOnHouse(k, h) { return k.P.Ju.house === h || J.aspectedHouses('Ju', k.P.Ju.house).indexOf(h) >= 0; }
  function d6(lon) { var s = Math.floor(norm(lon) / 30), d = norm(lon) % 30, part = Math.floor(d / 5); return ((s % 2 === 0 ? 0 : 6) + part) % 12; }
  function signDignity(code, sign) { return J.dignity(code, sign * 30 + 15); }

  /* planet health condition */
  function pState(c, code, sb) {
    var k = c.k, p = k.P[code], d = p.dignity || '', nb = neechaBhanga(k, code), cb = combust(k, code), af = afflictors(k, code), prot = jupProtects(k, code);
    var ratio = sb && sb.P && sb.P[code] ? sb.P[code].ratio : null, score = 0, why = [];
    if (/Exalted|Moolatrikona|Own/.test(d)) { score += 2; why.push(d.toLowerCase()); } else if (/Friendly/.test(d)) score += 1; else if (/Enemy/.test(d)) { score -= 1; why.push('in an enemy sign'); } else if (/Debilitated/.test(d)) { score -= nb ? 1 : 2; why.push('debilitated' + (nb ? ' (with cancellation, neecha bhanga)' : '')); }
    if ([1, 4, 7, 10, 5, 9].indexOf(p.house) >= 0) score += 1; else if ([6, 8, 12].indexOf(p.house) >= 0) { score -= 1; why.push('in the ' + nth(p.house) + ' house'); }
    if (cb) { score -= 1; why.push('combust (too close to the Sun)'); }
    if (af.length) { score -= af.length > 1 ? 2 : 1; why.push('under ' + af.map(function (x) { return PN[x]; }).join(' and ')); }
    if (prot) { score += 1; why.push('Jupiter protects it'); }
    if (ratio != null) { if (ratio >= 1.15) score += 1; else if (ratio < 0.9) { score -= 1; why.push('low Shadbala'); } }
    if (code === 'Mo') { var ph = moonPhase(k); if (!ph.strong) { score -= 1; why.push('dark-phase Moon'); } else score += 1; }
    var state = score >= 2 ? 'strong' : score <= -2 ? 'afflicted' : score < 0 ? 'weak' : 'average';
    var dir = state === 'strong' && af.length ? 'more' : state === 'afflicted' && /Exalted|Own|Moolatrikona/.test(d) ? 'more' : state === 'afflicted' || state === 'weak' ? 'less' : '';
    if (code === 'Ra' || code === 'Ke') { state = [1, 8, 12].indexOf(p.house) >= 0 || af.length ? 'afflicted' : [3, 6, 11].indexOf(p.house) >= 0 ? 'strong' : 'average'; dir = state === 'afflicted' ? 'more' : ''; }
    return { code: code, house: p.house, sign: p.sign, dignity: d, nb: nb, combust: cb, af: af, prot: prot, ratio: ratio, score: score, state: state, dir: dir, why: why };
  }
  function role(k, code) {
    if (code === 'Ra' || code === 'Ke') return { r: 'malefic', t: 'shadow planet' };
    var hs = J.lordsOf(k.ascSign, code), ken = hs.some(function (h) { return [4, 7, 10].indexOf(h) >= 0; }), tri = hs.some(function (h) { return [5, 9].indexOf(h) >= 0; }), dus = hs.some(function (h) { return [6, 8, 12].indexOf(h) >= 0; });
    var t = 'rules the ' + hs.map(nth).join(' and ');
    if (hs.indexOf(1) >= 0) return { r: 'lagna', t: 'Lagna lord (' + t + ')', hs: hs };
    if (ken && tri) return { r: 'yogakaraka', t: 'yogakaraka (' + t + ')', hs: hs };
    if (tri) return { r: 'benefic', t: 'functional benefic (' + t + ')', hs: hs };
    if (dus) return { r: 'malefic', t: 'functional malefic (' + t + ')', hs: hs };
    return { r: 'neutral', t: 'neutral (' + t + ')', hs: hs };
  }
  function modeOf(k, code, st) {
    var ro = role(k, code), natBen = ['Ju', 'Ve', 'Me', 'Mo'].indexOf(code) >= 0, mode;
    if (ro.r === 'malefic') mode = 'pacify';
    else if (ro.r === 'neutral') mode = st.dir === 'more' ? 'pacify' : (st.state === 'weak' || st.state === 'afflicted') && natBen ? 'strengthen' : 'maintain';
    else mode = st.state === 'weak' || st.state === 'afflicted' ? 'strengthen' : 'maintain';
    var nodeJoin = k.P[code] && (k.P.Ra.sign === k.P[code].sign || k.P.Ke.sign === k.P[code].sign) && code !== 'Ra' && code !== 'Ke';
    var gemOk = mode === 'strengthen' && ['lagna', 'yogakaraka', 'benefic'].indexOf(ro.r) >= 0 && !nodeJoin && GEM_AVOID[k.ascSign].indexOf(code) < 0;
    return { mode: mode, role: ro, gemOk: gemOk, nodeJoin: nodeJoin };
  }

  /* ---------------- main reading ---------------- */
  function analyze(c, now, sb, ageNow) {
    now = now || new Date();
    var k = c.k, A = k.ascSign, L1 = J.lordOfHouse(A, 1), lp = k.P[L1], out = { now: now };
    var st = {}; P9.forEach(function (x) { st[x] = pState(c, x, sb); }); out.st = st;
    /* 1. Lagna strength, five tests */
    var tests = [];
    tests.push({ ok: [1, 4, 7, 10, 5, 9].indexOf(lp.house) >= 0, t: 'Lagna lord ' + PN[L1] + ' in the ' + nth(lp.house) + ' house', good: 'a kendra or trikona: protected', bad: [6, 8, 12].indexOf(lp.house) >= 0 ? 'a difficult house: lower resistance' : 'not a kendra or trikona' });
    tests.push({ ok: /Exalted|Own|Moolatrikona|Friendly/.test(lp.dignity), t: 'Dignity: ' + lp.dignity.toLowerCase() + (neechaBhanga(k, L1) ? ' (neecha bhanga)' : ''), good: 'good dignity', bad: 'weak dignity' });
    tests.push({ ok: !combust(k, L1), t: combust(k, L1) ? 'Combust (too close to the Sun)' : 'Not combust', good: 'keeps its strength', bad: 'loses some protection' });
    var onL = aspectsOn(k, 1).concat(inHouse(k, 1)), onLL = afflictors(k, L1), benOn = jupOnHouse(k, 1) || jupProtects(k, L1) || ['Ve', 'Me'].some(function (b) { return aspectsOn(k, 1).indexOf(b) >= 0 || inHouse(k, 1).indexOf(b) >= 0; });
    tests.push({ ok: benOn && onLL.length < 2, t: benOn ? 'Benefic help on the Lagna or its lord' + (jupOnHouse(k, 1) ? ' (Jupiter)' : '') : 'No benefic help on the Lagna', good: 'protection and good treatment', bad: onLL.length ? 'pressure from ' + onLL.map(function (x) { return PN[x]; }).join(', ') : 'no protection' });
    var occ = inHouse(k, 1), badOcc = occ.filter(function (x) { return MAL.indexOf(x) >= 0 && st[x].state !== 'strong'; });
    tests.push({ ok: !badOcc.length, t: occ.length ? 'In the Lagna: ' + occ.map(function (x) { return PN[x]; }).join(', ') : 'Lagna empty', good: 'no troubled planet sits on the body', bad: badOcc.map(function (x) { return PN[x]; }).join(', ') + ' disturbs the body' });
    var ls = tests.filter(function (t) { return t.ok; }).length;
    out.lagna = { score: ls, tests: tests, lord: L1, word: ls >= 4 ? 'Strong recovery power' : ls >= 2 ? 'Average resilience' : 'Low resilience: build prevention habits' };
    var ph = moonPhase(k);
    out.lights = { sun: st.Su.state, moon: st.Mo.state, phase: ph, text: 'Sun (second lagna, vitality): ' + st.Su.state + '. Moon (third lagna, mind and fluids): ' + st.Mo.state + (ph.strong ? ', bright phase' : ', dark phase') + '.' + (ls <= 2 && st.Su.state !== 'weak' && st.Su.state !== 'afflicted' && ['strong', 'average'].indexOf(st.Mo.state) >= 0 ? ' The Sun and Moon make up for a weaker Lagna: recovery is still good.' : ls <= 1 && /weak|afflicted/.test(st.Su.state + st.Mo.state) ? ' Lagna, Sun and Moon all need support: prevention matters most.' : '') };
    /* 2. constitution */
    var pts = { Vata: 0, Pitta: 0, Kapha: 0 };
    function addD(list, w) { list.forEach(function (d) { pts[d] += w / list.length; }); }
    addD([SIGN_DOSHA[A]], 3); inHouse(k, 1).forEach(function (x) { addD(PL_DOSHA[x], 1); });
    addD([SIGN_DOSHA[lp.sign]], 2); addD(PL_DOSHA[L1], 1); addD([SIGN_DOSHA[k.P.Mo.sign]], 2);
    var cnt = { Vata: 0, Pitta: 0, Kapha: 0 }; P7.forEach(function (x) { cnt[SIGN_DOSHA[k.P[x].sign]]++; }); Object.keys(cnt).forEach(function (d) { if (cnt[d] >= 3) pts[d] += cnt[d] - 2; });
    var tot = pts.Vata + pts.Pitta + pts.Kapha, pc = {}; Object.keys(pts).forEach(function (d) { pc[d] = Math.round(pts[d] / tot * 100); });
    var ord = Object.keys(pc).sort(function (a, b) { return pc[b] - pc[a]; }), type = pc[ord[1]] >= 30 ? ord[0] + '-' + ord[1] : ord[0];
    out.dosha = { pc: pc, main: ord[0], second: ord[1], type: type, info: DOSHA };
    /* 3. body areas by three layers */
    out.areas = AREAS.map(function (a) {
      var why = [], layers = 0, prot = [];
      var sHit = a.s.filter(function (s) { var hs = signHouse(k, s), mals = inHouse(k, hs).filter(function (x) { return MAL.indexOf(x) >= 0 && st[x].state !== 'strong'; }).concat(aspectsOn(k, hs).filter(function (x) { return (x === 'Sa' || x === 'Ma') && st[x].state !== 'strong' && inHouse(k, hs).indexOf(x) < 0; })); var lord = J.RULER[s], lw = st[lord].state === 'afflicted'; if (mals.length || lw) { why.push(SG[s] + ' (sign for this area): ' + (mals.length ? uniq(mals).map(function (x) { return PN[x]; }).join(', ') + ' on it' : '') + (mals.length && lw ? '; ' : '') + (lw ? 'its lord ' + PN[lord] + ' is ' + st[lord].state : '')); return true; } return false; });
      if (sHit.length) layers++;
      var hHit = a.h.filter(function (h) { var mals = inHouse(k, h).filter(function (x) { return MAL.indexOf(x) >= 0 && st[x].state !== 'strong'; }).concat(aspectsOn(k, h).filter(function (x) { return (x === 'Sa' || x === 'Ma') && st[x].state !== 'strong' && inHouse(k, h).indexOf(x) < 0; })), lord = J.lordOfHouse(A, h), lh = k.P[lord].house, bad = [6, 8, 12].indexOf(lh) >= 0 && h !== lh; if (mals.length || bad) { why.push(nth(h) + ' house: ' + (mals.length ? uniq(mals).map(function (x) { return PN[x]; }).join(', ') + ' on it' : '') + (mals.length && bad ? '; ' : '') + (bad ? 'its lord ' + PN[lord] + ' in the ' + nth(lh) : '')); if (jupOnHouse(k, h)) prot.push('Jupiter guards the ' + nth(h)); return true; } return false; });
      if (hHit.length) layers++;
      var kHit = a.k.filter(function (x) { return /weak|afflicted/.test(st[x].state); });
      if (kHit.length) { layers++; kHit.forEach(function (x) { why.push(PN[x] + ' (karaka): ' + st[x].why.join(', ')); if (st[x].prot) prot.push('Jupiter protects ' + PN[x]); }); }
      /* D6 / D30 confirmation for the karaka */
      var conf = a.k.filter(function (x) { if (x === 'Ra' || x === 'Ke') return false; var s6 = d6(k.P[x].lon), s30 = J.varga(k.P[x].lon, 30).sign; return /Debilitated|Enemy/.test(signDignity(x, s6)) || /Debilitated|Enemy/.test(signDignity(x, s30)); });
      var level = layers >= 3 ? 3 : layers === 2 ? 2 : layers === 1 ? 1 : 0; if (prot.length && level > 1) level -= 0.5; if (conf.length && layers >= 2) level += 0.5;
      return { id: a.id, n: a.n, layers: layers, level: level, word: level >= 2.5 ? 'Give preventive attention' : level >= 1.5 ? 'Watch' : level >= 1 ? 'Mild' : 'Fine', why: why, prot: uniq(prot), conf: conf.map(function (x) { return PN[x] + ' is weak in D6/D30 too'; }), care: a.care, alert: a.alert, k: a.k, h: a.h, s: a.s };
    }).sort(function (x, y) { return y.level - x.level; });
    /* 4. protection and health combinations */
    var combos = [];
    if ([6, 8, 12].indexOf(lp.house) >= 0 && !jupProtects(k, L1)) combos.push(['b', 'Lagna lord in the ' + nth(lp.house) + ' without benefic help: resistance is lower, so rest and check-ups matter.']);
    var L6 = J.lordOfHouse(A, 6); if (L6 !== L1 && (k.P[L6].house === 1 || k.P[L6].sign === lp.sign)) combos.push(['b', '6th lord ' + PN[L6] + ' joins the Lagna or its lord: illnesses can repeat; keep a steady routine.']);
    if (st.Mo.af.indexOf('Sa') >= 0 && st.Mo.af.indexOf('Ra') >= 0) combos.push(['b', 'Moon under both Saturn and Rahu: stress turns into body symptoms; protect sleep and mind.']);
    var fight = [3, 6, 11].map(function (h) { return inHouse(k, h).filter(function (x) { return MAL.indexOf(x) >= 0; }); }).reduce(function (a, b) { return a.concat(b); }, []);
    if (fight.length) combos.push(['g', fight.map(function (x) { return PN[x]; }).join(', ') + ' in the 3rd/6th/11th: good fighting power against illness.']);
    if (jupOnHouse(k, 1) || jupProtects(k, L1)) combos.push(['g', 'Jupiter guards the Lagna or its lord: protection and the right doctor at the right time.']);
    if (jupProtects(k, 'Mo')) combos.push(['g', 'Jupiter guards the Moon: steadier mind under stress.']);
    var L8 = J.lordOfHouse(A, 8); if (/Exalted|Own|Moolatrikona/.test(k.P[L8].dignity)) combos.push(['g', '8th lord ' + PN[L8] + ' is strong: good longevity and endurance through chronic matters.']);
    out.combos = combos;
    /* 5. timing: dasha */
    var ch = J.dashaChain(c.maha, now, 3);
    function dashaNote(d, lvl) {
      var code = d.lord, ro = role(k, code), s = st[code], hs = J.lordsOf(A, code), dus = hs.filter(function (h) { return [6, 8, 12].indexOf(h) >= 0; }), placedDus = [6, 8, 12].indexOf(k.P[code].house) >= 0;
      var bad = s.state === 'weak' || s.state === 'afflicted' || (dus.length && hs.indexOf(1) < 0) || placedDus, md = MD_HEALTH[code];
      var areas = out.areas.filter(function (a) { return a.k.indexOf(code) >= 0 || a.h.some(function (h) { return hs.indexOf(h) >= 0 || k.P[code].house === h; }); }).filter(function (a) { return a.level >= 1.5; }).slice(0, 3).map(function (a) { return a.n.toLowerCase(); });
      return { lvl: lvl, code: code, start: d.start, end: d.end, role: ro.t, state: s.state, bad: bad, text: PN[code] + ' ' + ['Mahadasha', 'Antardasha', 'Pratyantar'][lvl] + ' (' + dmy(d.start) + ' – ' + dmy(d.end) + '): ' + ro.t + ', ' + s.state + (placedDus ? ', placed in the ' + nth(k.P[code].house) : '') + '. ' + (bad ? 'Watch for ' + md[0] + '.' : 'Supports ' + md[1] + '.') + (areas.length ? ' Areas it touches in this chart: ' + areas.join(', ') + '.' : ''), areas: areas };
    }
    out.dasha = ch.map(dashaNote);
    if (ch[1]) { var rel = hf(k.P[ch[0].lord].sign, k.P[ch[1].lord].sign); out.shadashtaka = rel === 6 || rel === 8 ? PN[ch[0].lord] + ' and ' + PN[ch[1].lord] + ' sit 6/8 from each other (shadashtaka): friction between the two periods; keep routines steady.' : ''; }
    var mdEnd = ch[0].end; out.sandhi = mdEnd - now < 183 * DAY ? 'Dasha sandhi: ' + PN[ch[0].lord] + ' Mahadasha ends on ' + dmy(mdEnd) + '. The months around a change of Mahadasha feel unsettled; rest, get a full check-up and keep habits steady.' : '';
    var upcoming = []; J.dashas(c.birth, k.P.Mo.lon).forEach(function (m) { if (m.end < now) return; J.subPeriods(m).forEach(function (a) { if (a.start < now || a.start > new Date(now.getTime() + 3 * 365.25 * DAY)) return; var hs = J.lordsOf(A, a.lord).concat([k.P[a.lord].house]); if (hs.some(function (h) { return [6, 8, 12].indexOf(h) >= 0; }) || /afflicted/.test(st[a.lord].state)) upcoming.push({ start: a.start, end: a.end, lord: a.lord, md: m.lord, text: PN[m.lord] + '–' + PN[a.lord] + ' from ' + dmy(a.start) + ': ' + PN[a.lord] + ' touches the ' + uniq(hs.filter(function (h) { return [6, 8, 12].indexOf(h) >= 0; })).map(nth).join('/') + ' house. Book a routine check-up just before it starts; watch ' + MD_HEALTH[a.lord][0] + '.' }); }); });
    out.upcoming = upcoming.slice(0, 5);
    /* 6. timing: transits */
    var T = J.kundli(now, c.p ? +c.p.lat : k.lat, c.p ? +c.p.lon : k.lon), tr = [], moS = k.P.Mo.sign, run = ch.map(function (x) { return x.lord; });
    var saM = hf(moS, T.P.Sa.sign), saL = hf(A, T.P.Sa.sign), sav = c.av ? c.av.sav : null;
    function savNote(sign) { if (!sav) return ''; var v = sav[sign]; return v >= 28 ? ' ' + SG[sign] + ' has ' + v + ' Ashtakavarga points: you handle this transit well.' : v < 25 ? ' ' + SG[sign] + ' has only ' + v + ' Ashtakavarga points: you feel this transit more.' : ''; }
    if ([12, 1, 2].indexOf(saM) >= 0) tr.push({ k: 'b', p: 'Sa', t: 'Sade Sati (' + ['rising', 'peak', 'setting'][[12, 1, 2].indexOf(saM)] + ' phase): Saturn is ' + nth(saM) + ' from the Moon. Tiredness, low mood and heavy duties are common; disciplined routines turn it into a period of real improvement.' + savNote(T.P.Sa.sign) });
    else if (saM === 8) tr.push({ k: 'b', p: 'Sa', t: 'Ashtama Shani: Saturn 8th from the Moon. Protect health and avoid unnecessary risks for its 2½ years.' + savNote(T.P.Sa.sign) });
    else if ([4, 7, 10].indexOf(saM) >= 0) tr.push({ k: 'b', p: 'Sa', t: 'Kantaka Shani: Saturn ' + nth(saM) + ' from the Moon. Strain on ' + { 4: 'home comfort', 7: 'partnership', 10: 'work' }[saM] + ' can show as fatigue.' + savNote(T.P.Sa.sign) });
    else if ([3, 6, 11].indexOf(saM) >= 0) tr.push({ k: 'g', p: 'Sa', t: 'Saturn ' + nth(saM) + ' from the Moon: a good transit for steady health and discipline.' });
    var juM = hf(moS, T.P.Ju.sign), juAspL = hf(A, T.P.Ju.sign) === 1 || J.aspectedHouses('Ju', hf(A, T.P.Ju.sign)).indexOf(1) >= 0;
    if ([5, 7, 9, 11].indexOf(juM) >= 0 || juAspL) tr.push({ k: 'g', p: 'Ju', t: 'Healing window: Jupiter is ' + nth(juM) + ' from the Moon' + (juAspL ? ' and guards your Lagna' : '') + '. Best time to start long treatment, rehabilitation or a lifestyle change.' });
    else if ([6, 8, 12].indexOf(juM) >= 0) tr.push({ k: 'b', p: 'Ju', t: 'Jupiter is ' + nth(juM) + ' from the Moon: less protection this year; do not ignore small symptoms.' });
    ['Ma', 'Ra', 'Ke'].forEach(function (x) {
      var hL = hf(A, T.P[x].sign), hM = hf(moS, T.P[x].sign), onPt = Math.abs(norm(T.P[x].lon - k.P.Mo.lon + 180) - 180) < 5 ? 'your natal Moon' : Math.abs(norm(T.P[x].lon - k.asc + 180) - 180) < 5 ? 'your Lagna degree' : '';
      var good = [3, 6, 11].indexOf(hM) >= 0;
      if (onPt || [1, 8, 12].indexOf(hL) >= 0 || (!good && [1, 8].indexOf(hM) >= 0)) tr.push({ k: 'b', p: x, t: PN[x] + ' transits your ' + nth(hL) + ' house (' + nth(hM) + ' from the Moon)' + (onPt ? ', crossing ' + onPt : '') + ': watch ' + { Ma: 'fevers, injuries and inflammation', Ra: 'allergies, anxiety and unusual symptoms', Ke: 'infections and sudden procedures' }[x] + ' in the ' + HOUSE_BODY[hL - 1] + '.' + (run.indexOf(x) >= 0 ? ' It also runs your dasha now, so take this seriously.' : '') });
      else if (good) tr.push({ k: 'g', p: x, t: PN[x] + ' is ' + nth(hM) + ' from the Moon: good fighting power against illness.' });
    });
    var suL = hf(A, T.P.Su.sign), suM = hf(moS, T.P.Su.sign), sm = SUN_MONTH[suM]; if (sm) tr.push({ k: [3, 6, 10, 11].indexOf(suM) >= 0 ? 'g' : 'b', p: 'Su', t: 'This month the Sun is ' + nth(suM) + ' from your Moon (' + nth(suL) + ' from Lagna): ' + sm[0] + '. ' + sm[1].charAt(0).toUpperCase() + sm[1].slice(1) + '.' });
    var retro = T.planets.filter(function (p) { return p.retro && ['Me', 'Ve', 'Ma', 'Ju', 'Sa'].indexOf(p.code) >= 0; }).map(function (p) { return PN[p.code] + ' retrograde: ' + { Me: 'old nervous or digestive issues may return; double-check prescriptions and appointments', Ve: 'hormonal or kidney matters may need a follow-up', Ma: 'energy turns inward; pace your exercise', Ju: 'review diet and weight habits', Sa: 'old aches return; keep routines steady' }[p.code] + '.'; });
    out.retro = retro;
    if (combust(T, L1) && L1 !== 'Su') tr.push({ k: 'b', p: L1, t: 'Your Lagna lord ' + PN[L1] + ' is combust in transit now: results feel slower for a few weeks; be patient with treatment.' });
    tr.forEach(function (x) { x.agree = run.indexOf(x.p) >= 0; });
    out.transits = tr;
    out.agree = tr.filter(function (x) { return x.k === 'b' && x.agree; }).map(function (x) { return PN[x.p] + ' is both your running dasha lord and a difficult transit: this is the combination to take seriously.'; });
    /* 7. Sun calendar, next 12 months */
    var cal = [], t0 = now, s0 = J.signOf(T.P.Su.lon);
    for (var i = 0; i < 12; i++) {
      var ing = i === 0 ? null : J.nextIngress('Su', t0, 40); if (i > 0 && !ing) break; if (i > 0) t0 = new Date(ing.getTime() + 3600e3);
      var sg = (s0 + i) % 12, hm = hf(moS, sg), hl = hf(A, sg), note = SUN_MONTH[hm] || SUN_MONTH[hl];
      cal.push({ from: i === 0 ? now : ing, sign: sg, hm: hm, hl: hl, note: note ? note[1] : 'normal month: keep routines', theme: note ? note[0] : '' });
    }
    out.calendar = cal;
    /* 8. remedies: priority planets */
    var pri = uniq([ch[0].lord, ch[1] ? ch[1].lord : ch[0].lord, L1].concat(P9.filter(function (x) { return st[x].state === 'afflicted'; })).concat(out.areas.filter(function (a) { return a.level >= 2; }).map(function (a) { return a.k[0]; }))).slice(0, 5);
    out.remedies = pri.map(function (code) {
      var m = modeOf(k, code, st[code]), d = PL[code], why = code === ch[0].lord ? 'running Mahadasha lord' : ch[1] && code === ch[1].lord ? 'running Antardasha lord' : code === L1 ? 'Lagna lord (your body)' : m.mode === 'pacify' ? 'troubles your health chart' : 'needs support in your health chart';
      var acts = [];
      acts.push('Mantra: ' + d.mantra + ' — one mala (108) daily' + (m.mode === 'pacify' ? ', especially on ' + d.day + 's' : '') + '. Traditional total ' + d.count.toLocaleString('en-IN') + ' over 40+ days.');
      if (m.mode === 'strengthen') acts.push('Food: include ' + d.foods + ' 2–3 times a week, especially on ' + d.day + '. ' + d.caution);
      if (m.mode === 'pacify') acts.push('Daan on ' + d.day + 's: ' + d.daan + '. Seva: ' + d.seva + '. Do not overeat its foods.');
      if (m.mode === 'maintain') acts.push('Keep it steady: ' + d.care.split('.')[0].toLowerCase() + '. No gemstone needed.');
      acts.push('Yoga: ' + d.yoga + (d.yogaAvoid ? ' (skip or modify with ' + d.yogaAvoid + ')' : '') + '.');
      if (m.mode !== 'pacify' && d.colour) acts.push('Colour: wear ' + d.colour + ' on ' + d.day + 's.');
      acts.push('Affirmation: "' + d.aff + '"');
      var gem = m.gemOk ? d.gem + ' (or ' + (d.upa || 'its uparatna') + '), ' + d.finger + ' finger, ' + d.metal + ', first worn ' + d.wear + ' — only after a full chart check and with a lab certificate.' : m.mode === 'pacify' ? 'Never wear its gemstone (' + d.gem + '): it would strengthen the problem.' : m.mode === 'maintain' ? 'Not needed: this planet is already doing its job.' : m.nodeJoin ? 'No gemstone: Rahu/Ketu joins it; use mantra instead.' : 'Gemstone not needed.';
      return { code: code, why: why, mode: m.mode, role: m.role.t, state: st[code].state, acts: acts, gem: gem, gemOk: m.gemOk };
    });
    out.gemLagna = { good: GEM_LAGNA[A], avoid: GEM_AVOID[A] };
    out.age = ageNow;
    return out;
  }

  /* planned-treatment muhurta between two dates */
  function muhurta(c, from, to, areaId, loc) {
    var k = c.k, birthNak = k.P.Mo.nak.index, area = AREAS.filter(function (a) { return a.id === areaId; })[0], out = [];
    for (var t = from.getTime(); t <= to.getTime() && out.length < 40; t += DAY) {
      var d0 = new Date(t), pc = J.panchangLite(d0, loc.lat, loc.lon), at = new Date(pc.rise.getTime() + 3 * 3600e3), T = J.kundli(at, loc.lat, loc.lon);
      var bad = [], good = [], ti = J.tithiAt(at), yo = J.yogaAt(at), ka = J.karanaAt(at), nk = J.nakInfo(T.P.Mo.lon);
      if (ti.name === 'Amavasya') bad.push('Amavasya');
      if ([4, 9, 14].indexOf(ti.num) >= 0) bad.push('Rikta tithi (' + ti.paksha + ' ' + ti.name + ')');
      if (ti.paksha === 'Shukla') good.push('waxing Moon');
      if (/Vyatipata|Vaidhriti/.test(yo.name)) bad.push(yo.name + ' yoga');
      if (/Vishti/.test(ka.name)) bad.push('Bhadra (Vishti) karana');
      if (area && area.s.indexOf(T.P.Mo.sign) >= 0) bad.push('Moon in ' + SG[T.P.Mo.sign] + ', the sign of the ' + area.n.toLowerCase());
      var mc = ['Sa', 'Ma', 'Ra', 'Ke'].filter(function (x) { return Math.abs(norm(T.P[x].lon - T.P.Mo.lon + 180) - 180) < 10; }); if (mc.length) bad.push('Moon close to ' + mc.map(function (x) { return PN[x]; }).join(', '));
      var tara = ((nk.index - birthNak + 27) % 27) % 9 + 1; if ([3, 5, 7].indexOf(tara) >= 0) bad.push(['', '', '', 'Vipat', '', 'Pratyari', '', 'Vadha'][tara] + ' tara from the birth star');
      var grp = NAK_GROUP[nk.index]; var note = ''; if (grp === 'light' || grp === 'soft' || grp === 'fixed') good.push(nk.name + ': ' + NAK_USE[grp]); if (grp === 'sharp') note = nk.name + ' is a sharp star: suits surgery or removal only, not starting medicines.';
      var juOnMo = [1, 5, 7, 9].indexOf(hf(T.P.Ju.sign, T.P.Mo.sign)) >= 0; if (juOnMo) good.push('Jupiter guards the Moon');
      out.push({ date: d0, nak: nk.name, tithi: ti.paksha + ' ' + ti.name, bad: bad, good: good, note: note, score: good.length * 2 - bad.length * 3 });
    }
    return out;
  }

  /* compact text for the AI prompt */
  function text(R, name) {
    var L = [];
    L.push('MEDICAL ASTROLOGY READING (Trikaal method; three agreeing layers = sign, house, planet; doctor first)');
    L.push('Lagna strength ' + R.lagna.score + '/5 (' + R.lagna.word + '): ' + R.lagna.tests.map(function (t) { return t.t + ' ' + (t.ok ? '✓' : '✗'); }).join('; ') + '. ' + R.lights.text);
    L.push('Constitution: ' + R.dosha.type + ' (Vata ' + R.dosha.pc.Vata + '%, Pitta ' + R.dosha.pc.Pitta + '%, Kapha ' + R.dosha.pc.Kapha + '%). Excess ' + R.dosha.main + ' shows as ' + DOSHA[R.dosha.main].excess + '.');
    L.push('Body areas (strongest first): ' + R.areas.filter(function (a) { return a.level >= 1.5; }).map(function (a) { return a.n + ' [' + a.word + ', ' + a.layers + ' layers: ' + a.why.join(' | ') + (a.prot.length ? '; protection: ' + a.prot.join(', ') : '') + (a.conf.length ? '; ' + a.conf.join(', ') : '') + ']'; }).join(' || '));
    L.push('Planets: ' + P9.map(function (x) { var s = R.st[x]; return PN[x] + ' ' + s.state + (s.dir ? ' (' + (s.dir === 'more' ? 'excess: ' + PL[x].more : 'deficit: ' + PL[x].less) + ')' : ''); }).join('; '));
    L.push('Combinations: ' + R.combos.map(function (c) { return c[1]; }).join(' '));
    L.push('DASHA NOW: ' + R.dasha.map(function (d) { return d.text; }).join(' ') + (R.shadashtaka ? ' ' + R.shadashtaka : '') + (R.sandhi ? ' ' + R.sandhi : ''));
    if (R.upcoming.length) L.push('NEXT 3 YEARS, health sub-periods: ' + R.upcoming.map(function (u) { return u.text; }).join(' '));
    L.push('TRANSITS NOW: ' + R.transits.map(function (t) { return t.t; }).join(' ') + (R.agree.length ? ' AGREEMENT: ' + R.agree.join(' ') : '') + (R.retro.length ? ' Retrograde: ' + R.retro.join(' ') : ''));
    L.push('REMEDY PLAN (mode by role, not weakness alone): ' + R.remedies.map(function (r) { return PN[r.code] + ' [' + r.why + '; ' + r.role + '; ' + r.state + '; mode ' + r.mode.toUpperCase() + ']: ' + r.acts.join(' ') + ' Gem: ' + r.gem; }).join(' || '));
    return L.join('\n');
  }
  var RULES = 'MEDICAL ASTROLOGY RULES (the app\'s health reference; follow strictly):\n' +
    '1. Doctor first: a chart shows tendencies, a doctor diagnoses. Never say someone has or will get a disease; never predict death; never advise stopping or delaying treatment. Emergencies go to hospital whatever the dasha.\n' +
    '2. Read health in this order: Lagna and Lagna lord (recovery power), Sun and Moon, the 6th, 8th and 12th, the karaka of the organ, protection (Jupiter), then conclude only where at least three indicators agree (sign, house, planet; D6/D30 confirm).\n' +
    '3. Say which way an imbalance leans: too much (heat, excess) or too little (weakness), and match advice to it.\n' +
    '4. Timing: the dasha is the season, transits are the weather. Take a transit seriously only when it agrees with the running dasha. Sade Sati, Ashtama and Kantaka Shani are periods for extra care, not fear. Jupiter 5/7/9/11 from the Moon or on the Lagna is the healing window.\n' +
    '5. Remedies by mode: strengthen a weak Lagna lord, yogakaraka or trikona lord (mantra, food, colour; gemstone only after a full check); maintain a strong benefic (routine only); pacify a functional malefic (6th/8th/12th lord), Rahu, Ketu or a planet in excess (mantra, daan, seva) and NEVER suggest its gemstone. If Rahu or Ketu joins a planet, use mantra not a gem. Give exact items, quantity, day and how long (40 days, review at 90).\n' +
    '6. Fasting, herbs and diet changes need the doctor\'s clearance for diabetes, pregnancy, BP, the elderly and people on medicines. Include the doctor-alert signs for the body area discussed.\n';
  return { analyze: analyze, muhurta: muhurta, text: text, modeOf: modeOf, pState: pState, d6: d6, signDignity: signDignity, afflictors: afflictors, jupOnHouse: jupOnHouse, inHouse: inHouse, aspectsOn: aspectsOn, SUN_MONTH: SUN_MONTH, RULES: RULES, AREAS: AREAS, PL: PL, DOSHA: DOSHA, SIGN_BODY: SIGN_BODY, HOUSE_BODY: HOUSE_BODY, MD_HEALTH: MD_HEALTH, role: role, PN: PN, HN: HN };
}
