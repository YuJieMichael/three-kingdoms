'use strict';
const WildFields=(()=>{

const WILD_INTERVAL_MS = 30 * 60 * 1000;
const TYPES = ['plain', 'grass', 'forest', 'hill', 'mountain', 'lake', 'swamp'];
const wildId = /^wild_(\d{1,2})_(\d{1,2})$/;
const integer = n => Number.isSafeInteger(n) && n >= 0;
const object = n => !!n && typeof n === 'object' && !Array.isArray(n);
const uint = n => integer(n) && n <= 0xffffffff;
const validId = id => {
  const m = wildId.exec(id);
  return !!m && Number(m[1]) < 64 && Number(m[2]) < 64 && id === `wild_${Number(m[1])}_${Number(m[2])}`;
};
const mix = (...values) => {
  let n = 2166136261;
  for (const value of values) {
    n = Math.imul(n ^ (value >>> 0), 16777619);
    n = Math.imul(n ^ (n >>> 16), 2246822507);
  }
  return (n ^ (n >>> 13)) >>> 0;
};
const cache = new Map();
function shuffle(values, seed) {
  const result = [...values];
  let n = seed;
  for (let i = result.length - 1; i > 0; i--) {
    n = mix(n, i);
    const j = n % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
function block(meta, x, y) {
  const bx = Math.floor(x / 8), by = Math.floor(y / 8);
  const key = `${meta.seed}:${meta.generation}:${bx}:${by}`;
  if (!cache.has(key)) {
    if (cache.size >= 128) cache.clear();
    const seed = mix(meta.seed, meta.generation, bx, by);
    cache.set(key, {
      types: shuffle(Array.from({length: 64}, (_, i) => TYPES[(i + seed % 7) % 7]), mix(seed, 1)),
      levels: shuffle(Array.from({length: 64}, (_, i) => 1 + (i + seed % 10) % 10), mix(seed, 2)),
    });
  }
  return cache.get(key);
}

function validWildFields(state) {
  if (!object(state) || state.wildRefresh === undefined) return object(state);
  const m = state.wildRefresh;
  return object(m) && Object.keys(m).length === 5 && m.version === 1 && uint(m.seed) &&
    integer(m.generation) && integer(m.at) && m.at === m.generation * WILD_INTERVAL_MS &&
    object(m.pins) && Object.keys(m.pins).length <= 4096 && Object.entries(m.pins).every(([id, p]) =>
      validId(id) && object(p) && Object.keys(p).length === 4 && TYPES.includes(p.type) &&
      integer(p.level) && p.level <= 10 && uint(p.seed) && typeof p.legacy === 'boolean');
}

/** A balanced 8×8 neighbourhood; shuffle changes placements, not quotas. */
function resolveWild(state, x, y, now) {
  const m = state?.wildRefresh;
  if (!m || state.onlineRealm) return null;
  const id = `wild_${x}_${y}`, p = m.pins[id];
  const row = p || (() => {
    const b = block(m, x, y), index = y % 8 * 8 + x % 8;
    return {type: b.types[index], level: b.levels[index], seed: mix(m.seed, m.generation, x, y), legacy: false};
  })();
  const claim = state.landClaims?.[id];
  const level = claim && state.conquered?.[id] ? Math.max(0, claim.level - Math.floor((now - claim.at) / 86400000)) : row.level;
  return {...row, level};
}

const wildWeight = (seed, index) => mix(seed, index + 17);
function wildKey(state, x, y, now) {
  const r = resolveWild(state, x, y, now);
  return r ? `${r.type}:${r.level}:${r.seed}:${r.legacy ? 1 : 0}` : '';
}

function scopes(state) {
  return [state, ...Object.entries(state.realm?.cities || {}).filter(([id]) => id !== state.realm.activeCity).map(([, city]) => city.data)];
}
function heldTargets(state) {
  const held = new Set();
  const add = id => { if (typeof id === 'string' && validId(id)) held.add(id); };
  for (const [id, owned] of Object.entries(state.conquered || {})) if (owned) add(id);
  for (const id of Object.keys(state.realm?.wildOwners || {})) add(id);
  for (const city of Object.values(state.realm?.cities || {})) add(city.node);
  for (const s of scopes(state)) {
    for (const id of Object.keys(s.garrisons || {})) add(id);
    for (const id of Object.keys(s.gatherings || {})) add(id);
    add(s.expedition?.node);
    for (const e of s.expeditions || []) add(e.node);
    for (const e of s.scoutQueue || []) add(e.node);
    if (s.battle && !s.battle.finished) add(s.battle.node);
  }
  return held;
}
function clearIntel(state, held, released = null) {
  const shouldClear = id => validId(id) && !held.has(id) && (!released || released.has(id));
  for (const s of scopes(state)) {
    for (const id of Object.keys(s.scoutIntel || {})) if (shouldClear(id)) delete s.scoutIntel[id];
  }
  for (const id of Object.keys(state.scouted || {})) if (shouldClear(id)) delete state.scouted[id];
}

/** Freeze active targets before changing epoch; canonical claims keep their daily decay. */
function syncWildFields(game, now) {
  const s = game.state; if (!s || s.onlineRealm || game.authorityActive() || (typeof GAME_SERVER_RUNTIME!=='undefined' && GAME_SERVER_RUNTIME && !s.wildRefresh)) return;
  const held = heldTargets(s), first = !s.wildRefresh;
  if (!validWildFields(s)) throw new Error('Invalid wild-refresh state');
  if (first) s.wildRefresh = {version: 1, seed: Math.floor(Math.random()*0x100000000),
    generation: Math.floor(now / WILD_INTERVAL_MS), at: Math.floor(now / WILD_INTERVAL_MS) * WILD_INTERVAL_MS, pins: {}};
  const m = s.wildRefresh;
  for (const id of held) if (!m.pins[id]) {
    const [, xs, ys] = wildId.exec(id), x = Number(xs), y = Number(ys);
    if (first) {
      const n = game.legacyWildTile(x, y);
      m.pins[id] = {type: n.type, level: n.level, seed: 0, legacy: true};
    } else m.pins[id] = resolveWild(s, x, y, now);
  }
  const released = new Set();
  for (const id of Object.keys(m.pins)) if (!held.has(id)) {
    const old = m.pins[id], [, xs, ys] = wildId.exec(id);
    delete m.pins[id];
    const fresh = resolveWild(s, Number(xs), Number(ys), now);
    if (['type', 'level', 'seed', 'legacy'].some(key => old[key] !== fresh[key])) released.add(id);
  }
  const next = Math.max(m.generation, Math.floor(now / WILD_INTERVAL_MS));
  if (first || next !== m.generation) clearIntel(s, held);
  else if (released.size) clearIntel(s, held, released);
  m.generation = next;
  m.at = next * WILD_INTERVAL_MS;
  if (!validWildFields(s)) throw new Error('Invalid wild-refresh result');
}

function wildRefreshView(state) {
  const m = state.wildRefresh;
  return m ? {enabled: true, generation: m.generation, intervalSeconds: WILD_INTERVAL_MS / 1000,
    refreshedAt: m.at, nextAt: m.at + WILD_INTERVAL_MS, protected: Object.keys(m.pins).length,
    description: '每30分钟随机刷新空闲野地的类型、等级和守军；每个8×8区域均衡分布。城池、已占领、采集及行军目标保留。'} : {enabled: false};
}

return {resolve:resolveWild,weight:wildWeight,key:wildKey,sync:syncWildFields,valid:validWildFields,view:wildRefreshView};
})();
