'use strict';
// Faithful browser adaptation of Godot's private progression modules.
// Shared-world rewards and map state continue to belong to online/.
const WebEdition=(()=>{
  const copy=value=>JSON.parse(JSON.stringify(value));
  class GameError extends Error{constructor(code,message){super(message);this.code=code;}}
  const validateInput=input=>{if(!input||typeof input.type!=='string'||!Array.isArray(input.args)||input.args.length>8)throw new GameError('BAD_INPUT','操作参数无效');};
const CONQUEST_BUNDLES = Object.freeze({supply_choice: '百工调拨令', supply_rations: '行军粮秣包',
  supply_recovery: '返城整备包', supply_siege: '攻城筹备包'});
const conquestGems = (kind, level) => kind === 'city' ? 20 + level * 5 : 3 + level * 2;

/** Provenance for earned bundles lives in the independently validated conquest ledger. */
function earnedConquestBundles(state, id) {
  return Object.values(state.conquestSupply?.records || {}).filter(row => row?.status === 'rewarded' &&
    row.drop?.kind === 'bundle' && row.drop.id === id).length;
}

const GrowthSupport=(()=>{

const OFFER_ID = 'growth_coral';
const COST = 80;
const LIMIT = 5;
const object = value => !!value && typeof value === 'object' && !Array.isArray(value);
// Optional prototype supply prices. Promotion requirements remain canonical;
// these fixed copper prices are clearly marked as this game's trial design.
const PREPARATION_PRICES = Object.freeze({pearl: 40, coral: 80, glass: 120, amber: 160,
  agate: 200, crystal: 240, jadeite: 280, jade: 320, nightPearl: 400});
let catalogue = null;

function preparationCatalogue() {
  if (catalogue) return catalogue;
  const rows = new Map();
  for(const kind of ['office','noble']) for(const row of kind==='office'?HeritageData.offices:HeritageData.nobles){
    const rank=row.id;
    for(const [jewel,limit] of Object.entries(row.promotion?.jewels||{})){
      if(!Object.hasOwn(PREPARATION_PRICES,jewel)||kind==='noble'&&rank===1&&jewel==='coral')continue;
      const id=`growth_prepare_${kind}_${rank}_${jewel}`;
      rows.set(id,{id,kind,rank,jewel,limit,stage:row.name,cost:PREPARATION_PRICES[jewel]});
    }
  }
  catalogue = rows;
  return catalogue;
}

const isGrowthSupportOffer = id => typeof id === 'string' && (id === OFFER_ID || id.startsWith('growth_prepare_'));

/** Optional save-wide extension; old canonical saves do not need migration. */
function validGrowthSupport(snapshot) {
  if (!object(snapshot)) return false;
  if (!Object.hasOwn(snapshot, 'growthSupport')) return true;
  const record = snapshot.growthSupport;
  if (!object(record) || !Number.isSafeInteger(record.coralExchanged) || record.coralExchanged < 0 || record.coralExchanged > LIMIT) return false;
  if (record.version === 1) return Object.keys(record).length === 2 && Object.hasOwn(record, 'version') && Object.hasOwn(record, 'coralExchanged');
  if (record.version !== 2 || Object.keys(record).length !== 3 || !Object.hasOwn(record, 'version') ||
    !Object.hasOwn(record, 'coralExchanged') || !Object.hasOwn(record, 'preparation') || !object(record.preparation)) return false;
  const entries = Object.entries(record.preparation), rules = preparationCatalogue();
  return entries.length <= rules.size && entries.every(([id, count]) => rules.has(id) &&
    Number.isSafeInteger(count) && count >= 0 && count <= rules.get(id).limit &&
    rules.get(id).rank <= (snapshot.honors?.[rules.get(id).kind] ?? -2) + 1);
}

/** Only the two current next-promotion stages are quoted. Future offers are
 * never purchasable just by inventing their IDs. A rank's quota never resets. */
function growthPreparationQuotes(runtime, {shared = false} = {}) {
  if (shared) return [];
  const {Game: game, HeritageSystem: heritage, Progression: progression} = runtime, state = game.state;
  if (!validGrowthSupport(state)) return [];
  const rows = [];
  for (const kind of ['office', 'noble']) {
    const promotion = heritage.promotionQuote(state, kind);
    if (!promotion?.next) continue;
    for (const [jewel, required] of Object.entries(promotion.rule.jewels)) {
      const id = `growth_prepare_${kind}_${promotion.next.id}_${jewel}`, rule = preparationCatalogue().get(id);
      if (!rule) continue;
      const claimed = state.growthSupport?.preparation?.[id] || 0, owned = state.jewels[jewel], remaining = rule.limit - claimed;
      let reason = state.conquered?.camp !== true ? '先占领黄巾营寨，开放晋升筹备' :
        !Number.isSafeInteger(state.copper) || state.copper < 0 || !Number.isSafeInteger(owned) || owned < 0 ? '铜钱或珍宝记录无效' :
        owned >= required ? '本次晋升所需珍宝已备齐' : remaining <= 0 ? '本次晋升的固定筹备份额已用完' :
        state.copper < rule.cost ? `铜钱不足：需要 ${rule.cost}` : '';
      if (owned >= Number.MAX_SAFE_INTEGER) reason = '珍宝数量达到上限';
      rows.push({...rule, name: `${rule.stage}筹备 · ${progression.jewels[jewel].name} ×1`,
        claimed, remaining, period: 'rank', owned, required, missing: Math.max(0, required - owned), reason,
        trial: true, command: {type: 'exchangeCopper', args: [id]}});
    }
  }
  return rows;
}

/** Deterministic, read-only offer. Never initializes a counter or resets daily. */
function growthSupportQuote(runtime, {shared = false} = {}) {
  const state = runtime.Game.state;
  const valid = validGrowthSupport(state);
  const claimed = valid ? state.growthSupport?.coralExchanged ?? 0 : null;
  let reason = '';
  if (shared) reason = '共享模式不开放县城筹备兑换，请切换本机进度';
  else if (!valid) reason = '县城筹备兑换记录无效';
  else if (state.conquered?.camp !== true) reason = '先占领黄巾营寨，开放县城筹备兑换';
  else if (claimed >= LIMIT) reason = '本存档珊瑚筹备兑换限额已用完（5 枚）';
  else if (!Number.isSafeInteger(state.copper) || state.copper < 0 ||
    !Number.isSafeInteger(state.jewels?.coral) || state.jewels.coral < 0) reason = '铜钱或珊瑚记录无效';
  else if (state.jewels.coral >= Number.MAX_SAFE_INTEGER) reason = '珊瑚数量达到数值上限';
  else if (state.copper < COST) reason = '铜钱不足：需要 80';
  return {id: OFFER_ID, name: '县城筹备 · 珊瑚 ×1', cost: COST, claimed,
    remaining: valid ? LIMIT - claimed : 0, limit: LIMIT, period: 'save', reason,
    command: {type: 'exchangeCopper', args: [OFFER_ID]}};
}

/** Executes only on the private bridge's disposable canonical runtime/CAS candidate. */
function executeGrowthSupport(runtime, input, now, {shared = false} = {}) {
  validateInput(input);
  if (input.type !== 'exchangeCopper' || input.args.length !== 1 || !isGrowthSupportOffer(input.args[0])) {
    throw new GameError('COMMAND_NOT_ALLOWED', '晋升筹备操作参数无效');
  }
  if (shared) throw new GameError('COMMAND_NOT_ALLOWED', '共享模式不开放阶段筹备兑换');
  if (!Number.isSafeInteger(now) || now < 0) throw new GameError('BAD_TIME', '结算时间无效');
  const game = runtime.Game;
  if (!validGrowthSupport(game.state) || !game.validSave(copy(game.state))) {
    throw new GameError('BAD_SAVE', '晋升筹备兑换无法通过存档校验');
  }
  game.tick(now, true);
  const offer = input.args[0] === OFFER_ID ? growthSupportQuote(runtime) :
    growthPreparationQuotes(runtime).find(row => row.id === input.args[0]);
  if (!offer) throw new GameError('GAME_RULE', '这项筹备不属于当前晋升阶段，请刷新后选择');
  if (offer.reason) throw new GameError('GAME_RULE', offer.reason);
  game.state.copper -= offer.cost;
  const jewel = offer.jewel || 'coral';
  game.state.jewels[jewel] += 1;
  const claimed = offer.claimed + 1;
  // CitySystem's field list excludes this extension, so the single top-level
  // record remains shared by every owned city and survives canonical migration.
  const old = game.state.growthSupport;
  if (offer.id === OFFER_ID) game.state.growthSupport = old?.version === 2 ?
    {...old, coralExchanged: claimed} : {version: 1, coralExchanged: claimed};
  else game.state.growthSupport = {version: 2, coralExchanged: old?.coralExchanged || 0,
    preparation: {...(old?.preparation || {}), [offer.id]: claimed}};
  if (game.save() === false) throw new GameError('SAVE_FAILED', '晋升筹备兑换保存失败', 500);
  if (!validGrowthSupport(game.state) || !game.validSave(game.state)) {
    throw new GameError('INVALID_RESULT', '晋升筹备兑换产生无效状态', 500);
  }
  return {state: copy(game.state), result: {id: offer.id, jewel, count: 1,
    copperSpent: offer.cost, claimed, remaining: offer.limit - claimed}, runtime};
}

return {validGrowthSupport,growthPreparationQuotes,growthSupportQuote,executeGrowthSupport};})();
const SupplyWorkshop=(()=>{

// Optional prototype items. Native item IDs, resource caps and queues stay in Game.
const offers = [
  {id: 'supply_choice', name: '百工调拨令', price: 22, limit: 10,
    description: '开包时选择建设、研究或练兵，固定获得对应15分钟加速 ×4。按当前需要调拨，合计1小时；不直接完成队列。',
    choices: ['build', 'research', 'train'].map(kind => ({id: kind,
      name: {build: '建设加速', research: '研究加速', train: '练兵加速'}[kind], items: {[`speed_${kind}_15m`]: 4}}))},
  {id: 'supply_rations', name: '行军粮秣包', price: 12, limit: 10,
    description: '固定粮食 +10000。用于行军、募兵或伤兵治疗；资源装不下时保留包裹。', resources: {food: 10000}},
  {id: 'supply_recovery', name: '返城整备包', price: 55, limit: 5,
    description: '固定获得练兵1小时加速 ×2、典民令 ×1，粮食 +5000、黄金 +2000。人口与练兵道具需另行使用，不直接补满部队。',
    items: {speed_train_1h: 2, population: 1}, resources: {food: 5000, gold: 2000}},
  {id: 'supply_siege', name: '攻城筹备包', price: 90, limit: 5,
    description: '固定获得建设1小时加速 ×2、练兵1小时加速 ×2，石料 +10000、铁锭 +5000。帮助准备器械，仍需满足原募兵条件。',
    items: {speed_build_1h: 2, speed_train_1h: 2}, resources: {stone: 10000, iron: 5000}},
];
const ids = new Map(offers.map(row => [row.id, row]));
const commands = new Set(['supplies.buy', 'supplies.open', 'supplies.claimStarter']);
const object = value => !!value && typeof value === 'object' && !Array.isArray(value);
const int = value => Number.isSafeInteger(value) && value >= 0;
const empty = () => ({version: 1, stock: {}, purchases: {}, starterClaimed: false});
const starterItems = {speed_build_1h: 4, speed_research_1h: 2, speed_train_1h: 1};
const isSupplyCommand = type => commands.has(type);

function validSupplyWorkshop(state) {
  if (!object(state)) return false;
  if (!Object.hasOwn(state, 'supplyWorkshop')) return true;
  const r = state.supplyWorkshop;
  return object(r) && Object.keys(r).length === 4 && r.version === 1 && typeof r.starterClaimed === 'boolean' &&
    object(r.stock) && object(r.purchases) && Object.entries(r.purchases).every(([id, n]) => ids.has(id) && int(n) && n <= ids.get(id).limit) &&
    Object.entries(r.stock).every(([id, n]) => ids.has(id) && int(n) &&
      n <= (r.purchases[id] || 0) + (r.starterClaimed && id === 'supply_choice' ? 1 : 0) + earnedConquestBundles(state, id));
}

function grantEarnedSupplyBundle(game, id) {
  if (!ids.has(id)) throw new GameError('BAD_SUPPLIES', '未知军需包');
  const r = copy(game.state.supplyWorkshop || empty());
  r.stock[id] = (r.stock[id] || 0) + 1;
  game.state.supplyWorkshop = r;
  if (!validSupplyWorkshop(game.state)) throw new GameError('BAD_SUPPLIES', '所得军需包无法通过来源校验');
}

function contentsReason(game, contents) {
  for (const [id, n] of Object.entries(contents.items || {})) {
    if (!game.manual.shop.some(row => row.id === id && row.effect) || !int(n) ||
      !int(game.state.inventory[id] || 0) || !int((game.state.inventory[id] || 0) + n)) return '道具内容或库存无效';
  }
  for (const [id, n] of Object.entries(contents.resources || {})) {
    if (!Object.hasOwn(game.resources, id) || !int(n) || !Number.isFinite(game.state.res[id]) ||
      game.state.res[id] + n > game.capacity(id)) return `${game.resources[id]?.name || id}容量不足；包裹保留，请腾出空间或提升仓储`;
  }
  return '';
}

function starterView(game, shared) {
  const reason = shared ? '首战工程补给用于本机进度' : game.state.supplyWorkshop?.starterClaimed ? '本存档已领取' :
    game.state.onboarding.firstBattle === 'complete' ? '首战引导已完成，本补给仅用于首战准备' :
    game.state.buildings.hall < 1 ? '官府达到1级后领取' : contentsReason(game, {items: starterItems});
  return {name: '首战工程补给', description: '一次性免费领取：建设1小时加速 ×4、研究1小时加速 ×2、练兵1小时加速 ×1、百工调拨令 ×1。先安排当前工程，再按成长路线预览使用。',
    claimed: !!game.state.supplyWorkshop?.starterClaimed, reason,
    command: {type: 'supplies.claimStarter', args: []}};
}

const starterSupplyQuote = (runtime, {shared = false} = {}) => starterView(runtime.Game, shared);

function supplyWorkshopView(runtime, {shared = false} = {}) {
  const game = runtime.Game, state = game.state, r = state.supplyWorkshop || empty();
  const items = shared ? [] : offers.map(offer => {
    const count = r.stock[offer.id] || 0, remaining = offer.limit - (r.purchases[offer.id] || 0);
    const reason = !remaining ? '本存档限购份额已用完' : state.gems < offer.price ? '试玩元宝不足' : '';
    const choices = (offer.choices || []).map(row => ({id: row.id, name: row.name, reason: contentsReason(game, row)}));
    return {id: offer.id, name: offer.name, category: '创新军需', effect: 'supplyBundle', count,
      description: offer.description + `\n试玩设计 · 本存档限购 ${offer.limit} 包，跨城共用。`, trial: true,
      supported: true, rewardOnly: false, price: offer.price, buyType: 'supplies.buy', openType: 'supplies.open',
      purchase: {reason, limit: reason ? 0 : Math.min(99, remaining, Math.floor(state.gems / offer.price)),
        remaining, dailyLimit: offer.limit, period: 'save', costs: Array.from({length: 99}, (_, i) => offer.price * (i + 1))},
      use: {targetKind: choices.length ? 'choice' : 'none', targets: choices,
        reason: count < 1 ? '没有这件包裹' : choices.length ? '' : contentsReason(game, offer), route: null}};
  });
  return {items, starter: starterView(game, shared)};
}

function grant(game, contents) {
  for (const [id, n] of Object.entries(contents.items || {})) game.state.inventory[id] = (game.state.inventory[id] || 0) + n;
  for (const [id, n] of Object.entries(contents.resources || {})) game.state.res[id] += n;
}

/** Private CAS candidate only. All failures discard the candidate and keep receipts unchanged. */
function executeSupplyCommand(runtime, input, now) {
  validateInput(input);
  if (!commands.has(input.type) || !validSupplyWorkshop(runtime.Game.state)) throw new GameError('BAD_SUPPLIES', '军需记录或操作无效');
  const game = runtime.Game;
  game.tick(now, true);
  const r = copy(game.state.supplyWorkshop || empty());
  let result;
  if (input.type === 'supplies.claimStarter') {
    if (input.args.length) throw new GameError('BAD_SUPPLIES', '首战补给参数无效');
    const quote = starterView(game, false);
    if (quote.reason) throw new GameError('GAME_RULE', quote.reason);
    grant(game, {items: starterItems});
    r.starterClaimed = true; r.stock.supply_choice = (r.stock.supply_choice || 0) + 1;
    result = {items: copy(starterItems), bundles: {supply_choice: 1}, free: true};
  } else {
    const offer = ids.get(input.args[0]);
    if (!offer) throw new GameError('BAD_SUPPLIES', '军需包不存在');
    if (input.type === 'supplies.buy') {
      const count = input.args[1], purchased = r.purchases[offer.id] || 0, cost = count * offer.price;
      if (input.args.length !== 2 || !int(count) || count < 1 || count > 99 || purchased + count > offer.limit)
        throw new GameError('GAME_RULE', '购买数量超过本存档限购份额');
      if (!int(game.state.gems) || game.state.gems < cost) throw new GameError('GAME_RULE', '试玩元宝不足');
      game.state.gems -= cost; r.purchases[offer.id] = purchased + count;
      r.stock[offer.id] = (r.stock[offer.id] || 0) + count;
      result = {bundle: offer.id, count, gemsSpent: cost};
    } else {
      if (!(r.stock[offer.id] > 0)) throw new GameError('GAME_RULE', '没有这件包裹');
      const choice = offer.choices?.find(row => row.id === input.args[1]);
      if (offer.choices ? input.args.length !== 2 || !choice : input.args.length !== 1)
        throw new GameError('BAD_SUPPLIES', '请明确选择合法的调拨方向');
      const contents = choice || offer, reason = contentsReason(game, contents);
      if (reason) throw new GameError('GAME_RULE', reason);
      grant(game, contents); r.stock[offer.id] -= 1;
      result = {bundle: offer.id, choice: choice?.id || null, items: copy(contents.items || {}), resources: copy(contents.resources || {})};
    }
  }
  game.state.supplyWorkshop = r;
  if (!validSupplyWorkshop(game.state) || !game.validSave(game.state) || game.save() === false)
    throw new GameError('INVALID_RESULT', '军需操作无法通过存档校验');
  return {state: copy(game.state), result, runtime};
}

return {validSupplyWorkshop,grantEarnedSupplyBundle,starterSupplyQuote,supplyWorkshopView,executeSupplyCommand};})();
const ConquestSupply=(()=>{

const object = value => !!value && typeof value === 'object' && !Array.isArray(value);
const int = value => Number.isSafeInteger(value) && value >= 0;
let metadata;
function catalogue() {
  if (metadata) return metadata;
  const {Game: game} = {Game};
  const nodes = new Map(game.nodes.map(node => [node.id, game.isCity(node) ? 'city' : 'wild']));
  const pool = game.manual.shop.filter(item => item.effect && !item.rewardOnly).map(item => ({
    kind: 'item', id: item.id, name: item.name, weight: item.price >= 100 ? 1 : 8}));
  pool.push(...Object.entries(CONQUEST_BUNDLES).map(([id, name]) => ({kind: 'bundle', id, name, weight: id === 'supply_siege' ? 3 : 8})));
  metadata = {nodes, pool};
  return metadata;
}

function nodeKind(id) {
  const wild = /^wild_(\d+)_(\d+)$/.exec(id);
  if (wild) return Number(wild[1]) < 64 && Number(wild[2]) < 64 && `wild_${Number(wild[1])}_${Number(wild[2])}` === id ? 'wild' : null;
  return catalogue().nodes.get(id) || null;
}
function empty() { return {version: 1, enabled: false, records: {}}; }
function availablePool(game) {
  return catalogue().pool.filter(drop => drop.kind === 'bundle' || (game.state.inventory[drop.id] || 0) < Number.MAX_SAFE_INTEGER);
}
function validConquestSupply(state) {
  if (!object(state)) return false;
  if (!Object.hasOwn(state, 'conquestSupply')) return true;
  const r = state.conquestSupply;
  if (!object(r) || Object.keys(r).length !== 3 || r.version !== 1 || typeof r.enabled !== 'boolean' || !object(r.records)) return false;
  const rows = Object.entries(r.records), {nodes, pool} = catalogue();
  if (rows.length > 4096 + nodes.size) return false;
  return rows.every(([id, row]) => object(row) && Object.keys(row).length === 7 && ['wild', 'city'].includes(row.kind) && nodeKind(id) === row.kind &&
    ['baseline', 'disabled', 'rewarded'].includes(row.status) && int(row.level) && row.level >= 1 && row.level <= 10 && int(row.at) &&
    typeof row.sourceCity === 'string' && row.sourceCity.length <= 100 && int(row.gems) &&
    (row.status === 'rewarded' ? row.gems <= conquestGems(row.kind, row.level) && !!row.sourceCity &&
      object(row.drop) && Object.keys(row.drop).length === 2 && pool.some(drop => drop.kind === row.drop.kind && drop.id === row.drop.id) : row.gems === 0 && row.drop === null));
}

function conquestNodeQuote(game, node, mode = 'occupy') {
  const kind = nodeKind(node.id), enabled = game.state.conquestSupply?.enabled === true;
  const first = !!kind && !game.state.conquestSupply?.records[node.id] && !game.state.conquered[node.id];
  return {enabled, eligible: !!kind && mode === 'occupy', first,
    gems: kind ? conquestGems(kind, Math.max(1, Math.min(10, node.level || 1))) : 0,
    reason: !enabled ? '征战补给模式尚未开启' : !kind || mode !== 'occupy' ? '额外补给用于野地／据点与城池占领' :
      !first ? '此地点的首次占领份额已处理，重占不再发放' : '真正占领后自动获得元宝与随机商城道具 ×1'};
}

function conquestSupplyView(runtime, {shared = false} = {}) {
  const game = runtime.Game, r = game.state.conquestSupply || empty(), pool = availablePool(game);
  const totalWeight = pool.reduce((n, row) => n + row.weight, 0);
  const rewarded = Object.entries(r.records).filter(([, row]) => row.status === 'rewarded');
  return {shared, enabled: !shared && r.enabled, reason: shared ? '征战补给模式用于本机PVE进度' : '',
    earnedGems: rewarded.reduce((n, [, row]) => n + row.gems, 0), rewarded: rewarded.length,
    history: shared ? [] : rewarded.sort((a, b) => b[1].at - a[1].at).slice(0, 8).map(([id, row]) => ({
      node: id, name: game.getNode(id)?.name || id, kind: row.kind, gems: row.gems, at: row.at,
      itemName: catalogue().pool.find(drop => drop.kind === row.drop.kind && drop.id === row.drop.id).name})),
    pool: shared ? [] : pool.map(row => ({id: row.id, kind: row.kind, name: row.name, percent: 100 * row.weight / totalWeight})),
    command: {type: 'conquest.setEnabled', args: [!r.enabled]}};
}

function executeConquestSetting(runtime, input, now) {
  validateInput(input);
  if (input.type !== 'conquest.setEnabled' || input.args.length !== 1 || typeof input.args[0] !== 'boolean')
    throw new GameError('BAD_CONQUEST_MODE', '请选择开启或暂停征战补给模式');
  const game = runtime.Game;
  game.tick(now, true);
  const r = copy(game.state.conquestSupply || empty());
  // Initial opt-in never pays retroactive prizes for already-owned/imported land.
  for (const id of Object.keys(game.state.conquered)) {
    if (!game.state.conquered[id] || r.records[id] || !nodeKind(id)) continue;
    const node = game.getNode(id);
    if (node) r.records[id] = {status: 'baseline', kind: nodeKind(id), level: Math.max(1, Math.min(10, node.level || 1)),
      at: now, sourceCity: '', gems: 0, drop: null};
  }
  r.enabled = input.args[0]; game.state.conquestSupply = r;
  if (!validConquestSupply(game.state) || !game.validSave(game.state) || game.save() === false)
    throw new GameError('INVALID_RESULT', '征战补给设置无法通过存档校验');
  return {runtime, state: copy(game.state), result: {enabled: r.enabled}};
}

/** Capture only a real player-issued occupancy round, before native settlement. */
function captureConquestContext(game, input) {
  const b = game.state.battle;
  if (input.type !== 'battleRound' || !game.state.conquestSupply || !b || b.finished || b.mode !== 'occupy' ||
      game.state.expedition?.node !== b.node || game.state.expedition?.general !== b.general || !nodeKind(b.node)) return null;
  if (game.state.expedition.sourceCity && game.state.expedition.sourceCity !== game.currentCityId()) return null;
  return {battle: b, node: b.node, general: b.general, sourceCity: game.currentCityId(), already: !!game.state.conquered[b.node]};
}

/** Supplemental reward only after actual ownership changes. Same CAS/receipt as the battle. */
function settleConquestSupply(runtime, context, now) {
  if (!context) return null;
  const game = runtime.Game, b = game.state.battle, result = b?.result, node = game.getNode(context.node);
  if (b !== context.battle || !b.finished || b.node !== context.node || b.general !== context.general || context.already ||
      !result?.won || result.mode !== 'occupy' || result.claimed !== true || !game.state.conquered[context.node] ||
      game.currentCityId() !== context.sourceCity || game.state.conquestSupply.records[context.node]) return null;
  if (node.wild && game.state.realm.wildOwners[context.node] !== context.sourceCity ||
      game.isCity(node) && !game.cityList().some(city => city.node === context.node)) return null;
  const report = game.state.reports[0];
  if (!report || report.node !== context.node || report.general !== context.general || report.sourceCity !== context.sourceCity ||
      !int(report.id) || report.won !== true || report.claimed !== true || report.mode !== 'occupy') return null;
  const r = game.state.conquestSupply, kind = nodeKind(context.node), level = Math.max(1, Math.min(10, node.level || 1));
  const row = {status: r.enabled ? 'rewarded' : 'disabled', kind, level, at: report.id, sourceCity: context.sourceCity, gems: 0, drop: null};
  r.records[context.node] = row;
  if (r.enabled) {
    const pool = availablePool(game);
    let pick = Math.floor(Math.random()*pool.reduce((n, drop) => n + drop.weight, 0));
    const chosen = pool.find(drop => (pick -= drop.weight) < 0);
    row.drop = {kind: chosen.kind, id: chosen.id};
    row.gems = Math.min(conquestGems(kind, level), Number.MAX_SAFE_INTEGER - game.state.gems);
    game.state.gems += row.gems;
    if (chosen.kind === 'bundle') SupplyWorkshop.grantEarnedSupplyBundle(game, chosen.id);
    else game.state.inventory[chosen.id] = (game.state.inventory[chosen.id] || 0) + 1;
  }
  if (!validConquestSupply(game.state) || !game.validSave(game.state) || game.save() === false)
    throw new GameError('INVALID_RESULT', '占领补给无法通过存档校验');
  return row.status === 'rewarded' ? conquestReportReceipt(runtime, report) : null;
}

function conquestReportReceipt(runtime, report) {
  const row = runtime.Game.state.conquestSupply?.records[report.node];
  if (!row || row.status !== 'rewarded' || row.at !== report.id || row.sourceCity !== report.sourceCity ||
      report.won !== true || report.claimed !== true || report.mode !== 'occupy') return null;
  const drop = catalogue().pool.find(value => value.kind === row.drop.kind && value.id === row.drop.id);
  return {node: report.node, gems: row.gems, item: {...copy(row.drop), name: drop.name, count: 1}};
}

return {validConquestSupply,conquestNodeQuote,conquestSupplyView,executeConquestSetting,captureConquestContext,settleConquestSupply,conquestReportReceipt};})();

  const runtime=()=>({Game,HeritageSystem,Progression});
  const shared=()=>Game.authorityActive()||!!Game.state?.onlineRealm||typeof GAME_SERVER_RUNTIME!=='undefined'&&GAME_SERVER_RUNTIME;
  function execute(type,args){
    if(shared())return '此扩展用于本机进度，共享世界继续使用原结算规则';
    const reason=Game.saveBlockReason();if(reason)return reason;
    try{
      if(type.startsWith('supplies.'))SupplyWorkshop.executeSupplyCommand(runtime(),{type,args},Date.now());
      else if(type==='conquest.setEnabled')ConquestSupply.executeConquestSetting(runtime(),{type,args},Date.now());
      else GrowthSupport.executeGrowthSupport(runtime(),{type,args},Date.now());
      return null;
    }catch(error){return error.message;}
  }
  function capture(){return shared()?null:ConquestSupply.captureConquestContext(Game,{type:'battleRound'});}
  function settle(context){
    if(!context)return null;
    // finishBattle persists the native report and supplemental receipt together.
    const game=Object.create(Game);game.save=()=>true;
    return ConquestSupply.settleConquestSupply({...runtime(),Game:game},context,Date.now());
  }
  function sync(){
    if(shared()||Game.state.conquestSupply)return;
    // Preserve old ownership as a baseline before any new battle or toggle.
    const records={};
    for(const [id,held] of Object.entries(Game.state.conquered)){
      const node=held?Game.getNode(id):null;if(!node)continue;
      records[id]={kind:Game.isCity(node)?'city':'wild',status:'baseline',level:Math.max(1,Math.min(10,node.level||1)),at:Date.now(),sourceCity:'',gems:0,drop:null};
    }
    Game.state.conquestSupply={version:1,enabled:false,records};
  }
  return {execute,capture,settle,sync,shared,
    valid:s=>WildFields.valid(s)&&GrowthSupport.validGrowthSupport(s)&&SupplyWorkshop.validSupplyWorkshop(s)&&ConquestSupply.validConquestSupply(s),
    supplies:()=>SupplyWorkshop.supplyWorkshopView(runtime(),{shared:shared()}),
    growth:()=>[GrowthSupport.growthSupportQuote(runtime(),{shared:shared()}),...GrowthSupport.growthPreparationQuotes(runtime(),{shared:shared()})],
    conquest:()=>ConquestSupply.conquestSupplyView(runtime(),{shared:shared()}),
    conquestQuote:(node,mode)=>ConquestSupply.conquestNodeQuote(Game,node,mode),
    receipt:report=>ConquestSupply.conquestReportReceipt(runtime(),report)};
})();
