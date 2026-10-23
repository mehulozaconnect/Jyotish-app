/* Trikaal plain-language layer: everyday words for houses, planets and outcomes, for readers who know no astrology. */
var PLAIN = (function () {
  var AREA = [null, 'body, health & confidence', 'money in hand, family & speech', 'effort, courage, siblings & short trips', 'home, mother, property & peace of mind',
    'children, studies, ideas & investments', 'illness, loans, rivals & daily work', 'spouse, business partners & clients', 'sudden events, chronic illness & hidden matters',
    'luck, father, mentors & long travel', 'career, status & reputation', 'income, gains & friends', 'expenses, losses, sleep & foreign lands'];
  var AREA_SHORT = [null, 'health', 'money & family', 'efforts & siblings', 'home & peace of mind', 'children & investments', 'illness & debts',
    'marriage & partners', 'sudden events', 'luck & father', 'career', 'income & gains', 'expenses & sleep'];
  var PLANET = { Su: 'authority, father, government and vitality', Mo: 'mind, mother, emotions and sleep', Ma: 'energy, courage, property, blood and accidents', Me: 'communication, business, nerves and skin',
    Ju: 'wisdom, children, wealth and the liver', Ve: 'marriage, comforts, vehicles and kidneys', Sa: 'hard work, delays, discipline, bones and joints', Ra: 'ambition, confusion, foreign lands and sudden ups and downs', Ke: 'detachment, spirituality, sudden cuts and mysterious illness' };
  var NATURE = { yogakaraka: 'your best planet: it brings success and support', benefic: 'a helpful planet', neutral: 'neither a big helper nor a troublemaker', malefic: 'a difficult planet: it creates problems in the areas it touches', mixed: 'a planet of mixed results', node: 'a shadow planet: it gives the results of the sign and planets it is linked to' };
  var NATURE_SHORT = { yogakaraka: 'your best planet', benefic: 'helpful for you', neutral: 'neutral for you', malefic: 'difficult for you', mixed: 'mixed for you', node: 'a shadow planet' };
  var EFFECT = {
    Su: { good: 'support from seniors and government; confidence up', mixed: 'ego clashes possible; stay humble', bad: 'friction with seniors, low energy, body heat' },
    Mo: { good: 'calm mind; people support you', mixed: 'mood swings', bad: 'worry and poor sleep' },
    Ma: { good: 'energy and wins; act boldly', mixed: 'energy, but impatience', bad: 'anger, accidents, cuts and acidity' },
    Me: { good: 'talks, deals and paperwork go well', mixed: 'mix-ups in talks or documents', bad: 'miscommunication and errors in papers' },
    Ju: { good: 'growth, blessings and good advice', mixed: 'growth, but with spending', bad: 'expenses, worry, wrong advice' },
    Ve: { good: 'comfort, love and good purchases', mixed: 'comfort, but overspending', bad: 'relationship friction and overspending' },
    Sa: { good: 'hard work pays; steady gains', mixed: 'slow progress', bad: 'delays, tiredness and pressure' },
    Ra: { good: 'bold moves succeed; foreign or tech gains', mixed: 'restless and unclear', bad: 'confusion, false promises and anxiety' },
    Ke: { good: 'insight and inner strength', mixed: 'detached, low interest', bad: 'sudden cuts, confusion, small health niggles' } };
  var DO = { Su: 'meet seniors and government officers', Mo: 'spend time with family and rest well', Ma: 'start physical or property work; compete', Me: 'negotiate, sign, sell and write', Ju: 'start important work; take expert advice', Ve: 'buy, celebrate and improve relationships', Sa: 'push long-term work with discipline', Ra: 'take calculated bold moves', Ke: 'meditate, research and finish pending work' };
  var AVOID = { Su: 'ego clashes with your boss or father', Mo: 'emotional decisions late at night', Ma: 'arguments, rash driving, sharp tools and fried food', Me: 'signing anything without reading it twice', Ju: 'lending money and over-promising', Ve: 'luxury spending and flirting', Sa: 'big risky bets and skipping sleep', Ra: 'shortcuts, unknown people and speculation', Ke: 'decisions taken in confusion; ignoring small symptoms' };
  var HEALTH = [null, ['Head & overall energy', 'sleep 7 hours, take morning sunlight and walk; yearly full-body check-up'], ['Face, eyes, teeth & throat', 'eye and dental check-ups; avoid very cold or very spicy food'],
    ['Shoulders, arms & breathing', 'daily pranayama; avoid strain on shoulders'], ['Chest, heart & lungs', 'check BP and cholesterol; pranayama; no smoking'], ['Stomach, liver & sugar', 'regular meals, less sugar and oil; check liver and sugar levels'],
    ['Digestion & immunity', 'light, timely meals; no fried food; drink enough water'], ['Kidneys & lower back', 'drink enough water; kidney and urine tests; core exercises'], ['Chronic & hidden problems', 'do not ignore small symptoms; regular check-ups'],
    ['Hips, thighs & liver', 'stretching and walking; watch weight and fat intake'], ['Knees, joints & bones', 'calcium and vitamin D; knee-friendly exercise'], ['Calves, ankles & circulation', 'walk daily; avoid standing too long'], ['Feet, sleep & eyes', 'fixed sleep routine; foot care; less screen time at night']];
  /* how the houses read for a health or accident event */
  var EVH = { 1: 'your body', 6: 'illness and injury', 8: 'sudden or serious trouble', 12: 'hospital stays', 5: 'recovery', 11: 'relief' };
  var MATTER = {
    job: { q: 'Will the job or promotion happen?', yes: 'Yes, it is likely.', mixed: 'Yes, but with delay or extra effort.', no: 'Not right now. The chart does not support it at present.', go: 'Apply and push for it in the dates above.', wait: 'Keep working on skills; try again in the better period above.' },
    business: { q: 'Will the deal or contract succeed?', yes: 'Yes, the deal is likely to go through.', mixed: 'Likely, but with delay, changes or negotiation.', no: 'Unlikely as it stands. Expect it to stall or fall through.', go: 'Close it in the dates above.', wait: 'Do not depend on it; keep other options open.' },
    money: { q: 'Will the money come?', yes: 'Yes, money gain is shown.', mixed: 'Yes, but slowly or in parts.', no: 'Not now. Expect delays or a smaller amount.', go: 'Follow up firmly in the dates above.', wait: 'Avoid fresh risk until the better period.' },
    marriage: { q: 'Will the marriage happen?', yes: 'Yes, marriage is shown.', mixed: 'Yes, but with delay or obstacles from family or circumstances.', no: 'Not clearly shown right now.', go: 'Fix the dates within the period above.', wait: 'Be patient; the better period is above.' },
    property: { q: 'Will the property purchase happen?', yes: 'Yes, the purchase is likely.', mixed: 'Likely, but with paperwork or money delays.', no: 'Not now. The deal may not complete.', go: 'Register in the period above.', wait: 'Check documents carefully; wait for the better period.' },
    vehicle: { q: 'Will the vehicle purchase happen?', yes: 'Yes, you will buy it.', mixed: 'Yes, after some delay.', no: 'Not now.', go: 'Buy in the period above, on a good muhurat day.', wait: 'Wait for the period above.' },
    foreign: { q: 'Will the foreign travel or move happen?', yes: 'Yes, foreign travel is shown.', mixed: 'Yes, but with visa or timing delays.', no: 'Not now. Expect hurdles.', go: 'Apply in the period above.', wait: 'Prepare documents; try in the better period.' },
    child: { q: 'Will there be a child?', yes: 'Yes, childbirth is shown.', mixed: 'Yes, with some delay; medical help may be needed.', no: 'Not clearly shown right now; consult a doctor.', go: 'The period above is the most likely.', wait: 'Keep up medical guidance; the better period is above.' },
    study: { q: 'Will the exam or admission succeed?', yes: 'Yes, success is shown.', mixed: 'Yes, but it needs extra effort.', no: 'Difficult this time.', go: 'Results favour the period above.', wait: 'Prepare well; the next attempt in the period above is better.' },
    health: { q: 'Will the illness be cured?', yes: 'Yes, recovery is shown.', mixed: 'Recovery will come, but slowly, with ups and downs.', no: 'Not a quick recovery. The illness may drag on.', go: 'Clear improvement is expected in the dates above.', wait: 'Continue treatment and consider a second medical opinion.' },
    legal: { q: 'Will I win the case or dispute?', yes: 'Yes, the result favours you.', mixed: 'Partly in your favour, or a compromise.', no: 'The result is unlikely to favour you now.', go: 'Push the matter in the dates above.', wait: 'Try to settle; avoid escalating now.' } };
  function list(a) { a = a.filter(Boolean); return a.length <= 1 ? (a[0] || '') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
  function areas(houses, short) { var a = houses.map(function (h) { return (short ? AREA_SHORT : AREA)[h]; }); return short ? list(a) : a.join(' and your '); }
  /* what each house means for a specific question (KP) */
  var QH = {
    job: { 2: 'income', 6: 'getting the job', 10: 'career rise', 11: 'the wish being fulfilled', 1: 'things staying as they are', 5: 'loss of the job', 9: 'obstacles to the job' },
    business: { 2: 'money', 7: 'the other party agreeing', 10: 'business', 11: 'success', 5: 'the deal breaking', 8: 'obstacles', 12: 'loss' },
    money: { 2: 'money coming in', 6: 'getting your dues', 11: 'gain', 5: 'loss', 8: 'obstacles', 12: 'expenses' },
    marriage: { 2: 'the family growing', 7: 'marriage', 11: 'the wish being fulfilled', 1: 'staying single', 6: 'separation', 10: 'obstacles' },
    property: { 4: 'getting the property', 11: 'gain', 12: 'spending on it', 3: 'paperwork trouble', 10: 'obstacles' },
    vehicle: { 4: 'getting the vehicle', 11: 'gain', 12: 'spending on it', 3: 'paperwork trouble', 10: 'obstacles' },
    foreign: { 3: 'short travel', 9: 'long travel', 12: 'living abroad', 2: 'staying with family', 4: 'staying at home', 11: 'gains at home' },
    child: { 2: 'the family growing', 5: 'childbirth', 11: 'the wish being fulfilled', 1: 'obstacles', 4: 'obstacles', 10: 'obstacles' },
    study: { 4: 'education', 9: 'higher studies', 11: 'success', 3: 'a break in studies', 8: 'obstacles', 12: 'failure' },
    health: { 1: 'your body recovering', 5: 'the illness ending', 11: 'relief from it', 6: 'the illness continuing', 8: 'complications', 12: 'hospital stay' },
    legal: { 1: 'you', 6: 'winning over the opponent', 11: 'success', 5: 'losing', 7: 'the opponent', 12: 'loss' } };
  return { EVH: EVH, QH: QH, AREA: AREA, AREA_SHORT: AREA_SHORT, PLANET: PLANET, NATURE: NATURE, NATURE_SHORT: NATURE_SHORT, EFFECT: EFFECT, DO: DO, AVOID: AVOID, HEALTH: HEALTH, MATTER: MATTER, list: list, areas: areas };
})();
if (typeof module !== 'undefined') module.exports = PLAIN;
