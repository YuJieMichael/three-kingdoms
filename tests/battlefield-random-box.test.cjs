const {test}=require('node:test'),assert=require('node:assert/strict');
const {ready}=require('./helpers/battlefield.cjs');
const slots=['weapon','helmet','armor','cloak','bracer','boots','mount'];
test('each campaign box randomly draws every regular slot and can repeat a slot',()=>{
 for(const [campaign,key,tier] of [['yellow_turban','yellowEquipmentBox',2],['nanman','barbarianEquipmentBox',3]]){
  const e=ready(),G=e.Game;G.state.inventory[key]=9;
  for(const [i,slot] of slots.entries()){e.evaluate(`Math.random=()=>${(i+.5)/7}`);assert.equal(G.openBattlefieldBox(campaign),null);const item=G.state.equipment.at(-1);assert.equal(item.slot,slot);assert.equal(item.tier,tier);assert.equal(item.setId,campaign);}
  e.evaluate('Math.random=()=>0');for(let i=0;i<2;i++){assert.equal(G.openBattlefieldBox(campaign),null);assert.equal(G.state.equipment.at(-1).slot,'weapon');}
  assert.equal(G.state.inventory[key],0);assert.ok(G.openBattlefieldBox(campaign));assert.equal(G.validSave(G.state),true);
 }
});
test('failed random openings retain stock and do not draw a result',()=>{
 const e=ready(),G=e.Game,H=e.evaluate('HeroSystem');G.state.inventory.yellowEquipmentBox=1;
 e.evaluate('globalThis.draws=0;Math.random=()=>{draws++;return 0;}');
 assert.ok(G.openBattlefieldBox('weapon'));assert.equal(e.evaluate('draws'),0);
 while(G.state.equipment.length<G.state.equipmentCapacity)H.addEquipment(G.state,'weapon',1);
 assert.ok(G.openBattlefieldBox());assert.equal(G.state.inventory.yellowEquipmentBox,1);assert.equal(e.evaluate('draws'),0);
 H.salvage(G.state.equipment[0].id);G.releaseSaveSession();const before=JSON.stringify(G.state);assert.ok(G.openBattlefieldBox());assert.equal(JSON.stringify(G.state),before);assert.equal(e.evaluate('draws'),0);
});
