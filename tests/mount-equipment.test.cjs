const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadGame}=require('./helpers/game.cjs');
const plain=v=>JSON.parse(JSON.stringify(v));
test('mount speed is separate from hero attributes and bounded for enhanced mounts',()=>{
 const e=loadGame(),G=e.Game,H=e.evaluate('HeroSystem'),s=G.state,id=s.generals[0];
 assert.equal(typeof H.mountProfile,'function');
 assert.deepEqual(plain(H.mountProfile(s,id)),{version:1,speed:0,march:1,initiative:1,cavalry:1});
 const base=plain(H.bonus(s,id));s.generalLevels[id]=20;const horse=H.addEquipment(s,'mount',1);assert.equal(H.equip(horse.id,id),null);
 assert.equal(H.mountSpeed(horse),6);assert.deepEqual(plain(H.bonus(s,id)),base);
 horse.enhance=10;assert.equal(H.mountSpeed(horse),9);horse.tier=4;assert.equal(H.mountSpeed(horse),27);
 assert.deepEqual(plain(H.mountProfile(s,id)),{version:1,speed:27,march:1.25,initiative:1.135,cavalry:1.25});
 const before=JSON.stringify(s);H.mountProfile(s,id);H.mountQuote();assert.equal(JSON.stringify(s),before);
 G.save();G.init();assert.equal(H.mountProfile(G.state,id).speed,27);
});
test('mount purchase consumes exactly 5000 gold and refuses insufficient funds or space',()=>{
 const e=loadGame(),G=e.Game,H=e.evaluate('HeroSystem'),s=G.state;
 assert.equal(typeof H.buyMount,'function');s.res.gold=4999;const before=s.equipment.length;assert.match(H.buyMount(),/黄金/);assert.equal(s.res.gold,4999);assert.equal(s.equipment.length,before);
 s.res.gold=5000;assert.equal(H.buyMount(),null);assert.equal(s.res.gold,0);assert.equal(s.equipment.length,before+1);assert.equal(s.equipment.at(-1).slot,'mount');assert.equal(s.equipment.at(-1).tier,1);
 s.res.gold=10000;while(s.equipment.length<s.equipmentCapacity)H.addEquipment(s,'weapon',1);assert.match(H.buyMount(),/满/);assert.equal(s.res.gold,10000);
});
test('frozen mount profiles reject extra fields and malformed or inconsistent multipliers',()=>{
 const e=loadGame(),H=e.evaluate('HeroSystem'),p={version:1,speed:6,march:1.06,initiative:1.03,cavalry:1.06};
 assert.equal(typeof H.validMountProfile,'function');assert.equal(H.validMountProfile(p),true);
 for(const bad of [null,[],{...p,speed:-1},{...p,speed:NaN},{...p,speed:Infinity},{...p,march:2},{...p,cavalry:0},{...p,version:2},{...p,extra:1},{...p,initiative:undefined}])assert.equal(H.validMountProfile(bad),false);
});
test('busy or read-only mount actions cannot change equipment or money',()=>{
 const e=loadGame(),G=e.Game,H=e.evaluate('HeroSystem'),s=G.state,id=s.generals[0];const horse=H.addEquipment(s,'mount',1);H.equip(horse.id,id);
 G.setExternalGeneralBusy([id]);assert.match(H.unequip(horse.id),/返城/);assert.equal(horse.hero,id);
 G.setExternalGeneralBusy([]);G.releaseSaveSession();const before=JSON.stringify(G.state);assert.ok(H.buyMount());assert.equal(JSON.stringify(G.state),before);
});
test('direct read-only mount equip and unequip reject before changing the saved equipment',()=>{
 const e=loadGame(),G=e.Game,H=e.evaluate('HeroSystem'),horse=H.addEquipment(G.state,'mount',1);G.releaseSaveSession();const before=JSON.stringify(G.state);
 assert.ok(H.equip(horse.id,'lin'));assert.equal(JSON.stringify(G.state),before);
 horse.hero='lin';const worn=JSON.stringify(G.state);assert.ok(H.unequip(horse.id));assert.equal(JSON.stringify(G.state),worn);
});
