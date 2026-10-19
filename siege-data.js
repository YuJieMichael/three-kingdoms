'use strict';
// Original siege rules; combat state contains only the mutable gate HP.
const SiegeSystem={
  gate(node,mode,hp){const f=node.fortification;return f&&mode==='occupy'?{hp:Number.isInteger(hp)?Math.max(0,Math.min(f.hp,hp)):f.hp,maxHp:f.hp}:null;},
  valid(gate,node,mode){const f=node?.fortification;if(gate===undefined||gate===null)return !f||mode!=='occupy';return !!f&&mode==='occupy'&&Number.isInteger(gate.hp)&&gate.hp>=0&&gate.hp<=f.hp&&gate.maxHp===f.hp;},
  // Walls marked engineWall (famous-general cities) take only 2% of the damage from soldiers; rams and catapults are needed.
  damage(row,node){const count=Math.ceil(row.hp/row.stats.hp),machine=['ram','catapult','ballista'].includes(row.id);return Math.max(1,Math.round(count*(row.id==='ram'?800:row.id==='catapult'?1200:row.id==='ballista'?80:['archer','cavalry','heavy'].includes(row.id)?2:8)*(node?.fortification?.engineWall&&!machine?.02:1)));},
  canHit(row,b){return b.gate?.hp>0&&b.length-row.pos<=row.stats.range;},
  protection(b,node){return b.gate?.hp>0?node.fortification.protection:b.siege&&!node.fortification?1.25:1;},
  commander(node){return node.commander||{attack:1,defense:1,order:null};},
  // v0.36.0: ordinary cities, counties and named counties get walls and defences by level
  // (design/quick-specs/progression-rework-2026-10-18.md §5). Trial values; a tower shoots like a 300-attack archer.
  cityWalls:[
    {min:2,gate:3000,trap:20,abatis:0,tower:0,logs:0,rocks:0},
    {min:4,gate:8000,trap:40,abatis:10,tower:2,logs:0,rocks:0},
    {min:6,gate:15000,trap:60,abatis:20,tower:4,logs:10,rocks:0},
    {min:8,gate:25000,trap:80,abatis:30,tower:6,logs:20,rocks:10}
  ],
  wallRules:{trapDamage:300,trapRange:2000,abatisHp:950,logsDamage:500,logsRange:500,rocksDamage:800,rocksRange:250,towerAttack:300,towerRange:1250,protection:1.25,recoverPerHour:.1},
  cityWall(level){const row=[...this.cityWalls].reverse().find(r=>level>=r.min)||this.cityWalls[0],w=this.wallRules;return {name:'城门',hp:row.gate,protection:w.protection,tower:row.tower*w.towerAttack,range:w.towerRange,defenses:{trap:row.trap,abatis:row.abatis,logs:row.logs,rocks:row.rocks},cityWall:true};},
  // Walls and one-use defences left after earlier sieges, recovering 10% of the full amount per hour.
  wallState(node,saved,now){
    const f=node?.fortification;if(!f?.cityWall)return null;const full={gate:f.hp,...f.defenses,abatis:f.defenses.abatis*this.wallRules.abatisHp};
    if(!saved)return full;const share=Math.max(0,now-saved.at)/3600000*this.wallRules.recoverPerHour;
    return Object.fromEntries(Object.entries(full).map(([k,max])=>[k,Math.min(max,Math.floor((saved[k]??max)+share*max))]));
  }
};
