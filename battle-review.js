'use strict';
const BattleReview=(()=>{
// Read-only explanations of canonical receipts and recorded round events.
// This module does not resolve combat, grant rewards, or change a save.
const object = value => !!value && typeof value === 'object' && !Array.isArray(value);
const count = value => Number.isSafeInteger(value) && value >= 0;
const damage = value => Number.isFinite(value) && value >= 0 && value <= Number.MAX_SAFE_INTEGER;
const METRICS = ['shieldArrowDamage', 'shieldArrowHits', 'shieldOtherRangedDamage', 'shieldOtherRangedHits',
  'spearCavalryDamage', 'spearCavalryHits', 'cavalrySpearDamage', 'cavalrySpearHits',
  'cavalryArcherDamage', 'cavalryArcherHits', 'archerDamage', 'archerHits',
  'gateDamage', 'gateHits', 'machineGateDamage', 'machineGateHits', 'towerDamage', 'towerHits'];
const number = value => new Intl.NumberFormat('zh-CN', {maximumFractionDigits: 2}).format(value);

/** Plain JSON data owned by a practice session, never by canonical game state. */
function createRoundEvidence() {
  return {version: 1, rounds: [], incompleteRounds: [],
    totals: Object.fromEntries(METRICS.map(key => [key, 0])),
    gate: {maxHp: null, lastHp: null, brokenRound: null}};
}

/** Accumulate a real resolved round once. Recoil duplicates its strike and is excluded.
 * Pass {battle} after the round to record an observed gate transition. */
function collectRoundEvidence(summary, accumulator, {battle = null} = {}) {
  if (!object(accumulator) || accumulator.version !== 1 || !Array.isArray(accumulator.rounds) ||
      !Array.isArray(accumulator.incompleteRounds) || !object(accumulator.totals) || !object(accumulator.gate))
    throw new TypeError('Use createRoundEvidence() for the evidence accumulator');
  if (!object(summary) || !count(summary.round) || summary.round < 1 || summary.round > 30 || !Array.isArray(summary.events))
    return accumulator;
  if (accumulator.rounds.includes(summary.round)) return accumulator;
  const totals = accumulator.totals;
  let incomplete = false;
  const add = (metric, amount) => {
    const next = totals[metric] + amount;
    if (damage(totals[metric]) && damage(next)) totals[metric] = next;
    else incomplete = true;
  };
  for (const event of summary.events) {
    if (!object(event)) { incomplete = true; continue; }
    if (event.type === 'move' || event.type === 'recoil') continue;
    if (!['strike', 'tower', 'gate'].includes(event.type) || !['player', 'enemy'].includes(event.side) ||
        typeof event.unit !== 'string' || typeof event.target !== 'string' || !damage(event.damage) ||
        !count(event.killed) || typeof event.ranged !== 'boolean' || typeof event.counter !== 'boolean') {
      incomplete = true; continue;
    }
    if (event.type === 'gate') {
      if (event.side !== 'player' || event.target !== 'gate') { incomplete = true; continue; }
      add('gateDamage', event.damage); add('gateHits', 1);
      if (['ram', 'catapult'].includes(event.unit)) {
        add('machineGateDamage', event.damage); add('machineGateHits', 1);
      }
      continue;
    }
    if (event.type === 'tower') {
      if (event.side === 'enemy' && event.unit === 'tower') {
        add('towerDamage', event.damage); add('towerHits', 1);
      } else incomplete = true;
      continue;
    }
    if (event.side === 'enemy' && event.target === 'shield' && event.unit === 'archer') {
      add('shieldArrowDamage', event.damage); add('shieldArrowHits', 1);
    } else if (event.side === 'enemy' && event.target === 'shield' && event.ranged) {
      add('shieldOtherRangedDamage', event.damage); add('shieldOtherRangedHits', 1);
    }
    if (event.side === 'player' && event.unit === 'spear' && event.target === 'cavalry') {
      add('spearCavalryDamage', event.damage); add('spearCavalryHits', 1);
    }
    if (event.side === 'enemy' && event.unit === 'cavalry' && event.target === 'spear') {
      add('cavalrySpearDamage', event.damage); add('cavalrySpearHits', 1);
    }
    if (event.side === 'enemy' && event.unit === 'cavalry' && event.target === 'archer') {
      add('cavalryArcherDamage', event.damage); add('cavalryArcherHits', 1);
    }
    if (event.side === 'player' && event.unit === 'archer') {
      add('archerDamage', event.damage); add('archerHits', 1);
    }
  }
  accumulator.rounds.push(summary.round);
  accumulator.rounds.sort((a, b) => a - b);
  if (incomplete) accumulator.incompleteRounds.push(summary.round);
  const gate = object(battle?.gate) ? battle.gate : null;
  if (battle?.round === summary.round && gate && damage(gate.hp) && damage(gate.maxHp) && gate.maxHp > 0) {
    accumulator.gate.maxHp = gate.maxHp;
    accumulator.gate.lastHp = gate.hp;
    // Only a complete prefix of actual rounds can identify the break round.
    // An already-broken gate first seen after a gap is not a measured duration.
    if (gate.hp === 0 && accumulator.gate.brokenRound === null && !incomplete &&
        accumulator.incompleteRounds.length === 0 && accumulator.rounds.length === summary.round &&
        accumulator.rounds.every((round, index) => round === index + 1) && totals.gateDamage >= gate.maxHp)
      accumulator.gate.brokenRound = summary.round;
  }
  return accumulator;
}

const armyCount = (army, id) => object(army) && (!Object.hasOwn(army, id) || count(army[id])) ? army[id] || 0 : null;
function machineReceipt(report, battle, practice) {
  if (['lost', 'wounded', 'back'].every(key => object(report[key]))) {
    const values = ['ram', 'catapult'].map(id => ({id, lost: armyCount(report.lost, id),
      wounded: armyCount(report.wounded, id), alive: armyCount(report.back, id)}));
    if (values.some(row => Object.values(row).some(value => value === null))) return null;
    return {deployed: values.reduce((sum, row) => sum + row.lost + row.wounded + row.alive, 0),
      lost: values.reduce((sum, row) => sum + row.lost, 0), wounded: values.reduce((sum, row) => sum + row.wounded, 0),
      alive: values.reduce((sum, row) => sum + row.alive, 0), practice: !!practice};
  }
  if (!practice || !Array.isArray(battle?.player)) return null;
  const rows = battle.player.filter(row => object(row) && ['ram', 'catapult'].includes(row.id));
  if (!rows.length || rows.some(row => !count(row.initial) || !damage(row.hp) || !damage(row.stats?.hp) || row.stats.hp <= 0)) return null;
  const deployed = rows.reduce((sum, row) => sum + row.initial, 0);
  const alive = rows.reduce((sum, row) => sum + Math.ceil(row.hp / row.stats.hp), 0);
  return alive <= deployed ? {deployed, alive, practice: true} : null;
}

/** The report is a receipt, not a reconstructed simulation. Evidence is optional.
 * Formal DTOs omit evidence. Only a practice service supplies an accumulator. */
function battleReview(report = {}, {battle = null, evidence = null, practice = false} = {}) {
  report = object(report) ? report : {};
  battle = object(battle) ? battle : null;
  const result = {title: '本战关键原因', scope: '战报结算凭据；整场交锋数据未记录', findings: [], actions: []};
  const finding = (label, text, kind = 'evidence') => result.findings.push({label, text, kind});
  const rounds = count(report.round) ? report.round : count(battle?.round) ? battle.round : null;
  const failure = object(report.failure) ? report.failure : null;
  const failureNames = {retreat: '主动撤军后结束', army: '我军已无可战部队', gate: '城防仍未攻破',
    enemy: '尚有守军存活', gate_and_enemy: '城防未破且仍有守军存活'};
  if (failure) {
    finding('结算原因', failureNames[failure.reason] || '战报没有可识别的失败原因', 'result');
    if (count(failure.gateHp) && failure.gateHp > 0)
      finding('未破城防', `结束时城防耐久剩余 ${number(failure.gateHp)}。`);
    if (count(failure.enemyRemaining) && failure.enemyRemaining > 0)
      finding('守军仍在', `结束时剩余守军 ${number(failure.enemyRemaining)} 人。`);
    if (failure.outOfRange === true)
      finding('射程空等', '结束时仍有我军坚守队伍，其射程内没有存活敌军。', 'warning');
  } else if (typeof report.won === 'boolean') {
    finding('结算结果', (report.won ? '本战获胜' : '本战未获胜') + (rounds === null ? '。' : `，共 ${rounds} 回合。`), 'result');
  }
  const machines = machineReceipt(report, battle, practice);
  if (machines?.deployed > 0) {
    const text = `冲车与投石车出征 ${number(machines.deployed)} 架，战场幸存 ${number(machines.alive)} 架`;
    const simulated = count(machines.lost) && count(machines.wounded) ?
      `演练模拟损失 ${number(machines.lost)} 架、模拟伤兵 ${number(machines.wounded)} 架` :
      `演练中离场 ${number(machines.deployed - machines.alive)} 架，尚无正式伤兵判定`;
    finding('器械存活', machines.practice ? text + `；${simulated}。不改变正式军队或伤兵。` :
      text + `；永久损失 ${number(machines.lost)} 架，伤兵 ${number(machines.wounded)} 架。`);
  }
  const challenge = object(report.warOrder?.challenge) ? report.warOrder.challenge : null;
  if (challenge && count(challenge.machineGateAttacks) &&
      (challenge.machineGateAttacks > 0 || count(challenge.machines) && challenge.machines > 0)) {
    finding('挑战凭据', `器械实际攻击门墙 ${number(challenge.machineGateAttacks)} 次；战术条件` +
      (challenge.met === true ? '已达成。' : '未达成。') + '这是战报中的挑战判定，不能归因于单一指令。');
  } else if (count(battle?.machineGateAttacks) && battle.machineGateAttacks > 0) {
    finding('破门参与', `本场器械实际攻击门墙 ${number(battle.machineGateAttacks)} 次。`);
  }

  let measured = null;
  let full = false;
  let prefix = false;
  if (practice && object(evidence) && evidence.version === 1 && Array.isArray(evidence.rounds) &&
      Array.isArray(evidence.incompleteRounds) && object(evidence.totals) &&
      METRICS.every(key => damage(evidence.totals[key]))) {
    measured = evidence;
    prefix = rounds !== null && rounds > 0 && evidence.incompleteRounds.length === 0 &&
      evidence.rounds.length === rounds && evidence.rounds.every((round, index) => round === index + 1);
    full = prefix && (battle?.finished === true || !battle && typeof report.won === 'boolean');
    result.scope = full ? `演练第 1–${rounds} 回合的完整实际事件；不含反事实估算` :
      prefix ? `演练第 1–${rounds} 回合的实际事件（战斗仍在进行）；不含反事实估算` :
      `演练已记录 ${evidence.rounds.length} 轮${evidence.incompleteRounds.length ? '（部分事件不完整）' : ''}；不能当作整场总计`;
  } else if (!report.shared && battle && object(battle.currentRoundSummary) &&
      battle.currentRoundSummary.round === battle.round && battle.round > 0) {
    measured = collectRoundEvidence(battle.currentRoundSummary, createRoundEvidence(), {battle});
    result.scope = `战报结算凭据＋第 ${battle.round} 回合实际记录（仅末轮）；整场交锋数据未记录`;
  }
  if (measured && measured.rounds.length) {
    const t = measured.totals;
    const scope = full ? '整场' : prefix ? '截至本回合' : practice ? '已记录范围' : '末回合';
    finding('盾阵承箭', t.shieldArrowHits ? `${scope}敌弓命中我军刀盾 ${number(t.shieldArrowHits)} 次，实际伤害 ${number(t.shieldArrowDamage)}。这是承受的伤害，不是免去的伤害。` :
      `${scope}没有记录到敌弓命中我军刀盾，不能据此声称盾阵承担了箭矢。`);
    if (t.shieldOtherRangedHits)
      finding('其他远程', `${scope}刀盾承受其他远程实际伤害 ${number(t.shieldOtherRangedDamage)}，${number(t.shieldOtherRangedHits)} 次命中。`);
    finding('枪骑交锋', `${scope}我军长枪命中敌轻骑 ${number(t.spearCavalryHits)} 次、伤害 ${number(t.spearCavalryDamage)}；敌轻骑命中我军枪阵 ${number(t.cavalrySpearHits)} 次、伤害 ${number(t.cavalrySpearDamage)}（均含反击）。这不是自动拦截次数。`);
    if (t.cavalryArcherHits)
      finding('弓阵遇骑', `${scope}敌轻骑命中我军弓队 ${number(t.cavalryArcherHits)} 次，实际伤害 ${number(t.cavalryArcherDamage)}。`, 'warning');
    if (t.archerHits)
      finding('弓队输出', `${scope}我军弓队命中 ${number(t.archerHits)} 次，实际输出 ${number(t.archerDamage)}。`);
    if (t.gateHits)
      finding('门墙受击', `${scope}门墙实际承受伤害 ${number(t.gateDamage)}；其中器械攻击 ${number(t.machineGateHits)} 次、伤害 ${number(t.machineGateDamage)}。`);
    if (t.towerHits)
      finding('箭楼威胁', `${scope}箭楼命中我军 ${number(t.towerHits)} 次，实际伤害 ${number(t.towerDamage)}。`);
    if (prefix && count(measured.gate?.brokenRound) && measured.gate.brokenRound > 0)
      finding('破门耗时', `完整记录确认城防耐久在第 ${measured.gate.brokenRound} 回合归零。`);
    else if (battle?.gate && battle.gate.hp === 0)
      finding('破门范围', '已观察到城防耐久归零；现有证据不足以确认精确破门回合。', 'gap');
  } else {
    finding('记录边界', practice && battle?.round === 0 ?
      '尚未结算演练回合；行动后显示实际交锋证据。' :
      '未保存整场逐回合攻击事件：盾阵受箭伤害、枪骑交锋次数与精确破门回合均不能补算。', 'gap');
  }
  finding('盾与箭 · 规则', '弓箭兵攻击刀盾兵时伤害系数为 0.5；床弩与投石不享受这一专属减伤。坚守本身没有额外减伤。', 'rule');
  finding('枪与骑 · 规则', '长枪兵攻击轻骑兵时伤害系数为 1.6；不包含重骑。枪兵是否先接敌，要看实际站位和攻击目标。', 'rule');
  finding('门墙 · 规则', '器械进入射程并实际攻击才参与破门；破门后城防掩护解除、箭楼停止射击。', 'rule');
  result.actions = [
    {label: '盾护推进：刀盾向前，弓队保持后排；观察敌弓实际命中谁。'},
    {label: '枪护弓：枪兵推进、弓兵坚守，形成前后位置；重骑需单独评估。'},
    {label: '护械破门：让冲车或投石进入射程，关注门墙耐久、箭楼与器械存活。'},
  ];
  return result;
}

return {createRoundEvidence,collectRoundEvidence,battleReview};})();
