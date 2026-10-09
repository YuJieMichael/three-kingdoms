'use strict';
// 铸神兵: a one-time quest line (about an hour) that unlocks legendary forging. Owner decision 2026-10-09:
// ① seek the smith's clue at the inn → in parallel ② gather 1 h on an owned level-5+ wild tile,
// ③ win 3 raids on level-5+ wild tiles, ④ win a battle at a county city → ⑤ 30-minute quench at a level-10 smithy
// with one rare piece and 1 jade, which yields the first legendary piece and unlocks direct quenching.
const LegendQuest=(()=>{
  const C=Object.freeze({clueGold:20000,raids:3,wildLevel:5,forgeMs:30*60000,smith:10,jade:1});
  const STAGES=['none','clues','forging','done'];
  const object=v=>!!v&&typeof v==='object'&&!Array.isArray(v),int=n=>Number.isSafeInteger(n)&&n>=0;
  const fresh=()=>({stage:'none',startAt:0,gathered:false,raids:0,county:false,forgeEnd:0,forgeSlot:''});
  const get=s=>s.legendQuest||fresh();
  function valid(s){const q=s.legendQuest;if(q===undefined)return true;return object(q)&&Object.keys(q).length===7&&STAGES.includes(q.stage)&&int(q.startAt)&&typeof q.gathered==='boolean'&&int(q.raids)&&q.raids<=C.raids&&typeof q.county==='boolean'&&int(q.forgeEnd)&&(q.forgeSlot===''||['weapon','armor','helmet','accessory'].includes(q.forgeSlot));}
  const unlocked=s=>get(s).stage==='done';
  const cluesDone=q=>q.gathered&&q.raids>=C.raids&&q.county;
  function status(s,now){const q=get(s);return {...q,unlocked:q.stage==='done',cluesDone:cluesDone(q),forgeReady:q.stage==='forging'&&q.forgeEnd<=now,C};}
  function seek(s){const q=get(s);if(q.stage!=='none')return '已经得到铸匠线索';if((s.buildings.inn||0)<1)return '需要 1 级客栈';if(s.res.gold<C.clueGold)return '黄金不足';s.res.gold-=C.clueGold;s.legendQuest={...fresh(),stage:'clues',startAt:Date.now()};return null;}
  // Progress hooks (no effect outside the clue stage).
  function onGather(s,level){const q=s.legendQuest;if(q?.stage==='clues'&&level>=C.wildLevel)q.gathered=true;}
  function onBattle(s,n,o){const q=s.legendQuest;if(q?.stage!=='clues'||!o.won)return;if(n.wild&&o.mode==='raid'&&n.level>=C.wildLevel)q.raids=Math.min(C.raids,q.raids+1);if(n.terrain==='fort'&&typeof NamedCityData!=='undefined'&&NamedCityData.definition(n.id)?.tier==='county')q.county=true;}
  function forgeQuote(s,slot){const q=get(s),piece=(s.equipment||[]).filter(e=>e.slot===slot&&e.tier===3&&!e.hero).sort((a,b)=>a.enhance-b.enhance||a.id-b.id)[0];
    const reason=!['weapon','armor','helmet','accessory'].includes(slot)?'请选择部位':q.stage==='forging'?'正在淬火':q.stage!=='done'&&!cluesDone(q)?'先完成铸神兵的线索':(s.buildings.smith||0)<C.smith?'需要 10 级铁匠铺':!piece?'需要 1 件闲置的同部位珍稀装备':(s.jewels?.jade||0)<C.jade?'需要玉石 ×1':(s.equipment||[]).length>s.equipmentCapacity?'装备库已满':'';
    return {slot,piece:piece?.id||0,reason,timed:q.stage!=='done'};}
  // First time: a 30-minute quench ends the quest. Afterwards quenching is immediate.
  function startForge(s,slot,now,addEquipment){const f=forgeQuote(s,slot);if(f.reason)return f.reason;s.equipment=s.equipment.filter(e=>e.id!==f.piece);s.jewels.jade-=C.jade;
    if(!f.timed){addEquipment(s,slot,4);return null;}s.legendQuest={...get(s),stage:'forging',forgeEnd:now+C.forgeMs,forgeSlot:slot};return null;}
  function claim(s,now,addEquipment){const q=get(s);if(q.stage!=='forging')return '没有正在淬火的神兵';if(q.forgeEnd>now)return '神兵还在淬火';if(s.equipment.length>=s.equipmentCapacity)return '装备库已满';addEquipment(s,q.forgeSlot,4);s.legendQuest={...q,stage:'done',forgeSlot:''};return null;}
  return {C,valid,unlocked,status,seek,onGather,onBattle,forgeQuote,startForge,claim};
})();
