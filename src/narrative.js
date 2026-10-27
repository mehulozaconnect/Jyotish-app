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
  var OPEN = { g: ['This is a favourable period for you.', 'This should turn out to be a prosperous period for you.', 'This is a supportive time for you.'], m: ['This is a mixed period for you.', 'This period brings both gains and challenges.', 'Results in this period are mixed.'], b: ['This period needs care.', 'This is a testing period for you.', 'Go steady during this period.'] };
  var IDX = { Su: 0, Mo: 1, Ma: 2, Me: 0, Ju: 1, Ve: 2, Sa: 0, Ra: 1, Ke: 2 };
  function pick(a, n) { return a[n % a.length]; }
  /* tone: 'g' | 'm' | 'b'; strong: true/false/null (natal strength); until: optional end date text */
  function para(code, house, tone, opt) {
    opt = opt || {}; var i = IDX[code] + house, s = [];
    s.push(pick(OPEN[tone], i));
    if (tone === 'g') { s.push(pick(H[house].g, i)); s.push(pick(H[house].g, i + 1)); s.push(P[code][0]); }
    else if (tone === 'b') { s.push(pick(H[house].b, i)); s.push(pick(H[house].b, i + 1)); s.push(P[code][1]); }
    else { s.push(pick(H[house].g, i)); s.push(pick(H[house].b, i + 1)); s.push(P[code][tone === 'm' && opt.lean === 'b' ? 1 : 0]); }
    if (opt.strong === true) s.push('Because ' + J.PNAME[code] + ' is strong in your birth chart, the good results come more fully.');
    if (opt.strong === false) s.push('Since ' + J.PNAME[code] + ' is weak in your birth chart, results are milder and need extra effort.');
    if (opt.extra) s.push(opt.extra);
    if (tone !== 'g') s.push('Remedy: ' + P[code][2]);
    if (opt.until) s.push(opt.until);
    return s.join(' ');
  }
  return { para: para, H: H, P: P };
})();
if (typeof module !== 'undefined') module.exports = NARR;
