/* Trikaal: problem-wise medical astrology "case file".
   For one health problem: what the chart shows (three layers), when it is more active (dasha first, transit second, with dates),
   and the full plan (doctor and tests, do / avoid, food, yoga, remedies by mode, 90-day routine). Original Trikaal wording. */
function makeMedCase(J, C, MA) {
  var DAY = 864e5, MAL = ['Sa', 'Ma', 'Ra', 'Ke'], SG = J.SIGNS, PN = MA.PN;
  function nth(n) { var s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }
  function dmy(d) { return d.getDate() + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()] + ' ' + d.getFullYear(); }
  function my(d) { return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()] + ' ' + d.getFullYear(); }
  function uniq(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }
  function norm(x) { return ((x % 360) + 360) % 360; }

  /* k: karaka weights, h: houses, s: Kalapurusha signs (0 = Aries), d: dosha, ex: true when the problem is an "excess" type */
  var P = [
    { id: 'bp', n: 'High blood pressure', alt: 'BP, hypertension', re: /\b(bp|blood pressure|hypertension|high pressure)\b/i, k: { Su: 1, Ma: 0.8, Sa: 0.4 }, h: [4, 5, 1], s: [4, 3], d: 'Pitta', ex: true,
      tests: ['BP check every month at home; doctor review every 3 months', 'Lipid profile, kidney function and ECG every year after 35'], doc: 'General physician or cardiologist',
      avoid: ['Extra salt, pickles, papad, chips and packaged food', 'Smoking, alcohol, energy drinks', 'Anger, overwork, skipping sleep', 'Stopping BP tablets on your own'],
      dos: ['30-minute brisk walk 5 days a week', 'Anulom-vilom and Bhramari 10 minutes daily', 'Keep weight in range', '7 hours of sleep'], food: 'more vegetables, fruit, curd, oats and dals; very little salt, fried and red meat', yoga: 'Shavasana, Anulom-vilom, Bhramari (avoid head-down poses and breath-holding)', alert: 'BP above 180/120, chest pain, sudden severe headache, blurred vision or weakness on one side: emergency.' },
    { id: 'heart', n: 'Heart health', alt: 'palpitations, heart risk', re: /\b(heart|cardiac|palpitation|angina|chest pain)\b/i, k: { Su: 1, Mo: 0.5, Sa: 0.5 }, h: [4, 5], s: [4, 3], d: 'Pitta', ex: false,
      tests: ['Lipid profile, sugar and ECG every year after 35', 'TMT or echo if the doctor advises, especially with family history'], doc: 'Cardiologist',
      avoid: ['Smoking (the biggest single risk)', 'Fried food, trans fats, excess sugar', 'Long sitting without movement', 'Ignoring breathlessness or chest tightness'],
      dos: ['Daily walk building up to 45 minutes', 'Weight and waist in range', 'Manage stress: prayer, breathing, rest', 'Morning sunlight'], food: 'oats, nuts in small amounts, fruit, vegetables, fish or dals; less ghee, butter and sweets', yoga: 'Slow Surya Namaskar (only if cleared), Anulom-vilom, Shavasana', alert: 'Chest pain or pressure spreading to arm, jaw or back, fainting, breathlessness at rest: emergency.' },
    { id: 'sugar', n: 'Diabetes / blood sugar', alt: 'sugar, prediabetes', re: /\b(diabet\w*|sugar|hba1c|insulin|prediabet\w*)\b/i, k: { Ju: 1, Ve: 0.8, Mo: 0.3 }, h: [5, 6, 9], s: [8, 6], d: 'Kapha', ex: true,
      tests: ['Fasting sugar and HbA1c every 3 months if diabetic, yearly after 30 otherwise', 'Kidney, eye and foot check every year if diabetic'], doc: 'Physician or diabetologist',
      avoid: ['Sweets, sugary drinks, packaged juice', 'Large portions of white rice, maida and bakery items', 'Late heavy dinners', 'Fasting without the doctor\'s permission'],
      dos: ['10–15 minute walk after every meal', 'Fixed meal times', 'Medicines daily as prescribed', 'Lose 5% of weight if overweight'], food: 'millets (jowar, bajra, ragi), dals, vegetables, chana; Jupiter strengthened through turmeric and chana dal, not sweets', yoga: 'Ardha Matsyendrasana (seated twist), Mandukasana if the doctor allows, daily walking', alert: 'Extreme thirst and urination, confusion, a foot wound that does not heal, sugar below 70 with sweating: see a doctor urgently.' },
    { id: 'chol', n: 'Cholesterol / fatty liver', alt: 'lipids, liver', re: /\b(cholesterol|lipid|fatty liver|liver|triglycer\w*|sgpt)\b/i, k: { Ju: 1, Ve: 0.5, Su: 0.3 }, h: [5, 9], s: [8], d: 'Kapha', ex: true,
      tests: ['Lipid profile and liver function every year after 30', 'Liver ultrasound if the doctor advises'], doc: 'Physician or gastroenterologist',
      avoid: ['Fried food, excess ghee and butter', 'Alcohol', 'Overeating and late dinners', 'Sugary drinks'],
      dos: ['Daily exercise 40 minutes', 'Early, light dinner', 'Weight loss if overweight'], food: 'fibre, oats, vegetables, fruit, turmeric, walnuts in small amounts', yoga: 'Ardha Matsyendrasana, Bhujangasana, brisk walking', alert: 'Yellow eyes or skin, upper-right abdominal pain with fever, swelling of the belly: see a doctor today.' },
    { id: 'thyroid', n: 'Thyroid', alt: 'hypothyroid, TSH', re: /\b(thyroid|tsh|hypothyroid\w*|hyperthyroid\w*|goitre)\b/i, k: { Ve: 0.8, Me: 0.8, Mo: 0.5, Sa: 0.5 }, h: [2, 3, 1], s: [1], d: 'Kapha', ex: false,
      tests: ['TSH every year (every 3–6 months if on medicine, as the doctor says)', 'Earlier if tired, gaining weight, cold, or with hair fall'], doc: 'Endocrinologist or physician',
      avoid: ['Changing or skipping thyroid medicine on your own', 'Crash diets', 'Irregular sleep and long stress', 'Taking the tablet with tea, milk or calcium'],
      dos: ['Tablet on an empty stomach at the same time daily', 'Morning sunlight walk', 'Gentle neck stretches', 'Regular sleep'], food: 'home-cooked balanced meals, iodised salt unless told otherwise, enough protein', yoga: 'Gentle neck stretches, Setu Bandhasana, Ujjayi breathing (Sarvangasana only if a teacher and doctor approve)', alert: 'A neck lump, trouble swallowing, racing heartbeat with weight loss, or extreme tiredness: see a doctor.' },
    { id: 'weight', n: 'Weight gain / obesity', alt: 'overweight', re: /\b(weight|obes\w*|overweight|fat loss|belly fat)\b/i, k: { Ju: 1, Ve: 0.8, Mo: 0.5 }, h: [1, 5, 9], s: [8, 1], d: 'Kapha', ex: true,
      tests: ['Sugar, thyroid and lipid tests to find a cause', 'Waist measurement monthly'], doc: 'Physician and dietitian',
      avoid: ['Sweets, fried snacks, sugary drinks', 'Eating while watching screens', 'Late dinners and day sleep', 'Crash diets'],
      dos: ['10,000 steps a day', 'Strength training 2–3 days a week', 'Dinner before 8 pm', 'Portion control'], food: 'light warm meals, vegetables, dals, millets; less dairy, sugar and fried food', yoga: 'Surya Namaskar (as able), Bhujangasana, brisk walking', alert: 'Sudden weight gain with swelling or breathlessness: see a doctor.' },
    { id: 'pcos', n: 'PCOS / irregular periods', alt: 'hormones, periods', re: /\b(pcos|pcod|period\w*|menstrua\w*|hormon\w*|cycle)\b/i, k: { Ve: 1, Mo: 1, Ma: 0.6, Ra: 0.5 }, h: [5, 7, 8], s: [7, 6], d: 'Kapha', ex: false, fem: true, adult: true,
      tests: ['Hormone tests and ultrasound as the gynaecologist advises', 'Sugar and thyroid every year'], doc: 'Gynaecologist',
      avoid: ['Refined sugar and junk food', 'Late nights and screens in bed', 'Long sitting', 'Starting herbs without the doctor'],
      dos: ['Walking or strength training 5 days a week', 'Sleep by 11 pm', 'Lose 5% of weight if overweight', 'Track cycles in a diary'], food: 'protein at every meal, vegetables, seeds, whole grains; little sugar', yoga: 'Baddha Konasana (butterfly), Bhramari, Malasana', alert: 'Periods absent 3 months (not pregnant), very heavy bleeding, severe pelvic pain: see a gynaecologist.' },
    { id: 'fertility', n: 'Conceiving a child', alt: 'pregnancy, fertility', re: /\b(conceiv\w*|fertilit\w*|pregnan\w*|child ?birth|infertil\w*|ivf|baby)\b/i, k: { Ju: 1, Ve: 0.8, Mo: 0.6, Ma: 0.5 }, h: [5, 7, 8, 11], s: [7], d: '', ex: false, adult: true,
      tests: ['If not conceiving after 12 months (6 months if the woman is over 35): fertility tests for BOTH partners'], doc: 'Gynaecologist / fertility specialist',
      avoid: ['Smoking and alcohol for both partners', 'Herbs, fasts or gemstones in pregnancy without the obstetrician', 'Stress and irregular sleep'],
      dos: ['Healthy weight for both', 'Folic acid as the doctor advises', 'Calm routine and prayer'], food: 'fresh, nourishing home food; Jupiter foods (chana dal, turmeric) and Venus foods (curd, fruit)', yoga: 'Gentle yoga approved by the doctor, Bhramari, Yoga Nidra', alert: 'Any bleeding, severe pain or reduced baby movements in pregnancy: hospital at once.' },
    { id: 'kidney', n: 'Kidney stones / urinary infection', alt: 'UTI, kidney', re: /\b(kidney|stone|uti|urin\w*|bladder|renal)\b/i, k: { Ve: 1, Ma: 0.5, Ke: 0.4 }, h: [7, 8], s: [6, 7], d: '', ex: false,
      tests: ['Urine routine and kidney function every year after 40 (earlier with BP or sugar)', 'Ultrasound if pain repeats'], doc: 'Urologist or nephrologist',
      avoid: ['Drinking too little water', 'Excess salt and packaged food', 'Painkillers without advice', 'Holding urine'],
      dos: ['2.5–3 litres of water a day (unless told otherwise)', 'Coconut water and fresh fruit', 'Good hygiene'], food: 'enough water, lemon water, vegetables; less salt and animal protein if stones', yoga: 'Baddha Konasana, Pawanmuktasana', alert: 'Blood in urine, severe side pain spreading to the groin, fever with burning urine: see a doctor today.' },
    { id: 'acidity', n: 'Acidity / gastritis', alt: 'gas, heartburn', re: /\b(acid\w*|gastri\w*|heartburn|reflux|gerd|ulcer)\b/i, k: { Ma: 1, Su: 0.7, Mo: 0.6 }, h: [5, 6], s: [3, 4], d: 'Pitta', ex: true,
      tests: ['See a doctor if it lasts more than 2 weeks; endoscopy only if advised'], doc: 'Gastroenterologist',
      avoid: ['Very spicy and oily food', 'Tea or coffee on an empty stomach', 'Late meals, skipping meals', 'Lying down right after eating', 'Painkillers without advice'],
      dos: ['Fixed meal times', 'Small, light dinner 3 hours before bed', 'Eat calmly, never while upset'], food: 'buttermilk, fennel after meals, coconut water, cucumber, rice; cooling food in summer', yoga: 'Vajrasana after meals, Shitali breathing', alert: 'Vomiting blood, black stools, severe upper abdominal pain: emergency.' },
    { id: 'ibs', n: 'IBS / bloating / weak digestion', alt: 'gut, bloating', re: /\b(ibs|bloat\w*|digest\w*|gut|loose motion|diarr\w*|gas)\b/i, k: { Me: 1, Ke: 0.6, Mo: 0.5, Ra: 0.4 }, h: [6], s: [5], d: 'Vata', ex: false,
      tests: ['Stool and blood tests if symptoms last 3 weeks', 'Food sensitivity check with the doctor'], doc: 'Gastroenterologist',
      avoid: ['Eating while working or on screens', 'Irregular meals', 'Cold, stale and very heavy food', 'Worry at mealtimes'],
      dos: ['Fixed meal times, chew slowly', 'Short relaxation before meals', 'Curd and fibre if they suit you', 'Food diary'], food: 'moong dal khichdi, cooked vegetables, curd if it suits, fennel and cumin water', yoga: 'Pawanmuktasana, Nadi Shodhana, Vajrasana', alert: 'Blood in stool, weight loss without trying, bowel change for more than 3 weeks: see a doctor.' },
    { id: 'piles', n: 'Constipation / piles', alt: 'fissure, colon', re: /\b(piles|haemorrhoid\w*|hemorrhoid\w*|fissure|constipat\w*)\b/i, k: { Sa: 1, Ma: 0.8 }, h: [8, 6], s: [7], d: 'Vata', ex: false,
      tests: ['See a doctor for any bleeding; colonoscopy only if advised'], doc: 'Surgeon or gastroenterologist',
      avoid: ['Low water and low fibre', 'Delaying the urge', 'Long sitting on the toilet with the phone', 'Very spicy food'],
      dos: ['High fibre: vegetables, fruit, whole grains', '2.5–3 litres of water', 'Daily walk', 'Warm water in the morning'], food: 'fibre-rich vegetables, papaya, soaked raisins, whole grains, black sesame in small amounts', yoga: 'Malasana, Pawanmuktasana, Ashwini mudra', alert: 'Bleeding from the rectum, severe pain, or change in bowel habit for weeks: see a doctor.' },
    { id: 'joints', n: 'Knee / joint pain, arthritis', alt: 'knees, joints', re: /\b(knee\w*|joint\w*|arthrit\w*|gout|uric)\b/i, k: { Sa: 1, Ma: 0.5, Su: 0.3 }, h: [10, 1], s: [9], d: 'Vata', ex: false,
      tests: ['Vitamin D and B12 yearly after 35', 'Uric acid if joints swell', 'X-ray only if advised; bone density after 50'], doc: 'Orthopaedic doctor and physiotherapist',
      avoid: ['Long squatting and climbing many stairs when painful', 'Extra body weight', 'Cold and damp on the joints', 'Ignoring pain for months'],
      dos: ['Thigh (quadriceps) strengthening 3 times a week', 'Warm compress in winter', 'Supportive footwear', 'Keep weight in range'], food: 'calcium (milk, sesame, ragi), sunlight for vitamin D, warm soups; less sour and cold food', yoga: 'Pawanmuktasana joint series, Tadasana', alert: 'Hot, red, swollen joint with fever, knee locking or giving way, bone pain at night: see a doctor.' },
    { id: 'back', n: 'Back pain / spine', alt: 'neck, spine', re: /\b(back ?pain|spine|spinal|slip disc|disc|cervical|lumbar|neck pain)\b/i, k: { Sa: 0.8, Su: 0.8, Ve: 0.4 }, h: [4, 5, 7], s: [4, 6], d: 'Vata', ex: false,
      tests: ['Vitamin D and B12', 'MRI only if the doctor advises'], doc: 'Orthopaedic doctor or physiotherapist',
      avoid: ['Slouching at desks and phones', 'Lifting heavy weights with a bent back', 'Soft sagging mattress', 'Long drives without breaks'],
      dos: ['Core-strengthening exercises', 'Break every 45 minutes of sitting', 'Correct desk height'], food: 'calcium and protein, warm food, enough water', yoga: 'Bhujangasana, Marjariasana (cat-cow), Makarasana', alert: 'Back pain with numbness in the legs or loss of bladder control: emergency.' },
    { id: 'sciatica', n: 'Hip pain / sciatica', alt: 'hips, sciatic', re: /\b(sciatic\w*|hip\w*|thigh)\b/i, k: { Ju: 0.8, Sa: 0.8 }, h: [9], s: [8], d: 'Vata', ex: false,
      tests: ['Doctor and physiotherapy review; MRI only if advised'], doc: 'Orthopaedic doctor', avoid: ['Long sitting', 'Sudden twisting and heavy lifting'], dos: ['Hip and hamstring stretches daily', 'Warm up before sport', 'Walk daily'], food: 'warm, nourishing food; anti-inflammatory turmeric', yoga: 'Supta Padangusthasana with a strap, Setu Bandhasana', alert: 'Leg weakness or loss of bladder control: emergency.' },
    { id: 'migraine', n: 'Migraine / headache', alt: 'headache', re: /\b(migraine|headache\w*|head ache|sinus)\b/i, k: { Su: 0.8, Ma: 0.8, Ra: 0.6, Me: 0.4 }, h: [1], s: [0], d: 'Pitta', ex: true,
      tests: ['Neurologist review; keep a headache diary'], doc: 'Neurologist',
      avoid: ['Skipped meals', 'Too much caffeine, late nights', 'Long screen time without breaks', 'Midday sun and heat'],
      dos: ['Meals every 4 hours', 'Fixed sleep time', 'Headache diary for triggers', 'Cooling food in summer'], food: 'regular meals, water, cooling foods (coconut water, cucumber, buttermilk)', yoga: 'Bhramari, Nadi Shodhana, Shavasana', alert: 'Worst-ever sudden headache, headache with fever and stiff neck, or with weakness or confusion: emergency.' },
    { id: 'anxiety', n: 'Anxiety / stress', alt: 'tension, panic', re: /\b(anxi\w*|stress\w*|tension|panic|worry|overthink\w*|nervous)\b/i, k: { Mo: 1, Me: 0.8, Ra: 0.8 }, h: [4, 1, 12], s: [3, 2], d: 'Vata', ex: false,
      tests: ['See a doctor or counsellor if it lasts more than 2 weeks or affects work'], doc: 'Psychiatrist or counsellor',
      avoid: ['Caffeine after noon', 'Screens an hour before bed', 'Keeping worries inside', 'Alcohol to relax'],
      dos: ['10 minutes of slow breathing twice a day', 'Daily walk outdoors', 'Talk to people you trust', 'Evening journal: one good thing, one worry, one plan'], food: 'warm regular meals, less caffeine and sugar', yoga: 'Bhramari, Nadi Shodhana, Yoga Nidra', alert: 'Panic with chest pain (heart must be checked) or thoughts of self-harm: Tele-MANAS 14416 (free, 24x7) or emergency.' },
    { id: 'depression', n: 'Low mood', alt: 'sadness, depression', re: /\b(depress\w*|low mood|sad\w*|hopeless\w*|lonely)\b/i, k: { Mo: 1, Sa: 0.8, Ke: 0.4 }, h: [4, 5], s: [3], d: '', ex: false,
      tests: ['See a doctor or counsellor if low mood lasts 2 weeks'], doc: 'Psychiatrist or counsellor',
      avoid: ['Isolation', 'Alcohol', 'Staying in bed all day'], dos: ['Morning sunlight and a walk', 'One small task daily', 'Time with people', 'Professional help early'], food: 'regular warm meals, enough protein', yoga: 'Surya Namaskar (gentle), Bhramari, Yoga Nidra', alert: 'Thoughts of self-harm: call Tele-MANAS 14416 (free, 24x7) or go to emergency now.' },
    { id: 'sleep', n: 'Insomnia / poor sleep', alt: 'sleep', re: /\b(sleep\w*|insomnia|neend|awake at night)\b/i, k: { Mo: 1, Ra: 0.6, Sa: 0.5 }, h: [12, 4], s: [11], d: 'Vata', ex: false,
      tests: ['Sleep specialist if it lasts over 3 months; CBT-I works well'], doc: 'Sleep specialist or physician',
      avoid: ['Screens after 10 pm', 'Caffeine after noon', 'Day naps over 20 minutes', 'Changing wake-up time'],
      dos: ['Same wake-up time daily', 'Dark, cool, quiet room', 'Warm milk or a calm routine before bed', 'Evening journal'], food: 'light early dinner, warm milk with nutmeg if it suits', yoga: 'Yoga Nidra in bed, Bhramari, left-nostril breathing', alert: 'Sleeplessness with low mood, or loud snoring with daytime sleepiness: see a doctor.' },
    { id: 'skin', n: 'Skin allergy / eczema', alt: 'rashes, itching', re: /\b(skin|rash\w*|eczema|itch\w*|psoria\w*|acne|hives)\b/i, k: { Me: 1, Ra: 0.8, Sa: 0.4, Ve: 0.3 }, h: [6, 1], s: [5, 9], d: 'Pitta', ex: true,
      tests: ['Dermatologist; patch testing for allergies'], doc: 'Dermatologist or allergist',
      avoid: ['Fragrances and harsh soaps', 'Scratching', 'Self-medicating with steroid creams', 'Very spicy food when flaring'],
      dos: ['Fragrance-free products', 'Moisturise daily', 'Cotton clothes', 'Product and food diary'], food: 'cooling, fresh home food; moong and green vegetables', yoga: 'Shitali breathing, Bhramari', alert: 'Rash with swelling of lips or tongue or breathing trouble: emergency.' },
    { id: 'asthma', n: 'Asthma / breathing', alt: 'cough, wheeze', re: /\b(asthma|breath\w*|wheez\w*|cough|bronch\w*|lungs?)\b/i, k: { Me: 1, Mo: 0.6, Sa: 0.5, Ra: 0.4 }, h: [3, 4], s: [2, 3], d: 'Kapha', ex: false,
      tests: ['Lung function test if advised; review every 6 months'], doc: 'Pulmonologist or physician',
      avoid: ['Smoke, dust and incense', 'Very cold drinks if prone', 'Running out of inhaler'], dos: ['Inhaler as prescribed', 'Steam when congested', 'Daily breathing practice'], food: 'warm food, ginger and turmeric, less cold dairy', yoga: 'Nadi Shodhana, Bhramari, Bhujangasana', alert: 'Breathlessness that does not settle with the inhaler, blue lips, or trouble speaking: emergency.' },
    { id: 'eyes', n: 'Eye problems', alt: 'vision, eye strain', re: /\b(eye\w*|vision|sight|cataract|glaucoma|spectacles)\b/i, k: { Su: 1, Mo: 0.8 }, h: [2, 12], s: [0, 1], d: 'Pitta', ex: false,
      tests: ['Eye check every 2 years (yearly after 40 or with diabetes)'], doc: 'Ophthalmologist', avoid: ['Screens without breaks', 'Reading in dim light', 'Rubbing the eyes'], dos: ['20-20-20 rule for screens', 'Sunglasses outdoors', 'Green leafy vegetables, carrots'], food: 'leafy greens, carrots, amla', yoga: 'Trataka (gentle, short), palming', alert: 'Sudden loss of vision, severe eye pain or flashes of light: emergency.' },
    { id: 'teeth', n: 'Teeth and gums', alt: 'dental', re: /\b(teeth|tooth|dental|gum\w*)\b/i, k: { Sa: 1, Me: 0.4, Mo: 0.3 }, h: [2], s: [1, 9], d: 'Vata', ex: false,
      tests: ['Dental check every 6 months'], doc: 'Dentist', avoid: ['Sugary snacks between meals', 'Tobacco', 'Skipping brushing at night'], dos: ['Brush twice, floss daily', 'Calcium-rich food'], food: 'calcium (milk, sesame, ragi), less sticky sweets', yoga: '—', alert: 'Swelling of the face with fever from a tooth: see a dentist today.' },
    { id: 'anaemia', n: 'Anaemia / low haemoglobin', alt: 'low Hb, weakness', re: /\b(anaemi\w*|anemi\w*|haemoglobin|hemoglobin|low hb|iron)\b/i, k: { Ma: 1, Mo: 0.6, Su: 0.4 }, h: [1, 8], s: [0, 7], d: '', ex: false,
      tests: ['CBC (blood count) and ferritin yearly; more often if low'], doc: 'Physician', avoid: ['Tea with meals (blocks iron)', 'Skipping meals'], dos: ['Iron-rich food with vitamin C', 'Iron tablets only as prescribed'], food: 'beetroot, pomegranate, leafy greens, dates, jaggery in moderation, toor dal', yoga: 'Gentle Surya Namaskar, Kapalbhati only if fit', alert: 'Breathlessness on slight effort, fainting or black stools: see a doctor.' },
    { id: 'infection', n: 'Frequent infections / fevers', alt: 'low immunity', re: /\b(infection\w*|fever\w*|immunit\w*|viral|typhoid|dengue|cold and cough)\b/i, k: { Ke: 1, Ma: 0.8, Mo: 0.3 }, h: [6, 8], s: [], d: 'Pitta', ex: false,
      tests: ['Blood tests during fever as the doctor advises', 'Vaccinations up to date'], doc: 'Physician', avoid: ['Stopping antibiotics midway', 'Street water and stale food', 'Self-medicating'], dos: ['Hand-washing', 'Clean water and fresh food', 'Finish every course of medicine', 'Rest during fever'], food: 'fresh home food, warm soups, enough water', yoga: 'Yoga Nidra and rest; light breathing when well', alert: 'Fever over 3 days, fever with stiff neck, rash, confusion or bleeding: see a doctor urgently.' },
    { id: 'allergy', n: 'Allergies', alt: 'food or dust allergy', re: /\b(allerg\w*|sneez\w*|dust)\b/i, k: { Ra: 1, Me: 0.5, Mo: 0.3 }, h: [6, 8, 1], s: [], d: '', ex: true,
      tests: ['Allergy testing with an allergist'], doc: 'Allergist', avoid: ['Known triggers', 'Self-medication', 'Processed food'], dos: ['Symptom and food diary', 'Keep the home dust-free', 'Carry prescribed medicine'], food: 'fresh home-cooked food; note reactions', yoga: 'Bhramari, Nadi Shodhana', alert: 'Swelling of face, lips or tongue or trouble breathing: emergency.' },
    { id: 'surgery', n: 'Surgery / operation', alt: 'planned procedure', re: /\b(surger\w*|operation|operat\w*|procedure|hospital\w*)\b/i, k: { Ma: 1, Ke: 1, Sa: 0.3 }, h: [8, 6, 12], s: [], d: '', ex: false,
      tests: ['Pre-operative tests as the surgeon advises'], doc: 'Your surgeon', avoid: ['Delaying urgent surgery for a muhurta', 'Herbs or fasting before surgery without the surgeon'], dos: ['Choose the date only inside the surgeon\'s window (use Treatment dates)', 'Follow the recovery plan exactly', 'Walk as soon as allowed'], food: 'as the hospital advises; light nourishing food in recovery', yoga: 'Breathing and Yoga Nidra in recovery; poses only after clearance', alert: 'After surgery: fever, wound redness, severe pain or bleeding: contact the surgeon at once.' }
  ];

  function wsum(o) { return Object.keys(o).reduce(function (a, k) { return a + o[k]; }, 0); }
  function link(k, L, pr) {
    var pl = k.P[L], hs = J.lordsOf(k.ascSign, L).concat([pl.house]), s = 0, why = [];
    if (L === 'Ra' || L === 'Ke') { var disp = J.RULER[pl.sign]; hs = hs.concat(J.lordsOf(k.ascSign, disp)); }
    if (pr.k[L]) { s += pr.k[L] * 1.2; why.push(PN[L] + ' is a karaka of this problem'); }
    var hh = uniq(hs).filter(function (h) { return pr.h.indexOf(h) >= 0; }); if (hh.length) { s += 1; why.push(PN[L] + ' rules or sits in the ' + hh.map(nth).join('/') + ' house'); }
    var dus = J.lordsOf(k.ascSign, L).filter(function (h) { return [6, 8, 12].indexOf(h) >= 0; }), touchK = Object.keys(pr.k).some(function (x) { return x !== L && k.P[x] && (k.P[x].sign === pl.sign || J.aspectedHouses(L, pl.house).indexOf(k.P[x].house) >= 0); });
    if (dus.length && (hh.length || touchK) && J.lordsOf(k.ascSign, L).indexOf(1) < 0) { s += 0.8; why.push(PN[L] + ' (' + dus.map(nth).join('/') + ' lord) touches it'); }
    if (pr.s.indexOf(pl.sign) >= 0) { s += 0.4; why.push(PN[L] + ' is in ' + SG[pl.sign]); }
    return { s: s, why: why };
  }
  function lordGood(k, st, L) { return (L === 'Ju' || J.lordsOf(k.ascSign, L).some(function (h) { return [1, 5, 9].indexOf(h) >= 0; })) && /strong|average/.test(st[L].state) && J.lordsOf(k.ascSign, L).every(function (h) { return [6, 8, 12].indexOf(h) < 0 || h === 1; }); }

  function analyze(c, R, id, now) {
    var pr = P.filter(function (x) { return x.id === id; })[0]; if (!pr) return null;
    now = now || new Date();
    var k = c.k, A = k.ascSign, st = R.st, layers = { sign: [], house: [], karaka: [] }, prot = [], score = 0;
    /* karaka layer */
    Object.keys(pr.k).forEach(function (x) {
      var s = st[x], w = pr.k[x], v = s.state === 'afflicted' ? 2 : s.state === 'weak' ? 1.2 : s.state === 'average' ? 0.3 : 0;
      if (pr.ex && s.dir === 'more') v += 0.8;
      if (x !== 'Ra' && x !== 'Ke' && (/Debilitated|Enemy/.test(MA.signDignity(x, MA.d6(k.P[x].lon))) || /Debilitated|Enemy/.test(MA.signDignity(x, J.varga(k.P[x].lon, 30).sign))) && v > 0) { v += 0.4; layers.karaka.push(PN[x] + ' is also weak in D6/D30'); }
      if (v >= 0.8) layers.karaka.push(PN[x] + ' (karaka) is ' + s.state + (s.why.length ? ': ' + s.why.join(', ') : '') + (pr.ex && s.dir === 'more' ? ' and leans to excess' : ''));
      if (s.prot) prot.push('Jupiter protects ' + PN[x]);
      score += v * w;
    });
    /* house layer */
    pr.h.forEach(function (h) {
      var occ = MA.inHouse(k, h).filter(function (x) { return MAL.indexOf(x) >= 0 && st[x].state !== 'strong'; }), asp = MA.aspectsOn(k, h).filter(function (x) { return (x === 'Sa' || x === 'Ma') && st[x].state !== 'strong' && occ.indexOf(x) < 0; }), lord = J.lordOfHouse(A, h), lh = k.P[lord].house, sign = (A + h - 1) % 12, sav = c.av ? c.av.sav[sign] : 28, v = 0, w = [];
      if (occ.length) { v += occ.length; w.push(occ.map(function (x) { return PN[x]; }).join(', ') + ' sits in it'); }
      if (asp.length) { v += 0.5 * asp.length; w.push(asp.map(function (x) { return PN[x]; }).join(', ') + ' aspects it'); }
      if ([6, 8, 12].indexOf(lh) >= 0 && [6, 8, 12].indexOf(h) < 0) { v += 0.7; w.push('its lord ' + PN[lord] + ' is in the ' + nth(lh)); }
      if (sav < 25) { v += 0.5; w.push('only ' + sav + ' Ashtakavarga points'); }
      if (MA.jupOnHouse(k, h)) { v -= 0.7; prot.push('Jupiter guards the ' + nth(h) + ' house'); }
      if (v >= 0.7) layers.house.push(nth(h) + ' house (' + MA.HOUSE_BODY[h - 1].split(',')[0] + '): ' + w.join('; '));
      score += Math.max(0, v) * 0.8;
    });
    /* sign layer (Kalapurusha) */
    pr.s.forEach(function (sg) {
      var hs = J.houseFrom(A, sg), occ = MA.inHouse(k, hs).filter(function (x) { return MAL.indexOf(x) >= 0 && st[x].state !== 'strong'; }), lord = J.RULER[sg], v = 0, w = [];
      if (occ.length) { v += 0.8 * occ.length; w.push(occ.map(function (x) { return PN[x]; }).join(', ') + ' in it'); }
      if (st[lord].state === 'afflicted') { v += 0.5; w.push('its lord ' + PN[lord] + ' is afflicted'); }
      if (v > 0) layers.sign.push(SG[sg] + ' (body sign for ' + MA.SIGN_BODY[sg].split(',')[0] + '): ' + w.join('; '));
      score += v;
    });
    var dm = pr.d && R.dosha.main === pr.d; if (dm) score += 0.7;
    var nL = ['sign', 'house', 'karaka'].filter(function (x) { return layers[x].length; }).length;
    var norm2 = score / Math.max(1.5, wsum(pr.k));
    var tend = nL >= 3 && norm2 >= 1.8 ? 'Strong tendency' : nL >= 2 && norm2 >= 1.4 ? 'Moderate tendency' : nL >= 1 && norm2 >= 0.6 ? 'Mild tendency' : 'Low tendency';
    var tq = /Strong/.test(tend) ? 'b' : /Moderate/.test(tend) ? 'm' : 'g';
    /* timing: running dasha */
    var ch = J.dashaChain(c.maha, now, 3), runL = ch.map(function (d, i) { var l = link(k, d.lord, pr); return { lvl: i, lord: d.lord, start: d.start, end: d.end, s: l.s, why: l.why }; });
    var dashaHit = runL[0].s * 0.8 + (runL[1] ? runL[1].s * 1.2 : 0) + (runL[2] ? runL[2].s * 0.5 : 0);
    /* timing: transits now and ahead (Saturn, Rahu, Ketu, Mars, Jupiter over problem houses, signs and karakas) */
    var sensH = pr.h.slice(), karSigns = Object.keys(pr.k).map(function (x) { return k.P[x].sign; });
    function trHit(code, lon) {
      var sg = Math.floor(norm(lon) / 30), h = J.houseFrom(A, sg), why = [];
      if (sensH.indexOf(h) >= 0) why.push('your ' + nth(h) + ' house');
      if (pr.s.indexOf(sg) >= 0) why.push(SG[sg] + ', the body sign');
      var kk = Object.keys(pr.k).filter(function (x) { return k.P[x].sign === sg; }); if (kk.length) why.push('natal ' + kk.map(function (x) { return PN[x]; }).join(', '));
      var asp = code === 'Ju' || code === 'Sa' || code === 'Ma' ? J.aspectedHouses(code, h).filter(function (x) { return sensH.indexOf(x) >= 0; }) : []; if (asp.length && !why.length) why.push('aspecting your ' + asp.map(nth).join('/') + ' house');
      return { sg: sg, h: h, why: why };
    }
    var trNow = [];
    ['Sa', 'Ra', 'Ke', 'Ma', 'Ju'].forEach(function (x) { var t = trHit(x, C.sidereal(x, now)); if (t.why.length) trNow.push({ p: x, good: x === 'Ju', t: PN[x] + ' is now over ' + t.why.join(' and ') + (x === 'Ju' ? ': protection and a good time to treat it.' : ': this problem is more sensitive while it stays there.') }); });
    var saM = J.houseFrom(k.P.Mo.sign, Math.floor(norm(C.sidereal('Sa', now)) / 30)); if ([12, 1, 2, 8].indexOf(saM) >= 0 && /mind|sleep|anxiety|depression|bp|heart|joints/.test(pr.id + ' ')) trNow.push({ p: 'Sa', good: false, t: (saM === 8 ? 'Ashtama Shani' : 'Sade Sati') + ' is running (Saturn ' + nth(saM) + ' from the Moon): extra fatigue and strain; keep the routine strict.' });
    var trBad = trNow.filter(function (x) { return !x.good; }).length, trGood = trNow.some(function (x) { return x.good; });
    var agree = trNow.some(function (x) { return !x.good && runL.slice(0, 2).some(function (r) { return r.lord === x.p; }); });
    var nowScore = dashaHit + trBad * 0.8 - (trGood ? 0.6 : 0) + (agree ? 1 : 0);
    var tw = /Strong|Moderate/.test(tend), nowWord = (nowScore >= 3.2 && tw) || (agree && tw) ? 'Active now' : nowScore >= 2.2 || (nowScore >= 1.5 && tw) ? 'Watch now' : 'Quiet now';
    /* upcoming transit entries in the next 24 months */
    var ahead = [], prev = {};
    for (var d = 0; d <= 730; d += 7) {
      var t = new Date(now.getTime() + d * DAY);
      ['Sa', 'Ra', 'Ju', 'Ma'].forEach(function (x) {
        var hit = trHit(x, C.sidereal(x, t)), key = hit.why.length ? hit.sg : -1;
        if (d > 0 && prev[x] !== undefined && key !== prev[x]) {
          if (key >= 0 && (x !== 'Ma' || hit.why.length >= 2)) ahead.push({ at: t, p: x, good: x === 'Ju', t: 'From about ' + my(t) + ': ' + PN[x] + ' moves over ' + hit.why.join(' and ') + (x === 'Ju' ? ' — a healing window, good to start treatment or a new routine.' : x === 'Ma' ? ' for a few weeks — avoid strain and heat.' : ' — keep closer watch and get tests early.') });
          else if (key < 0 && prev[x] >= 0 && x !== 'Ma') ahead.push({ at: t, p: x, good: x !== 'Ju', t: 'From about ' + my(t) + ': ' + PN[x] + ' leaves that area' + (x === 'Ju' ? '; its protection ends.' : '; pressure on this problem eases.') });
        }
        prev[x] = key;
      });
    }
    /* dasha periods in the next 10 years */
    var per = [];
    J.dashas(c.birth, k.P.Mo.lon).forEach(function (m) {
      if (m.end < now || m.start > new Date(now.getTime() + 10 * 365.25 * DAY)) return;
      var lm = link(k, m.lord, pr);
      J.subPeriods(m).forEach(function (a) {
        if (a.end < now || a.start > new Date(now.getTime() + 10 * 365.25 * DAY)) return;
        var la = link(k, a.lord, pr), s = lm.s * 0.8 + la.s * 1.2, good = !la.s && lordGood(k, st, a.lord);
        per.push({ md: m.lord, ad: a.lord, start: a.start < now ? now : a.start, end: a.end, s: s, why: uniq(lm.why.concat(la.why)).slice(0, 3), good: good, now: a.start <= now && a.end >= now });
      });
    });
    var sens = per.filter(function (x) { return x.s >= 2.6; }).sort(function (a, b) { return a.start - b.start; }).slice(0, 5);
    var easy = per.filter(function (x) { return x.good; }).sort(function (a, b) { return a.start - b.start; }).slice(0, 3);
    /* plan: remedies for karakas and running dasha lords, by mode */
    var karOrder = Object.keys(pr.k).sort(function (a, b) { return pr.k[b] - pr.k[a]; });
    var remP = uniq([karOrder[0]].concat(runL.slice(0, 2).filter(function (r) { return r.s > 0; }).map(function (r) { return r.lord; })).concat(karOrder.slice(1).filter(function (x) { return /weak|afflicted/.test(st[x].state); }))).slice(0, 3);
    var rem = remP.map(function (x) {
      var m = MA.modeOf(k, x, st[x]), d = MA.PL[x], acts = [];
      acts.push('Mantra: ' + d.mantra + ' — 108 times (one mala) daily' + (m.mode === 'pacify' ? ', especially ' + d.day + 's' : '') + ', for at least 40 days.');
      if (m.mode === 'strengthen') acts.push('Food: ' + d.foods + ' on ' + d.day + 's (within your medical diet).');
      if (m.mode === 'pacify') acts.push('Daan every ' + d.day + ': ' + d.daan + '. Seva: ' + d.seva + '.');
      acts.push('Yoga: ' + d.yoga + '.');
      if (m.mode !== 'pacify') acts.push('Wear ' + d.colour + ' on ' + d.day + 's.');
      return { code: x, mode: m.mode, role: m.role.t, why: pr.k[x] ? 'karaka of ' + pr.n.toLowerCase() : 'running dasha lord linked to it', acts: acts, gem: m.gemOk ? d.gem + ' may help, only after a full chart check and a lab certificate.' : m.mode === 'pacify' ? 'Never its gemstone (' + d.gem + ').' : 'No gemstone needed; mantra is enough.' };
    });
    var dosha = pr.d ? (R.dosha.main === pr.d ? 'Your ' + R.dosha.type + ' body type leans the same way as this problem (' + pr.d + '), so lifestyle matters a lot: ' + MA.DOSHA[pr.d].care + '.' : 'Your body type is ' + R.dosha.type + '; this problem is ' + pr.d + '-type, so treat it without over-correcting your base: ' + MA.DOSHA[pr.d].care + '.') : '';
    var bestMonths = R.calendar.filter(function (m) { return [3, 6, 11].indexOf(m.hm) >= 0; }).map(function (m) { return my(m.from); }).slice(0, 3);
    return { pr: pr, tend: tend, tq: tq, layers: layers, nL: nL, prot: uniq(prot), score: Math.round(norm2 * 10) / 10, dosha: dosha, recovery: R.lagna,
      nowWord: nowWord, nowQ: nowWord === 'Active now' ? 'b' : nowWord === 'Watch now' ? 'm' : 'g', runL: runL, trNow: trNow, agree: agree, ahead: ahead.slice(0, 4), sens: sens, easy: easy, rem: rem, bestMonths: bestMonths };
  }
  function rank(c, R, opt) {
    return P.filter(function (p) { return !(p.fem && opt.gender !== 'F') && !(p.adult && opt.age < 16) && p.id !== 'surgery'; }).map(function (p) { var a = analyze(c, R, p.id, opt.now); return { id: p.id, n: p.n, tend: a.tend, tq: a.tq, now: a.nowWord, nq: a.nowQ, score: a.score + (a.nowWord === 'Active now' ? 0.6 : a.nowWord === 'Watch now' ? 0.3 : 0) }; }).sort(function (a, b) { return b.score - a.score; });
  }
  function find(q) { return P.filter(function (p) { return p.re.test(q); }); }
  function text(a, name) {
    var L = ['HEALTH PROBLEM CASE FILE: ' + a.pr.n + ' for ' + name];
    L.push('Chart: ' + a.tend + ' (' + a.nL + ' of 3 layers agree). ' + ['sign', 'house', 'karaka'].map(function (x) { return a.layers[x].length ? x.toUpperCase() + ': ' + a.layers[x].join('; ') : ''; }).filter(Boolean).join(' | ') + (a.prot.length ? ' Protection: ' + a.prot.join('; ') + '.' : '') + ' Recovery power ' + a.recovery.score + '/5. ' + a.dosha);
    L.push('NOW: ' + a.nowWord + '. Dasha: ' + a.runL.map(function (r) { return ['MD', 'AD', 'PD'][r.lvl] + ' ' + PN[r.lord] + ' to ' + dmy(r.end) + (r.why.length ? ' (' + r.why.join('; ') + ')' : ' (not linked)'); }).join(', ') + '. Transits: ' + (a.trNow.map(function (t) { return t.t; }).join(' ') || 'none on this area') + (a.agree ? ' Dasha and transit agree: take it seriously.' : ''));
    if (a.sens.length) L.push('MORE SENSITIVE PERIODS (next 10 years): ' + a.sens.map(function (s) { return PN[s.md] + '–' + PN[s.ad] + ' ' + dmy(s.start) + ' to ' + dmy(s.end) + ' (' + s.why.join('; ') + ')'; }).join(' | '));
    if (a.easy.length) L.push('EASIER PERIODS, good for treatment and recovery: ' + a.easy.map(function (s) { return PN[s.md] + '–' + PN[s.ad] + ' ' + dmy(s.start) + ' to ' + dmy(s.end); }).join(' | '));
    if (a.ahead.length) L.push('TRANSIT CHANGES AHEAD: ' + a.ahead.map(function (x) { return x.t; }).join(' '));
    L.push('PLAN: doctor ' + a.pr.doc + '; tests: ' + a.pr.tests.join('; ') + '. Avoid: ' + a.pr.avoid.join('; ') + '. Do: ' + a.pr.dos.join('; ') + '. Food: ' + a.pr.food + '. Yoga: ' + a.pr.yoga + '. Remedies: ' + a.rem.map(function (r) { return PN[r.code] + ' (' + r.mode + ', ' + r.why + '): ' + r.acts.join(' ') + ' ' + r.gem; }).join(' || ') + ' Doctor alert: ' + a.pr.alert);
    return L.join('\n');
  }
  return { P: P, analyze: analyze, rank: rank, find: find, text: text };
}
