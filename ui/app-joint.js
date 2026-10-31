/* Trikaal: joint readings — when a question is about another saved person (spouse, child, parent, partner), Claude gets that chart too */
var JOINT_RE = /\b(wife|husband|spouse|partner|married|marriage|we|us|our|relationship|compatib\w*|understanding|fight\w*|divorce|separat\w*|in-?laws?|patni|pati|biwi)\b/i;
function jointPeople(p, q) {
  var out = [], hist = (DB.chats[p.id] || []).filter(function (m) { return m.role === 'me'; }).slice(-3).map(function (m) { return m.text; }).join(' ') + ' ' + q;
  DB.people.forEach(function (x) { if (x.id === p.id) return; var fn = x.name.split(' ')[0]; if (fn.length > 2 && new RegExp('\\b' + fn.replace(/[^A-Za-z]/g, '') + '\\b', 'i').test(hist)) out.push(x.id); });
  if (p.spouse && JOINT_RE.test(q + ' ' + hist)) out.push(p.spouse);
  ((U.aiWith || {})[p.id] || []).forEach(function (id) { out.push(id); });
  return out.filter(function (id, i) { return out.indexOf(id) === i && person(id); }).slice(0, 2).map(person);
}
function jointText(p, o, q) {
  var c2 = calcP(o), rel = p.spouse === o.id ? 'spouse / partner' : 'related person', t = 'SECOND CHART — ' + o.name + ' (' + rel + ' of ' + p.name + '), born ' + birthLine(o) + '\n' + fixedFacts(o, c2);
  if (p.spouse === o.id || (JOINT_RE.test(q || '') && o.gender !== p.gender)) {
    try {
      var boy = p.gender === 'F' ? o : p, girl = p.gender === 'F' ? p : o, M = MIL.match(boy, girl), V = MIL.verdict(M);
      t += 'KUNDLI MILAN (' + boy.name + ' boy, ' + girl.name + ' girl): ' + M.tot + '/36, ' + V.t + '. ' + M.R.map(function (r) { return r.n + ' ' + r.s + '/' + r.max + (r.s < r.max * 0.5 ? ' (weak: ' + r.b + ')' : ''); }).join('; ') + '. Mangal dosha: ' + boy.name.split(' ')[0] + ' ' + M.mb.t + ', ' + girl.name.split(' ')[0] + ' ' + M.mg.t + '. Marriage in ' + boy.name.split(' ')[0] + "'s chart: " + M.ob.good.concat(M.ob.bad).join('; ') + '. ' + M.ob.tim + ' Marriage in ' + girl.name.split(' ')[0] + "'s chart: " + M.og.good.concat(M.og.bad).join('; ') + '. ' + M.og.tim + '\n';
    } catch (e) { }
  }
  return t;
}
(function () {
  var ag = askGemini;
  askGemini = function (p, c, q, onLive) {
    var js = jointPeople(p, q); if (!js.length) return ag(p, c, q, onLive);
    var q0 = String(q).split('\n\n')[0], relq = js.some(function (o) { return o.id === p.spouse; }) && JOINT_RE.test(q0) && !/relationship|marri|spouse|wife|husband/i.test(q0);
    return ag(p, c, (relq ? q0 + ' (relationship question)' + String(q).slice(q0.length) : q) + '\n\n' + js.map(function (o) { return jointText(p, o, q); }).join('\n') + '\nYou HAVE the chart(s) above: use BOTH charts. For a relationship question judge each person: 7th house and its lord, Venus (and Jupiter for the wife\'s chart), the Moon (emotional nature and how each reacts), Mercury (how each communicates), and both running dashas with dates; use the Kundli Milan weak points to explain where friction comes from. Then give practical steps for each person separately and joint remedies. Never say you do not have the other chart.', onLive);
  };
  var a0 = AiV2;
  AiV2 = function () {
    var h = a0(), p = curP(); if (!p) return h;
    var withIds = ((U.aiWith || {})[p.id] || []).filter(person), auto = p.spouse && person(p.spouse) ? person(p.spouse) : null;
    var chips = '<div class="jrow"><span>👥</span>' + (auto ? '<span class="jchip auto">' + esc(auto.name.split(' ')[0]) + ' · spouse</span>' : '') + withIds.map(function (id) { return '<button class="jchip" data-act="jDel" data-id="' + id + '">With ' + esc(person(id).name.split(' ')[0]) + ' ✕</button>'; }).join('') + '<button class="jadd" data-act="jAdd">+ Add another chart</button></div>';
    var i = h.indexOf('<div class="pad">'); return i < 0 ? h : h.slice(0, i + 17) + chips + h.slice(i + 17);
  };
})();
ACT.jAdd = function () {
  var p = curP(), others = DB.people.filter(function (x) { return x.id !== p.id; });
  if (!others.length) return toast('Add the other person\'s kundli first');
  sheet('<div class="pad"><h3 style="font:600 18px var(--sans);margin:4px 0 4px">Use another chart in answers</h3><p class="sm mut" style="margin-bottom:10px">Claude will read both charts together, e.g. for marriage, a child or a business partner.</p>' + others.map(function (x) { return '<button class="prow" data-act="jPick" data-id="' + x.id + '"><span class="av" style="background:' + avColor(x.id) + '">' + initials(x.name) + '</span><div><b>' + esc(x.name) + '</b><small>' + esc(birthLine(x)) + '</small></div></button>'; }).join('') + (p.spouse ? '' : '<p class="note">Tip: set a spouse in Edit kundli, and relationship questions will use both charts automatically.</p>') + '</div>');
};
ACT.jPick = function (el) { var p = curP(); U.aiWith = U.aiWith || {}; var L = U.aiWith[p.id] = U.aiWith[p.id] || []; if (L.indexOf(el.dataset.id) < 0) L.push(el.dataset.id); closeSheet(); setTimeout(rerender, 20); };
ACT.jDel = function (el) { var p = curP(); U.aiWith[p.id] = (U.aiWith[p.id] || []).filter(function (x) { return x !== el.dataset.id; }); rerender(true); };
