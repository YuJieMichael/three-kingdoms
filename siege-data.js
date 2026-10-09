'use strict';
// Original siege rules; combat state contains only the mutable gate HP.
const SiegeSystem={
  gate(node,mode){const f=node.fortification;return f&&mode==='occupy'?{hp:f.hp,maxHp:f.hp}:null;},
  valid(gate,node,mode){const f=node?.fortification;if(gate===undefined||gate===null)return !f||mode!=='occupy';return !!f&&mode==='occupy'&&Number.isInteger(gate.hp)&&gate.hp>=0&&gate.hp<=f.hp&&gate.maxHp===f.hp;},
  // Walls marked engineWall (famous-general cities) take only 2% of the damage from soldiers; rams and catapults are needed.
  damage(row,node){const count=Math.ceil(row.hp/row.stats.hp),machine=['ram','catapult','ballista'].includes(row.id);return Math.max(1,Math.round(count*(row.id==='ram'?800:row.id==='catapult'?1200:row.id==='ballista'?80:['archer','cavalry','heavy'].includes(row.id)?2:8)*(node?.fortification?.engineWall&&!machine?.02:1)));},
  canHit(row,b){return b.gate?.hp>0&&b.length-row.pos<=row.stats.range;},
  protection(b,node){return b.gate?.hp>0?node.fortification.protection:b.siege&&!node.fortification?1.25:1;},
  commander(node){return node.commander||{attack:1,defense:1,order:null};}
};
