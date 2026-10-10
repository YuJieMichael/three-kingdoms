const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadGame}=require('./helpers/game.cjs');
const plain=v=>JSON.parse(JSON.stringify(v));
test('new wearable slots keep the old four-piece bonus when extra pieces are worn',()=>{
 const e=loadGame(),G=e.Game,H=e.evaluate('HeroSystem'),s=G.state,id=s.generals[0];s.generalLevels[id]=20;
 const legacy=['weapon','armor','helmet','accessory'];
 for(const slot of legacy)H.addEquipment(s,slot,3).hero=id;
 assert.equal(H.setTier(s,id),3);assert.deepEqual(plain(H.bonus(s,id)),{atk:42,def:54,pol:24,wis:36,lead:16});
 for(const slot of ['cloak','bracer','boots','mount']){const piece=H.addEquipment(s,slot,1);assert.equal(H.equip(piece.id,id),null);}
 assert.equal(H.setTier(s,id),3);assert.equal(G.validSave(s),true);
 assert.deepEqual(Object.keys(H.slots).sort(),['accessory','armor','boots','bracer','cloak','helmet','mount','weapon']);
 assert.deepEqual(plain(H.stats(s.equipment.find(x=>x.slot==='mount'))),{});
 H.unequip(s.equipment.find(x=>x.slot==='accessory').id);assert.equal(H.setTier(s,id),0);
});
test('extra slot replacement is exclusive and malformed mounts cannot enter a save',()=>{
 const e=loadGame(),G=e.Game,H=e.evaluate('HeroSystem'),s=G.state,id=s.generals[0];s.generalLevels[id]=20;
 const a=H.addEquipment(s,'cloak',1),b=H.addEquipment(s,'cloak',1);assert.equal(H.equip(a.id,id),null);assert.equal(H.equip(b.id,id),null);assert.equal(a.hero,'');assert.equal(b.hero,id);
 a.hero=id;assert.equal(H.valid(s),false);a.hero='';
 const horse=H.addEquipment(s,'mount',1);assert.equal(H.validEquipment(horse,s),true);
 for(const bad of [{tier:5,named:'qinglong'},{refine:{stat:'lead',value:3}},{named:'qinglong'},{slot:'other'}])assert.equal(H.validEquipment({...horse,...bad},s),false);
});
test('expanding wearables does not expand the starter gift or legendary forging',()=>{
 const e=loadGame(),G=e.Game,H=e.evaluate('HeroSystem'),s=G.state;
 assert.equal(H.gift(),null);assert.equal(s.equipment.length,8);assert.equal(s.equipment.filter(x=>x.slot==='mount').length,0);
 assert.equal(H.forgeQuote('mount',1),null);assert.ok(H.forgeQuote('cloak',1));
 for(const slot of ['cloak','bracer','boots','mount'])assert.ok(H.legendQuote(slot).reason);
 s.heroGiftClaimed=false;s.equipmentCapacity=50;while(s.equipment.length<43)H.addEquipment(s,'weapon',1);
 const before=JSON.stringify(s.equipment);assert.match(H.gift(),/8/);assert.equal(JSON.stringify(s.equipment),before);
});
