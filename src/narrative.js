/* Trikaal: narrative engine. Turns (planet, house, tone, strength) into a readable prediction paragraph. */
var NARR = (function () {
  var H = {
    1: { g: ['Your confidence and energy rise, and people notice you.', 'Health stays good, and new things you start now tend to succeed.', 'It is a good time to take charge of personal goals and improve your image.'],
      b: ['You may feel tired, restless or short-tempered, and small health issues can bother you.', 'Self-doubt or friction with others can slow you down.', 'Avoid over-committing; rest and a steady routine keep you balanced.'] },
    2: { g: ['Money comes in more easily and savings grow.', 'Family life is warm, and there may be a celebration or gathering at home.', 'Your words carry weight, which helps in negotiations.'],
      b: ['Family expenses or unexpected bills can strain your savings.', 'Watch your words; harsh speech can hurt family relations.', 'Take care of eyes, teeth and throat, and go easy on rich food.'] },
    3: { g: ['Your courage and initiative bring results; effort put in now pays off.', 'Short trips, communication, writing and networking go well.', 'Siblings, neighbours and colleagues are supportive.'],
      b: ['Efforts may not bring quick results, and you may feel restless.', 'Misunderstandings with siblings or colleagues are possible.', 'Avoid hasty decisions and unnecessary short travel.'] },
    4: { g: ['Peace and comfort at home increase; buying a house, vehicle or household items is favoured.', 'Your mother is supportive and her health stays good.', 'You feel emotionally settled and content.'],
      b: ['Peace at home can be disturbed, with worries about property, vehicle or your mother\'s health.', 'You may feel mentally unsettled.', 'Postpone property deals and keep vehicle papers in order.'] },
    5: { g: ['Your intelligence and creativity shine; studies, exams and new ideas go well.', 'Children bring happiness and good news.', 'Romance blossoms, and carefully chosen long-term investments can pay off.'],
      b: ['Judgment may be clouded, so avoid speculation and risky investments.', 'There may be concern about children\'s health or studies.', 'Stress can affect your mood and concentration.'] },
    6: { g: ['You overcome competitors and obstacles; disputes and litigation tend to go your way.', 'Health improves and old problems come under control.', 'A good time to clear loans and work hard on routine tasks.'],
      b: ['Health needs attention, especially digestion and immunity.', 'Opponents, debts or workplace politics can trouble you.', 'Do not lend money, and avoid arguments at work.'] },
    7: { g: ['Married life and partnerships are harmonious; a good time for marriage talks, deals and contracts.', 'Business partners and clients support you.', 'Work-related travel brings benefit.'],
      b: ['Misunderstandings with your spouse or partners are likely; patience is needed.', 'Read contracts and deals carefully before signing.', 'Your partner\'s health may need attention.'] },
    8: { g: ['Sudden gains, inheritance or insurance money are possible.', 'Interest in research, spirituality or hidden knowledge grows.', 'Long-pending issues may resolve unexpectedly.'],
      b: ['Unexpected obstacles, delays or sudden expenses can arise.', 'Drive carefully and avoid risky activities; health needs care.', 'Keep important matters private and avoid conflicts.'] },
    9: { g: ['Luck favours you, and help comes from elders, teachers and influential people.', 'Long journeys, pilgrimages and higher studies go well.', 'Your father\'s support and blessings are strong.'],
      b: ['Luck may seem slow, and plans may need more effort than expected.', 'Your father\'s health or relations with mentors need care.', 'Avoid arguments over beliefs; patience brings results.'] },
    10: { g: ['Your career rises: recognition, promotion or a new responsibility is likely.', 'Seniors and authorities favour you.', 'A good time to launch projects and take the lead at work.'],
      b: ['Work pressure rises and recognition may be delayed.', 'Conflicts with seniors or changes at work are possible.', 'Stay disciplined and avoid hasty job changes.'] },
    11: { g: ['Income and gains increase, and wishes are fulfilled.', 'Friends and your network bring opportunities.', 'A very good time for profits and recovering pending payments.'],
      b: ['Gains come with delay, and friends may disappoint.', 'Elder siblings may need your support.', 'Do not expect quick profits; stay patient.'] },
    12: { g: ['Spending goes on good causes, travel or comforts; foreign connections may help.', 'A good time for rest, meditation and spiritual practice.', 'Charity done now brings peace of mind.'],
      b: ['Expenses rise and money can slip away; budget carefully.', 'Sleep may be disturbed, and you may feel isolated.', 'Avoid risky investments and guard against loss or theft.'] } };
  var P = {
    Su: ['The Sun gives authority, confidence and support from government and seniors.', 'The Sun can bring ego clashes, heat-related health issues and friction with your father or boss.', 'Offer water to the rising Sun.'],
    Mo: ['The Moon brings emotional comfort, public support and pleasant surprises.', 'The Moon can make the mind restless and moods changeable.', 'Offer water or milk on a Shivling on Mondays.'],
    Ma: ['Mars gives energy, courage and the drive to win, especially in property and competition.', 'Mars can bring anger, accidents, cuts or quarrels; stay calm and careful.', 'Read Hanuman Chalisa on Tuesdays.'],
    Me: ['Mercury sharpens the mind and favours business, communication and deals.', 'Mercury can bring miscommunication, nervous strain and errors in paperwork.', 'Offer durva to Ganesha on Wednesdays.'],
    Ju: ['Jupiter brings wisdom, growth, blessings and protection.', 'Jupiter\'s support is weaker now, so growth is slower; avoid overconfidence.', 'Apply a turmeric tilak and respect teachers on Thursdays.'],
    Ve: ['Venus brings comfort, romance, beauty, vehicles and a pleasant social life.', 'Venus can lead to overspending on pleasures and strain in relationships.', 'Light a ghee lamp for Goddess Lakshmi on Fridays.'],
    Sa: ['Saturn rewards steady, honest hard work with lasting results.', 'Saturn brings delays, heavier responsibilities and fatigue; patience and discipline are key.', 'Light a mustard-oil lamp under a peepal tree on Saturdays.'],
    Ra: ['Rahu brings ambition, sudden opportunities and gains through technology or foreign links.', 'Rahu can bring confusion, anxiety and temptations; double-check before trusting people.', 'Chant Om Rahave Namah and feed the needy.'],
    Ke: ['Ketu sharpens intuition and brings success in research, healing and spiritual pursuits.', 'Ketu can bring detachment, sudden events and hard-to-explain health issues.', 'Feed dogs and chant Om Ketave Namah.'] };
  /* life-stage versions: child (0-12) and teen (13-18) replace adult topics (spouse, career, money) */
  var CH = {
    1: ['The child is healthy, active and confident.', 'Health needs watching: frequent colds, fevers or small injuries; keep a regular routine and good sleep.'],
    2: ['Speech develops well, the child eats well and the family is supportive.', 'Watch eating habits, teeth and eyes; stress at home affects the child.'],
    3: ['Courage, sports, hobbies and communication grow; good bond with siblings and friends.', 'The child can be restless or quarrel with siblings; channel the energy into sports.'],
    4: ['Learning at school goes well, home is happy and the bond with the mother is strong.', 'A change of home or school can unsettle the child; extra time and attention help.'],
    5: ['Intelligence and memory shine; good for studies, arts and creativity.', 'Concentration can dip; keep studies regular and limit screen time.'],
    6: ['Strong immunity and a competitive spirit; does well in tests and games.', 'Prone to infections, stomach upsets or tiffs with classmates; keep food simple and hygiene good.'],
    7: ['Makes good friends and gets along well with others.', 'Friendships can be unsettled; teach sharing and patience.'],
    8: ['Curious and intuitive, and recovers quickly from setbacks.', 'Sudden fevers or minor accidents are possible; supervise play and travel.'],
    9: ['Blessed by father, teachers and elders; good values and luck.', 'The father may be busy or away; encourage respect for teachers.'],
    10: ['Disciplined and responsible; teachers notice the child.', 'Pressure from studies or discipline issues; praise effort, not just marks.'],
    11: ['Wishes come true; makes friends and wins prizes.', 'May feel left out by other children; encourage group activities.'],
    12: ['Sleeps well; calm, imaginative and sensitive.', 'Sleep or appetite may be disturbed; keep a calm bedtime routine.'] };
  var TN = {
    1: ['Confidence and good health; a strong phase for personal growth.', 'Mood swings, low energy or self-doubt; sleep and exercise help.'],
    2: ['The family supports studies; good speech and steady habits.', 'Watch diet, eyes and harsh words at home.'],
    3: ['Good for sports, competitions, writing and making friends.', 'Restlessness; avoid risky stunts and the wrong company.'],
    4: ['Studies go well, home is stable and school results are good.', 'Home or school changes unsettle concentration; parental support is key.'],
    5: ['Excellent for exams, entrance tests and creative skills.', 'Distractions, crushes or screen time can hurt studies; keep a timetable.'],
    6: ['Beats the competition in exams and sports; strong health.', 'Stress, stomach or skin issues and conflicts with classmates; keep a routine.'],
    7: ['Good friendships and teamwork.', 'Peer pressure or friendship trouble; guide gently.'],
    8: ['Deep interest in science, research or the unusual.', 'Sudden setbacks, accidents or hidden stress; take care with vehicles and travel.'],
    9: ['Teachers and father guide well; good for higher-study plans and study travel.', 'Disagreements with father or teachers; avoid rebellion.'],
    10: ['Ambition develops; a good time to choose a stream or career direction.', 'Pressure over results; avoid comparison and focus on effort.'],
    11: ['Wins prizes, scholarships and recognition; a good circle of friends.', 'Expectations are not met on time; patience helps.'],
    12: ['Good for study away from home, hostel or foreign education.', 'Expenses, poor sleep or loneliness; stay connected with family.'] };
  var SN = {
    3: ['Good energy for short trips, hobbies and staying active.', 'Low stamina; keep trips short and rest well.'],
    5: ['Joy from children and grandchildren.', 'Worry about children or grandchildren.'],
    7: ['Warm companionship with your spouse.', 'Your spouse\'s health or mood needs care.'],
    10: ['Respect and an honoured role; advisory work suits you.', 'Changes in role or retirement adjustments; stay active.'],
    11: ['Gains, pension or support arrive smoothly; good friends around.', 'Delays in dues or support; keep papers in order.'] };
  var PC = { Su: ['The Sun gives confidence and good health.', 'The Sun can bring fevers, eye trouble or friction with the father.'], Mo: ['The Moon keeps the mind calm and the bond with the mother strong.', 'The Moon can bring mood swings, colds or disturbed sleep.'], Ma: ['Mars gives energy, courage and love for sports.', 'Mars can bring cuts, falls, fevers or anger; supervise play.'], Me: ['Mercury makes the child quick, talkative and good at learning.', 'Mercury can bring speech, skin or concentration issues.'], Ju: ['Jupiter brings wisdom, good values and protection.', 'Jupiter\'s protection is weaker; guide studies and values closely.'], Ve: ['Venus brings charm, creativity and comfort.', 'Venus can bring sweet cravings and a liking for comfort over effort.'], Sa: ['Saturn builds discipline and patience.', 'Saturn can bring delays, fatigue, bone or tooth issues; be patient.'], Ra: ['Rahu brings curiosity and quick learning, especially with technology.', 'Rahu can bring fears, allergies or too much screen time.'], Ke: ['Ketu brings intuition and a calm, inward nature.', 'Ketu can bring sudden fevers or a withdrawn mood.'] };
  function stage(age) { return age == null ? 'adult' : age < 13 ? 'child' : age < 19 ? 'teen' : age >= 60 ? 'senior' : 'adult'; }
  var STAGE_TIP = { child: 'At this age: focus on health, routine, nutrition, play and basic learning; parents can do the remedy on the child\'s behalf.', teen: 'At this age: focus on studies, sports, good company and sleep.', senior: 'At this age: focus on health, routine, family time and spiritual practice.' };
  var AREA_STAGE = { child: { 1: 'health and confidence', 2: 'family, food and speech', 3: 'courage, hobbies and siblings', 4: 'mother, home and schooling', 5: 'studies and intelligence', 6: 'immunity and competitions', 7: 'friendships', 8: 'sudden health matters', 9: 'father, teachers and luck', 10: 'discipline and achievement', 11: 'friends and rewards', 12: 'sleep and rest' },
    teen: { 1: 'health and confidence', 2: 'family and habits', 3: 'sports, skills and friends', 4: 'home and schooling', 5: 'studies and exams', 6: 'competition and health', 7: 'friendships', 8: 'sudden setbacks', 9: 'teachers, father and higher studies', 10: 'career direction', 11: 'prizes and friends', 12: 'study away from home' } };
  function areaWord(h, age, adult) { var st = stage(age); return AREA_STAGE[st] ? AREA_STAGE[st][h] : adult; }
  var OPEN = { g: ['This is a favourable period for you.', 'This should turn out to be a prosperous period for you.', 'This is a supportive time for you.'], m: ['This is a mixed period for you.', 'This period brings both gains and challenges.', 'Results in this period are mixed.'], b: ['This period needs care.', 'This is a testing period for you.', 'Go steady during this period.'] };
  var IDX = { Su: 0, Mo: 1, Ma: 2, Me: 0, Ju: 1, Ve: 2, Sa: 0, Ra: 1, Ke: 2 };
  function pick(a, n) { return a[n % a.length]; }
  /* tone: 'g' | 'm' | 'b'; strong: true/false/null (natal strength); until: optional end date text */
  function para(code, house, tone, opt) {
    opt = opt || {}; var st = stage(opt.age);
    if (st === 'child' || st === 'teen') {
      var M = st === 'child' ? CH : TN, x = M[house], s2 = [pick(OPEN[tone], IDX[code] + house).replace(' for you', st === 'child' ? ' for the child' : '')];
      if (tone === 'g') { s2.push(x[0]); s2.push('Still, watch: ' + x[1].charAt(0).toLowerCase() + x[1].slice(1)); } else if (tone === 'b') s2.push(x[1]); else s2.push(x[0], x[1].charAt(0).toUpperCase() + x[1].slice(1));
      s2.push(PC[code][tone === 'b' || (tone === 'm' && opt.lean === 'b') ? 1 : 0]);
      if (opt.strong === true) s2.push('Because ' + J.PNAME[code] + ' is strong in the birth chart, the good results come more fully.');
      if (opt.strong === false) s2.push('Since ' + J.PNAME[code] + ' is weak in the birth chart, give extra care in this area.');
      if (opt.extraKid) s2.push(opt.extraKid);
      s2.push(STAGE_TIP[st]);
      if (tone !== 'g') s2.push('Remedy: ' + P[code][2]);
      if (opt.until) s2.push(opt.until);
      return s2.join(' ');
    }
    var HX = H[house]; if (st === 'senior' && SN[house]) HX = { g: [SN[house][0]].concat(H[house].g.slice(1)), b: [SN[house][1]].concat(H[house].b.slice(1)) };
    var i = IDX[code] + house, s = [];
    s.push(pick(OPEN[tone], i));
    if (tone === 'g') { s.push(pick(HX.g, i)); s.push(pick(HX.g, i + 1)); s.push(P[code][0]); var cw = pick(HX.b, i + 2); s.push('Still, be careful: ' + cw.charAt(0).toLowerCase() + cw.slice(1)); }
    else if (tone === 'b') { s.push(pick(HX.b, i)); s.push(pick(HX.b, i + 1)); s.push(P[code][1]); }
    else { s.push(pick(HX.g, i)); s.push(pick(HX.b, i + 1)); s.push(P[code][tone === 'm' && opt.lean === 'b' ? 1 : 0]); }
    if (opt.strong === true) s.push('Because ' + J.PNAME[code] + ' is strong in your birth chart, the good results come more fully.');
    if (opt.strong === false) s.push('Since ' + J.PNAME[code] + ' is weak in your birth chart, results are milder and need extra effort.');
    if (opt.extra) s.push(opt.extra);
    if (st === 'senior') s.push(STAGE_TIP.senior);
    if (tone !== 'g') s.push('Remedy: ' + P[code][2]);
    if (opt.until) s.push(opt.until);
    return s.join(' ');
  }
  return { para: para, H: H, P: P, CH: CH, TN: TN, stage: stage, areaWord: areaWord, STAGE_TIP: STAGE_TIP };
})();
if (typeof module !== 'undefined') module.exports = NARR;
