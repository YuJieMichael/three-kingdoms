'use strict';
const WebPlanning=(()=>{
const copy=value=>JSON.parse(JSON.stringify(value));
const Scouting=(()=>{


const object = value => !!value && typeof value === 'object' && !Array.isArray(value);
const integer = value => Number.isSafeInteger(value) && value >= 0;
const precisions = ['failed', 'types', 'bands', 'exact'];
const point = value => ({x: value?.x ?? 32, y: value?.y ?? 32});
const visible = (game, node) => !!node && (node.id === 'home' || game.landmarkVisible(node.id));
const blank = () => ({precision: 'unknown', at: null, expiresAt: null, army: {}, bands: {}, types: [],
  success: null, lost: null, survivors: null, legacy: false, public: false});
const army = (game, value) => object(value) ? Object.fromEntries(Object.entries(value)
  .filter(([id, count]) => Object.hasOwn(game.units, id) && integer(count))) : {};

/** Current-city modern intelligence plus the canonical global legacy fallback. */
function intelView(game, node, now = game.state.last, {shared = false} = {}) {
  const result = blank();
  if (!visible(game, node) || node.id === 'home') return result;
  const canonical = game.intel(node.id);
  if (canonical?.public) return {...result, precision: 'public', public: true, success: true,
    army: army(game, node.army), types: Object.keys(army(game, node.army)).filter(id => node.army[id] > 0)};
  if (shared) return result;
  const report = game.state.scoutIntel?.[node.id];
  if (object(report) && report.success === true && report.expiresAt > now &&
      integer(report.quality) && report.quality >= 1 && report.quality <= 3) {
    const precision = precisions[report.quality];
    const types = Array.isArray(report.types) ? report.types.filter(id => Object.hasOwn(game.units, id)) : [];
    const bands = precision === 'bands' && object(report.bands) ? Object.fromEntries(types.flatMap(id => {
      const band = report.bands[id];
      return object(band) && integer(band.min) && integer(band.max) && band.max >= band.min ?
        [[id, {min: band.min, max: band.max}]] : [];
    })) : {};
    return {...result, precision, at: report.at, expiresAt: report.expiresAt, success: true,
      lost: integer(report.lost) ? report.lost : null, survivors: integer(report.survivors) ? report.survivors : null,
      types: [...new Set(types)], bands, army: precision === 'exact' ? army(game, report.army) : {}};
  }
  // The canonical old scouted table is global, with no source-city evidence.
  // Keep its legitimate fallback after a failed modern scout, without inventing modern precision or numbers.
  const legacy = game.state.scouted?.[node.id];
  const legacyExpiry = object(legacy) && integer(legacy.at) && integer(legacy.level) ?
    legacy.at + (15 + legacy.level * 5) * 60000 : null;
  if (legacyExpiry !== null && legacyExpiry > now) return {...result, precision: 'legacy', legacy: true,
    at: legacy.at, expiresAt: legacyExpiry};
  if (object(report)) return {...result, precision: report.expiresAt <= now ? 'expired' : 'failed',
    at: integer(report.at) ? report.at : null, expiresAt: integer(report.expiresAt) ? report.expiresAt : null,
    success: typeof report.success === 'boolean' ? report.success : null,
    lost: integer(report.lost) ? report.lost : null, survivors: integer(report.survivors) ? report.survivors : null};
  if (legacyExpiry !== null) return {...result, precision: 'expired', legacy: true,
    at: legacy.at, expiresAt: legacyExpiry};
  return result;
}

/** Selected-city reports, source-unknown legacy entries, and already-public chapter targets. */
function scoutingView(game, now = game.state.last, {shared = false} = {}) {
  const supported = !shared && typeof game.scoutQuote === 'function';
  if (!supported) return {supported: false, available: 0, queueUsed: 0, queueLimit: 0, intelByNode: {}};
  const ids = new Set(Object.keys(game.state.scoutIntel || {}));
  for (const id of Object.keys(game.state.scouted || {})) ids.add(id);
  for (const node of game.nodes) if (visible(game, node) && game.intel(node.id)?.public) ids.add(node.id);
  const intelByNode = {};
  for (const id of ids) {
    const node = game.getNode(id);
    if (!visible(game, node)) continue;
    intelByNode[id] = intelView(game, node, now);
  }
  const target = game.nodes.find(node => visible(game, node) && node.id !== 'home');
  const quote = target ? game.scoutQuote(target.id, 1) : null;
  return {supported, available: game.state.army.scout || 0,
    queueUsed: (game.state.scoutQueue || []).length, queueLimit: quote?.queueLimit ?? 0, intelByNode};
}

/** A queue carries private enemy snapshots. Expose only routing and the player's own settled counts. */
function scoutMarchesView(game, now = game.state.last, {shared = false} = {}) {
  if (shared) return [];
  const rows = [];
  for (const city of game.cityList()) for (const march of city.scoutQueue || []) {
    const node = game.getNode(march.node);
    if (!visible(game, node)) continue;
    const returning = march.phase === 'return';
    const lost = returning && integer(march.outcome?.lost) ? march.outcome.lost : null;
    const survivors = returning && integer(march.outcome?.survivors) ? march.outcome.survivors : null;
    rows.push({id: `scout:${city.id}:${march.id}`, type: 'scout', node: node.id, label: `斥候 · ${node.name}`,
      sourceCity: city.id, from: point(returning ? march.target : march.origin),
      to: point(returning ? march.origin : march.target), start: march.start, arrive: march.end,
      status: returning ? 'return' : 'march', remainingMs: Math.max(0, march.end - now),
      sentCount: march.scouts, count: returning ? survivors : march.scouts, lost, survivors,
      canStartBattle: false});
  }
  return rows;
}

/** Restrict previews to the original quote's presentation fields, including the stale-quote key. */
function scoutQuoteView(quote) {
  const keys = ['node', 'name', 'count', 'scouts', 'origin', 'target', 'distance', 'seconds', 'returnSeconds',
    'cost', 'queueLimit', 'counterLevel', 'tech', 'ttlMs', 'quality', 'precision', 'success', 'expectedLost', 'reason', 'key'];
  return Object.fromEntries(keys.filter(key => Object.hasOwn(quote, key)).map(key => [key, copy(quote[key])]));
}

return {intelView};})();
const Formation=(()=>{
const intelView=Scouting.intelView;

/** Explain visible matchups, never simulate damage, reveal stale intel or predict a win. */
function formationView(game, node, army, generalId, mode, now) {
  // Native landmarkVisible treats virtual military nodes as ordinary targets;
  // their tier gate must also hold before adding enemy data to a quote.
  const orderVisible = !node.orderRoute || game.warOrders.unlocked(game.state) && !node.encounter &&
    node.orderTier <= game.warOrders.maxTier(game.state, node.orderRoute) &&
    (!node.challengeId || node.orderTier <= game.state.warOrders.cleared[node.orderRoute]);
  const intel = orderVisible ? intelView(game, node, now) : {public: false, precision: 'unknown', army: {}};
  const known = intel.public || intel.precision === 'exact';
  const own = Object.entries(army).filter(([id, n]) => game.units[id] && n > 0).map(([id, count]) => ({
    id, name: game.units[id].name, count, stats: game.unitStats(id), carryPerSoldier: game.carry({[id]: 1})}));
  const total = own.reduce((n, row) => n + row.count, 0), general = game.general(generalId);
  const enemy = known ? intel.army : {}, has = id => (army[id] || 0) > 0, foe = id => (enemy[id] || 0) > 0;
  const strengths = [], risks = [], suggestions = [];
  if (known && has('spear') && foe('cavalry')) strengths.push('长枪兵攻击轻骑兵有克制加成；接敌与指定目标仍需军令安排。');
  if (known && has('cavalry') && foe('archer')) strengths.push('轻骑兵攻击弓箭兵有克制加成；能否接近取决于战场距离与军令。');
  if (known && has('shield') && foe('archer')) strengths.push('敌弓攻击刀盾兵的伤害系数较低；刀盾需要先接敌，不会自动替其他队伍挡箭。');
  if (known && has('archer') && foe('shield')) risks.push('弓箭兵打刀盾兵伤害较低，可调整目标或增加近战输出。');
  if (known && has('archer') && foe('cavalry') && !has('spear')) risks.push('敌轻骑克制弓队，当前没有长枪兵；考虑增援或用军令控制接敌。');
  if (known && foe('archer') && !has('shield')) suggestions.push('敌军有弓箭兵：刀盾护卫、快骑接近或远程集火各有代价。');
  const ranged = own.filter(row => row.stats.range >= 1000).reduce((n, row) => n + row.count, 0);
  if (ranged === total && total > 0) risks.push('全军均为远程兵种，敌近战接近后缺少前排；保持射程优势。');
  if (orderVisible && mode === 'occupy' && (game.isCity(node) || node.fortification) && !has('ram') && !has('catapult'))
    risks.push('本次占领有门墙，未携带冲车或投石车；普通兵也能攻门，但可能耗费更多回合。');
  if (total > general.lead * 100) risks.push('出征人数超过将领统率覆盖范围，战斗中的勇武加成会受到影响。');
  if (!known) risks.push('守军没有当前精确情报，无法分析敌方兵种组合；先侦察，旧情报和人数区间不当作精确兵力。');
  return {own, total, known, precision: intel.precision,
    enemy: known ? Object.entries(enemy).filter(([, n]) => n > 0).map(([id, count]) => ({id, name: game.units[id]?.name || id, count})) : [],
    strengths, risks, suggestions, note: '阵容分析只解释当前数据和原克制关系，不预测胜率。守军民兵、城防与抵达后的变化以实际战场为准。'};
}

return {formationView};})();
const Raids=(()=>{
const intelView=Scouting.intelView;

const RESOURCE_IDS = ['food', 'wood', 'stone', 'iron', 'gold'];
const NEARBY_RADIUS = 8;
const LIST_LIMIT = 5;
const positive = value => Number.isFinite(value) && value > 0;
const amount = value => Number.isFinite(value) && value >= 0 ? value : 0;
const resourcesOnly = value => Object.fromEntries(RESOURCE_IDS.map(id => [id, amount(value?.[id])]));

/**
 * Current owned city, read-only. Unknown wild-land loot encodes guard value in
 * the canonical generator: never project or rank those amounts without public
 * or live exact intelligence. No commands, ticks, saves, forecasts or win odds.
 */
function raidTargetsView(game, growth = {}, options = {}) {
  const now = options.now ?? game.state.last;
  const emptyLists = () => Object.fromEntries(RESOURCE_IDS.map(id => [id, []]));
  if (options.shared) return {supported: false, sourceCity: null, defaultResource: 'food', resources: [],
    lists: emptyLists(), referenceArmy: null, notes: ['共享房间尚未开放私人野地掠夺推荐。']};

  const state = game.state, home = game.currentHome();
  const gaps = Array.isArray(growth.gaps) ? growth.gaps : [];
  const resourceRows = RESOURCE_IDS.map(id => ({id, name: game.resources[id].name,
    gap: amount(gaps.find(row => row?.id === 'resource:' + id)?.missing)}));
  const defaultResource = resourceRows.find(row => row.gap > 0)?.id || 'food';
  const army = Object.fromEntries(Object.keys(game.units).map(id => [id,
    Number.isSafeInteger(state.army[id]) && state.army[id] >= 0 ? state.army[id] : 0]));
  const armyCount = game.totalArmy(army), limit = game.armyLimit();
  const withinLimit = armyCount > 0 && armyCount <= limit;
  const referenceArmy = {count: armyCount, limit, capacity: game.carry(army), withinLimit,
    reason: !armyCount ? '城内没有可参考的兵力，先训练部队再核对运力。' :
      !withinLimit ? '城内全部兵力超过单队人数上限，收益仅显示目标基础物资；请在配兵页面选择合法队伍。' :
        '参考运力使用城内全部兵力，假设战斗获胜且全部兵力幸存；正式出征请重新配兵预览。'};
  const candidates = new Map(), ownedCoordinates = new Set(game.cityList().map(city => `${city.x}:${city.y}`));
  const add = node => {
    if (!node || node.id === 'home' || ownedCoordinates.has(`${node.x}:${node.y}`) ||
        !game.landmarkVisible(node.id) || game.attackBlocked(node.id, 'raid') ||
        state.conquered[node.id] && (node.wild || game.isCity(node)) ||
        state.cooldowns[node.id] > now || candidates.has(node.id)) return;
    candidates.set(node.id, node);
  };
  // Bounded local search avoids scanning all 4096 fields on every view refresh.
  for (let y = Math.max(0, home.y - NEARBY_RADIUS); y <= Math.min(game.WORLD_SIZE - 1, home.y + NEARBY_RADIUS); y++) {
    for (let x = Math.max(0, home.x - NEARBY_RADIUS); x <= Math.min(game.WORLD_SIZE - 1, home.x + NEARBY_RADIUS); x++) add(game.getWorldTile(x, y));
  }
  // Existing visible objectives remain useful beyond the bounded local search.
  // Do not walk the entire intelligence history or clone the complete world.
  for (const node of game.nodes) if (game.landmarkVisible(node.id)) add(game.getNode(node.id));

  const lists = emptyLists();
  for (const node of candidates.values()) {
    const intel = intelView(game, node, now);
    const known = intel.public === true || intel.precision === 'exact';
    // Only resource kind is read for unknown fields. Never copy army, raw loot,
    // town population, original-node objects or hidden generator metadata.
    const kinds = node.wild ? [game.terrainTypes[node.type]?.resource].filter(Boolean) :
      Object.keys(node.loot || {}).filter(id => RESOURCE_IDS.includes(id) && id !== 'gold');
    const loot = known ? resourcesOnly(game.attackInfo(node.id, 'raid')?.loot) : null;
    const preview = known && withinLimit ? game.lootPreview(node.id, 'raid', army) : null;
    const carried = preview ? resourcesOnly(preview.loot) : null;
    const base = {id: node.id, name: node.name, x: node.x, y: node.y, level: node.level || 0,
      kind: game.isCity(node) ? 'city' : node.wild ? 'wild' : 'landmark',
      distance: Math.hypot(node.x - home.x, node.y - home.y), intelPrecision: intel.precision,
      rewardKnown: known, repeated: !!state.raided[node.id],
      cargoLoaded: preview ? amount(preview.loaded) : null,
      cargoDiscarded: preview ? amount(preview.discarded) : null};
    for (const resource of RESOURCE_IDS) {
      if (known ? !positive(loot[resource]) : !kinds.includes(resource)) continue;
      lists[resource].push({...base, resource, potential: known ? loot[resource] : null,
        carried: carried ? carried[resource] : null});
    }
  }
  for (const id of RESOURCE_IDS) {
    lists[id].sort((a, b) => Number(b.rewardKnown) - Number(a.rewardKnown) ||
      (b.carried ?? b.potential ?? 0) - (a.carried ?? a.potential ?? 0) ||
      a.distance - b.distance || a.level - b.level || a.id.localeCompare(b.id));
    lists[id] = lists[id].slice(0, LIST_LIMIT);
  }
  return {supported: true, sourceCity: game.currentCityId(), defaultResource,
    resources: resourceRows, referenceArmy, lists, radius: NEARBY_RADIUS, limit: LIST_LIMIT,
    notes: [
      '搜索当前城横纵各8格范围及已开放据点；每种资源最多显示5处目标。',
      '已知目标按参考可装载收益排序，未侦察目标按距离排序。未知资源金额须先获得精确侦察情报。',
      '数值为获胜前提下的基础物资，尚未扣除粮耗、战损和治疗费用；随机额外掉落另计。',
      '收益预览不表示获胜概率或已经入库的可用库存；实际战果与收取情况见战报。',
      '基础掠夺不含黄金；黄金缺口请结合任务、民政和金砖兑换筹备。',
    ]};
}

return {raidTargetsView};})();
const Buildings=(()=>{


// Only these two additive capacities are projected. The canonical maxPop()
// sums house records' population, and trainingLimit() sums barracks levels.
// Every canonical barracks record's limit equals its level (verified against
// actual construction completion for all ten tiers in the contract tests).
// Read the original records, never copy their curve or construct a runtime per
// poll. Placement has no capacity multiplier in these existing rules.
const TYPES = {
  house: {field: 'population', getter: 'maxPop', label: '人口上限', notice: '人口上限增加不代表人口立即补满。'},
  barracks: {field: 'limit', getter: 'trainingLimit', label: '可排队训练订单数',
    notice: '训练订单依次开始；队列容量不代表并行训练或训练加速。'},
};

/** Read-only, current owned city only; no tick/save/command or speculative loot. */
function buildingComparisons(game) {
  const state = game.state, layout = state.cityLayout, levels = state.cityLevels;
  const cityId = game.currentCityId(), queueFull = state.buildQueue.length >= game.buildLimit();
  const emptySite = layout.findIndex(id => id === null);
  const result = {};
  for (const [id, type] of Object.entries(TYPES)) {
    const definition = game.buildings[id], currentCapacity = game[type.getter]();
    const sites = layout.flatMap((value, site) => value === id ? [site] : []);
    const candidate = (site, level, fresh = false) => {
      const queue = state.buildQueue.find(job => job.site === site && job.plot === undefined) || null;
      const maxed = level >= definition.max;
      const targetLevel = maxed ? null : level + 1;
      const record = !queue && !maxed ? game.buildRecord(id, targetLevel) : null;
      const previous = level > 0 ? game.buildRecord(id, level) : null;
      const effectDelta = record ? record[type.field] - (previous?.[type.field] || 0) : null;
      const cost = record ? copy(record.cost) : {};
      const requirement = queue ? '正在施工' : maxed ? '已达最高等级' : game.buildingRequirements(id, targetLevel);
      const affordable = !!record && game.canPay(record.cost);
      const uniqueBlocked = fresh && !definition.repeat && sites.length > 0;
      const reason = requirement || (uniqueBlocked ? '该建筑在本城只能建一座' : '') ||
        (queueFull ? '建造队正在忙碌' : '') || (!affordable ? '建设资源不足' : '');
      const seconds = record ? game.buildSeconds(id, targetLevel) : 0;
      return {site, id, level, targetLevel, cost, time: seconds, seconds,
        effectDelta, capacityAfter: effectDelta === null ? null : currentCapacity + effectDelta,
        requirement, affordable, queue: queue ? copy(queue) : null, available: !reason, reason};
    };
    result[id] = {id, cityId, count: sites.filter(site => levels[site] > 0).length,
      pendingCount: sites.filter(site => levels[site] === 0).length,
      currentCapacity, capacityLabel: type.label, notice: type.notice,
      new: emptySite < 0 ? null : candidate(emptySite, 0, true),
      upgrades: sites.filter(site => levels[site] > 0).map(site => candidate(site, levels[site]))};
  }
  return result;
}

return {buildingComparisons};})();
return {intel:Scouting.intelView,formation:Formation.formationView,raids:Raids.raidTargetsView,buildings:Buildings.buildingComparisons};})();
