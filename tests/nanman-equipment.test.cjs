const {test}=require('node:test'),assert=require('node:assert/strict');const {nanReady,plain,cloneActiveSave}=require('./helpers/nanman.cjs');
test('barbarian seven parts form a stronger exclusive set while the mount has only speed',()=>{
 const e=nanReady(),G=e.Game,H=e.evaluate('HeroSystem');G.state.inventory.barbarianEquipmentBox=7;let i=0;
 for(const slot of ['weapon','helmet','armor','cloak','bracer','boots','mount']){assert.equal(G.openBattlefieldBox(slot,'nanman'),null);const item=G.state.equipment.at(-1);assert.equal(item.tier,3);assert.equal(item.setId,'nanman');assert.equal(H.equip(item.id,'lin'),null);i++;if([2,4,7].includes(i)){const b=H.battlefieldSetBonus(G.state,'lin');assert.deepEqual([b.atk,b.def,b.lead],i===2?[4,0,0]:i===4?[4,6,0]:[10,12,5]);}}
 const horse=G.state.equipment.find(x=>x.slot==='mount');assert.deepEqual(plain(H.stats(horse)),{});assert.equal(H.mountSpeed(horse),14);assert.equal(H.setTier(G.state,'lin'),0);assert.equal(G.validSave(G.state),true);
 const forged=cloneActiveSave(G.state);forged.equipment.find(x=>x.setId==='nanman').tier=2;assert.equal(G.validSave(forged),false);
});
test('barbarian boxes reject unknown campaigns and keep stock when capacity is full',()=>{
 const e=nanReady(),G=e.Game,H=e.evaluate('HeroSystem');G.state.inventory.barbarianEquipmentBox=1;const before=JSON.stringify(G.state);assert.ok(G.openBattlefieldBox('weapon','fake'));assert.equal(JSON.stringify(G.state),before);assert.ok(G.openBattlefieldBox('accessory','nanman'));
 while(G.state.equipment.length<G.state.equipmentCapacity)H.addEquipment(G.state,'weapon',1);assert.ok(G.openBattlefieldBox('weapon','nanman'));assert.equal(G.state.inventory.barbarianEquipmentBox,1);G.releaseSaveSession();const saved=JSON.stringify(G.state);assert.ok(G.openBattlefieldBox('weapon','nanman'));assert.equal(JSON.stringify(G.state),saved);
});
